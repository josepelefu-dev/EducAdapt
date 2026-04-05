export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🧠 NIVEL (ADAPTADO POR EDAD REAL)

    if (level === "basico") {
      levelPrompt = `
Explica el contenido para un estudiante de 11 años.

- Usa lenguaje claro pero NO infantil.
- No uses metáforas tipo "truco mágico".
- Explica conceptos de forma sencilla pero correcta.
- Frases cortas pero naturales.
- Mantén rigor educativo sin simplificar en exceso.
`;
    }

    if (level === "intermedio") {
      levelPrompt = `
Explica el contenido para un estudiante de 13 años.

- Lenguaje claro y educativo.
- Introduce conceptos importantes.
- Mantén equilibrio entre claridad y contenido.
- Evita lenguaje infantil.
`;
    }

    if (level === "avanzado") {
      levelPrompt = `
Explica el contenido para un estudiante de 15 años.

- Lenguaje preciso pero comprensible.
- Incluye términos clave sin exceso académico.
- Explicación completa pero clara.
- Evita tecnicismos innecesarios.
`;
    }

    // 🎯 TIPO

    if (type === "facil") {
      typePrompt = "Haz un resumen claro del texto.";
    }

    if (type === "tdah") {
      typePrompt = `
Adapta el texto para TDAH:
- frases cortas
- ideas separadas
- estructura clara
`;
    }

    if (type === "dislexia") {
      typePrompt = `
Adapta el texto para dislexia:
- lenguaje simple
- frases cortas
- estructura clara
`;
    }

    if (type === "esquema") {
      typePrompt = `
Convierte el contenido en un esquema estructurado.
`;
    }

    const languageInstruction =
      lang === "ca"
        ? "Respon en català."
        : "Responde en español.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `
${languageInstruction}

${typePrompt}

${levelPrompt}

Texto:
${text}
`
          }
        ]
      })
    });

    const data = await response.json();

    res.status(200).json({
      result: data.choices?.[0]?.message?.content || "Error generando respuesta"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error procesando" });
  }
}
