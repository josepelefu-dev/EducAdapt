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
- Lenguaje claro y fácil.
- Frases cortas.

IMPORTANTE:
- Debe ser claramente más corto que el original.
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
- Más corto que avanzado.
- NO añadas títulos.
`;
    }

    if (level === "avanzado") {
      levelPrompt = `
Adapta el contenido para un estudiante de 15-16 años.

REGLAS:
- Mantén la mayor parte del contenido.
- Explica de forma clara.

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
- Respeta la diferencia entre niveles.
- No hagas todos los resúmenes iguales.
- Mantén coherencia.
`;
    }

    if (type === "tdah") {
      typePrompt = `
Adapta para TDAH.

REGLAS:
- Una idea por línea.
- Frases cortas.
- Espaciado claro.
`;
    }

    if (type === "dislexia") {
      typePrompt = `
Adapta para dislexia.

REGLAS:
- Frases cortas.
- Palabras simples.
- Estructura clara.
`;
    }

    // 🌳 ESQUEMA (VERSIÓN SIMPLIFICADA Y FUNCIONAL)
    if (type === "esquema") {
  typePrompt = `
Convierte el texto en un esquema tipo árbol.

IMPORTANTE:
- NO resumas el contenido
- Mantén TODA la información relevante
- Divide el contenido en ideas principales y secundarias
- Usa estructura jerárquica clara

Formato obligatorio:
📌 TÍTULO PRINCIPAL
↳ Idea principal
   ↳ Subidea
      • Detalle

- Usa frases cortas, no párrafos largos
- El esquema puede ser largo si el texto lo es
- Prioriza claridad y estructura sobre brevedad
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
