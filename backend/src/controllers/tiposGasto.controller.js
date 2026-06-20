const pool = require("../config/db");
const { fileUrl } = require("../middleware/upload.middleware");
const { limpiarImagenUrl, limpiarFilaImagen } = require("../utils/imageUrl");

const listarTiposGasto = async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM tipos_gasto WHERE estado = 'activo' ORDER BY nombre ASC"
    );

    return res.json(resultado.rows.map(limpiarFilaImagen));
  } catch (error) {
    console.error("Error listarTiposGasto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerTipoGasto = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "SELECT * FROM tipos_gasto WHERE id_tipo_gasto = $1",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Tipo de gasto no encontrado" });
    }

    return res.json(limpiarFilaImagen(resultado.rows[0]));
  } catch (error) {
    console.error("Error obtenerTipoGasto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const crearTipoGasto = async (req, res) => {
  try {
    const { nombre, descripcion, imagen_url } = req.body;
    const imagenFinal = fileUrl(req) || limpiarImagenUrl(imagen_url);

    if (!nombre) {
      return res.status(400).json({
        message: "El nombre del tipo de gasto es obligatorio",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO tipos_gasto 
       (nombre, descripcion, imagen_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, descripcion || null, imagenFinal]
    );

    return res.status(201).json({
      message: "Tipo de gasto creado correctamente",
      tipo_gasto: limpiarFilaImagen(resultado.rows[0]),
    });
  } catch (error) {
    console.error("Error crearTipoGasto:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        message: "Ese tipo de gasto ya existe",
      });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarTipoGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, imagen_url, estado } = req.body;
    const imagenFinal = fileUrl(req) || limpiarImagenUrl(imagen_url);

    const resultado = await pool.query(
      `UPDATE tipos_gasto
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           imagen_url = COALESCE($3, imagen_url),
           estado = COALESCE($4, estado),
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_tipo_gasto = $5
       RETURNING *`,
      [
        nombre || null,
        descripcion || null,
        imagenFinal,
        estado || null,
        id,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        message: "Tipo de gasto no encontrado",
      });
    }

    return res.json({
      message: "Tipo de gasto actualizado correctamente",
      tipo_gasto: limpiarFilaImagen(resultado.rows[0]),
    });
  } catch (error) {
    console.error("Error actualizarTipoGasto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const eliminarTipoGasto = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `UPDATE tipos_gasto
       SET estado = 'inactivo',
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_tipo_gasto = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        message: "Tipo de gasto no encontrado",
      });
    }

    return res.json({
      message: "Tipo de gasto eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminarTipoGasto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  listarTiposGasto,
  obtenerTipoGasto,
  crearTipoGasto,
  actualizarTipoGasto,
  eliminarTipoGasto,
};
