import uuid
from datetime import datetime, timezone
from firebase.client import get_async_db
from google.cloud.firestore import FieldFilter


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def create_conversation(client_id: str) -> str:
    db = get_async_db()
    conversation_id = f"conv_{uuid.uuid4().hex[:12]}"
    await db.collection("conversations").document(conversation_id).set({
        "conversation_id": conversation_id,
        "client_id": client_id,
        "started_at": _now_iso(),
        "updated_at": _now_iso(),
        "messages": [],
    })
    return conversation_id


async def get_conversation(conversation_id: str) -> dict | None:
    db = get_async_db()
    doc = await db.collection("conversations").document(conversation_id).get()
    if doc.exists:
        return doc.to_dict()
    return None


async def add_message(conversation_id: str, role: str, content: str, metadata: dict | None = None):
    db = get_async_db()
    doc_ref = db.collection("conversations").document(conversation_id)
    doc = await doc_ref.get()
    if not doc.exists:
        return

    data = doc.to_dict()
    message = {
        "role": role,
        "content": content,
        "timestamp": _now_iso(),
    }
    if metadata:
        message["metadata"] = metadata

    data["messages"].append(message)
    data["updated_at"] = _now_iso()
    await doc_ref.set(data)


async def get_conversations_for_client(client_id: str) -> list[dict]:
    db = get_async_db()
    query = db.collection("conversations").where(
        filter=FieldFilter("client_id", "==", client_id)
    ).order_by("updated_at", direction="DESCENDING")

    docs = query.stream()
    conversations = []
    async for doc in docs:
        data = doc.to_dict()
        messages = data.get("messages", [])
        last_msg = messages[-1]["content"][:100] if messages else None
        conversations.append({
            "conversation_id": data["conversation_id"],
            "started_at": data.get("started_at", ""),
            "updated_at": data.get("updated_at", ""),
            "message_count": len(messages),
            "last_message": last_msg,
        })
    return conversations


async def delete_conversation(conversation_id: str) -> bool:
    db = get_async_db()
    doc_ref = db.collection("conversations").document(conversation_id)
    doc = await doc_ref.get()
    if not doc.exists:
        return False
    await doc_ref.delete()
    return True
