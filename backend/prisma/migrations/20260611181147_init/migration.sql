-- CreateTable
CREATE TABLE "USUARIO" (
    "id_usuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "fecha_creacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PRODUCTO" (
    "id_producto" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tipo_existencia_pgc" INTEGER NOT NULL,
    "metodo_imputacion" TEXT NOT NULL,
    "capacidad_almacenamiento" TEXT NOT NULL,
    "sistema_reposicion" TEXT NOT NULL DEFAULT 'nivel',
    "estado" TEXT NOT NULL DEFAULT 'activo'
);

-- CreateTable
CREATE TABLE "PROVEEDOR" (
    "id_proveedor" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lead_time_promedio" INTEGER NOT NULL,
    "calificacion" REAL NOT NULL DEFAULT 5,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "retrasos_registrados" INTEGER NOT NULL DEFAULT 0,
    "pedidos_registrados" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "PROVEEDOR_PRODUCTO" (
    "id_proveedor" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "precio_unitario" REAL NOT NULL,

    PRIMARY KEY ("id_proveedor", "id_producto"),
    CONSTRAINT "PROVEEDOR_PRODUCTO_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "PROVEEDOR" ("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PROVEEDOR_PRODUCTO_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO" ("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ALMACEN" (
    "id_almacen" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo'
);

-- CreateTable
CREATE TABLE "INVENTARIO" (
    "id_inventario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_producto" INTEGER NOT NULL,
    "id_almacen" INTEGER NOT NULL,
    "stock_actual" REAL NOT NULL DEFAULT 0,
    "stock_minimo" REAL NOT NULL DEFAULT 0,
    "stock_maximo" REAL NOT NULL DEFAULT 0,
    "stock_seguridad" REAL NOT NULL DEFAULT 0,
    "punto_pedido" REAL NOT NULL DEFAULT 0,
    "vop" REAL NOT NULL DEFAULT 0,
    "pasillo" TEXT,
    "nivel" TEXT,
    "fecha_ultima_actualizacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "INVENTARIO_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO" ("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "INVENTARIO_id_almacen_fkey" FOREIGN KEY ("id_almacen") REFERENCES "ALMACEN" ("id_almacen") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PARAMETRO_INVENTARIO" (
    "id_parametro" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nivel_servicio" INTEGER NOT NULL DEFAULT 95,
    "valor_z" REAL NOT NULL DEFAULT 1.645,
    "costo_pedido" REAL NOT NULL DEFAULT 0,
    "costo_almacenamiento" REAL NOT NULL DEFAULT 0,
    "umbral_minimo_oc" REAL NOT NULL DEFAULT 0,
    "dias_laborales" INTEGER NOT NULL DEFAULT 365,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CLASIFICACION_ABC" (
    "id_clasificacion" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_producto" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "valor_anual" REAL NOT NULL,
    "porcentaje_individual" REAL NOT NULL,
    "porcentaje_acumulado" REAL NOT NULL,
    "lote" TEXT NOT NULL,
    "fecha_actualizacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CLASIFICACION_ABC_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO" ("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ORDEN_COMPRA" (
    "id_orden_compra" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nro_orden" TEXT NOT NULL,
    "id_proveedor" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha_orden" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega_estimada" DATETIME NOT NULL,
    "nro_comprobante" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "total" REAL NOT NULL,
    CONSTRAINT "ORDEN_COMPRA_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "PROVEEDOR" ("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ORDEN_COMPRA_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "USUARIO" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DETALLE_ORDEN_COMPRA" (
    "id_detalle_oc" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_orden_compra" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad_solicitada" REAL NOT NULL,
    "precio_unitario" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "DETALLE_ORDEN_COMPRA_id_orden_compra_fkey" FOREIGN KEY ("id_orden_compra") REFERENCES "ORDEN_COMPRA" ("id_orden_compra") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DETALLE_ORDEN_COMPRA_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO" ("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ENTRADA" (
    "id_entrada" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_orden_compra" INTEGER NOT NULL,
    "id_almacen" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha_entrada" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nro_comprobante" TEXT NOT NULL,
    "observacion" TEXT,
    CONSTRAINT "ENTRADA_id_orden_compra_fkey" FOREIGN KEY ("id_orden_compra") REFERENCES "ORDEN_COMPRA" ("id_orden_compra") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ENTRADA_id_almacen_fkey" FOREIGN KEY ("id_almacen") REFERENCES "ALMACEN" ("id_almacen") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ENTRADA_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "USUARIO" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DETALLE_ENTRADA" (
    "id_detalle_entrada" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_entrada" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_almacen" INTEGER NOT NULL,
    "cantidad_recibida" REAL NOT NULL,
    "costo_unitario" REAL NOT NULL,
    "fecha_vencimiento" DATETIME,
    CONSTRAINT "DETALLE_ENTRADA_id_entrada_fkey" FOREIGN KEY ("id_entrada") REFERENCES "ENTRADA" ("id_entrada") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DETALLE_ENTRADA_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO" ("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DETALLE_ENTRADA_id_almacen_fkey" FOREIGN KEY ("id_almacen") REFERENCES "ALMACEN" ("id_almacen") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SALIDA" (
    "id_salida" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha_salida" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_comprobante" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "observacion" TEXT,
    CONSTRAINT "SALIDA_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "USUARIO" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DETALLE_SALIDA" (
    "id_detalle_salida" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_salida" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" REAL NOT NULL,
    "costo_unitario" REAL NOT NULL,
    "motivo" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    CONSTRAINT "DETALLE_SALIDA_id_salida_fkey" FOREIGN KEY ("id_salida") REFERENCES "SALIDA" ("id_salida") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DETALLE_SALIDA_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO" ("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LOG_AUDITORIA" (
    "id_log" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_usuario" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "tabla_afectada" TEXT NOT NULL,
    "id_registro_afectado" TEXT NOT NULL,
    "valor_anterior" JSONB,
    "valor_nuevo" JSONB,
    "ip_origen" TEXT NOT NULL,
    "fecha_hora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LOG_AUDITORIA_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "USUARIO" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "USUARIO_usuario_key" ON "USUARIO"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "PRODUCTO_codigo_key" ON "PRODUCTO"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "PROVEEDOR_ruc_key" ON "PROVEEDOR"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "INVENTARIO_id_producto_id_almacen_key" ON "INVENTARIO"("id_producto", "id_almacen");

-- CreateIndex
CREATE UNIQUE INDEX "ORDEN_COMPRA_nro_orden_key" ON "ORDEN_COMPRA"("nro_orden");
