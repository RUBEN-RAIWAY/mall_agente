from langchain_core.tools import tool
from tools.tavily_search import search_entertainment


@tool
async def search_new_releases(query: str) -> str:
    """Search for new releases, trending shows, movies, and entertainment news.
    Use this tool whenever the user asks about new content, premieres, trending titles,
    cinema listings, movies in theaters, or anything that requires up-to-date information
    about streaming platforms or entertainment in general."""
    results = await search_entertainment(query, max_results=5)
    if not results:
        return "No se encontraron resultados para esa búsqueda."

    formatted = []
    for r in results:
        formatted.append(f"**{r['title']}**\n{r['content']}\nFuente: {r['url']}")
    return "\n\n---\n\n".join(formatted)
