import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [type, setType] = useState("facil");
  const [level, setLevel] = useState("basico");
  const [mode, setMode] = useState("alumno");
  const [lang, setLang] = useState("es"); // 🟢 idioma
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdapt = async () => {
    if (!text.trim()) {
      alert("Introduce texto");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, type, mode, level, lang })
      });

      const data = await res.json();
      setResult(data.result);

    } catch (error) {
      setResult("Error procesando");
    }

    setLoading(false);
  };

  const formatResult = (text) => {
    if (!text) return "";

    return text
      .replace(/^- (.*)$/gm, "🔹 $1")
      .replace(/├──/g, "👉")
      .replace(/│/g, "");
  };

  return (
    <div style={pageStyle}>

      {/* HEADER CON LOGO + IDIOMA */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.jpg" style={{ width: "50px" }} />
          <h2 style={{ margin: 0 }}>EducAdapt</h2>
        </div>

        {/* 🌍 IDIOMAS */}
        <div>
          <button onClick={() => setLang("es")} style={langBtn}>🇪🇸</button>
          <button onClick={() => setLang("ca")} style={langBtn}>CAT</button>
        </div>
      </div>

      <div style={cardStyle}>

        <textarea
          rows="8"
          style={textareaStyle}
          placeholder="Pega aquí tus apuntes..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <br /><br />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

          <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
            <option value="facil">Resumen</option>
            <option value="tdah">TDAH</option>
            <option value="dislexia">Dislexia</option>
            <option value="esquema">Esquema</option>
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value)} style={selectStyle}>
            <option value="basico">🟢 Básico</option>
            <option value="intermedio">🔵 Intermedio</option>
            <option value="avanzado">🟣 Avanzado</option>
          </select>

          <select value={mode} onChange={(e) => setMode(e.target.value)} style={selectStyle}>
            <option value="alumno">Alumno</option>
            <option value="profesor">Profesor</option>
          </select>

        </div>

        <br />

        <button onClick={handleAdapt} style={mainButton}>
          {loading ? "Procesando..." : "Adaptar"}
        </button>

        <br /><br />

        {result && (
          <div style={resultBox}>
            {formatResult(result)}
          </div>
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
  borderRadius: "12px",
  border: "1px solid #ddd"
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

const resultBox = {
  background: "#f8fafc",
  padding: "20px",
  borderRadius: "12px",
  whiteSpace: "pre-wrap",
  lineHeight: "1.8",
  border: "1px solid #e2e8f0"
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
