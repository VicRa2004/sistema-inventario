'use server';

import { revalidatePath } from 'next/cache';
import { 
  SkuModel, 
  GeolocalizacionSkuModel, 
  BodegaModel,
  ContenedorModel,
} from '@/models';

// Tipos para las acciones
export interface SkuConUbicacion {
  idSku: number;
  codigo: string;
  descripcion: string;
  idContenedor?: number;
  codigoContenedor?: string;
  fechaRegistro: Date;
  // Datos de geolocalización
  idGeo?: number;
  idBodega?: number;
  nombreBodega?: string;
  rack?: string;
  nivel?: string;
  pasillo?: string;
  fechaUbicacion?: Date;
  codigoUbicacion?: string;
}

export interface FiltrosSkuGeolocalizados {
  idBodega?: number;
  rack?: string;
  pasillo?: string;
  codigoSku?: string;
  descripcion?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}

export interface CrearSkuConUbicacionData {
  codigo: string;
  descripcion: string;
  idContenedor?: number;
  // Datos de ubicación
  idBodega: number;
  rack: string;
  nivel: string;
  pasillo: string;
}

// === ACCIONES PARA SKUs GEOLOCALIZADOS ===

/**
 * Obtiene todos los SKUs que tienen geolocalización
 */
export async function obtenerSkusGeolocalizados(filtros?: FiltrosSkuGeolocalizados) {
  try {
    // Obtener SKUs ubicados con detalles
    const skusUbicados = await SkuModel.getUbicados();
    
    // Obtener detalles de geolocalización para cada SKU
    const skusConUbicacion: SkuConUbicacion[] = [];
    
    for (const sku of skusUbicados) {
      const geolocalizacion = await GeolocalizacionSkuModel.getBySku(sku.idSku);
      
      if (geolocalizacion) {
        const bodega = await BodegaModel.getById(geolocalizacion.idBodega!);
        const contenedor = sku.idContenedor 
          ? await ContenedorModel.getById(sku.idContenedor)
          : null;

        const skuConUbicacion: SkuConUbicacion = {
          idSku: sku.idSku,
          codigo: sku.codigo || 'Sin código',
          descripcion: sku.descripcion || 'Sin descripción',
          idContenedor: sku.idContenedor || undefined,
          codigoContenedor: contenedor?.codigo || undefined,
          fechaRegistro: sku.fechaRegistro || new Date(),
          idGeo: geolocalizacion.idGeo,
          idBodega: geolocalizacion.idBodega || undefined,
          nombreBodega: bodega?.nombre || 'Sin bodega',
          rack: geolocalizacion.rack || undefined,
          nivel: geolocalizacion.nivel || undefined,
          pasillo: geolocalizacion.pasillo || undefined,
          fechaUbicacion: geolocalizacion.fechaUbicacion || undefined,
          codigoUbicacion: geolocalizacion.rack && geolocalizacion.nivel && geolocalizacion.pasillo
            ? GeolocalizacionSkuModel.generarCodigoUbicacion(
                geolocalizacion.rack,
                geolocalizacion.nivel,
                geolocalizacion.pasillo
              )
            : undefined
        };

        skusConUbicacion.push(skuConUbicacion);
      }
    }

    // Aplicar filtros si se proporcionan
    let skusFiltrados = skusConUbicacion;
    
    if (filtros) {
      if (filtros.idBodega) {
        skusFiltrados = skusFiltrados.filter(sku => sku.idBodega === filtros.idBodega);
      }

      if (filtros.rack) {
        skusFiltrados = skusFiltrados.filter(sku => 
          sku.rack?.toLowerCase().includes(filtros.rack!.toLowerCase())
        );
      }

      if (filtros.pasillo) {
        skusFiltrados = skusFiltrados.filter(sku => 
          sku.pasillo?.toLowerCase().includes(filtros.pasillo!.toLowerCase())
        );
      }

      if (filtros.codigoSku) {
        skusFiltrados = skusFiltrados.filter(sku => 
          sku.codigo.toLowerCase().includes(filtros.codigoSku!.toLowerCase())
        );
      }

      if (filtros.descripcion) {
        skusFiltrados = skusFiltrados.filter(sku => 
          sku.descripcion.toLowerCase().includes(filtros.descripcion!.toLowerCase())
        );
      }

      if (filtros.fechaInicio && filtros.fechaFin) {
        skusFiltrados = skusFiltrados.filter(sku => {
          const fechaUbicacion = sku.fechaUbicacion;
          if (!fechaUbicacion) return false;
          return fechaUbicacion >= filtros.fechaInicio! && fechaUbicacion <= filtros.fechaFin!;
        });
      }
    }

    // Ordenar por fecha de ubicación más reciente
    skusFiltrados.sort((a, b) => {
      const fechaA = a.fechaUbicacion || new Date(0);
      const fechaB = b.fechaUbicacion || new Date(0);
      return fechaB.getTime() - fechaA.getTime();
    });

    return { success: true, data: skusFiltrados };
  } catch (error) {
    console.error('Error al obtener SKUs geolocalizados:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Busca un SKU específico por código y devuelve su ubicación
 */
export async function buscarSkuPorCodigo(codigo: string) {
  try {
    const sku = await SkuModel.getByCodigo(codigo);
    
    if (!sku) {
      return { success: false, error: 'SKU no encontrado' };
    }

    const geolocalizacion = await GeolocalizacionSkuModel.getBySku(sku.idSku);
    
    if (!geolocalizacion) {
      return { 
        success: true, 
        data: {
          sku,
          ubicado: false,
          mensaje: 'SKU encontrado pero no tiene ubicación asignada'
        }
      };
    }

    const bodega = await BodegaModel.getById(geolocalizacion.idBodega!);
    const contenedor = sku.idContenedor 
      ? await ContenedorModel.getById(sku.idContenedor)
      : null;

    const skuConUbicacion: SkuConUbicacion = {
      idSku: sku.idSku,
      codigo: sku.codigo || 'Sin código',
      descripcion: sku.descripcion || 'Sin descripción',
      idContenedor: sku.idContenedor || undefined,
      codigoContenedor: contenedor?.codigo || undefined,
      fechaRegistro: sku.fechaRegistro || new Date(),
      idGeo: geolocalizacion.idGeo,
      idBodega: geolocalizacion.idBodega || undefined,
      nombreBodega: bodega?.nombre || 'Sin bodega',
      rack: geolocalizacion.rack || undefined,
      nivel: geolocalizacion.nivel || undefined,
      pasillo: geolocalizacion.pasillo || undefined,
      fechaUbicacion: geolocalizacion.fechaUbicacion || undefined,
      codigoUbicacion: geolocalizacion.rack && geolocalizacion.nivel && geolocalizacion.pasillo
        ? GeolocalizacionSkuModel.generarCodigoUbicacion(
            geolocalizacion.rack,
            geolocalizacion.nivel,
            geolocalizacion.pasillo
          )
        : undefined
    };

    return { 
      success: true, 
      data: {
        sku: skuConUbicacion,
        ubicado: true,
        mensaje: 'SKU encontrado con ubicación'
      }
    };
  } catch (error) {
    console.error('Error al buscar SKU por código:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Crea un nuevo SKU con su ubicación
 */
export async function crearSkuConUbicacion(data: CrearSkuConUbicacionData) {
  try {
    // Verificar que el código no exista
    const existe = await SkuModel.codigoExists(data.codigo);
    if (existe) {
      return { success: false, error: 'Ya existe un SKU con este código' };
    }

    // Verificar que la bodega existe
    const bodega = await BodegaModel.getById(data.idBodega);
    if (!bodega) {
      return { success: false, error: 'Bodega no encontrada' };
    }

    // Validar ubicación
    const ubicacionValida = GeolocalizacionSkuModel.validarUbicacion(
      data.rack, 
      data.nivel, 
      data.pasillo
    );
    if (!ubicacionValida) {
      return { success: false, error: 'Formato de ubicación inválido' };
    }

    // Verificar que la ubicación no esté ocupada
    const ubicacionOcupada = await GeolocalizacionSkuModel.ubicacionOcupada(
      data.rack,
      data.nivel,
      data.pasillo,
      data.idBodega
    );
    if (ubicacionOcupada) {
      return { success: false, error: 'La ubicación ya está ocupada' };
    }

    // Crear el SKU
    const sku = await SkuModel.create({
      codigo: data.codigo,
      descripcion: data.descripcion,
      idContenedor: data.idContenedor || null,
      fechaRegistro: new Date()
    });

    // Crear la geolocalización
    const geolocalizacion = await GeolocalizacionSkuModel.create({
      idSku: sku.idSku,
      idBodega: data.idBodega,
      rack: data.rack,
      nivel: data.nivel,
      pasillo: data.pasillo,
      fechaUbicacion: new Date()
    });

    revalidatePath('/dashboard/geolocalizados-sku');
    revalidatePath('/dashboard/geolocalizacion-sku-bodega');
    
    return { 
      success: true, 
      data: { sku, geolocalizacion }
    };
  } catch (error) {
    console.error('Error al crear SKU con ubicación:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Mueve un SKU a una nueva ubicación
 */
export async function moverSku(idSku: number, nuevaUbicacion: {
  idBodega: number;
  rack: string;
  nivel: string;
  pasillo: string;
}) {
  try {
    const resultado = await GeolocalizacionSkuModel.moverSku(idSku, {
      ...nuevaUbicacion,
      fechaUbicacion: new Date()
    });

    if (!resultado) {
      return { success: false, error: 'No se pudo mover el SKU' };
    }

    revalidatePath('/dashboard/geolocalizados-sku');
    revalidatePath('/dashboard/geolocalizacion-sku-bodega');
    
    return { success: true, data: resultado };
  } catch (error) {
    console.error('Error al mover SKU:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene SKUs por bodega
 */
export async function obtenerSkusPorBodega(idBodega: number) {
  try {
    const resultado = await obtenerSkusGeolocalizados({ idBodega });
    return resultado;
  } catch (error) {
    console.error('Error al obtener SKUs por bodega:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Obtiene estadísticas de SKUs geolocalizados
 */
export async function obtenerEstadisticasSkusGeolocalizados() {
  try {
    const estadisticas = await SkuModel.getEstadisticas();
    return { success: true, data: estadisticas };
  } catch (error) {
    console.error('Error al obtener estadísticas de SKUs:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Busca SKUs por descripción
 */
export async function buscarSkusPorDescripcion(termino: string) {
  try {
    const skus = await SkuModel.searchByDescripcion(termino);
    
    // Obtener información de ubicación para cada SKU
    const skusConInfo = [];
    
    for (const sku of skus) {
      const geolocalizacion = await GeolocalizacionSkuModel.getBySku(sku.idSku);
      const ubicado = geolocalizacion !== null;
      
      skusConInfo.push({
        ...sku,
        ubicado,
        geolocalizacion
      });
    }
    
    return { success: true, data: skusConInfo };
  } catch (error) {
    console.error('Error al buscar SKUs por descripción:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Elimina la ubicación de un SKU (lo deja sin geolocalizar)
 */
export async function eliminarUbicacionSku(idSku: number) {
  try {
    const eliminado = await GeolocalizacionSkuModel.deleteBySku(idSku);
    
    if (!eliminado) {
      return { success: false, error: 'No se pudo eliminar la ubicación' };
    }

    revalidatePath('/dashboard/geolocalizados-sku');
    revalidatePath('/dashboard/geolocalizacion-sku-bodega');
    
    return { success: true, mensaje: 'Ubicación eliminada correctamente' };
  } catch (error) {
    console.error('Error al eliminar ubicación de SKU:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}