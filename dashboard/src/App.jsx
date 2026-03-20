import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Nav      from "./components/Nav.jsx";
import Home     from "./pages/Home.jsx";
import Live     from "./pages/Live.jsx";
import Research from "./pages/Research.jsx";
import About    from "./pages/About.jsx";
import { C } from "./tokens.js";

// Inject Google Fonts
const link = document.createElement("link");
link.rel  = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap";
document.head.appendChild(link);

const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/"         element={<Home />}     />
          <Route path="/live"     element={<Live />}     />
          <Route path="/research" element={<Research />} />
          <Route path="/about"    element={<About />}    />
          <Route path="*"         element={<Home />}     />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'Inter', 'Outfit', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient gradient orbs */}
        <div style={{
          position: "fixed", top: "-20%", left: "-10%",
          width: "50vw", height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }}/>
        <div style={{
          position: "fixed", bottom: "-30%", right: "-15%",
          width: "60vw", height: "60vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }}/>
        <div style={{ position: "relative", zIndex: 1 }}>
          <Nav />
          <AnimatedRoutes />
        </div>
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${C.bg}; }
        a { color: inherit; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: #252545; border-radius: 3px; }
        ::selection { background: rgba(56,189,248,0.2); }
      `}</style>
    </BrowserRouter>
  );
}
