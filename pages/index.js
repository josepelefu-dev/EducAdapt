import { useState, useEffect } from "react";

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

  // Fuente dislexia
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
      stopSpeak: "⏹ Parar"
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
      stopSpeak: "⏹ Parar"
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
    if (!result) return [];
    return formatResult(result).split("\n").filter(l => l.trim() !== "");
  };

  const speakText = () => {
    if (typeof window === "undefined") return;
    if (!result) return;

    const textToRead = guidedMode
      ? getLines()[currentLine]
      : formatResult(result);

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = lang === "ca" ? "ca-ES" : "es-ES";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
  };

  const stopSpeech = () => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  useEffect(() => {
    if (!autoPlay || !guidedMode) return;

    const interval = setInterval(() => {
      setCurrentLine(prev => {
        const lines = getLines();
        return prev < lines.length - 1 ? prev + 1 : prev;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [autoPlay, speed, guidedMode, result]);

  const resultStyle = {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    whiteSpace: "pre-wrap",
    lineHeight: "2",
    border: "1px solid #e2e8f0",
    fontFamily: type === "dislexia" ? "OpenDyslexic, Arial" : "Arial"
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={{ display: "flex", gap: "10px" }}>
          <img src="/logo.jpg" width="50" />
          <h2>{t.title}</h2>
        </div>

        <div>
          <button onClick={() => setLang("es")} style={langBtn}>ES</button>
          <button onClick={() => setLang("ca")} style={langBtn}>CAT</button>
        </div>
      </div>

      <div style={cardStyle}>

        <textarea
          rows="8"
          style={textareaStyle}
          placeholder={t.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <br /><br />

        <button onClick={handleAdapt} style={mainButton}>
          {loading ? t.loading : t.adapt}
        </button>

        <button onClick={() => setGuidedMode(!guidedMode)} style={mainButton}>
          {guidedMode ? t.normal : t.guided}
        </button>

        {guidedMode && (
          <div>
            <button onClick={() => setAutoPlay(!autoPlay)} style={mainButton}>
              {autoPlay ? t.stop : t.auto}
            </button>

            <button onClick={speakText} style={mainButton}>
              {t.speak}
            </button>

            <button onClick={stopSpeech} style={mainButton}>
              {t.stopSpeak}
            </button>
          </div>
        )}

        <br /><br />

        {!guidedMode && result && (
          <div style={resultStyle}>{formatResult(result)}</div>
        )}

        {guidedMode && result && (
          <div style={resultStyle}>
            {getLines()[currentLine] || ""}
          </div>
        )}

      </div>
    </div>
  );
}

/* estilos */

const pageStyle = { padding: 20 };
const headerStyle = { display: "flex", justifyContent: "space-between" };
const cardStyle = { background: "white", padding: 20 };
const textareaStyle = { width: "100%" };
const mainButton = { marginTop: 10 };
const langBtn = { margin: 5 };
