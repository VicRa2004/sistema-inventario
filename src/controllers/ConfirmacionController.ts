import { ConfirmacionModel } from '@/models/ConfirmacionModel';
import { estadoEntregaEnum } from '@/libs/schema';

export class ConfirmacionController {
  static async list() {
    return await ConfirmacionModel.getAll();
  }

  static async create(idEntrega: number, confirmadoPor: number, fechaConfirmacion?: Date, estadoEntrega?: typeof estadoEntregaEnum.enumValues[number], comentarios?: string) {
    return await ConfirmacionModel.create({ idEntrega, confirmadoPor, fechaConfirmacion, estadoEntrega, comentarios });
  }

  static async getById(id: number) {
    return await ConfirmacionModel.getById(id);
  }

  static async getByEntrega(idEntrega: number) {
    return await ConfirmacionModel.getByEntrega(idEntrega);
  }

  static async getByConfirmador(confirmadoPor: number) {
    return await ConfirmacionModel.getByConfirmador(confirmadoPor);
  }

  static async update(id: number, data: Partial<{ idEntrega: number; confirmadoPor: number; fechaConfirmacion: Date; estadoEntrega: typeof estadoEntregaEnum.enumValues[number]; comentarios: string }>) {
    return await ConfirmacionModel.update(id, data);
  }

  static async delete(id: number) {
    return await ConfirmacionModel.delete(id);
  }
}