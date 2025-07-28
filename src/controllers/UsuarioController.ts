import { UsuarioModel } from '@/models/UsuarioModel';
import { rolUsuarioEnum } from '@/libs/schema';

export class UsuarioController {
  static async list() {
    return await UsuarioModel.getAll();
  }

  static async create(nombre: string, correo: string, password: string, rol: typeof rolUsuarioEnum.enumValues[number]) {
    return await UsuarioModel.create({ nombre, correo, password, rol });
  }

  static async getById(id: number) {
    return await UsuarioModel.getById(id);
  }

  static async getByEmail(correo: string) {
    return await UsuarioModel.getByEmail(correo);
  }

  static async update(id: number, data: Partial<{ nombre: string; correo: string; password: string; rol: typeof rolUsuarioEnum.enumValues[number] }>) {
    return await UsuarioModel.update(id, data);
  }

  static async delete(id: number) {
    return await UsuarioModel.delete(id);
  }
}