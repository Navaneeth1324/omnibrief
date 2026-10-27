import pytest
import io
from omnibrief.tools.document import parse_pdf_bytes
from omnibrief.agent.researcher import ResearchAgent

def test_document_parser_empty():
    res = parse_pdf_bytes(b"invalid pdf content")
    assert res["success"] is False

@pytest.mark.asyncio
async def test_agent_fallback_report():
    agent = ResearchAgent(api_key=None)
    events = []
    async for event in agent.execute_research(topic="Quantum Computing in Cybersecurity"):
        events.append(event)
    
    # Must have emitted init, planning, search, and finished
    steps = [e.get("step") for e in events]
    assert "INIT" in steps
    assert "PLANNING" in steps
    assert "SEARCHING" in steps
    assert "FINISHED" in steps

    last_event = events[-1]
    assert "Executive Intelligence Briefing" in last_event.get("report_markdown", "")
