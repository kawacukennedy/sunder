<?php

namespace App\Controllers\Api;

use App\Services\AuthService;
use App\Helpers\ApiResponse;
use PDO;

class AuthController
{
    private $authService;
    private $config;

    public function __construct(PDO $pdo)
    {
        $this->config = require __DIR__ . '/../../../config/app.php';
        $this->authService = new AuthService($pdo, $this->config);
    }

    public function login($method, $params)
    {
        if ($method !== 'POST') {
            ApiResponse::error('Method not allowed', 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $result = $this->authService->login($input['email'] ?? '', $input['password'] ?? '');
        
        ApiResponse::success($result, 'Login successful');
    }

    public function register($method, $params)
    {
        if ($method !== 'POST') {
            ApiResponse::error('Method not allowed', 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $result = $this->authService->register($input);
        
        ApiResponse::success($result, 'Registration successful', 201);
    }

    public function logout($method, $params)
    {
        $this->authService->logout();
        ApiResponse::success(null, 'Logged out successfully');
    }

    public function me($method, $params)
    {
        $user = $this->authService->me();
        ApiResponse::success($user);
    }
}