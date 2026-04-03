import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [type, setType] = useState("facil");
  const [level, setLevel] = useState("5primaria");
  const [lang, setLang] = useState("es");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdapt = async () => {
    if (!text.trim() && !file) {
      alert(lang === "es" ? "Introduce texto o archivo" : "Introdueix text o arxiu");
      return;
    }

    setLoading(true);

    let fileData = null;

    if (file) {
      const base64 = await toBase64(file);
      fileData = {
        data: base64.split(",")[1],
        type: file.type
      };
    }

    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          type,
          level,
          file: fileData
        })
      });

      const data = await res.json();
      setResult(data.result);

    } catch (error) {
      setResult(lang === "es" ? "Error procesando" : "Error processant");
    }

    setLoading(false);
  };

  return (
    <div style={pageStyle}>

      {/* HEADER */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.jpg" style={{ width: "45px" }} />
          <h2>EducAdapt</h2>
        </div>

        <div>
          <button onClick={() => setLang("es")} style={btnLang}>🇪🇸</button>
          <button onClick={() => setLang("ca")} style={btnLang}>CAT</button>
        </div>
      </div>

      {/* CARD */}
      <div style={cardStyle}>

        <textarea
          rows="6"
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

        {/* SUBIDA ARCHIVOS */}
        <input
          type="file"
          accept=".txt,.pdf"
          onChange={(e) => setFile(e.target.files[0])}
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
            ? (lang === "es" ? "Procesando..." : "Processant...")
            : (lang === "es" ? "Adaptar" : "Adaptar")}
        </button>

        <br /><br />

        {/* RESULTADO */}
        {result && (
          <div style={resultBox}>
            {result}
          </div>
        )}

      </div>

      {/* AVISO */}
      <p style={legalText}>
        {lang === "es"
          ? "Esta herramienta no sustituye diagnóstico profesional."
          : "Aquesta eina no substitueix diagnòstic professional."}
      </p>

    </div>
  );
}

/* 🔧 FUNCIONES */

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

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
  padding: "25px",
  borderRadius: "15px"
};

const textareaStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc"
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
  background: "#f1f5f9",
  padding: "20px",
  borderRadius: "10px",
  whiteSpace: "pre-wrap"
};

const btnLang = {
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
