import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const accounts = [
    { nombres: 'Admin', apellidos: 'SGE', usuario: 'admin', password: 'Admin123*', rol: 'administrador' },
    { nombres: 'Gerente', apellidos: 'Operaciones', usuario: 'gerente', password: 'Gerente123*', rol: 'gerente' },
    { nombres: 'Operador', apellidos: 'Compras', usuario: 'compras', password: 'Compras123*', rol: 'compras' },
    { nombres: 'Supervisor', apellidos: 'Almacen', usuario: 'almacen', password: 'Almacen123*', rol: 'almacen' },
  ] as const;

  for (const account of accounts) {
    const passwordHash = await hash(account.password, 10);

    await prisma.usuario.upsert({
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
  }

  const admin = accounts[0];

  await prisma.almacen.upsert({
    where: { idAlmacen: 1 },
    update: {},
    create: {
      nombre: 'Almacen Central',
      ubicacion: 'Planta Principal',
      descripcion: 'Almacen principal de repuestos y materiales',
      estado: 'activo',
    },
  });

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

  console.log('Seed completado. Cuentas creadas:', accounts.map((account) => account.usuario).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
