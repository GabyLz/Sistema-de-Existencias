# Sistema de Existencias

Sistema completo de gestión de inventario con análisis ABC, órdenes de compra, entradas/salidas y reportes.

## Tecnologías

- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + Vite + Bootstrap
- **Base de datos**: PostgreSQL

## Características

- Gestión de productos y proveedores
- Control de inventario por almacén
- Análisis ABC automático
- Órdenes de compra con flujo de aprobación
- Entradas y salidas de mercancía
- Reportes en PDF
- Roles de usuario (administrador, gerente, compras, almacén)
- Auditoría de cambios

## Instalación

### Requisitos previos

- Node.js 18+
- PostgreSQL
- npm o yarn

### Backend

```bash
cd backend
npm install
```

Configura las variables de entorno en `.env`:

```
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/sistema_existencias"
JWT_SECRET="tu_secreto_jwt"
SENDGRID_API_KEY="tu_api_key"
```

Ejecuta las migraciones y el seed:

```bash
npm run prisma:migrate
npm run seed
```

Inicia el servidor:

```bash
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Estructura del proyecto

```
Cadena/
├── backend/
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
└── README.md
```

## Scripts útiles

### Backend

- `npm run start:dev`: Inicia en modo desarrollo
- `npm run build`: Compila el proyecto
- `npm run prisma:studio`: Abre Prisma Studio
- `npm run seed`: Ejecuta el seed de la base de datos

### Frontend

- `npm run dev`: Inicia en modo desarrollo
- `npm run build`: Compila el proyecto
- `npm run preview`: Previsualiza la build

## Licencia

MIT
