-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('administrador', 'gerente', 'compras', 'almacen');

-- CreateEnum
CREATE TYPE "EstadoGenerico" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "MetodoImputacion" AS ENUM ('directo', 'indirecto');

-- CreateEnum
CREATE TYPE "CapacidadAlmacenamiento" AS ENUM ('almacenable', 'no_almacenable');

-- CreateEnum
CREATE TYPE "CategoriaABC" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "EstadoOrdenCompra" AS ENUM ('pendiente', 'en_revision', 'aprobada', 'enviada', 'recibida', 'rechazada', 'observada');

-- CreateEnum
CREATE TYPE "MotivoSalida" AS ENUM ('produccion', 'merma', 'devolucion', 'venta', 'transferencia');

-- CreateEnum
CREATE TYPE "SistemaReposicion" AS ENUM ('nivel', 'cobertura', 'mixto');

-- CreateTable
CREATE TABLE "USUARIO" (
    "id_usuario" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "estado" "EstadoGenerico" NOT NULL DEFAULT 'activo',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "USUARIO_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "PRODUCTO" (
    "id_producto" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tipo_existencia_pgc" INTEGER NOT NULL,
    "metodo_imputacion" "MetodoImputacion" NOT NULL,
    "capacidad_almacenamiento" "CapacidadAlmacenamiento" NOT NULL,
    "sistema_reposicion" "SistemaReposicion" NOT NULL DEFAULT 'nivel',
    "estado" "EstadoGenerico" NOT NULL DEFAULT 'activo',

    CONSTRAINT "PRODUCTO_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "PROVEEDOR" (
    "id_proveedor" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lead_time_promedio" INTEGER NOT NULL,
    "calificacion" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "estado" "EstadoGenerico" NOT NULL DEFAULT 'activo',
    "retrasos_registrados" INTEGER NOT NULL DEFAULT 0,
    "pedidos_registrados" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PROVEEDOR_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "PROVEEDOR_PRODUCTO" (
    "id_proveedor" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "PROVEEDOR_PRODUCTO_pkey" PRIMARY KEY ("id_proveedor","id_producto")
);

-- CreateTable
CREATE TABLE "ALMACEN" (
    "id_almacen" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoGenerico" NOT NULL DEFAULT 'activo',

    CONSTRAINT "ALMACEN_pkey" PRIMARY KEY ("id_almacen")
);

-- CreateTable
CREATE TABLE "INVENTARIO" (
    "id_inventario" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_almacen" INTEGER NOT NULL,
    "stock_actual" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "stock_maximo" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "stock_seguridad" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "punto_pedido" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "vop" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "pasillo" TEXT,
    "nivel" TEXT,
    "fecha_ultima_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "INVENTARIO_pkey" PRIMARY KEY ("id_inventario")
);

-- CreateTable
CREATE TABLE "PARAMETRO_INVENTARIO" (
    "id_parametro" SERIAL NOT NULL,
    "nivel_servicio" INTEGER NOT NULL DEFAULT 95,
    "valor_z" DECIMAL(6,3) NOT NULL DEFAULT 1.645,
    "costo_pedido" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "costo_almacenamiento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "umbral_minimo_oc" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dias_laborales" INTEGER NOT NULL DEFAULT 365,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PARAMETRO_INVENTARIO_pkey" PRIMARY KEY ("id_parametro")
);

-- CreateTable
CREATE TABLE "CLASIFICACION_ABC" (
    "id_clasificacion" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "categoria" "CategoriaABC" NOT NULL,
    "valor_anual" DECIMAL(14,2) NOT NULL,
    "porcentaje_individual" DECIMAL(8,4) NOT NULL,
    "porcentaje_acumulado" DECIMAL(8,4) NOT NULL,
    "lote" TEXT NOT NULL,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CLASIFICACION_ABC_pkey" PRIMARY KEY ("id_clasificacion")
);

-- CreateTable
CREATE TABLE "ORDEN_COMPRA" (
    "id_orden_compra" SERIAL NOT NULL,
    "nro_orden" TEXT NOT NULL,
    "id_proveedor" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha_orden" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega_estimada" TIMESTAMP(3) NOT NULL,
    "nro_comprobante" TEXT,
    "estado" "EstadoOrdenCompra" NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "ORDEN_COMPRA_pkey" PRIMARY KEY ("id_orden_compra")
);

-- CreateTable
CREATE TABLE "DETALLE_ORDEN_COMPRA" (
    "id_detalle_oc" SERIAL NOT NULL,
    "id_orden_compra" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad_solicitada" DECIMAL(14,3) NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "DETALLE_ORDEN_COMPRA_pkey" PRIMARY KEY ("id_detalle_oc")
);

-- CreateTable
CREATE TABLE "ENTRADA" (
    "id_entrada" SERIAL NOT NULL,
    "id_orden_compra" INTEGER NOT NULL,
    "id_almacen" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha_entrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nro_comprobante" TEXT NOT NULL,
    "observacion" TEXT,

    CONSTRAINT "ENTRADA_pkey" PRIMARY KEY ("id_entrada")
);

-- CreateTable
CREATE TABLE "DETALLE_ENTRADA" (
    "id_detalle_entrada" SERIAL NOT NULL,
    "id_entrada" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_almacen" INTEGER NOT NULL,
    "cantidad_recibida" DECIMAL(14,3) NOT NULL,
    "costo_unitario" DECIMAL(12,2) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3),

    CONSTRAINT "DETALLE_ENTRADA_pkey" PRIMARY KEY ("id_detalle_entrada")
);

-- CreateTable
CREATE TABLE "SALIDA" (
    "id_salida" SERIAL NOT NULL,
    "fecha_salida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_comprobante" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "observacion" TEXT,

    CONSTRAINT "SALIDA_pkey" PRIMARY KEY ("id_salida")
);

-- CreateTable
CREATE TABLE "DETALLE_SALIDA" (
    "id_detalle_salida" SERIAL NOT NULL,
    "id_salida" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" DECIMAL(14,3) NOT NULL,
    "costo_unitario" DECIMAL(12,2) NOT NULL,
    "motivo" "MotivoSalida" NOT NULL,
    "destino" TEXT NOT NULL,

    CONSTRAINT "DETALLE_SALIDA_pkey" PRIMARY KEY ("id_detalle_salida")
);

-- CreateTable
CREATE TABLE "LOG_AUDITORIA" (
    "id_log" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "tabla_afectada" TEXT NOT NULL,
    "id_registro_afectado" TEXT NOT NULL,
    "valor_anterior" JSONB,
    "valor_nuevo" JSONB,
    "ip_origen" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LOG_AUDITORIA_pkey" PRIMARY KEY ("id_log")
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

-- AddForeignKey
ALTER TABLE "PROVEEDOR_PRODUCTO" ADD CONSTRAINT "PROVEEDOR_PRODUCTO_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "PROVEEDOR"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PROVEEDOR_PRODUCTO" ADD CONSTRAINT "PROVEEDOR_PRODUCTO_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "INVENTARIO" ADD CONSTRAINT "INVENTARIO_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "INVENTARIO" ADD CONSTRAINT "INVENTARIO_id_almacen_fkey" FOREIGN KEY ("id_almacen") REFERENCES "ALMACEN"("id_almacen") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CLASIFICACION_ABC" ADD CONSTRAINT "CLASIFICACION_ABC_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ORDEN_COMPRA" ADD CONSTRAINT "ORDEN_COMPRA_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "PROVEEDOR"("id_proveedor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ORDEN_COMPRA" ADD CONSTRAINT "ORDEN_COMPRA_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "USUARIO"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DETALLE_ORDEN_COMPRA" ADD CONSTRAINT "DETALLE_ORDEN_COMPRA_id_orden_compra_fkey" FOREIGN KEY ("id_orden_compra") REFERENCES "ORDEN_COMPRA"("id_orden_compra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DETALLE_ORDEN_COMPRA" ADD CONSTRAINT "DETALLE_ORDEN_COMPRA_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ENTRADA" ADD CONSTRAINT "ENTRADA_id_orden_compra_fkey" FOREIGN KEY ("id_orden_compra") REFERENCES "ORDEN_COMPRA"("id_orden_compra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ENTRADA" ADD CONSTRAINT "ENTRADA_id_almacen_fkey" FOREIGN KEY ("id_almacen") REFERENCES "ALMACEN"("id_almacen") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ENTRADA" ADD CONSTRAINT "ENTRADA_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "USUARIO"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DETALLE_ENTRADA" ADD CONSTRAINT "DETALLE_ENTRADA_id_entrada_fkey" FOREIGN KEY ("id_entrada") REFERENCES "ENTRADA"("id_entrada") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DETALLE_ENTRADA" ADD CONSTRAINT "DETALLE_ENTRADA_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DETALLE_ENTRADA" ADD CONSTRAINT "DETALLE_ENTRADA_id_almacen_fkey" FOREIGN KEY ("id_almacen") REFERENCES "ALMACEN"("id_almacen") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SALIDA" ADD CONSTRAINT "SALIDA_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "USUARIO"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DETALLE_SALIDA" ADD CONSTRAINT "DETALLE_SALIDA_id_salida_fkey" FOREIGN KEY ("id_salida") REFERENCES "SALIDA"("id_salida") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DETALLE_SALIDA" ADD CONSTRAINT "DETALLE_SALIDA_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "PRODUCTO"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LOG_AUDITORIA" ADD CONSTRAINT "LOG_AUDITORIA_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "USUARIO"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
