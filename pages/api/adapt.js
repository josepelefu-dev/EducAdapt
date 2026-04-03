export default async function handler(req, res) {
  try {
    const { text, type, level } = req.body;

    let prompt = "";

    if (type === "facil") { 
  prompt = `Simplifica el siguiente texto para un estudiante de ${level}.

Devuelve SOLO el texto adaptado.
NO añadas introducciones, explicaciones ni comentarios.
Responde únicamente con el resultado final.

Texto:
${text}`;
}

    if (type === "tdah") {
  prompt = `Adapta este texto para un estudiante con TDAH de nivel ${level}.

- Usa frases cortas
- Usa listas
- Destaca lo importante

Devuelve SOLO el contenido adaptado.
NO añadas frases como "aquí tienes" ni comentarios adicionales.
Responde únicamente con el resultado final.

Texto:
${text}`;
}

    if (type === "dislexia") {
      prompt = `Adapta este texto para dislexia para nivel ${level}.
      
- Lenguaje simple
- Frases cortas
- Estructura clara

Devuelve SOLO el texto adaptado.
NO incluyas introducciones ni explicaciones.
Responde únicamente con el resultado final.

Texto:
${text}`;
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
