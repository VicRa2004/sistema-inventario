'use server';

import { ConfirmacionController } from '@/controllers/ConfirmacionController';
import { estadoEntregaEnum } from '@/libs/schema';

export async function getConfirmaciones() {
  return await ConfirmacionController.list();
}

export async function getConfirmacionById(id: number) {
  return await ConfirmacionController.getById(id);
}

export async function getConfirmacionesByEntrega(idEntrega: number) {
  return await ConfirmacionController.getByEntrega(idEntrega);
}

export async function getConfirmacionesByConfirmador(confirmadoPor: number) {
  return await ConfirmacionController.getByConfirmador(confirmadoPor);
}

export async function createConfirmacion(formData: FormData) {
  const idEntrega = Number(formData.get('idEntrega'));
  const confirmadoPor = Number(formData.get('confirmadoPor'));
  
  let fechaConfirmacion: Date | undefined;
  const fechaStr = formData.get('fechaConfirmacion');
  if (fechaStr) fechaConfirmacion = new Date(fechaStr as string);
  
  const estadoEntrega = formData.get('estadoEntrega') as typeof estadoEntregaEnum.enumValues[number] | undefined;
  const comentarios = formData.get('comentarios') as string | undefined;

  return await ConfirmacionController.create(idEntrega, confirmadoPor, fechaConfirmacion, estadoEntrega, comentarios);
}

export async function updateConfirmacion(id: number, formData: FormData) {
  const data: Partial<{ idEntrega: number; confirmadoPor: number; fechaConfirmacion: Date; estadoEntrega: typeof estadoEntregaEnum.enumValues[number]; comentarios: string }> = {};
  
  const idEntrega = formData.get('idEntrega');
  if (idEntrega) data.idEntrega = Number(idEntrega);
  
  const confirmadoPor = formData.get('confirmadoPor');
  if (confirmadoPor) data.confirmadoPor = Number(confirmadoPor);
  
  const fechaStr = formData.get('fechaConfirmacion');
  if (fechaStr) data.fechaConfirmacion = new Date(fechaStr as string);
  
  const estadoEntrega = formData.get('estadoEntrega');
  if (estadoEntrega) data.estadoEntrega = estadoEntrega as typeof estadoEntregaEnum.enumValues[number];
  
  const comentarios = formData.get('comentarios');
  if (comentarios) data.comentarios = comentarios as string;

  return await ConfirmacionController.update(id, data);
}

export async function deleteConfirmacion(id: number) {
  return await ConfirmacionController.delete(id);
}