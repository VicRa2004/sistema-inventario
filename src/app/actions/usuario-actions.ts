'use server';

import { UsuarioController } from '@/controllers/UsuarioController';
import { rolUsuarioEnum } from '@/libs/schema';

export async function getUsuarios() {
  return await UsuarioController.list();
}

export async function getUsuarioById(id: number) {
  return await UsuarioController.getById(id);
}

export async function getUsuarioByEmail(correo: string) {
  return await UsuarioController.getByEmail(correo);
}

export async function createUsuario(formData: FormData) {
  const nombre = formData.get('nombre') as string;
  const correo = formData.get('correo') as string;
  const password = formData.get('password') as string;
  const rol = formData.get('rol') as typeof rolUsuarioEnum.enumValues[number];

  return await UsuarioController.create(nombre, correo, password, rol);
}

export async function updateUsuario(id: number, formData: FormData) {
  const data: Partial<{ nombre: string; correo: string; password: string; rol: typeof rolUsuarioEnum.enumValues[number] }> = {};
  
  const nombre = formData.get('nombre');
  if (nombre) data.nombre = nombre as string;
  
  const correo = formData.get('correo');
  if (correo) data.correo = correo as string;
  
  const password = formData.get('password');
  if (password) data.password = password as string;
  
  const rol = formData.get('rol');
  if (rol) data.rol = rol as typeof rolUsuarioEnum.enumValues[number];

  return await UsuarioController.update(id, data);
}

export async function deleteUsuario(id: number) {
  return await UsuarioController.delete(id);
}