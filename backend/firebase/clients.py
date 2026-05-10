from firebase.client import get_async_db


async def get_all_clients() -> list[dict]:
    db = get_async_db()
    docs = db.collection("clients").stream()
    clients = []
    async for doc in docs:
        clients.append(doc.to_dict())
    return clients


async def get_client(client_id: str) -> dict | None:
    db = get_async_db()
    doc = await db.collection("clients").document(client_id).get()
    if doc.exists:
        return doc.to_dict()
    return None
