import { useState, useEffect } from "react";
import jsPDF from "jspdf";

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

  // idioma persistente
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  // fuente dislexia
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
      .replace(/\.\s/g, ".\n");
  };

  const getLines = () => {
    if (!result) return [];
    return formatResult(result)
      .split("\n")
      .filter((l) => l.trim() !== "");
  };

  // VOZ
  const speakText = () => {
    if (!result || typeof window === "undefined") return;

    const lines = getLines();
    let index = 0;

    const speakLine = () => {
      if (index >= lines.length) {
        setSpeaking(false);
        return;
      }

      setCurrentLine(index);

      const utterance = new SpeechSynthesisUtterance(lines[index]);
      utterance.lang = lang === "ca" ? "ca-ES" : "es-ES";

      utterance.onend = () => {
        index++;
        speakLine();
      };

      window.speechSynthesis.speak(utterance);
    };

    window.speechSynthesis.cancel();
    setSpeaking(true);
    speakLine();
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // AUTO
  useEffect(() => {
    if (!autoPlay || !guidedMode) return;

    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        const lines = getLines();
        return prev < lines.length - 1 ? prev + 1 : prev;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [autoPlay, speed, guidedMode, result]);

  // TXT
  const downloadResult = () => {
    if (!result) return;

    const content = formatResult(result);

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `educadapt-${type}-${level}.txt`;
    link.click();
  };

  // PDF PRO
  const downloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    const margin = 15;
    const maxWidth = 180;

    const content = formatResult(result);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("EducAdapt", margin, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Tipo: ${type} | Nivel: ${level}`, margin, 28);

    doc.line(margin, 32, 200 - margin, 32);

    doc.setFontSize(12);

    const lines = doc.splitTextToSize(content, maxWidth);

    let y = 40;

    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 7;
    });

    doc.save(`educadapt-${type}-${level}.pdf`);
  };

  const resultStyle = {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    whiteSpace: "pre-wrap",
    lineHeight: type === "dislexia" ? "1.25" : type === "tdah" ? "1.3" : "1.5",
    border: "1px solid #e2e8f0",
    fontFamily: type === "dislexia" ? "OpenDyslexic, Arial" : "Arial",
    fontSize: "17px"
  };

  return (
    <div style={pageStyle}>
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
        <textarea
          rows="8"
          style={textareaStyle}
          placeholder={t.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <br /><br />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
            <option value="facil">{t.resumen}</option>
            <option value="tdah">{t.tdah}</option>
            <option value="dislexia">{t.dislexia}</option>
            <option value="esquema">{t.esquema}</option>
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value)} style={selectStyle}>
            <option value="basico">{t.basico}</option>
            <option value="intermedio">{t.intermedio}</option>
            <option value="avanzado">{t.avanzado}</option>
          </select>

          <select value={mode} onChange={(e) => setMode(e.target.value)} style={selectStyle}>
            <option value="alumno">{t.alumno}</option>
            <option value="profesor">{t.profesor}</option>
          </select>
        </div>

        <br />

        <button onClick={handleAdapt} style={mainButton}>
          {loading ? t.loading : t.adapt}
        </button>

        <button onClick={downloadResult} style={{ marginTop: "10px", background: "#0ea5e9", ...mainButton }}>
          {t.download}
        </button>

        <button onClick={downloadPDF} style={{ marginTop: "10px", background: "#16a34a", ...mainButton }}>
          📄 PDF PRO
        </button>

        <button
          onClick={() => {
            setGuidedMode(!guidedMode);
            setCurrentLine(0);
          }}
          style={{ marginTop: "10px", ...mainButton }}
        >
          {guidedMode ? t.normal : t.guided}
        </button>

        {guidedMode && (
          <div>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              style={{
                marginTop: "10px",
                background: autoPlay ? "#ef4444" : "#f59e0b",
                ...mainButton
              }}
            >
              {autoPlay ? "⏹ Stop auto" : "▶️ Auto"}
            </button>

            <button onClick={speakText} style={{ marginTop: "10px", background: "#10b981", ...mainButton }}>
              {t.speak}
            </button>

            <button onClick={stopSpeech} style={{ marginTop: "10px", background: "#ef4444", ...mainButton }}>
              {t.stopSpeak}
            </button>

            <input
              type="range"
              min="1000"
              max="5000"
              step="500"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ width: "100%", marginTop: "10px" }}
            />
          </div>
        )}

        <br /><br />

        {!guidedMode && result && (
          <div style={resultStyle}>{formatResult(result)}</div>
        )}

        {guidedMode && result && (
          <div style={resultStyle}>
            {(getLines() || []).map((line, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  margin: "6px 0",
                  borderRadius: "8px",
                  background: index === currentLine ? "#dbeafe" : "transparent"
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}

      </div>

      <p style={legalText}>
        Esta herramienta es un apoyo educativo basado en IA y no sustituye diagnóstico profesional.
      </p>
    </div>
  );
}

/* estilos iguales */
