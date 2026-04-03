import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [type, setType] = useState("facil");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚀 SUBIR A CLOUDINARY
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // ⚠️ IMPORTANTE: cambia esto por tu cloud_name
    formData.append("upload_preset", "unsigned_preset");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/EducAdapt/auto/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleAdapt = async () => {
    if (!text && !file) {
      alert("Introduce texto o archivo");
      return;
    }

    setLoading(true);

    let fileUrl = null;

    try {
      // 📄 si hay archivo → subir a cloudinary
      if (file) {
        fileUrl = await uploadFile(file);
      }

      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          type,
          fileUrl
        })
      });

      const data = await res.json();
      setResult(data.result);

    } catch (error) {
      setResult("Error procesando archivo");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>EducAdapt</h1>

      {/* TEXTAREA */}
      <textarea
        rows="10"
        cols="60"
        placeholder="Pega aquí tus apuntes..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      {/* SUBIDA ARCHIVOS */}
      <input
        type="file"
        accept=".pdf,.txt"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <p style={{ fontSize: "12px", color: "#666" }}>
        Puedes subir PDFs grandes sin límite
      </p>

      <br />

      {/* SELECT */}
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="facil">Fácil</option>
        <option value="tdah">TDAH</option>
        <option value="dislexia">Dislexia</option>
        <option value="esquema">Esquema</option>
      </select>

      <br /><br />

      {/* BOTÓN */}
      <button onClick={handleAdapt}>
        {loading ? "Procesando..." : "Adaptar"}
      </button>

      <h2>Resultado:</h2>

      <div style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
        {result}
      </div>
    </div>
  );
}
