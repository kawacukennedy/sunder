<?php

namespace App\Middleware;

use App\Helpers\ApiResponse;
use PDO;

class RoleMiddleware
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Handle role check
     *
     * @param array $allowedRoles
     * @return void
     */
    public function handle(array $allowedRoles): void
    {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['user_id'])) {
            ApiResponse::error('Unauthorized', 401);
        }

        $userId = $_SESSION['user_id'];
        
        // Fetch user from DB to get current role (don't trust session for permissions)
        $stmt = $this->pdo->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            ApiResponse::error('User not found', 404);
        }

        $role = $user['role'] ?? 'user';

        if (!in_array($role, $allowedRoles)) {
            ApiResponse::error('Forbidden: Insufficient permissions', 403);
        }
    }
}