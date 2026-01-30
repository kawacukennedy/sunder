<?php

namespace App\Controllers\Api;

use App\Repositories\ApiKeyRepository;
use App\Helpers\ApiResponse;
use App\Middleware\AuthMiddleware;
use PDO;

class ApiKeyController
{
    private ApiKeyRepository $apiKeyRepository;
    private AuthMiddleware $auth;

    public function __construct(PDO $pdo)
    {
        $this->apiKeyRepository = new ApiKeyRepository($pdo);
        $this->auth = new AuthMiddleware($pdo);
    }

    public function index($method, $params)
    {
        if ($method !== 'GET') {
            ApiResponse::error('Method not allowed', 405);
        }

        $user = $this->auth->handle();
        $keys = $this->apiKeyRepository->findByUserId($user->getId());

        $data = array_map(fn($k) => $k->toArray(), $keys);
        ApiResponse::success($data);
    }

    public function store($method, $params)
    {
        if ($method !== 'POST') {
            ApiResponse::error('Method not allowed', 405);
        }

        $user = $this->auth->handle();
        $input = json_decode(file_get_contents('php://input'), true);
        $name = trim($input['name'] ?? '');

        if (!$name) {
            ApiResponse::error('Name is required', 422);
        }

        // Generate a random key
        $key = bin2hex(random_bytes(32)); // 64 characters
        
        $apiKey = $this->apiKeyRepository->create($user->getId(), $name, $key);
        
        // Return the plain key ONLY once
        $response = $apiKey->toArray();
        $response['key'] = $key; // Append plain key for display

        ApiResponse::success($response, 'API Key created. Save this key now, it will not be shown again.', 201);
    }

    public function destroy($method, $params)
    {
        if ($method !== 'DELETE') {
            ApiResponse::error('Method not allowed', 405);
        }

        $user = $this->auth->handle();
        $id = (int)($params[0] ?? 0);

        if (!$id) {
            ApiResponse::error('ID required', 400);
        }

        $success = $this->apiKeyRepository->delete($id, $user->getId());

        if ($success) {
            ApiResponse::success(null, 'API Key deleted');
        } else {
            ApiResponse::error('Failed to delete key', 500);
        }
    }
}
