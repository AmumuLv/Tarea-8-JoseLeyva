# Fase 0 — Estabilización de arranque, archivos internos y base de datos

Rama de trabajo: `leyva-cambios`

Objetivo: dejar el proyecto preparado para instalarse, iniciar, migrar, probarse y diagnosticar fallos internos sin borrar datos de trabajo ni depender de configuraciones ambiguas.

## Resultado de la auditoría

Durante la revisión profunda la Fase 0 pasó de 13 a **19 problemas verificados**. También se añadieron controles preventivos (health check, CI y documentación) para evitar que los mismos problemas reaparezcan.

| ID | Problema | Estado |
|---|---|---|
| EST-01 | README permitía Node 18 aunque Vite 8 requiere una versión más nueva | Corregido |
| EST-02 | `composer setup` instalaba/compilaba el npm del backend y no el React real | Corregido |
| EST-03 | `composer dev` mezclaba servidor, cola, logs y Vite del backend | Corregido |
| EST-04 | El setup no generaba `JWT_SECRET` | Corregido |
| EST-05 | Instalación no garantizaba `public/storage` | Corregido |
| EST-06 | Documentación asumía otra raíz/repositorio y daba comandos incorrectos | Corregido |
| DB-01 | Historial de migraciones cambiaba `users.email` entre obligatorio y nullable | Corregido para instalaciones nuevas |
| DB-02 | Historial de migraciones cambiaba `users.password` entre obligatorio y nullable | Corregido para instalaciones nuevas |
| DB-03 | Una migración podía asignar el mismo `unknown@placeholder.com` a varios usuarios con índice UNIQUE | Corregido |
| DB-04 | `bien_historial.usuario` se vinculaba por nombre sin comprobar ambigüedad | Corregido para instalaciones nuevas |
| DB-05 | Se intentaban crear UNIQUE en catálogos sin comprobar duplicados previamente | Corregido |
| DB-06 | `AreaUsersSeeder` dependía de `password_correo`, columna eliminada por una migración | Corregido |
| INT-01 | Consultar técnicos (`GET`) podía crear técnicos automáticamente en la BD | Corregido |
| INT-02 | `DatePicker` calculaba mal los días del mes anterior | Corregido |
| SEC-01 | README publicaba contraseñas predeterminadas | Corregido en el estado actual del repositorio |
| SEC-02 | `AdminUserSeeder` tenía una contraseña fija en código | Corregido |
| SEC-03 | Seeders de áreas/técnicos usaban contraseñas fijas o fallback inseguros | Corregido |
| TEST-01 | PHPUnit forzaba SQLite aunque las migraciones/pruebas del proyecto requieren MySQL | Corregido |
| SEED-01 | `DatabaseSeeder` ejecutaba dos seeders de técnicos parcialmente redundantes | Corregido |

## Cambios realizados

### Preparación del entorno

- `backend/scripts/ensure-environment.php`
  - crea `.env` solo si falta;
  - genera `APP_KEY` solo si está vacía;
  - genera `JWT_SECRET` solo si está vacío;
  - no imprime ni rota claves existentes.

- `backend/composer.json`
  - `composer setup` prepara backend + frontend real;
  - ejecuta solo migraciones pendientes;
  - crea/repara `public/storage`;
  - compila `../frontend`;
  - termina con `system:check`;
  - `composer dev` inicia únicamente el backend para evitar dos Vite diferentes.

### Diagnóstico

Se agregó:

```bash
php artisan system:check
```

El comando revisa versiones, entorno, claves, storage, permisos de escritura, MySQL, tablas principales, migraciones, duplicados y referencias huérfanas básicas.

No elimina ni corrige datos automáticamente.

### Base de datos

Se hizo más segura la migración histórica `2026_09_24_000001_fix_database_indexes_and_constraints.php`:

- ya no genera correos placeholder duplicados;
- ya no fuerza temporalmente email/password a NOT NULL;
- el usuario histórico de un bien solo se convierte a FK si el nombre identifica una única persona;
- un nombre ambiguo se conserva en la descripción en lugar de atribuirlo a la persona equivocada;
- antes de crear UNIQUE se comprueba si existen duplicados y se genera un error explicativo.

**Importante:** una migración que ya fue ejecutada no vuelve a ejecutarse al hacer `git pull`. Estos cambios protegen instalaciones nuevas. Una BD existente debe revisarse con `system:check` y `migrate:status`; no se debe usar `migrate:fresh` para “arreglarla”.

### Seeders y contraseñas

Las contraseñas ya no se encuentran escritas en los seeders. Para ejecutar `db:seed` se requieren variables locales:

```env
SEED_ADMIN_PASSWORD=
SEED_AREA_PASSWORD=
SEED_TECNICO_PASSWORD=
```

`TecnicoMissingSeeder` queda únicamente como herramienta manual de reparación para instalaciones antiguas y ya no se ejecuta dentro de `DatabaseSeeder`.

### Frontend

`frontend/package.json` declara la versión de Node compatible con Vite 8 y `frontend/.npmrc` usa `engine-strict=true`, de modo que una versión incompatible falle al instalar en vez de producir errores difíciles de diagnosticar después.

`DatePicker.tsx` fue corregido para calcular correctamente el mes anterior y ahora respeta la propiedad `required`.

### Pruebas

- PHPUnit usa `helpdesk_testing`, nunca `helpdesk`.
- Se agregó `.env.testing.example`.
- La base de pruebas debe crearse y migrarse explícitamente antes de `php artisan test`.

### Integración continua

`.github/workflows/tickets-mpc-ci.yml` valida automáticamente en `leyva-cambios`:

- Composer + PHP 8.3;
- migraciones sobre MySQL aislado;
- pruebas Laravel;
- Node 22;
- `npm ci`;
- build TypeScript/Vite;
- lint del frontend.

## Validación local obligatoria

Después de actualizar la rama:

```bash
git switch leyva-cambios
git pull origin leyva-cambios
cd Titckets-MPC-main/backend
composer install
php artisan system:check
php artisan migrate:status
```

Si `system:check` informa migraciones pendientes y la BD es la copia de trabajo correcta:

```bash
php artisan migrate
php artisan system:check
```

No uses `migrate:fresh`.

Para validar frontend:

```bash
cd ../frontend
npm ci
npm run build
npm run lint
```

## Pruebas automáticas locales

Crear una sola vez la BD aislada:

```sql
CREATE DATABASE helpdesk_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Luego:

```bash
cd backend
cp .env.testing.example .env.testing
php artisan key:generate --env=testing
php artisan migrate --env=testing --force
php artisan test
```

## Riesgo pendiente que requiere acción humana

Las contraseñas que estuvieron publicadas anteriormente siguen formando parte del historial de Git. Aunque fueron eliminadas del código actual, si alguna se utilizó en una instalación real debe cambiarse. Reescribir el historial implicaría un force-push y no forma parte de esta estabilización.

## Criterio de cierre de Fase 0

La Fase 0 queda lista para cerrar cuando en la máquina local se confirme:

1. PHP 8.3+ y Node compatible.
2. `composer install` finaliza correctamente.
3. `php artisan system:check` no muestra errores.
4. `php artisan migrate:status` no muestra migraciones inesperadas.
5. `npm ci`, `npm run build` y `npm run lint` finalizan correctamente.
6. La BD `helpdesk_testing` ejecuta `php artisan test` sin usar la BD de trabajo.
7. Backend (`:8000`) y frontend (`:5173`) inician y `/storage` sirve las evidencias.

Hasta completar esas comprobaciones locales, la Fase 0 se considera **implementada en código pero pendiente de validación en la PC**.
