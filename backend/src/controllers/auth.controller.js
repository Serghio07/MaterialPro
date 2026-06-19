const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { fileUrl } = require("../middleware/upload.middleware");

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, usuario, email, password, imagen_url } = req.body;
    const imagenFinal = fileUrl(req) || imagen_url || null;

    if (!nombre || !usuario || !email || !password) {
      return res.status(400).json({
        message: "Nombre, usuario, email y password son obligatorios",
      });
    }

    const existeUsuario = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE usuario = $1 OR email = $2",
      [usuario, email]
    );

    if (existeUsuario.rows.length > 0) {
      return res.status(400).json({
        message: "El usuario o email ya existe",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, usuario, email, password, imagen_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_usuario, nombre, usuario, email, estado, imagen_url, fecha_creacion`,
      [nombre, usuario, email, passwordHash, imagenFinal]
    );

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error registrarUsuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        message: "Usuario y password son obligatorios",
      });
    }

    const resultado = await pool.query("SELECT * FROM usuarios WHERE usuario = $1", [
      usuario,
    ]);

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

    const token = jwt.sign(
      {
        id_usuario: usuarioDB.id_usuario,
        usuario: usuarioDB.usuario,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login correcto",
      token,
      usuario: {
        id_usuario: usuarioDB.id_usuario,
        nombre: usuarioDB.nombre,
        usuario: usuarioDB.usuario,
        email: usuarioDB.email,
        estado: usuarioDB.estado,
        imagen_url: usuarioDB.imagen_url,
      },
    });
  } catch (error) {
    console.error("Error loginUsuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id_usuario, nombre, usuario, email, estado, imagen_url, fecha_creacion
       FROM usuarios
       WHERE id_usuario = $1`,
      [req.usuario.id_usuario]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error obtenerPerfil:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
};
