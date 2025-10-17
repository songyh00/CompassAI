import { Outlet } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";
import "./App.css";

export default function App() {
    return (
        <div className="app">
            <Header />

            {/* 메인 콘텐츠 영역 */}
            <main className="main" role="main">
                <div className="container">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
}
