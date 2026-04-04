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

  const lineRefs = useRef([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const link = document.createElement("link");
      link.href = "https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const translations = {
    es: {
      title: "EducAdapt",
      placeholder: "Pega aquí tus apuntes...",
      adapt: "Adaptar",
      loading: "Procesando...",
      alumno: "Alumno",
      profesor: "Profesor",
      resumen: "Resumen",
      tdah: "TDAH",
      dislexia: "Dislexia",
      esquema: "Esquema",
      basico: "🟢 Básico",
      intermedio: "🔵 Intermedio",
      avanzado: "🟣 Avanzado",
      error: "Introduce texto",
      guided: "Modo lectura guiada",
      normal: "Modo normal",
      auto: "Lectura automática",
      stop: "Detener",
      speak: "🔊 Escuchar",
      stopSpeak: "⏹ Parar",
      download: "⬇️ Descargar resultado",
      exportAudio: "🔊 Exportar audio",
      history: "💾 Historial"
    },
    ca: {
      title: "EducAdapt",
      placeholder: "Enganxa aquí els teus apunts...",
      adapt: "Adaptar",
      loading: "Processant...",
      alumno: "Alumne",
      profesor: "Professor",
      resumen: "Resum",
      tdah: "TDAH",
      dislexia: "Dislèxia",
      esquema: "Esquema",
      basico: "🟢 Bàsic",
      intermedio: "🔵 Intermedi",
      avanzado: "🟣 Avançat",
      error: "Introdueix text",
      guided: "Mode lectura guiada",
      normal: "Mode normal",
      auto: "Lectura automàtica",
      stop: "Aturar",
      speak: "🔊 Escoltar",
      stopSpeak: "⏹ Parar",
      download: "⬇️ Descarregar resultat",
      exportAudio: "🔊 Exportar àudio",
      history: "💾 Historial"
    }
  };

  const t = translations[lang];

  const handleAdapt = async () => {
    if (!text.trim()) {
      alert(t.error);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type, level, mode, lang })
      });

      const data = await res.json();
      setResult(data.result || "");
      setCurrentLine(0);

      // 🆕 guardar historial
      const history = JSON.parse(localStorage.getItem("history") || "[]");
      history.unshift(data.result);
      localStorage.setItem("history", JSON.stringify(history.slice(0, 10)));

    } catch {
      setResult("Error procesando");
    }

    setLoading(false);
  };

  const formatResult = (text) => {
    if (!text) return "";
    return text
      .replace(/^- (.*)$/gm, "• $1")
      .replace(/├──/g, "↳")
      .replace(/│/g, " ")
      .replace(/\. /g, ".\n\n");
  };

  const getLines = () => {
    return formatResult(result)
      .split("\n")
      .filter(l => l.trim() !== "");
  };

  const speakText = (startIndex = currentLine) => {
    if (!result || typeof window === "undefined") return;

    const lines = getLines();
    let index = startIndex;

    const speakLine = () => {
      if (index >= lines.length) {
        setSpeaking(false);
        return;
      }

      setCurrentLine(index);

      const utterance = new SpeechSynthesisUtterance(lines[index]);
      utterance.lang = lang === "ca" ? "ca-ES" : "es-ES";

      utterance.onend = () => {
        if (!paused) {
          index++;
          speakLine();
        }
      };

      window.speechSynthesis.speak(utterance);

      setTimeout(() => {
        lineRefs.current[index]?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 200);
    };

    window.speechSynthesis.cancel();
    setPaused(false);
    setSpeaking(true);
    speakLine();
  };

  const pauseSpeech = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const resumeSpeech = () => {
    window.speechSynthesis.resume();
    setPaused(false);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  // 🆕 export audio (seguro)
  const exportAudio = () => {
    if (!result) return;
    alert("⚠️ Exportación de audio real requiere backend.\n(Esto es placeholder seguro)");
  };

  // 🆕 mostrar historial
  const showHistory = () => {
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    alert(history.join("\n\n---\n\n") || "Sin historial");
  };

  const downloadResult = () => {
    if (!result) return;

    const blob = new Blob([formatResult(result)], {
      type: "text/plain;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "educadapt.txt";
    link.click();
  };

  const resultStyle = {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    whiteSpace: "pre-wrap",
    lineHeight: type === "dislexia" ? "1.25" : type === "tdah" ? "1.65" : "1.6",
    letterSpacing: type === "dislexia" ? "1px" : "normal",
    fontFamily: type === "dislexia" ? "OpenDyslexic, Arial" : "Arial",
    color: "#111827"
  };

  return (
    <div style={pageStyle}>

      {/* 🆕 ZONA NUEVA (NO TOCA LO DEMÁS) */}
      <div style={{ position: "fixed", top: 20, right: 20, display: "flex", flexDirection: "column", gap: "10px" }}>
        <button onClick={exportAudio} style={{ background: "#10b981", color: "white", padding: "10px", borderRadius: "10px", border: "none" }}>
          {t.exportAudio}
        </button>

        <button onClick={showHistory} style={{ background: "#f59e0b", color: "white", padding: "10px", borderRadius: "10px", border: "none" }}>
          {t.history}
        </button>
      </div>

      {/* TODO LO DEMÁS EXACTAMENTE IGUAL */}

      <div style={headerStyle}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <img src="/logo.jpg" style={{ width: "50px" }} />
          <h2>{t.title}</h2>
        </div>

        <div>
          <button onClick={() => setLang("es")} style={langBtn}>ES</button>
          <button onClick={() => setLang("ca")} style={langBtn}>CAT</button>
        </div>
      </div>

      <div style={cardStyle}>
        <textarea rows="8" style={textareaStyle} placeholder={t.placeholder} value={text} onChange={(e) => setText(e.target.value)} />

        <br /><br />

        <button onClick={handleAdapt} style={mainButton}>
          {loading ? t.loading : t.adapt}
        </button>

        {result && (
          <button onClick={downloadResult} style={{ marginTop: "10px", background: "#0ea5e9", ...mainButton }}>
            {t.download}
          </button>
        )}

        <br /><br />

        <div style={resultStyle}>{formatResult(result)}</div>
      </div>
    </div>
  );
}

/* estilos */
const pageStyle = { minHeight: "100vh", background: "#0f172a", padding: "20px", color: "white" };
const headerStyle = { maxWidth: "900px", margin: "auto", display: "flex", justifyContent: "space-between" };
const cardStyle = { maxWidth: "900px", margin: "auto", background: "white", padding: "30px", borderRadius: "20px" };
const textareaStyle = { width: "100%", padding: "15px", borderRadius: "10px" };
const mainButton = { width: "100%", padding: "15px", background: "#6366f1", color: "white", border: "none" };
const langBtn = { margin: "5px" };
