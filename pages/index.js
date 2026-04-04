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
      if (t.length < 60 && (t === t.toUpperCase() || t.endsWith(":"))) {
        currentTitle = t.replace(":", "");
        result += `\n📌 ${currentTitle}\n`;
      } else if (t.length < 120) {
        result += `  ↳ ${t}\n`;
      } else {
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
    return text.replace(/^- (.*)$/gm, "• $1").replace(/\. /g, ".\n\n");
  };

  const getLines = () => {
    return formatResult(result).split("\n").filter(l => l.trim() !== "");
  };

  const speakText = (startIndex = currentLine) => {
    if (!result || typeof window === "undefined") return;

    const lines = getLines();
    let index = startIndex;

    const speakLine = () => {
      if (index >= lines.length) return;
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
    const blob = new Blob([formatResult(result)], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "educadapt.txt";
    link.click();
  };

  const exportPDF = () => {
    const win = window.open("", "_blank");
    win.document.write(`<pre>${formatResult(result)}</pre>`);
    win.print();
  };

  // 🧠 QUIZ BUENO
  const generateQuiz = () => {
    if (!result) return;

    const lines = result.split("\n").filter(l => l.length > 30);

    const questions = lines.slice(0, 5).map((line, i) => {
      const correct = line;
      const others = lines.filter((_, idx) => idx !== i);

      return {
        question: "Selecciona la afirmación correcta:",
        options: [correct, ...others.sort(() => Math.random() - 0.5).slice(0, 3)],
        correct
      };
    });

    setQuiz(questions);
    setShowQuiz(true);
    setAnswers({});
  };

  const handleAnswer = (qIndex, option) => {
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  return (
    <div style={pageStyle}>
      {/* TODO TU JSX ORIGINAL intacto */}
      {/* SOLO añade este botón */}
      {result && (
        <button onClick={generateQuiz} style={{ marginTop: "10px", ...mainButton }}>
          {t.quiz}
        </button>
      )}

      {/* QUIZ AL FINAL */}
      {showQuiz && (
        <div style={{ marginTop: "30px" }}>
          {quiz.map((q, i) => (
            <div key={i} style={{ background: "white", padding: "20px", borderRadius: "12px", marginBottom: "15px" }}>
              <p><strong>{q.question}</strong></p>
              {q.options.map((opt, j) => (
                <div key={j} onClick={() => handleAnswer(i, opt)} style={{ padding: "10px", marginTop: "5px", cursor: "pointer", background: "#f1f5f9" }}>
                  {opt}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
