import React, { useRef, useState, useEffect } from "react";
import CanvasDraw from "react-canvas-draw";
import axios from "axios";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  
  const [candidates, setCandidates] = useState([]); 
  const [selectedLabel, setSelectedLabel] = useState(""); 
  const [title, setTitle] = useState(""); 
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReading, setIsReading] = useState(false); // 🗣️ 읽고 있는지 확인하는 상태
  const [audio, setAudio] = useState(null); // 🎵 오디오 파일 관리

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 450;

  // 0. 목소리 설정 (초기화)
  useEffect(() => {
    // 페이지를 떠나거나 새로고침하면 말하던 거 멈춤
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // 🗣️ [새로운] 예쁜 목소리로 읽어주기 (서버 요청)
  const handleReadStory = async () => {
    if (!story) return;
    
    // 이미 읽고 있는 게 있다면 멈춤
    if (audio) {
      audio.pause();
      setIsReading(false);
      return; // 버튼을 토글처럼 쓰기 위해 여기서 종료
    }

    try {
      setLoading(true); // 로딩 표시 (파일 받아오는 동안)
      
      const safeTitle = title ? title : "";
      const fullText = `${safeTitle}. \n ${story}`;

      // 1. 백엔드에 MP3 달라고 요청
      const response = await axios.post("http://127.0.0.1:8000/tts", {
        text: fullText
      }, {
        responseType: 'blob' // 👈 중요! 파일(Blob)로 받겠다고 설정
      });

      // 2. 받은 파일을 오디오로 변환
      const audioUrl = URL.createObjectURL(response.data);
      const newAudio = new Audio(audioUrl);
      
      setAudio(newAudio); // 상태에 저장 (나중에 멈추려고)
      setIsReading(true);

      // 3. 재생 시작
      newAudio.play();

      // 4. 다 읽으면 상태 원상복구
      newAudio.onended = () => {
        setIsReading(false);
        setAudio(null);
      };

    } catch (error) {
      console.error("목소리 가져오기 실패:", error);
      alert("목소리를 가져오지 못했어요 ㅠㅠ");
    } finally {
      setLoading(false);
    }
  };

  // 🔇 멈춤 함수
  const handleStopReading = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0; // 처음으로 되감기
      setAudio(null);
    }
    setIsReading(false);
  };

  // 1. 분석 요청
  const handlePredict = async () => {
    if (!canvasRef.current) return;
    setLoading(true);
    setCandidates([]);
    setSelectedLabel("");
    setTitle(""); 
    setStory("");
    handleStopReading(); // 분석 시작하면 말하기 중단

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

  // 2. 선택 후 동화 생성
  const handleSelectAndStory = async (label) => {
    setSelectedLabel(label);
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/generate-story", {
        label: label
      });
      
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
            handleStopReading(); // 지우기 누르면 말하기도 멈춤
          }} 
          className="btn clear-btn">
          지우기 🗑️
        </button>
        
        {candidates.length === 0 && !story && (
          <button onClick={handlePredict} className="btn magic-btn" disabled={loading}>
            {loading ? "분석 중... 🤔" : "다 그렸어요! ✨"}
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

          {/* 📢 읽어주기 버튼 추가! */}
          <div className="tts-button-group" style={{ marginTop: "15px", marginBottom: "15px" }}>
            {!isReading ? (
              <button className="btn tts-btn" onClick={handleReadStory}>
                📖 읽어주세요!
              </button>
            ) : (
              <button className="btn stop-btn" onClick={handleStopReading}>
                🤫 그만 읽어주세요!
              </button>
            )}
          </div>

          <button 
            className="btn magic-btn" 
            onClick={() => {
              setCandidates([]);
              setSelectedLabel("");
              setTitle("");
              setStory("");
              handleStopReading(); // 다시하기 누르면 멈춤
              canvasRef.current.clear();
            }}>
            또 하기
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