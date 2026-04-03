import { useState, useEffect } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [type, setType] = useState("facil");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧠 CARGAR FUENTE DISLEXIA
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleAdapt = async () => {
    if (!text.trim()) {
      alert("Introduce texto");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type }),
      });

      const data = await res.json();
      setResult(data.result);
    } catch (error) {
      setResult("Error procesando");
    }

    setLoading(false);
  };

  // 🎨 ESTILO DINÁMICO SEGÚN TIPO
  const resultStyle = {
    whiteSpace: "pre-wrap",
    marginTop: 20,
    padding: "20px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #ddd",
    lineHeight: "1.8",
    fontFamily: type === "dislexia" ? "OpenDyslexic, Arial" : "Arial",
    letterSpacing: type === "dislexia" ? "1px" : "normal",
    wordSpacing: type === "dislexia" ? "2px" : "normal"
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial", background: "#0f172a", color: "white", minHeight: "100vh" }}>

      <h1>EducAdapt 🧠</h1>

      <textarea
        rows="10"
        style={{ width: "100%", padding: "15px", borderRadius: "10px" }}
        placeholder="Pega aquí tus apuntes..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: "10px", borderRadius: "8px" }}>
        <option value="facil">Resumen</option>
        <option value="tdah">TDAH</option>
        <option value="dislexia">Dislexia</option>
        <option value="esquema">Esquema</option>
      </select>

      <br /><br />

      <button
        onClick={handleAdapt}
        style={{
          padding: "12px 20px",
          borderRadius: "10px",
          border: "none",
          background: "#6366f1",
          color: "white",
          cursor: "pointer"
        }}
      >
        {loading ? "Procesando..." : "Adaptar"}
      </button>

      <h2 style={{ marginTop: 30 }}>Resultado:</h2>

      <div style={resultStyle}>
        {result}
      </div>

    </div>
  );
}
