import { NextResponse } from "next/server";
import { UsuarioModel } from "@/models";

export async function GET() {
  try {
    const usuarios = await UsuarioModel.getAll();
    return NextResponse.json({ success: true, usuarios });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "Error al obtener usuarios" });
  }
}
