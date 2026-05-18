'use server';

import { revalidatePath } from 'next/cache';
import { UsuarioModel } from '@/models';

export async function obtenerUsuarios() {
  try {
    const usuarios = await UsuarioModel.getAll();
    return { success: true, data: usuarios };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

export async function crearUsuario(data: {
  nombre: string;
  correo: string;
  rol: string;
  password: string;
}) {
  try {
    // Validar que el correo no exista
    const existe = await UsuarioModel.emailExists(data.correo);
    if (existe) {
      return { success: false, error: 'El correo ya está registrado' };
    }

    const usuario = await UsuarioModel.create(data);
    revalidatePath('/dashboard/usuarios');
    return { success: true, data: usuario };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

export async function eliminarUsuario(id: number) {
  try {
    const eliminado = await UsuarioModel.delete(id);
    if (eliminado) {
      revalidatePath('/dashboard/usuarios');
      return { success: true };
    }
    return { success: false, error: 'No se pudo eliminar el usuario' };
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

export async function actualizarUsuario(
  id: number,
  data: {
    nombre?: string;
    correo?: string;
    rol?: string;
  }
) {
  try {
    const usuario = await UsuarioModel.update(id, data);
    if (usuario) {
      revalidatePath('/dashboard/usuarios');
      return { success: true, data: usuario };
    }
    return { success: false, error: 'No se pudo actualizar el usuario' };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}
