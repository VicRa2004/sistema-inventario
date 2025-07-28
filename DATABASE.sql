CREATE TYPE rol_usuario AS ENUM ('operador', 'jefe', 'vendedor');

CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  correo VARCHAR UNIQUE NOT NULL,
  password TEXT NOT NULL,
  rol rol_usuario NOT NULL
);

CREATE TYPE tipo_contenedor AS ENUM ('C','A','S','Q','I','E','B');
CREATE TYPE estado_contenedor AS ENUM ('pendiente','en_reparto','entregado','confirmado');

CREATE TABLE contenedores (
  id_contenedor SERIAL PRIMARY KEY,
  codigo VARCHAR UNIQUE NOT NULL,
  tipo tipo_contenedor NOT NULL,
  fecha_llegada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado estado_contenedor DEFAULT 'pendiente'
);

CREATE TABLE manifiestos (
  id_manifiesto SERIAL PRIMARY KEY,
  id_contenedor INT REFERENCES contenedores(id_contenedor) ON DELETE CASCADE,
  escaneado_por INT REFERENCES usuarios(id_usuario),
  fecha_escaneo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entregas (
  id_entrega SERIAL PRIMARY KEY,
  id_contenedor INT REFERENCES contenedores(id_contenedor),
  repartido_por INT REFERENCES usuarios(id_usuario),
  bodega_destino VARCHAR NOT NULL,
  fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT
);

CREATE TYPE estado_entrega_enum AS ENUM ('confirmado','rechazado','incompleto');

CREATE TABLE confirmaciones (
  id_confirmacion SERIAL PRIMARY KEY,
  id_entrega INT REFERENCES entregas(id_entrega),
  confirmado_por INT REFERENCES usuarios(id_usuario),
  fecha_confirmacion TIMESTAMP,
  estado_entrega estado_entrega_enum DEFAULT 'confirmado',
  comentarios TEXT
);

CREATE TABLE ubicaciones_sku (
  id_ubicacion SERIAL PRIMARY KEY,
  sku VARCHAR NOT NULL,
  bodega VARCHAR NOT NULL,
  estante VARCHAR,
  nivel VARCHAR,
  coordenadas POINT, -- lat/lon si hay GPS
  registrado_por INT REFERENCES usuarios(id_usuario),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DATOS PRUEBA

INSERT INTO usuarios (nombre, correo, password, rol) VALUES
  ('María Pérez', 'maria.perez@example.com', 'hashed_pwd_1', 'operador'),
  ('Luis Gómez', 'luis.gomez@example.com', 'hashed_pwd_2', 'jefe'),
  ('Ana Torres', 'ana.torres@example.com', 'hashed_pwd_3', 'vendedor');

INSERT INTO contenedores (codigo, tipo, fecha_llegada, estado) VALUES
  ('CONT001', 'C', '2025-07-26 08:00:00', 'pendiente'),
  ('CONT002', 'A', '2025-07-27 09:30:00', 'en_reparto'),
  ('CONT003', 'B', '2025-07-28 10:15:00', 'entregado');

INSERT INTO manifiestos (id_contenedor, escaneado_por, fecha_escaneo) VALUES
  (1, 1, '2025-07-26 08:10:00'),
  (2, 1, '2025-07-27 09:45:00');

INSERT INTO entregas (id_contenedor, repartido_por, bodega_destino, fecha_entrega, observaciones) VALUES
  (2, 3, 'Bodega Norte', '2025-07-28 12:00:00', 'Sin novedades'),
  (3, 3, 'Bodega Centro', '2025-07-28 13:30:00', 'Cliente no estaba, se dejó con portero');

INSERT INTO confirmaciones (id_entrega, confirmado_por, fecha_confirmacion, estado_entrega, comentarios) VALUES
  (1, 2, '2025-07-28 15:00:00', 'confirmado', 'Recibido sin daños'),
  (2, 2, '2025-07-28 16:00:00', 'incompleto', 'Faltaban 2 cajas');

INSERT INTO ubicaciones_sku (sku, bodega, estante, nivel, coordenadas, registrado_por, fecha_registro) VALUES
  ('SKU001', 'Bodega Norte', 'E1', 'N1', POINT(19.4326, -99.1332), 1, '2025-07-26 09:00:00'),
  ('SKU002', 'Bodega Centro', 'E3', 'N2', POINT(19.4400, -99.1400), 2, '2025-07-28 10:00:00');

