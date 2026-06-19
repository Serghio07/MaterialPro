const pool = require("../config/db");
const { fileUrl } = require("../middleware/upload.middleware");

const obtenerGrupo = async (req, res) => {
  try {
    const existe = await pool.query("SELECT * FROM grupo ORDER BY id_grupo ASC LIMIT 1");
    if (existe.rows.length > 0) return res.json(existe.rows[0]);

    const creado = await pool.query(
      `INSERT INTO grupo (nombre_grupo, responsable, telefono_principal, descripcion, imagen_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        "MaterialPro Team",
        "Sergio Ticona",
        "",
        "Equipo encargado del registro de ventas, gastos, materiales y control de oro encontrado.",
        "/uploads/equipo/grupo.jpg",
      ]
    );
    return res.json(creado.rows[0]);
  } catch (error) {
    console.error("Error obtenerGrupo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarGrupo = async (req, res) => {
  try {
    const { nombre_grupo, responsable, telefono_principal, descripcion, imagen_url } = req.body;
    const imagenFinal = fileUrl(req) || imagen_url || null;

    const actual = await pool.query("SELECT * FROM grupo ORDER BY id_grupo ASC LIMIT 1");
    if (actual.rows.length === 0) {
      const creado = await pool.query(
        `INSERT INTO grupo (nombre_grupo, responsable, telefono_principal, descripcion, imagen_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          nombre_grupo || "MaterialPro Team",
          responsable || null,
          telefono_principal || null,
          descripcion || null,
          imagenFinal,
        ]
      );
      return res.status(201).json({ message: "Grupo creado", grupo: creado.rows[0] });
    }

    const id = actual.rows[0].id_grupo;
    const resultado = await pool.query(
      `UPDATE grupo
       SET nombre_grupo = COALESCE($1, nombre_grupo),
           responsable = COALESCE($2, responsable),
           telefono_principal = COALESCE($3, telefono_principal),
           descripcion = COALESCE($4, descripcion),
           imagen_url = COALESCE($5, imagen_url),
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_grupo = $6
       RETURNING *`,
      [
        nombre_grupo || null,
        responsable || null,
        telefono_principal || null,
        descripcion || null,
        imagenFinal,
        id,
      ]
    );

    return res.json({ message: "Grupo actualizado", grupo: resultado.rows[0] });
  } catch (error) {
    console.error("Error actualizarGrupo:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  obtenerGrupo,
  actualizarGrupo,
};
