export default async function handler(req, res) {
  try {
    const { text, type } = req.body;

    let prompt = "";

    if (type === "facil") {
      prompt = `Simplifica este texto:\n\n${text}`;
    }

    if (type === "tdah") {
      prompt = `Reescribe para TDAH:\n\n${text}`;
    }

    if (type === "dislexia") {
      prompt = `Adapta para dislexia:\n\n${text}`;
    }

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

    // 👇 CLAVE: DEVOLVER ERROR REAL
    if (!response.ok) {
      return res.status(500).json({
        error: data
      });
    }

    return res.status(200).json({
      result: data.choices?.[0]?.message?.content || "Sin respuesta"
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
