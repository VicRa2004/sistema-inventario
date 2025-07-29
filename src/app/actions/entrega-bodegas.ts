'use server';

import { revalidatePath } from 'next/cache';
import { 
  EntregaModel, 
  ContenedorModel, 
  BodegaModel, 
  UsuarioModel,
} from '@/models';

// Tipos para las acciones
export interface RegistrarEntregaData {
  codigoContenedor: string;
  idBodega: number;
  entregadoPor: number;
  observaciones?: string;
}

export interface CrearContenedorData {
  codigo: string;
  tipoPalet: string;
  fechaLlegada?: Date;
}

// === ACCIONES PARA ENTREGAS ===

/**
 * Registra una nueva entrega de contenedor a bodega
 */
export async function registrarEntrega(data: RegistrarEntregaData) {
  try {
    // Verificar que el contenedor existe
    const contenedor = await ContenedorModel.getByCodigo(data.codigoContenedor);
    if (!contenedor) {
      return { success: false, error: 'Contenedor no encontrado' };
    }

    // Verificar que la bodega existe
    const bodega = await BodegaModel.getById(data.idBodega);
    if (!bodega) {
      return { success: false, error: 'Bodega no encontrada' };
    }

    // Verificar que el usuario existe
    const usuario = await UsuarioModel.getById(data.entregadoPor);
    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Verificar que el contenedor no haya sido entregado ya
    const yaEntregado = await EntregaModel.contenedorYaEntregado(contenedor.idContenedor);
    if (yaEntregado) {
      return { success: false, error: 'Este contenedor ya fue entregado' };
    }

    // Crear la entrega
    const entrega = await EntregaModel.create({
      idContenedor: contenedor.idContenedor,
      idBodega: data.idBodega,
      entregadoPor: data.entregadoPor,
      recibidoPor: null, // Se asignará cuando se confirme la recepción
      fechaEntrega: new Date(),
      observaciones: data.observaciones || null
    });

    revalidatePath('/dashboard/entrega-bodegas');
    revalidatePath('/dashboard/pendientes');
    
    return { success: true, data: entrega };
  } catch (error) {
    console.error('Error al registrar entrega:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Confirma la recepción de una entrega
 */
export async function confirmarRecepcion(idEntrega: number, recibidoPor: number, observaciones?: string) {
  try {
    const entrega = await EntregaModel.confirmarEntrega(idEntrega, recibidoPor, observaciones);
    
    if (!entrega) {
      return { success: false, error: 'Entrega no encontrada' };
    }

    revalidatePath('/dashboard/entrega-bodegas');
    revalidatePath('/dashboard/pendientes');
    
    return { success: true, data: entrega };
  } catch (error) {
    console.error('Error al confirmar recepción:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene todas las entregas con detalles completos
 */
export async function obtenerEntregasConDetalles() {
  try {
    const entregas = await EntregaModel.getWithDetails();
    return { success: true, data: entregas };
  } catch (error) {
    console.error('Error al obtener entregas:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene entregas de hoy
 */
export async function obtenerEntregasHoy() {
  try {
    const entregas = await EntregaModel.getToday();
    return { success: true, data: entregas };
  } catch (error) {
    console.error('Error al obtener entregas de hoy:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene entregas por rango de fechas
 */
export async function obtenerEntregasPorFecha(fechaInicio: Date, fechaFin: Date) {
  try {
    const entregas = await EntregaModel.getByDateRange(fechaInicio, fechaFin);
    return { success: true, data: entregas };
  } catch (error) {
    console.error('Error al obtener entregas por fecha:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// === ACCIONES PARA CONTENEDORES ===

/**
 * Crea un nuevo contenedor
 */
export async function crearContenedor(data: CrearContenedorData) {
  try {
    // Verificar que el código no exista
    const existe = await ContenedorModel.codigoExists(data.codigo);
    if (existe) {
      return { success: false, error: 'Ya existe un contenedor con este código' };
    }

    const contenedor = await ContenedorModel.create({
      codigo: data.codigo,
      tipoPalet: data.tipoPalet,
      fechaLlegada: data.fechaLlegada || new Date()
    });

    revalidatePath('/dashboard/entrega-bodegas');
    
    return { success: true, data: contenedor };
  } catch (error) {
    console.error('Error al crear contenedor:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene todos los contenedores
 */
export async function obtenerContenedores() {
  try {
    const contenedores = await ContenedorModel.getAll();
    return { success: true, data: contenedores };
  } catch (error) {
    console.error('Error al obtener contenedores:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Busca contenedor por código
 */
export async function buscarContenedorPorCodigo(codigo: string) {
  try {
    const contenedor = await ContenedorModel.getByCodigo(codigo);
    if (!contenedor) {
      return { success: false, error: 'Contenedor no encontrado' };
    }
    return { success: true, data: contenedor };
  } catch (error) {
    console.error('Error al buscar contenedor:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene contenedores por tipo de palet
 */
export async function obtenerContenedoresPorTipo(tipoPalet: string) {
  try {
    const contenedores = await ContenedorModel.getByTipoPalet(tipoPalet);
    return { success: true, data: contenedores };
  } catch (error) {
    console.error('Error al obtener contenedores por tipo:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// === ACCIONES PARA BODEGAS ===

/**
 * Obtiene todas las bodegas
 */
export async function obtenerBodegas() {
  try {
    const bodegas = await BodegaModel.getAll();
    return { success: true, data: bodegas };
  } catch (error) {
    console.error('Error al obtener bodegas:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Crea una nueva bodega
 */
export async function crearBodega(nombre: string) {
  try {
    // Verificar que el nombre no exista
    const existe = await BodegaModel.nombreExists(nombre);
    if (existe) {
      return { success: false, error: 'Ya existe una bodega con este nombre' };
    }

    const bodega = await BodegaModel.create({ nombre });
    revalidatePath('/dashboard/entrega-bodegas');
    
    return { success: true, data: bodega };
  } catch (error) {
    console.error('Error al crear bodega:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene estadísticas de una bodega
 */
export async function obtenerEstadisticasBodega(idBodega: number) {
  try {
    const estadisticas = await BodegaModel.getEstadisticas(idBodega);
    return { success: true, data: estadisticas };
  } catch (error) {
    console.error('Error al obtener estadísticas de bodega:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

// === ACCIONES PARA USUARIOS ===

/**
 * Obtiene todos los usuarios
 */
export async function obtenerUsuarios() {
  try {
    const usuarios = await UsuarioModel.getAll();
    return { success: true, data: usuarios };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene usuarios por rol
 */
export async function obtenerUsuariosPorRol(rol: string) {
  try {
    const usuarios = await UsuarioModel.getByRole(rol);
    return { success: true, data: usuarios };
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}