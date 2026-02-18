from openai import OpenAI
from app.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_script(topic: str):

    prompt = f"""
    Create a professional podcast script.

    Structure:
    - Engaging Introduction
    - Informative Body (structured sections)
    - Strong Conclusion
    - Natural conversational tone

    Topic: {topic}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content
