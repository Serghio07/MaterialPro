const pool = require("../config/db");

const listarHistorial = async (req, res) => {
  try {
    const { desde, hasta, tipo, buscar } = req.query;

    let query = `
      SELECT *
      FROM vista_historial
      WHERE 1 = 1
    `;

    const params = [];

    if (desde) {
      params.push(desde);
      query += ` AND fecha >= $${params.length}`;
    }

    if (hasta) {
      params.push(hasta);
      query += ` AND fecha <= $${params.length}`;
    }

    if (tipo) {
      params.push(tipo);
      query += ` AND tipo_registro ILIKE $${params.length}`;
    }

    if (buscar) {
      params.push(`%${buscar}%`);
      query += ` AND (
        detalle ILIKE $${params.length}
        OR cliente ILIKE $${params.length}
        OR observacion ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY fecha DESC, fecha_creacion DESC`;

    const resultado = await pool.query(query, params);

    return res.json(resultado.rows);
  } catch (error) {
    console.error("Error listarHistorial:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  listarHistorial,
};