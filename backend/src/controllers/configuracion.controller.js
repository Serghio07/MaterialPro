const pool = require("../config/db");

const obtenerConfiguracion = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT *
       FROM configuracion
       ORDER BY id_configuracion DESC
       LIMIT 1`
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ message: "No existe configuracion registrada" });
    }

    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error obtenerConfiguracion:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarConfiguracion = async (req, res) => {
  try {
    const {
      nombre_negocio,
      valor_gramo,
      moneda,
      telefono,
      direccion,
      logo_url,
      unidad_oro,
      decimales_oro,
      mostrar_oro_inicio,
      inicio_semana,
      formato_reporte,
      incluir_imagenes,
      mostrar_oro_reporte,
    } = req.body;

    const existe = await pool.query(
      `SELECT *
       FROM configuracion
       ORDER BY id_configuracion DESC
       LIMIT 1`
    );

    if (existe.rows.length === 0) {
      const nuevo = await pool.query(
        `INSERT INTO configuracion
         (nombre_negocio, valor_gramo, moneda, telefono, direccion, logo_url,
          unidad_oro, decimales_oro, mostrar_oro_inicio, inicio_semana,
          formato_reporte, incluir_imagenes, mostrar_oro_reporte)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [
          nombre_negocio || "MaterialPro",
          valor_gramo || 0,
          moneda || "Bs",
          telefono || null,
          direccion || null,
          logo_url || null,
          unidad_oro || "gramos",
          decimales_oro !== undefined ? decimales_oro : 2,
          mostrar_oro_inicio !== undefined ? mostrar_oro_inicio : true,
          inicio_semana || "Lunes",
          formato_reporte || "PDF",
          incluir_imagenes !== undefined ? incluir_imagenes : true,
          mostrar_oro_reporte !== undefined ? mostrar_oro_reporte : true,
        ]
      );

      return res.status(201).json({
        message: "Configuracion creada correctamente",
        configuracion: nuevo.rows[0],
      });
    }

    const id = existe.rows[0].id_configuracion;

    const resultado = await pool.query(
      `UPDATE configuracion
       SET nombre_negocio = COALESCE($1, nombre_negocio),
           valor_gramo = COALESCE($2, valor_gramo),
           moneda = COALESCE($3, moneda),
           telefono = COALESCE($4, telefono),
           direccion = COALESCE($5, direccion),
           logo_url = COALESCE($6, logo_url),
           unidad_oro = COALESCE($7, unidad_oro),
           decimales_oro = COALESCE($8, decimales_oro),
           mostrar_oro_inicio = COALESCE($9, mostrar_oro_inicio),
           inicio_semana = COALESCE($10, inicio_semana),
           formato_reporte = COALESCE($11, formato_reporte),
           incluir_imagenes = COALESCE($12, incluir_imagenes),
           mostrar_oro_reporte = COALESCE($13, mostrar_oro_reporte),
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_configuracion = $14
       RETURNING *`,
      [
        nombre_negocio || null,
        valor_gramo !== undefined ? valor_gramo : null,
        moneda || null,
        telefono || null,
        direccion || null,
        logo_url || null,
        unidad_oro || null,
        decimales_oro !== undefined ? decimales_oro : null,
        mostrar_oro_inicio !== undefined ? mostrar_oro_inicio : null,
        inicio_semana || null,
        formato_reporte || null,
        incluir_imagenes !== undefined ? incluir_imagenes : null,
        mostrar_oro_reporte !== undefined ? mostrar_oro_reporte : null,
        id,
      ]
    );

    return res.json({
      message: "Configuracion actualizada correctamente",
      configuracion: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error actualizarConfiguracion:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  obtenerConfiguracion,
  actualizarConfiguracion,
};
