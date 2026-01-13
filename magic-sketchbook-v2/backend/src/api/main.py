from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from src.ml.predictor import predict_label

from .gemini_story import make_story

app = FastAPI(title="Magic Sketchbook API", version="0.1.0")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/predict_story")
async def predict_story(image: UploadFile = File(...)):
    try:
        file_bytes = await image.read()

        label, conf = predict_label(file_bytes)

        story = make_story([label])

        return {"label": label, "confidence": conf, "story": story}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
