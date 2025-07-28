import { EntregaModel } from '@/models/EntregaModel';

export class EntregaController {
  static async list() {
    return await EntregaModel.getAll();
  }

  static async create(idContenedor: number, repartidoPor: number, bodegaDestino: string, fechaEntrega?: Date, observaciones?: string) {
    return await EntregaModel.create({ idContenedor, repartidoPor, bodegaDestino, fechaEntrega, observaciones });
  }

  static async getById(id: number) {
    return await EntregaModel.getById(id);
  }

  static async getByContenedor(idContenedor: number) {
    return await EntregaModel.getByContenedor(idContenedor);
  }

  static async getByRepartidor(repartidoPor: number) {
    return await EntregaModel.getByRepartidor(repartidoPor);
  }

  static async update(id: number, data: Partial<{ idContenedor: number; repartidoPor: number; bodegaDestino: string; fechaEntrega: Date; observaciones: string }>) {
    return await EntregaModel.update(id, data);
  }

  static async delete(id: number) {
    return await EntregaModel.delete(id);
  }
}