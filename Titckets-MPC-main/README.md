# MPC Service Desk

Sistema de mesa de ayuda para la Municipalidad Provincial de Casma. Incluye gestión de tickets, técnicos, personal, áreas/oficinas, designaciones, sedes, bienes tecnológicos, mantenimiento y auditoría.

> Rama de trabajo de estabilización: `leyva-cambios`.
> El proyecto se encuentra dentro de la carpeta `Titckets-MPC-main/` del repositorio.

## Stack

- **Backend:** Laravel 13 + PHP 8.3+ + MySQL
- **Frontend:** React 19 + TypeScript 6 + Vite 8 + Tailwind CSS 4
- **Autenticación:** JWT (`tymon/jwt-auth`)

## Requisitos

- PHP **8.3 o superior**
- Composer 2
- Node.js **22 LTS recomendado** (Vite 8 requiere Node 20.19+ o 22.12+)
- npm
- MySQL 8+

Comprueba tu terminal antes de instalar:

```bash
php -v
composer -V
node -v
npm -v
```

## Instalación segura

### 1. Clonar y entrar a la rama de trabajo

```bash
git clone https://github.com/AmumuLv/Tarea-8-JoseLeyva.git
cd Tarea-8-JoseLeyva
git switch leyva-cambios
cd Titckets-MPC-main
```

### 2. Crear la base de datos de trabajo

Crea una base MySQL llamada `helpdesk` o configura otro nombre en `backend/.env`.

Ejemplo:

```sql
CREATE DATABASE helpdesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Instalar el backend

```bash
cd backend
composer install
composer setup
```

`composer setup` realiza únicamente operaciones de preparación seguras:

- conserva un `.env` existente;
- crea `.env` desde `.env.example` si falta;
- genera `APP_KEY` solo si está vacía;
- genera `JWT_SECRET` solo si está vacío;
- ejecuta únicamente migraciones pendientes (`migrate --graceful`);
- crea el enlace `public/storage` para las evidencias;
- instala y compila el frontend real ubicado en `../frontend`;
- ejecuta `php artisan system:check`.

**No ejecuta `migrate:fresh`, no borra tablas y no ejecuta seeders automáticamente.**

Si tu MySQL usa otra contraseña, puerto o base, edita `backend/.env` antes de ejecutar las migraciones.

### 4. Datos de desarrollo opcionales

Los seeders ya no contienen contraseñas públicas por defecto. Antes de ejecutar `db:seed`, define localmente en `backend/.env`:

```env
SEED_ADMIN_EMAIL=otic@municasma.gob.pe
SEED_ADMIN_PASSWORD=una_clave_local_segura
SEED_AREA_PASSWORD=una_clave_local_segura
SEED_TECNICO_PASSWORD=una_clave_local_segura
```

Luego, solo si realmente necesitas datos de desarrollo:

```bash
php artisan db:seed
```

Nunca confirmes estas contraseñas en Git.

## Ejecutar el sistema

Abre dos terminales.

### Backend

```bash
cd Titckets-MPC-main/backend
composer dev
```

Backend: `http://localhost:8000`

### Frontend

```bash
cd Titckets-MPC-main/frontend
npm run dev
```

Frontend: `http://localhost:5173`

Vite redirige `/api` y `/storage` al backend local en el puerto 8000.

## Comprobación de salud

Desde `backend/`:

```bash
php artisan system:check
```

La comprobación revisa, sin modificar datos:

- versión de PHP y Node;
- presencia de `.env`;
- `APP_KEY` y `JWT_SECRET`;
- enlace `public/storage`;
- permisos de escritura de Laravel;
- conexión a MySQL;
- tablas principales;
- posible estado pendiente de migraciones;
- duplicados en catálogos críticos;
- referencias huérfanas básicas en tickets y bienes.

Para revisar únicamente las migraciones:

```bash
php artisan migrate:status
```

## Pruebas aisladas

Las pruebas usan una base separada llamada **`helpdesk_testing`**. Nunca uses la base `helpdesk` de trabajo para PHPUnit.

1. Crea la base de pruebas:

```sql
CREATE DATABASE helpdesk_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Prepara el entorno de pruebas:

```bash
cd backend
cp .env.testing.example .env.testing
php artisan key:generate --env=testing
php artisan migrate --env=testing --force
```

En Windows Git Bash, `cp` funciona. Si usas CMD puedes copiar el archivo manualmente.

3. Ejecuta:

```bash
php artisan test
```

`phpunit.xml` fuerza `DB_DATABASE=helpdesk_testing` para evitar que las pruebas apunten por accidente a la base de trabajo.

## Frontend: comprobaciones

```bash
cd frontend
npm ci
npm run build
npm run lint
```

## Evidencias e imágenes

Las evidencias de tickets se almacenan en `backend/storage/app/public`. Para que `/storage/...` sea accesible debe existir el enlace:

```bash
cd backend
php artisan storage:link
```

`composer setup` ya ejecuta este paso durante una instalación nueva.

## Seguridad del repositorio

No deben subirse:

- `.env` o `.env.testing`;
- `JWT_SECRET`;
- `APP_KEY`;
- contraseñas reales;
- credenciales de MySQL;
- tokens o claves de servicios externos.

Las contraseñas que alguna vez hayan sido publicadas en el historial del repositorio deben considerarse comprometidas y reemplazarse en cualquier instalación donde se hayan utilizado.

## Estructura

```text
Titckets-MPC-main/
├── backend/                     Laravel API
│   ├── app/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   ├── scripts/
│   └── tests/
├── frontend/                    React + TypeScript + Vite
│   └── src/
├── docs/
└── README.md
```

## Reglas de estabilización

Mientras se trabaja en `leyva-cambios`:

- no usar `php artisan migrate:fresh` sobre la base de trabajo;
- no borrar datos para ocultar errores de migración;
- no ejecutar `composer update` como solución genérica;
- no hacer `force push`;
- corregir y probar por fases;
- utilizar migraciones compatibles con los datos existentes.

Consulta `docs/FASE_0_ESTABILIZACION.md` para el detalle de la estabilización inicial.
