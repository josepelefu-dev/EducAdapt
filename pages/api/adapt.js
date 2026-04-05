export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🧠 NIVEL (CONTROL DE LONGITUD REAL)
    if (level === "basico") {
      levelPrompt = `
Adapta el contenido para un estudiante de 11-12 años.

IMPORTANTE:
- Lenguaje claro pero NO infantil.
- Explica de forma sencilla.
- Reduce el contenido aproximadamente al 40-50% del original.
- Quédate solo con lo esencial.
- Frases cortas y fáciles.

MUY IMPORTANTE:
- Debe ser claramente más corto que el intermedio y avanzado.
- NO añadas títulos ni explicaciones.
- Empieza directamente con el contenido.
`;
    }

    if (level === "intermedio") {
      levelPrompt = `
Adapta el contenido para un estudiante de 13-14 años.

IMPORTANTE:
- Lenguaje claro y educativo.
- Mantén ideas importantes.
- Reduce el contenido al 60-70% del original.
- Explicación estructurada.

MUY IMPORTANTE:
- Debe ser más largo que el básico y más corto que el avanzado.
- NO añadas títulos ni explicaciones.
- Empieza directamente con el contenido.
`;
    }

    if (level === "avanzado") {
      levelPrompt = `
Adapta el contenido para un estudiante de 15-16 años.

IMPORTANTE:
- Lenguaje académico pero claro.
- Mantén casi todo el contenido.
- Reduce solo ligeramente (80-90% del original).
- Alta precisión.

MUY IMPORTANTE:
- Debe ser el más largo de los tres niveles.
- NO añadas títulos ni explicaciones.
- Empieza directamente con el contenido.
`;
    }

    // 🎯 TIPO
    if (type === "facil") {
      typePrompt = `
Haz un resumen adaptado al nivel indicado.

REGLAS:
- Mantén ideas principales.
- Ajusta longitud según el nivel (NO todos iguales).
- No reduzcas todo a pocas líneas.
- No añadas información nueva.

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
- Espaciado claro.
- Evita bloques largos.
- Mantén contenido importante.

MUY IMPORTANTE:
- NO añadas títulos.
`;
    }

    if (type === "dislexia") {
      typePrompt = `
Adapta el texto para dislexia.

REGLAS:
- Lenguaje simple.
- Frases cortas.
- Estructura clara.
- Mantén ideas clave.

MUY IMPORTANTE:
- NO añadas títulos.
`;
    }

    // 🔥 ESQUEMA ÁRBOL (NUEVO NIVEL PRO)
    if (type === "esquema") {
      typePrompt = `
Convierte el contenido en un ESQUEMA EN FORMA DE ÁRBOL.

REGLAS OBLIGATORIAS:
- Usa estructura tipo árbol.
- Organiza la información en niveles jerárquicos.
- Usa este formato EXACTO:

📌 TÍTULO PRINCIPAL
├── Subtema
│   ├── Idea clave
│   ├── Idea clave
│
├── Otro subtema
│   ├── Idea clave

- Usa palabras clave, NO frases largas.
- NO redactes párrafos.
- NO conviertas en resumen.

MUY IMPORTANTE:
- Debe parecer un esquema visual de estudio.
- Empieza directamente con el esquema.
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
