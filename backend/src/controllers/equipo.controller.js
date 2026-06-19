const pool = require("../config/db");
const { fileUrl } = require("../middleware/upload.middleware");

const listarEquipo = async (req, res) => {
  try {
    const { buscar } = req.query;
    const params = [];
    let query = "SELECT * FROM equipo WHERE 1 = 1";
    if (buscar) {
      params.push(`%${buscar}%`);
      query += ` AND (nombre ILIKE $${params.length} OR celular ILIKE $${params.length} OR cargo ILIKE $${params.length})`;
    }
    query += " ORDER BY nombre ASC";
    const resultado = await pool.query(query, params);
    return res.json(resultado.rows);
  } catch (error) {
    console.error("Error listarEquipo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerIntegrante = async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM equipo WHERE id_equipo = $1", [req.params.id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Integrante no encontrado" });
    }
    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error obtenerIntegrante:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const crearIntegrante = async (req, res) => {
  try {
    const { nombre, celular, cargo, imagen_url, observacion, estado } = req.body;
    const imagenFinal = fileUrl(req) || imagen_url || null;
    if (!nombre || !celular) {
      return res.status(400).json({ message: "Nombre y celular son obligatorios" });
    }
    const resultado = await pool.query(
      `INSERT INTO equipo (nombre, celular, cargo, imagen_url, observacion, estado)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, celular, cargo || null, imagenFinal, observacion || null, estado || "activo"]
    );
    return res.status(201).json({ message: "Integrante guardado", integrante: resultado.rows[0] });
  } catch (error) {
    console.error("Error crearIntegrante:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarIntegrante = async (req, res) => {
  try {
    const { nombre, celular, cargo, imagen_url, observacion, estado } = req.body;
    const imagenFinal = fileUrl(req) || imagen_url || null;
    const resultado = await pool.query(
      `UPDATE equipo
       SET nombre = COALESCE($1, nombre),
           celular = COALESCE($2, celular),
           cargo = COALESCE($3, cargo),
           imagen_url = COALESCE($4, imagen_url),
           observacion = COALESCE($5, observacion),
           estado = COALESCE($6, estado),
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_equipo = $7
       RETURNING *`,
      [nombre || null, celular || null, cargo || null, imagenFinal, observacion || null, estado || null, req.params.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Integrante no encontrado" });
    }
    return res.json({ message: "Integrante actualizado", integrante: resultado.rows[0] });
  } catch (error) {
    console.error("Error actualizarIntegrante:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const eliminarIntegrante = async (req, res) => {
  try {
    const resultado = await pool.query(
      `UPDATE equipo
       SET estado = 'inactivo', fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_equipo = $1
       RETURNING *`,
      [req.params.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Integrante no encontrado" });
    }
    return res.json({ message: "Integrante desactivado" });
  } catch (error) {
    console.error("Error eliminarIntegrante:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  listarEquipo,
  obtenerIntegrante,
  crearIntegrante,
  actualizarIntegrante,
  eliminarIntegrante,
};
