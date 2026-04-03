import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [type, setType] = useState("facil");
  const [level, setLevel] = useState("basico");
  const [mode, setMode] = useState("alumno");
  const [lang, setLang] = useState("es");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

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

    const res = await fetch("/api/adapt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, type, level, mode, lang })
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
          <img src="/logo.jpg" style={{ width: "50px" }} />
          <h2>{t.title}</h2>
        </div>

        <div>
          <button onClick={() => setLang("es")}>🇪🇸</button>
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

        <div style={{ display: "flex", gap: "10px" }}>

          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="facil">{t.resumen}</option>
            <option value="tdah">{t.tdah}</option>
            <option value="dislexia">{t.dislexia}</option>
            <option value="esquema">{t.esquema}</option>
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="basico">{t.basico}</option>
            <option value="intermedio">{t.intermedio}</option>
            <option value="avanzado">{t.avanzado}</option>
          </select>

          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="alumno">{t.alumno}</option>
            <option value="profesor">{t.profesor}</option>
          </select>

        </div>

        <br />

        <button onClick={handleAdapt}>
          {loading ? t.loading : t.adapt}
        </button>

        <h2>{t.result}:</h2>

        <div style={{ whiteSpace: "pre-wrap" }}>
          {result}
        </div>

      </div>

    </div>
  );
}

/* estilos básicos */

const pageStyle = {
  padding: "20px",
  background: "#0f172a",
  color: "white",
  minHeight: "100vh"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "20px"
};

const cardStyle = {
  background: "white",
  color: "black",
  padding: "20px",
  borderRadius: "10px"
};

const textareaStyle = {
  width: "100%",
  padding: "10px"
};
