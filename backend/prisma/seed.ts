import { PrismaClient, EstadoOrdenCompra, CategoriaABC, MotivoSalida } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Crear usuarios
  const accounts = [
    { nombres: 'Admin', apellidos: 'SGE', usuario: 'admin', password: 'Admin123*', rol: 'administrador' as const },
    { nombres: 'Gerente', apellidos: 'Operaciones', usuario: 'gerente', password: 'Gerente123*', rol: 'gerente' as const },
    { nombres: 'Operador', apellidos: 'Compras', usuario: 'compras', password: 'Compras123*', rol: 'compras' as const },
    { nombres: 'Supervisor', apellidos: 'Almacen', usuario: 'almacen', password: 'Almacen123*', rol: 'almacen' as const },
  ] as const;

  const usuarios = [];
  for (const account of accounts) {
    const passwordHash = await hash(account.password, 10);
    const user = await prisma.usuario.upsert({
      where: { usuario: account.usuario },
      update: {
        nombres: account.nombres,
        apellidos: account.apellidos,
        rol: account.rol,
        estado: 'activo',
        password: passwordHash,
      },
      create: {
        nombres: account.nombres,
        apellidos: account.apellidos,
        usuario: account.usuario,
        password: passwordHash,
        rol: account.rol,
        estado: 'activo',
      },
    });
    usuarios.push(user);
  }

  const comprasUser = usuarios[2]; // compras
  const almacenUser = usuarios[3]; // almacen

  // 2. Crear almacenes
  const almacenes = await Promise.all([
    prisma.almacen.upsert({
      where: { idAlmacen: 1 },
      update: {},
      create: {
        nombre: 'Almacen Central',
        ubicacion: 'Planta Principal',
        descripcion: 'Almacen principal de repuestos y materiales',
        estado: 'activo',
      },
    }),
    prisma.almacen.upsert({
      where: { idAlmacen: 2 },
      update: {},
      create: {
        nombre: 'Almacen Secundario',
        ubicacion: 'Edificio B',
        descripcion: 'Almacen de materias primas',
        estado: 'activo',
      },
    }),
  ]);

  // 3. Crear parametros de inventario
  await prisma.parametroInventario.upsert({
    where: { idParametro: 1 },
    update: {},
    create: {
      nivelServicio: 95,
      valorZ: 1.645,
      costoPedido: 120,
      costoAlmacenamiento: 20,
      umbralMinimoOc: 500,
      diasLaborales: 365,
    },
  });

  // 4. Crear productos
  const productos = [
    { codigo: 'P001', nombre: 'Tuerca M8', descripcion: 'Tuerca hexagonal de acero inoxidable', unidadMedida: 'unidad', categoria: 'Fijaciones', tipoExistenciaPgc: 1, metodoImputacion: 'directo' as const, capacidadAlmacenamiento: 'almacenable' as const, sistemaReposicion: 'nivel' as const },
    { codigo: 'P002', nombre: 'Tornillo M8x30', descripcion: 'Tornillo hexagonal de acero inoxidable', unidadMedida: 'unidad', categoria: 'Fijaciones', tipoExistenciaPgc: 1, metodoImputacion: 'directo' as const, capacidadAlmacenamiento: 'almacenable' as const, sistemaReposicion: 'nivel' as const },
    { codigo: 'P003', nombre: 'Arandela M8', descripcion: 'Arandela plana de acero', unidadMedida: 'unidad', categoria: 'Fijaciones', tipoExistenciaPgc: 1, metodoImputacion: 'directo' as const, capacidadAlmacenamiento: 'almacenable' as const, sistemaReposicion: 'nivel' as const },
    { codigo: 'P004', nombre: 'Cinta métrica 5m', descripcion: 'Cinta métrica retráctil', unidadMedida: 'unidad', categoria: 'Herramientas', tipoExistenciaPgc: 2, metodoImputacion: 'indirecto' as const, capacidadAlmacenamiento: 'almacenable' as const, sistemaReposicion: 'cobertura' as const },
    { codigo: 'P005', nombre: 'Aceite lubricante 1L', descripcion: 'Aceite para maquinaria industrial', unidadMedida: 'litro', categoria: 'Lubricantes', tipoExistenciaPgc: 3, metodoImputacion: 'directo' as const, capacidadAlmacenamiento: 'almacenable' as const, sistemaReposicion: 'mixto' as const },
    { codigo: 'P006', nombre: 'Filtro de aceite', descripcion: 'Filtro para motor industrial', unidadMedida: 'unidad', categoria: 'Repuestos', tipoExistenciaPgc: 1, metodoImputacion: 'directo' as const, capacidadAlmacenamiento: 'almacenable' as const, sistemaReposicion: 'nivel' as const },
    { codigo: 'P007', nombre: 'Engranaje de nylon', descripcion: 'Engranaje de nylon para transmisión', unidadMedida: 'unidad', categoria: 'Repuestos', tipoExistenciaPgc: 1, metodoImputacion: 'directo' as const, capacidadAlmacenamiento: 'almacenable' as const, sistemaReposicion: 'nivel' as const },
    { codigo: 'P008', nombre: 'Etiquetas adhesivas', descripcion: 'Rollo de etiquetas adhesivas blancas', unidadMedida: 'rollo', categoria: 'Papeleria', tipoExistenciaPgc: 2, metodoImputacion: 'indirecto' as const, capacidadAlmacenamiento: 'no_almacenable' as const, sistemaReposicion: 'cobertura' as const },
  ] as const;

  const createdProducts = [];
  for (const p of productos) {
    const product = await prisma.producto.upsert({
      where: { codigo: p.codigo },
      update: {},
      create: p,
    });
    createdProducts.push(product);
  }

  // 5. Crear proveedores
  const proveedores = [
    { nombre: 'Distribuidora Industrial S.A.', ruc: '20123456789', direccion: 'Av. Industrial 123, Lima', telefono: '555-1234', email: 'ventas@distindustrial.com', leadTimePromedio: 7, calificacion: 4.5, estado: 'activo', retrasosRegistrados: 2, pedidosRegistrados: 15 },
    { nombre: 'Materiales y Fijaciones Ltda.', ruc: '20987654321', direccion: 'Calle Comercio 456, Lima', telefono: '555-5678', email: 'info@mfyf.com', leadTimePromedio: 5, calificacion: 4.8, estado: 'activo', retrasosRegistrados: 0, pedidosRegistrados: 22 },
    { nombre: 'Herramientas Profesionales EIRL', ruc: '20456789123', direccion: 'Jr. Herramientas 789, Lima', telefono: '555-9012', email: 'ventas@herrapro.com', leadTimePromedio: 10, calificacion: 4.2, estado: 'activo', retrasosRegistrados: 5, pedidosRegistrados: 10 },
  ] as const;

  const createdSuppliers = [];
  for (const prov of proveedores) {
    const supplier = await prisma.proveedor.upsert({
      where: { ruc: prov.ruc },
      update: {},
      create: prov,
    });
    createdSuppliers.push(supplier);
  }

  // 6. Asignar productos a proveedores (ProveedorProducto)
  const proveedorProductos = [
    { idProveedor: createdSuppliers[0].idProveedor, idProducto: createdProducts[4].idProducto, precioUnitario: 15.50 }, // Aceite
    { idProveedor: createdSuppliers[0].idProveedor, idProducto: createdProducts[5].idProducto, precioUnitario: 28.00 }, // Filtro
    { idProveedor: createdSuppliers[1].idProveedor, idProducto: createdProducts[0].idProducto, precioUnitario: 0.50 }, // Tuerca
    { idProveedor: createdSuppliers[1].idProveedor, idProducto: createdProducts[1].idProducto, precioUnitario: 0.80 }, // Tornillo
    { idProveedor: createdSuppliers[1].idProveedor, idProducto: createdProducts[2].idProducto, precioUnitario: 0.20 }, // Arandela
    { idProveedor: createdSuppliers[2].idProveedor, idProducto: createdProducts[3].idProducto, precioUnitario: 12.00 }, // Cinta métrica
    { idProveedor: createdSuppliers[2].idProveedor, idProducto: createdProducts[6].idProducto, precioUnitario: 45.00 }, // Engranaje
  ];

  for (const pp of proveedorProductos) {
    await prisma.proveedorProducto.upsert({
      where: { idProveedor_idProducto: { idProveedor: pp.idProveedor, idProducto: pp.idProducto } },
      update: { precioUnitario: pp.precioUnitario },
      create: pp,
    });
  }

  // 7. Crear inventarios para productos almacenables
  const inventarios = [
    { idProducto: createdProducts[0].idProducto, idAlmacen: almacenes[0].idAlmacen, stockActual: 1500, stockMinimo: 500, stockMaximo: 3000, stockSeguridad: 200, puntoPedido: 700, vop: 500, pasillo: 'A', nivel: '1' },
    { idProducto: createdProducts[1].idProducto, idAlmacen: almacenes[0].idAlmacen, stockActual: 1200, stockMinimo: 400, stockMaximo: 2500, stockSeguridad: 150, puntoPedido: 550, vop: 400, pasillo: 'A', nivel: '1' },
    { idProducto: createdProducts[2].idProducto, idAlmacen: almacenes[0].idAlmacen, stockActual: 2000, stockMinimo: 600, stockMaximo: 4000, stockSeguridad: 250, puntoPedido: 850, vop: 600, pasillo: 'A', nivel: '1' },
    { idProducto: createdProducts[3].idProducto, idAlmacen: almacenes[0].idAlmacen, stockActual: 45, stockMinimo: 10, stockMaximo: 100, stockSeguridad: 5, puntoPedido: 15, vop: 20, pasillo: 'B', nivel: '2' },
    { idProducto: createdProducts[4].idProducto, idAlmacen: almacenes[1].idAlmacen, stockActual: 85, stockMinimo: 20, stockMaximo: 200, stockSeguridad: 10, puntoPedido: 30, vop: 25, pasillo: 'C', nivel: '1' },
    { idProducto: createdProducts[5].idProducto, idAlmacen: almacenes[1].idAlmacen, stockActual: 50, stockMinimo: 15, stockMaximo: 100, stockSeguridad: 8, puntoPedido: 23, vop: 18, pasillo: 'C', nivel: '1' },
    { idProducto: createdProducts[6].idProducto, idAlmacen: almacenes[1].idAlmacen, stockActual: 30, stockMinimo: 10, stockMaximo: 60, stockSeguridad: 5, puntoPedido: 15, vop: 12, pasillo: 'C', nivel: '2' },
  ];

  for (const inv of inventarios) {
    await prisma.inventario.upsert({
      where: { idProducto_idAlmacen: { idProducto: inv.idProducto, idAlmacen: inv.idAlmacen } },
      update: {},
      create: inv,
    });
  }

  // 8. Crear ordenes de compra
  const year = new Date().getFullYear();
  const ordenesCompra = [
    {
      nroOrden: `OC-${year}-0001`,
      idProveedor: createdSuppliers[1].idProveedor,
      idUsuario: comprasUser.idUsuario,
      fechaOrden: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      fechaEntregaEstimada: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      estado: EstadoOrdenCompra.recibida,
      total: 1300,
      items: [
        { idProducto: createdProducts[0].idProducto, cantidadSolicitada: 1000, precioUnitario: 0.50, subtotal: 500 },
        { idProducto: createdProducts[1].idProducto, cantidadSolicitada: 1000, precioUnitario: 0.80, subtotal: 800 },
      ],
    },
    {
      nroOrden: `OC-${year}-0002`,
      idProveedor: createdSuppliers[0].idProveedor,
      idUsuario: comprasUser.idUsuario,
      fechaOrden: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      fechaEntregaEstimada: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      estado: EstadoOrdenCompra.en_revision,
      total: 850,
      items: [
        { idProducto: createdProducts[4].idProducto, cantidadSolicitada: 50, precioUnitario: 15.50, subtotal: 775 },
        { idProducto: createdProducts[5].idProducto, cantidadSolicitada: 3, precioUnitario: 28.00, subtotal: 84 },
      ],
    },
    {
      nroOrden: `OC-${year}-0003`,
      idProveedor: createdSuppliers[2].idProveedor,
      idUsuario: comprasUser.idUsuario,
      fechaOrden: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      fechaEntregaEstimada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estado: EstadoOrdenCompra.pendiente,
      total: 690,
      items: [
        { idProducto: createdProducts[3].idProducto, cantidadSolicitada: 20, precioUnitario: 12.00, subtotal: 240 },
        { idProducto: createdProducts[6].idProducto, cantidadSolicitada: 10, precioUnitario: 45.00, subtotal: 450 },
      ],
    },
  ];

  const createdOrdenes = [];
  for (const oc of ordenesCompra) {
    const orden = await prisma.ordenCompra.upsert({
      where: { nroOrden: oc.nroOrden },
      update: {},
      create: {
        nroOrden: oc.nroOrden,
        idProveedor: oc.idProveedor,
        idUsuario: oc.idUsuario,
        fechaOrden: oc.fechaOrden,
        fechaEntregaEstimada: oc.fechaEntregaEstimada,
        estado: oc.estado,
        total: oc.total,
        detalles: {
          create: oc.items,
        },
      },
      include: { detalles: true },
    });
    createdOrdenes.push(orden);
  }

  // 9. Crear entradas (para la primera OC que está recibida)
  const entrada = await prisma.entrada.upsert({
    where: { idEntrada: 1 },
    update: {},
    create: {
      idOrdenCompra: createdOrdenes[0].idOrdenCompra,
      idAlmacen: almacenes[0].idAlmacen,
      idUsuario: almacenUser.idUsuario,
      fechaEntrada: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      nroComprobante: 'ENT-0001',
      detalles: {
        create: [
          { idProducto: createdProducts[0].idProducto, idAlmacen: almacenes[0].idAlmacen, cantidadRecibida: 1000, costoUnitario: 0.50 },
          { idProducto: createdProducts[1].idProducto, idAlmacen: almacenes[0].idAlmacen, cantidadRecibida: 1000, costoUnitario: 0.80 },
        ],
      },
    },
  });

  // 10. Crear salidas
  const salida = await prisma.salida.upsert({
    where: { idSalida: 1 },
    update: {},
    create: {
      fechaSalida: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tipoComprobante: 'SAL-0001',
      idUsuario: almacenUser.idUsuario,
      detalles: {
        create: [
          { idProducto: createdProducts[0].idProducto, cantidad: 300, costoUnitario: 0.50, motivo: MotivoSalida.produccion, destino: 'Linea de producción 1' },
          { idProducto: createdProducts[1].idProducto, cantidad: 250, costoUnitario: 0.80, motivo: MotivoSalida.produccion, destino: 'Linea de producción 1' },
          { idProducto: createdProducts[4].idProducto, cantidad: 10, costoUnitario: 15.50, motivo: MotivoSalida.merma, destino: 'Desecho' },
        ],
      },
    },
  });

  // 11. Crear clasificación ABC
  const clasificacionesAbc = [
    { idProducto: createdProducts[4].idProducto, categoria: CategoriaABC.A, valorAnual: 2325, porcentajeIndividual: 45.5, porcentajeAcumulado: 45.5, lote: '2024-06' },
    { idProducto: createdProducts[1].idProducto, categoria: CategoriaABC.A, valorAnual: 1440, porcentajeIndividual: 28.2, porcentajeAcumulado: 73.7, lote: '2024-06' },
    { idProducto: createdProducts[0].idProducto, categoria: CategoriaABC.B, valorAnual: 750, porcentajeIndividual: 14.7, porcentajeAcumulado: 88.4, lote: '2024-06' },
    { idProducto: createdProducts[6].idProducto, categoria: CategoriaABC.B, valorAnual: 540, porcentajeIndividual: 10.6, porcentajeAcumulado: 99.0, lote: '2024-06' },
    { idProducto: createdProducts[3].idProducto, categoria: CategoriaABC.C, valorAnual: 50, porcentajeIndividual: 0.9, porcentajeAcumulado: 99.9, lote: '2024-06' },
    { idProducto: createdProducts[5].idProducto, categoria: CategoriaABC.C, valorAnual: 10, porcentajeIndividual: 0.1, porcentajeAcumulado: 100.0, lote: '2024-06' },
  ];

  // Eliminar clasificaciones existentes para este lote
  await prisma.clasificacionABC.deleteMany({ where: { lote: '2024-06' } });
  // Crear nuevas clasificaciones
  for (const abc of clasificacionesAbc) {
    await prisma.clasificacionABC.create({ data: abc });
  }

  console.log('Seed completado!');
  console.log('- Usuarios creados:', accounts.map(a => a.usuario).join(', '));
  console.log('- Productos creados:', createdProducts.length);
  console.log('- Proveedores creados:', createdSuppliers.length);
  console.log('- Ordenes de compra creadas:', createdOrdenes.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
