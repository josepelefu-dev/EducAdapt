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

  // 🧠 QUIZ
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

  // 🧠 QUIZ INTELIGENTE (SIN IA)
  const generateQuiz = () => {
    if (!result) return;

    const lines = result
      .split("\n")
      .map(l => l.trim())
      .filter(l =>
        l.length > 20 &&
        (l.includes(" es ") || l.includes(" fue ") || l.includes(" son "))
      );

    if (lines.length < 2) {
      alert("No hay suficientes definiciones claras para generar preguntas");
      return;
    }

    const questions = lines.slice(0, 5).map((line, index) => {
      const parts = line.split(" es ");
      if (parts.length < 2) return null;

      const concept = parts[0].replace(/[•📌\-]/g, "").trim();
      let definition = parts[1].trim();

      if (type === "dislexia") definition = definition.slice(0, 60);
      if (type === "tdah") definition = definition.slice(0, 80);

      const otherDefs = lines
        .filter((_, i) => i !== index)
        .map(l => l.split(" es ")[1]?.trim())
        .filter(Boolean);

      const fakeOptions = otherDefs
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(d => {
          if (type === "dislexia") return d.slice(0, 60);
          if (type === "tdah") return d.slice(0, 80);
          return d.slice(0, 100);
        });

      const options = [definition, ...fakeOptions]
        .sort(() => Math.random() - 0.5);

      return {
        question: `¿Qué es ${concept}?`,
        options,
        correct: definition
      };
    }).filter(Boolean);

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

  const resultStyle = {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    whiteSpace: "pre-wrap",
    lineHeight: "1.6",
    color: "#111827"
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h2>{t.title}</h2>
      </div>

      <div style={cardStyle}>
        <textarea rows="8" style={textareaStyle} placeholder={t.placeholder} value={text} onChange={(e) => setText(e.target.value)} />

        <br /><br />

        <button onClick={handleAdapt} style={mainButton}>
          {loading ? t.loading : t.adapt}
        </button>

        {result && (
          <button onClick={generateQuiz} style={{ marginTop: "10px", ...mainButton }}>
            {t.quiz}
          </button>
        )}

        <br /><br />

        {result && <div style={resultStyle}>{formatResult(result)}</div>}

        {showQuiz && (
          <div style={{ marginTop: "30px" }}>
            {quiz.map((q, i) => (
              <div key={i} style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "15px",
                color: "#111827"
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
    </div>
  );
}

const pageStyle = { padding: "20px" };
const headerStyle = { marginBottom: "20px" };
const cardStyle = { background: "white", padding: "30px", borderRadius: "20px" };
const textareaStyle = { width: "100%", padding: "15px", borderRadius: "10px" };
const mainButton = { width: "100%", padding: "15px", background: "#6366f1", color: "white", border: "none" };
