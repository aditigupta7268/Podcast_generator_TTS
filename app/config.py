import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = "sqlite:///./tts.db"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

MONTHLY_LIMIT = 500000  # characters
RATE_LIMIT = "10/minute"