import { db } from '@/libs/db';
import { ubicacionesSku } from '@/libs/schema';
import { eq } from 'drizzle-orm';

export class UbicacionSkuModel {
  static async getAll() {
    return db.select().from(ubicacionesSku);
  }

  static async create(data: { sku: string; bodega: string; estante?: string; nivel?: string; coordenadas?: any; registradoPor: number; fechaRegistro?: Date }) {
    return db.insert(ubicacionesSku).values(data);
  }

  static async getById(id: number) {
    return db.select().from(ubicacionesSku).where(eq(ubicacionesSku.idUbicacion, id));
  }

  static async getBySku(sku: string) {
    return db.select().from(ubicacionesSku).where(eq(ubicacionesSku.sku, sku));
  }

  static async getByBodega(bodega: string) {
    return db.select().from(ubicacionesSku).where(eq(ubicacionesSku.bodega, bodega));
  }

  static async getByRegistrador(registradoPor: number) {
    return db.select().from(ubicacionesSku).where(eq(ubicacionesSku.registradoPor, registradoPor));
  }

  static async update(id: number, data: Partial<{ sku: string; bodega: string; estante: string; nivel: string; coordenadas: any; registradoPor: number; fechaRegistro: Date }>) {
    return db.update(ubicacionesSku).set(data).where(eq(ubicacionesSku.idUbicacion, id));
  }

  static async delete(id: number) {
    return db.delete(ubicacionesSku).where(eq(ubicacionesSku.idUbicacion, id));
  }
}