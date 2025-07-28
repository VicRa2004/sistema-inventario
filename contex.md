### 🎯 Objetivo general de la app:

> **Controlar y rastrear con precisión los contenedores y productos (SKU)** desde su llegada, reparto y ubicación final en la tienda, con confirmaciones, geolocalización y trazabilidad completa.

---

## 🧩 FUNCIONALIDAD PRINCIPAL POR CADA APARTADO

### 1️⃣ **Entrega a Bodegas**

> Registrar cuándo, quién y a qué bodega fue entregado un contenedor.

* El operador escanea el contenedor.
* Se selecciona la bodega de destino.
* Se registra el nombre del repartidor.
* Se guarda fecha, hora, tipo y observaciones.

📌 **Datos clave a registrar:**

* Código del contenedor
* Tipo de contenedor (C, A, S, etc.)
* Nombre del repartidor
* Bodega de destino
* Fecha/hora de entrega
* Observaciones

---

### 2️⃣ **Pendiente por Recibir**

> Lista de contenedores entregados pero que aún **no han sido confirmados** como recibidos.

* El jefe de área entra a este módulo.
* Ve todos los contenedores entregados a su bodega.
* **Confirma la recepción** (firma digital o botón).
* Puede indicar que no llegó, está incompleto, etc.

📌 **Datos clave:**

* Contenedor
* Bodega destino
* Repartido por
* Confirmado por
* Estado de entrega (pendiente, recibido, con problema)

---

### 3️⃣ **Geolocalizados SKU**

> Mostrar y registrar la **ubicación física precisa de un SKU**.

* Escaneo del SKU.
* Se registra su ubicación:

  * 📍 GPS real (opcional)
  * 📦 Interna: estante, nivel, zona, etc.
* Posibilidad de visualizar dónde están ubicados ciertos productos.

📌 **Datos clave:**

* SKU
* Estante / nivel / zona
* Coordenadas (lat, lon si aplica)
* Fecha/hora
* Quién lo registró

---

### 4️⃣ **GeoLocalización SKU/Bodega**

> Mapa o panel que **relaciona el SKU con su bodega y ubicación exacta.**

* Consulta de un SKU te muestra:

  * En qué contenedor estaba.
  * En qué bodega quedó.
  * En qué estante o zona.
  * Si fue entregado correctamente o sigue pendiente.

📌 **Datos clave a mostrar:**

* SKU → Contenedor → Bodega → Ubicación
* Estado: entregado / pendiente / perdido
* Botón de visualizar en mapa o plano

---

## 🗃️ ESTRUCTURA DE BASE DE DATOS PROPUESTA (PostgreSQL)

### 🧑 `usuarios`

```sql
CREATE TYPE rol_usuario AS ENUM ('operador', 'jefe', 'vendedor');

CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  correo VARCHAR UNIQUE NOT NULL,
  password TEXT NOT NULL,
  rol rol_usuario NOT NULL
);
```

---

### 📦 `contenedores`

```sql
CREATE TYPE tipo_contenedor AS ENUM ('C','A','S','Q','I','E','B');
CREATE TYPE estado_contenedor AS ENUM ('pendiente','en_reparto','entregado','confirmado');

CREATE TABLE contenedores (
  id_contenedor SERIAL PRIMARY KEY,
  codigo VARCHAR UNIQUE NOT NULL,
  tipo tipo_contenedor NOT NULL,
  fecha_llegada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado estado_contenedor DEFAULT 'pendiente'
);
```

---

### 📋 `manifiestos`

```sql
CREATE TABLE manifiestos (
  id_manifiesto SERIAL PRIMARY KEY,
  id_contenedor INT REFERENCES contenedores(id_contenedor) ON DELETE CASCADE,
  escaneado_por INT REFERENCES usuarios(id_usuario),
  fecha_escaneo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 📍 `entregas`

```sql
CREATE TABLE entregas (
  id_entrega SERIAL PRIMARY KEY,
  id_contenedor INT REFERENCES contenedores(id_contenedor),
  repartido_por INT REFERENCES usuarios(id_usuario),
  bodega_destino VARCHAR NOT NULL,
  fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT
);
```

---

### ✅ `confirmaciones`

```sql
CREATE TABLE confirmaciones (
  id_confirmacion SERIAL PRIMARY KEY,
  id_entrega INT REFERENCES entregas(id_entrega),
  confirmado_por INT REFERENCES usuarios(id_usuario),
  fecha_confirmacion TIMESTAMP,
  estado_entrega ENUM('confirmado','rechazado','incompleto') DEFAULT 'confirmado',
  comentarios TEXT
);
```

---

### 🧭 `ubicaciones_sku`

```sql
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
```

---

## 🔄 FLUJO LÓGICO DE LA APP

1. **Recepción de contenedores:** Se escanean y se registran con tipo y fecha.
2. **Entrega a bodega:** Se asigna repartidor y bodega de destino.
3. **Pendientes por recibir:** El jefe confirma la entrega en el sistema.
4. **Geolocalización:** Se registran o consultan posiciones físicas de productos.
5. **Consulta de trazabilidad:** De un SKU se puede saber todo: manifiesto, contenedor, bodega, estante.

