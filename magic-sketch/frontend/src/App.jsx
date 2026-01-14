import React, { useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import axios from "axios";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  
  const [candidates, setCandidates] = useState([]); 
  const [selectedLabel, setSelectedLabel] = useState(""); 
  
  // 👇 제목을 저장할 공간 추가!
  const [title, setTitle] = useState(""); 
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 450;

  // 1. 분석 요청
  const handlePredict = async () => {
    if (!canvasRef.current) return;
    setLoading(true);
    setCandidates([]);
    setSelectedLabel("");
    setTitle(""); // 초기화
    setStory("");

    const canvasData = canvasRef.current.getDataURL("png", false, "#ffffff");
    const res = await fetch(canvasData);
    const blob = await res.blob();
    const file = new File([blob], "sketch.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", formData);
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error("에러:", error);
      alert("분석 실패!");
    } finally {
      setLoading(false);
    }
  };

  // 2. 선택 후 동화 생성 (제목 + 내용 받아오기)
  const handleSelectAndStory = async (label) => {
    setSelectedLabel(label);
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/generate-story", {
        label: label
      });
      
      // 👇 서버에서 받은 제목과 내용을 각각 저장
      setTitle(response.data.title);
      setStory(response.data.story);
      
    } catch (error) {
      console.error("동화 에러:", error);
      setTitle("오류가 났어요");
      setStory("동화를 만들지 못했어요 ㅠㅠ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">🎨 매직 스케치북</h1>
      
      <div className="canvas-wrapper">
        <CanvasDraw
          ref={canvasRef}
          brushRadius={6}
          lazyRadius={0}
          brushColor="#000000"
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
        />
      </div>

      <div className="button-group">
        <button onClick={() => {
            canvasRef.current.clear();
            setCandidates([]);
            setSelectedLabel("");
            setTitle("");
            setStory("");
          }} 
          className="btn clear-btn">
          지우기 🗑️
        </button>
        
        {candidates.length === 0 && !story && (
          <button onClick={handlePredict} className="btn magic-btn" disabled={loading}>
            {loading ? "분석 중... 🤔" : "다 그렸어요! (정답 맞추기) ✨"}
          </button>
        )}
      </div>

      {candidates.length > 0 && !selectedLabel && (
        <div className="result-card fade-in">
          <h3>이 그림은 무엇인가요?</h3>
          <p className="subtitle">가장 비슷한 그림을 골라주세요 👇</p>
          
          <div className="candidate-list">
            {candidates.map((item, index) => (
              <button 
                key={index} 
                className="candidate-btn"
                onClick={() => handleSelectAndStory(item.korean_label)}
              >
                <span className="candidate-label">{item.korean_label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {story && (
        <div className="result-card fade-in">
          <h2 className="story-title">{title}</h2>
          <hr />
          <div className="story-box">
            <p>{story}</p>
          </div>
          <button 
            className="btn magic-btn" 
            style={{marginTop: '20px'}}
            onClick={() => {
              setCandidates([]);
              setSelectedLabel("");
              setTitle("");
              setStory("");
              canvasRef.current.clear();
            }}>
            또 하기 🔄
          </button>
        </div>
      )}
      
      {loading && selectedLabel && (
        <div className="loading-overlay">
          <p>✍️ 이야기를 짓고 있어요...</p>
        </div>
      )}
    </div>
  );
}

export default App;