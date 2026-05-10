from fastapi import APIRouter, HTTPException
from firebase.clients import get_all_clients, get_client
from firebase.chat_history import get_conversations_for_client, get_conversation, delete_conversation
from schemas import ClientSummary, ConversationPreview

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("", response_model=list[ClientSummary])
async def list_clients():
    clients = await get_all_clients()
    summaries = []
    for c in clients:
        prefs = c.get("preferencias", {})
        summaries.append(ClientSummary(
            client_id=c["client_id"],
            nombres=c["nombres"],
            genero=c.get("genero", ""),
            categorias=prefs.get("categorias", []),
        ))
    return summaries


@router.get("/{client_id}")
async def get_client_profile(client_id: str):
    client = await get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.get("/{client_id}/conversations", response_model=list[ConversationPreview])
async def list_conversations(client_id: str):
    client = await get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    convos = await get_conversations_for_client(client_id)
    return [ConversationPreview(**c) for c in convos]


@router.get("/{client_id}/conversations/{conversation_id}")
async def get_conversation_detail(client_id: str, conversation_id: str):
    convo = await get_conversation(conversation_id)
    if not convo or convo.get("client_id") != client_id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return convo


@router.delete("/{client_id}/conversations/{conversation_id}")
async def remove_conversation(client_id: str, conversation_id: str):
    deleted = await delete_conversation(conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "deleted", "conversation_id": conversation_id}
