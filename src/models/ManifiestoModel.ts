import { db } from '@/libs/db';
import { manifiestos } from '@/libs/schema';
import { eq } from 'drizzle-orm';

export class ManifiestoModel {
  static async getAll() {
    return db.select().from(manifiestos);
  }

  static async create(data: { idContenedor: number; escaneadoPor: number; fechaEscaneo?: Date }) {
    return db.insert(manifiestos).values(data);
  }

  static async getById(id: number) {
    return db.select().from(manifiestos).where(eq(manifiestos.idManifiesto, id));
  }

  static async getByContenedor(idContenedor: number) {
    return db.select().from(manifiestos).where(eq(manifiestos.idContenedor, idContenedor));
  }

  static async update(id: number, data: Partial<{ idContenedor: number; escaneadoPor: number; fechaEscaneo: Date }>) {
    return db.update(manifiestos).set(data).where(eq(manifiestos.idManifiesto, id));
  }

  static async delete(id: number) {
    return db.delete(manifiestos).where(eq(manifiestos.idManifiesto, id));
  }
}