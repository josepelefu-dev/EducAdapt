export default async function handler(req, res) {
  const { text, type } = req.body;

  let prompt = "";
  if (type === "facil") prompt = `Simplifica este texto para un niño de 10 años:\n\n${text}`;
  if (type === "tdah") prompt = `Reescribe este texto para alguien con TDAH:
- Frases cortas
- Usa listas
- Destaca lo importante
${text}`;
  if (type === "dislexia") prompt = `Adapta este texto para dislexia:
- Lenguaje simple
- Frases cortas
- Estructura clara
${text}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4.1-mini", messages: [{ role: "user", content: prompt }] })
    });
    const data = await response.json();
    res.status(200).json({ result: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Error procesando texto" });
  }
}