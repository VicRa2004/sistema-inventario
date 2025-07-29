import { db } from '@/libs/db';
import { sku, contenedores, geolocalizacionSku, bodegas } from '@/libs/schema';
import { eq, ne, and, like, isNull } from 'drizzle-orm';

export interface ISku {
  idSku: number;
  codigo: string | null;
  descripcion: string | null;
  idContenedor: number | null;
  fechaRegistro: Date | null;
}

export class SkuModel {
  // Crear un nuevo SKU
  static async create(data: Omit<ISku, 'idSku'>): Promise<ISku> {
    const [skuCreated] = await db.insert(sku).values(data).returning();
    return skuCreated;
  }

  // Obtener todos los SKUs
  static async getAll(): Promise<ISku[]> {
    return await db.select().from(sku);
  }

  // Obtener SKU por ID
  static async getById(id: number): Promise<ISku | null> {
    const [skuFound] = await db.select().from(sku).where(eq(sku.idSku, id));
    return skuFound || null;
  }

  // Obtener SKU por código
  static async getByCodigo(codigo: string): Promise<ISku | null> {
    const [skuFound] = await db.select().from(sku).where(eq(sku.codigo, codigo));
    return skuFound || null;
  }

  // Actualizar SKU
  static async update(id: number, data: Partial<Omit<ISku, 'idSku'>>): Promise<ISku | null> {
    const [skuUpdated] = await db.update(sku)
      .set(data)
      .where(eq(sku.idSku, id))
      .returning();
    return skuUpdated || null;
  }

  // Eliminar SKU
  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(sku).where(eq(sku.idSku, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Verificar si el código SKU ya existe
  static async codigoExists(codigo: string, excludeId?: number): Promise<boolean> {
    if (excludeId) {
      const [existing] = await db.select().from(sku)
        .where(and(
          eq(sku.codigo, codigo),
          ne(sku.idSku, excludeId)
        ));
      return !!existing;
    }
    
    const [existing] = await db.select().from(sku)
      .where(eq(sku.codigo, codigo));
    return !!existing;
  }

  // Obtener SKUs por contenedor
  static async getByContenedor(idContenedor: number): Promise<ISku[]> {
    return await db.select().from(sku).where(eq(sku.idContenedor, idContenedor));
  }

  // Buscar SKUs por descripción
  static async searchByDescripcion(termino: string): Promise<ISku[]> {
    return await db.select().from(sku)
      .where(like(sku.descripcion, `%${termino}%`));
  }

  // Buscar SKUs por código
  static async searchByCodigo(termino: string): Promise<ISku[]> {
    return await db.select().from(sku)
      .where(like(sku.codigo, `%${termino}%`));
  }

  // Obtener SKUs con información completa (joins)
  static async getWithDetails(id?: number) {
    const query = db.select({
      sku: sku,
      contenedor: contenedores,
      geolocalizacion: geolocalizacionSku,
      bodega: bodegas
    })
    .from(sku)
    .leftJoin(contenedores, eq(sku.idContenedor, contenedores.idContenedor))
    .leftJoin(geolocalizacionSku, eq(sku.idSku, geolocalizacionSku.idSku))
    .leftJoin(bodegas, eq(geolocalizacionSku.idBodega, bodegas.idBodega));

    if (id) {
      return await query.where(eq(sku.idSku, id));
    }
    return await query;
  }

  // Obtener SKUs ubicados (con geolocalización)
  static async getUbicados(): Promise<ISku[]> {
    return await db.select({ sku: sku })
      .from(sku)
      .innerJoin(geolocalizacionSku, eq(sku.idSku, geolocalizacionSku.idSku))
      .then(results => results.map(r => r.sku));
  }

  // Obtener SKUs sin ubicar (sin geolocalización)
  static async getSinUbicar(): Promise<ISku[]> {
    const results = await db.select({ sku: sku })
      .from(sku)
      .leftJoin(geolocalizacionSku, eq(sku.idSku, geolocalizacionSku.idSku))
      .where(isNull(geolocalizacionSku.idSku));
    
    return results.map(r => r.sku);
  }

  // Verificar si un SKU está ubicado
  static async estaUbicado(idSku: number): Promise<boolean> {
    const [ubicacion] = await db.select()
      .from(geolocalizacionSku)
      .where(eq(geolocalizacionSku.idSku, idSku));
    return !!ubicacion;
  }

  // Obtener SKUs por bodega
  static async getByBodega(idBodega: number): Promise<ISku[]> {
    return await db.select({ sku: sku })
      .from(sku)
      .innerJoin(geolocalizacionSku, eq(sku.idSku, geolocalizacionSku.idSku))
      .where(eq(geolocalizacionSku.idBodega, idBodega))
      .then(results => results.map(r => r.sku));
  }

  // Contar SKUs por contenedor
  static async countByContenedor(idContenedor: number): Promise<number> {
    const skus = await this.getByContenedor(idContenedor);
    return skus.length;
  }

  // Obtener estadísticas de SKUs
  static async getEstadisticas() {
    const [totalSkus, skusUbicados, skusSinUbicar] = await Promise.all([
      this.getAll(),
      this.getUbicados(),
      this.getSinUbicar()
    ]);

    return {
      total: totalSkus.length,
      ubicados: skusUbicados.length,
      sinUbicar: skusSinUbicar.length,
      porcentajeUbicados: totalSkus.length > 0 ? (skusUbicados.length / totalSkus.length) * 100 : 0
    };
  }

  // Obtener SKUs recientes (últimos creados)
  static async getRecent(limit: number = 10): Promise<ISku[]> {
    return await db.select().from(sku)
      .orderBy(sku.idSku)
      .limit(limit);
  }
}