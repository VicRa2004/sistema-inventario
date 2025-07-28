'use server';

import { EntregaController } from '@/controllers/EntregaController';

export async function getEntregas() {
  return await EntregaController.list();
}

export async function getEntregaById(id: number) {
  return await EntregaController.getById(id);
}

export async function getEntregasByContenedor(idContenedor: number) {
  return await EntregaController.getByContenedor(idContenedor);
}

export async function getEntregasByRepartidor(repartidoPor: number) {
  return await EntregaController.getByRepartidor(repartidoPor);
}

export async function createEntrega(formData: FormData) {
  const idContenedor = Number(formData.get('idContenedor'));
  const repartidoPor = Number(formData.get('repartidoPor'));
  const bodegaDestino = formData.get('bodegaDestino') as string;
  
  let fechaEntrega: Date | undefined;
  const fechaStr = formData.get('fechaEntrega');
  if (fechaStr) fechaEntrega = new Date(fechaStr as string);
  
  const observaciones = formData.get('observaciones') as string | undefined;

  return await EntregaController.create(idContenedor, repartidoPor, bodegaDestino, fechaEntrega, observaciones);
}

export async function updateEntrega(id: number, formData: FormData) {
  const data: Partial<{ idContenedor: number; repartidoPor: number; bodegaDestino: string; fechaEntrega: Date; observaciones: string }> = {};
  
  const idContenedor = formData.get('idContenedor');
  if (idContenedor) data.idContenedor = Number(idContenedor);
  
  const repartidoPor = formData.get('repartidoPor');
  if (repartidoPor) data.repartidoPor = Number(repartidoPor);
  
  const bodegaDestino = formData.get('bodegaDestino');
  if (bodegaDestino) data.bodegaDestino = bodegaDestino as string;
  
  const fechaStr = formData.get('fechaEntrega');
  if (fechaStr) data.fechaEntrega = new Date(fechaStr as string);
  
  const observaciones = formData.get('observaciones');
  if (observaciones) data.observaciones = observaciones as string;

  return await EntregaController.update(id, data);
}

export async function deleteEntrega(id: number) {
  return await EntregaController.delete(id);
}