import { v2 as cloudinary } from "cloudinary";
import pdf from "pdf-parse";

// 🔐 Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  try {
    let { text, type, fileUrl } = req.body;

    // 📄 SI VIENE PDF DESDE CLOUDINARY
    if ((!text || text.trim() === "") && fileUrl) {
      try {
        const response = await fetch(fileUrl);
        const buffer = Buffer.from(await response.arrayBuffer());

        const pdfData = await pdf(buffer);
        text = pdfData.text;
      } catch (err) {
        console.error(err);
        return res.status(500).json({
          result: "Error leyendo el PDF"
        });
      }
    }

    // 🔒 VALIDACIÓN
    if (!text || text.trim() === "") {
      return res.status(400).json({
        result: "No hay texto válido"
      });
    }

    let prompt = "";

    if (type === "facil") {
      prompt = `Simplifica este texto para un niño de 10 años:\n\n${text}`;
    }

    if (type === "tdah") {
      prompt = `Reescribe este texto para alguien con TDAH:
- Frases cortas
- Usa listas
- Destaca lo importante

${text}`;
    }

    if (type === "dislexia") {
      prompt = `Adapta este texto para dislexia:
- Lenguaje simple
- Frases cortas
- Estructura clara

${text}`;
    }

    if (type === "esquema") {
      prompt = `Convierte este texto en esquema tipo árbol:

Tema
 ├── Idea
 │    ├── Detalle

${text}`;
    }

    // 🧠 LLAMADA A IA
    const responseAI = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const data = await responseAI.json();

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
