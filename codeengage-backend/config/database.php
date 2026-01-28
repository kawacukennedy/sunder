<?php

return [
    'default' => $_ENV['DB_CONNECTION'] ?? 'mysql',

    'host' => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'port' => $_ENV['DB_PORT'] ?? '3306',
    'name' => $_ENV['DB_DATABASE'] ?? 'codeengage',
    'user' => $_ENV['DB_USERNAME'] ?? 'root',
    'pass' => $_ENV['DB_PASSWORD'] ?? '',
    'charset' => 'utf8mb4',
    
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
    
    // SQLite Configuration
    'sqlite_path' => __DIR__ . '/../storage/database.sqlite',
];