// ================== StoryPage.jsx (규칙 적용 + 캐시 + TTS 포함) ==================
// 규칙
// 1페이지: 원본 낙서 + 동화풍 변환( img2img, denoise=0.55 )  ← 1번만 생성 + 캐시
// 2페이지: 1페이지 주인공을 기반으로 “살짝 변형”( img2img, denoise=0.25 ) ← 1번만 생성 + 캐시
// 3페이지: 새로 생성( txt2img ) ← 1번만 생성 + 캐시

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

import { generateStory, generateImage } from "../services/storyApi";
import useTtsPlayer from "../hooks/useTtsPlayer";

export default function StoryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const label = location.state?.label;
  const drawingImage = location.state?.drawingImage; // dataURL (낙서)

  const [title, setTitle] = useState("");
  const [scenes, setScenes] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  // ✅ 페이지별 생성 이미지 캐시
  const [imagesByPage, setImagesByPage] = useState({}); // {0: dataURL, 1: dataURL, 2: dataURL}

  // ✅ 1페이지 결과(주인공) → 2페이지 변형 init_image로 사용
  const [heroImage, setHeroImage] = useState("");

  const [loadingStory, setLoadingStory] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { play, stop, ttsLoading, ttsError } = useTtsPlayer();

  const currentScene = scenes[pageIndex];
  const currentText = useMemo(() => currentScene?.text || "", [currentScene]);

  // ================== 스토리 생성 ==================
  useEffect(() => {
    if (!label) return;

    const run = async () => {
      setLoadingStory(true);
      setErrorMsg("");

      setTitle("");
      setScenes([]);
      setPageIndex(0);

      // ✅ 새 동화면 캐시/주인공 초기화
      setImagesByPage({});
      setHeroImage("");

      try {
        const data = await generateStory(label);
        setTitle(data?.title || `${label}의 동화`);
        setScenes(Array.isArray(data?.scenes) ? data.scenes : []);
        setPageIndex(0);
      } catch (e) {
        setErrorMsg("동화 생성 실패!");
      } finally {
        setLoadingStory(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  // ================== 페이지별 그림 생성 (캐시 + 규칙 적용) ==================
  useEffect(() => {
    if (!currentScene) return;

    // ✅ 이미 캐시 있으면 재생성 금지
    const cached = imagesByPage[pageIndex];
    if (cached) return;

    const run = async () => {
      setLoadingImage(true);
      setErrorMsg("");

      try {
        // pageIndex: 0=1페이지, 1=2페이지, 2=3페이지
        let body = null;

        // 1페이지: 낙서 -> 동화풍(img2img)
        if (pageIndex === 0) {
          if (!drawingImage) {
            body = { prompt: currentScene.image_prompt };
          } else {
            body = {
              prompt: currentScene.image_prompt,
              init_image: drawingImage,
              denoising_strength: 0.55,
            };
          }
        }

        // 2페이지: 1페이지 주인공(heroImage) 기반 "살짝 변형"(img2img)
        if (pageIndex === 1) {
          const init = heroImage || imagesByPage[0] || drawingImage || "";
          if (!init) {
            body = { prompt: currentScene.image_prompt };
          } else {
            body = {
              prompt: currentScene.image_prompt,
              init_image: init,
              denoising_strength: 0.25,
            };
          }
        }

        // 3페이지: 새로 생성(txt2img)
        if (pageIndex === 2) {
          body = { prompt: currentScene.image_prompt };
        }

        if (!body) return;

        const data = await generateImage(body);
        const img = data?.image || "";

        if (img) {
          setImagesByPage((prev) => ({ ...prev, [pageIndex]: img }));

          if (pageIndex === 0) setHeroImage(img);
          if (pageIndex === 1) setHeroImage(img);
        }
      } catch (e) {
        const serverMsg =
          e?.response?.data?.error ||
          e?.response?.data?.detail ||
          e?.message ||
          "";
        setErrorMsg(`그림 생성 실패: ${serverMsg}`);
      } finally {
        setLoadingImage(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene, pageIndex, drawingImage, heroImage]);

  // ================== 인트로(로고 화면) ==================
  if (!label) {
    return (
      <div className="container">
        <h1 className="title title-row">
          <img className="title-logo" src="/images/logo.png" alt="로고" />
          매직 스케치북
        </h1>

        <div className="result-card fade-in" style={{ maxWidth: 820 }}>
          <div className="story-box">
            <img
              src="/images/magic_logo.png"
              alt="매직 스케치북 로고"
              style={{
                width: "100%",
                maxWidth: 760,
                display: "block",
                margin: "0 auto 14px auto",
                borderRadius: 16,
              }}
            />
            <p className="page" style={{ whiteSpace: "pre-line" }}>
              그림을 그리면 AI가 3페이지 동화책을 만들어줘요! ✨{"\n"}
              준비되면 아래 버튼을 눌러 시작해요.
            </p>
          </div>

          <button
            className="btn magic-btn"
            onClick={() => navigate("/draw")}
            style={{ marginTop: 18 }}
          >
            ✍️ 그림 그리러 가기
          </button>
        </div>
      </div>
    );
  }

  // ================== 화면 ==================
  const imgStyle = {
    width: "100%",
    height: "100%",
    maxHeight: 420,
    objectFit: "contain",
    borderRadius: 16,
    background: "rgba(255,255,255,0.6)",
    display: "block",
  };

  const pageImg = imagesByPage[pageIndex] || "";

  return (
    <div className="container">
      <h1 className="title">📖 {title || `${label}의 동화책`}</h1>

      <div className="result-card fade-in" style={{ maxWidth: 980 }}>
        {/* 1페이지: 원본 + 변환(2칸) */}
        {pageIndex === 0 ? (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div style={{ padding: 10, borderRadius: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>
                🖍️ 원본 낙서
              </div>
              <div style={{ width: "100%", height: 420 }}>
                {drawingImage ? (
                  <img src={drawingImage} alt="원본" style={imgStyle} />
                ) : (
                  <div
                    style={{
                      height: 420,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.8,
                    }}
                  >
                    ⚠️ 원본 낙서가 없어요
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: 10, borderRadius: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>
                ✨ 동화풍 변환(주인공)
              </div>
              <div style={{ width: "100%", height: 420 }}>
                {pageImg ? (
                  <img src={pageImg} alt="변환" style={imgStyle} />
                ) : (
                  <div
                    style={{
                      height: 420,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.8,
                    }}
                  >
                    {loadingImage ? "🎨 그림 만드는 중..." : "⚠️ 아직 생성 전"}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // 2~3페이지: 단일 그림
          <div style={{ width: "100%", height: 420 }}>
            {pageImg ? (
              <img src={pageImg} alt="story" style={imgStyle} />
            ) : (
              <div
                style={{
                  height: 420,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.8,
                }}
              >
                {loadingImage ? "🎨 그림 만드는 중..." : "⚠️ 아직 생성 전"}
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="result-card fade-in" style={{ marginTop: 12 }}>
            <h3>⚠️ 에러</h3>
            <p style={{ whiteSpace: "pre-line" }}>{errorMsg}</p>
          </div>
        )}

        <p
          className="page-text"
          style={{ whiteSpace: "pre-line", marginTop: 14 }}
        >
          {loadingStory ? "이야기 생성 중..." : currentText}
        </p>

        {/* ✅ TTS 버튼(스토리 페이지에 고정) */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginTop: 10,
          }}
        >
          <button
            type="button"
            className="btn"
            onClick={() => play(currentText)}
            disabled={loadingStory || loadingImage || ttsLoading}
          >
            {ttsLoading ? "읽는 중..." : "🔊 읽어줘"}
          </button>

          <button
            type="button"
            className="btn"
            onClick={stop}
            disabled={loadingStory || loadingImage}
          >
            ⏹ 정지
          </button>
        </div>

        {ttsError && (
          <p style={{ marginTop: 8, opacity: 0.8, whiteSpace: "pre-line" }}>
            {ttsError}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 12,
          }}
        >
          <button
            type="button"
            className="btn"
            disabled={pageIndex === 0 || loadingStory || loadingImage}
            onClick={() => {
              stop();
              setPageIndex((p) => p - 1);
            }}
          >
            이전
          </button>

          <div style={{ alignSelf: "center", opacity: 0.75 }}>
            {scenes?.length ? `${pageIndex + 1} / ${scenes.length}` : ""}
          </div>

          <button
            type="button"
            className="btn"
            disabled={
              pageIndex === scenes.length - 1 || loadingStory || loadingImage
            }
            onClick={() => {
              stop();
              setPageIndex((p) => p + 1);
            }}
          >
            다음
          </button>
        </div>

        <button
          type="button"
          className="btn magic-btn"
          onClick={() => {
            stop();
            navigate("/draw");
          }}
          disabled={loadingStory || loadingImage}
          style={{ marginTop: 12 }}
        >
          새 동화 만들기
        </button>
      </div>
    </div>
  );
}
