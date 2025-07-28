import { db } from '@/libs/db';
import { confirmaciones, estadoEntregaEnum } from '@/libs/schema';
import { eq } from 'drizzle-orm';

export class ConfirmacionModel {
  static async getAll() {
    return db.select().from(confirmaciones);
  }

  static async create(data: { idEntrega: number; confirmadoPor: number; fechaConfirmacion?: Date; estadoEntrega?: typeof estadoEntregaEnum.enumValues[number]; comentarios?: string }) {
    return db.insert(confirmaciones).values(data);
  }

  static async getById(id: number) {
    return db.select().from(confirmaciones).where(eq(confirmaciones.idConfirmacion, id));
  }

  static async getByEntrega(idEntrega: number) {
    return db.select().from(confirmaciones).where(eq(confirmaciones.idEntrega, idEntrega));
  }

  static async getByConfirmador(confirmadoPor: number) {
    return db.select().from(confirmaciones).where(eq(confirmaciones.confirmadoPor, confirmadoPor));
  }

  static async update(id: number, data: Partial<{ idEntrega: number; confirmadoPor: number; fechaConfirmacion: Date; estadoEntrega: typeof estadoEntregaEnum.enumValues[number]; comentarios: string }>) {
    return db.update(confirmaciones).set(data).where(eq(confirmaciones.idConfirmacion, id));
  }

  static async delete(id: number) {
    return db.delete(confirmaciones).where(eq(confirmaciones.idConfirmacion, id));
  }
}