BEGIN;

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cliente_nombre VARCHAR(100);

ALTER TABLE gastos ADD COLUMN IF NOT EXISTS cantidad NUMERIC(12,2) NOT NULL DEFAULT 1;

ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS telefono VARCHAR(50);
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS unidad_oro VARCHAR(30) NOT NULL DEFAULT 'gramos';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS decimales_oro INTEGER NOT NULL DEFAULT 2;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS mostrar_oro_inicio BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS inicio_semana VARCHAR(20) NOT NULL DEFAULT 'Lunes';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS formato_reporte VARCHAR(20) NOT NULL DEFAULT 'PDF';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS incluir_imagenes BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS mostrar_oro_reporte BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS registros_oro (
  id_registro_oro SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  gramos NUMERIC(10,2) NOT NULL,
  lugar VARCHAR(150),
  dia_trabajo BOOLEAN NOT NULL DEFAULT TRUE,
  imagen_url TEXT,
  observacion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE registros_oro ADD COLUMN IF NOT EXISTS dia_trabajo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS equipo (
  id_equipo SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  celular VARCHAR(30) NOT NULL,
  cargo VARCHAR(100),
  imagen_url TEXT,
  observacion TEXT,
  estado VARCHAR(20) DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grupo (
  id_grupo SERIAL PRIMARY KEY,
  nombre_grupo VARCHAR(100) NOT NULL DEFAULT 'MaterialPro Team',
  responsable VARCHAR(100),
  telefono_principal VARCHAR(30),
  descripcion TEXT,
  imagen_url TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO grupo (
  nombre_grupo,
  responsable,
  telefono_principal,
  descripcion,
  imagen_url
)
SELECT
  'MaterialPro Team',
  'Sergio Ticona',
  '',
  'Equipo encargado del registro de ventas, gastos, materiales y control de oro encontrado.',
  '/uploads/equipo/grupo.jpg'
WHERE NOT EXISTS (SELECT 1 FROM grupo);

DROP VIEW IF EXISTS vista_ganancia_semanal;
DROP VIEW IF EXISTS vista_ganancia_diaria;
DROP VIEW IF EXISTS vista_historial;

CREATE OR REPLACE VIEW vista_historial AS
SELECT
  v.id_venta AS id,
  'Venta' AS tipo_registro,
  v.fecha,
  m.nombre AS detalle,
  COALESCE(v.cliente_nombre, c.nombre) AS cliente,
  v.total_venta AS monto,
  v.metodo_pago,
  v.imagen_url,
  v.observacion,
  v.fecha_creacion
FROM ventas v
JOIN materiales m ON m.id_material = v.id_material
LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
UNION ALL
SELECT
  g.id_gasto AS id,
  'Gasto' AS tipo_registro,
  g.fecha,
  tg.nombre AS detalle,
  NULL AS cliente,
  g.monto,
  g.metodo_pago,
  g.imagen_url,
  COALESCE(g.observacion, g.descripcion) AS observacion,
  g.fecha_creacion
FROM gastos g
JOIN tipos_gasto tg ON tg.id_tipo_gasto = g.id_tipo_gasto;

CREATE OR REPLACE VIEW vista_ganancia_diaria AS
SELECT
  dias.fecha,
  COALESCE(v.total_ventas, 0) AS total_ventas,
  COALESCE(g.total_gastos, 0) AS total_gastos,
  COALESCE(v.total_ventas, 0) - COALESCE(g.total_gastos, 0) AS ganancia_diaria
FROM (
  SELECT fecha FROM ventas
  UNION
  SELECT fecha FROM gastos
) dias
LEFT JOIN (
  SELECT fecha, SUM(total_venta) AS total_ventas FROM ventas GROUP BY fecha
) v ON v.fecha = dias.fecha
LEFT JOIN (
  SELECT fecha, SUM(monto) AS total_gastos FROM gastos GROUP BY fecha
) g ON g.fecha = dias.fecha;

CREATE OR REPLACE VIEW vista_ganancia_semanal AS
SELECT
  DATE_TRUNC('week', fecha)::date AS semana_inicio,
  (DATE_TRUNC('week', fecha)::date + INTERVAL '6 day')::date AS semana_fin,
  SUM(total_ventas) AS total_ventas,
  SUM(total_gastos) AS total_gastos,
  SUM(ganancia_diaria) AS ganancia_semanal
FROM vista_ganancia_diaria
GROUP BY DATE_TRUNC('week', fecha)::date;

COMMIT;
