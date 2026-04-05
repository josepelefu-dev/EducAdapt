export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🧠 NIVELES
    if (level === "basico") {
      levelPrompt = `
Adapta el contenido para un estudiante de 11-12 años.

REGLAS:
- Elimina la mayoría de detalles.
- Quédate solo con ideas esenciales.
- Lenguaje claro.
- Frases cortas.

IMPORTANTE:
- Debe ser claramente más corto.
- NO añadas títulos.
`;
    }

    if (level === "intermedio") {
      levelPrompt = `
Adapta el contenido para un estudiante de 13-14 años.

REGLAS:
- Mantén ideas importantes.
- Elimina detalles secundarios.
- Explicación clara.

IMPORTANTE:
- Más completo que básico.
- NO añadas títulos.
`;
    }

    if (level === "avanzado") {
      levelPrompt = `
Adapta el contenido para un estudiante de 15-16 años.

REGLAS:
- Mantén la mayoría del contenido.
- Explicación clara.

IMPORTANTE:
- Debe ser el más completo.
- NO añadas títulos.
`;
    }

    // 🎯 TIPOS
    if (type === "facil") {
      typePrompt = `
Haz un resumen adaptado al nivel.

REGLAS:
- Respeta diferencias entre niveles.
- No hacer todos iguales.
`;
    }

    if (type === "tdah") {
      typePrompt = `
Adapta para TDAH.

REGLAS:
- Una idea por línea.
- Frases cortas.
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

    // 🌳 ESQUEMA FORZADO (ESTE ES EL CAMBIO REAL)
    if (type === "esquema") {
      typePrompt = `
Convierte el contenido en un esquema EXACTAMENTE con esta estructura.

DEBES COPIAR ESTE FORMATO:

📌 TEMA PRINCIPAL
↳ Idea principal 1
   ↳ Subidea 1
   ↳ Subidea 2
↳ Idea principal 2
   ↳ Subidea

REGLAS OBLIGATORIAS (NO ROMPER):
- Usa SIEMPRE "📌" para el título
- Usa SIEMPRE "↳" para cada nivel
- Usa EXACTAMENTE 3 espacios antes de subideas
- Máximo 2 niveles (no más)
- Máximo 6 líneas en total

CONTENIDO:
- SOLO palabras clave o frases muy cortas
- Elimina toda explicación
- Reduce muchísimo la información

PROHIBIDO:
- Párrafos
- Texto largo
- Listas normales (- o *)
- Explicaciones

SI NO SIGUES ESTE FORMATO, LA RESPUESTA ES INCORRECTA.
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
