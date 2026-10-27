import json
import logging
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from omnibrief.config import settings
from omnibrief.agent.researcher import ResearchAgent

logger = logging.getLogger(__name__)

app = FastAPI(
    title="OmniBrief - Autonomous Multimodal Research Agent",
    description="Live web and document intelligence synthesizer with streaming thoughts.",
    version="1.0.0"
)

templates = Jinja2Templates(directory="omnibrief/templates")
app.mount("/static", StaticFiles(directory="omnibrief/static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def index_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "model": settings.DEFAULT_MODEL})

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "omnibrief",
        "gemini_api_key_configured": bool(settings.GEMINI_API_KEY)
    }

@app.post("/api/research/stream")
async def stream_research(
    topic: str = Form(...),
    notes: Optional[str] = Form(""),
    api_key: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """Streams research execution steps and the final report over Server-Sent Events (SSE)."""
    pdf_bytes = None
    pdf_filename = None

    if file and file.filename:
        pdf_bytes = await file.read()
        pdf_filename = file.filename

    agent = ResearchAgent(api_key=api_key or settings.GEMINI_API_KEY)

    async def event_generator():
        try:
            async for event in agent.execute_research(
                topic=topic,
                user_notes=notes or "",
                pdf_bytes=pdf_bytes,
                pdf_filename=pdf_filename
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            logger.exception("Error in research execution")
            yield f"data: {json.dumps({'step': 'ERROR', 'status': 'failed', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
