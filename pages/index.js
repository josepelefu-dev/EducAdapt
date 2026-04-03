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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, type, level }),
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: "800px",
      margin: "auto",
      padding: "30px",
      fontFamily: "Arial",
      background: "#f5f7fb"
    }}>
      
      <h1 style={{ textAlign: "center" }}>
        🧠 EducAdapt
      </h1>

      {/* IDIOMA */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <button onClick={() => setLang("es")}>🇪🇸 Español</button>
        <button onClick={() => setLang("ca")}>Català</button>
      </div>

      <p style={{ textAlign: "center", color: "#666" }}>
        {lang === "es"
          ? "Adapta tus apuntes a cualquier necesidad educativa"
          : "Adapta els teus apunts a qualsevol necessitat educativa"}
      </p>

      <textarea
        rows="8"
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #ccc"
        }}
        placeholder={
          lang === "es"
            ? "Pega aquí tus apuntes..."
            : "Enganxa aquí els teus apunts..."
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <div style={{ display: "flex", gap: "10px" }}>

        {/* Tipo */}
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="facil">Fácil</option>
          <option value="tdah">TDAH</option>
          <option value="dislexia">Dislexia</option>
          <option value="esquema">Esquema</option>
        </select>

        {/* Nivel */}
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="5primaria">5º Primaria</option>
          <option value="6primaria">6º Primaria</option>
          <option value="1eso">1º ESO</option>
          <option value="2eso">2º ESO</option>
          <option value="3eso">3º ESO</option>
          <option value="4eso">4º ESO</option>
        </select>

      </div>

      <br />

      <button
        onClick={handleAdapt}
        style={{
          width: "100%",
          padding: "12px",
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        {loading
          ? (lang === "es" ? "Adaptando..." : "Adaptant...")
          : (lang === "es" ? "Adaptar" : "Adaptar")}
      </button>

      <br /><br />

      {result && (
        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
          lineHeight: "1.6"
        }}>
          <h3>{lang === "es" ? "Resultado:" : "Resultat:"}</h3>
          {result}
        </div>
      )}
    </div>
  );
}
