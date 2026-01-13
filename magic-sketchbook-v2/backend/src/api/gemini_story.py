import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai

# backend/.env 확실히 로드
ENV_PATH = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(ENV_PATH)

API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY(or GOOGLE_API_KEY) not found. Check backend/.env (and not .env.txt).")

client = genai.Client(api_key=API_KEY)


def _pick_model() -> str:
    """
    내 API 키에서 실제로 사용 가능한 모델 중 generateContent 가능한 것 1개를 고른다.
    실패하면 가장 흔한 기본값으로 폴백.
    """
    # 1순위로 선호하는 후보들
    preferred = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash",
        "gemini-1.0-pro",
    ]

    try:
        # python-genai에서는 models.list()가 지원됨(환경에 따라 iterator/객체 형태가 다를 수 있어 방어적으로 처리)
        models = client.models.list()
        names = []
        for m in models:
            name = getattr(m, "name", None) or getattr(m, "model", None) or str(m)
            names.append(name)

        # preferred 중에서 실제 목록에 존재하는 걸 선택
        for p in preferred:
            for n in names:
                if n.endswith(p) or n == p:
                    return p

        # 그래도 없으면 목록에서 gemini 들어간 첫 모델
        for n in names:
            if "gemini" in n:
                # n이 "models/xxx" 형태면 마지막 토큰만 쓰기
                return n.split("/")[-1]

    except Exception:
        pass

    # 최종 폴백
    return "gemini-1.5-pro"


MODEL_NAME = _pick_model()


def make_story(labels: list[str]) -> str:
    keywords = ", ".join(labels) if labels else "mystery"
    prompt = f"""너는 어린이 동화 작가야.

키워드: {keywords}

조건:
- 한국어 8~10문장
- 기승전결
- 마지막에 교훈 한 줄
- 폭력적/무서운 내용 금지
"""

    backoff = 2
    model_name = MODEL_NAME  # 전역값을 로컬로 복사해서 사용

    for _ in range(3):
        try:
            resp = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            return (resp.text or "").strip()

        except Exception as e:
            msg = str(e)

            # 404면: 모델명을 다시 고르고 바로 재시도
            if "404" in msg or "NOT_FOUND" in msg:
                model_name = _pick_model()
                continue

            # 429면: 잠깐 쉬고 재시도
            if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
                time.sleep(backoff)
                backoff *= 2
                continue

            raise

    # 최종 폴백(시연 끊기지 않게)
    return (
        f"옛날 옛적에 {keywords}가(이) 살고 있었어요.\n"
        f"{keywords}는(은) 친구들과 힘을 합쳐 문제를 해결했답니다.\n"
        f"마지막엔 모두가 웃으며 집으로 돌아왔어요.\n"
        f"교훈: 함께하면 더 강해져요!"
    )
