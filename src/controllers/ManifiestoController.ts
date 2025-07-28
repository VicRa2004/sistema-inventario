import { ManifiestoModel } from '@/models/ManifiestoModel';

export class ManifiestoController {
  static async list() {
    return await ManifiestoModel.getAll();
  }

  static async create(idContenedor: number, escaneadoPor: number, fechaEscaneo?: Date) {
    return await ManifiestoModel.create({ idContenedor, escaneadoPor, fechaEscaneo });
  }

  static async getById(id: number) {
    return await ManifiestoModel.getById(id);
  }

  static async getByContenedor(idContenedor: number) {
    return await ManifiestoModel.getByContenedor(idContenedor);
  }

  static async update(id: number, data: Partial<{ idContenedor: number; escaneadoPor: number; fechaEscaneo: Date }>) {
    return await ManifiestoModel.update(id, data);
  }

  static async delete(id: number) {
    return await ManifiestoModel.delete(id);
  }
}