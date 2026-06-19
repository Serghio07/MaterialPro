CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo',
  imagen_url TEXT,
  email_verificado BOOLEAN DEFAULT false,
  codigo_verificacion VARCHAR(10),
  codigo_expira TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_verificacion VARCHAR(10);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_expira TIMESTAMP;
ALTER TABLE usuarios DROP COLUMN IF EXISTS usuario;

CREATE TABLE IF NOT EXISTS materiales (
  id_material SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  descripcion TEXT,
  unidad_medida VARCHAR(50) NOT NULL DEFAULT 'cubo',
  precio_referencia NUMERIC(12,2) NOT NULL DEFAULT 0,
  imagen_url TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo',
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
  id_cliente SERIAL PRIMARY KEY,
  nombre VARCHAR(140) NOT NULL,
  telefono VARCHAR(40),
  direccion TEXT,
  imagen_url TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo',
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tipos_gasto (
  id_tipo_gasto SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  descripcion TEXT,
  imagen_url TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo',
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ventas (
  id_venta SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  id_material INTEGER NOT NULL REFERENCES materiales(id_material),
  id_cliente INTEGER REFERENCES clientes(id_cliente),
  cliente_nombre VARCHAR(100),
  cantidad NUMERIC(12,2) NOT NULL,
  unidad_medida VARCHAR(50) NOT NULL,
  precio_unitario NUMERIC(12,2) NOT NULL,
  total_venta NUMERIC(12,2) NOT NULL,
  metodo_pago VARCHAR(60) DEFAULT 'Efectivo',
  imagen_url TEXT,
  observacion TEXT,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cliente_nombre VARCHAR(100);

CREATE TABLE IF NOT EXISTS gastos (
  id_gasto SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  id_tipo_gasto INTEGER NOT NULL REFERENCES tipos_gasto(id_tipo_gasto),
  descripcion TEXT,
  cantidad NUMERIC(12,2) NOT NULL DEFAULT 1,
  monto NUMERIC(12,2) NOT NULL,
  metodo_pago VARCHAR(60) DEFAULT 'Efectivo',
  imagen_url TEXT,
  observacion TEXT,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE gastos ADD COLUMN IF NOT EXISTS cantidad NUMERIC(12,2) NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS configuracion (
  id_configuracion SERIAL PRIMARY KEY,
  nombre_negocio VARCHAR(160) NOT NULL DEFAULT 'MaterialPro',
  valor_gramo NUMERIC(12,2) NOT NULL DEFAULT 0,
  moneda VARCHAR(20) NOT NULL DEFAULT 'Bs',
  telefono VARCHAR(50),
  direccion TEXT,
  logo_url TEXT,
  unidad_oro VARCHAR(30) NOT NULL DEFAULT 'gramos',
  decimales_oro INTEGER NOT NULL DEFAULT 2,
  mostrar_oro_inicio BOOLEAN NOT NULL DEFAULT TRUE,
  inicio_semana VARCHAR(20) NOT NULL DEFAULT 'Lunes',
  formato_reporte VARCHAR(20) NOT NULL DEFAULT 'PDF',
  incluir_imagenes BOOLEAN NOT NULL DEFAULT TRUE,
  mostrar_oro_reporte BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS reportes_semanales (
  id_reporte SERIAL PRIMARY KEY,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  total_ventas NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_gastos NUMERIC(12,2) NOT NULL DEFAULT 0,
  ganancia_semanal NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_gramo NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_gramos NUMERIC(12,2) NOT NULL DEFAULT 0,
  pdf_url TEXT,
  observacion TEXT,
  fecha_generacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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

INSERT INTO materiales (nombre, descripcion, unidad_medida, precio_referencia)
VALUES
  ('Arena', 'Material de construccion', 'cubo', 0),
  ('Piedra manzana', 'Piedra seleccionada', 'cubo', 0),
  ('Piedra bruta', 'Piedra para obra gruesa', 'cubo', 0),
  ('Piedra frutilla', 'Piedra decorativa o seleccionada', 'cubo', 0),
  ('Grava', 'Grava para mezcla', 'cubo', 0),
  ('Cascajillo', 'Cascajillo para construccion', 'cubo', 0),
  ('Cascajo', 'Cascajo para relleno', 'cubo', 0)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tipos_gasto (nombre, descripcion)
VALUES
  ('Comida', 'Alimentacion del equipo'),
  ('Viaticos', 'Gastos de traslado'),
  ('Combustible', 'Combustible para vehiculos'),
  ('Pago ayudantes', 'Jornales y apoyo operativo'),
  ('Mantenimiento', 'Mantenimiento de herramientas y vehiculos'),
  ('Otros', 'Gastos varios')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO configuracion (nombre_negocio, valor_gramo, moneda)
SELECT 'MaterialPro', 0, 'Bs'
WHERE NOT EXISTS (SELECT 1 FROM configuracion);
