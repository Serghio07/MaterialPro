const pool = require("../config/db");
const { fileUrl } = require("../middleware/upload.middleware");

const listarMateriales = async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM materiales WHERE estado = 'activo' ORDER BY nombre ASC"
    );

    return res.json(resultado.rows);
  } catch (error) {
    console.error("Error listarMateriales:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      "SELECT * FROM materiales WHERE id_material = $1",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Material no encontrado" });
    }

    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error obtenerMaterial:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const crearMaterial = async (req, res) => {
  try {
    const { nombre, descripcion, unidad_medida, precio_referencia, imagen_url } = req.body;
    const imagenFinal = fileUrl(req) || imagen_url || null;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre del material es obligatorio" });
    }

    const resultado = await pool.query(
      `INSERT INTO materiales 
       (nombre, descripcion, unidad_medida, precio_referencia, imagen_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        nombre,
        descripcion || null,
        unidad_medida || "cubo",
        precio_referencia || 0,
        imagenFinal,
      ]
    );

    return res.status(201).json({
      message: "Material creado correctamente",
      material: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error crearMaterial:", error);

    if (error.code === "23505") {
      return res.status(400).json({ message: "Ese material ya existe" });
    }

    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, unidad_medida, precio_referencia, imagen_url, estado } = req.body;
    const imagenFinal = fileUrl(req) || imagen_url || null;

    const resultado = await pool.query(
      `UPDATE materiales
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           unidad_medida = COALESCE($3, unidad_medida),
           precio_referencia = COALESCE($4, precio_referencia),
           imagen_url = COALESCE($5, imagen_url),
           estado = COALESCE($6, estado),
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_material = $7
       RETURNING *`,
      [
        nombre || null,
        descripcion || null,
        unidad_medida || null,
        precio_referencia || null,
        imagenFinal,
        estado || null,
        id,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Material no encontrado" });
    }

    return res.json({
      message: "Material actualizado correctamente",
      material: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error actualizarMaterial:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const eliminarMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `UPDATE materiales
       SET estado = 'inactivo',
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_material = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "Material no encontrado" });
    }

    return res.json({ message: "Material eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminarMaterial:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  listarMateriales,
  obtenerMaterial,
  crearMaterial,
  actualizarMaterial,
  eliminarMaterial,
};
