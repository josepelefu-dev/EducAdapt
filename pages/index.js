import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [type, setType] = useState("facil");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdapt = async () => {
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

  // 🔧 FORMATO ESQUEMA (SIN 👉)
  const formatResult = (text) => {
    if (!text) return "";

    return text
      .replace(/^- (.*)$/gm, "• $1")
      .replace(/├──/g, "↳")
      .replace(/│/g, " ");
  };

  // 🎨 COLORES PARA PALABRAS CLAVE
  const highlightKeywords = (text) => {
    if (!text) return "";

    return text.replace(/\b[A-ZÁÉÍÓÚÜÑ]{3,}\b/g, (word) => {
      return `<span style="color:#2563eb; font-weight:bold;">${word}</span>`;
    });
  };

  // 🎯 RESULTADO FINAL SEGÚN TIPO
  const getFinalResult = () => {
    const formatted = formatResult(result);

    if (type === "tdah" || type === "dislexia") {
      return highlightKeywords(formatted);
    }

    return formatted;
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

      <div
        style={{
          whiteSpace: "pre-wrap",
          marginTop: 20,
          padding: "20px",
          borderRadius: "10px",
          background: "#f8fafc",
          color: "black",
          lineHeight: "1.8"
        }}
        dangerouslySetInnerHTML={{ __html: getFinalResult() }}
      />

    </div>
  );
}
