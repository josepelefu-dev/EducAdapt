export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🧠 NIVELES (DIFERENCIA REAL Y CONTROLADA)
    if (level === "basico") {
      levelPrompt = `
Adapta el contenido para un estudiante de 11-12 años.

REGLAS OBLIGATORIAS:
- Reduce el contenido al 30-40% del original.
- Quédate SOLO con lo esencial.
- Elimina ejemplos, detalles y evolución compleja.
- NO incluyas listas largas de conceptos.
- Frases muy claras y cortas.

OBJETIVO:
- Debe leerse rápido.
- Debe entenderse sin esfuerzo.
- Debe ser claramente más corto que los otros niveles.

MUY IMPORTANTE:
- NO añadas títulos.
- NO expliques lo que haces.
- Empieza directamente con el contenido.
`;
    }

    if (level === "intermedio") {
      levelPrompt = `
Adapta el contenido para un estudiante de 13-14 años.

REGLAS:
- Reduce el contenido al 55-65% del original.
- Mantén ideas importantes.
- Explica lo necesario sin profundizar demasiado.
- Puedes incluir ejemplos simples.

OBJETIVO:
- Explicación clara + algo de desarrollo.

MUY IMPORTANTE:
- Debe ser más largo que el básico.
- Debe ser más corto que el avanzado.
- NO añadas títulos.
- Empieza directamente.
`;
    }

    if (level === "avanzado") {
      levelPrompt = `
Adapta el contenido para un estudiante de 15-16 años.

REGLAS:
- Mantén el 80-90% del contenido.
- Incluye detalles relevantes.
- Explicación completa pero clara.
- Usa lenguaje académico sencillo.

OBJETIVO:
- Comprensión profunda.

MUY IMPORTANTE:
- Debe ser el más largo.
- NO añadas títulos.
- Empieza directamente.
`;
    }

    // 🎯 TIPOS
    if (type === "facil") {
      typePrompt = `
Haz un resumen adaptado al nivel.

REGLAS:
- Respeta la longitud según nivel (MUY IMPORTANTE).
- Mantén coherencia.
- No inventes información.
- No reduzcas todo a pocas líneas.

OBJETIVO:
- Que cada nivel sea claramente diferente.
`;
    }

    if (type === "tdah") {
      typePrompt = `
Adapta para TDAH.

REGLAS:
- Una idea por línea.
- Frases cortas.
- Espacios entre líneas.
- Evita texto largo.

OBJETIVO:
- Lectura rápida y clara.
`;
    }

    if (type === "dislexia") {
      typePrompt = `
Adapta para dislexia.

REGLAS:
- Frases cortas.
- Palabras simples.
- Estructura clara.
- Evita complejidad.

OBJETIVO:
- Facilitar lectura.
`;
    }

    // 🌳 ESQUEMA PRO LIMPIO
    if (type === "esquema") {
      typePrompt = `
Convierte el contenido en un esquema tipo árbol CLARO y LIMPIO.

REGLAS OBLIGATORIAS:
- SOLO usar estos símbolos:
  - "📌" para tema principal
  - "-" para nivel 1
  - "  -" para nivel 2
  - "    -" para nivel 3

FORMATO EJEMPLO:

📌 PREHISTORIA
- Definición
  - Antes escritura
- Etapas
  - Edad Piedra
    - Paleolítico
    - Neolítico
- Características
  - Herramientas
  - Fuego

REGLAS CLAVE:
- SOLO palabras clave (máx 5-6 palabras)
- NO frases largas
- NO símbolos raros (↳, │, ├, etc.)
- NO repetir títulos
- NO escribir párrafos
- Máximo 3 niveles

OBJETIVO:
- Esquema visual para estudiar
- Fácil de memorizar
- Limpio y ordenado

MUY IMPORTANTE:
- Empieza directamente con el esquema
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
