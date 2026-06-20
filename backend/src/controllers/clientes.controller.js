const pool = require("../config/db");
const { fileUrl } = require("../middleware/upload.middleware");
const { limpiarImagenUrl, limpiarFilaImagen } = require("../utils/imageUrl");

const listarClientes = async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM clientes WHERE estado = 'activo' ORDER BY nombre ASC"
    );

    return res.json(resultado.rows.map(limpiarFilaImagen));
  } catch (error) {
    console.error("Error listarClientes:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "SELECT * FROM clientes WHERE id_cliente = $1",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    return res.json(limpiarFilaImagen(resultado.rows[0]));
  } catch (error) {
    console.error("Error obtenerCliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const crearCliente = async (req, res) => {
  try {
    const { nombre, telefono, direccion, imagen_url } = req.body;
    const imagenFinal = fileUrl(req) || limpiarImagenUrl(imagen_url);

    if (!nombre) {
      return res.status(400).json({
        message: "El nombre del cliente es obligatorio",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO clientes 
       (nombre, telefono, direccion, imagen_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        nombre,
        telefono || null,
        direccion || null,
        imagenFinal,
      ]
    );

    return res.status(201).json({
      message: "Cliente creado correctamente",
      cliente: limpiarFilaImagen(resultado.rows[0]),
    });
  } catch (error) {
    console.error("Error crearCliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, direccion, imagen_url, estado } = req.body;
    const imagenFinal = fileUrl(req) || limpiarImagenUrl(imagen_url);

    const resultado = await pool.query(
      `UPDATE clientes
       SET nombre = COALESCE($1, nombre),
           telefono = COALESCE($2, telefono),
           direccion = COALESCE($3, direccion),
           imagen_url = COALESCE($4, imagen_url),
           estado = COALESCE($5, estado),
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_cliente = $6
       RETURNING *`,
      [
        nombre || null,
        telefono || null,
        direccion || null,
        imagenFinal,
        estado || null,
        id,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    return res.json({
      message: "Cliente actualizado correctamente",
      cliente: limpiarFilaImagen(resultado.rows[0]),
    });
  } catch (error) {
    console.error("Error actualizarCliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `UPDATE clientes
       SET estado = 'inactivo',
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_cliente = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    return res.json({
      message: "Cliente eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminarCliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};
