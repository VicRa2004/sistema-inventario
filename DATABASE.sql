CREATE DATABASE IF NOT EXISTS sistema_inventario;
USE sistema_inventario;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  rol VARCHAR(50),
  correo VARCHAR(100),
  password TEXT
);

CREATE TABLE IF NOT EXISTS contenedores (
  id_contenedor INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE,
  tipo_palet CHAR(1),
  fecha_llegada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bodegas (
  id_bodega INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS entregas (
  id_entrega INT AUTO_INCREMENT PRIMARY KEY,
  id_contenedor INT REFERENCES contenedores(id_contenedor),
  id_bodega INT REFERENCES bodegas(id_bodega),
  entregado_por INT REFERENCES usuarios(id_usuario),
  recibido_por INT REFERENCES usuarios(id_usuario),
  fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT
);

CREATE TABLE IF NOT EXISTS sku (
  id_sku INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE,
  descripcion TEXT,
  id_contenedor INT REFERENCES contenedores(id_contenedor),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS geolocalizacion_sku (
  id_geo INT AUTO_INCREMENT PRIMARY KEY,
  id_sku INT REFERENCES sku(id_sku),
  id_bodega INT REFERENCES bodegas(id_bodega),
  rack VARCHAR(20),
  nivel VARCHAR(20),
  pasillo VARCHAR(20),
  fecha_ubicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);