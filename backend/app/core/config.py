import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

load_dotenv(os.path.join(BASE_DIR, ".env"))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

CACHE_DIR = os.path.join(BASE_DIR, "cache")
CACHE_META_DIR = os.path.join(CACHE_DIR, "meta")
CACHE_VOICES_DIR = os.path.join(CACHE_DIR, "voices")

os.makedirs(CACHE_META_DIR, exist_ok=True)
os.makedirs(CACHE_VOICES_DIR, exist_ok=True)

PROMPT_VERSION = os.getenv("PROMPT_VERSION", "v2")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

SD_BASE_URL = (os.getenv("SD_BASE_URL") or "http://127.0.0.1:7860").rstrip("/")

SD_TXT2IMG = f"{SD_BASE_URL}/sdapi/v1/txt2img"
SD_IMG2IMG = f"{SD_BASE_URL}/sdapi/v1/img2img"

MODEL_PATH = os.path.join(BASE_DIR, "models", "my_doodle_model_64.h5")
