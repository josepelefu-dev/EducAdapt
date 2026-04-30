import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [type, setType] = useState("facil");
  const [level, setLevel] = useState("basico");
  const [mode, setMode] = useState("alumno");
  const [lang, setLang] = useState("es");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [guidedMode, setGuidedMode] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(2000);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  // 🔒 NUEVO
  const userId = "demo-user";
  const [isPro, setIsPro] = useState(false);

  const lineRefs = useRef([]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleAdapt = async () => {
    if (!text.trim()) {
      alert("Introduce texto");
      return;
    }

    // 🔒 BLOQUEO PRO
    if (!isPro && level === "avanzado") {
      alert("Nivel avanzado es PRO 🚀");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type, level, mode, lang, userId })
      });

      const data = await res.json();

      if (data.paywall) {
        alert("Has alcanzado el límite gratuito. Pásate a PRO 🚀");
        setLoading(false);
        return;
      }

      setResult(data.result || "");
      setCurrentLine(0);

    } catch {
      setResult("Error");
    }

    setLoading(false);
  };

  const exportPDF = () => {
    if (!isPro) {
      alert("Exportar PDF es PRO 🚀");
      return;
    }

    if (!result) return;

    const formatted = result.replace(/\n/g, "<br>");

    const win = window.open("", "_blank");
    win.document.write(`<html><body>${formatted}</body></html>`);
    win.document.close();

    setTimeout(() => win.print(), 300);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>EducAdapt</h1>

      <textarea
        rows="8"
        style={{ width: "100%" }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <select value={level} onChange={(e) => setLevel(e.target.value)}>
        <option value="basico">Básico</option>
        <option value="intermedio">Intermedio</option>
        <option value="avanzado">Avanzado 🔒</option>
      </select>

      <br /><br />

      <button onClick={handleAdapt}>
        {loading ? "Procesando..." : "Adaptar"}
      </button>

      <button
        onClick={() => setIsPro(true)}
        style={{ marginLeft: "10px", background: "green", color: "white" }}
      >
        Activar PRO (demo)
      </button>

      <button onClick={exportPDF} style={{ marginLeft: "10px" }}>
        Exportar PDF 🔒
      </button>

      <br /><br />

      <div style={{ whiteSpace: "pre-wrap" }}>
        {result}
      </div>
    </div>
  );
}
