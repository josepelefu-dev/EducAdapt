export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb", // límite máximo realista en Vercel
    },
  },
};

export default async function handler(req, res) {
  try {
    let { text, type, level, file } = req.body;

    // 🚫 CONTROL DE ARCHIVO GRANDE
    if (file && file.data.length > 4000000) {
      return res.status(400).json({
        result: "Archivo demasiado grande. Máximo permitido: 4MB"
      });
    }

    // 📄 PROCESAR TXT (PDF lo dejamos para siguiente fase)
    if ((!text || text.trim() === "") && file) {
      if (file.type === "text/plain") {
        const buffer = Buffer.from(file.data, "base64");
        text = buffer.toString("utf-8");
      }

      if (file.type === "application/pdf") {
        return res.status(400).json({
          result: "PDF demasiado grande o no soportado todavía correctamente"
        });
      }
    }

    // 🔒 VALIDACIÓN
    if (!text || text.trim() === "") {
      return res.status(400).json({
        result: "No has introducido texto"
      });
    }

    let prompt = "";

    if (type === "facil") {
      prompt = `Simplifica este texto:\n\n${text}`;
    }

    if (type === "tdah") {
      prompt = `Adapta este texto para TDAH:\n\n${text}`;
    }

    if (type === "dislexia") {
      prompt = `Adapta este texto para dislexia:\n\n${text}`;
    }

    if (type === "esquema") {
      prompt = `Convierte en esquema:\n\n${text}`;
    }

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
      result: "Error interno"
    });
  }
}
