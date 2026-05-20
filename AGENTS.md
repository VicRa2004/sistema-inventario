# Manual para Agentes de IA - Sistema de Control de Inventario (CIG)

Este archivo está diseñado para guiar a cualquier **Agente de Desarrollo de Inteligencia Artificial (AI Agent)** que interactúe con este repositorio. Aquí encontrarás las reglas arquitectónicas, convenciones de código y flujos del sistema para garantizar la consistencia en el desarrollo y evitar romper las abstracciones existentes.

---

## Stack Tecnológico de Referencia

Antes de realizar cambios, ten en cuenta las versiones e integraciones del proyecto:

* **Framework Principal:** Next.js `15.3.5` (utilizando el **App Router**).
* **Biblioteca de Renderizado:** React `19.0.0` (atención a los hooks y soporte de Server Actions).
* **Base de Datos:** MySQL.
* **ORM:** Drizzle ORM `^0.44.2` (con Drizzle Kit para migraciones).
* **Estilos:** Tailwind CSS `^4.0.0` (utilizando `@tailwindcss/postcss`).
* **Iconos:** `lucide-react` (iconos SVG profesionales).
* **Autenticación:** NextAuth v5 (Auth.js).
* **Driver DB:** `mysql2` (`mysql2/promise`).

---

## Arquitectura de Carpetas y Flujo de Datos

El proyecto sigue una estructura limpia de 3 capas principales sobre Next.js:

```
sistema-inventario/
├── DATABASE.sql                 # Estructura física de MySQL
├── DATA_EXAMPLE.sql             # Seed de datos de prueba
├── .env.example                 # Plantilla de variables de entorno
├── src/
│   ├── libs/
│   │   ├── db.ts                # Instancia del Pool de conexión de Drizzle
│   │   └── schema.ts            # Definición de Tablas y Relaciones de Drizzle
│   ├── models/
│   │   ├── index.ts             # Exportador unificado de Modelos
│   │   └── [Modelo].ts          # Clases de Dominio (Capa de Persistencia)
│   ├── components/
│   │   ├── Header.tsx           # Cabecera dinámica del Dashboard
│   │   ├── Sidebar.tsx          # Navegación lateral colapsable
│   │   └── TopNavbar.tsx        # Barra superior general
│   ├── app/
│   │   ├── actions/
│   │   │   ├── index.ts         # Centralizador y utilidades comunes de Server Actions
│   │   │   └── [modulo].ts      # Orquestadores de lógica de negocio (Server Actions)
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts # NextAuth route handler
│   │   ├── dashboard/
│   │   │   ├── layout.tsx       # Dashboard Frame (Sidebar + Header)
│   │   │   ├── page.tsx         # Menú Principal con accesos rápidos
│   │   │   ├── entrega-bodegas/ # Módulo 1: Registrar arribo de contenedores
│   │   │   ├── pendiente-por-recibir/ # Módulo 2: Confirmar recepciones pendientes
│   │   │   ├── geolocalizados-sku/ # Módulo 3: Buscar productos por SKU
│   │   │   └── geolocalizacion-sku-bodega/ # Módulo 4: Racks, Pasillos e Historial
│   │   ├── login/
│   │   │   └── page.tsx         # Página de login
│   │   ├── layout.tsx           # Root layout con SessionProvider
│   │   └── page.tsx             # Landing page / Home de bienvenida
│   ├── auth.ts                  # Configuración de NextAuth
│   ├── middleware.ts            # Middleware de autenticación
│   └── globals.css              # Estilos globales y reset Tailwind
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

* **MALO:** Importar `db` de `@/libs/db` y hacer `db.select().from(usuarios)...` dentro de un componente de React o dentro de un archivo de `src/app/actions/*.ts`.
* **BUENO:** Importar `UsuarioModel` de `@/models` y ejecutar `UsuarioModel.getAll()`.
* **Razón:** Toda la persistencia debe centralizarse en los archivos de `src/models/*.ts`. Si necesitas una consulta compleja o nueva, añádela como un método estático dentro del modelo correspondiente.

### 2. Revalidación Obligatoria tras Escrituras

Siempre que un Server Action en `src/app/actions/*.ts` realice una mutación (crear, actualizar, eliminar en la base de datos), debes llamar a `revalidatePath` para refrescar los módulos afectados:

```typescript
// Ejemplo en Server Action
const entrega = await EntregaModel.create(data);
revalidatePath('/dashboard/entrega-bodegas');
revalidatePath('/dashboard/pendiente-por-recibir');
```

### 3. Manejo de Tipos Estrictos

* No uses `any` en los modelos o acciones.
* Cada modelo tiene su interfaz de tipado TypeScript exportada en `src/models/` (ej. `IUsuario`, `IBodega`, `IContenedor`). Asegúrate de utilizarlas o extenderlas (ej. `Omit<IUsuario, 'idUsuario'>` para creaciones).

### 4. Consistencia Visual (Tailwind CSS v4)

* Usa siempre la paleta de colores del proyecto:
  * Colores **Indigo** (`bg-indigo-600`, `text-indigo-900`) para elementos primarios e identitarios de la app
  * Combinados con fondos grises suaves (`bg-gray-50`, `bg-gray-100`)
  * Estados semafóricos: `Red` (crítico), `Orange` (importante), `Yellow` (advertencia), `Green` (normal)
* Usa iconos de **Lucide React**, NO emojis ni react-icons.

### 5. Autenticación y Seguridad

* Todas las rutas del dashboard están protegidas por middleware.
* Las contraseñas en desarrollo están en texto plano, pero en producción debes usar bcrypt.
* El secreto de NextAuth (`AUTH_SECRET`) debe estar en el `.env`.

---

## Esquema de la Base de Datos (Mapeo Drizzle)

Cuando generes consultas en los modelos, ten presente la equivalencia entre las tablas físicas (MySQL) y las propiedades en Drizzle ORM:

| Tabla MySQL          | Esquema Drizzle (`schema.ts`) | Propiedades Clave                                                                 | Relaciones Clave                                     |
| -------------------- | ----------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `usuarios`           | `usuarios`                    | `idUsuario` (serial), `nombre`, `rol`, `correo`, `password`                       | Entregas realizadas (`entregasEntregadas`), Entregas recibidas (`entregasRecibidas`) |
| `contenedores`       | `contenedores`                | `idContenedor` (serial), `codigo` (unique), `tipoPalet` (char 1), `fechaLlegada`  | Entregas asociadas (`entregas`), SKUs incluidos (`skus`) |
| `bodegas`            | `bodegas`                     | `idBodega` (serial), `nombre`                                                     | Entregas en bodega (`entregas`), Productos geolocalizados (`geolocalizaciones`) |
| `entregas`           | `entregas`                    | `idEntrega` (serial), `idContenedor`, `idBodega`, `entregadoPor`, `recibidoPor`, `fechaEntrega`, `observaciones` | `contenedor`, `bodega`, `entregador`, `receptor`     |
| `sku`                | `sku`                         | `idSku` (serial), `codigo` (unique), `descripcion`, `idContenedor`, `fechaRegistro` | `contenedor`, `geolocalizaciones`                    |
| `geolocalizacion_sku` | `geolocalizacionSku`          | `idGeo` (serial), `idSku`, `idBodega`, `rack`, `nivel`, `pasillo`, `fechaUbicacion` | `sku`, `bodega`                                      |

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

* **Iniciar el servidor de desarrollo:**
  ```bash
  npm run dev
  ```

* **Ejecutar Linter para verificar consistencia:**
  ```bash
  npm run lint
  ```

* **Compilar el bundle de producción:**
  ```bash
  npm run build
  ```

* **Reiniciar la base de datos (desarrollo):**
  ```bash
  mysql -u root -p -e "DROP DATABASE IF EXISTS sistema_inventario; CREATE DATABASE sistema_inventario;"
  mysql -u root -p sistema_inventario < DATABASE.sql
  mysql -u root -p sistema_inventario < DATA_EXAMPLE.sql
  ```

---

## Credenciales de Prueba

Los siguientes usuarios están disponibles en `DATA_EXAMPLE.sql`:

| Correo                | Contraseña           | Rol         |
| --------------------- | -------------------- | ----------- |
| `juan@empresa.com`    | `hashed_password_123` | recepcion   |
| `maria@empresa.com`   | `hashed_password_456` | envios      |
| `carlos@empresa.com`  | `hashed_password_789` | supervisor  |

---

## Estado del Proyecto

### ✅ Implementado y Funcional

- [x] Autenticación NextAuth v5 con JWT
- [x] Protección de rutas con middleware
- [x] Gestión de usuarios (CRUD)
- [x] Módulo de Entrega a Bodegas
- [x] Módulo Pendiente por Recibir
- [x] Módulo Geolocalizados SKU
- [x] Módulo Geolocalización SKU/Bodega
- [x] UI/UX Profesional con Tailwind CSS v4
- [x] Iconos SVG (Lucide React)
- [x] Diseño responsive
- [x] Server Actions para operaciones CRUD
- [x] Modelos de dominio con Drizzle ORM

### 🔧 Configuración Requerida

Antes de ejecutar el proyecto, asegúrate de tener:

1. MySQL corriendo con la base de datos creada
2. Variables de entorno en `.env`:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/sistema_inventario"
   AUTH_SECRET="tu-secreto-generado"
   ```
3. Datos de prueba cargados:
   ```bash
   mysql -u root -p -D sistema_inventario < DATA_EXAMPLE.sql
   ```

---

## Notas Importantes para Producción

1. **Seguridad de Contraseñas:** Actualmente las contraseñas están en texto plano. Implementa bcrypt antes de producción.
2. **AUTH_SECRET:** El secreto de NextAuth debe ser único y seguro en producción.
3. **Rate Limiting:** Considera agregar rate limiting a las rutas de autenticación.
4. **HTTPS:** En producción, usa HTTPS para todas las comunicaciones.
5. **Variables de Entorno:** Nunca commitees el archivo `.env` al repositorio.

---

## Solución de Problemas Comunes

### Error: "MissingSecret: Please define a `secret`"
- **Solución:** Agrega `AUTH_SECRET` al archivo `.env` con un valor aleatorio seguro.

### Error: "Access denied for user"
- **Solución:** Verifica que las credenciales en `DATABASE_URL` sean correctas (usuario y contraseña correctos para MySQL).

### Error: "Module not found: Can't resolve 'mysql2/promise'"
- **Solución:** Asegúrate de agregar `serverExternalPackages: ["mysql2"]` en tu `next.config.ts`.

### Error: "The edge runtime does not support Node.js 'crypto' module"
- **Solución:** El middleware no debe importar módulos de Node.js. Usa cookies directamente o configura `runtime = "nodejs"`.

---

## Contacto y Soporte

Para reportar bugs o solicitar nuevas funcionalidades, revisa el archivo `README.md` o contacta al equipo de desarrollo.

**Versión del Proyecto:** 1.0.0  
**Última Actualización:** Mayo 2026
