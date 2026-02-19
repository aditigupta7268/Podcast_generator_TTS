from fastapi import APIRouter, Form
from fastapi.responses import StreamingResponse
from app.services.chunker import paragraph_chunk
from app.services.tts_service import generate_tts
from fastapi.logger import logger

router = APIRouter()

@router.post("/stream-tts")
def stream_tts(text: str = Form(...)):
    logger.info(f"Received text: {text}")

    def audio_stream():
        chunks = paragraph_chunk(text)
        for chunk in chunks:
            file_path, _, _ = generate_tts(chunk)
            with open(file_path, "rb") as f:
                yield f.read()

    return StreamingResponse(audio_stream(), media_type="audio/mpeg")
