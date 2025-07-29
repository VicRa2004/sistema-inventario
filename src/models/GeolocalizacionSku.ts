import { db } from '@/libs/db';
import { geolocalizacionSku, sku, bodegas } from '@/libs/schema';
import { eq, ne, and, like } from 'drizzle-orm';

export interface IGeolocalizacionSku {
  idGeo: number;
  idSku: number | null;
  idBodega: number | null;
  rack: string | null;
  nivel: string | null;
  pasillo: string | null;
  fechaUbicacion: Date | null;
}

export class GeolocalizacionSkuModel {
  // Crear una nueva geolocalización
  static async create(data: Omit<IGeolocalizacionSku, 'idGeo'>): Promise<IGeolocalizacionSku> {
    const [geoCreated] = await db.insert(geolocalizacionSku).values(data).returning();
    return geoCreated;
  }

  // Obtener todas las geolocalizaciones
  static async getAll(): Promise<IGeolocalizacionSku[]> {
    return await db.select().from(geolocalizacionSku);
  }

  // Obtener geolocalización por ID
  static async getById(id: number): Promise<IGeolocalizacionSku | null> {
    const [geo] = await db.select().from(geolocalizacionSku).where(eq(geolocalizacionSku.idGeo, id));
    return geo || null;
  }

  // Obtener geolocalización por SKU
  static async getBySku(idSku: number): Promise<IGeolocalizacionSku | null> {
    const [geo] = await db.select().from(geolocalizacionSku).where(eq(geolocalizacionSku.idSku, idSku));
    return geo || null;
  }

  // Actualizar geolocalización
  static async update(id: number, data: Partial<Omit<IGeolocalizacionSku, 'idGeo'>>): Promise<IGeolocalizacionSku | null> {
    const [geoUpdated] = await db.update(geolocalizacionSku)
      .set(data)
      .where(eq(geolocalizacionSku.idGeo, id))
      .returning();
    return geoUpdated || null;
  }

  // Eliminar geolocalización
  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(geolocalizacionSku).where(eq(geolocalizacionSku.idGeo, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Eliminar geolocalización por SKU
  static async deleteBySku(idSku: number): Promise<boolean> {
    const result = await db.delete(geolocalizacionSku).where(eq(geolocalizacionSku.idSku, idSku));
    return (result.rowCount ?? 0) > 0;
  }

  // Obtener geolocalizaciones por bodega
  static async getByBodega(idBodega: number): Promise<IGeolocalizacionSku[]> {
    return await db.select().from(geolocalizacionSku).where(eq(geolocalizacionSku.idBodega, idBodega));
  }

  // Obtener geolocalizaciones por rack
  static async getByRack(rack: string, idBodega?: number): Promise<IGeolocalizacionSku[]> {
    if (idBodega) {
      return await db.select().from(geolocalizacionSku)
        .where(and(
          eq(geolocalizacionSku.rack, rack),
          eq(geolocalizacionSku.idBodega, idBodega)
        ));
    }
    
    return await db.select().from(geolocalizacionSku)
      .where(eq(geolocalizacionSku.rack, rack));
  }

  // Obtener geolocalizaciones por pasillo
  static async getByPasillo(pasillo: string, idBodega?: number): Promise<IGeolocalizacionSku[]> {
    if (idBodega) {
      return await db.select().from(geolocalizacionSku)
        .where(and(
          eq(geolocalizacionSku.pasillo, pasillo),
          eq(geolocalizacionSku.idBodega, idBodega)
        ));
    }
    
    return await db.select().from(geolocalizacionSku)
      .where(eq(geolocalizacionSku.pasillo, pasillo));
  }

  // Verificar si una ubicación específica está ocupada
  static async ubicacionOcupada(rack: string, nivel: string, pasillo: string, idBodega: number, excludeId?: number): Promise<boolean> {
    if (excludeId) {
      const [existing] = await db.select().from(geolocalizacionSku)
        .where(and(
          eq(geolocalizacionSku.rack, rack),
          eq(geolocalizacionSku.nivel, nivel),
          eq(geolocalizacionSku.pasillo, pasillo),
          eq(geolocalizacionSku.idBodega, idBodega),
          ne(geolocalizacionSku.idGeo, excludeId)
        ));
      return !!existing;
    }
    
    const [existing] = await db.select().from(geolocalizacionSku)
      .where(and(
        eq(geolocalizacionSku.rack, rack),
        eq(geolocalizacionSku.nivel, nivel),
        eq(geolocalizacionSku.pasillo, pasillo),
        eq(geolocalizacionSku.idBodega, idBodega)
      ));
    return !!existing;
  }

  // Obtener geolocalizaciones con información completa (joins)
  static async getWithDetails(id?: number) {
    const query = db.select({
      geolocalizacion: geolocalizacionSku,
      sku: sku,
      bodega: bodegas
    })
    .from(geolocalizacionSku)
    .leftJoin(sku, eq(geolocalizacionSku.idSku, sku.idSku))
    .leftJoin(bodegas, eq(geolocalizacionSku.idBodega, bodegas.idBodega));

    if (id) {
      return await query.where(eq(geolocalizacionSku.idGeo, id));
    }
    return await query;
  }

  // Buscar ubicaciones por término
  static async searchUbicaciones(termino: string, idBodega?: number) {
    if (idBodega) {
      return await db.select().from(geolocalizacionSku)
        .where(and(
          like(geolocalizacionSku.rack, `%${termino}%`),
          eq(geolocalizacionSku.idBodega, idBodega)
        ));
    }
    
    return await db.select().from(geolocalizacionSku)
      .where(like(geolocalizacionSku.rack, `%${termino}%`));
  }

  // Mover SKU a nueva ubicación
  static async moverSku(idSku: number, nuevaUbicacion: Omit<IGeolocalizacionSku, 'idGeo' | 'idSku'>): Promise<IGeolocalizacionSku | null> {
    // Verificar si la nueva ubicación está disponible
    if (nuevaUbicacion.rack && nuevaUbicacion.nivel && nuevaUbicacion.pasillo && nuevaUbicacion.idBodega) {
      const ocupada = await this.ubicacionOcupada(
        nuevaUbicacion.rack,
        nuevaUbicacion.nivel,
        nuevaUbicacion.pasillo,
        nuevaUbicacion.idBodega
      );
      
      if (ocupada) {
        throw new Error('La ubicación de destino ya está ocupada');
      }
    }
    
    // Buscar la geolocalización actual del SKU
    const geoActual = await this.getBySku(idSku);
    
    if (geoActual) {
      // Actualizar la ubicación existente
      return await this.update(geoActual.idGeo, nuevaUbicacion);
    } else {
      // Crear nueva geolocalización
      return await this.create({ idSku, ...nuevaUbicacion });
    }
  }

  // Obtener ubicaciones disponibles en una bodega
  static async getUbicacionesDisponibles(idBodega: number) {
    // Esta función podría implementarse según la lógica de negocio específica
    // Por ejemplo, si hay un rango predefinido de ubicaciones posibles
    const ocupadas = await this.getByBodega(idBodega);
    
    // Retornar información sobre ubicaciones ocupadas para que el frontend pueda determinar las disponibles
    return {
      ocupadas: ocupadas.map(geo => ({
        rack: geo.rack,
        nivel: geo.nivel,
        pasillo: geo.pasillo
      }))
    };
  }

  // Obtener estadísticas de ubicaciones por bodega
  static async getEstadisticasByBodega(idBodega: number) {
    const ubicaciones = await this.getByBodega(idBodega);
    
    const racks = [...new Set(ubicaciones.map(u => u.rack))];
    const pasillos = [...new Set(ubicaciones.map(u => u.pasillo))];
    const niveles = [...new Set(ubicaciones.map(u => u.nivel))];
    
    return {
      totalUbicaciones: ubicaciones.length,
      racksUtilizados: racks.length,
      pasillosUtilizados: pasillos.length,
      nivelesUtilizados: niveles.length,
      racks,
      pasillos,
      niveles
    };
  }

  // Obtener mapa de ocupación de una bodega
  static async getMapaOcupacion(idBodega: number) {
    const ubicaciones = await this.getWithDetails();
    
    return ubicaciones
      .filter(u => u.geolocalizacion.idBodega === idBodega)
      .map(u => ({
        ubicacion: {
          rack: u.geolocalizacion.rack,
          nivel: u.geolocalizacion.nivel,
          pasillo: u.geolocalizacion.pasillo
        },
        sku: u.sku ? {
           codigo: u.sku.codigo,
           descripcion: u.sku.descripcion
         } : null
      }));
  }

  // Validar formato de ubicación
  static validarUbicacion(rack: string, nivel: string, pasillo: string): boolean {
    // Implementar validaciones según las reglas de negocio
    // Por ejemplo: rack debe ser alfanumérico, nivel debe ser numérico, etc.
    return rack.length > 0 && nivel.length > 0 && pasillo.length > 0;
  }

  // Generar código de ubicación único
  static generarCodigoUbicacion(rack: string, nivel: string, pasillo: string): string {
    return `${pasillo}-${rack}-${nivel}`;
  }
}