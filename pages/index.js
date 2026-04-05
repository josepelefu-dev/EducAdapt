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
      quiz: "🧠 Generar quiz"
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
      quiz: "🧠 Generar qüestionari"
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
      setShowQuiz(false); // reset quiz
    } catch {
      setResult("Error procesando");
    }

    setLoading(false);
  };

  // 🧠 QUIZ
  const generateQuiz = () => {
    if (!result) return;

    const sentences = result
      .replace(/\n/g, " ")
      .split(".")
      .map(s => s.trim())
      .filter(s => s.length > 40);

    if (sentences.length < 4) {
      alert("Texto insuficiente");
      return;
    }

    const questions = sentences.slice(0, 5).map((correct, i) => {
      const others = sentences.filter((_, idx) => idx !== i);
      const options = [correct, ...others.sort(() => Math.random() - 0.5).slice(0, 3)]
        .sort(() => Math.random() - 0.5);

      return { question: "¿Cuál es correcta?", options, correct };
    });

    setQuiz(questions);
    setShowQuiz(true);
    setAnswers({});
  };

  const handleAnswer = (qIndex, option) => {
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const formatResult = (text) => {
    if (!text) return "";
    return text.replace(/\. /g, ".\n\n");
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
    speakLine();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>{t.title}</h2>

      <textarea
        rows="6"
        style={{ width: "100%" }}
        placeholder={t.placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br /><br />

      <button onClick={handleAdapt}>
        {loading ? t.loading : t.adapt}
      </button>

      {result && (
        <>
          <button onClick={generateQuiz} style={{ marginLeft: "10px" }}>
            {t.quiz}
          </button>

          <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
            {formatResult(result)}
          </div>
        </>
      )}

      {showQuiz && (
        <div style={{ marginTop: "30px" }}>
          {quiz.map((q, i) => (
            <div key={i} style={{ marginBottom: "15px" }}>
              <p><strong>{q.question}</strong></p>

              {q.options.map((opt, j) => {
                const isSelected = answers[i] === opt;
                const isCorrect = opt === q.correct;

                return (
                  <div
                    key={j}
                    onClick={() => handleAnswer(i, opt)}
                    style={{
                      padding: "8px",
                      marginTop: "5px",
                      cursor: "pointer",
                      background:
                        isSelected
                          ? isCorrect ? "#bbf7d0" : "#fecaca"
                          : "#eee"
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
  );
}
