import requests

from app.core.config import SD_IMG2IMG, SD_TXT2IMG
from app.core.utils import dataurl_to_b64

NEGATIVE = "photorealistic, realistic, text, watermark, logo, blurry, low quality"

def generate_image_logic(prompt: str, init_image: str | None, denoising_strength: float | None):
    prompt = (prompt or "").strip()
    if not prompt:
        raise ValueError("prompt가 비어있습니다.")

    if init_image:
        init_b64 = dataurl_to_b64(init_image)
        payload = {
            "init_images": [init_b64],
            "prompt": prompt,
            "negative_prompt": NEGATIVE,
            "steps": 20,
            "width": 512,
            "height": 512,
            "cfg_scale": 7,
            "sampler_name": "DPM++ 2M",
            "denoising_strength": float(denoising_strength or 0.55),
        }
        r = requests.post(SD_IMG2IMG, json=payload, timeout=240)
    else:
        payload = {
            "prompt": prompt,
            "negative_prompt": NEGATIVE,
            "steps": 20,
            "width": 512,
            "height": 512,
            "cfg_scale": 7,
            "sampler_name": "DPM++ 2M",
        }
        r = requests.post(SD_TXT2IMG, json=payload, timeout=240)

    if r.status_code != 200:
        raise RuntimeError(f"Stable Diffusion 호출 실패: {r.status_code} / {r.text[:500]}")

    img_base64 = r.json()["images"][0]
    return {"image": f"data:image/png;base64,{img_base64}"}
