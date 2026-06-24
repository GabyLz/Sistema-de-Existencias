# Sistema de Existencias

## Requisitos previos

- Node.js (versión LTS recomendada)
- PostgreSQL (o usar la base de datos SQLite para desarrollo)
- npm o yarn

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/GabyLz/Sistema-de-Existencias.git
cd Sistema-de-Existencias
```

### 2. Configurar Backend

#### Instalar dependencias
```bash
cd backend
npm install
```

#### Configurar variables de entorno
Copia el archivo `.env.example` a `.env` y configura tus variables:
```bash
cp .env.example .env
```

Variables necesarias:
- `DATABASE_URL`: URL de conexión a tu base de datos PostgreSQL (o SQLite para desarrollo)
- `JWT_SECRET`: Clave secreta para JWT
- `JWT_EXPIRES_IN`: Tiempo de expiración del token (ej: "8h")
- `PORT`: Puerto del servidor backend (ej: 3000)
- `SENDGRID_API_KEY`: API key de SendGrid para envío de correos (opcional)
- `EMAIL_FROM`: Correo remitente (opcional)

#### Ejecutar migraciones y seed
```bash
npm run prisma:migrate
npm run seed
```

#### Iniciar servidor backend
```bash
npm run start:dev
```

### 3. Configurar Frontend

#### Instalar dependencias
```bash
cd frontend
npm install
```

#### Iniciar servidor frontend
```bash
npm run dev
```

## Uso

- Backend estará disponible en `http://localhost:3000`
- Frontend estará disponible en `http://localhost:5173` (o el puerto que muestre Vite)

## Tecnologías

- **Backend**: NestJS, Prisma, JWT
- **Frontend**: React, Vite, Bootstrap, Chart.js
- **Base de datos**: PostgreSQL / SQLite
