import os
import emoji
import edge_tts

from app.core.config import CACHE_VOICES_DIR
from app.core.utils import sha1_str

async def get_tts_mp3_path(text: str) -> str:
    text = emoji.replace_emoji(text or "", "")
    text = text.strip()
    if not text:
        raise ValueError("text가 비어있습니다.")

    key = sha1_str(text)
    path = os.path.join(CACHE_VOICES_DIR, f"{key}.mp3")

    if os.path.exists(path):
        return path

    communicate = edge_tts.Communicate(text, "ko-KR-SunHiNeural")
    await communicate.save(path)
    return path
