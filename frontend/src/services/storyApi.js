import { apiClient } from "./apiClient";

export async function predictSketch(formData) {
  const res = await apiClient.post("/predict", formData);
  return res.data;
}

export async function generateStory(label) {
  const res = await apiClient.post("/generate-story", { label });
  return res.data;
}

export async function generateImage(body) {
  const res = await apiClient.post("/generate-image", body);
  return res.data;
}

// mp3 파일을 blob으로 받아서 재생할 수 있게
export async function requestTts(text) {
  const res = await apiClient.post("/tts", { text }, { responseType: "blob" });
  return res.data; // Blob
}
