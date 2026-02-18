import os
import time
from app.utils.hashing import generate_hash
from app.services.cache_service import check_cache
from gtts import gTTS

# Get project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

AUDIO_DIR = os.path.join(BASE_DIR, "storage", "audio")
CACHE_DIR = os.path.join(BASE_DIR, "storage", "cache")

# Ensure directories exist
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

def generate_tts(text: str):
    start = time.time()
    hash_value = generate_hash(text)

    cached = check_cache(hash_value)
    if cached:
        return cached, "cache", time.time() - start

    file_path = os.path.join(AUDIO_DIR, f"{hash_value}.mp3")

    # Generate audio using gTTS
    tts = gTTS(text)
    tts.save(file_path)

    return file_path, "generated", time.time() - start
