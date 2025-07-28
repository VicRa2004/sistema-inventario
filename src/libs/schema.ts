import {
  pgTable, serial, varchar, text, integer, timestamp, pgEnum, point
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const rolUsuarioEnum = pgEnum('rol_usuario', ['operador', 'jefe', 'vendedor']);
export const tipoContenedorEnum = pgEnum('tipo_contenedor', ['C', 'A', 'S', 'Q', 'I', 'E', 'B']);
export const estadoContenedorEnum = pgEnum('estado_contenedor', ['pendiente', 'en_reparto', 'entregado', 'confirmado']);
export const estadoEntregaEnum = pgEnum('estado_entrega', ['confirmado', 'rechazado', 'incompleto']);

// Usuarios
export const usuarios = pgTable('usuarios', {
  idUsuario: serial('id_usuario').primaryKey(),
  nombre: varchar('nombre').notNull(),
  correo: varchar('correo').notNull().unique(),
  password: text('password').notNull(),
  rol: rolUsuarioEnum('rol').notNull()
});

// Contenedores
export const contenedores = pgTable('contenedores', {
  idContenedor: serial('id_contenedor').primaryKey(),
  codigo: varchar('codigo').notNull().unique(),
  tipo: tipoContenedorEnum('tipo').notNull(),
  fechaLlegada: timestamp('fecha_llegada').defaultNow(),
  estado: estadoContenedorEnum('estado').default('pendiente')
});

// Manifiestos
export const manifiestos = pgTable('manifiestos', {
  idManifiesto: serial('id_manifiesto').primaryKey(),
  idContenedor: integer('id_contenedor').references(() => contenedores.idContenedor, { onDelete: 'cascade' }),
  escaneadoPor: integer('escaneado_por').references(() => usuarios.idUsuario),
  fechaEscaneo: timestamp('fecha_escaneo').defaultNow()
});

// Entregas
export const entregas = pgTable('entregas', {
  idEntrega: serial('id_entrega').primaryKey(),
  idContenedor: integer('id_contenedor').references(() => contenedores.idContenedor),
  repartidoPor: integer('repartido_por').references(() => usuarios.idUsuario),
  bodegaDestino: varchar('bodega_destino').notNull(),
  fechaEntrega: timestamp('fecha_entrega').defaultNow(),
  observaciones: text('observaciones')
});

// Confirmaciones
export const confirmaciones = pgTable('confirmaciones', {
  idConfirmacion: serial('id_confirmacion').primaryKey(),
  idEntrega: integer('id_entrega').references(() => entregas.idEntrega),
  confirmadoPor: integer('confirmado_por').references(() => usuarios.idUsuario),
  fechaConfirmacion: timestamp('fecha_confirmacion'),
  estadoEntrega: estadoEntregaEnum('estado_entrega').default('confirmado'),
  comentarios: text('comentarios')
});

// Ubicaciones SKU
export const ubicacionesSku = pgTable('ubicaciones_sku', {
  idUbicacion: serial('id_ubicacion').primaryKey(),
  sku: varchar('sku').notNull(),
  bodega: varchar('bodega').notNull(),
  estante: varchar('estante'),
  nivel: varchar('nivel'),
  coordenadas: point('coordenadas'),
  registradoPor: integer('registrado_por').references(() => usuarios.idUsuario),
  fechaRegistro: timestamp('fecha_registro').defaultNow()
});

// Relaciones
export const usuariosRelations = relations(usuarios, ({ many }) => ({
  manifiestos: many(manifiestos),
  entregas: many(entregas),
  confirmaciones: many(confirmaciones),
  ubicacionesSku: many(ubicacionesSku)
}));

export const contenedoresRelations = relations(contenedores, ({ many }) => ({
  manifiestos: many(manifiestos),
  entregas: many(entregas)
}));

export const entregasRelations = relations(entregas, ({ one, many }) => ({
  contenedor: one(contenedores, {
    fields: [entregas.idContenedor],
    references: [contenedores.idContenedor]
  }),
  repartidor: one(usuarios, {
    fields: [entregas.repartidoPor],
    references: [usuarios.idUsuario]
  }),
  confirmaciones: many(confirmaciones)
}));

export const confirmacionesRelations = relations(confirmaciones, ({ one }) => ({
  entrega: one(entregas, {
    fields: [confirmaciones.idEntrega],
    references: [entregas.idEntrega]
  }),
  confirmador: one(usuarios, {
    fields: [confirmaciones.confirmadoPor],
    references: [usuarios.idUsuario]
  })
}));

export const manifestosRelations = relations(manifiestos, ({ one }) => ({
  contenedor: one(contenedores, {
    fields: [manifiestos.idContenedor],
    references: [contenedores.idContenedor]
  }),
  escaneador: one(usuarios, {
    fields: [manifiestos.escaneadoPor],
    references: [usuarios.idUsuario]
  })
}));

export const ubicacionesSkuRelations = relations(ubicacionesSku, ({ one }) => ({
  registrador: one(usuarios, {
    fields: [ubicacionesSku.registradoPor],
    references: [usuarios.idUsuario]
  })
}));
