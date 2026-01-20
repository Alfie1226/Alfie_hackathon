import os
import cv2
import numpy as np
import tensorflow as tf

from app.core.config import MODEL_PATH

CLASSES = [
    "cat","dog","rabbit","lion","tiger","bear","bird","fish",
    "penguin","frog","car","airplane","bicycle","tree","flower",
]

KOREAN_MAPPING = {
    "cat":"고양이","dog":"강아지","rabbit":"토끼","lion":"사자","tiger":"호랑이",
    "bear":"곰","bird":"새","fish":"물고기","penguin":"펭귄","frog":"개구리",
    "car":"자동차","airplane":"비행기","bicycle":"자전거","tree":"나무","flower":"꽃",
}

_MODEL = None

def load_model_once():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    if os.path.exists(MODEL_PATH):
        _MODEL = tf.keras.models.load_model(MODEL_PATH, compile=False)
    return _MODEL

def preprocess_image_64(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None

    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = 255 - img

    coords = cv2.findNonZero(img)
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        img = img[y:y+h, x:x+w]

    img = cv2.resize(img, (64, 64))
    img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    img = img.astype("float32") / 255.0
    return img.reshape(1, 64, 64, 3)

def predict_top3(image_bytes: bytes):
    model = load_model_once()
    img = preprocess_image_64(image_bytes)
    if img is None or model is None:
        return None

    pred = model.predict(img, verbose=0)[0]
    idxs = np.argsort(pred)[::-1]

    out = []
    for i in idxs:
        if CLASSES[i] == "lion":
            continue
        out.append({
            "korean_label": KOREAN_MAPPING.get(CLASSES[i], CLASSES[i]),
            "confidence": round(float(pred[i]) * 100, 1)
        })
        if len(out) == 3:
            break

    return out
