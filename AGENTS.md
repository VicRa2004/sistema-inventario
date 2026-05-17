# Manual para Agentes de IA - Sistema de Control de Inventario (CIG)

Este archivo está diseñado para guiar a cualquier **Agente de Desarrollo de Inteligencia Artificial (AI Agent)** que interactúe con este repositorio. Aquí encontrarás las reglas arquitectónicas, convenciones de código y flujos del sistema para garantizar la consistencia en el desarrollo y evitar romper las abstracciones existentes.

---

## Stack Tecnológico de Referencia

Antes de realizar cambios, ten en cuenta las versiones e integraciones del proyecto:

*   **Framework Principal:** Next.js `15.3.5` (utilizando el **App Router**).
*   **Biblioteca de Renderizado:** React `19.0.0` (atención a los hooks y soporte de Server Actions).
*   **Base de Datos:** PostgreSQL.
*   **ORM:** Drizzle ORM `^0.44.2` (con Drizzle Kit para migraciones).
*   **Estilos:** Tailwind CSS `^4.0.0` (utilizando `@tailwindcss/postcss`).
*   **Iconos:** `react-icons` (especialmente `FaWarehouse`, `FaBoxOpen`, `FaBarcode`, etc.).
*   **Driver DB:** Node-Postgres (`pg`).

---

## Arquitectura de Carpetas y Flujo de Datos

El proyecto sigue una estructura limpia de 3 capas principales sobre Next.js:

```
sistema-inventario/
├── DATABASE.sql                   # Estructura física de PostgreSQL
├── DATA_EXAMPLE.sql               # Seed de datos de prueba
├── .env.example                   # Plantilla de variables de entorno
├── src/
│   ├── libs/
│   │   ├── db.ts                  # Instancia del Pool de conexión de Drizzle
│   │   └── schema.ts              # Definición de Tablas y Relaciones de Drizzle
│   ├── models/
│   │   ├── index.ts               # Exportador unificado de Modelos
│   │   └── [Modelo].ts            # Clases de Dominio (Capa de Persistencia)
│   ├── components/
│   │   ├── Header.tsx             # Cabecera dinámica del Dashboard
│   │   ├── Sidebar.tsx            # Navegación lateral colapsable
│   │   └── TopNavbar.tsx          # Barra superior general
│   └── app/
│       ├── actions/
│       │   ├── index.ts           # Centralizador y utilidades comunes de Server Actions
│       │   └── [modulo].ts        # Orquestadores de lógica de negocio (Server Actions)
│       ├── dashboard/
│       │   ├── layout.tsx         # Dashboard Frame (Sidebar + Header)
│       │   ├── page.tsx           # Menú Principal con accesos rápidos
│       │   ├── entrega-bodegas/   # Módulo 1: Registrar arribo de contenedores
│       │   ├── pendiente-por-recibir/ # Módulo 2: Confirmar recepciones pendientes
│       │   ├── geolocalizados-sku/ # Módulo 3: Buscar productos por SKU
│       │   └── geolocalizacion-sku-bodega/ # Módulo 4: Racks, Pasillos e Historial
│       ├── layout.tsx             # Root layout con TopNavbar
│       ├── page.tsx               # Landing page / Home de bienvenida
│       └── globals.css            # Estilos globales y reset Tailwind
```

### Flujo de una Operación (Ejemplo: Confirmar Recepción)
1. **Vista (Client Component)** llama a un **Server Action** (`confirmarRecepcion` en `@/app/actions`).
2. El **Server Action** valida las reglas de negocio e invoca al **Modelo de Dominio** (`EntregaModel.confirmarEntrega` en `@/models/Entrega`).
3. El **Modelo** interactúa con **Drizzle ORM** (`db` y `schema`) para persistir la información.
4. El **Server Action** ejecuta `revalidatePath` para invalidar el caché de Next.js y refrescar la UI.

---

## REGLAS DE ORO PARA EL AGENTE DE IA

Si eres un agente de desarrollo, **DEBES** seguir estrictamente estas reglas:

### 1. Prohibido Consultar la DB Directamente en Vistas o Server Actions
*   **MALO:** Importar `db` de `@/libs/db` y hacer `db.select().from(usuarios)...` dentro de un componente de React o dentro de un archivo de `src/app/actions/*.ts`.
*   **BUENO:** Importar `UsuarioModel` de `@/models` y ejecutar `UsuarioModel.getAll()`.
*   **Razón:** Toda la persistencia debe centralizarse en los archivos de `src/models/*.ts`. Si necesitas una consulta compleja o nueva, añádela como un método estático dentro del modelo correspondiente.

### 2. Revalidación Obligatoria tras Escrituras
Siempre que un Server Action en `src/app/actions/*.ts` realice una mutación (crear, actualizar, eliminar en la base de datos), debes llamar a `revalidatePath` para refrescar los módulos afectados:
```typescript
// Ejemplo en Server Action
const entrega = await EntregaModel.create(data);
revalidatePath('/dashboard/entrega-bodegas');
revalidatePath('/dashboard/pendiente-por-recibir');
```

### 3. Manejo de Tipos Estrictos
*   No uses `any` en los modelos o acciones.
*   Cada modelo tiene su interfaz de tipado TypeScript exportada en `src/models/` (ej. `IUsuario`, `IBodega`, `IContenedor`). Asegúrate de utilizarlas o extenderlas (ej. `Omit<IUsuario, 'idUsuario'>` para creaciones).

### 4. Consistencia Visual (Tailwind CSS v4)
*   Usa siempre la paleta de colores del proyecto: Colores **Indigo** (`bg-indigo-600`, `text-indigo-900`) para elementos primarios e identitarios de la app, combinados con fondos grises suaves (`bg-gray-50`, `bg-gray-100`).
*   Los estados críticos de contenedores/entregas deben ser representados por semáforos de color consistentes:
    *   `Red` (7+ días sin recibir / Crítico)
    *   `Orange` (3-6 días sin recibir / Importante)
    *   `Yellow` (1-2 días sin recibir / Advertencia)
    *   `Green` (Recibido o al día)

---

## Esquema de la Base de Datos (Mapeo Drizzle)

Cuando generes consultas en los modelos, ten presente la equivalencia entre las tablas físicas (PostgreSQL) y las propiedades en Drizzle ORM:

| Tabla PostgreSQL | Esquema Drizzle (`schema.ts`) | Propiedades Clave | Relaciones Clave |
| :--- | :--- | :--- | :--- |
| `usuarios` | `usuarios` | `idUsuario` (serial), `nombre`, `rol`, `correo`, `password` | Entregas realizadas (`entregasEntregadas`), Entregas recibidas (`entregasRecibidas`) |
| `contenedores` | `contenedores` | `idContenedor` (serial), `codigo` (unique), `tipoPalet` (char 1), `fechaLlegada` | Entregas asociadas (`entregas`), SKUs incluidos (`skus`) |
| `bodegas` | `bodegas` | `idBodega` (serial), `nombre` | Entregas en bodega (`entregas`), Productos geolocalizados (`geolocalizaciones`) |
| `entregas` | `entregas` | `idEntrega` (serial), `idContenedor`, `idBodega`, `entregadoPor`, `recibidoPor`, `fechaEntrega`, `observaciones` | `contenedor`, `bodega`, `entregador`, `receptor` |
| `sku` | `sku` | `idSku` (serial), `codigo` (unique), `descripcion`, `idContenedor`, `fechaRegistro` | `contenedor`, `geolocalizaciones` |
| `geolocalizacion_sku` | `geolocalizacionSku` | `idGeo` (serial), `idSku`, `idBodega`, `rack`, `nivel`, `pasillo`, `fechaUbicacion` | `sku`, `bodega` |

---

## Guía Paso a Paso para Tareas Comunes

Si el usuario te pide implementar un nuevo requerimiento, sigue estos flujos de trabajo recomendados:

### Tarea A: Agregar una nueva consulta a una vista existente
1. **Identifica el Modelo:** Determina cuál es la entidad (ej. `Sku`).
2. **Crea el método en el Modelo:** En `src/models/Sku.ts`, añade el método estático, ej:
   ```typescript
   static async getSkusCriticos(): Promise<ISku[]> {
     return await db.select().from(sku).where(ilike(sku.codigo, '%CRIT%'));
   }
   ```
3. **Agrega el Server Action:** En `src/app/actions/geolocalizados-sku.ts`, encapsula el llamado con un bloque `try-catch`, y expórtalo en `src/app/actions/index.ts`.
4. **Consúmelo en el componente:** En el archivo `page.tsx` del cliente, impórtalo desde `@/app/actions` y úsalo dentro de un `useEffect` para refrescar el estado.

### Tarea B: Crear una nueva tabla en la Base de Datos
1. **Modifica `DATABASE.sql`:** Añade la sentencia DDL al archivo sql raíz para mantener el control físico del esquema.
2. **Actualiza `src/libs/schema.ts`:** Añade la tabla y sus relaciones usando la sintaxis de Drizzle ORM.
3. **Crea un nuevo archivo en `src/models/`:** Implementa la interfaz (`INuevaEntidad`) y la clase (`NuevaEntidadModel`) con métodos CRUD básicos (`create`, `getAll`, `getById`, `update`, `delete`).
4. **Expón el Modelo:** Agrégalo al exportador general en `src/models/index.ts`.

---

## Comandos Útiles para el Agente

*   **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
*   **Ejecutar Linter para verificar consistencia:**
    ```bash
    npm run lint
    ```
*   **Compilar el bundle de producción:**
    ```bash
    npm run build
    ```
