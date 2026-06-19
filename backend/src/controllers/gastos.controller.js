const pool = require("../config/db");
const { fileUrl } = require("../middleware/upload.middleware");

const listarGastos = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT 
          g.id_gasto,
          g.fecha,
          g.id_tipo_gasto,
          tg.nombre AS tipo_gasto,
          g.descripcion,
          g.cantidad,
          g.monto,
          g.metodo_pago,
          g.imagen_url,
          g.observacion,
          g.fecha_creacion
       FROM gastos g
       LEFT JOIN tipos_gasto tg ON g.id_tipo_gasto = tg.id_tipo_gasto
       ORDER BY g.fecha DESC, g.fecha_creacion DESC`
    );

    return res.json(resultado.rows);
  } catch (error) {
    console.error("Error listarGastos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerGasto = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT 
          g.*,
          tg.nombre AS tipo_gasto
       FROM gastos g
       LEFT JOIN tipos_gasto tg ON g.id_tipo_gasto = tg.id_tipo_gasto
       WHERE g.id_gasto = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error obtenerGasto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const crearGasto = async (req, res) => {
  try {
    const {
      fecha,
      id_tipo_gasto,
      descripcion,
      cantidad,
      monto,
      metodo_pago,
      imagen_url,
      observacion,
    } = req.body;
    const imagenFinal = fileUrl(req) || imagen_url || null;

    if (!fecha || !id_tipo_gasto || !monto) {
      return res.status(400).json({
        message: "Fecha, tipo de gasto y monto son obligatorios",
      });
    }

    const cantidadNum = cantidad !== undefined ? Number(cantidad) : 1;
    const montoNum = Number(monto);

    if (cantidadNum <= 0 || montoNum <= 0) {
      return res.status(400).json({
        message: "La cantidad y el monto deben ser mayores a 0",
      });
    }

    const totalGasto = cantidadNum * montoNum;

    const resultado = await pool.query(
      `INSERT INTO gastos
       (fecha, id_tipo_gasto, descripcion, cantidad, monto, metodo_pago, imagen_url, observacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        fecha,
        id_tipo_gasto,
        descripcion || null,
        cantidadNum,
        totalGasto,
        metodo_pago || "Efectivo",
        imagenFinal,
        observacion || null,
      ]
    );

    return res.status(201).json({
      message: "Gasto registrado correctamente",
      gasto: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error crearGasto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarGasto = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fecha,
      id_tipo_gasto,
      descripcion,
      cantidad,
      monto,
      metodo_pago,
      imagen_url,
      observacion,
    } = req.body;
    const imagenFinal = fileUrl(req) || imagen_url || null;

    const actual = await pool.query("SELECT * FROM gastos WHERE id_gasto = $1", [id]);
    if (actual.rows.length === 0) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    const cantidadFinal = cantidad !== undefined ? Number(cantidad) : Number(actual.rows[0].cantidad || 1);
    const montoUnitario = monto !== undefined ? Number(monto) : Number(actual.rows[0].monto || 0) / Number(actual.rows[0].cantidad || 1);
    const totalFinal = cantidadFinal * montoUnitario;

    const resultado = await pool.query(
      `UPDATE gastos
       SET fecha = COALESCE($1, fecha),
           id_tipo_gasto = COALESCE($2, id_tipo_gasto),
           descripcion = COALESCE($3, descripcion),
           cantidad = $4,
           monto = $5,
           metodo_pago = COALESCE($6, metodo_pago),
           imagen_url = COALESCE($7, imagen_url),
           observacion = COALESCE($8, observacion),
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_gasto = $9
       RETURNING *`,
      [
        fecha || null,
        id_tipo_gasto || null,
        descripcion || null,
        cantidadFinal,
        totalFinal,
        metodo_pago || null,
        imagenFinal,
        observacion || null,
        id,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    return res.json({
      message: "Gasto actualizado correctamente",
      gasto: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error actualizarGasto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const eliminarGasto = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "DELETE FROM gastos WHERE id_gasto = $1 RETURNING *",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Gasto no encontrado" });
    }

    return res.json({
      message: "Gasto eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminarGasto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  listarGastos,
  obtenerGasto,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
};
