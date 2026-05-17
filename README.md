# Sistema de Control de Inventario con Geolocalización (CIG)

[![Next.js Version](https://img.shields.io/badge/Next.js-15.3.5-indigo.svg?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-19.0.0-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44.2-orange.svg?style=flat-square)](https://orm.drizzle.team/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

**Control de Inventario con Geolocalización (CIG)** es una plataforma web modular de alto rendimiento diseñada específicamente para optimizar la logística de recepción, distribución interna y geolocalización de mercancías dentro de bodegas departamentales (como Liverpool). 

El sistema permite rastrear contenedores desde su arribo por manifiesto hasta su colocación exacta en estantes y racks específicos, reduciendo tiempos de búsqueda, mermas por extravío y retrasos operativos.

---

## Características Visuales y Experiencia de Usuario
*   **Interfaz Premium y Fluida:** Diseñada sobre una paleta armónica en tonos índigo, gris neutro y acentos semafóricos que facilitan la toma rápida de decisiones.
*   **Sidebar Inteligente y Colapsable:** Panel de navegación intuitivo que se despliega suavemente en computadoras de escritorio y optimiza el espacio de trabajo en pantallas táctiles de terminales portátiles.
*   **Diseño Responsivo:** Diseñado bajo el principio de adaptabilidad móvil, garantizando que el personal de piso (montacargas y receptores) y los supervisores de oficina tengan la misma experiencia fluida.

---

## Módulos Principales del Sistema

El sistema se compone de cinco áreas de trabajo integradas:

1.  **Menú Principal (Dashboard):** El centro neurálgico de la aplicación. Ofrece métricas en tiempo real (KPIs de ocupación de almacenes, alertas urgentes de contenedores sin recibir y bitácoras de actividad reciente) junto con una botonera de accesos directos interactivos.
2.  **Entrega a Bodegas:** Permite al personal de andén registrar el arribo de un contenedor, escanear o ingresar su código manual, asignar el tipo de palet (clasificados de la `A` a la `Z` según nomenclatura interna) y seleccionar la bodega y el operador responsable de su traslado inicial.
3.  **Pendiente por Recibir:** Un área especializada para supervisores que muestra los contenedores que han sido asignados pero aún no han sido confirmados en su destino. Permite auditar demoras e ingresar observaciones detalladas en el momento del escaneo de confirmación.
4.  **Geolocalizados SKU:** Permite buscar y rastrear productos unitarios mediante su código de SKU (Stock Keeping Unit). Muestra la descripción del producto, el contenedor de origen, la bodega actual y su historial de registro.
5.  **Geolocalización SKU / Bodega:** Un mapa virtual que desglosa la ubicación exacta de cada producto dentro del almacén. Permite filtrar por bodegas específicas y consultar la distribución de los racks, niveles de estante y pasillos.

---

## Arquitectura Técnica y Stack

La aplicación se construyó bajo un enfoque moderno y desacoplado enfocado en el rendimiento y mantenibilidad:

*   **Frontend:** **Next.js 15 (App Router)** con componentes del lado del cliente (`use client`) y Server Components para la entrega veloz de datos.
*   **Estilos:** **Tailwind CSS v4** mediante PostCSS para una carga de hoja de estilos ultraligera y animaciones fluidas.
*   **Base de Datos:** **PostgreSQL**, garantizando integridad referencial y transaccional para operaciones logísticas críticas.
*   **ORM / Acceso a Datos:** **Drizzle ORM** configurado con un patrón de **Modelos de Dominio (Active Record Wrapper)** en el backend para encapsular las consultas SQL y mantener las vistas libres de lógica de persistencia.
*   **Lógica del Servidor:** **Next.js Server Actions** que orquestan las solicitudes directamente con la base de datos sin necesidad de APIs intermedias redundantes.

---

## Diagrama Entidad-Relación de la Base de Datos

El diseño del esquema de base de datos asegura una trazabilidad total de quién entrega, quién recibe, en qué contenedor viene la mercancía y dónde está ubicada exactamente:

```mermaid
erDiagram
    usuarios ||--o{ entregas : "entregado_por"
    usuarios ||--o{ entregas : "recibido_por"
    contenedores ||--o{ entregas : "contiene"
    contenedores ||--o{ sku : "agrupa"
    bodegas ||--o{ entregas : "almacena"
    bodegas ||--o{ geolocalizacion_sku : "ubica"
    sku ||--o{ geolocalizacion_sku : "tiene_coordenadas"

    usuarios {
        int id_usuario PK
        varchar nombre
        varchar rol
        varchar correo
        text password
    }

    contenedores {
        int id_contenedor PK
        varchar codigo UK
        char tipo_palet
        timestamp fecha_llegada
    }

    bodegas {
        int id_bodega PK
        varchar nombre
    }

    entregas {
        int id_entrega PK
        int id_contenedor FK
        int id_bodega FK
        int entregado_por FK
        int recibido_por FK
        timestamp fecha_entrega
        text observaciones
    }

    sku {
        int id_sku PK
        varchar codigo UK
        text descripcion
        int id_contenedor FK
        timestamp fecha_registro
    }

    geolocalizacion_sku {
        int id_geo PK
        int id_sku FK
        int id_bodega FK
        varchar rack
        varchar nivel
        varchar pasillo
        timestamp fecha_ubicacion
    }
```

---

## Estructura de Directorios

```
sistema-inventario/
├── DATABASE.sql                   # Archivo DDL de la base de datos PostgreSQL
├── DATA_EXAMPLE.sql               # Scripts SQL para poblar datos de prueba
├── AGENTS.md                      # Manual técnico y reglas para agentes de IA
├── .env.example                   # Plantilla de variables de entorno requeridas
├── src/
│   ├── libs/
│   │   ├── db.ts                  # Conexión principal y pool de base de datos
│   │   └── schema.ts              # Esquema de tablas y relaciones para Drizzle
│   ├── models/
│   │   ├── index.ts               # Exportador unificado de la capa de datos
│   │   └── [Model].ts             # Clases del modelo (Capa de Persistencia)
│   ├── components/
│   │   ├── Header.tsx             # Panel de cabecera dinámica de vistas
│   │   ├── Sidebar.tsx            # Menú lateral colapsable
│   │   └── TopNavbar.tsx          # Barra de navegación principal de la app
│   └── app/
│       ├── actions/               # Server Actions de Next.js (Lógica de negocio)
│       ├── dashboard/             # Módulos y vistas principales del sistema
│       ├── layout.tsx             # Layout raíz del sitio
│       ├── globals.css            # Estilos globales y configuraciones de Tailwind
│       └── page.tsx               # Landing page / Acceso de usuario
```

---

## Guía de Instalación y Configuración Local

Sigue estos sencillos pasos para levantar el entorno de desarrollo local:

### 1. Clonar el repositorio y acceder a él
```bash
git clone https://github.com/VicRa2004/sistema-inventario.git
cd sistema-inventario
```

### 2. Instalar dependencias del proyecto
```bash
npm install
```

### 3. Configurar variables de entorno
Copia la plantilla de variables de entorno y define tu cadena de conexión de PostgreSQL local:
```bash
cp .env.example .env
```
Abre tu archivo `.env` recién creado y define la variable `DATABASE_URL`:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_bd"
```

### 4. Inicializar y Semillar la Base de Datos
*   Crea una base de datos PostgreSQL en tu servidor local.
*   Importa el esquema de base de datos desde `DATABASE.sql`:
    ```bash
    psql -U tu_usuario -d tu_nombre_bd -f DATABASE.sql
    ```
*   Opcional (pero muy recomendado): Importa los datos ficticios de prueba desde `DATA_EXAMPLE.sql` para visualizar de inmediato el funcionamiento de los módulos:
    ```bash
    psql -U tu_usuario -d tu_nombre_bd -f DATA_EXAMPLE.sql
    ```

### 5. Correr el servidor de desarrollo
Inicia el entorno local con soporte de Turbopack:
```bash
npm run dev
```
La aplicación estará disponible en: [http://localhost:3000](http://localhost:3000)

---

## Información para Desarrolladores y Agentes de IA

Si vas a contribuir al desarrollo de este sistema o estás utilizando un Agente de IA para realizar modificaciones, por favor lee detenidamente el archivo [AGENTS.md](file:///home/girun/Documentos/GitHub/sistema-inventario/AGENTS.md). 

El proyecto cuenta con reglas estrictas de persistencia que prohíben la ejecución de consultas SQL o llamadas directas a Drizzle ORM dentro de las vistas o en la capa de Server Actions, exigiendo el uso y la extensión del directorio [src/models](file:///home/girun/Documentos/GitHub/sistema-inventario/src/models) para mantener una arquitectura limpia y escalable.
