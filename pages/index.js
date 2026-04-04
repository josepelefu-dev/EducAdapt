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

  // 🧠 QUIZ STATES (NUEVO)
  const [quiz, setQuiz] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});

  const lineRefs = useRef([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const link = document.createElement("link");
      link.href = "https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  // 📂 SOLO TXT (estable)
  const handleFileUpload = (file) => {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    if (ext !== "txt") {
      alert("Solo se permite .txt por ahora");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setText(e.target.result);
    reader.readAsText(file);
  };

  // 🧠 GENERAR QUIZ (NUEVO)
  const generateQuiz = () => {
    if (!result) return;

    const lines = result.split("\n").filter(l => l.length > 20);

    const questions = lines.slice(0, 5).map((line) => {
      let correct = line.slice(0, 80);

      // adaptar según tipo
      if (type === "dislexia") correct = correct.slice(0, 50);
      if (type === "tdah") correct = correct.slice(0, 60);

      const options = [
        correct,
        "No es correcto",
        "Opción incorrecta",
        "Respuesta errónea"
      ].sort(() => Math.random() - 0.5);

      return {
        question: "¿Qué afirma este texto?",
        options,
        correct
      };
    });

    setQuiz(questions);
    setShowQuiz(true);
    setAnswers({});
  };

  const handleAnswer = (qIndex, option) => {
    setAnswers(prev => ({
      ...prev,
      [qIndex]: option
    }));
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
      quiz: "🧠 Generar preguntas"
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
      quiz: "🧠 Generar preguntes"
    }
  };

  const t = translations[lang];

  // ⚠️ NO TOCAR
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
      setResult(data.result || "");
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
    const win = window.open("", "_blank");
    win.document.write(`<pre>${formatResult(result)}</pre>`);
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

        <input type="file" accept=".txt" onChange={(e) => handleFileUpload(e.target.files[0])} />

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

        {/* 🧠 BOTÓN QUIZ */}
        {result && (
          <button onClick={generateQuiz} style={{ marginTop: "10px", ...mainButton }}>
            {t.quiz}
          </button>
        )}

        <button onClick={exportPDF} style={{ marginTop: "10px", ...mainButton }}>
          {t.pdf}
        </button>

        <button onClick={() => { setGuidedMode(!guidedMode); setCurrentLine(0); }} style={{ marginTop: "10px", ...mainButton }}>
          {guidedMode ? t.normal : t.guided}
        </button>

        <br /><br />

        {!guidedMode && result && <div style={resultStyle}>{formatResult(result)}</div>}

        {/* 🧠 QUIZ UI */}
        {showQuiz && (
          <div style={{ marginTop: "30px" }}>
            {quiz.map((q, i) => (
              <div key={i} style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "15px"
              }}>
                <p><strong>{q.question}</strong></p>

                {q.options.map((opt, j) => {
                  const isSelected = answers[i] === opt;
                  const isCorrect = opt === q.correct;

                  return (
                    <div
                      key={j}
                      onClick={() => handleAnswer(i, opt)}
                      style={{
                        padding: "10px",
                        marginTop: "5px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background:
                          isSelected
                            ? isCorrect ? "#bbf7d0" : "#fecaca"
                            : "#f1f5f9"
                      }}
                    >
                      {opt}
                    </div>
                  );
                })}
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
