// Exportar todas las acciones organizadas por módulos

// === ACCIONES DEL MENÚ PRINCIPAL ===
export {
  obtenerEstadisticasGenerales,
  obtenerResumenActividad,
  obtenerSeccionesNavegacion,
  actualizarDashboard,
  obtenerAlertasCriticas,
  busquedaGlobal,
  type EstadisticasGenerales,
  type ResumenActividad,
  type NavegacionSeccion
} from './menu-principal';

// === ACCIONES DE ENTREGA-BODEGAS ===
export {
  // Entregas
  registrarEntrega,
  confirmarRecepcion,
  obtenerEntregasConDetalles,
  obtenerEntregasHoy,
  obtenerEntregasPorFecha,
  
  // Contenedores
  crearContenedor,
  obtenerContenedores,
  buscarContenedorPorCodigo,
  obtenerContenedoresPorTipo,
  
  // Bodegas
  obtenerBodegas,
  crearBodega,
  obtenerEstadisticasBodega,
  
  // Usuarios
  obtenerUsuarios,
  obtenerUsuariosPorRol,
  
  // Tipos
  type RegistrarEntregaData,
  type CrearContenedorData
} from './entrega-bodegas';

// === ACCIONES DE PENDIENTES ===
export {
  obtenerEntregasPendientes,
  obtenerPendientesCriticos,
  obtenerEstadisticasPendientes,
  obtenerPendientesPorBodega,
  obtenerPendientesPorTipoPalet,
  marcarComoRecibido,
  obtenerHistorialEntrega,
  obtenerAlertasPendientes,
  
  // Tipos
  type FiltrosPendientes,
  type EntregaPendiente
} from './pendientes';

// === ACCIONES DE GEOLOCALIZADOS SKU ===
export {
  obtenerSkusGeolocalizados,
  buscarSkuPorCodigo,
  crearSkuConUbicacion,
  moverSku,
  obtenerSkusPorBodega,
  obtenerEstadisticasSkusGeolocalizados,
  buscarSkusPorDescripcion,
  eliminarUbicacionSku,
  
  // Tipos
  type SkuConUbicacion,
  type FiltrosSkuGeolocalizados,
  type CrearSkuConUbicacionData
} from './geolocalizados-sku';

// === ACCIONES DE GEOLOCALIZACIÓN SKU/BODEGA ===
export {
  obtenerUbicacionesConDetalles,
  buscarUbicacionPorSku,
  obtenerMapaOcupacionBodega,
  obtenerEstadisticasBodegaDetalladas,
  obtenerUbicacionesDisponibles,
  verificarUbicacionDisponible,
  buscarUbicaciones,
  obtenerUbicacionesPorRack,
  obtenerUbicacionesPorPasillo,
  obtenerResumenTodasLasBodegas,
  validarFormatoUbicacion,
  
  // Tipos
  type UbicacionDetallada,
  type MapaOcupacion,
  type EstadisticasBodega,
  type FiltrosGeolocalizacion,
  type BusquedaUbicacion
} from './geolocalizacion-sku-bodega';

// === TIPOS COMUNES ===
// Re-exportar tipos de modelos para facilitar el uso
export type {
  IUsuario,
  IContenedor,
  IBodega,
  IEntrega,
  ISku,
  IGeolocalizacionSku
} from '@/models';

// === CONSTANTES ÚTILES ===
export const TIPOS_PALET = ['C', 'A', 'S', 'Q', 'I', 'E', 'B'] as const;
export const ROLES_USUARIO = ['recepcion', 'envios', 'supervision', 'admin'] as const;
export const ESTADOS_ENTREGA = ['pendiente', 'confirmada'] as const;

// === UTILIDADES ===
/**
 * Formatea una fecha para mostrar en la interfaz
 */
export function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(fecha);
}

/**
 * Calcula los días transcurridos desde una fecha
 */
export function calcularDiasTranscurridos(fecha: Date): number {
  const hoy = new Date();
  const diferencia = hoy.getTime() - fecha.getTime();
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
}

/**
 * Genera un código de ubicación legible
 */
export function generarCodigoUbicacion(rack: string, nivel: string, pasillo: string): string {
  return `${rack}-${nivel}-${pasillo}`.toUpperCase();
}

/**
 * Valida el formato de un código SKU
 */
export function validarCodigoSku(codigo: string): boolean {
  // Ejemplo: SKU debe tener al menos 3 caracteres alfanuméricos
  const regex = /^[A-Za-z0-9]{3,}$/;
  return regex.test(codigo);
}

/**
 * Obtiene el color de estado basado en días pendientes
 */
export function obtenerColorEstado(diasPendientes: number): string {
  if (diasPendientes >= 7) return 'red'; // Urgente
  if (diasPendientes >= 3) return 'orange'; // Crítico
  if (diasPendientes >= 1) return 'yellow'; // Advertencia
  return 'green'; // Normal
}

/**
 * Formatea números para mostrar estadísticas
 */
export function formatearNumero(numero: number): string {
  return new Intl.NumberFormat('es-MX').format(numero);
}

/**
 * Formatea porcentajes
 */
export function formatearPorcentaje(porcentaje: number): string {
  return `${porcentaje.toFixed(1)}%`;
}

// === MENSAJES DE ERROR COMUNES ===
export const MENSAJES_ERROR = {
  SERVIDOR: 'Error interno del servidor',
  NO_ENCONTRADO: 'Elemento no encontrado',
  YA_EXISTE: 'El elemento ya existe',
  DATOS_INVALIDOS: 'Los datos proporcionados son inválidos',
  SIN_PERMISOS: 'No tienes permisos para realizar esta acción',
  UBICACION_OCUPADA: 'La ubicación ya está ocupada',
  CONTENEDOR_YA_ENTREGADO: 'Este contenedor ya fue entregado',
  SKU_SIN_UBICACION: 'El SKU no tiene ubicación asignada'
} as const;

// === MENSAJES DE ÉXITO COMUNES ===
export const MENSAJES_EXITO = {
  CREADO: 'Elemento creado correctamente',
  ACTUALIZADO: 'Elemento actualizado correctamente',
  ELIMINADO: 'Elemento eliminado correctamente',
  ENTREGA_REGISTRADA: 'Entrega registrada correctamente',
  RECEPCION_CONFIRMADA: 'Recepción confirmada correctamente',
  SKU_UBICADO: 'SKU ubicado correctamente',
  SKU_MOVIDO: 'SKU movido a nueva ubicación'
} as const;