import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🎯 NIVEL (CLAVE)
    if (level === "basico") {
      levelPrompt = `
Explica el contenido como si fuera para un niño de 10 años.
Usa frases muy cortas, vocabulario simple y evita tecnicismos.
Reduce el contenido a lo esencial.
`;
    }

    if (level === "intermedio") {
      levelPrompt = `
Explica el contenido de forma clara y estructurada.
Incluye las ideas principales sin simplificar en exceso.
Lenguaje accesible pero preciso.
`;
    }

    if (level === "avanzado") {
      levelPrompt = `
Explica el contenido con detalle y precisión académica.
Incluye conceptos importantes, relaciones y terminología relevante.
No simplifiques demasiado.
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
- formato claro
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
Convierte el contenido en esquema estructurado.
`;
    }

    const languageInstruction =
      lang === "ca"
        ? "Respon en català."
        : "Responde en español.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un experto en educación y adaptación de contenido.",
        },
        {
          role: "user",
          content: `
${languageInstruction}

${typePrompt}

${levelPrompt}

Texto:
${text}
`,
        },
      ],
    });

    res.status(200).json({
      result: completion.choices[0].message.content,
    });

  } catch (error) {
    res.status(500).json({ error: "Error procesando" });
  }
}
