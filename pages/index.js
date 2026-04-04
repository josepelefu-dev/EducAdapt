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
    const reader = new FileReader();
    reader.onload = (e) => setText(e.target.result);
    reader.readAsText(file);
  };

  const generateQuiz = () => {
    if (!result) return;

    const lines = result.split("\n").filter(l => l.length > 20);

    const questions = lines.slice(0, 5).map((line) => {
      let correct = line.slice(0, 80);

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

  const handleAdapt = async () => {
    if (!text.trim()) return alert("Introduce texto");

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
      .replace(/\. /g, ".\n\n");
  };

  const getLines = () => {
    return formatResult(result).split("\n").filter(l => l.trim() !== "");
  };

  const speakText = (startIndex = currentLine) => {
    if (!result) return;

    const lines = getLines();
    let index = startIndex;

    const speakLine = () => {
      if (index >= lines.length) return;

      setCurrentLine(index);

      const utterance = new SpeechSynthesisUtterance(lines[index]);
      utterance.onend = () => { index++; speakLine(); };

      speechSynthesis.speak(utterance);
    };

    speechSynthesis.cancel();
    speakLine();
  };

  return (
    <div style={{ padding: "20px" }}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />

      <br /><br />

      <input type="file" accept=".txt" onChange={(e) => handleFileUpload(e.target.files[0])} />

      <br /><br />

      <button onClick={handleAdapt}>
        {loading ? "Procesando..." : "Adaptar"}
      </button>

      {result && (
        <button onClick={generateQuiz}>
          🧠 Generar preguntas
        </button>
      )}

      <br /><br />

      {result && <div>{formatResult(result)}</div>}

      {/* ✅ QUIZ CORREGIDO */}
      {showQuiz && (
        <div style={{ marginTop: "30px" }}>
          {quiz.map((q, i) => (
            <div key={i} style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "15px",
              color: "#111827" // 🔥 FIX
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
                      color: "#111827", // 🔥 FIX
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
  );
}
