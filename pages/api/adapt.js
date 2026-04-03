export default async function handler(req, res) {
  const { text, type } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({
      result: "No has introducido texto"
    });
  }

  let prompt = "";

  if (type === "facil") {
    prompt = `Simplifica el siguiente texto para un niño de 10 años.

Devuelve SOLO el texto adaptado.
NO añadas introducciones, explicaciones ni comentarios.
NO empieces con frases como "Claro" o "Aquí tienes".

Texto:
${text}`;
  }

  if (type === "tdah") {
    prompt = `Reescribe este texto para alguien con TDAH.

- Frases cortas
- Usa listas
- Destaca lo importante

Devuelve SOLO el resultado final.
NO añadas introducciones ni comentarios.

Texto:
${text}`;
  }

  if (type === "dislexia") {
    prompt = `Adapta este texto para dislexia.

- Lenguaje simple
- Frases cortas
- Estructura clara

Devuelve SOLO el texto adaptado.
NO añadas frases como "Aquí tienes" ni explicaciones.

Texto:
${text}`;
  }

  if (type === "esquema") {
    prompt = `Convierte este texto en un esquema tipo árbol.

Devuelve SOLO el esquema.
NO añadas introducciones ni explicaciones.

Texto:
${text}`;
  }

  try {
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

    res.status(200).json({
      result: data.choices?.[0]?.message?.content || "Sin resultado"
    });

  } catch (error) {
    res.status(500).json({
      result: "Error procesando texto"
    });
  }
}
