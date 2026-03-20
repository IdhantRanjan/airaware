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
link.href = "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900;1,14..32,400&family=JetBrains+Mono:wght@400;500;700&display=swap";
document.head.appendChild(link);

const pageVariants = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit:     { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
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
        fontFamily: "'Inter', sans-serif",
      }}>
        <Nav />
        <AnimatedRoutes />
      </div>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: ${C.bg}; }
        a { color: inherit; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 3px; }
        ::selection { background: rgba(30,64,175,0.12); }
      `}</style>
    </BrowserRouter>
  );
}
