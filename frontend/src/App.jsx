import { Routes, Route } from "react-router-dom";
import DrawPage from "./pages/DrawPage.jsx";
import StoryPage from "./pages/StoryPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StoryPage />} />       {/* 인트로 */}
      <Route path="/draw" element={<DrawPage />} />    {/* 그림 */}
      <Route path="/story" element={<StoryPage />} />  {/* 동화 재생 */}
    </Routes>
  );
}
