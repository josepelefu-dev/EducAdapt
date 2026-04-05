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
      link.href = "https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css";
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

  // 🔥 NUEVO ESQUEMA REAL (NO DEPENDE DE IA)
  const generateSmartSchema = (text) => {
    if (!text) return "";

    const lines = text
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 20);

    let result = "📌 TEMA\n";

    lines.slice(0, 8).forEach((line, i) => {
      const short = line.split(" ").slice(0, 5).join(" ");

      if (i === 0) {
        result += `↳ ${short}\n`;
      } else {
        result += `   ↳ ${short}\n`;
      }
    });

    return result;
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

      // 🔥 SOLO CAMBIO AQUÍ
      if (type === "esquema") {
        finalResult = generateSmartSchema(finalResult);
      }

      setResult(finalResult);
      setCurrentLine(0);
    } catch {
      setResult("Error procesando");
    }

    setLoading(false);
  };

  const formatResult = (text) => {
    if (!text) return "";
    return text
      .replace(/^- (.*)$/gm, "• $1")
      .replace(/├──/g, "↳")
      .replace(/│/g, " ")
      .replace(/\. /g, ".\n\n");
  };

  const getLines = () => {
    return formatResult(result)
      .split("\n")
      .filter(l => l.trim() !== "");
  };

  const speakText = (startIndex = currentLine) => {
    if (!result || typeof window === "undefined") return;

    const lines = getLines();
    let index = startIndex;

    const speakLine = () => {
      if (index >= lines.length) {
        setSpeaking(false);
        return;
      }

      setCurrentLine(index);

      const utterance = new SpeechSynthesisUtterance(lines[index]);
      utterance.lang = lang === "ca" ? "ca-ES" : "es-ES";

      utterance.onend = () => {
        if (!paused) {
          index++;
          speakLine();
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    window.speechSynthesis.cancel();
    setPaused(false);
    setSpeaking(true);
    speakLine();
  };

  const pauseSpeech = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const resumeSpeech = () => {
    window.speechSynthesis.resume();
    setPaused(false);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  const downloadResult = () => {
    if (!result) return;

    const content = `EDUCADAPT
Tipo: ${type}
Nivel: ${level}
Modo: ${mode}
Fecha: ${new Date().toLocaleDateString()}
----------------------------------------
${formatResult(result)}
----------------------------------------`;

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "educadapt.txt";
    link.click();
  };

  useEffect(() => {
    if (!autoPlay || !guidedMode) return;

    const interval = setInterval(() => {
      setCurrentLine(prev => {
        const lines = getLines();
        return prev < lines.length - 1 ? prev + 1 : prev;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [autoPlay, speed, guidedMode, result]);

  const resultStyle = {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    whiteSpace: "pre-wrap",
    color: "#111827"
  };

  return (
    <div style={{ padding: 20 }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleAdapt}>{t.adapt}</button>

      {result && <div style={resultStyle}>{result}</div>}
    </div>
  );
}
