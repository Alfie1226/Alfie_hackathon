from pydantic import BaseModel

class StoryRequest(BaseModel):
    label: str

class ImageRequest(BaseModel):
    prompt: str
    init_image: str | None = None
    denoising_strength: float | None = 0.55

class TTSRequest(BaseModel):
    text: str
