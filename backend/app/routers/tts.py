from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse

from app.schemas import TTSRequest
from app.services.tts_service import get_tts_mp3_path

router = APIRouter()

@router.post("/tts")
async def tts(req: TTSRequest):
    try:
        path = await get_tts_mp3_path(req.text)
        return FileResponse(path, media_type="audio/mpeg")
    except ValueError as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "TTS 실패", "detail": str(e)})
