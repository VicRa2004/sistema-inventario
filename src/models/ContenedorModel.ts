import { db } from '@/libs/db';
import { contenedores, tipoContenedorEnum, estadoContenedorEnum } from '@/libs/schema';
import { eq } from 'drizzle-orm';

export class ContenedorModel {
  static async getAll() {
    return db.select().from(contenedores);
  }

  static async create(data: { codigo: string; tipo: typeof tipoContenedorEnum.enumValues[number]; fechaLlegada?: Date; estado?: typeof estadoContenedorEnum.enumValues[number] }) {
    return db.insert(contenedores).values(data);
  }

  static async getById(id: number) {
    return db.select().from(contenedores).where(eq(contenedores.idContenedor, id));
  }

  static async getByCodigo(codigo: string) {
    return db.select().from(contenedores).where(eq(contenedores.codigo, codigo));
  }

  static async update(id: number, data: Partial<{ codigo: string; tipo: typeof tipoContenedorEnum.enumValues[number]; fechaLlegada: Date; estado: typeof estadoContenedorEnum.enumValues[number] }>) {
    return db.update(contenedores).set(data).where(eq(contenedores.idContenedor, id));
  }

  static async delete(id: number) {
    return db.delete(contenedores).where(eq(contenedores.idContenedor, id));
  }
}