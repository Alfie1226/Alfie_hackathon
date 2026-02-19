import os
import cv2
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
# 👇 [수정] gTTS 대신 edge_tts 사용
import edge_tts 
from fastapi.responses import FileResponse
import uuid
import emoji

# 1. .env 파일 로드
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 로드
try:
    MODEL = tf.keras.models.load_model("my_doodle_model_64.h5")
    print("✅ 모델 로딩 성공!")
except Exception as e:
    print(f"❌ 모델 로딩 실패: {e}")
    MODEL = None

CLASSES = [
    "cat", "dog", "rabbit", "lion", "tiger", "bear",
    "bird", "fish", "penguin", "frog",
    "car", "airplane", "bicycle", "tree", "flower"
]

KOREAN_MAPPING = {
    "cat": "고양이", "dog": "강아지", "rabbit": "토끼", 
    "lion": "사자", "tiger": "호랑이", "bear": "곰",
    "bird": "새", "fish": "물고기", "penguin": "펭귄", "frog": "개구리",
    "car": "자동차", "airplane": "비행기", "bicycle": "자전거",
    "tree": "나무", "flower": "꽃"
}

# API 키 설정
MY_API_KEY = os.getenv("GOOGLE_API_KEY")

if not MY_API_KEY:
    print("⚠️ .env 파일을 못 찾거나 키가 없습니다!")
else:
    print(f"🔑 API 키 로드 성공: {MY_API_KEY[:5]}*****")

try:
    genai.configure(api_key=MY_API_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.5-flash")
except Exception as e:
    print(f"❌ 설정 오류: {e}")


def preprocess_image_64(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    inv_img = 255 - img
    coords = cv2.findNonZero(inv_img)
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        pad = 20
        x = max(0, x - pad)
        y = max(0, y - pad)
        w = min(img.shape[1] - x, w + 2*pad)
        h = min(img.shape[0] - y, h + 2*pad)
        img = img[y:y+h, x:x+w]

    img = cv2.resize(img, (64, 64), interpolation=cv2.INTER_AREA)
    img = cv2.bitwise_not(img)
    _, img = cv2.threshold(img, 50, 255, cv2.THRESH_BINARY)
    kernel = np.ones((2, 2), np.uint8)
    img = cv2.dilate(img, kernel, iterations=1)
    img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    img = img.astype('float32') / 255.0
    img = img.reshape(1, 64, 64, 3)
    return img

class StoryRequest(BaseModel):
    label: str


@app.post("/predict")
async def predict_sketch(file: UploadFile = File(...)):
    if MODEL is None: return {"candidates": []}
    
    contents = await file.read()
    try:
        processed_img = preprocess_image_64(contents)
        pred = MODEL.predict(processed_img)
        
        sorted_indices = np.argsort(pred[0])[::-1]
        
        candidates = []
        for idx in sorted_indices:
            if len(candidates) >= 3:
                break
            english_label = CLASSES[idx]
            if english_label == "lion":
                continue 

            confidence = float(pred[0][idx]) * 100
            korean_label = KOREAN_MAPPING.get(english_label, english_label)
            
            candidates.append({
                "korean_label": korean_label,
                "confidence": round(confidence, 1)
            })

        return {"candidates": candidates}

    except Exception as e:
        print(f"예측 에러: {e}")
        return {"candidates": []}


@app.post("/generate-story")
async def generate_story(req: StoryRequest):
    print(f"📝 동화 요청: {req.label}")
    try:
        prompt = f"""
    당신은 아이들을 위한 다정하고 감수성이 풍부한 동화 작가입니다.
    주제: '{req.label}'

    [작성 규칙]
    1. 첫 줄: 반드시 주제에 어울리는 **10자 이내의 짧고 귀여운 제목**만 쓰세요. (예: 씩씩한 사자 레오, 춤추는 꽃송이)
    2. 둘째 줄부터: 본문 내용을 작성하세요. (줄바꿈으로 제목과 본문을 구분합니다)
    3. 본문 : 기승전결이 있는 100자 내외로, 아이들이 읽기 쉽게.
    4. 주인공 이름: 주제에 어울리는 예쁜 이름을 지어주세요.
    5. 문체: "해요"체의 부드러운 존댓말.
    6. 특수기호: '**', '##' 같은 마크다운 문법 금지. 순수 텍스트만 출력, 필요한 경우 이모지 삽입.
    7. 내용: 교훈을 억지로 넣지 말고, 이야기 속에 자연스럽게 녹여주세요.
    """
        
        response = gemini_model.generate_content(prompt)
        # 제목과 본문 분리 로직 (안전장치)
        full_text = response.text.strip()
        if "\n" in full_text:
            title, story = full_text.split("\n", 1)
            title = title.strip()
            story = story.strip()
        else:
            title = f"{req.label} 이야기"
            story = full_text

        print("✅ 동화 생성 성공!")
        return {"title": title, "story": story}

    except Exception as e:
        print(f"❌ [에러] AI 응답 실패: {e}")
        return {"title": "잠시만요", "story": f"동화를 짓다가 실수를 했어요: {e}"}
    
    
class TTSRequest(BaseModel):
    text: str

# TTS 생성
@app.post("/tts")
async def generate_tts(req: TTSRequest):
    print(f"🗣️ 목소리 생성 요청: {req.text[:20]}...")
    try:
        # 1. 이모지 제거 (✨ -> 삭제)
        # replace_emoji 함수가 텍스트에서 이모지만 찾아서 없애줍니다.
        clean_text = emoji.replace_emoji(req.text, replace="")
        
        # 2. 불필요한 특수문자나 공백도 깔끔하게 정리 (선택사항)
        clean_text = clean_text.strip()

        # 한국어 예쁜 여자 목소리
        VOICE = "ko-KR-SunHiNeural"
        
        filename = f"temp_voice_{uuid.uuid4()}.mp3"
        
        # 3. 깨끗해진 텍스트(clean_text)로 목소리 만들기
        communicate = edge_tts.Communicate(clean_text, VOICE)
        await communicate.save(filename)
        
        return FileResponse(filename, media_type="audio/mpeg", filename="story.mp3")

    except Exception as e:
        print(f"❌ TTS 에러: {e}")
        return {"error": str(e)}