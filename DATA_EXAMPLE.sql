INSERT INTO usuarios (nombre, rol, correo, password) VALUES
('Juan Pérez', 'recepcion', 'juan@empresa.com', 'hashed_password_123'),
('María García', 'envios', 'maria@empresa.com', 'hashed_password_456'),
('Carlos López', 'supervisor', 'carlos@empresa.com', 'hashed_password_789');

INSERT INTO bodegas (nombre) VALUES
('Bodega General'),
('Bodega Telefonía'),
('Bodega Accesorios'),
('Bodega Premium');

INSERT INTO contenedores (codigo, tipo_palet, fecha_llegada) VALUES
('CONT-2023-001', 'A', '2023-10-15 09:30:00'),
('CONT-2023-002', 'C', '2023-10-16 14:15:00'),
('CONT-2023-003', 'S', '2023-10-17 11:00:00'),
('CONT-2023-004', 'Q', '2023-10-18 16:45:00');

INSERT INTO sku (codigo, descripcion, id_contenedor) VALUES
('SKU-1001', 'Smartphone X Pro 128GB', 1),
('SKU-1002', 'Cargador rápido 30W', 1),
('SKU-1003', 'Auriculares inalámbricos', 2),
('SKU-1004', 'Tablet Y Plus 64GB', 3),
('SKU-1005', 'Smartwatch Z', 4);

INSERT INTO entregas (id_contenedor, id_bodega, entregado_por, recibido_por, observaciones) VALUES
(1, 2, 1, 2, 'Entrega completa, sin observaciones'),
(2, 1, 1, 3, 'Faltan 2 unidades por verificar'),
(3, 3, 2, 1, 'Productos frágiles'),
(4, 4, 3, 2, 'Entrega urgente');

INSERT INTO geolocalizacion_sku (id_sku, id_bodega, rack, nivel, pasillo) VALUES
(1, 2, 'R05', 'N2', 'P3'),
(2, 1, 'R12', 'N1', 'P7'),
(3, 1, 'R08', 'N3', 'P2'),
(4, 3, 'R03', 'N1', 'P5'),
(5, 4, 'R15', 'N2', 'P1');

SELECT c.codigo, s.codigo AS sku, s.descripcion
FROM contenedores c
JOIN sku s ON c.id_contenedor = s.id_contenedor;

SELECT e.id_entrega, c.codigo AS contenedor, b.nombre AS bodega, 
       u1.nombre AS entregado_por, u2.nombre AS recibido_por
FROM entregas e
JOIN contenedores c ON e.id_contenedor = c.id_contenedor
JOIN bodegas b ON e.id_bodega = b.id_bodega
JOIN usuarios u1 ON e.entregado_por = u1.id_usuario
JOIN usuarios u2 ON e.recibido_por = u2.id_usuario;

SELECT s.codigo, s.descripcion, b.nombre AS bodega,
       g.rack, g.nivel, g.pasillo
FROM sku s
JOIN geolocalizacion_sku g ON s.id_sku = g.id_sku
JOIN bodegas b ON g.id_bodega = b.id_bodega;