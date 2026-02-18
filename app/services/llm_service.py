from openai import OpenAI
from app.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_script(topic: str):

    # Mocked response for testing
    return f"""
    Podcast Script for {topic}

    Introduction:
    Welcome to our podcast on {topic}.

    Body:
    - Section 1: Overview of {topic}
    - Section 2: Key insights about {topic}

    Conclusion:
    Thank you for listening to our podcast on {topic}.
    """
