import { db } from '@/libs/db';
import { entregas } from '@/libs/schema';
import { eq } from 'drizzle-orm';

export class EntregaModel {
  static async getAll() {
    return db.select().from(entregas);
  }

  static async create(data: { idContenedor: number; repartidoPor: number; bodegaDestino: string; fechaEntrega?: Date; observaciones?: string }) {
    return db.insert(entregas).values(data);
  }

  static async getById(id: number) {
    return db.select().from(entregas).where(eq(entregas.idEntrega, id));
  }

  static async getByContenedor(idContenedor: number) {
    return db.select().from(entregas).where(eq(entregas.idContenedor, idContenedor));
  }

  static async getByRepartidor(repartidoPor: number) {
    return db.select().from(entregas).where(eq(entregas.repartidoPor, repartidoPor));
  }

  static async update(id: number, data: Partial<{ idContenedor: number; repartidoPor: number; bodegaDestino: string; fechaEntrega: Date; observaciones: string }>) {
    return db.update(entregas).set(data).where(eq(entregas.idEntrega, id));
  }

  static async delete(id: number) {
    return db.delete(entregas).where(eq(entregas.idEntrega, id));
  }
}