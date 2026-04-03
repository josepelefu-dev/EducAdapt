export default async function handler(req, res) {
  try {
    const { text, type, mode, level, lang } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        result: "No has introducido texto"
      });
    }

    // 🌍 IDIOMA
    let languageInstruction = "";
    if (lang === "ca") {
      languageInstruction = "Respon en català.";
    } else {
      languageInstruction = "Responde en castellano.";
    }

    // 🎯 NIVEL
    let levelInstruction = "";

    if (level === "basico") {
      levelInstruction = `
- Lenguaje muy sencillo
- Frases muy cortas
- Evitar palabras difíciles
`;
    }

    if (level === "intermedio") {
      levelInstruction = `
- Lenguaje claro
- Explicación estructurada
`;
    }

    if (level === "avanzado") {
      levelInstruction = `
- Mantener términos técnicos
- Explicación más completa
`;
    }

    let prompt = "";

    // 👨‍🏫 MODO PROFESOR
    if (mode === "profesor") {
      prompt = `${languageInstruction}

Adapta este contenido para uso docente.

REGLAS:
- Explicación clara
- Estructura didáctica
- Bien organizado

NIVEL:
${levelInstruction}

Devuelve SOLO el contenido.
SIN introducciones.

Texto:
${text}`;
    }

    // 🧑‍🎓 MODO ALUMNO
    else {

      // 🟢 RESUMEN
      if (type === "facil") {
        prompt = `${languageInstruction}

Simplifica el siguiente texto.

${levelInstruction}

Devuelve SOLO el texto.
SIN introducciones ni comentarios.

Texto:
${text}`;
      }

      // 🟡 TDAH
      if (type === "tdah") {
        prompt = `${languageInstruction}

Adapta este texto para TDAH.

${levelInstruction}

REGLAS:
- Usa listas
- Una idea por línea
- Destaca palabras clave en MAYÚSCULAS

Devuelve SOLO el resultado.

Texto:
${text}`;
      }

      // 🔵 DISLEXIA
      if (type === "dislexia") {
        prompt = `${languageInstruction}

Adapta este texto para dislexia.

${levelInstruction}

REGLAS:
- Una frase por línea
- Muy fácil de leer

Devuelve SOLO el texto.

Texto:
${text}`;
      }

      // 🌳 ESQUEMA
      if (type === "esquema") {
        prompt = `${languageInstruction}

Convierte este texto en un esquema tipo árbol.

${levelInstruction}

FORMATO:
TEMA
 ├── IDEA
 │    ├── DETALLE

Devuelve SOLO el esquema.

Texto:
${text}`;
      }
    }

    // 🤖 LLAMADA IA
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      result: data.choices?.[0]?.message?.content || "Sin resultado"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      result: "Error interno del servidor"
    });
  }
}
