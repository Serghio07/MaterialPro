const pool = require("../config/db");

const calcularReporte = async (desde, hasta) => {
  const resultado = await pool.query(
    `
    SELECT
      COALESCE((SELECT SUM(total_venta) FROM ventas WHERE fecha BETWEEN $1 AND $2), 0) AS total_ventas,
      COALESCE((SELECT SUM(monto) FROM gastos WHERE fecha BETWEEN $1 AND $2), 0) AS total_gastos,
      COALESCE((SELECT valor_gramo FROM configuracion ORDER BY id_configuracion DESC LIMIT 1), 0) AS valor_gramo
    `,
    [desde, hasta]
  );

  const row = resultado.rows[0];
  const totalVentas = Number(row.total_ventas);
  const totalGastos = Number(row.total_gastos);
  const gananciaSemanal = totalVentas - totalGastos;
  const valorGramo = Number(row.valor_gramo);
  const totalGramos = valorGramo > 0 ? gananciaSemanal / valorGramo : 0;

  return {
    fecha_inicio: desde,
    fecha_fin: hasta,
    total_ventas: totalVentas,
    total_gastos: totalGastos,
    ganancia_semanal: gananciaSemanal,
    valor_gramo: valorGramo,
    total_gramos: Number(totalGramos.toFixed(2)),
  };
};

const obtenerReporteSemanal = async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    if (!desde || !hasta) {
      return res.status(400).json({
        message: "Debe enviar fecha desde y hasta",
      });
    }

    return res.json(await calcularReporte(desde, hasta));
  } catch (error) {
    console.error("Error obtenerReporteSemanal:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const guardarReporteSemanal = async (req, res) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      desde,
      hasta,
      pdf_url,
      observacion,
    } = req.body;

    const inicio = fecha_inicio || desde;
    const fin = fecha_fin || hasta;

    if (!inicio || !fin) {
      return res.status(400).json({
        message: "Fecha inicio y fecha fin son obligatorias",
      });
    }

    const reporte = await calcularReporte(inicio, fin);

    const resultado = await pool.query(
      `
      INSERT INTO reportes_semanales
      (
        fecha_inicio,
        fecha_fin,
        total_ventas,
        total_gastos,
        ganancia_semanal,
        valor_gramo,
        total_gramos,
        pdf_url,
        observacion
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        reporte.fecha_inicio,
        reporte.fecha_fin,
        reporte.total_ventas,
        reporte.total_gastos,
        reporte.ganancia_semanal,
        reporte.valor_gramo,
        reporte.total_gramos,
        pdf_url || null,
        observacion || null,
      ]
    );

    return res.status(201).json({
      message: "Reporte semanal guardado correctamente",
      reporte: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error guardarReporteSemanal:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const listarReportesSemanales = async (req, res) => {
  try {
    const resultado = await pool.query(
      `
      SELECT *
      FROM reportes_semanales
      ORDER BY fecha_generacion DESC
      `
    );

    return res.json(resultado.rows);
  } catch (error) {
    console.error("Error listarReportesSemanales:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  obtenerReporteSemanal,
  guardarReporteSemanal,
  listarReportesSemanales,
};
