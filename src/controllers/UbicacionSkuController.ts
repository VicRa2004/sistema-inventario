import { UbicacionSkuModel } from '@/models/UbicacionSkuModel';

export class UbicacionSkuController {
  static async list() {
    return await UbicacionSkuModel.getAll();
  }

  static async create(sku: string, bodega: string, registradoPor: number, estante?: string, nivel?: string, coordenadas?: any, fechaRegistro?: Date) {
    return await UbicacionSkuModel.create({ sku, bodega, estante, nivel, coordenadas, registradoPor, fechaRegistro });
  }

  static async getById(id: number) {
    return await UbicacionSkuModel.getById(id);
  }

  static async getBySku(sku: string) {
    return await UbicacionSkuModel.getBySku(sku);
  }

  static async getByBodega(bodega: string) {
    return await UbicacionSkuModel.getByBodega(bodega);
  }

  static async getByRegistrador(registradoPor: number) {
    return await UbicacionSkuModel.getByRegistrador(registradoPor);
  }

  static async update(id: number, data: Partial<{ sku: string; bodega: string; estante: string; nivel: string; coordenadas: any; registradoPor: number; fechaRegistro: Date }>) {
    return await UbicacionSkuModel.update(id, data);
  }

  static async delete(id: number) {
    return await UbicacionSkuModel.delete(id);
  }
}