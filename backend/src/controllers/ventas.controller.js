const pool = require("../config/db");
const { fileUrl } = require("../middleware/upload.middleware");
const { limpiarImagenUrl, limpiarFilaImagen } = require("../utils/imageUrl");

const listarVentas = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT 
          v.id_venta,
          v.fecha,
          v.id_material,
          m.nombre AS material,
          v.id_cliente,
          COALESCE(v.cliente_nombre, c.nombre) AS cliente,
          v.cliente_nombre,
          v.cantidad,
          v.unidad_medida,
          v.precio_unitario,
          v.total_venta,
          v.metodo_pago,
          v.imagen_url,
          v.observacion,
          v.fecha_creacion
       FROM ventas v
       JOIN materiales m ON v.id_material = m.id_material
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       ORDER BY v.fecha DESC, v.fecha_creacion DESC`
    );

    return res.json(resultado.rows.map(limpiarFilaImagen));
  } catch (error) {
    console.error("Error listarVentas:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT 
          v.*,
          m.nombre AS material,
          COALESCE(v.cliente_nombre, c.nombre) AS cliente
       FROM ventas v
       JOIN materiales m ON v.id_material = m.id_material
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       WHERE v.id_venta = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    return res.json(limpiarFilaImagen(resultado.rows[0]));
  } catch (error) {
    console.error("Error obtenerVenta:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const crearVenta = async (req, res) => {
  try {
    const {
      fecha,
      id_material,
      id_cliente,
      cliente_nombre,
      cantidad,
      unidad_medida,
      precio_unitario,
      metodo_pago,
      imagen_url,
      observacion,
    } = req.body;
    const imagenFinal = fileUrl(req) || limpiarImagenUrl(imagen_url);

    if (!fecha || !id_material || !cantidad || !precio_unitario) {
      return res.status(400).json({
        message: "Fecha, material, cantidad y precio unitario son obligatorios",
      });
    }

    const cantidadNum = Number(cantidad);
    const precioNum = Number(precio_unitario);

    if (cantidadNum <= 0 || precioNum <= 0) {
      return res.status(400).json({
        message: "La cantidad y el precio unitario deben ser mayores a 0",
      });
    }

    const total_venta = cantidadNum * precioNum;

    const resultado = await pool.query(
      `INSERT INTO ventas
       (fecha, id_material, id_cliente, cliente_nombre, cantidad, unidad_medida, precio_unitario, total_venta, metodo_pago, imagen_url, observacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        fecha,
        id_material,
        id_cliente || null,
        cliente_nombre || null,
        cantidadNum,
        unidad_medida || "cubo",
        precioNum,
        total_venta,
        metodo_pago || "Efectivo",
        imagenFinal,
        observacion || null,
      ]
    );

    return res.status(201).json({
      message: "Venta registrada correctamente",
      venta: limpiarFilaImagen(resultado.rows[0]),
    });
  } catch (error) {
    console.error("Error crearVenta:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const ventaActual = await pool.query(
      "SELECT * FROM ventas WHERE id_venta = $1",
      [id]
    );

    if (ventaActual.rows.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    const actual = ventaActual.rows[0];

    const {
      fecha,
      id_material,
      id_cliente,
      cliente_nombre,
      cantidad,
      unidad_medida,
      precio_unitario,
      metodo_pago,
      imagen_url,
      observacion,
    } = req.body;
    const imagenFinal = fileUrl(req) || limpiarImagenUrl(imagen_url);

    const cantidadFinal = cantidad !== undefined ? Number(cantidad) : Number(actual.cantidad);
    const precioFinal = precio_unitario !== undefined ? Number(precio_unitario) : Number(actual.precio_unitario);
    const totalFinal = cantidadFinal * precioFinal;

    const resultado = await pool.query(
      `UPDATE ventas
       SET fecha = COALESCE($1, fecha),
           id_material = COALESCE($2, id_material),
           id_cliente = $3,
           cliente_nombre = COALESCE($4, cliente_nombre),
           cantidad = $5,
           unidad_medida = COALESCE($6, unidad_medida),
           precio_unitario = $7,
           total_venta = $8,
           metodo_pago = COALESCE($9, metodo_pago),
           imagen_url = COALESCE($10, imagen_url),
           observacion = COALESCE($11, observacion),
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_venta = $12
       RETURNING *`,
      [
        fecha || null,
        id_material || null,
        id_cliente || null,
        cliente_nombre || null,
        cantidadFinal,
        unidad_medida || null,
        precioFinal,
        totalFinal,
        metodo_pago || null,
        imagenFinal,
        observacion || null,
        id,
      ]
    );

    return res.json({
      message: "Venta actualizada correctamente",
      venta: limpiarFilaImagen(resultado.rows[0]),
    });
  } catch (error) {
    console.error("Error actualizarVenta:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const eliminarVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "DELETE FROM ventas WHERE id_venta = $1 RETURNING *",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    return res.json({
      message: "Venta eliminada correctamente",
    });
  } catch (error) {
    console.error("Error eliminarVenta:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  listarVentas,
  obtenerVenta,
  crearVenta,
  actualizarVenta,
  eliminarVenta,
};
