import { useState, useEffect } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [type, setType] = useState("facil");
  const [level, setLevel] = useState("basico");
  const [mode, setMode] = useState("alumno");
  const [lang, setLang] = useState("es");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧠 CARGAR FUENTE DISLEXIA
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // 🌍 TRADUCCIONES
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
      error: "Introduce texto"
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
      error: "Introdueix text"
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
    } catch (error) {
      setResult("Error procesando");
    }

    setLoading(false);
  };

  // 🔧 FORMATO ESQUEMA (FLECHAS)
  const formatResult = (text) => {
    if (!text) return "";

    return text
      .replace(/^- (.*)$/gm, "• $1")
      .replace(/├──/g, "↳")
      .replace(/│/g, " ");
  };

  // 🎨 RESALTADO INTELIGENTE (TDAH / DISLEXIA)
  const highlightKeywords = (text) => {
  if (!text) return "";

  return text.replace(/\b\w{6,}\b/g, (word) => {
    return `<span style="
      color:#1d4ed8;
      font-weight:600;
      background:#e0f2fe;
      padding:2px 4px;
      border-radius:4px;
    ">${word}</span>`;
  });
};

  const getFinalResult = () => {
    const formatted = formatResult(result);

    if (type === "tdah" || type === "dislexia") {
      return highlightKeywords(formatted);
    }

    return formatted;
  };

  // 🎨 ESTILO RESULTADO
  const resultStyle = {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    whiteSpace: "pre-wrap",
    lineHeight: "1.8",
    border: "1px solid #e2e8f0",
    fontFamily: type === "dislexia" ? "OpenDyslexic, Arial" : "Arial",
    letterSpacing: type === "dislexia" ? "1px" : "normal",
    wordSpacing: type === "dislexia" ? "2px" : "normal"
  };

  return (
    <div style={pageStyle}>

      {/* HEADER */}
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

        <br /><br />

        {result && (
          <div
            style={resultStyle}
            dangerouslySetInnerHTML={{ __html: getFinalResult() }}
          />
        )}

      </div>

      <p style={legalText}>
        Esta herramienta es un apoyo educativo basado en IA y no sustituye diagnóstico profesional.
      </p>

    </div>
  );
}

/* 🎨 ESTILOS */

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
  padding: "20px",
  color: "white"
};

const headerStyle = {
  maxWidth: "900px",
  margin: "auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
};

const cardStyle = {
  maxWidth: "900px",
  margin: "auto",
  background: "white",
  color: "black",
  padding: "30px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
};

const textareaStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "10px",
  border: "1px solid #ddd",
};

const selectStyle = {
  padding: "10px",
  borderRadius: "8px"
};

const mainButton = {
  width: "100%",
  padding: "15px",
  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  cursor: "pointer"
};

const langBtn = {
  margin: "5px",
  padding: "6px 10px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer"
};

const legalText = {
  textAlign: "center",
  fontSize: "12px",
  marginTop: "20px",
  opacity: 0.7
};
