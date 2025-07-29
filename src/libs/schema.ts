import {
  pgTable, serial, varchar, text, integer, timestamp, char
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Usuarios
export const usuarios = pgTable('usuarios', {
  idUsuario: serial('id_usuario').primaryKey(),
  nombre: varchar('nombre', { length: 100 }),
  rol: varchar('rol', { length: 50 }), // Ej: 'recepcion', 'envios', 'supervisor'
  correo: varchar('correo', { length: 100 }),
  password: text('password')
});

// Contenedores
export const contenedores = pgTable('contenedores', {
  idContenedor: serial('id_contenedor').primaryKey(),
  codigo: varchar('codigo', { length: 50 }).unique(), // Código escaneado o manual
  tipoPalet: char('tipo_palet', { length: 1 }), // Ej: C, A, S, Q, etc.
  fechaLlegada: timestamp('fecha_llegada').defaultNow()
});

// Bodegas
export const bodegas = pgTable('bodegas', {
  idBodega: serial('id_bodega').primaryKey(),
  nombre: varchar('nombre', { length: 100 }) // Ej: 'bodega general', 'telefonía', etc.
});

// Entregas
export const entregas = pgTable('entregas', {
  idEntrega: serial('id_entrega').primaryKey(),
  idContenedor: integer('id_contenedor').references(() => contenedores.idContenedor),
  idBodega: integer('id_bodega').references(() => bodegas.idBodega),
  entregadoPor: integer('entregado_por').references(() => usuarios.idUsuario),
  recibidoPor: integer('recibido_por').references(() => usuarios.idUsuario),
  fechaEntrega: timestamp('fecha_entrega').defaultNow(),
  observaciones: text('observaciones')
});

// SKU
export const sku = pgTable('sku', {
  idSku: serial('id_sku').primaryKey(),
  codigo: varchar('codigo', { length: 50 }).unique(), // Código individual del producto
  descripcion: text('descripcion'),
  idContenedor: integer('id_contenedor').references(() => contenedores.idContenedor),
  fechaRegistro: timestamp('fecha_registro').defaultNow()
});

// Geolocalización SKU
export const geolocalizacionSku = pgTable('geolocalizacion_sku', {
  idGeo: serial('id_geo').primaryKey(),
  idSku: integer('id_sku').references(() => sku.idSku),
  idBodega: integer('id_bodega').references(() => bodegas.idBodega),
  rack: varchar('rack', { length: 20 }),
  nivel: varchar('nivel', { length: 20 }),
  pasillo: varchar('pasillo', { length: 20 }),
  fechaUbicacion: timestamp('fecha_ubicacion').defaultNow()
});

// Relaciones
export const usuariosRelations = relations(usuarios, ({ many }) => ({
  entregasEntregadas: many(entregas, { relationName: 'entregadoPor' }),
  entregasRecibidas: many(entregas, { relationName: 'recibidoPor' })
}));

export const contenedoresRelations = relations(contenedores, ({ many }) => ({
  entregas: many(entregas),
  skus: many(sku)
}));

export const bodegasRelations = relations(bodegas, ({ many }) => ({
  entregas: many(entregas),
  geolocalizaciones: many(geolocalizacionSku)
}));

export const entregasRelations = relations(entregas, ({ one }) => ({
  contenedor: one(contenedores, {
    fields: [entregas.idContenedor],
    references: [contenedores.idContenedor]
  }),
  bodega: one(bodegas, {
    fields: [entregas.idBodega],
    references: [bodegas.idBodega]
  }),
  entregador: one(usuarios, {
    fields: [entregas.entregadoPor],
    references: [usuarios.idUsuario],
    relationName: 'entregadoPor'
  }),
  receptor: one(usuarios, {
    fields: [entregas.recibidoPor],
    references: [usuarios.idUsuario],
    relationName: 'recibidoPor'
  })
}));

export const skuRelations = relations(sku, ({ one, many }) => ({
  contenedor: one(contenedores, {
    fields: [sku.idContenedor],
    references: [contenedores.idContenedor]
  }),
  geolocalizaciones: many(geolocalizacionSku)
}));

export const geolocalizacionSkuRelations = relations(geolocalizacionSku, ({ one }) => ({
  sku: one(sku, {
    fields: [geolocalizacionSku.idSku],
    references: [sku.idSku]
  }),
  bodega: one(bodegas, {
    fields: [geolocalizacionSku.idBodega],
    references: [bodegas.idBodega]
  })
}));
