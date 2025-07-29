import { db } from '@/libs/db';
import { entregas, contenedores, bodegas, usuarios } from '@/libs/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface IEntrega {
  idEntrega: number;
  idContenedor: number | null;
  idBodega: number | null;
  entregadoPor: number | null;
  recibidoPor: number | null;
  fechaEntrega: Date | null;
  observaciones: string | null;
}

export class EntregaModel {
  // Crear una nueva entrega
  static async create(data: Omit<IEntrega, 'idEntrega'>): Promise<IEntrega> {
    const [entrega] = await db.insert(entregas).values(data).returning();
    return entrega;
  }

  // Obtener todas las entregas
  static async getAll(): Promise<IEntrega[]> {
    return await db.select().from(entregas);
  }

  // Obtener entrega por ID
  static async getById(id: number): Promise<IEntrega | null> {
    const [entrega] = await db.select().from(entregas).where(eq(entregas.idEntrega, id));
    return entrega || null;
  }

  // Actualizar entrega
  static async update(id: number, data: Partial<Omit<IEntrega, 'idEntrega'>>): Promise<IEntrega | null> {
    const [entrega] = await db.update(entregas)
      .set(data)
      .where(eq(entregas.idEntrega, id))
      .returning();
    return entrega || null;
  }

  // Eliminar entrega
  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(entregas).where(eq(entregas.idEntrega, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Obtener entregas con información completa (joins)
  static async getWithDetails(id?: number) {
    const query = db.select({
      entrega: entregas,
      contenedor: contenedores,
      bodega: bodegas,
      entregador: {
        id: usuarios.idUsuario,
        nombre: usuarios.nombre,
        rol: usuarios.rol
      }
    })
    .from(entregas)
    .leftJoin(contenedores, eq(entregas.idContenedor, contenedores.idContenedor))
    .leftJoin(bodegas, eq(entregas.idBodega, bodegas.idBodega))
    .leftJoin(usuarios, eq(entregas.entregadoPor, usuarios.idUsuario));

    if (id) {
      return await query.where(eq(entregas.idEntrega, id));
    }
    return await query;
  }

  // Obtener entregas por contenedor
  static async getByContenedor(idContenedor: number): Promise<IEntrega[]> {
    return await db.select().from(entregas).where(eq(entregas.idContenedor, idContenedor));
  }

  // Obtener entregas por bodega
  static async getByBodega(idBodega: number): Promise<IEntrega[]> {
    return await db.select().from(entregas).where(eq(entregas.idBodega, idBodega));
  }

  // Obtener entregas por usuario entregador
  static async getByEntregador(idUsuario: number): Promise<IEntrega[]> {
    return await db.select().from(entregas).where(eq(entregas.entregadoPor, idUsuario));
  }

  // Obtener entregas por usuario receptor
  static async getByReceptor(idUsuario: number): Promise<IEntrega[]> {
    return await db.select().from(entregas).where(eq(entregas.recibidoPor, idUsuario));
  }

  // Obtener entregas por rango de fechas
  static async getByDateRange(fechaInicio: Date, fechaFin: Date): Promise<IEntrega[]> {
    return await db.select().from(entregas)
      .where(and(
        gte(entregas.fechaEntrega, fechaInicio),
        lte(entregas.fechaEntrega, fechaFin)
      ));
  }

  // Obtener entregas del día actual
  static async getToday(): Promise<IEntrega[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return await this.getByDateRange(startOfDay, endOfDay);
  }

  // Obtener entregas de la semana actual
  static async getThisWeek(): Promise<IEntrega[]> {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6, 23, 59, 59);
    
    return await this.getByDateRange(startOfWeek, endOfWeek);
  }

  // Confirmar entrega (actualizar receptor)
  static async confirmarEntrega(id: number, recibidoPor: number, observaciones?: string): Promise<IEntrega | null> {
    return await this.update(id, {
      recibidoPor,
      observaciones,
      fechaEntrega: new Date()
    });
  }

  // Verificar si un contenedor ya fue entregado
  static async contenedorYaEntregado(idContenedor: number): Promise<boolean> {
    const entregas = await this.getByContenedor(idContenedor);
    return entregas.length > 0;
  }

  // Obtener estadísticas de entregas
  static async getEstadisticas() {
    const [totalEntregas, entregasHoy, entregasSemana] = await Promise.all([
      this.getAll(),
      this.getToday(),
      this.getThisWeek()
    ]);

    return {
      total: totalEntregas.length,
      hoy: entregasHoy.length,
      semana: entregasSemana.length,
      pendientes: totalEntregas.filter(e => !e.recibidoPor).length,
      confirmadas: totalEntregas.filter(e => e.recibidoPor).length
    };
  }
}