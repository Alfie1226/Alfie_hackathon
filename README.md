## 실행 방법(Windows)

1. backend: `cd backend` → `python -m venv venv` → `venv\Scripts\activate` → `pip install -r requirements.txt`
2. backend: `.env` 생성 후 `uvicorn main:app --reload --port 8000`
3. frontend: `cd frontend` → `npm install` → `npm run dev`
4. (옵션) Stable Diffusion WebUI 실행: `http://127.0.0.1:7860`
