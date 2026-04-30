import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [type, setType] = useState("facil");
  const [level, setLevel] = useState("basico");
  const [mode, setMode] = useState("alumno");
  const [lang, setLang] = useState("es");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [guidedMode, setGuidedMode] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(2000);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  const lineRefs = useRef([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const link = document.createElement("link");
      link.href =
        "https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const handleFileUpload = (file) => {
    if (!file) return;
    const extension = file.name.split(".").pop().toLowerCase();
    if (extension !== "txt") {
      alert("Solo se permite .txt por ahora");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setText(e.target.result);
    reader.readAsText(file);
  };

  const generateSmartSchema = (text) => {
    if (!text) return "";
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 20);

    let schema = "";

    if (lines[0]) {
      schema += `📌 ${lines[0].toUpperCase()}\n`;
    }

    lines.slice(1, 6).forEach((line, i) => {
      const short = line.split(" ").slice(0, 3).join(" ");
      if (i % 2 === 0) {
        schema += `↳ ${short}\n`;
      } else {
        schema += `   ↳ ${short}\n`;
      }
    });

    return schema;
  };

  const translations = {
    es: {
      title: "EducAdapt",
      placeholder: "Pega aquí tus apuntes...",
      adapt: "Adaptar",
      loading: "Procesando...",
      alumno: "Alumno",
      profesor: "Profesor",
      resumen: "Resumen",
      tdah: "TDAH",
      dislexia: "Dislexia",
      esquema: "Esquema",
      basico: "🟢 Básico",
      intermedio: "🔵 Intermedio",
      avanzado: "🟣 Avanzado",
      error: "Introduce texto",
      guided: "Modo lectura guiada",
      normal: "Modo normal",
      auto: "Lectura automática",
      stop: "Detener",
      speak: "🔊 Escuchar",
      stopSpeak: "⏹ Parar",
      resume: "▶ Reanudar",
      download: "⬇️ Descargar resultado",
      pdf: "📄 Exportar PDF",
      file: "Seleccionar archivo .txt"
    },
    ca: {
      title: "EducAdapt",
      placeholder: "Enganxa aquí els teus apunts...",
      adapt: "Adaptar",
      loading: "Processant...",
      alumno: "Alumne",
      profesor: "Professor",
      resumen: "Resum",
      tdah: "TDAH",
      dislexia: "Dislèxia",
      esquema: "Esquema",
      basico: "🟢 Bàsic",
      intermedio: "🔵 Intermedi",
      avanzado: "🟣 Avançat",
      error: "Introdueix text",
      guided: "Mode lectura guiada",
      normal: "Mode normal",
      auto: "Lectura automàtica",
      stop: "Aturar",
      speak: "🔊 Escoltar",
      stopSpeak: "⏹ Parar",
      resume: "▶ Reprendre",
      download: "⬇️ Descarregar resultat",
      pdf: "📄 Exportar PDF",
      file: "Seleccionar fitxer .txt"
    }
  };

  const t = translations[lang];

  const handleAdapt = async () => {
    if (!text.trim()) {
      alert(t.error);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type, level, mode, lang })
      });
      const data = await res.json();
      let finalResult = data.result || "";

      setResult(finalResult);
      setCurrentLine(0);
    } catch {
      setResult("Error procesando");
    }
    setLoading(false);
  };

  // ... (resto EXACTO igual que tu código)
}
