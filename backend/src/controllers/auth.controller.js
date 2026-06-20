const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { fileUrl } = require("../middleware/upload.middleware");
const { enviarCodigoVerificacion } = require("../utils/mailer");
const { limpiarImagenUrl, limpiarFilaImagen } = require("../utils/imageUrl");

const normalizarEmail = (email = "") => String(email).trim().toLowerCase();
const esGmail = (email = "") => /^[^\s@]+@gmail\.com$/i.test(email);
const generarCodigo = () => String(Math.floor(100000 + Math.random() * 900000));

const usuarioSeguro = (usuario) => ({
  id_usuario: usuario.id_usuario,
  nombre: usuario.nombre,
  email: usuario.email,
  estado: usuario.estado,
  email_verificado: usuario.email_verificado,
  imagen_url: limpiarImagenUrl(usuario.imagen_url),
});

const errorCorreo = (error) =>
  error?.code === "EAUTH" ||
  error?.responseCode === 535 ||
  String(error?.message || "").toLowerCase().includes("invalid login");

const registrarUsuario = async (req, res) => {
  let client;

  try {
    const { nombre, email, password, confirmarPassword, imagen_url } = req.body;
    const emailNormalizado = normalizarEmail(email);
    const imagenFinal = fileUrl(req) || limpiarImagenUrl(imagen_url);

    if (!nombre || !emailNormalizado || !password || !confirmarPassword) {
      return res.status(400).json({
        message: "Nombre, Gmail, password y confirmacion son obligatorios",
      });
    }

    if (!esGmail(emailNormalizado)) {
      return res.status(400).json({ message: "Solo se permiten correos @gmail.com" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "La contrasena debe tener minimo 6 caracteres" });
    }

    if (password !== confirmarPassword) {
      return res.status(400).json({ message: "Las contrasenas no coinciden" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const codigo = generarCodigo();
    const codigoExpira = new Date(Date.now() + 10 * 60 * 1000);
    client = await pool.connect();
    await client.query("BEGIN");

    const existeUsuario = await client.query(
      "SELECT id_usuario, email_verificado FROM usuarios WHERE email = $1",
      [emailNormalizado]
    );

    if (existeUsuario.rows.length > 0) {
      const usuarioExistente = existeUsuario.rows[0];

      if (usuarioExistente.email_verificado) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "El Gmail ya existe" });
      }

      await client.query(
        `UPDATE usuarios
         SET nombre = $1,
             password = $2,
             imagen_url = COALESCE($3, imagen_url),
             codigo_verificacion = $4,
             codigo_expira = $5,
             fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id_usuario = $6`,
        [
          String(nombre).trim(),
          passwordHash,
          imagenFinal,
          codigo,
          codigoExpira,
          usuarioExistente.id_usuario,
        ]
      );

      await enviarCodigoVerificacion({ email: emailNormalizado, nombre, codigo });
      await client.query("COMMIT");

      return res.status(200).json({
        message: "Tu cuenta aun no estaba verificada. Te enviamos un nuevo codigo a tu Gmail.",
        email: emailNormalizado,
      });
    }

    await client.query(
      `INSERT INTO usuarios (
        nombre, email, password, imagen_url, email_verificado, codigo_verificacion, codigo_expira
       )
       VALUES ($1, $2, $3, $4, false, $5, $6)`,
      [String(nombre).trim(), emailNormalizado, passwordHash, imagenFinal, codigo, codigoExpira]
    );

    await enviarCodigoVerificacion({ email: emailNormalizado, nombre, codigo });
    await client.query("COMMIT");

    return res.status(201).json({
      message: "Usuario registrado correctamente. Revisa tu Gmail para verificar tu cuenta.",
      email: emailNormalizado,
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Error registrarUsuario:", error);

    if (errorCorreo(error)) {
      return res.status(502).json({
        message: "No se pudo enviar el codigo. Revisa EMAIL_USER y EMAIL_PASS en el backend.",
      });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNormalizado = normalizarEmail(email);

    if (!emailNormalizado || !password) {
      return res.status(400).json({
        message: "Gmail y password son obligatorios",
      });
    }

    if (!esGmail(emailNormalizado)) {
      return res.status(400).json({ message: "Solo se permiten correos @gmail.com" });
    }

    const resultado = await pool.query("SELECT * FROM usuarios WHERE email = $1", [emailNormalizado]);

    if (resultado.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const usuarioDB = resultado.rows[0];

    if (usuarioDB.estado !== "activo") {
      return res.status(403).json({ message: "Usuario inactivo" });
    }

    const passwordValido = await bcrypt.compare(password, usuarioDB.password);

    if (!passwordValido) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    if (!usuarioDB.email_verificado) {
      return res.status(403).json({
        message: "Debes verificar tu Gmail antes de iniciar sesion",
        email: usuarioDB.email,
      });
    }

    const token = jwt.sign(
      {
        id_usuario: usuarioDB.id_usuario,
        email: usuarioDB.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login correcto",
      token,
      usuario: usuarioSeguro(usuarioDB),
    });
  } catch (error) {
    console.error("Error loginUsuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const verificarEmail = async (req, res) => {
  try {
    const { email, codigo } = req.body;
    const emailNormalizado = normalizarEmail(email);

    if (!emailNormalizado || !codigo) {
      return res.status(400).json({ message: "Gmail y codigo son obligatorios" });
    }

    if (!/^\d{6}$/.test(String(codigo))) {
      return res.status(400).json({ message: "El codigo debe tener 6 digitos" });
    }

    const resultado = await pool.query(
      "SELECT id_usuario, codigo_verificacion, codigo_expira FROM usuarios WHERE email = $1",
      [emailNormalizado]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Gmail no encontrado" });
    }

    const usuarioDB = resultado.rows[0];

    if (usuarioDB.codigo_verificacion !== String(codigo)) {
      return res.status(400).json({ message: "Codigo incorrecto." });
    }

    if (!usuarioDB.codigo_expira || new Date(usuarioDB.codigo_expira).getTime() < Date.now()) {
      return res.status(400).json({ message: "El codigo expiro. Solicita uno nuevo." });
    }

    await pool.query(
      `UPDATE usuarios
       SET email_verificado = true,
           codigo_verificacion = NULL,
           codigo_expira = NULL,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_usuario = $1`,
      [usuarioDB.id_usuario]
    );

    return res.json({ message: "Cuenta verificada correctamente" });
  } catch (error) {
    console.error("Error verificarEmail:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const reenviarCodigo = async (req, res) => {
  try {
    const { email } = req.body;
    const emailNormalizado = normalizarEmail(email);

    if (!emailNormalizado) {
      return res.status(400).json({ message: "Gmail es obligatorio" });
    }

    if (!esGmail(emailNormalizado)) {
      return res.status(400).json({ message: "Solo se permiten correos @gmail.com" });
    }

    const resultado = await pool.query(
      "SELECT id_usuario, nombre, email_verificado FROM usuarios WHERE email = $1",
      [emailNormalizado]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Gmail no encontrado" });
    }

    const usuarioDB = resultado.rows[0];

    if (usuarioDB.email_verificado) {
      return res.status(400).json({ message: "Esta cuenta ya fue verificada" });
    }

    const codigo = generarCodigo();
    const codigoExpira = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `UPDATE usuarios
       SET codigo_verificacion = $1,
           codigo_expira = $2,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_usuario = $3`,
      [codigo, codigoExpira, usuarioDB.id_usuario]
    );

    await enviarCodigoVerificacion({ email: emailNormalizado, nombre: usuarioDB.nombre, codigo });

    return res.json({ message: "Codigo reenviado correctamente" });
  } catch (error) {
    console.error("Error reenviarCodigo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id_usuario, nombre, email, estado, email_verificado, imagen_url, fecha_creacion
       FROM usuarios
       WHERE id_usuario = $1`,
      [req.usuario.id_usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(limpiarFilaImagen(resultado.rows[0]));
  } catch (error) {
    console.error("Error obtenerPerfil:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  verificarEmail,
  reenviarCodigo,
  obtenerPerfil,
};
