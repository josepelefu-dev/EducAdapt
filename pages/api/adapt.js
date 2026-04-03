import pdf from "pdf-parse";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb", // 🔥 importante para PDFs
    },
  },
};

export default async function handler(req, res) {
  try {
    let { text, type, level, file } = req.body;

    // 📄 PROCESAR ARCHIVO
    if ((!text || text.trim() === "") && file) {
      try {
        const buffer = Buffer.from(file.data, "base64");

        // ✅ PDF REAL
        if (file.type === "application/pdf") {
          const pdfData = await pdf(buffer);
          text = pdfData.text;
        }

        // ✅ TXT
        if (file.type === "text/plain") {
          text = buffer.toString("utf-8");
        }

      } catch (err) {
        console.error(err);
        return res.status(500).json({
          result: "Error leyendo el archivo PDF"
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

    // 🟢 FÁCIL
    if (type === "facil") {
      prompt = `Simplifica este texto para nivel ${level}:

- Lenguaje sencillo
- Frases cortas

Texto:
${text}`;
    }

    // 🟡 TDAH
    if (type === "tdah") {
      prompt = `Adapta este texto para TDAH (nivel ${level}):

- Frases muy cortas
- Usa listas
- Destaca lo importante

Texto:
${text}`;
    }

    // 🔵 DISLEXIA
    if (type === "dislexia") {
      prompt = `Adapta este texto para dislexia (nivel ${level}):

- Lenguaje simple
- Frases cortas
- Estructura clara

Texto:
${text}`;
    }

    // 🌳 ESQUEMA
    if (type === "esquema") {
      prompt = `Convierte en esquema tipo árbol:

Tema
 ├── Idea
 │    ├── Detalle

Texto:
${text}`;
    }

    // 🧠 IA
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
