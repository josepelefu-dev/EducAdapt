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

  // ✅ HISTORIAL
  const [history, setHistory] = useState([]);

  const lineRefs = useRef([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const link = document.createElement("link");
      link.href = "https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);

      // cargar historial
      const saved = localStorage.getItem("educadapt_history");
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch {
          setHistory([]);
        }
      }
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
      resume: "▶ Reanudar",
      download: "⬇️ Descargar resultado",
      history: "📚 Historial",
      save: "💾 Guardar en historial",
      pdf: "📄 Exportar PDF"
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
      resume: "▶ Reprendre",
      download: "⬇️ Descarregar resultat",
      history: "📚 Historial",
      save: "💾 Guardar al historial",
      pdf: "📄 Exportar PDF"
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

  // ✅ FIX HISTORIAL
  const saveToHistory = () => {
    if (!result) {
      alert("Primero genera un resultado");
      return;
    }

    const newEntry = {
      text,
      result,
      date: Date.now()
    };

    const updated = [newEntry, ...history].slice(0, 10);

    setHistory(updated);
    localStorage.setItem("educadapt_history", JSON.stringify(updated));
  };

  const loadFromHistory = (item) => {
    setText(item.text);
    setResult(item.result);
    setCurrentLine(0);
  };

  const exportPDF = () => {
    const win = window.open("", "_blank");
    win.document.write(`<pre>${formatResult(result)}</pre>`);
    win.document.close();
    win.print();
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
    lineHeight: type === "dislexia" ? "1.25" : type === "tdah" ? "1.65" : "1.6",
    letterSpacing: type === "dislexia" ? "1px" : "normal",
    fontFamily: type === "dislexia" ? "OpenDyslexic, Arial" : "Arial",
    color: "#111827"
  };

  return (
    <div style={pageStyle}>

      {/* ✅ HISTORIAL VISIBLE */}
      {history.length > 0 && (
        <div style={{
          maxWidth: "900px",
          margin: "auto",
          marginBottom: "20px",
          background: "white",
          padding: "15px",
          borderRadius: "12px",
          color: "#111"
        }}>
          <h3>{t.history}</h3>

          {history.map((item, i) => (
            <div
              key={i}
              onClick={() => loadFromHistory(item)}
              style={{
                cursor: "pointer",
                padding: "8px",
                borderBottom: "1px solid #ddd"
              }}
            >
              {item.text.slice(0, 80)}...
            </div>
          ))}
        </div>
      )}

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
