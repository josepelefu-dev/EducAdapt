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

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Adaptador de Apuntes 🧠</h1>
      <textarea rows="10" cols="60" placeholder="Pega aquí tus apuntes..." value={text} onChange={(e) => setText(e.target.value)} />
      <br /><br />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="facil">Fácil</option>
        <option value="tdah">TDAH</option>
        <option value="dislexia">Dislexia</option>
      </select>
      <br /><br />
      <button onClick={handleAdapt}>{loading ? "Adaptando..." : "Adaptar"}</button>
      <h2>Resultado:</h2>
      <div style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>{result}</div>
    </div>
  );
}