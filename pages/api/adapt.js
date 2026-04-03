import pdf from "pdf-parse";

export default async function handler(req, res) {
  try {
    let { text, type, level, file } = req.body;

    // 📄 PROCESAR ARCHIVO SI EXISTE
    if ((!text || text.trim() === "") && file) {
      try {
        const buffer = Buffer.from(file.data, "base64");

        if (file.type === "application/pdf") {
          const pdfData = await pdf(buffer);
          text = pdfData.text;
        }

        if (file.type === "text/plain") {
          text = buffer.toString("utf-8");
        }

      } catch (err) {
        return res.status(500).json({
          result: "Error leyendo el archivo"
        });
      }
    }

    // 🔒 VALIDACIÓN
    if (!text || text.trim() === "") {
      return res.status(400).json({
        result: "No has introducido texto ni archivo válido"
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
- Listas claras
- Destaca lo importante en MAYÚSCULAS
- Elimina lo secundario

Devuelve SOLO el resultado.

Texto:
${text}`;
    }

    // 🔵 DISLEXIA
    if (type === "dislexia") {
      prompt = `Adapta este texto para dislexia (nivel ${level}):

- Frases cortas
- Lenguaje simple
- Estructura clara

Devuelve SOLO el texto adaptado.

Texto:
${text}`;
    }

    // 🌳 ESQUEMA
    if (type === "esquema") {
      prompt = `Convierte este texto en un esquema tipo árbol (nivel ${level}):

Formato:
Tema
 ├── Idea
 │    ├── Detalle

Devuelve SOLO el esquema.

Texto:
${text}`;
    }

    // 🧠 LLAMADA A OPENAI
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
        result: "Error en IA"
      });
    }

    const result = data.choices?.[0]?.message?.content;

    return res.status(200).json({
      result: result || "Sin resultado"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      result: "Error interno del servidor"
    });
  }
}
