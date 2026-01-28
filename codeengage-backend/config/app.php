<?php

return [
    'name' => $_ENV['APP_NAME'] ?? 'CodeEngage',
    'env' => $_ENV['APP_ENV'] ?? 'production',
    'debug' => ($_ENV['APP_DEBUG'] ?? 'false') === 'true',
    'url' => $_ENV['APP_URL'] ?? 'http://localhost',
    'timezone' => 'UTC',
    'locale' => 'en',
    
    'auth' => [
        'method' => 'session', // or 'jwt'
        'jwt_secret' => $_ENV['JWT_SECRET'] ?? '',
        'session_lifetime' => $_ENV['SESSION_LIFETIME'] ?? 120, // minutes
    ]
];