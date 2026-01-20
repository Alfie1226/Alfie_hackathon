from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.schemas import ImageRequest
from app.services.image_service import generate_image_logic

router = APIRouter()

@router.post("/generate-image")
def generate_image(req: ImageRequest):
    try:
        return generate_image_logic(req.prompt, req.init_image, req.denoising_strength)
    except ValueError as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": "그림 생성 실패", "detail": str(e)})
