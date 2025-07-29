CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  rol VARCHAR(50), -- Ej: 'recepcion', 'envios', 'supervisor'
  correo VARCHAR(100),
  password TEXT
);

CREATE TABLE contenedores (
  id_contenedor SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE, -- Código escaneado o manual
  tipo_palet CHAR(1),        -- Ej: C, A, S, Q, etc.
  fecha_llegada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bodegas (
  id_bodega SERIAL PRIMARY KEY,
  nombre VARCHAR(100) -- Ej: 'bodega general', 'telefonía', etc.
);

CREATE TABLE entregas (
  id_entrega SERIAL PRIMARY KEY,
  id_contenedor INT REFERENCES contenedores(id_contenedor),
  id_bodega INT REFERENCES bodegas(id_bodega),
  entregado_por INT REFERENCES usuarios(id_usuario),
  recibido_por INT REFERENCES usuarios(id_usuario),
  fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT
);

CREATE TABLE sku (
  id_sku SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE, -- Código individual del producto
  descripcion TEXT,
  id_contenedor INT REFERENCES contenedores(id_contenedor),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE geolocalizacion_sku (
  id_geo SERIAL PRIMARY KEY,
  id_sku INT REFERENCES sku(id_sku),
  id_bodega INT REFERENCES bodegas(id_bodega),
  rack VARCHAR(20),
  nivel VARCHAR(20),
  pasillo VARCHAR(20),
  fecha_ubicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

