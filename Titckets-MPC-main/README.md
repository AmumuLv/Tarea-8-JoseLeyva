# MPC Service Desk

Sistema de Mesa de Ayuda para la Municipalidad Provincial de Casma. Gestión de tickets, áreas, personal, bienes y diseño.

## Stack

- **Backend:** Laravel 13 + PHP 8.3 + MySQL 9
- **Frontend:** React 19 + TypeScript + Vite 8 + Tailwind CSS 4
- **Auth:** JWT (tymon/jwt-auth)

## Requisitos

- PHP 8.3+
- Composer
- Node.js 18+
- MySQL 8+ o 9+
- npm

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Yordax36/Titckets-MPC.git
cd Titckets-MPC
```

### 2. Backend (Laravel)

```bash
cd backend

# Instalar dependencias
composer install

# Copiar archivo de entorno
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Generar JWT secret
php artisan jwt:secret

# Crear base de datos
mysql -u root -e "CREATE DATABASE helpdesk"

# Configurar .env (editar credenciales de BD si es necesario)
# DB_DATABASE=helpdesk
# DB_USERNAME=root
# DB_PASSWORD=

# Ejecutar migraciones + seeders
php artisan migrate --seed
```

### 3. Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 4. Iniciar Backend

```bash
cd backend
php artisan serve
```

El backend corre en `http://localhost:8000` y el frontend en `http://localhost:5173`. El proxy de Vite redirige `/api` al backend automáticamente.

## Credenciales por defecto

### Administrador
- **Email:** `otic@municasma.gob.pe`
- **Contraseña:** `OTIC#2026`

### Usuarios de Área
- **Contraseña general:** `MPC@2026!`
- Cada área tiene su correo institucional (ej: `alcaldia@municasma.gob.pe`)

## Sistema de Permisos

El sistema utiliza permisos basados en roles para controlar el acceso a funcionalidades. El rol **Administrador** tiene acceso total automaticamente.

### Roles

| Rol | Descripción |
|-----|-------------|
| Administrador | Acceso total al sistema (bypass de permisos) |
| Tecnico (Soporte OTIC) | Tickets asignados, gestión de bienes, historial |
| Area Usuaria | Crear tickets, ver bienes de su área, perfil |

### Permisos por Módulo

| Módulo | Permisos |
|--------|----------|
| **Tickets** | ver_todos_los_tickets, ver_tickets_asignados, ver_mis_tickets, crear_ticket, editar_ticket, cambiar_estado, cambiar_prioridad, asignar_tecnico, reasignar_ticket, subir_evidencia, eliminar_evidencia, ver_ticket_pdf |
| **Usuarios** | crear_usuario, editar_usuario, eliminar_usuario, ver_usuarios |
| **Areas** | crear_area, editar_area, eliminar_area, ver_areas |
| **Técnicos** | ver_tecnicos, crear_tecnico, editar_tecnico, eliminar_tecnico |
| **Cargos** | ver_cargos, crear_cargo, editar_cargo, eliminar_cargo |
| **Designaciones** | ver_designaciones, crear_designacion, editar_designacion, eliminar_designacion |
| **Bienes** | ver_bienes, crear_bien, editar_bien, eliminar_bien, gestionar_bienes |
| **Configuración** | configurar_sistema |
| **Auditoría** | ver_auditoria |
| **Dashboard** | ver_estadisticas |
| **Perfil Area** | ver_perfil_area, editar_perfil_area, cambiar_password_area |

### Asignación de Permisos por Rol

**Tecnico (Soporte OTIC):** ver_tickets_asignados, editar_ticket, cambiar_estado, cambiar_prioridad, agregar_respuesta, subir_evidencia, eliminar_evidencia, ver_ticket_pdf, ver_historial, ver_bienes, editar_bien, gestionar_bienes, ver_tecnicos, ver_estadisticas

**Area Usuaria:** ver_mis_tickets, crear_ticket, editar_ticket, agregar_respuesta, subir_evidencia, ver_ticket_pdf, ver_historial, ver_bienes, ver_perfil_area, editar_perfil_area, cambiar_password_area, ver_estadisticas

## Seguridad

- Rate limiting: 5 intentos/min en login, 120 req/min en API autenticada
- JWT tokens con refresh
- Middleware de permisos en todas las rutas protegidas
- Auditoría completa de acciones
- Validación de entrada en todos los endpoints

## Estructura del proyecto

```
Tickets/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/   # Controladores API
│   │   ├── Http/Middleware/     # CheckPermission, CheckRole
│   │   ├── Models/             # Modelos Eloquent
│   │   ├── Services/           # PermisoService
│   │   └── Helpers/            # AuditHelper
│   ├── database/
│   │   ├── migrations/         # Migraciones de BD
│   │   └── seeders/            # Seeders (roles, permisos, etc.)
│   ├── routes/api.php          # Rutas API con middleware de permisos
│   └── config/
│
├── frontend/                   # React App
│   ├── src/
│   │   ├── api/                # Funciones API (axios)
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── layout/         # Sidebar, Navbar, Layout
│   │   │   ├── tickets/        # Componentes de tickets
│   │   │   └── ui/             # Botones, Modals, Tables, etc.
│   │   ├── pages/              # Páginas/rutas
│   │   ├── hooks/              # useAuth, usePermission
│   │   ├── store/              # Zustand stores
│   │   ├── routes/             # PermissionRoute, ProtectedRoute
│   │   └── utils/              # permissions.ts, constants, formatters
│   └── vite.config.ts
│
└── README.md
```

## Comandos útiles

```bash
# Ejecutar migraciones
php artisan migrate

# Resetear BD y re-crear datos
php artisan migrate:fresh --seed

# Crear JWT secret
php artisan jwt:secret

# Limpiar cache
php artisan cache:clear
php artisan config:clear

# Tinker (consola interactiva)
php artisan tinker
```

## Variables de entorno importantes

```env
# Base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=helpdesk
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=tu-secret-aqui

# Frontend (en frontend/.env si es necesario)
VITE_API_URL=http://localhost:8000
```

## Licencia

Proyecto privado - Municipalidad Provincial de Casma
