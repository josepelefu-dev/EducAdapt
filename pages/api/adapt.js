export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🧠 NIVELES REALES (CLAVE DEL PRODUCTO)
    if (level === "basico") {
      levelPrompt = `
Adapta el contenido para un estudiante de 11-12 años.

REGLAS OBLIGATORIAS:
- Reduce el contenido al 40% del original.
- Quédate SOLO con las ideas más importantes.
- Elimina detalles secundarios.
- Usa lenguaje claro pero NO infantil.
- Frases cortas.

MUY IMPORTANTE:
- Debe ser claramente más corto que los otros niveles.
- No expliques todo, simplifica.
- NO añadas títulos ni introducciones.
- Empieza directamente con el contenido.
`;
    }

    if (level === "intermedio") {
      levelPrompt = `
Adapta el contenido para un estudiante de 13-14 años.

REGLAS:
- Reduce el contenido al 60% del original.
- Mantén ideas importantes.
- Explica lo necesario sin exceso.
- Lenguaje claro y educativo.

MUY IMPORTANTE:
- Debe ser más largo que el básico.
- Debe ser más corto que el avanzado.
- NO añadas títulos ni introducciones.
- Empieza directamente con el contenido.
`;
    }

    if (level === "avanzado") {
      levelPrompt = `
Adapta el contenido para un estudiante de 15-16 años.

REGLAS:
- Mantén el 80-90% del contenido original.
- Explicación completa pero clara.
- Usa lenguaje académico sencillo.

MUY IMPORTANTE:
- Debe ser el nivel más completo.
- NO añadas títulos ni introducciones.
- Empieza directamente con el contenido.
`;
    }

    // 🎯 TIPOS DE ADAPTACIÓN
    if (type === "facil") {
      typePrompt = `
Haz un resumen adaptado al nivel indicado.

REGLAS:
- Respeta la longitud según nivel.
- Mantén ideas principales.
- No conviertas todo en pocas líneas.
- No añadas información nueva.

MUY IMPORTANTE:
- NO añadas títulos.
- Empieza directamente con el contenido.
`;
    }

    if (type === "tdah") {
      typePrompt = `
Adapta el texto para TDAH.

REGLAS:
- Una idea por línea.
- Frases muy cortas.
- Espaciado claro.
- Evita bloques largos.
- Usa formato visual fácil.

MUY IMPORTANTE:
- Mantén contenido importante.
- NO añadas títulos.
`;
    }

    if (type === "dislexia") {
      typePrompt = `
Adapta el texto para dislexia.

REGLAS:
- Frases cortas.
- Palabras simples.
- Estructura muy clara.
- Evita términos complejos innecesarios.

MUY IMPORTANTE:
- Mantén ideas clave.
- NO añadas títulos.
`;
    }

    // 🌳 ESQUEMA PRO REAL
    if (type === "esquema") {
      typePrompt = `
Convierte el contenido en un ESQUEMA EN FORMA DE ÁRBOL.

REGLAS OBLIGATORIAS:
- Usa estructura jerárquica clara (tipo árbol).
- Máximo 3 niveles de profundidad.
- Usa SOLO palabras clave (máx 6 palabras por línea).
- NO escribas frases largas.
- NO redactes párrafos.

FORMATO EXACTO:

📌 TEMA PRINCIPAL
├── Bloque
│   ├── Idea clave
│   ├── Idea clave
│
├── Otro bloque
│   ├── Idea clave
│   └── Idea clave

REGLAS IMPORTANTES:
- Agrupa la información correctamente.
- No mezcles niveles (tema / subtema / detalle).
- Debe ser visual y fácil de estudiar.
- No expliques, SOLO organiza.

MUY IMPORTANTE:
- Debe parecer un esquema de examen.
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
