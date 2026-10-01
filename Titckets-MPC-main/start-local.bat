@echo off
setlocal
cd /d "%~dp0"

echo ==============================================
echo MPC Service Desk - inicio local seguro
echo ==============================================

if not exist "backend\vendor\autoload.php" (
    echo [ERROR] Falta backend\vendor\autoload.php
    echo Ejecuta primero:
    echo   cd backend
    echo   composer install
    echo   composer setup
    pause
    exit /b 1
)

cd /d "%~dp0backend"
php scripts\preflight.php
if errorlevel 1 goto :fail

php artisan system:check
if errorlevel 1 goto :fail

cd /d "%~dp0"
start "MPC Backend :8000" cmd /k "cd /d \"%~dp0backend\" && composer dev"
start "MPC Frontend :5173" cmd /k "cd /d \"%~dp0frontend\" && npm run dev"

echo.
echo [OK] Se abrieron backend y frontend en terminales separadas.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
exit /b 0

:fail
echo.
echo [ERROR] El chequeo previo fallo. Corrige los errores mostrados antes de iniciar.
pause
exit /b 1
