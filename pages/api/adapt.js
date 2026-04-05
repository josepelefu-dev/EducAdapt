export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🧠 NIVEL (POR EDAD REAL)

    if (level === "basico") {
      levelPrompt = `
Adapta el contenido para un estudiante de 11 años.

- Lenguaje claro pero NO infantil.
- Frases sencillas y naturales.
- Explicación comprensible sin perder rigor.
- No uses metáforas tipo "truco mágico".
- Sé directo.

Respeta siempre que es un resumen: sé breve y directo.
`;
    }

    if (level === "intermedio") {
      levelPrompt = `
Adapta el contenido para un estudiante de 13 años.

- Lenguaje claro y educativo.
- Incluye ideas principales.
- Mantén equilibrio entre claridad y contenido.

Respeta siempre que es un resumen: sé breve y directo.
`;
    }

    if (level === "avanzado") {
      levelPrompt = `
Adapta el contenido para un estudiante de 15 años.

- Lenguaje preciso pero comprensible.
- Incluye términos importantes sin exceso académico.
- Explicación completa pero clara.

Respeta siempre que es un resumen: sé breve y directo.
`;
    }

    // 🎯 TIPO (CONTROLA EL RESULTADO)

    if (type === "facil") {
      typePrompt = `
Haz un resumen del texto.

IMPORTANTE:
- Máximo 3 frases.
- Solo ideas principales.
- No añadas información nueva.
- No expliques en detalle.
`;
    }

    if (type === "tdah") {
      typePrompt = `
Adapta el texto para TDAH:

- Frases muy cortas.
- Una idea por línea.
- Usa saltos de línea.
- Evita bloques largos.
`;
    }

    if (type === "dislexia") {
      typePrompt = `
Adapta el texto para dislexia:

- Lenguaje simple.
- Frases cortas.
- Estructura clara.
- Evita palabras complejas innecesarias.
`;
    }

    if (type === "esquema") {
      typePrompt = `
Convierte el contenido en un esquema estructurado.

- Usa formato claro.
- Ideas jerárquicas.
- Muy visual.
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
