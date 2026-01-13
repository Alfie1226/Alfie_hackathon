import tensorflow as tf
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
OLD_MODEL = BACKEND_DIR / "models" / "my_doodle_model_64.h5"
NEW_MODEL = BACKEND_DIR / "models" / "my_doodle_model_fixed"

print("loading old model:", OLD_MODEL)
model = tf.keras.models.load_model(OLD_MODEL, compile=False)

print("saving new model to:", NEW_MODEL)
model.save(NEW_MODEL)

print("DONE")
