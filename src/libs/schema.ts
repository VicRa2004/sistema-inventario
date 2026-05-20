import {
  mysqlTable, serial, varchar, text, int, timestamp, char
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const usuarios = mysqlTable('usuarios', {
  idUsuario: serial('id_usuario').primaryKey(),
  nombre: varchar('nombre', { length: 100 }),
  rol: varchar('rol', { length: 50 }),
  correo: varchar('correo', { length: 100 }),
  password: text('password')
});

export const contenedores = mysqlTable('contenedores', {
  idContenedor: serial('id_contenedor').primaryKey(),
  codigo: varchar('codigo', { length: 50 }).unique(),
  tipoPalet: char('tipo_palet', { length: 1 }),
  fechaLlegada: timestamp('fecha_llegada').defaultNow()
});

export const bodegas = mysqlTable('bodegas', {
  idBodega: serial('id_bodega').primaryKey(),
  nombre: varchar('nombre', { length: 100 })
});

export const entregas = mysqlTable('entregas', {
  idEntrega: serial('id_entrega').primaryKey(),
  idContenedor: int('id_contenedor').references(() => contenedores.idContenedor),
  idBodega: int('id_bodega').references(() => bodegas.idBodega),
  entregadoPor: int('entregado_por').references(() => usuarios.idUsuario),
  recibidoPor: int('recibido_por').references(() => usuarios.idUsuario),
  fechaEntrega: timestamp('fecha_entrega').defaultNow(),
  observaciones: text('observaciones')
});

export const sku = mysqlTable('sku', {
  idSku: serial('id_sku').primaryKey(),
  codigo: varchar('codigo', { length: 50 }).unique(),
  descripcion: text('descripcion'),
  idContenedor: int('id_contenedor').references(() => contenedores.idContenedor),
  fechaRegistro: timestamp('fecha_registro').defaultNow()
});

export const geolocalizacionSku = mysqlTable('geolocalizacion_sku', {
  idGeo: serial('id_geo').primaryKey(),
  idSku: int('id_sku').references(() => sku.idSku),
  idBodega: int('id_bodega').references(() => bodegas.idBodega),
  rack: varchar('rack', { length: 20 }),
  nivel: varchar('nivel', { length: 20 }),
  pasillo: varchar('pasillo', { length: 20 }),
  fechaUbicacion: timestamp('fecha_ubicacion').defaultNow()
});

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