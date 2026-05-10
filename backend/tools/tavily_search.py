from tavily import AsyncTavilyClient
from config import get_settings


async def search_entertainment(query: str, max_results: int = 5) -> list[dict]:
    settings = get_settings()
    client = AsyncTavilyClient(api_key=settings.tavily_api_key)
    response = await client.search(
        query=query,
        max_results=max_results,
        search_depth="basic",
        include_answer=False,
    )
    results = []
    for r in response.get("results", []):
        results.append({
            "title": r.get("title", ""),
            "url": r.get("url", ""),
            "content": r.get("content", ""),
            "score": r.get("score", 0.0),
        })
    return results
