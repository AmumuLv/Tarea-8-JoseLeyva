<?php

$errors = [];
$warnings = [];

$ok = static function (string $message): void {
    echo "[OK] {$message}" . PHP_EOL;
};

$fail = static function (string $message) use (&$errors): void {
    $errors[] = $message;
    fwrite(STDERR, "[ERROR] {$message}" . PHP_EOL);
};

$warn = static function (string $message) use (&$warnings): void {
    $warnings[] = $message;
    echo "[AVISO] {$message}" . PHP_EOL;
};

echo 'MPC Service Desk - preflight' . PHP_EOL;
echo str_repeat('-', 42) . PHP_EOL;

if (version_compare(PHP_VERSION, '8.3.0', '>=')) {
    $ok('PHP ' . PHP_VERSION . ' compatible.');
} else {
    $fail('PHP ' . PHP_VERSION . ' detectado; el backend requiere PHP 8.3 o superior.');
}

$requiredExtensions = [
    'ctype',
    'dom',
    'fileinfo',
    'mbstring',
    'openssl',
    'pdo',
    'pdo_mysql',
    'tokenizer',
];

foreach ($requiredExtensions as $extension) {
    if (extension_loaded($extension)) {
        $ok("Extensión PHP {$extension} disponible.");
    } else {
        $fail("Falta la extensión PHP {$extension}.");
    }
}

$nodeOutput = [];
$nodeExit = 0;
@exec('node --version 2>&1', $nodeOutput, $nodeExit);
$nodeVersionText = trim(implode(' ', $nodeOutput));

if ($nodeExit === 0 && preg_match('/v?(\d+\.\d+\.\d+)/', $nodeVersionText, $match)) {
    $nodeVersion = $match[1];
    $node20Compatible = version_compare($nodeVersion, '20.19.0', '>=') && version_compare($nodeVersion, '21.0.0', '<');
    $node22PlusCompatible = version_compare($nodeVersion, '22.12.0', '>=');

    if ($node20Compatible || $node22PlusCompatible) {
        $ok("Node {$nodeVersion} compatible con Vite 8.");
    } else {
        $fail("Node {$nodeVersion} no es compatible con Vite 8. Usa Node 20.19+ o 22.12+ (22 LTS recomendado).");
    }
} else {
    $fail('Node.js no está disponible en PATH.');
}

$backendRoot = dirname(__DIR__);
$frontendRoot = dirname($backendRoot) . DIRECTORY_SEPARATOR . 'frontend';

foreach ([
    $backendRoot . DIRECTORY_SEPARATOR . 'composer.json' => 'backend/composer.json',
    $frontendRoot . DIRECTORY_SEPARATOR . 'package.json' => 'frontend/package.json',
    $frontendRoot . DIRECTORY_SEPARATOR . 'package-lock.json' => 'frontend/package-lock.json',
] as $file => $label) {
    if (is_file($file)) {
        $ok("{$label} encontrado.");
    } else {
        $fail("Falta {$label}.");
    }
}

if (!is_file($backendRoot . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php')) {
    $warn('vendor/autoload.php todavía no existe. Ejecuta composer install antes de usar Artisan.');
} else {
    $ok('vendor/autoload.php disponible.');
}

if ($errors !== []) {
    echo PHP_EOL . 'Preflight falló con ' . count($errors) . ' error(es).' . PHP_EOL;
    exit(1);
}

echo PHP_EOL . 'Preflight correcto';
if ($warnings !== []) {
    echo ' con ' . count($warnings) . ' aviso(s)';
}
echo '.' . PHP_EOL;
