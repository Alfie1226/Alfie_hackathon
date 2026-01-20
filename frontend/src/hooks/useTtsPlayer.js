import { useEffect, useRef, useState } from "react";
import { requestTts } from "../services/storyApi";

export default function useTtsPlayer() {
  const audioRef = useRef(null);
  const urlRef = useRef("");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState("");

  const stop = () => {
    try {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    } catch {}
  };

  const cleanupUrl = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = "";
    }
  };

  const play = async (text) => {
    if (!text?.trim()) return;

    setTtsLoading(true);
    setTtsError("");

    try {
      stop();
      cleanupUrl();

      const blob = await requestTts(text);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = url;

      // ✅ 자동재생 차단은 “버튼 클릭 기반”이면 대부분 통과
      await audioRef.current.play();
    } catch (e) {
      setTtsError("TTS 재생 실패! (브라우저 자동재생 차단/서버 오류 가능)");
    } finally {
      setTtsLoading(false);
    }
  };

  // 페이지 이동/언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      stop();
      cleanupUrl();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { play, stop, ttsLoading, ttsError };
}
