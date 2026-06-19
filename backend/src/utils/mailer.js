const nodemailer = require("nodemailer");

const createTransporter = () => {
  const missingCredentials =
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_USER === "tu_correo@gmail.com" ||
    process.env.EMAIL_PASS === "tu_app_password_de_gmail";

  if (missingCredentials) {
    return nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/[\s-]/g, ""),
    },
  });
};

const enviarCodigoVerificacion = async ({ email, nombre, codigo }) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_USER || "no-reply@materialpro.local";

  await transporter.sendMail({
    from,
    to: email,
    subject: "Codigo de verificacion MaterialPro",
    text: `Hola ${nombre || ""}, tu codigo de verificacion MaterialPro es: ${codigo}. Expira en 10 minutos.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>MaterialPro</h2>
        <p>Hola ${nombre || ""}, usa este codigo para verificar tu cuenta:</p>
        <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${codigo}</p>
        <p>Este codigo expira en 10 minutos.</p>
      </div>
    `,
  });
};

module.exports = {
  enviarCodigoVerificacion,
};
