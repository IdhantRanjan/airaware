import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav      from "./components/Nav.jsx";
import Home     from "./pages/Home.jsx";
import Live     from "./pages/Live.jsx";
import Research from "./pages/Research.jsx";
import About    from "./pages/About.jsx";
import { C, T } from "./tokens.js";

// Inject Google Fonts once
const link = document.createElement("link");
link.rel  = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap";
document.head.appendChild(link);

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Outfit', sans-serif" }}>
        <Nav />
        <Routes>
          <Route path="/"         element={<Home />}     />
          <Route path="/live"     element={<Live />}     />
          <Route path="/research" element={<Research />} />
          <Route path="/about"    element={<About />}    />
          {/* Fallback */}
          <Route path="*"         element={<Home />}     />
        </Routes>
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${C.bg}; }
        a { color: inherit; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 3px; }
      `}</style>
    </BrowserRouter>
  );
}
