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
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // 🔊 MEJOR VOZ
  const getBestVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang.includes(lang === "ca" ? "ca" : "es")) || voices[0];
  };

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
    return formatResult(result)
      .split("\n")
      .filter(l => l.trim() !== "");
  };

  // 🔊 LECTURA MEJORADA
  const speakText = (startIndex = currentLine) => {
    const lines = getLines();
    let index = startIndex;

    const speakLine = () => {
      if (index >= lines.length) {
        setSpeaking(false);
        return;
      }

      setCurrentLine(index);

      const utterance = new SpeechSynthesisUtterance(lines[index]);
      utterance.voice = getBestVoice();
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onend = () => {
        if (!paused) {
          index++;
          speakLine();
        }
      };

      window.speechSynthesis.speak(utterance);

      // scroll automático
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

  const resultStyle = {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    whiteSpace: "pre-wrap",

    lineHeight:
      type === "dislexia" ? "1.3" :
      type === "tdah" ? "1.65" :
      "1.6",

    letterSpacing:
      type === "dislexia" ? "1px" :
      type === "tdah" ? "0.5px" :
      "normal",

    wordSpacing:
      type === "dislexia" ? "3px" :
      type === "tdah" ? "2px" :
      "normal",

    border: "1px solid #e2e8f0",
    fontFamily: type === "dislexia" ? "'OpenDyslexic', Arial, sans-serif" : "Arial",
    fontSize: "17px",
    color: "#111827"
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2>{t.title}</h2>

        <div>
          <button onClick={() => setLang("es")}>ES</button>
          <button onClick={() => setLang("ca")}>CAT</button>
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
          {t.guided}
        </button>

        {guidedMode && (
          <div>
            <button onClick={() => speakText()} style={mainButton}>{t.speak}</button>
            <button onClick={pauseSpeech} style={mainButton}>⏸</button>
            <button onClick={resumeSpeech} style={mainButton}>▶</button>
            <button onClick={stopSpeech} style={mainButton}>{t.stop}</button>
          </div>
        )}

        <br />

        {guidedMode && result && (
          <div style={resultStyle}>
            {getLines().map((line, i) => (
              <div
                key={i}
                ref={el => lineRefs.current[i] = el}
                onClick={() => speakText(i)}
                style={{
                  padding: "8px",
                  margin: "4px 0",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: i === currentLine ? "#dbeafe" : "transparent",
                  opacity: i === currentLine ? 1 : 0.4
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* estilos */
const pageStyle = { padding: "20px", background: "#0f172a", minHeight: "100vh", color: "white" };
const headerStyle = { display: "flex", justifyContent: "space-between" };
const cardStyle = { background: "white", padding: "20px", borderRadius: "10px", color: "black" };
const textareaStyle = { width: "100%", padding: "10px" };
const mainButton = { marginTop: "10px", width: "100%", padding: "10px" };
