import os
import cv2
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai  # 안정적인 라이브러리
from dotenv import load_dotenv

# 1. .env 파일 로드
# (같은 폴더에 있는 .env 파일을 찾아서 읽어옵니다)
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

# ==========================================
# 🔑 API 키 설정 (.env에서 가져오기)
# ==========================================
MY_API_KEY = os.getenv("GOOGLE_API_KEY")

# 키가 잘 가져와졌는지 터미널에 살짝 보여줌 (보안상 앞 5자리만)
if not MY_API_KEY:
    print("⚠️ [경고] .env 파일을 못 찾거나 키가 없습니다!")
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
        
        # 1. 모든 확률을 높은 순서대로 쫘르륵 줄 세웁니다.
        # (argsort는 낮은 순 정렬이라 [::-1]로 뒤집어서 높은 순으로 만듭니다)
        sorted_indices = np.argsort(pred[0])[::-1]
        
        candidates = []
        
        # 2. 순서대로 하나씩 꺼내서 검사합니다.
        for idx in sorted_indices:
            # 이미 3개를 다 찾았으면 그만
            if len(candidates) >= 3:
                break
                
            english_label = CLASSES[idx] 
            
            # 결과가 '사자(lion)'라면 -> 무시
            if english_label == "lion":
                continue 

            confidence = float(pred[0][idx]) * 100
            korean_label = KOREAN_MAPPING.get(english_label, english_label)
            
            # 리스트에 추가
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
    당신은 다정하고 감수성이 풍부한 동화 작가입니다.
    주제: '{req.label}'

    1. '**' 같은 특수기호나 마크다운 형식을 절대 사용하지 마세요. (순수한 텍스트만 출력)
    2. '제목:', '교훈:', '끝' 같은 딱딱한 라벨을 절대 붙이지 마세요.
    3. 교훈은 마지막에 따로 요약하지 말고, 주인공의 대사나 이야기의 마무리에 자연스럽게 녹여내세요.
    4. 문체: 부드러운 구어체(존댓말)를 사용하세요.
    5. 분량: 100자 내외.
    6. 읽기 쉽게 문단을 나누어 주세요.
    7. 필요시 이모지를 사용해주세요.
    8. 주인공에게 귀엽고 멋지고 예쁜 이름을 지어주세요
    """
        
        response = gemini_model.generate_content(prompt)
        print(" 동화 생성 성공!")
        return {"story": response.text}

    except Exception as e:
        print(f"❌ [에러] AI 응답 실패: {e}")
        return {"story": f"동화를 짓다가 실수를 했어요: {e}"}