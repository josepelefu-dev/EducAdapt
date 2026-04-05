export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🧠 NIVEL (POR EDAD + PROFUNDIDAD)

    if (level === "basico") {
      levelPrompt = `
Adapta el contenido para un estudiante de 11 años.

- Lenguaje claro pero no infantil.
- Explicación sencilla.
- Reduce bastante el contenido.
- Quédate solo con lo esencial.
`;
    }

    if (level === "intermedio") {
      levelPrompt = `
Adapta el contenido para un estudiante de 13 años.

- Lenguaje claro y educativo.
- Incluye ideas principales.
- Mantén información relevante.
`;
    }

    if (level === "avanzado") {
      levelPrompt = `
Adapta el contenido para un estudiante de 15 años.

- Lenguaje preciso pero comprensible.
- Incluye conceptos importantes.
- Mantén bastante contenido del original.
`;
    }

    // 🎯 TIPO (RESUMEN INTELIGENTE)

    if (type === "facil") {
      typePrompt = `
Haz un resumen del texto adaptado al nivel indicado.

IMPORTANTE:
- Mantén las ideas principales.
- Reduce el contenido de forma proporcional al tamaño del texto.
- No lo reduzcas a un número fijo de frases.
- Si el texto es largo, el resumen debe tener varios párrafos.
- No añadas información nueva.
`;
    }

    if (type === "tdah") {
      typePrompt = `
Adapta el texto para TDAH:

- Frases cortas.
- Una idea por línea.
- Formato claro y separado.
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
Convierte el contenido en un esquema estructurado:

- Formato jerárquico.
- Ideas claras.
- Visual y ordenado.
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
