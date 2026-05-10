import json
import asyncio
from fastapi import APIRouter, HTTPException, Query
from sse_starlette.sse import EventSourceResponse
from schemas import ChatRequest, ChatResponse, ChatMessage, MessageMetadata
from firebase.clients import get_client
from firebase.chat_history import (
    create_conversation,
    get_conversation,
    add_message,
)
from agent.agent import create_agent, build_chat_history

router = APIRouter(prefix="/agent", tags=["agent"])


async def _run_agent(client: dict, messages_history: list[dict], user_message: str):
    executor = create_agent(client)
    chat_history = build_chat_history(messages_history)
    result = await executor.ainvoke({
        "input": user_message,
        "chat_history": chat_history,
    })
    output = result.get("output", "")
    tool_used = bool(result.get("intermediate_steps"))
    sources = []
    if tool_used:
        for step in result.get("intermediate_steps", []):
            if hasattr(step[0], "tool_input"):
                sources.append(step[0].tool)
    return output, tool_used, sources


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    client = await get_client(req.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    conversation_id = req.conversation_id
    messages_history = []

    if conversation_id:
        convo = await get_conversation(conversation_id)
        if not convo:
            raise HTTPException(status_code=404, detail="Conversation not found")
        messages_history = convo.get("messages", [])
    else:
        conversation_id = await create_conversation(req.client_id)

    await add_message(conversation_id, "human", req.message)

    output, tool_used, sources = await _run_agent(client, messages_history, req.message)

    metadata = {"tool_used": tool_used, "sources": sources}
    await add_message(conversation_id, "ai", output, metadata)

    return ChatResponse(
        conversation_id=conversation_id,
        message=ChatMessage(
            role="ai",
            content=output,
            metadata=MessageMetadata(tool_used=tool_used, sources=sources),
        ),
        client_name=client["nombres"],
    )


@router.get("/stream")
async def stream(
    client_id: str = Query(...),
    message: str = Query(...),
    conversation_id: str = Query(None),
):
    client = await get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    if conversation_id:
        convo = await get_conversation(conversation_id)
        if not convo:
            raise HTTPException(status_code=404, detail="Conversation not found")
        messages_history = convo.get("messages", [])
    else:
        conversation_id = await create_conversation(client_id)
        messages_history = []

    await add_message(conversation_id, "human", message)

    async def event_generator():
        try:
            executor = create_agent(client)
            chat_history = build_chat_history(messages_history)

            full_response = ""
            tool_used = False
            sources = []

            async for event in executor.astream_events(
                {"input": message, "chat_history": chat_history},
                version="v2",
            ):
                kind = event.get("event", "")

                if kind == "on_chat_model_stream":
                    chunk = event.get("data", {}).get("chunk")
                    if chunk and hasattr(chunk, "content") and chunk.content:
                        # Only stream tokens from the final answer, not from tool calls
                        if not event.get("tags") or "agent" not in str(event.get("parent_ids", [])):
                            pass
                        full_response += chunk.content
                        yield {"event": "token", "data": json.dumps({"content": chunk.content})}

                elif kind == "on_tool_start":
                    tool_name = event.get("name", "")
                    tool_input = event.get("data", {}).get("input", {})
                    tool_used = True
                    yield {
                        "event": "tool_call",
                        "data": json.dumps({"tool": tool_name, "input": tool_input}),
                    }

                elif kind == "on_tool_end":
                    tool_output = str(event.get("data", {}).get("output", ""))[:500]
                    sources.append(event.get("name", "search"))
                    yield {
                        "event": "tool_result",
                        "data": json.dumps({"result": tool_output}),
                    }

            metadata = {"tool_used": tool_used, "sources": sources}
            await add_message(conversation_id, "ai", full_response, metadata)

            yield {
                "event": "done",
                "data": json.dumps({
                    "conversation_id": conversation_id,
                    "tool_used": tool_used,
                    "sources": sources,
                }),
            }

        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())
