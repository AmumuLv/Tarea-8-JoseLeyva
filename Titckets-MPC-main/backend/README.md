# Backend — MPC Service Desk

API Laravel del sistema MPC Service Desk.

## Requisitos

- PHP 8.3+
- Composer 2
- MySQL 8+

La guía completa de instalación está en `../README.md`.

## Preparación

```bash
composer install
composer setup
```

`composer setup` conserva las claves existentes y prepara de forma segura el entorno, migraciones pendientes, `public/storage` y la compilación del frontend.

## Arranque

```bash
composer dev
```

Equivale al servidor Laravel local en `http://localhost:8000`.

El frontend React se ejecuta por separado desde `../frontend`:

```bash
npm run dev
```

## Verificación

```bash
composer preflight
php artisan system:check
php artisan migrate:status
```

## Pruebas

Las pruebas usan exclusivamente `helpdesk_testing`.

```bash
cp .env.testing.example .env.testing
php artisan key:generate --env=testing
php artisan jwt:secret --env=testing --force
php artisan migrate --env=testing --force
php artisan db:seed --class=RoleSeeder --env=testing --force
php artisan db:seed --class=PermisoSeeder --env=testing --force
php artisan db:seed --class=RolPermisoSeeder --env=testing --force
php artisan test
```

Los tres seeders anteriores cargan únicamente los catálogos mínimos de autorización que requieren las pruebas. No crean usuarios reales ni usan contraseñas del entorno de trabajo.

No apuntes PHPUnit a la base `helpdesk` de trabajo.

## Seeders de desarrollo

No existen contraseñas de acceso predeterminadas dentro del código. Para ejecutar datos de desarrollo debes definir primero, solo en tu `.env` local:

```env
SEED_ADMIN_PASSWORD=
SEED_AREA_PASSWORD=
SEED_TECNICO_PASSWORD=
```

Después:

```bash
php artisan db:seed
```

## Reglas de seguridad

- No subir `.env`, claves JWT o contraseñas.
- No usar `migrate:fresh` sobre una base con información de trabajo.
- No crear datos desde endpoints GET.
- Los cambios de esquema deben hacerse mediante migraciones que preserven datos existentes.
