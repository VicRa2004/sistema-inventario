'use server';

import { revalidatePath } from 'next/cache';
import {
  EntregaModel,
  SkuModel,
  BodegaModel,
  ContenedorModel,
  GeolocalizacionSkuModel,
  type ISku,
  type IContenedor,
  type IEntrega,
  type IGeolocalizacionSku
} from '@/models';

// Tipos para el dashboard principal
export interface EstadisticasGenerales {
  entregas: {
    total: number;
    hoy: number;
    pendientes: number;
    confirmadas: number;
  };
  contenedores: {
    total: number;
    recientes: number;
    porTipo: Record<string, number>;
  };
  skus: {
    total: number;
    ubicados: number;
    sinUbicar: number;
    porcentajeUbicados: number;
  };
  bodegas: {
    total: number;
    conActividad: number;
  };
  alertas: {
    pendientesCriticos: number;
    skusSinUbicar: number;
  };
  ultimaActualizacion: Date;
}

export interface ResumenActividad {
  entregasRecientes: {
    idEntrega: number;
    fechaEntrega: Date;
    codigoContenedor: string;
    nombreBodega: string;
    entregadoPor: string;
    observaciones: string;
  }[];
  skusRecientes: ISku[];
  alertasPendientes: IEntrega[];
}

export interface NavegacionSeccionStats {
  total?: number;
  pendientes?: number;
  criticos?: number;
}

export interface NavegacionSeccion {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  ruta: string;
  estadisticas?: NavegacionSeccionStats;
}

// === ACCIONES PARA MENÚ PRINCIPAL ===

/**
 * Obtiene las estadísticas generales para el dashboard principal
 */
export async function obtenerEstadisticasGenerales(): Promise<{ success: boolean; data?: EstadisticasGenerales; error?: string }> {
  try {
    // Estadísticas de entregas
    const todasLasEntregas = await EntregaModel.getAll();
    const entregasHoy = await EntregaModel.getToday();
    const entregasPendientes = todasLasEntregas.filter(e => e.recibidoPor === null);
    const entregasConfirmadas = todasLasEntregas.filter(e => e.recibidoPor !== null);

    // Estadísticas de contenedores
    const todosLosContenedores = await ContenedorModel.getAll();
    const contenedoresRecientes = await ContenedorModel.getRecent();
    
    // Agrupar contenedores por tipo de palet
    const contenedoresPorTipo = todosLosContenedores.reduce((acc, contenedor) => {
      const tipo = contenedor.tipoPalet || 'Sin tipo';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Estadísticas de SKUs
    const estadisticasSkus = await SkuModel.getEstadisticas();
    const skusUbicados = await SkuModel.getUbicados();
    const skusSinUbicar = await SkuModel.getSinUbicar();
    const totalSkus = estadisticasSkus.total;
    const porcentajeUbicados = totalSkus > 0 
      ? Math.round((skusUbicados.length / totalSkus) * 100) 
      : 0;

    // Estadísticas de bodegas
    const todasLasBodegas = await BodegaModel.getAll();
    const bodegasConActividad = [];
    
    for (const bodega of todasLasBodegas) {
      const tieneEntregas = await BodegaModel.hasEntregas(bodega.idBodega);
      const tieneSkus = await BodegaModel.hasSkusUbicados(bodega.idBodega);
      
      if (tieneEntregas || tieneSkus) {
        bodegasConActividad.push(bodega);
      }
    }

    // Alertas
    const pendientesCriticos = entregasPendientes.filter(entrega => {
      const fechaEntrega = new Date(entrega.fechaEntrega!);
      const hoy = new Date();
      const diasPendiente = Math.floor((hoy.getTime() - fechaEntrega.getTime()) / (1000 * 60 * 60 * 24));
      return diasPendiente >= 3;
    }).length;

    const estadisticasGenerales: EstadisticasGenerales = {
      entregas: {
        total: todasLasEntregas.length,
        hoy: entregasHoy.length,
        pendientes: entregasPendientes.length,
        confirmadas: entregasConfirmadas.length
      },
      contenedores: {
        total: todosLosContenedores.length,
        recientes: contenedoresRecientes.length,
        porTipo: contenedoresPorTipo
      },
      skus: {
        total: totalSkus,
        ubicados: skusUbicados.length,
        sinUbicar: skusSinUbicar.length,
        porcentajeUbicados
      },
      bodegas: {
        total: todasLasBodegas.length,
        conActividad: bodegasConActividad.length
      },
      alertas: {
        pendientesCriticos,
        skusSinUbicar: skusSinUbicar.length
      },
      ultimaActualizacion: new Date()
    };

    return { success: true, data: estadisticasGenerales };
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene un resumen de la actividad reciente
 */
export async function obtenerResumenActividad(): Promise<{ success: boolean; data?: ResumenActividad; error?: string }> {
  try {
    // Entregas recientes (últimas 5)
    const entregasRecientesRaw = await EntregaModel.getWithDetails();
    const ultimasEntregas = (entregasRecientesRaw || [])
      .map(item => ({
        idEntrega: item.entrega?.idEntrega || 0,
        fechaEntrega: item.entrega?.fechaEntrega || new Date(),
        codigoContenedor: item.contenedor?.codigo || '',
        nombreBodega: item.bodega?.nombre || '',
        entregadoPor: item.entregador?.nombre || '',
        observaciones: item.entrega?.observaciones || ''
      }))
      .sort((a, b) => new Date(b.fechaEntrega).getTime() - new Date(a.fechaEntrega).getTime())
      .slice(0, 5);

    // SKUs recientes (últimos 5)
    const skusRecientes = await SkuModel.getRecent(5);

    // Alertas pendientes
    const todasLasEntregas = await EntregaModel.getAll();
    const entregasPendientes = (todasLasEntregas || []).filter(e => e.recibidoPor === null);
    const alertasPendientes = entregasPendientes
      .filter(entrega => {
        if (!entrega.fechaEntrega) return false;
        const fechaEntrega = new Date(entrega.fechaEntrega);
        const hoy = new Date();
        const diasPendiente = Math.floor((hoy.getTime() - fechaEntrega.getTime()) / (1000 * 60 * 60 * 24));
        return diasPendiente >= 3;
      })
      .slice(0, 3); // Solo las 3 más críticas

    const resumenActividad: ResumenActividad = {
      entregasRecientes: ultimasEntregas,
      skusRecientes,
      alertasPendientes
    };

    return { success: true, data: resumenActividad };
  } catch (error) {
    console.error('Error al obtener resumen de actividad:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene la configuración de navegación para las 4 secciones principales
 */
export async function obtenerSeccionesNavegacion(): Promise<{ success: boolean; data?: NavegacionSeccion[]; error?: string }> {
  try {
    // Obtener estadísticas para cada sección
    const estadisticasGenerales = await obtenerEstadisticasGenerales();
    
    if (!estadisticasGenerales.success || !estadisticasGenerales.data) {
      throw new Error('No se pudieron obtener las estadísticas');
    }

    const stats = estadisticasGenerales.data;

    const secciones: NavegacionSeccion[] = [
      {
        id: 'entrega-bodegas',
        nombre: 'Entrega - Bodegas',
        descripcion: 'Registrar entregas de contenedores y asignar bodegas destino',
        icono: '',
        ruta: '/dashboard/entrega-bodegas',
        estadisticas: {
          total: stats.entregas.total,
          pendientes: stats.entregas.pendientes
        }
      },
      {
        id: 'pendientes',
        nombre: 'Pendiente por recibir',
        descripcion: 'Contenedores entregados pero no confirmados como recibidos',
        icono: '',
        ruta: '/dashboard/pendiente-por-recibir',
        estadisticas: {
          total: stats.entregas.pendientes,
          criticos: stats.alertas.pendientesCriticos
        }
      },
      {
        id: 'geolocalizados-sku',
        nombre: 'Geolocalizados SKU',
        descripcion: 'Ver productos registrados con su ubicación exacta',
        icono: '',
        ruta: '/dashboard/geolocalizados-sku',
        estadisticas: {
          total: stats.skus.ubicados,
          pendientes: stats.skus.sinUbicar
        }
      },
      {
        id: 'geolocalizacion-sku-bodega',
        nombre: 'Geolocalización SKU / Bodega',
        descripcion: 'Consultar ubicaciones específicas y mapas de bodegas',
        icono: '',
        ruta: '/dashboard/geolocalizacion-sku-bodega',
        estadisticas: {
          total: stats.bodegas.total,
          pendientes: stats.bodegas.total - stats.bodegas.conActividad
        }
      }
    ];

    return { success: true, data: secciones };
  } catch (error) {
    console.error('Error al obtener secciones de navegación:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Actualiza todas las rutas del dashboard (útil después de operaciones importantes)
 */
export async function actualizarDashboard() {
  try {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/entrega-bodegas');
    revalidatePath('/dashboard/pendiente-por-recibir');
    revalidatePath('/dashboard/geolocalizados-sku');
    revalidatePath('/dashboard/geolocalizacion-sku-bodega');
    
    return { success: true, mensaje: 'Dashboard actualizado correctamente' };
  } catch (error) {
    console.error('Error al actualizar dashboard:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene alertas críticas para mostrar en el header o notificaciones
 */
export async function obtenerAlertasCriticas() {
  try {
    const estadisticas = await obtenerEstadisticasGenerales();
    
    if (!estadisticas.success || !estadisticas.data) {
      return { success: false, error: 'No se pudieron obtener las estadísticas' };
    }

    const alertas = [];
    const stats = estadisticas.data;

    // Alertas de pendientes críticos
    if (stats.alertas.pendientesCriticos > 0) {
      alertas.push({
        tipo: 'critico',
        mensaje: `${stats.alertas.pendientesCriticos} entregas críticas pendientes`,
        icono: '',
        ruta: '/dashboard/pendiente-por-recibir'
      });
    }

    // Alertas de SKUs sin ubicar
    if (stats.alertas.skusSinUbicar > 10) {
      alertas.push({
        tipo: 'advertencia',
        mensaje: `${stats.alertas.skusSinUbicar} SKUs sin ubicar`,
        icono: '',
        ruta: '/dashboard/geolocalizados-sku'
      });
    }

    // Alerta de baja ocupación de bodegas
    if (stats.bodegas.conActividad < stats.bodegas.total * 0.5) {
      alertas.push({
        tipo: 'info',
        mensaje: 'Baja actividad en algunas bodegas',
        icono: '',
        ruta: '/dashboard/geolocalizacion-sku-bodega'
      });
    }

    return { success: true, data: alertas };
  } catch (error) {
    console.error('Error al obtener alertas críticas:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Busqueda global en toda la aplicación
 */
export async function busquedaGlobal(termino: string) {
  try {
    const resultados = {
      contenedores: [] as IContenedor[],
      skus: [] as ISku[],
      ubicaciones: [] as IGeolocalizacionSku[]
    };

    // Buscar contenedores
    const contenedores = await ContenedorModel.getAll();
    resultados.contenedores = (contenedores || []).filter(c => 
      c.codigo?.toLowerCase().includes(termino.toLowerCase())
    ).slice(0, 5);

    // Buscar SKUs
    const skusPorCodigo = await SkuModel.searchByCodigo(termino);
    const skusPorDescripcion = await SkuModel.searchByDescripcion(termino);
    resultados.skus = [...(skusPorCodigo || []), ...(skusPorDescripcion || [])]
      .filter((sku, index, self) => 
        index === self.findIndex(s => s.idSku === sku.idSku)
      )
      .slice(0, 5);

    // Buscar ubicaciones
    const ubicaciones = await GeolocalizacionSkuModel.searchUbicaciones(termino);
    resultados.ubicaciones = (ubicaciones || []).slice(0, 5);

    return { success: true, data: resultados };
  } catch (error) {
    console.error('Error en búsqueda global:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}