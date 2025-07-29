'use server';

import { 
  GeolocalizacionSkuModel, 
  BodegaModel,
  SkuModel,
} from '@/models';

// Tipos para las acciones
export interface UbicacionDetallada {
  idGeo: number;
  idSku: number;
  codigoSku: string;
  descripcionSku: string;
  idBodega: number;
  nombreBodega: string;
  rack: string;
  nivel: string;
  pasillo: string;
  fechaUbicacion: Date;
  codigoUbicacion: string;
}

export interface MapaOcupacion {
  rack: string;
  nivel: string;
  pasillo: string;
  ocupado: boolean;
  idSku?: number;
  codigoSku?: string;
  descripcionSku?: string;
  fechaUbicacion?: Date;
}

export interface EstadisticasBodega {
  idBodega: number;
  nombreBodega: string;
  totalUbicaciones: number;
  ubicacionesOcupadas: number;
  ubicacionesLibres: number;
  porcentajeOcupacion: number;
  ultimaActualizacion: Date;
}

export interface FiltrosGeolocalizacion {
  idBodega?: number;
  rack?: string;
  nivel?: string;
  pasillo?: string;
  codigoSku?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}

export interface BusquedaUbicacion {
  rack: string;
  nivel: string;
  pasillo: string;
  idBodega: number;
}

// === ACCIONES PARA GEOLOCALIZACIÓN SKU/BODEGA ===

/**
 * Obtiene todas las ubicaciones con detalles completos
 */
export async function obtenerUbicacionesConDetalles(filtros?: FiltrosGeolocalizacion) {
  try {
    const ubicacionesRaw = await GeolocalizacionSkuModel.getWithDetails();
    
    // Transformar los datos a la estructura esperada
    let ubicaciones: UbicacionDetallada[] = ubicacionesRaw.map(item => ({
      idGeo: item.geolocalizacion.idGeo,
      idSku: item.sku?.idSku || 0,
      codigoSku: item.sku?.codigo || '',
      descripcionSku: item.sku?.descripcion || '',
      idBodega: item.bodega?.idBodega || 0,
      nombreBodega: item.bodega?.nombre || '',
      rack: item.geolocalizacion.rack || '',
      nivel: item.geolocalizacion.nivel || '',
      pasillo: item.geolocalizacion.pasillo || '',
      fechaUbicacion: item.geolocalizacion.fechaUbicacion || new Date(),
      codigoUbicacion: `${item.geolocalizacion.rack}-${item.geolocalizacion.nivel}-${item.geolocalizacion.pasillo}`
    }));
    
    // Aplicar filtros si se proporcionan
    if (filtros) {
      if (filtros.idBodega) {
        ubicaciones = ubicaciones.filter(u => u.idBodega === filtros.idBodega);
      }

      if (filtros.rack) {
        ubicaciones = ubicaciones.filter(u => 
          u.rack?.toLowerCase().includes(filtros.rack!.toLowerCase())
        );
      }

      if (filtros.nivel) {
        ubicaciones = ubicaciones.filter(u => 
          u.nivel?.toLowerCase().includes(filtros.nivel!.toLowerCase())
        );
      }

      if (filtros.pasillo) {
        ubicaciones = ubicaciones.filter(u => 
          u.pasillo?.toLowerCase().includes(filtros.pasillo!.toLowerCase())
        );
      }

      if (filtros.codigoSku) {
        ubicaciones = ubicaciones.filter(u => 
          u.codigoSku?.toLowerCase().includes(filtros.codigoSku!.toLowerCase())
        );
      }

      if (filtros.fechaInicio && filtros.fechaFin) {
        ubicaciones = ubicaciones.filter(u => {
          const fechaUbicacion = u.fechaUbicacion;
          if (!fechaUbicacion) return false;
          return fechaUbicacion >= filtros.fechaInicio! && fechaUbicacion <= filtros.fechaFin!;
        });
      }
    }

    // Formatear datos
    const ubicacionesDetalladas: UbicacionDetallada[] = ubicaciones.map(u => ({
      idGeo: u.idGeo,
      idSku: u.idSku!,
      codigoSku: u.codigoSku || 'Sin código',
      descripcionSku: u.descripcionSku || 'Sin descripción',
      idBodega: u.idBodega!,
      nombreBodega: u.nombreBodega || 'Sin nombre',
      rack: u.rack || '',
      nivel: u.nivel || '',
      pasillo: u.pasillo || '',
      fechaUbicacion: u.fechaUbicacion || new Date(),
      codigoUbicacion: GeolocalizacionSkuModel.generarCodigoUbicacion(
        u.rack || '',
        u.nivel || '',
        u.pasillo || ''
      )
    }));

    // Ordenar por bodega, luego por ubicación
    ubicacionesDetalladas.sort((a, b) => {
      if (a.nombreBodega !== b.nombreBodega) {
        return a.nombreBodega.localeCompare(b.nombreBodega);
      }
      return a.codigoUbicacion.localeCompare(b.codigoUbicacion);
    });

    return { success: true, data: ubicacionesDetalladas };
  } catch (error) {
    console.error('Error al obtener ubicaciones con detalles:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Busca un SKU específico y devuelve su ubicación exacta
 */
export async function buscarUbicacionPorSku(codigoSku: string) {
  try {
    const sku = await SkuModel.getByCodigo(codigoSku);
    
    if (!sku) {
      return { success: false, error: 'SKU no encontrado' };
    }

    const geolocalizacion = await GeolocalizacionSkuModel.getBySku(sku.idSku);
    
    if (!geolocalizacion) {
      return { 
        success: true, 
        data: null,
        mensaje: 'SKU encontrado pero no tiene ubicación asignada'
      };
    }

    const bodega = await BodegaModel.getById(geolocalizacion.idBodega!);
    
    const ubicacionDetallada: UbicacionDetallada = {
      idGeo: geolocalizacion.idGeo,
      idSku: sku.idSku,
      codigoSku: sku.codigo || 'Sin código',
      descripcionSku: sku.descripcion || 'Sin descripción',
      idBodega: geolocalizacion.idBodega!,
      nombreBodega: bodega?.nombre || 'Sin nombre',
      rack: geolocalizacion.rack || '',
      nivel: geolocalizacion.nivel || '',
      pasillo: geolocalizacion.pasillo || '',
      fechaUbicacion: geolocalizacion.fechaUbicacion || new Date(),
      codigoUbicacion: GeolocalizacionSkuModel.generarCodigoUbicacion(
        geolocalizacion.rack || '',
        geolocalizacion.nivel || '',
        geolocalizacion.pasillo || ''
      )
    };

    return { 
      success: true, 
      data: ubicacionDetallada,
      mensaje: 'SKU encontrado con ubicación'
    };
  } catch (error) {
    console.error('Error al buscar ubicación por SKU:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene el mapa de ocupación de una bodega específica
 */
export async function obtenerMapaOcupacionBodega(idBodega: number) {
  try {
    const bodega = await BodegaModel.getById(idBodega);
    if (!bodega) {
      return { success: false, error: 'Bodega no encontrada' };
    }

    const mapaOcupacion = await GeolocalizacionSkuModel.getMapaOcupacion(idBodega);
    
    return { 
      success: true, 
      data: {
        bodega,
        mapa: mapaOcupacion
      }
    };
  } catch (error) {
    console.error('Error al obtener mapa de ocupación:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene estadísticas detalladas de una bodega
 */
export async function obtenerEstadisticasBodegaDetalladas(idBodega: number) {
  try {
    const bodega = await BodegaModel.getById(idBodega);
    if (!bodega) {
      return { success: false, error: 'Bodega no encontrada' };
    }

    const estadisticas = await GeolocalizacionSkuModel.getEstadisticasByBodega(idBodega);
    
    if (!estadisticas) {
      return { success: false, error: 'No se pudieron obtener las estadísticas' };
    }
    
    // Obtener ubicaciones ocupadas (con SKU asignado)
    const ubicacionesOcupadas = await GeolocalizacionSkuModel.getByBodega(idBodega);
    const totalOcupadas = ubicacionesOcupadas.filter(u => u.idSku !== null).length;
    
    const estadisticasDetalladas: EstadisticasBodega = {
      idBodega,
      nombreBodega: bodega.nombre || 'Sin nombre',
      totalUbicaciones: estadisticas.totalUbicaciones || 0,
      ubicacionesOcupadas: totalOcupadas,
      ubicacionesLibres: (estadisticas.totalUbicaciones || 0) - totalOcupadas,
      porcentajeOcupacion: (estadisticas.totalUbicaciones || 0) > 0 
        ? Math.round((totalOcupadas / (estadisticas.totalUbicaciones || 0)) * 100)
        : 0,
      ultimaActualizacion: new Date()
    };

    return { success: true, data: estadisticasDetalladas };
  } catch (error) {
    console.error('Error al obtener estadísticas de bodega:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Busca ubicaciones disponibles en una bodega
 */
export async function obtenerUbicacionesDisponibles(idBodega: number) {
  try {
    const bodega = await BodegaModel.getById(idBodega);
    if (!bodega) {
      return { success: false, error: 'Bodega no encontrada' };
    }

    const ubicacionesDisponibles = await GeolocalizacionSkuModel.getUbicacionesDisponibles(idBodega);
    
    return { 
      success: true, 
      data: {
        bodega,
        ubicacionesDisponibles
      }
    };
  } catch (error) {
    console.error('Error al obtener ubicaciones disponibles:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Verifica si una ubicación específica está disponible
 */
export async function verificarUbicacionDisponible(ubicacion: BusquedaUbicacion) {
  try {
    const ocupada = await GeolocalizacionSkuModel.ubicacionOcupada(
      ubicacion.rack,
      ubicacion.nivel,
      ubicacion.pasillo,
      ubicacion.idBodega
    );

    const codigoUbicacion = GeolocalizacionSkuModel.generarCodigoUbicacion(
      ubicacion.rack,
      ubicacion.nivel,
      ubicacion.pasillo
    );

    return { 
      success: true, 
      data: {
        disponible: !ocupada,
        codigoUbicacion,
        mensaje: ocupada 
          ? `La ubicación ${codigoUbicacion} está ocupada`
          : `La ubicación ${codigoUbicacion} está disponible`
      }
    };
  } catch (error) {
    console.error('Error al verificar ubicación:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Busca ubicaciones por criterios específicos
 */
export async function buscarUbicaciones(termino: string, idBodega?: number) {
  try {
    const ubicaciones = await GeolocalizacionSkuModel.searchUbicaciones(termino, idBodega);
    
    return { success: true, data: ubicaciones };
  } catch (error) {
    console.error('Error al buscar ubicaciones:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene todas las ubicaciones de un rack específico
 */
export async function obtenerUbicacionesPorRack(rack: string, idBodega?: number) {
  try {
    const ubicaciones = await GeolocalizacionSkuModel.getByRack(rack, idBodega);
    
    // Obtener detalles completos para cada ubicación
    const ubicacionesDetalladas = [];
    
    for (const ubicacion of ubicaciones) {
      const sku = await SkuModel.getById(ubicacion.idSku!);
      const bodega = await BodegaModel.getById(ubicacion.idBodega!);
      
      ubicacionesDetalladas.push({
        ...ubicacion,
        codigoSku: sku?.codigo || 'Sin código',
        descripcionSku: sku?.descripcion || 'Sin descripción',
        nombreBodega: bodega?.nombre || 'Sin nombre',
        codigoUbicacion: GeolocalizacionSkuModel.generarCodigoUbicacion(
          ubicacion.rack || '',
          ubicacion.nivel || '',
          ubicacion.pasillo || ''
        )
      });
    }
    
    return { success: true, data: ubicacionesDetalladas };
  } catch (error) {
    console.error('Error al obtener ubicaciones por rack:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene todas las ubicaciones de un pasillo específico
 */
export async function obtenerUbicacionesPorPasillo(pasillo: string, idBodega?: number) {
  try {
    const ubicaciones = await GeolocalizacionSkuModel.getByPasillo(pasillo, idBodega);
    
    // Obtener detalles completos para cada ubicación
    const ubicacionesDetalladas = [];
    
    for (const ubicacion of ubicaciones) {
      const sku = await SkuModel.getById(ubicacion.idSku!);
      const bodega = await BodegaModel.getById(ubicacion.idBodega!);
      
      ubicacionesDetalladas.push({
        ...ubicacion,
        codigoSku: sku?.codigo || 'Sin código',
        descripcionSku: sku?.descripcion || 'Sin descripción',
        nombreBodega: bodega?.nombre || 'Sin nombre',
        codigoUbicacion: GeolocalizacionSkuModel.generarCodigoUbicacion(
          ubicacion.rack || '',
          ubicacion.nivel || '',
          ubicacion.pasillo || ''
        )
      });
    }
    
    return { success: true, data: ubicacionesDetalladas };
  } catch (error) {
    console.error('Error al obtener ubicaciones por pasillo:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene un resumen de todas las bodegas con sus estadísticas
 */
export async function obtenerResumenTodasLasBodegas() {
  try {
    const bodegas = await BodegaModel.getAll();
    const resumen = [];
    
    for (const bodega of bodegas) {
      const estadisticas = await GeolocalizacionSkuModel.getEstadisticasByBodega(bodega.idBodega);
      
      if (!estadisticas) continue;
      
      // Obtener ubicaciones ocupadas (con SKU asignado)
      const ubicacionesOcupadas = await GeolocalizacionSkuModel.getByBodega(bodega.idBodega);
      const totalOcupadas = ubicacionesOcupadas.filter(u => u.idSku !== null).length;
      
      const estadisticasBodega: EstadisticasBodega = {
        idBodega: bodega.idBodega,
        nombreBodega: bodega.nombre || 'Sin nombre',
        totalUbicaciones: estadisticas.totalUbicaciones || 0,
        ubicacionesOcupadas: totalOcupadas,
        ubicacionesLibres: (estadisticas.totalUbicaciones || 0) - totalOcupadas,
        porcentajeOcupacion: (estadisticas.totalUbicaciones || 0) > 0 
          ? Math.round((totalOcupadas / (estadisticas.totalUbicaciones || 0)) * 100)
          : 0,
        ultimaActualizacion: new Date()
      };
      
      resumen.push(estadisticasBodega);
    }
    
    // Ordenar por porcentaje de ocupación descendente
    resumen.sort((a, b) => b.porcentajeOcupacion - a.porcentajeOcupacion);
    
    return { success: true, data: resumen };
  } catch (error) {
    console.error('Error al obtener resumen de bodegas:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Valida el formato de una ubicación
 */
export async function validarFormatoUbicacion(rack: string, nivel: string, pasillo: string) {
  try {
    const valida = GeolocalizacionSkuModel.validarUbicacion(rack, nivel, pasillo);
    const codigoUbicacion = GeolocalizacionSkuModel.generarCodigoUbicacion(rack, nivel, pasillo);
    
    return { 
      success: true, 
      data: {
        valida,
        codigoUbicacion,
        mensaje: valida 
          ? `Formato válido: ${codigoUbicacion}`
          : 'Formato de ubicación inválido'
      }
    };
  } catch (error) {
    console.error('Error al validar formato de ubicación:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}