import { db } from '@/libs/db';
import { usuarios } from '@/libs/schema';
import { eq } from 'drizzle-orm';

export interface IUsuario {
  idUsuario: number;
  nombre: string | null;
  rol: string | null;
  correo: string | null;
  password: string | null;
}

export class UsuarioModel {
  // Crear un nuevo usuario
  static async create(data: Omit<IUsuario, 'idUsuario'>): Promise<IUsuario> {
    const [usuario] = await db.insert(usuarios).values(data).returning();
    return usuario;
  }

  // Obtener todos los usuarios
  static async getAll(): Promise<IUsuario[]> {
    return await db.select().from(usuarios);
  }

  // Obtener usuario por ID
  static async getById(id: number): Promise<IUsuario | null> {
    const [usuario] = await db.select().from(usuarios).where(eq(usuarios.idUsuario, id));
    return usuario || null;
  }

  // Obtener usuario por correo
  static async getByEmail(correo: string): Promise<IUsuario | null> {
    const [usuario] = await db.select().from(usuarios).where(eq(usuarios.correo, correo));
    return usuario || null;
  }

  // Actualizar usuario
  static async update(id: number, data: Partial<Omit<IUsuario, 'idUsuario'>>): Promise<IUsuario | null> {
    const [usuario] = await db.update(usuarios)
      .set(data)
      .where(eq(usuarios.idUsuario, id))
      .returning();
    return usuario || null;
  }

  // Eliminar usuario
  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(usuarios).where(eq(usuarios.idUsuario, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Validar credenciales (para login)
  static async validateCredentials(correo: string, password: string): Promise<IUsuario | null> {
    // Aquí deberías usar bcrypt para comparar passwords hasheadas
    const usuario = await this.getByEmail(correo);
    if (usuario && usuario.password === password) {
      return usuario;
    }
    return null;
  }

  // Obtener usuarios por rol
  static async getByRole(rol: string): Promise<IUsuario[]> {
    return await db.select().from(usuarios).where(eq(usuarios.rol, rol));
  }

  // Verificar si el correo ya existe
  static async emailExists(correo: string): Promise<boolean> {
    const usuario = await this.getByEmail(correo);
    return usuario !== null;
  }
}