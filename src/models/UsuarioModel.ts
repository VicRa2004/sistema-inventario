import { db } from '@/libs/db';
import { usuarios, rolUsuarioEnum } from '@/libs/schema';
import { eq } from 'drizzle-orm';

export class UsuarioModel {
  static async getAll() {
    return db.select().from(usuarios);
  }

  static async create(data: { nombre: string; correo: string; password: string; rol: typeof rolUsuarioEnum.enumValues[number] }) {
    return db.insert(usuarios).values(data);
  }

  static async getById(id: number) {
    return db.select().from(usuarios).where(eq(usuarios.idUsuario, id));
  }

  static async getByEmail(correo: string) {
    return db.select().from(usuarios).where(eq(usuarios.correo, correo));
  }

  static async update(id: number, data: Partial<{ nombre: string; correo: string; password: string; rol: typeof rolUsuarioEnum.enumValues[number] }>) {
    return db.update(usuarios).set(data).where(eq(usuarios.idUsuario, id));
  }

  static async delete(id: number) {
    return db.delete(usuarios).where(eq(usuarios.idUsuario, id));
  }
}