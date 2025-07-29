import { db } from '@/libs/db';
import { contenedores, entregas, sku } from '@/libs/schema';
import { eq, and } from 'drizzle-orm';

export interface IContenedor {
  idContenedor: number;
  codigo: string | null;
  tipoPalet: string | null;
  fechaLlegada: Date | null;
}

export class ContenedorModel {
  // Crear un nuevo contenedor
  static async create(data: Omit<IContenedor, 'idContenedor'>): Promise<IContenedor> {
    const [contenedor] = await db.insert(contenedores).values(data).returning();
    return contenedor;
  }

  // Obtener todos los contenedores
  static async getAll(): Promise<IContenedor[]> {
    return await db.select().from(contenedores);
  }

  // Obtener contenedor por ID
  static async getById(id: number): Promise<IContenedor | null> {
    const [contenedor] = await db.select().from(contenedores).where(eq(contenedores.idContenedor, id));
    return contenedor || null;
  }

  // Obtener contenedor por código
  static async getByCodigo(codigo: string): Promise<IContenedor | null> {
    const [contenedor] = await db.select().from(contenedores).where(eq(contenedores.codigo, codigo));
    return contenedor || null;
  }

  // Actualizar contenedor
  static async update(id: number, data: Partial<Omit<IContenedor, 'idContenedor'>>): Promise<IContenedor | null> {
    const [contenedor] = await db.update(contenedores)
      .set(data)
      .where(eq(contenedores.idContenedor, id))
      .returning();
    return contenedor || null;
  }

  // Eliminar contenedor
  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(contenedores).where(eq(contenedores.idContenedor, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Verificar si el código ya existe
  static async codigoExists(codigo: string): Promise<boolean> {
    const contenedor = await this.getByCodigo(codigo);
    return contenedor !== null;
  }

  // Obtener contenedores por tipo de palet
  static async getByTipoPalet(tipoPalet: string): Promise<IContenedor[]> {
    return await db.select().from(contenedores).where(eq(contenedores.tipoPalet, tipoPalet));
  }

  // Obtener contenedores con sus entregas
  static async getWithEntregas(id: number) {
    return await db.select({
      contenedor: contenedores,
      entregas: entregas
    })
    .from(contenedores)
    .leftJoin(entregas, eq(contenedores.idContenedor, entregas.idContenedor))
    .where(eq(contenedores.idContenedor, id));
  }

  // Obtener contenedores con sus SKUs
  static async getWithSkus(id: number) {
    return await db.select({
      contenedor: contenedores,
      skus: sku
    })
    .from(contenedores)
    .leftJoin(sku, eq(contenedores.idContenedor, sku.idContenedor))
    .where(eq(contenedores.idContenedor, id));
  }

  // Verificar si el contenedor tiene entregas
  static async hasEntregas(id: number): Promise<boolean> {
    const [entrega] = await db.select().from(entregas).where(eq(entregas.idContenedor, id)).limit(1);
    return entrega !== undefined;
  }

  // Verificar si el contenedor tiene SKUs
  static async hasSkus(id: number): Promise<boolean> {
    const [skuItem] = await db.select().from(sku).where(eq(sku.idContenedor, id)).limit(1);
    return skuItem !== undefined;
  }

  // Obtener contenedores recientes (últimos 30 días)
  static async getRecent(): Promise<IContenedor[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return await db.select().from(contenedores)
      .where(and(
        eq(contenedores.fechaLlegada, thirtyDaysAgo)
      ));
  }
}