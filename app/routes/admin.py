from fastapi import APIRouter
from app.services.llm_service import generate_script
from app.services.tts_service import generate_tts

router = APIRouter()

@router.post("/generate-podcast")
def generate_podcast(topic: str):

    script = generate_script(topic)
    file_path, source, time_taken = generate_tts(script)

    return {
        "audio_file": file_path,
        "source": source,
        "generation_time": time_taken
    }
