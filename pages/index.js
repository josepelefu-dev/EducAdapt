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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      color: "white",
      padding: "20px"
    }}>

      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img 
  src="/logo.jpg?v=1" 
  alt="EducAdapt Logo"
  style={{ width: "140px" }}
/>
        <h1 style={{ margin: 0 }}>EducAdapt</h1>

        {/* IDIOMA */}
        <div style={{ marginTop: "10px" }}>
          <button onClick={() => setLang("es")} style={btnLang}>🇪🇸</button>
          <button onClick={() => setLang("ca")} style={btnLang}>CAT</button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{
        maxWidth: "800px",
        margin: "auto",
        background: "#ffffff",
        color: "#000",
        padding: "20px",
        borderRadius: "15px"
      }}>

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

        <br /><br />

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

/* 🎨 ESTILOS */

const textareaStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

const selectStyle = {
  padding: "10px",
  borderRadius: "8px"
};

const mainButton = {
  width: "100%",
  padding: "14px",
  background: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  cursor: "pointer"
};

const resultBox = {
  background: "#f9fafb",
  padding: "20px",
  borderRadius: "10px",
  fontFamily: "monospace",
  whiteSpace: "pre-wrap",
  lineHeight: "1.6"
};

const btnLang = {
  margin: "5px",
  padding: "6px 10px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer"
};
