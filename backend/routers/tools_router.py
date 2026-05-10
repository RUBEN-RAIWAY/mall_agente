from fastapi import APIRouter
from schemas import SearchRequest, SearchResponse, SearchResult
from tools.tavily_search import search_entertainment

router = APIRouter(prefix="/tools", tags=["tools"])


@router.post("/search", response_model=SearchResponse)
async def search(req: SearchRequest):
    raw_results = await search_entertainment(req.query, req.max_results)
    results = [SearchResult(**r) for r in raw_results]
    return SearchResponse(query=req.query, results=results)
