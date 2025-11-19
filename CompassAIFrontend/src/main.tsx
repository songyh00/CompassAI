// src/main.tsx 또는 src/index.tsx (프로젝트 구조에 맞춰 파일명 사용)

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.tsx";
import Home from "./pages/Home/Home.tsx";
import Login from "./pages/Auth/Login/Login.tsx";
import Signup from "./pages/Auth/Signup/Signup.tsx";
import HelpCenter from "./pages/Help/HelpCenter";
import SubmitToolPage from "./pages/Submit/SubmitToolPage.tsx";
import AdminToolReview from "./pages/Admin/AdminToolReview.tsx"; // ✅ 관리자 페이지
import "./index.css";
// src/main.tsx
import MyPage from "@/pages/mypage/MyPage";

/* 루트 렌더링 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 레이아웃 라우트(App 안에 <Outlet/> 포함) */}
        <Route path="/" element={<App />}>
          {/* 인덱스 라우트 = "/" */}
          <Route index element={<Home />} />
          {/* 인증/기타 페이지 */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="submit" element={<SubmitToolPage />} />
          {/* ✅ 관리자: AI 등록 검수 페이지 */}
          <Route path="admin/tools/review" element={<AdminToolReview />} />
          // 예시
          <Route path="/mypage" element={<MyPage />} />
          {/* 404 */}
          <Route
            path="*"
            element={<div style={{ padding: 24 }}>404 - Page Not Found</div>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
