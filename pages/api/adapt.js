export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🧠 NIVELES (YA FUNCIONAN BIEN)
    if (level === "basico") {
      levelPrompt = `
Adapta el contenido para un estudiante de 11-12 años.

REGLAS:
- Reduce el contenido al 30%.
- Quédate SOLO con lo esencial.
- Elimina evolución detallada y listas largas.
- Usa frases claras y cortas.

IMPORTANTE:
- Debe ser corto.
- NO añadas títulos.
- Empieza directamente.
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
- Más largo que básico.
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
- Debe ser el más completo.
- NO añadas títulos.
`;
    }

    // 🎯 TIPOS
    if (type === "facil") {
      typePrompt = `
Haz un resumen adaptado al nivel.

REGLAS:
- Respeta la longitud según nivel.
- No hagas todos los niveles iguales.
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

    // 🌳 ESQUEMA V4 (FINAL BUENO)
    if (type === "esquema") {
      typePrompt = `
Convierte el contenido en un ESQUEMA DE ESTUDIO MUY SIMPLIFICADO.

REGLAS OBLIGATORIAS:
- Reduce el contenido al 20-30%.
- Quédate SOLO con conceptos clave.
- Elimina explicaciones y detalles.

FORMATO:

📌 TEMA
- Idea principal
  - Subidea
  - Subidea
- Otra idea
  - Subidea

REGLAS CLAVE:
- SOLO palabras clave (máx 3-4 palabras)
- NO frases largas
- NO párrafos
- Máximo 2-3 niveles
- Agrupar bien

MUY IMPORTANTE:
- Debe ser corto
- Debe poder estudiarse rápido
- Debe parecer un esquema real, no un texto

PROHIBIDO:
- Explicar
- Redactar
- Repetir contenido

OBJETIVO:
- Memorizar rápido
- Ver estructura clara
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
