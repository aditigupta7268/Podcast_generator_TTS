from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.services.llm_service import generate_script
from app.services.tts_service import generate_tts
import os

router = APIRouter()

@router.post("/generate-podcast")
def generate_podcast(topic: str):

    # 1️⃣ Generate structured script
    script = generate_script(topic)

    # 2️⃣ Convert to TTS
    file_path, source, time_taken = generate_tts(script)

    # 3️⃣ Rename file to meaningful podcast name
    safe_topic = topic.replace(" ", "_").lower()
    output_path = f"storage/audio/{safe_topic}_podcast.mp3"

    os.replace(file_path, output_path)

    # 4️⃣ Return MP3 file directly
    return FileResponse(
        path=output_path,
        media_type="audio/mpeg",
        filename=f"{safe_topic}_podcast.mp3"
    )
