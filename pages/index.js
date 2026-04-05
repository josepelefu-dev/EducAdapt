const exportPDF = () => {
  if (!result) return;

  const formatted = formatResult(result).replace(/\n/g, "<br>");

  const colorMap = {
    facil: "#6366f1",
    tdah: "#f59e0b",
    dislexia: "#10b981",
    esquema: "#0ea5e9"
  };

  const color = colorMap[type] || "#6366f1";

  // ✅ URL absoluta del logo
  const logoUrl = window.location.origin + "/logo.jpg";

  const win = window.open("", "_blank");

  win.document.write(`
    <html>
      <head>
        <title>EducAdapt PDF</title>
        <style>
          body {
            font-family: Arial;
            margin: 0;
            color: #111;
          }

          .page {
            padding: 40px;
            page-break-after: always;
          }

          .cover {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: ${color};
            color: white;
            text-align: center;
          }

          .cover img {
            width: 100px;
            margin-bottom: 20px;
          }

          .header {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .header img {
            width: 40px;
          }

          .title {
            color: ${color};
          }

          .meta {
            margin-top: 10px;
            font-size: 14px;
            color: #555;
          }

          .content {
            margin-top: 20px;
            line-height: 1.6;
            font-size: 16px;
          }

          .footer {
            position: fixed;
            bottom: 10px;
            right: 20px;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>

      <body>

        <!-- PORTADA -->
        <div class="cover page">
          <img src="${logoUrl}" />
          <h1>EducAdapt</h1>
          <p>${type.toUpperCase()} - ${level.toUpperCase()}</p>
          <p>${new Date().toLocaleDateString()}</p>
        </div>

        <!-- CONTENIDO -->
        <div class="page">

          <div class="header">
            <img src="${logoUrl}" />
            <h2 class="title">EducAdapt</h2>
          </div>

          <div class="meta">
            <strong>Tipo:</strong> ${type} <br>
            <strong>Nivel:</strong> ${level} <br>
            <strong>Modo:</strong> ${mode}
          </div>

          <div class="content">
            ${formatted}
          </div>

          <div class="footer">
            Página 1
          </div>

        </div>

      </body>
    </html>
  `);

  win.document.close();
  win.print();
};
