import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE_DIR = os.path.join(BASE_DIR, "storage", "cache")

os.makedirs(CACHE_DIR, exist_ok=True)

def check_cache(hash_value):
    file_path = os.path.join(CACHE_DIR, f"{hash_value}.mp3")
    return file_path if os.path.exists(file_path) else None

def save_cache(hash_value, file_path):
    new_path = os.path.join(CACHE_DIR, f"{hash_value}.mp3")
    os.rename(file_path, new_path)
