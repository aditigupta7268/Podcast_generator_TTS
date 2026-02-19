from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_generate_podcast():
    response = client.post("/generate-podcast", json={"topic": "AI advancements"})
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"

def test_stream_tts():
    response = client.post("/stream-tts", data={"text": "Hello world"})
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"

def test_generate_podcast_admin():
    response = client.post("/generate-podcast", json={"topic": "AI"})
    assert response.status_code == 200
    assert "audio_file" in response.json()
    assert "source" in response.json()
    assert "generation_time" in response.json()