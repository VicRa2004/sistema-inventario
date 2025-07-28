'use server';

import { ManifiestoController } from '@/controllers/ManifiestoController';

export async function getManifiestos() {
  return await ManifiestoController.list();
}

export async function getManifiestoById(id: number) {
  return await ManifiestoController.getById(id);
}

export async function getManifiestosByContenedor(idContenedor: number) {
  return await ManifiestoController.getByContenedor(idContenedor);
}

export async function createManifiesto(formData: FormData) {
  const idContenedor = Number(formData.get('idContenedor'));
  const escaneadoPor = Number(formData.get('escaneadoPor'));
  
  let fechaEscaneo: Date | undefined;
  const fechaStr = formData.get('fechaEscaneo');
  if (fechaStr) fechaEscaneo = new Date(fechaStr as string);

  return await ManifiestoController.create(idContenedor, escaneadoPor, fechaEscaneo);
}

export async function updateManifiesto(id: number, formData: FormData) {
  const data: Partial<{ idContenedor: number; escaneadoPor: number; fechaEscaneo: Date }> = {};
  
  const idContenedor = formData.get('idContenedor');
  if (idContenedor) data.idContenedor = Number(idContenedor);
  
  const escaneadoPor = formData.get('escaneadoPor');
  if (escaneadoPor) data.escaneadoPor = Number(escaneadoPor);
  
  const fechaStr = formData.get('fechaEscaneo');
  if (fechaStr) data.fechaEscaneo = new Date(fechaStr as string);

  return await ManifiestoController.update(id, data);
}

export async function deleteManifiesto(id: number) {
  return await ManifiestoController.delete(id);
}