import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { UsuarioModel } from "@/models";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        correo: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.correo as string | undefined;
          const password = credentials?.password as string | undefined;

          if (!email || !password) {
            console.error("Email o password faltantes");
            return null;
          }

          const usuario = await UsuarioModel.getByEmail(email);
          
          if (!usuario) {
            console.error("Usuario no encontrado:", email);
            return null;
          }

          console.log("Usuario encontrado:", { 
            id: usuario.idUsuario, 
            nombre: usuario.nombre, 
            passwordDB: usuario.password,
            passwordInput: password 
          });

          // Validar contraseña (texto plano para desarrollo)
          if (usuario.password !== password) {
            console.error("Contraseña incorrecta");
            return null;
          }

          return {
            id: usuario.idUsuario.toString(),
            email: usuario.correo || undefined,
            name: usuario.nombre || undefined,
            role: usuario.rol || undefined,
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || "";
        token.role = (user as { role?: string }).role || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  trustHost: true,
});
