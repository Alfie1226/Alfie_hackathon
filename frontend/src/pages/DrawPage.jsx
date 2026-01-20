import React, { useEffect, useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { predictSketch } from "../services/storyApi";

export default function DrawPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [retryAfterSec, setRetryAfterSec] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const [candidates, setCandidates] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [drawingImage, setDrawingImage] = useState("");

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 450;

  useEffect(() => {
    if (retryAfterSec <= 0) return;
    const t = setInterval(() => {
      setRetryAfterSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [retryAfterSec]);

  const resetAll = () => {
    setCandidates([]);
    setSelectedLabel("");
    setDrawingImage("");
    setErrorMsg("");
    setRetryAfterSec(0);
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    resetAll();
  };

  const isProbablyEmpty = () => {
    try {
      const data = canvasRef.current?.getSaveData?.();
      if (!data) return true;
      const obj = JSON.parse(data);
      return !obj?.lines || obj.lines.length === 0;
    } catch {
      return false;
    }
  };

  const dataUrlToPngFile = async (dataURL) => {
    const res = await fetch(dataURL);
    const blob = await res.blob();

    if (!blob || blob.size === 0) return null;

    return new File([blob], "sketch.png", { type: "image/png" });
  };

  const handlePredict = async () => {
    if (!canvasRef.current) return;
    if (retryAfterSec > 0) return;

    setLoading(true);
    setCandidates([]);
    setSelectedLabel("");
    setErrorMsg("");

    try {
      if (isProbablyEmpty()) {
        setErrorMsg("그림이 비어있어요! 한 번만 그려보고 다시 눌러줘 🙏");
        return;
      }

      // ✅ 팀원 방식 유지
      const dataURL = canvasRef.current.getDataURL("png", false, "#ffffff");
      setDrawingImage(dataURL);

      const file = await dataUrlToPngFile(dataURL);
      if (!file) {
        setErrorMsg("이미지 변환 실패! 다시 그려보고 눌러줘.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const data = await predictSketch(formData);
      setCandidates(data?.candidates || []);
    } catch (e) {
      const serverMsg =
        e?.response?.data?.error ||
        e?.response?.data?.detail ||
        e?.message ||
        "";
      setErrorMsg(`분석 실패: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const onClickStart = () => {
    if (!selectedLabel) return;
    navigate("/story", { state: { label: selectedLabel, drawingImage } });
  };

  const showPredictButton = candidates.length === 0;

  return (
    <div className="container">
      <h1 className="title">🎨 매직 스케치북</h1>

      <div className="canvas-page-nav">
        <CanvasDraw
          ref={canvasRef}
          brushRadius={6}
          lazyRadius={0}
          brushColor="#000000"
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          hideGrid={true}
          backgroundColor="#ffffff"
        />
      </div>

      <div className="button-group">
        <button
          className="btn clear-btn"
          onClick={handleClear}
          disabled={loading}
        >
          지우기 🗑️
        </button>

        {showPredictButton && (
          <button
            className="btn magic-btn"
            onClick={handlePredict}
            disabled={loading || retryAfterSec > 0}
          >
            {retryAfterSec > 0
              ? `잠시 후 재시도 (${retryAfterSec}s)`
              : loading
                ? "분석 중... 🤔"
                : "다 그렸어요! ✨"}
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="result-card fade-in" style={{ marginTop: 12 }}>
          <h3>⚠️ 잠깐만요</h3>
          <p style={{ whiteSpace: "pre-line" }}>{errorMsg}</p>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="result-card fade-in">
          <h3>이야기 속 친구는 누구일까?</h3>
          <p className="subtitle">가장 닮은 친구를 골라줘 👇</p>

          <div className="candidate-list">
            {candidates.map((item, idx) => (
              <button
                key={idx}
                className="candidate-btn"
                onClick={() => setSelectedLabel(item.korean_label)}
                disabled={loading}
                style={{
                  border:
                    selectedLabel === item.korean_label
                      ? "2px solid #3b82f6"
                      : undefined,
                }}
              >
                <span className="candidate-label">{item.korean_label}</span>
              </button>
            ))}
          </div>

          {selectedLabel && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                className="btn magic-btn"
                onClick={onClickStart}
                disabled={loading}
              >
                📖 이야기 시작
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
