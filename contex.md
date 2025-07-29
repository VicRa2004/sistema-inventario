## 🧠 **Contexto funcional de la app**

### 🏪 Nombre tentativo: **Control de Inventario con Geolocalización (CIG)**

La aplicación está diseñada para apoyar al personal de **recepción, envíos y supervisión** en una tienda departamental (como Liverpool), para **gestionar, ubicar y rastrear productos** que llegan por manifiestos y se distribuyen entre varias bodegas.

### 🔄 Flujo general de la app:

1. **Menú Principal**
   Desde aquí el usuario puede navegar a cualquiera de los otros 4 módulos principales. Este menú es claro, simple y accesible desde cualquier parte de la app (botonera fija o menú hamburguesa).
   Funciona como centro de operaciones.

---

2. ### 📦 Entrega - Bodegas

   Este apartado permite:

   * Registrar la entrega de un contenedor.
   * Asignar qué bodega lo recibe (ej. bodega de deportes, colgados, telefonía, etc.).
   * Registrar el **responsable**, **hora y fecha**, **ubicación** y el **departamento destino**.
   * Escanear o introducir el código del contenedor.

   👉 El objetivo es que quede claro **quién lo entregó, a quién, dónde y cuándo**.

---

3. ### ⏳ Pendiente por recibir

   Muestra un listado de contenedores que **aún no han sido escaneados/recibidos oficialmente** por los departamentos destino.

   * Es útil para identificar retrasos o pérdidas.
   * Incluye filtros por tipo de bodega, fecha, tipo de palet, etc.
   * Ideal para supervisores que necesitan revisar pendientes críticos.

---

4. ### 📍 Geolocalizados SKU

   Este apartado permite:

   * Ver productos ya registrados por SKU (código único del producto) junto con su ubicación exacta dentro del sistema.
   * Ideal para localizar productos individuales.
   * Se puede utilizar al buscar una prenda específica que un vendedor quiere encontrar, por ejemplo, en el rack o bodega correcta.

---

5. ### 🧭 Geolocalización SKU / Bodega

   Similar al anterior, pero aquí se puede:

   * Consultar **en qué bodega y posición** está un SKU específico (ej. estante, nivel, pasillo).
   * Visualizar mapas o planos con íconos que representen productos.
   * Útil para rastrear lotes, encontrar errores en asignación, o resolver pérdidas.

---

## 🧩 Extra:

* La mercancía llega clasificada por tipo de palet (C, A, S, Q, I, E, B).
* El personal divide la mercancía entre dos áreas: recepción/envíos y operaciones.
* Hay varias bodegas por tipo de producto.
* Se requiere una trazabilidad clara: quién entrega, recibe, dónde se queda y cuándo.