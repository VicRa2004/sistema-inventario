// Tipos centralizados para el sistema de inventarios

import { 
  rolUsuarioEnum, 
  tipoContenedorEnum, 
  estadoContenedorEnum, 
  estadoEntregaEnum 
} from '@/libs/schema';

// ============================================================================
// TIPOS BASE DE ENUMS
// ============================================================================

export type RolUsuario = typeof rolUsuarioEnum.enumValues[number];
export type TipoContenedor = typeof tipoContenedorEnum.enumValues[number];
export type EstadoContenedor = typeof estadoContenedorEnum.enumValues[number];
export type EstadoEntrega = typeof estadoEntregaEnum.enumValues[number];

// ============================================================================
// INTERFACES DE ENTIDADES
// ============================================================================

// Usuario
export interface Usuario {
  idUsuario: number;
  nombre: string;
  correo: string;
  password: string;
  rol: RolUsuario;
}

export interface CreateUsuarioData {
  nombre: string;
  correo: string;
  password: string;
  rol: RolUsuario;
}

export interface UpdateUsuarioData {
  nombre?: string;
  correo?: string;
  password?: string;
  rol?: RolUsuario;
}

// Contenedor
export interface Contenedor {
  idContenedor: number;
  codigo: string;
  tipo: TipoContenedor;
  fechaLlegada: Date | null;
  estado: EstadoContenedor | null;
}

export interface CreateContenedorData {
  codigo: string;
  tipo: TipoContenedor;
  fechaLlegada?: Date;
  estado?: EstadoContenedor;
}

export interface UpdateContenedorData {
  codigo?: string;
  tipo?: TipoContenedor;
  fechaLlegada?: Date;
  estado?: EstadoContenedor;
}

// Manifiesto
export interface Manifiesto {
  idManifiesto: number;
  idContenedor: number | null;
  escaneadoPor: number | null;
  fechaEscaneo: Date | null;
}

export interface CreateManifiestoData {
  idContenedor: number;
  escaneadoPor: number;
  fechaEscaneo?: Date;
}

export interface UpdateManifiestoData {
  idContenedor?: number;
  escaneadoPor?: number;
  fechaEscaneo?: Date;
}

// Entrega
export interface Entrega {
  idEntrega: number;
  idContenedor: number | null;
  repartidoPor: number | null;
  bodegaDestino: string;
  fechaEntrega: Date | null;
  observaciones: string | null;
}

export interface CreateEntregaData {
  idContenedor: number;
  repartidoPor: number;
  bodegaDestino: string;
  fechaEntrega?: Date;
  observaciones?: string;
}

export interface UpdateEntregaData {
  idContenedor?: number;
  repartidoPor?: number;
  bodegaDestino?: string;
  fechaEntrega?: Date;
  observaciones?: string;
}

// Confirmación
export interface Confirmacion {
  idConfirmacion: number;
  idEntrega: number | null;
  confirmadoPor: number | null;
  fechaConfirmacion: Date | null;
  estadoEntrega: EstadoEntrega | null;
  comentarios: string | null;
}

export interface CreateConfirmacionData {
  idEntrega: number;
  confirmadoPor: number;
  fechaConfirmacion?: Date;
  estadoEntrega?: EstadoEntrega;
  comentarios?: string;
}

export interface UpdateConfirmacionData {
  idEntrega?: number;
  confirmadoPor?: number;
  fechaConfirmacion?: Date;
  estadoEntrega?: EstadoEntrega;
  comentarios?: string;
}

// Ubicación SKU
export interface UbicacionSku {
  idUbicacionSku: number;
  sku: string;
  bodega: string;
  estante: string | null;
  nivel: string | null;
  coordenadas: any | null; // Point type from PostgreSQL
  registradoPor: number | null;
  fechaRegistro: Date | null;
}

export interface CreateUbicacionSkuData {
  sku: string;
  bodega: string;
  estante?: string;
  nivel?: string;
  coordenadas?: any;
  registradoPor: number;
  fechaRegistro?: Date;
}

export interface UpdateUbicacionSkuData {
  sku?: string;
  bodega?: string;
  estante?: string;
  nivel?: string;
  coordenadas?: any;
  registradoPor?: number;
  fechaRegistro?: Date;
}

// ============================================================================
// TIPOS PARA FORMULARIOS
// ============================================================================

export interface UsuarioFormData {
  nombre: string;
  correo: string;
  password: string;
  rol: RolUsuario;
}

export interface ContenedorFormData {
  codigo: string;
  tipo: TipoContenedor;
  fechaLlegada?: string; // Como string desde formularios
  estado?: EstadoContenedor;
}

export interface ManifiestoFormData {
  idContenedor: string; // Como string desde formularios
  escaneadoPor: string; // Como string desde formularios
  fechaEscaneo?: string; // Como string desde formularios
}

export interface EntregaFormData {
  idContenedor: string; // Como string desde formularios
  repartidoPor: string; // Como string desde formularios
  bodegaDestino: string;
  fechaEntrega?: string; // Como string desde formularios
  observaciones?: string;
}

export interface ConfirmacionFormData {
  idEntrega: string; // Como string desde formularios
  confirmadoPor: string; // Como string desde formularios
  fechaConfirmacion?: string; // Como string desde formularios
  estadoEntrega?: EstadoEntrega;
  comentarios?: string;
}

export interface UbicacionSkuFormData {
  sku: string;
  bodega: string;
  estante?: string;
  nivel?: string;
  coordenadas?: string; // Como string desde formularios
  registradoPor: string; // Como string desde formularios
  fechaRegistro?: string; // Como string desde formularios
}

// ============================================================================
// TIPOS PARA RESPUESTAS DE API
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// TIPOS PARA COMPONENTES
// ============================================================================

export interface DeleteButtonProps {
  id: number;
  onDelete?: () => void;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============================================================================
// TIPOS PARA NAVEGACIÓN
// ============================================================================

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  active?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ============================================================================
// TIPOS PARA VALIDACIÓN
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// TIPOS UTILITARIOS
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// ============================================================================
// CONSTANTES DE TIPOS
// ============================================================================

export const ROLES_USUARIO = {
  OPERADOR: 'operador' as const,
  JEFE: 'jefe' as const,
  VENDEDOR: 'vendedor' as const
} as const;

export const TIPOS_CONTENEDOR = {
  C: 'C' as const,
  A: 'A' as const,
  S: 'S' as const,
  Q: 'Q' as const,
  I: 'I' as const,
  E: 'E' as const,
  B: 'B' as const
} as const;

export const ESTADOS_CONTENEDOR = {
  PENDIENTE: 'pendiente' as const,
  EN_REPARTO: 'en_reparto' as const,
  ENTREGADO: 'entregado' as const,
  CONFIRMADO: 'confirmado' as const
} as const;

export const ESTADOS_ENTREGA = {
  CONFIRMADO: 'confirmado' as const,
  RECHAZADO: 'rechazado' as const,
  INCOMPLETO: 'incompleto' as const
} as const;

// ============================================================================
// TIPOS PARA DRIZZLE ORM
// ============================================================================

// Tipos inferidos de las tablas de Drizzle
export type UsuarioSelect = Usuario;
export type ContenedorSelect = Contenedor;
export type ManifiestoSelect = Manifiesto;
export type EntregaSelect = Entrega;
export type ConfirmacionSelect = Confirmacion;
export type UbicacionSkuSelect = UbicacionSku;

// Tipos para inserts (sin ID auto-generado)
export type UsuarioInsert = Omit<Usuario, 'idUsuario'>;
export type ContenedorInsert = Omit<Contenedor, 'idContenedor'>;
export type ManifiestoInsert = Omit<Manifiesto, 'idManifiesto'>;
export type EntregaInsert = Omit<Entrega, 'idEntrega'>;
export type ConfirmacionInsert = Omit<Confirmacion, 'idConfirmacion'>;
export type UbicacionSkuInsert = Omit<UbicacionSku, 'idUbicacionSku'>;

// ============================================================================
// EXPORTACIONES POR DEFECTO
// ============================================================================

export default {
  ROLES_USUARIO,
  TIPOS_CONTENEDOR,
  ESTADOS_CONTENEDOR,
  ESTADOS_ENTREGA
};