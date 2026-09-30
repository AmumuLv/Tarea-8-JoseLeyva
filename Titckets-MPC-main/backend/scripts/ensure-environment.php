<?php

$basePath = dirname(__DIR__);
$envPath = $basePath . DIRECTORY_SEPARATOR . '.env';
$examplePath = $basePath . DIRECTORY_SEPARATOR . '.env.example';

function readEnvValue(string $contents, string $key): ?string
{
    if (!preg_match('/^' . preg_quote($key, '/') . '\s*=\s*(.*)$/m', $contents, $matches)) {
        return null;
    }

    return trim(trim($matches[1]), "\"'");
}

function runArtisan(string $basePath, string $command): void
{
    $php = escapeshellarg(PHP_BINARY);
    $artisan = escapeshellarg($basePath . DIRECTORY_SEPARATOR . 'artisan');
    passthru("{$php} {$artisan} {$command}", $exitCode);

    if ($exitCode !== 0) {
        fwrite(STDERR, "No se pudo ejecutar: php artisan {$command}" . PHP_EOL);
        exit($exitCode);
    }
}

if (!is_file($envPath)) {
    if (!is_file($examplePath)) {
        fwrite(STDERR, "No existe .env ni .env.example." . PHP_EOL);
        exit(1);
    }

    if (!copy($examplePath, $envPath)) {
        fwrite(STDERR, "No se pudo crear .env desde .env.example." . PHP_EOL);
        exit(1);
    }

    echo "[OK] .env creado desde .env.example" . PHP_EOL;
} else {
    echo "[OK] .env existente conservado" . PHP_EOL;
}

$contents = (string) file_get_contents($envPath);

if (!readEnvValue($contents, 'APP_KEY')) {
    echo "[INFO] Generando APP_KEY..." . PHP_EOL;
    runArtisan($basePath, 'key:generate --ansi');
} else {
    echo "[OK] APP_KEY ya configurada; no se modifica" . PHP_EOL;
}

$contents = (string) file_get_contents($envPath);

if (!readEnvValue($contents, 'JWT_SECRET')) {
    echo "[INFO] Generando JWT_SECRET..." . PHP_EOL;
    runArtisan($basePath, 'jwt:secret');
} else {
    echo "[OK] JWT_SECRET ya configurado; no se modifica" . PHP_EOL;
}

echo "Entorno preparado sin rotar claves existentes." . PHP_EOL;
