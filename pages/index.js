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

  // 🆕 AUTO LECTURA
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(2000);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // 🆕 EFECTO AUTOMÁTICO
  useEffect(() => {
    if (!autoPlay || !guidedMode) return;

    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        const lines = getLines();
        if (prev < lines.length - 1) return prev + 1;
        return prev;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [autoPlay, speed, guidedMode, result]);

  const translations = {
    es: {
      title: "EducAdapt",
      placeholder: "Pega aquí tus apuntes...",
      adapt: "Adaptar",
      loading: "Procesando...",
      result: "Resultado",
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
      next: "Siguiente →",
      prev: "← Anterior",
      auto: "Lectura automática",
      stop: "Detener"
    },
    ca: {
      title: "EducAdapt",
      placeholder: "Enganxa aquí els teus apunts...",
      adapt: "Adaptar",
      loading: "Processant...",
      result: "Resultat",
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
      next: "Següent →",
      prev: "← Anterior",
      auto: "Lectura automàtica",
      stop: "Aturar"
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
      setResult(data.result);
      setCurrentLine(0);
    } catch (error) {
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

  const resultStyle = {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    whiteSpace: "pre-wrap",
    lineHeight: "2",
    border: "1px solid #e2e8f0",
    fontFamily: type === "dislexia" ? "OpenDyslexic, Arial" : "Arial",
    letterSpacing: type === "dislexia" ? "1px" : "normal",
    wordSpacing: type === "dislexia" ? "2px" : "normal",
    fontSize: "17px"
  };

  return (
    <div style={pageStyle}>

      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.jpg" style={{ width: "50px" }} />
          <h2 style={{ margin: 0 }}>{t.title}</h2>
        </div>

        <div>
          <button onClick={() => setLang("es")} style={langBtn}>🇪🇸</button>
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

        {/* GUIADO */}
        <button
          onClick={() => {
            setGuidedMode(!guidedMode);
            setCurrentLine(0);
          }}
          style={{ marginTop: "10px", ...mainButton }}
        >
          {guidedMode ? t.normal : t.guided}
        </button>

        {/* AUTO */}
        {guidedMode && (
          <>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              style={{ marginTop: "10px", background: "#f59e0b", ...mainButton }}
            >
              {autoPlay ? t.stop : t.auto}
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
          </>
        )}

        <br /><br />

        {/* NORMAL */}
        {result && !guidedMode && (
          <div style={resultStyle}>
            {formatResult(result)}
          </div>
        )}

        {/* GUIADO */}
        {result && guidedMode && (
          <div style={{ ...resultStyle, textAlign: "center" }}>
            <div style={{
              fontSize: "22px",
              fontWeight: "600",
              background: "#e0f2fe",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px"
            }}>
              {getLines()[currentLine]}
            </div>
          </div>
        )}

      </div>

      <p style={legalText}>
        Esta herramienta es un apoyo educativo basado en IA y no sustituye diagnóstico profesional.
      </p>

    </div>
  );
}
