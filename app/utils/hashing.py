import hashlib

def generate_hash(text: str):
    return hashlib.sha256(text.encode()).hexdigest()