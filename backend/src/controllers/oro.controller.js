const pool = require("../config/db");
const { fileUrl } = require("../middleware/upload.middleware");

const listarOro = async (req, res) => {
  try {
    const { desde, hasta, lugar } = req.query;
    const params = [];
    let query = "SELECT * FROM registros_oro WHERE 1 = 1";

    if (desde) {
      params.push(desde);
      query += ` AND fecha >= $${params.length}`;
    }
    if (hasta) {
      params.push(hasta);
      query += ` AND fecha <= $${params.length}`;
    }
    if (lugar) {
      params.push(`%${lugar}%`);
      query += ` AND lugar ILIKE $${params.length}`;
    }

    query += " ORDER BY fecha DESC, fecha_creacion DESC";
    const resultado = await pool.query(query, params);
    return res.json(resultado.rows);
  } catch (error) {
    console.error("Error listarOro:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerOro = async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM registros_oro WHERE id_registro_oro = $1",
      [req.params.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Registro de oro no encontrado" });
    }
    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error obtenerOro:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const crearOro = async (req, res) => {
  try {
    const { fecha, gramos, dia_trabajo, imagen_url, observacion } = req.body;
    const imagenFinal = fileUrl(req) || imagen_url || null;

    if (!fecha || !gramos) {
      return res.status(400).json({ message: "Fecha y gramos son obligatorios" });
    }

    const gramosNum = Number(gramos);
    if (gramosNum <= 0) {
      return res.status(400).json({ message: "Los gramos deben ser mayores a 0" });
    }

    const resultado = await pool.query(
      `INSERT INTO registros_oro (fecha, gramos, dia_trabajo, imagen_url, observacion)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [fecha, gramosNum, dia_trabajo !== undefined ? dia_trabajo : true, imagenFinal, observacion || null]
    );

    return res.status(201).json({ message: "Registro de oro guardado", registro: resultado.rows[0] });
  } catch (error) {
    console.error("Error crearOro:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarOro = async (req, res) => {
  try {
    const { fecha, gramos, dia_trabajo, imagen_url, observacion } = req.body;
    const imagenFinal = fileUrl(req) || imagen_url || null;
    const resultado = await pool.query(
      `UPDATE registros_oro
       SET fecha = COALESCE($1, fecha),
           gramos = COALESCE($2, gramos),
           dia_trabajo = COALESCE($3, dia_trabajo),
           imagen_url = COALESCE($4, imagen_url),
           observacion = COALESCE($5, observacion),
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_registro_oro = $6
       RETURNING *`,
      [
        fecha || null,
        gramos !== undefined ? Number(gramos) : null,
        dia_trabajo !== undefined ? dia_trabajo : null,
        imagenFinal,
        observacion || null,
        req.params.id,
      ]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Registro de oro no encontrado" });
    }
    return res.json({ message: "Registro de oro actualizado", registro: resultado.rows[0] });
  } catch (error) {
    console.error("Error actualizarOro:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const eliminarOro = async (req, res) => {
  try {
    const resultado = await pool.query(
      "DELETE FROM registros_oro WHERE id_registro_oro = $1 RETURNING *",
      [req.params.id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Registro de oro no encontrado" });
    }
    return res.json({ message: "Registro de oro eliminado" });
  } catch (error) {
    console.error("Error eliminarOro:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const resumenSemanalOro = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) {
      return res.status(400).json({ message: "Debe enviar desde y hasta" });
    }
    const resultado = await pool.query(
      `SELECT COALESCE(SUM(gramos), 0) AS total_oro_semanal,
              COUNT(*)::int AS registros
       FROM registros_oro
       WHERE fecha BETWEEN $1 AND $2`,
      [desde, hasta]
    );
    return res.json({
      desde,
      hasta,
      total_oro_semanal: Number(resultado.rows[0].total_oro_semanal),
      registros: resultado.rows[0].registros,
    });
  } catch (error) {
    console.error("Error resumenSemanalOro:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  listarOro,
  obtenerOro,
  crearOro,
  actualizarOro,
  eliminarOro,
  resumenSemanalOro,
};
