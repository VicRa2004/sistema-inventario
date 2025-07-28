import { ContenedorModel } from '@/models/ContenedorModel';
import { tipoContenedorEnum, estadoContenedorEnum } from '@/libs/schema';

export class ContenedorController {
  static async list() {
    return await ContenedorModel.getAll();
  }

  static async create(codigo: string, tipo: typeof tipoContenedorEnum.enumValues[number], fechaLlegada?: Date, estado?: typeof estadoContenedorEnum.enumValues[number]) {
    return await ContenedorModel.create({ codigo, tipo, fechaLlegada, estado });
  }

  static async getById(id: number) {
    return await ContenedorModel.getById(id);
  }

  static async getByCodigo(codigo: string) {
    return await ContenedorModel.getByCodigo(codigo);
  }

  static async update(id: number, data: Partial<{ codigo: string; tipo: typeof tipoContenedorEnum.enumValues[number]; fechaLlegada: Date; estado: typeof estadoContenedorEnum.enumValues[number] }>) {
    return await ContenedorModel.update(id, data);
  }

  static async delete(id: number) {
    return await ContenedorModel.delete(id);
  }
}