export default async function handler(req, res) {
  const { text, type } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({
      result: "No has introducido texto"
    });
  }

  let prompt = "";

  // 🟢 FÁCIL
  if (type === "facil") {
    prompt = `Simplifica el siguiente texto para un niño de 10 años.

REGLAS:
- Frases cortas
- Lenguaje muy sencillo
- Explicación clara

Devuelve SOLO el texto final.
SIN introducciones ni comentarios.

Texto:
${text}`;
  }

  // 🟡 TDAH (MEJORADO PRO)
  if (type === "tdah") {
    prompt = `Adapta este texto para una persona con TDAH.

REGLAS OBLIGATORIAS:
- Usa listas con guiones (-)
- Máximo 1 idea por línea
- Frases muy cortas (menos de 10 palabras)
- Palabras clave en MAYÚSCULAS
- Elimina lo irrelevante

FORMATO EJEMPLO:
- IDEA PRINCIPAL
- detalle corto
- otra IDEA CLAVE

Devuelve SOLO el contenido final.
SIN explicaciones ni introducciones.

Texto:
${text}`;
  }

  // 🔵 DISLEXIA (FORMATO ESPECIAL)
  if (type === "dislexia") {
    prompt = `Adapta este texto para dislexia.

REGLAS OBLIGATORIAS:
- Frases muy cortas
- Una idea por línea
- Lenguaje muy simple
- Evita palabras difíciles
- Divide en bloques

FORMATO:
Cada frase en una línea nueva.

Ejemplo:
La célula es una unidad.
Está en los seres vivos.
Tiene funciones básicas.

Devuelve SOLO el contenido.
SIN introducciones.

Texto:
${text}`;
  }

  // 🌳 ESQUEMA (MUY VISUAL)
  if (type === "esquema") {
    prompt = `Convierte este texto en un esquema tipo árbol MUY claro.

FORMATO OBLIGATORIO:

TEMA PRINCIPAL
 ├── IDEA 1
 │    ├── detalle
 │    ├── detalle
 ├── IDEA 2
 │    ├── detalle

REGLAS:
- Jerarquía clara
- Palabras clave en MAYÚSCULAS
- Muy organizado
- Solo contenido importante

Devuelve SOLO el esquema.
SIN explicaciones.

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
