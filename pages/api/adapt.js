export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🧠 NIVELES (CONTROL REAL)
    if (level === "basico") {
      levelPrompt = `
Adapta el contenido para un estudiante de 11-12 años.

REGLAS:
- Reduce el contenido al 30%.
- Quédate SOLO con lo esencial.
- Elimina evolución detallada y listas largas.
- Usa frases muy claras y cortas.

IMPORTANTE:
- Máximo 8-10 líneas.
- Debe ser MUCHO más corto que los otros niveles.
- NO añadas títulos.
`;
    }

    if (level === "intermedio") {
      levelPrompt = `
Adapta el contenido para un estudiante de 13-14 años.

REGLAS:
- Reduce el contenido al 60%.
- Mantén ideas importantes.
- Explica sin exceso.

IMPORTANTE:
- Debe ser más largo que el básico.
- NO añadas títulos.
`;
    }

    if (level === "avanzado") {
      levelPrompt = `
Adapta el contenido para un estudiante de 15-16 años.

REGLAS:
- Mantén casi todo el contenido.
- Explicación completa pero clara.

IMPORTANTE:
- Debe ser el más largo.
- NO añadas títulos.
`;
    }

    // 🎯 TIPOS
    if (type === "facil") {
      typePrompt = `
Haz un resumen adaptado al nivel.

REGLAS:
- Respeta MUCHO la longitud según nivel.
- No hagas todos los niveles parecidos.
- Mantén coherencia.

IMPORTANTE:
- Empieza directamente.
`;
    }

    if (type === "tdah") {
      typePrompt = `
Adapta para TDAH.

REGLAS:
- Una idea por línea.
- Frases cortas.
- Espacios entre líneas.
`;
    }

    if (type === "dislexia") {
      typePrompt = `
Adapta para dislexia.

REGLAS:
- Frases cortas.
- Palabras simples.
`;
    }

    // 🌳 ESQUEMA V3 (SIMPLIFICADO Y FUNCIONAL)
    if (type === "esquema") {
      typePrompt = `
Convierte el contenido en un esquema claro para estudiar.

REGLAS OBLIGATORIAS:
- Usa SOLO guiones (-)
- Usa sangrías con espacios
- NO uses símbolos raros (↳, │, ├, etc.)

FORMATO:

📌 TEMA
- Idea principal
  - Idea secundaria
  - Idea secundaria
- Otra idea principal
  - Idea secundaria

REGLAS CLAVE:
- SOLO palabras clave (máx 4-5 palabras)
- NO frases largas
- NO párrafos
- Máximo 3 niveles
- Agrupa bien la información

OBJETIVO:
- Que se entienda rápido
- Que sirva para estudiar
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

${levelPrompt}

${typePrompt}

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
