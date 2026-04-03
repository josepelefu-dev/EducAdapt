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
      prompt = `Simplifica el siguiente texto para un estudiante de nivel ${level}.

- Lenguaje sencillo
- Frases cortas
- Explicación clara

Devuelve SOLO el texto adaptado.

Texto:
${text}`;
    }

    // 🟡 TDAH
    if (type === "tdah") {
      prompt = `Adapta este texto para TDAH (nivel ${level}):

- Frases muy cortas
- Usa listas
- Destaca lo importante en MAYÚSCULAS
- Elimina lo secundario

Devuelve SOLO el resultado.

Texto:
${text}`;
    }

    // 🔵 DISLEXIA
    if (type === "dislexia") {
      prompt = `Adapta este texto para dislexia (nivel ${level}):

- Lenguaje simple
- Frases cortas
- Estructura clara

Devuelve SOLO el texto adaptado.

Texto:
${text}`;
    }

    // 🌳 ESQUEMA
    if (type === "esquema") {
      prompt = `Convierte este texto en un esquema tipo árbol:

Tema
 ├── Idea
 │    ├── Detalle

Devuelve SOLO el esquema.

Texto:
${text}`;
    }

    // 🧠 LLAMADA IA
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

    if (!response.ok) {
      return res.status(500).json({
        result: "Error en la IA"
      });
    }

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
