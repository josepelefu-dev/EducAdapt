export default async function handler(req, res) {
  try {
    const { text, type, level, mode, lang } = req.body;

    let levelPrompt = "";
    let typePrompt = "";

    // 🟢 NIVEL
    if (level === "basico") {
      levelPrompt = "Explica como para un niño de 10 años. Usa frases muy simples.";
    }

    if (level === "intermedio") {
      levelPrompt = "Explica de forma clara con ideas principales.";
    }

    if (level === "avanzado") {
      levelPrompt = "Explica con detalle y términos más avanzados.";
    }

    // 🎯 TIPO
    if (type === "facil") typePrompt = "Haz un resumen claro.";
    if (type === "tdah") typePrompt = "Texto corto, claro y separado.";
    if (type === "dislexia") typePrompt = "Frases simples y fáciles de leer.";
    if (type === "esquema") typePrompt = "Haz un esquema estructurado.";

    const languageInstruction =
      lang === "ca" ? "Respon en català." : "Responde en español.";

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
${typePrompt}
${levelPrompt}

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
