import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { correo, password } = body;

    // Validación básica
    if (!correo || !password) {
      return NextResponse.json(
        { error: 'Correo y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // TODO: Implementar validación real contra la base de datos
    // Por ahora, aceptamos cualquier credencial no vacía
    // En producción, debes validar contra UsuarioModel.validateCredentials()

    // Simulación de usuario autenticado
    const user = {
      correo,
      nombre: 'Usuario Demo',
      rol: 'admin',
    };

  // Determinar nombre y atributos de la cookie según el entorno
  const cookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';
  const cookieOptions = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 día
  };

  const response = NextResponse.json({
    success: true,
    user,
    message: 'Inicio de sesión exitoso',
  });
  // Establecer la cookie de sesión
  response.cookies.set(cookieName, 'demo-session-token', cookieOptions);
  return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
