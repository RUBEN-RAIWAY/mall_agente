from pydantic import BaseModel
from typing import Optional


class SearchRequest(BaseModel):
    query: str
    max_results: int = 5


class SearchResult(BaseModel):
    title: str
    url: str
    content: str
    score: float


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]


class ChatRequest(BaseModel):
    client_id: str
    conversation_id: Optional[str] = None
    message: str


class MessageMetadata(BaseModel):
    tool_used: bool = False
    sources: list[str] = []


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None
    metadata: Optional[MessageMetadata] = None


class ChatResponse(BaseModel):
    conversation_id: str
    message: ChatMessage
    client_name: str


class ClientSummary(BaseModel):
    client_id: str
    nombres: str
    genero: str
    categorias: list[str]


class ConversationPreview(BaseModel):
    conversation_id: str
    started_at: str
    updated_at: str
    message_count: int
    last_message: Optional[str] = None
