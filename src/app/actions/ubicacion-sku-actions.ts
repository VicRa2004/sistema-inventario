'use server';

import { UbicacionSkuController } from '@/controllers/UbicacionSkuController';

export async function getUbicacionesSku() {
  return await UbicacionSkuController.list();
}

export async function getUbicacionSkuById(id: number) {
  return await UbicacionSkuController.getById(id);
}

export async function getUbicacionesBySku(sku: string) {
  return await UbicacionSkuController.getBySku(sku);
}

export async function getUbicacionesByBodega(bodega: string) {
  return await UbicacionSkuController.getByBodega(bodega);
}

export async function getUbicacionesByRegistrador(registradoPor: number) {
  return await UbicacionSkuController.getByRegistrador(registradoPor);
}

export async function createUbicacionSku(formData: FormData) {
  const sku = formData.get('sku') as string;
  const bodega = formData.get('bodega') as string;
  const registradoPor = Number(formData.get('registradoPor'));
  const estante = formData.get('estante') as string | undefined;
  const nivel = formData.get('nivel') as string | undefined;
  
  let coordenadas: any | undefined;
  const coordX = formData.get('coordX');
  const coordY = formData.get('coordY');
  if (coordX && coordY) {
    coordenadas = `(${coordX},${coordY})`;
  }
  
  let fechaRegistro: Date | undefined;
  const fechaStr = formData.get('fechaRegistro');
  if (fechaStr) fechaRegistro = new Date(fechaStr as string);

  return await UbicacionSkuController.create(sku, bodega, registradoPor, estante, nivel, coordenadas, fechaRegistro);
}

export async function updateUbicacionSku(id: number, formData: FormData) {
  const data: Partial<{ sku: string; bodega: string; estante: string; nivel: string; coordenadas: any; registradoPor: number; fechaRegistro: Date }> = {};
  
  const sku = formData.get('sku');
  if (sku) data.sku = sku as string;
  
  const bodega = formData.get('bodega');
  if (bodega) data.bodega = bodega as string;
  
  const estante = formData.get('estante');
  if (estante) data.estante = estante as string;
  
  const nivel = formData.get('nivel');
  if (nivel) data.nivel = nivel as string;
  
  const coordX = formData.get('coordX');
  const coordY = formData.get('coordY');
  if (coordX && coordY) {
    data.coordenadas = `(${coordX},${coordY})`;
  }
  
  const registradoPor = formData.get('registradoPor');
  if (registradoPor) data.registradoPor = Number(registradoPor);
  
  const fechaStr = formData.get('fechaRegistro');
  if (fechaStr) data.fechaRegistro = new Date(fechaStr as string);

  return await UbicacionSkuController.update(id, data);
}

export async function deleteUbicacionSku(id: number) {
  return await UbicacionSkuController.delete(id);
}