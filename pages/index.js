import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [type, setType] = useState("facil");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdapt = async () => {
    setLoading(true);
    const res = await fetch("/api/adapt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, type }),
    });
    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  // 🔧 FORMATO ESQUEMA (CAMBIO 1)
  const formatResult = (text) => {
    if (!text) return "";

    return text
      .replace(/^- (.*)$/gm, "• $1")
      .replace(/├──/g, "↳")
      .replace(/│/g, " ");
  };

  // 🎨 COLORES PALABRAS CLAVE (CAMBIO 2)
  const highlightKeywords = (text) => {
    if (!text) return "";

    return text.replace(/\b[A-ZÁÉÍÓÚÜÑ]{3,}\b/g, (word) => {
      return `<span style="color:#2563eb; font-weight:bold;">${word}</span>`;
    });
  };

  // 🎯 RESULTADO FINAL (CAMBIO 3)
  const getFinalResult = () => {
    const formatted = formatResult(result);

    if (type === "tdah" || type === "dislexia") {
      return highlightKeywords(formatted);
    }

    return formatted;
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Adaptador de Apuntes 🧠</h1>

      <textarea
        rows="10"
        cols="60"
        placeholder="Pega aquí tus apuntes..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="facil">Fácil</option>
        <option value="tdah">TDAH</option>
        <option value="dislexia">Dislexia</option>
        <option value="esquema">Esquema</option>
      </select>

      <br /><br />

      <button onClick={handleAdapt}>
        {loading ? "Adaptando..." : "Adaptar"}
      </button>

      <h2>Resultado:</h2>

      {/* 🔥 SOLO CAMBIO AQUÍ */}
      <div
        style={{ whiteSpace: "pre-wrap", marginTop: 20 }}
        dangerouslySetInnerHTML={{ __html: getFinalResult() }}
      />
    </div>
  );
}
