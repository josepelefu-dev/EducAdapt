export default async function handler(req, res) {
  try {
    const { text, type, level } = req.body;

    // 🔒 VALIDACIÓN
    if (!text || text.trim() === "") {
      return res.status(400).json({
        result: "No has introducido texto"
      });
    }

    let prompt = "";

    // 🟢 FÁCIL
    if (type === "facil") {
      prompt = `Eres un experto en educación.

Adapta el siguiente texto para un estudiante de nivel ${level}.

REGLAS:
- Lenguaje sencillo
- Frases cortas
- Explicación clara
- Mantener el significado original

PROHIBIDO:
- Añadir explicaciones externas
- Comentarios innecesarios

Devuelve SOLO el texto adaptado.

Texto:
${text}`;
    }

    // 🟡 TDAH (MUY CONTROLADO)
    if (type === "tdah") {
      prompt = `Eres un experto en pedagogía especializado en TDAH.

Adapta el siguiente contenido para un estudiante con TDAH de nivel ${level}.

REGLAS OBLIGATORIAS:
- Frases muy cortas (máx 12 palabras)
- Usa listas con viñetas
- Separa ideas claramente
- Destaca conceptos clave en MAYÚSCULAS
- Elimina información secundaria
- Solo contenido esencial

PROHIBIDO:
- Explicaciones adicionales
- Introducciones
- Comentarios

Devuelve SOLO el contenido final.

Texto:
${text}`;
    }

    // 🔵 DISLEXIA (OPTIMIZADO)
    if (type === "dislexia") {
      prompt = `Eres un especialista en dislexia.

Adapta el siguiente texto para un estudiante con dislexia de nivel ${level}.

REGLAS:
- Frases muy cortas
- Vocabulario sencillo
- Evitar palabras complejas
- Estructura clara
- Dividir en bloques pequeños

PROHIBIDO:
- Añadir información nueva
- Explicaciones externas

Devuelve SOLO el texto adaptado.

Texto:
${text}`;
    }

    // 🌳 ESQUEMA (NUEVO)
    if (type === "esquema") {
      prompt = `Convierte el siguiente texto en un esquema tipo árbol para nivel ${level}.

FORMATO OBLIGATORIO:

Tema principal
 ├── Idea clave
 │    ├── Detalle
 ├── Otra idea

REGLAS:
- Jerarquía clara
- Muy organizado
- Solo contenido esencial

Devuelve SOLO el esquema.

Texto:
${text}`;
    }

    // 🧠 PRIMER PROCESADO
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        result: "Error en IA (verifica API key o saldo)"
      });
    }

    const firstResult = data.choices?.[0]?.message?.content;

    // 🔍 VALIDACIÓN EXTRA
    if (!firstResult) {
      return res.status(500).json({
        result: "Error generando contenido"
      });
    }

    // 🧠 SEGUNDO PROCESADO (MEJORA CALIDAD)
    const secondResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{
          role: "user",
          content: `Mejora este contenido para que sea más claro, estructurado y pedagógicamente correcto.

NO añadas explicaciones.

Contenido:
${firstResult}`
        }]
      })
    });

    const secondData = await secondResponse.json();

    const finalResult = secondData.choices?.[0]?.message?.content || firstResult;

    return res.status(200).json({
      result: finalResult
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      result: "Error interno del servidor"
    });
  }
}
