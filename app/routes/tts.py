import os
from gtts import gTTS
import uuid

AUDIO_FOLDER = "audio"

# create audio folder if not exists
os.makedirs(AUDIO_FOLDER, exist_ok=True)

def text_to_speech(text: str):
    try:
        filename = f"{uuid.uuid4()}.mp3"
        file_path = os.path.join(AUDIO_FOLDER, filename)

        tts = gTTS(text=text, lang="en")
        tts.save(file_path)

        return file_path

    except Exception as e:
        print("TTS Error:", e)
        return None
