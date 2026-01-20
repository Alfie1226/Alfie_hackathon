from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.schemas import StoryRequest
from app.services.story_service import generate_story_logic

router = APIRouter()

@router.post("/generate-story")
async def generate_story(req: StoryRequest):
    try:
        data = generate_story_logic(req.label)
        return data
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "동화 생성 실패", "detail": str(e)})
