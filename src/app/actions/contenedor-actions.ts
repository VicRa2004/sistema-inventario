'use server';

import { ContenedorController } from '@/controllers/ContenedorController';
import { tipoContenedorEnum, estadoContenedorEnum } from '@/libs/schema';

export async function getContenedores() {
  return await ContenedorController.list();
}

export async function getContenedorById(id: number) {
  return await ContenedorController.getById(id);
}

export async function getContenedorByCodigo(codigo: string) {
  return await ContenedorController.getByCodigo(codigo);
}

export async function createContenedor(formData: FormData) {
  const codigo = formData.get('codigo') as string;
  const tipo = formData.get('tipo') as typeof tipoContenedorEnum.enumValues[number];
  
  let fechaLlegada: Date | undefined;
  const fechaStr = formData.get('fechaLlegada');
  if (fechaStr) fechaLlegada = new Date(fechaStr as string);
  
  const estado = formData.get('estado') as typeof estadoContenedorEnum.enumValues[number] | undefined;

  return await ContenedorController.create(codigo, tipo, fechaLlegada, estado);
}

export async function updateContenedor(id: number, formData: FormData) {
  const data: Partial<{ codigo: string; tipo: typeof tipoContenedorEnum.enumValues[number]; fechaLlegada: Date; estado: typeof estadoContenedorEnum.enumValues[number] }> = {};
  
  const codigo = formData.get('codigo');
  if (codigo) data.codigo = codigo as string;
  
  const tipo = formData.get('tipo');
  if (tipo) data.tipo = tipo as typeof tipoContenedorEnum.enumValues[number];
  
  const fechaStr = formData.get('fechaLlegada');
  if (fechaStr) data.fechaLlegada = new Date(fechaStr as string);
  
  const estado = formData.get('estado');
  if (estado) data.estado = estado as typeof estadoContenedorEnum.enumValues[number];

  return await ContenedorController.update(id, data);
}

export async function deleteContenedor(id: number) {
  return await ContenedorController.delete(id);
}