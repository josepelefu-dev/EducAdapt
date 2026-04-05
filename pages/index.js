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

  const generateSmartSchema = (text) => {
    const lines = text.split("\n").filter(l => l.trim() !== "");

    let result = "";
    let currentTitle = "";

    lines.forEach(line => {
      const t = line.trim();

      if (
        t.length < 60 &&
        (t === t.toUpperCase() || t.endsWith(":"))
      ) {
        currentTitle = t.replace(":", "");
        result += `\n📌 ${currentTitle}\n`;
      }

      else if (t.length < 120) {
        result += `  ↳ ${t}\n`;
      }

      else {
        result += `    • ${t}\n`;
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

    const voices = window.speechSynthesis.getVoices();

    const hasCatalan = voices.some(v =>
      v.lang.toLowerCase().includes("ca")
    );

    if (lang === "ca" && !hasCatalan) {
      alert("⚠️ Tu dispositivo no tiene voz catalana. Prueba con Edge o Safari.");
    }

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

      setTimeout(() => {
        lineRefs.current[index]?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 200);
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

    const blob = new Blob([formatResult(result)], {
      type: "text/plain;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "educadapt.txt";
    link.click();
  };

  const exportPDF = () => {
  if (!result) return;

  const win = window.open("", "_blank");

  if (!win) {
    alert("Permite ventanas emergentes");
    return;
  }

  const content = formatResult(result);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>EducAdapt</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      line-height: 1.6;
      color: #111;
    }

    h1 {
      color: #6366f1;
    }

    .meta {
      font-size: 14px;
      color: #555;
      margin-bottom: 20px;
    }

    .content {
      margin-top: 20px;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>

  <h1>EducAdapt</h1>

  <div class="meta">
    Tipo: ${type} <br>
    Nivel: ${level} <br>
    Modo: ${mode} <br>
    Fecha: ${new Date().toLocaleDateString()}
  </div>

  <hr>

  <div class="content">
    ${content}
  </div>

</body>
</html>
`;

  win.document.open();
  win.document.write(html);
  win.document.close();

  setTimeout(() => {
    win.print();
  }, 300);
};

  win.document.close();
  win.print();
};

  win.document.close();
  win.print();
};

  win.document.close();
  win.print();
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
    lineHeight: type === "dislexia" ? "1.25" : type === "tdah" ? "1.65" : "1.6",
    letterSpacing: type === "dislexia" ? "1px" : "normal",
    fontFamily: type === "dislexia" ? "OpenDyslexic, Arial" : "Arial",
    color: "#111827"
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <img src="/logo.jpg" style={{ width: "50px" }} />
          <h2>{t.title}</h2>
        </div>

        <div>
          <button onClick={() => setLang("es")} style={langBtn}>ES</button>
          <button onClick={() => setLang("ca")} style={langBtn}>CAT</button>
        </div>
      </div>

      <div style={cardStyle}>
        <textarea rows="8" style={textareaStyle} placeholder={t.placeholder} value={text} onChange={(e) => setText(e.target.value)} />

        <br /><br />

        <div>
          <label style={{ color: "#111827", fontWeight: "600" }}>
            {t.file}
          </label>
          <input 
            type="file" 
            accept=".txt" 
            onChange={(e) => handleFileUpload(e.target.files[0])} 
            style={{ marginTop: "5px" }}
          />
        </div>

        <br /><br />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
            <option value="facil">{t.resumen}</option>
            <option value="tdah">{t.tdah}</option>
            <option value="dislexia">{t.dislexia}</option>
            <option value="esquema">{t.esquema}</option>
          </select>

          <select value={level} onChange={(e) => setLevel(e.target.value)} style={selectStyle}>
            <option value="basico">{t.basico}</option>
            <option value="intermedio">{t.intermedio}</option>
            <option value="avanzado">{t.avanzado}</option>
          </select>

          <select value={mode} onChange={(e) => setMode(e.target.value)} style={selectStyle}>
            <option value="alumno">{t.alumno}</option>
            <option value="profesor">{t.profesor}</option>
          </select>
        </div>

        <br />

        <button onClick={handleAdapt} style={mainButton}>
          {loading ? t.loading : t.adapt}
        </button>

        <button onClick={exportPDF} style={{ marginTop: "10px", ...mainButton }}>
          {t.pdf}
        </button>

        <button onClick={() => { setGuidedMode(!guidedMode); setCurrentLine(0); }} style={{ marginTop: "10px", ...mainButton }}>
          {guidedMode ? t.normal : t.guided}
        </button>

        {guidedMode && (
          <div>
            <button onClick={() => setAutoPlay(!autoPlay)} style={{ marginTop: "10px", ...mainButton }}>
              {autoPlay ? t.stop : t.auto}
            </button>

            <button onClick={() => speakText()} style={{ marginTop: "10px", ...mainButton }}>
              {t.speak}
            </button>

            <button onClick={pauseSpeech} style={{ marginTop: "10px", ...mainButton }}>
              ⏸ Pausa
            </button>

            <button onClick={resumeSpeech} style={{ marginTop: "10px", ...mainButton }}>
              {t.resume}
            </button>

            <button onClick={stopSpeech} style={{ marginTop: "10px", ...mainButton }}>
              {t.stopSpeak}
            </button>

            <input type="range" min="1000" max="5000" step="500" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ width: "100%", marginTop: "10px" }} />
          </div>
        )}

        <br /><br />

        {!guidedMode && result && <div style={resultStyle}>{formatResult(result)}</div>}

        {guidedMode && result && (
          <div style={resultStyle}>
            {getLines().map((line, i) => (
              <div key={i} ref={el => lineRefs.current[i] = el} onClick={() => speakText(i)} style={{ padding: "8px", margin: "4px 0", borderRadius: "6px", cursor: "pointer", opacity: i === currentLine ? 1 : 0.4, background: i === currentLine ? "#dbeafe" : "transparent", fontWeight: i === currentLine ? "600" : "400" }}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {result && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button onClick={downloadResult} style={{ padding: "15px", background: "#0ea5e9", color: "white", border: "none", borderRadius: "12px", cursor: "pointer" }}>
            {t.download}
          </button>
        </div>
      )}
    </div>
  );
}

const pageStyle = { minHeight: "100vh", background: "#0f172a", padding: "20px", color: "white" };
const headerStyle = { maxWidth: "900px", margin: "auto", display: "flex", justifyContent: "space-between" };
const cardStyle = { maxWidth: "900px", margin: "auto", background: "white", padding: "30px", borderRadius: "20px" };
const textareaStyle = { width: "100%", padding: "15px", borderRadius: "10px" };
const selectStyle = { padding: "10px", borderRadius: "8px" };
const mainButton = { width: "100%", padding: "15px", background: "#6366f1", color: "white", border: "none" };
const langBtn = { margin: "5px" };
