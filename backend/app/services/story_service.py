import json
import os
import re

import google.generativeai as genai

from app.core.config import CACHE_META_DIR, GOOGLE_API_KEY, PROMPT_VERSION
from app.core.utils import sha1_str

_gemini_model = None

def get_gemini_model():
    global _gemini_model
    if _gemini_model is not None:
        return _gemini_model
    if not GOOGLE_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY가 설정되지 않았습니다.")
    genai.configure(api_key=GOOGLE_API_KEY)
    _gemini_model = genai.GenerativeModel("models/gemini-2.5-flash")
    return _gemini_model

def generate_story_logic(label: str):
    label = (label or "").strip()
    if not label:
        raise ValueError("label이 비어있습니다.")

    cache_key = sha1_str(f"story|{PROMPT_VERSION}|{label}")
    cache_path = os.path.join(CACHE_META_DIR, f"{cache_key}.json")

    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)

    prompt = f"""
아이들을 위한 동화책 작가다.
주인공: {label}

규칙:
- 총 3페이지
- 각 페이지 최소 220자 ~ 320자
- 따뜻한 동화 톤
- 기승전결이 꼭 있었으면 좋겠어
- 주제랑 상관없는 내용은 등장하지 않아야함
- JSON만 출력

형식:
{{
 "title": "제목",
 "scenes": [
  {{ "page":1, "text":"...", "image_prompt":"cute children's picture book illustration of {label}, pastel colors, watercolor, simple shapes, clean outline, white background, (kawaii:1.1)" }}
 ]
}}
"""

    model = get_gemini_model()
    res = model.generate_content(prompt)

    # JSON만 뽑기(실패 대비)
    m = re.search(r"\{[\s\S]*\}", res.text or "")
    if not m:
        raise RuntimeError("Gemini 응답에서 JSON을 찾지 못했습니다.")

    data = json.loads(m.group())

    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return data
