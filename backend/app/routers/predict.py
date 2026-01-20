from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse

from app.services.predict_service import predict_top3

router = APIRouter()

@router.post("/predict")
async def predict_sketch(file: UploadFile = File(...)):
    contents = await file.read()
    out = predict_top3(contents)
    if out is None:
        return JSONResponse(status_code=400, content={"error": "이미지 처리 실패"})
    return {"candidates": out}
