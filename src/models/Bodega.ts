import { db } from '@/libs/db';
import { bodegas, entregas, geolocalizacionSku } from '@/libs/schema';
import { eq } from 'drizzle-orm';

export interface IBodega {
  idBodega: number;
  nombre: string | null;
}

export class BodegaModel {
  // Crear una nueva bodega
  static async create(data: Omit<IBodega, 'idBodega'>): Promise<IBodega> {
    const [bodega] = await db.insert(bodegas).values(data).returning();
    return bodega;
  }

  // Obtener todas las bodegas
  static async getAll(): Promise<IBodega[]> {
    return await db.select().from(bodegas);
  }

  // Obtener bodega por ID
  static async getById(id: number): Promise<IBodega | null> {
    const [bodega] = await db.select().from(bodegas).where(eq(bodegas.idBodega, id));
    return bodega || null;
  }

  // Obtener bodega por nombre
  static async getByNombre(nombre: string): Promise<IBodega | null> {
    const [bodega] = await db.select().from(bodegas).where(eq(bodegas.nombre, nombre));
    return bodega || null;
  }

  // Actualizar bodega
  static async update(id: number, data: Partial<Omit<IBodega, 'idBodega'>>): Promise<IBodega | null> {
    const [bodega] = await db.update(bodegas)
      .set(data)
      .where(eq(bodegas.idBodega, id))
      .returning();
    return bodega || null;
  }

  // Eliminar bodega
  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(bodegas).where(eq(bodegas.idBodega, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Verificar si el nombre ya existe
  static async nombreExists(nombre: string): Promise<boolean> {
    const bodega = await this.getByNombre(nombre);
    return bodega !== null;
  }

  // Obtener bodegas con sus entregas
  static async getWithEntregas(id: number) {
    return await db.select({
      bodega: bodegas,
      entregas: entregas
    })
    .from(bodegas)
    .leftJoin(entregas, eq(bodegas.idBodega, entregas.idBodega))
    .where(eq(bodegas.idBodega, id));
  }

  // Obtener bodegas con geolocalizaciones de SKUs
  static async getWithGeolocalizaciones(id: number) {
    return await db.select({
      bodega: bodegas,
      geolocalizaciones: geolocalizacionSku
    })
    .from(bodegas)
    .leftJoin(geolocalizacionSku, eq(bodegas.idBodega, geolocalizacionSku.idBodega))
    .where(eq(bodegas.idBodega, id));
  }

  // Verificar si la bodega tiene entregas
  static async hasEntregas(id: number): Promise<boolean> {
    const [entrega] = await db.select().from(entregas).where(eq(entregas.idBodega, id)).limit(1);
    return entrega !== undefined;
  }

  // Verificar si la bodega tiene SKUs ubicados
  static async hasSkusUbicados(id: number): Promise<boolean> {
    const [geo] = await db.select().from(geolocalizacionSku).where(eq(geolocalizacionSku.idBodega, id)).limit(1);
    return geo !== undefined;
  }

  // Contar entregas por bodega
  static async countEntregas(id: number): Promise<number> {
    const result = await db.select().from(entregas).where(eq(entregas.idBodega, id));
    return result.length;
  }

  // Contar SKUs ubicados por bodega
  static async countSkusUbicados(id: number): Promise<number> {
    const result = await db.select().from(geolocalizacionSku).where(eq(geolocalizacionSku.idBodega, id));
    return result.length;
  }

  // Obtener estadísticas de la bodega
  static async getEstadisticas(id: number) {
    const [totalEntregas, totalSkus] = await Promise.all([
      this.countEntregas(id),
      this.countSkusUbicados(id)
    ]);

    return {
      totalEntregas,
      totalSkus,
      capacidadUtilizada: totalSkus // Esto se puede ajustar según la lógica de capacidad
    };
  }
}