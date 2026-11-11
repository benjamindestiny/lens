import io
from pptx import Presentation
from pypdf import PdfReader


def extract_text_from_file(data: bytes, filename: str) -> str:
    lower = filename.lower()
    if lower.endswith(".pptx"):
        prs = Presentation(io.BytesIO(data))
        parts = []
        for slide in prs.slides:
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for para in shape.text_frame.paragraphs:
                        if para.text.strip():
                            parts.append(para.text.strip())
        return "\n".join(parts)
    if lower.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(data))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    raise ValueError(f"Unsupported file type: {filename}")
