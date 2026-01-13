import io
import numpy as np
from pathlib import Path
from PIL import Image
import tensorflow as tf

from .classes import CLASSES

BACKEND_DIR = Path(__file__).resolve().parents[2]   # .../backend
MODEL_PATH = BACKEND_DIR / "models" / "my_doodle_model_fixed.keras"
print("MODEL_PATH =", MODEL_PATH)
_model = None

def _get_model():
    global _model
    if _model is None:
        _model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    return _model

def _preprocess_28x28_gray(file_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(file_bytes)).convert("L")  # grayscale
    img = img.resize((28, 28))
    arr = np.array(img).astype("float32") / 255.0          # (28,28)
    arr = np.expand_dims(arr, axis=-1)                     # (28,28,1)
    arr = np.expand_dims(arr, axis=0)                      # (1,28,28,1)
    return arr

def predict_label(file_bytes: bytes):
    model = _get_model()
    x = _preprocess_28x28_gray(file_bytes)
    probs = model.predict(x, verbose=0)[0]  # (num_classes,)
    idx = int(np.argmax(probs))
    conf = float(probs[idx])
    label = CLASSES[idx] if idx < len(CLASSES) else str(idx)
    return label, conf
