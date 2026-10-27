import io
import logging
from typing import Dict, Any
from pypdf import PdfReader

logger = logging.getLogger(__name__)

def parse_pdf_bytes(pdf_bytes: bytes, max_pages: int = 15) -> Dict[str, Any]:
    """Extracts text content and metadata from PDF bytes."""
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        num_pages = len(reader.pages)
        pages_to_read = min(num_pages, max_pages)
        extracted_text = []

        for idx in range(pages_to_read):
            page = reader.pages[idx]
            text = page.extract_text() or ""
            extracted_text.append(f"--- Page {idx + 1} ---\n{text.strip()}")

        combined_text = "\n\n".join(extracted_text)
        return {
            "success": True,
            "total_pages": num_pages,
            "parsed_pages": pages_to_read,
            "content": combined_text
        }
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        return {
            "success": False,
            "error": str(e),
            "content": ""
        }
