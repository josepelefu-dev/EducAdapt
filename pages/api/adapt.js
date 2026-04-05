export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🧠 NIVEL (REALISTA POR EDAD)
    if (level === "basico") {
      levelPrompt = `
Adapta el contenido para un estudiante de 11-12 años.

IMPORTANTE:
- Lenguaje claro pero NO infantil.
- Explica los conceptos de forma sencilla.
- Usa frases cortas y comprensibles.
- Mantén las ideas importantes.
- Reduce ligeramente el contenido, pero sin eliminar información clave.

MUY IMPORTANTE:
- NO añadas títulos como "Resumen de..." o "Adaptado para..."
- NO expliques lo que estás haciendo.
- Empieza directamente con el contenido.
`;
    }

    if (level === "intermedio") {
      levelPrompt = `
Adapta el contenido para un estudiante de 13-14 años.

IMPORTANTE:
- Lenguaje claro y educativo.
- Mantén conceptos importantes.
- Explicación estructurada.
- No simplifiques en exceso.
- Mantén buena parte del contenido original.

MUY IMPORTANTE:
- NO añadas títulos ni explicaciones.
- Empieza directamente con el contenido.
`;
    }

    if (level === "avanzado") {
      levelPrompt = `
Adapta el contenido para un estudiante de 15-16 años.

IMPORTANTE:
- Lenguaje académico pero comprensible.
- Mantén precisión en los conceptos.
- No simplifiques en exceso.
- Conserva la mayor parte del contenido.
- Prioriza claridad y estructura.

MUY IMPORTANTE:
- NO añadas títulos ni explicaciones.
- Empieza directamente con el contenido.
`;
    }

    // 🎯 TIPO
    if (type === "facil") {
      typePrompt = `
Haz un resumen adaptado al nivel indicado.

REGLAS IMPORTANTES:
- Mantén las ideas principales.
- Ajusta la longitud según el texto original:
  - Texto corto → resumen corto
  - Texto largo → varios párrafos
- NO reduzcas todo a pocas líneas.
- NO añadas información nueva.
- Mantén coherencia y claridad.

MUY IMPORTANTE:
- NO añadas títulos ni introducciones.
- Empieza directamente con el contenido.
`;
    }

    if (type === "tdah") {
      typePrompt = `
Adapta el texto para TDAH.

REGLAS:
- Frases cortas.
- Una idea por línea.
- Espaciado visual claro.
- Usa listas si es posible.
- Evita bloques largos de texto.
- Mantén el contenido importante.

MUY IMPORTANTE:
- NO añadas títulos ni explicaciones.
- Empieza directamente con el contenido.
`;
    }

    if (type === "dislexia") {
      typePrompt = `
Adapta el texto para dislexia.

REGLAS:
- Lenguaje simple y claro.
- Frases cortas.
- Estructura limpia.
- Evita palabras complejas innecesarias.
- Mantén las ideas clave.

MUY IMPORTANTE:
- NO añadas títulos ni explicaciones.
- Empieza directamente con el contenido.
`;
    }

    // 🔥 ESQUEMA PRO (NUEVO)
    if (type === "esquema") {
      typePrompt = `
Convierte el contenido en un ESQUEMA DE ESTUDIO claro y visual.

REGLAS OBLIGATORIAS:
- Usa estructura jerárquica.
- Organiza la información en niveles (tema → subtema → ideas).
- Usa este formato EXACTO:

📌 TÍTULO PRINCIPAL
↳ Subtema
   • Idea clave
   • Idea clave

↳ Otro subtema
   • Idea clave

- Frases muy cortas.
- NO redactes párrafos.
- NO expliques, solo estructura.
- NO conviertas esto en un resumen.
- El objetivo es que sirva para estudiar y memorizar.

MUY IMPORTANTE:
- Empieza directamente con el esquema.
- NO añadas introducciones ni explicaciones.
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
