'use server';

import { revalidatePath } from 'next/cache';
import { 
  EntregaModel, 
} from '@/models';

// Tipos para filtros
export interface FiltrosPendientes {
  idBodega?: number;
  tipoPalet?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  entregadoPor?: number;
}

export interface EntregaPendiente {
  idEntrega: number;
  codigoContenedor: string;
  tipoPalet: string;
  nombreBodega: string;
  entregadoPor: string;
  fechaEntrega: Date;
  observaciones?: string;
  diasPendiente: number;
}

// === ACCIONES PARA PENDIENTES ===

/**
 * Obtiene todas las entregas pendientes de confirmación
 * (entregas donde recibidoPor es null)
 */
export async function obtenerEntregasPendientes(filtros?: FiltrosPendientes) {
  try {
    // Obtener todas las entregas con detalles
    const todasLasEntregas = await EntregaModel.getWithDetails();
    
    // Filtrar solo las pendientes (recibidoPor es null)
    let entregasPendientes = (todasLasEntregas || []).filter(item => 
      item.entrega?.recibidoPor === null
    );

    // Aplicar filtros si se proporcionan
    if (filtros) {
      if (filtros.idBodega) {
        entregasPendientes = entregasPendientes.filter(item => 
          item.entrega?.idBodega === filtros.idBodega
        );
      }

      if (filtros.tipoPalet) {
        entregasPendientes = entregasPendientes.filter(item => 
          item.contenedor?.tipoPalet === filtros.tipoPalet
        );
      }

      if (filtros.entregadoPor) {
        entregasPendientes = entregasPendientes.filter(item => 
          item.entrega?.entregadoPor === filtros.entregadoPor
        );
      }

      if (filtros.fechaInicio && filtros.fechaFin) {
        entregasPendientes = entregasPendientes.filter(item => {
          if (!item.entrega?.fechaEntrega) return false;
          const fechaEntrega = new Date(item.entrega.fechaEntrega);
          return fechaEntrega >= filtros.fechaInicio! && fechaEntrega <= filtros.fechaFin!;
        });
      }
    }

    // Calcular días pendientes y formatear datos
    const pendientesFormateados: EntregaPendiente[] = entregasPendientes.map(item => {
      if (!item.entrega?.fechaEntrega) return null;
      const fechaEntrega = new Date(item.entrega.fechaEntrega);
      const hoy = new Date();
      const diasPendiente = Math.floor((hoy.getTime() - fechaEntrega.getTime()) / (1000 * 60 * 60 * 24));

      return {
        idEntrega: item.entrega.idEntrega,
        codigoContenedor: item.contenedor?.codigo || 'Sin código',
        tipoPalet: item.contenedor?.tipoPalet || 'Sin tipo',
        nombreBodega: item.bodega?.nombre || 'Sin bodega',
        entregadoPor: item.entregador?.nombre || 'Sin nombre',
        fechaEntrega: fechaEntrega,
        observaciones: item.entrega.observaciones || undefined,
        diasPendiente
      };
    }).filter(Boolean) as EntregaPendiente[];

    // Ordenar por días pendientes (más críticos primero)
    pendientesFormateados.sort((a, b) => b.diasPendiente - a.diasPendiente);

    return { success: true, data: pendientesFormateados };
  } catch (error) {
    console.error('Error al obtener entregas pendientes:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene entregas pendientes críticas (más de X días)
 */
export async function obtenerPendientesCriticos(diasLimite: number = 3) {
  try {
    const resultado = await obtenerEntregasPendientes();
    
    if (!resultado.success) {
      return resultado;
    }

    const criticos = (resultado.data || []).filter(entrega => 
      entrega.diasPendiente >= diasLimite
    );

    return { success: true, data: criticos };
  } catch (error) {
    console.error('Error al obtener pendientes críticos:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene estadísticas de pendientes
 */
export async function obtenerEstadisticasPendientes() {
  try {
    const resultado = await obtenerEntregasPendientes();
    
    if (!resultado.success) {
      return resultado;
    }

    const pendientes = resultado.data || [];
    
    // Calcular estadísticas
    const totalPendientes = pendientes.length;
    const criticos = pendientes.filter(p => p.diasPendiente >= 3).length;
    const urgentes = pendientes.filter(p => p.diasPendiente >= 7).length;
    
    // Agrupar por bodega
    const porBodega = pendientes.reduce((acc, entrega) => {
      const bodega = entrega.nombreBodega;
      if (!acc[bodega]) {
        acc[bodega] = 0;
      }
      acc[bodega]++;
      return acc;
    }, {} as Record<string, number>);

    // Agrupar por tipo de palet
    const porTipoPalet = pendientes.reduce((acc, entrega) => {
      const tipo = entrega.tipoPalet;
      if (!acc[tipo]) {
        acc[tipo] = 0;
      }
      acc[tipo]++;
      return acc;
    }, {} as Record<string, number>);

    // Promedio de días pendientes
    const promedioDias = totalPendientes > 0
      ? pendientes.reduce((sum, p) => sum + p.diasPendiente, 0) / totalPendientes 
      : 0;

    const estadisticas = {
      totalPendientes,
      criticos,
      urgentes,
      promedioDias: Math.round(promedioDias * 100) / 100,
      porBodega,
      porTipoPalet,
      ultimaActualizacion: new Date()
    };

    return { success: true, data: estadisticas };
  } catch (error) {
    console.error('Error al obtener estadísticas de pendientes:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene pendientes por bodega específica
 */
export async function obtenerPendientesPorBodega(idBodega: number) {
  try {
    const resultado = await obtenerEntregasPendientes({ idBodega });
    return resultado;
  } catch (error) {
    console.error('Error al obtener pendientes por bodega:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene pendientes por tipo de palet
 */
export async function obtenerPendientesPorTipoPalet(tipoPalet: string) {
  try {
    const resultado = await obtenerEntregasPendientes({ tipoPalet });
    return resultado;
  } catch (error) {
    console.error('Error al obtener pendientes por tipo de palet:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Marca una entrega como recibida (confirma recepción)
 */
export async function marcarComoRecibido(idEntrega: number, recibidoPor: number, observaciones?: string) {
  try {
    const entrega = await EntregaModel.confirmarEntrega(idEntrega, recibidoPor, observaciones);
    
    if (!entrega) {
      return { success: false, error: 'Entrega no encontrada' };
    }

    revalidatePath('/dashboard/pendientes');
    revalidatePath('/dashboard/entrega-bodegas');
    
    return { success: true, data: entrega };
  } catch (error) {
    console.error('Error al marcar como recibido:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene el historial de una entrega específica
 */
export async function obtenerHistorialEntrega(idEntrega: number) {
  try {
    const entrega = await EntregaModel.getWithDetails(idEntrega);
    
    if (!entrega || entrega.length === 0) {
      return { success: false, error: 'Entrega no encontrada' };
    }

    return { success: true, data: entrega[0] };
  } catch (error) {
    console.error('Error al obtener historial de entrega:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene alertas de pendientes (para notificaciones)
 */
export async function obtenerAlertasPendientes() {
  try {
    const criticos = await obtenerPendientesCriticos(3);
    const urgentes = await obtenerPendientesCriticos(7);
    
    if (!criticos.success || !urgentes.success) {
      return { success: false, error: 'Error al obtener alertas' };
    }

    const alertas = {
      criticos: criticos.data?.length || 0,
      urgentes: urgentes.data?.length || 0,
      mensaje: (criticos.data?.length || 0) > 0 
        ? `Hay ${criticos.data?.length || 0} entregas críticas pendientes de recepción`
        : 'No hay entregas críticas pendientes'
    };

    return { success: true, data: alertas };
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}