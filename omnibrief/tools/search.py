import asyncio
import logging
from typing import List, Dict, Any
from duckduckgo_search import DDGS
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

async def search_duckduckgo(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """Performs web search using DuckDuckGo asynchronously."""
    def _sync_search():
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
            return [
                {
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "snippet": r.get("body", "")
                }
                for r in results
            ]
    try:
        return await asyncio.to_thread(_sync_search)
    except Exception as e:
        logger.error(f"Error in web search for '{query}': {e}")
        return []

async def fetch_webpage_content(url: str, max_chars: int = 4000) -> str:
    """Fetches and cleans main text content from a web page."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                # Remove scripts, styles, navigations
                for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
                    tag.decompose()
                text = " ".join(soup.stripped_strings)
                return text[:max_chars]
    except Exception as e:
        logger.warning(f"Could not fetch URL {url}: {e}")
    return ""
