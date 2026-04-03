import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [type, setType] = useState("facil");
  const [level, setLevel] = useState("5primaria");
  const [lang, setLang] = useState("es");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdapt = async () => {
    if (!text) {
      alert(lang === "es" ? "Introduce texto" : "Introdueix text");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/adapt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, type, level }),
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <div style={pageStyle}>

      {/* HEADER */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.jpg" style={{ width: "45px" }} />
          <h2 style={{ margin: 0 }}>EducAdapt</h2>
        </div>

        <div>
          <button onClick={() => setLang("es")} style={btnLang}>🇪🇸</button>
          <button onClick={() => setLang("ca")} style={btnLang}>CAT</button>
        </div>
      </div>

      {/* CARD */}
      <div style={cardStyle}>

        <p style={{ textAlign: "center", color: "#555" }}>
          {lang === "es"
            ? "Adapta tus apuntes a cualquier necesidad educativa"
            : "Adapta els teus apunts a qualsevol necessitat educativa"}
        </p>

        {/* TEXTAREA */}
        <textarea
          rows="8"
          style={textareaStyle}
          placeholder={
            lang === "es"
              ? "Pega aquí tus apuntes..."
              : "Enganxa aquí els teus apunts..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <br /><br />

        {/* SELECTORES */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

          <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
            <option value="facil">Fácil</option>
            <option value="tdah">TDAH</option>
            <option value="dislexia">Dislexia</option>
            <option value="esquema">Esquema</option>
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value)} style={selectStyle}>
            <option value="5primaria">5º Primaria</option>
            <option value="6primaria">6º Primaria</option>
            <option value="1eso">1º ESO</option>
            <option value="2eso">2º ESO</option>
            <option value="3eso">3º ESO</option>
            <option value="4eso">4º ESO</option>
          </select>

        </div>

        <br />

        {/* BOTÓN */}
        <button onClick={handleAdapt} style={mainButton}>
          {loading
            ? (lang === "es" ? "Adaptando..." : "Adaptant...")
            : (lang === "es" ? "Adaptar" : "Adaptar")}
        </button>

        <p style={smallText}>
          {lang === "es"
            ? "Herramienta educativa impulsada por IA"
            : "Eina educativa impulsada per IA"}
        </p>

        <br />

        {/* RESULTADO */}
        {result && (
          <div style={resultBox}>
            <h3>{lang === "es" ? "Resultado:" : "Resultat:"}</h3>
            {result}
          </div>
        )}

      </div>
    </div>
  );
}

/* 🎨 ESTILOS PRO */

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
  marginBottom: "30px"
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
  border: "1px solid #ddd",
  fontSize: "15px"
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
  cursor: "pointer",
  fontWeight: "bold"
};

const resultBox = {
  background: "#f8fafc",
  padding: "20px",
  borderRadius: "12px",
  fontFamily: "monospace",
  whiteSpace: "pre-wrap",
  lineHeight: "1.7",
  border: "1px solid #e2e8f0"
};

const btnLang = {
  margin: "5px",
  padding: "6px 10px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer"
};

const smallText = {
  fontSize: "12px",
  color: "#888",
  textAlign: "center",
  marginTop: "10px"
};
