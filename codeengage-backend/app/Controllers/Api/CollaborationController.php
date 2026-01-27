<?php

namespace App\Controllers\Api;

use PDO;
use App\Services\CollaborationService;
use App\Repositories\SnippetRepository;
use App\Repositories\UserRepository;
use App\Repositories\RoleRepository;
use App\Repositories\CollaborationRepository;
use App\Repositories\AuditRepository;
use App\Helpers\ApiResponse;
use App\Helpers\SecurityHelper;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;

class CollaborationController
{
    private PDO $db;
    private CollaborationService $collaborationService;
    private AuthMiddleware $auth;
    private UserRepository $userRepository; // Needed for RoleMiddleware constructor

    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->userRepository = new UserRepository($db);
        $snippetRepository = new SnippetRepository($db);
        $collaborationRepository = new CollaborationRepository($db);
        $auditRepository = new AuditRepository($db);
        $securityHelper = new SecurityHelper();
        
        $this->auth = new AuthMiddleware($db);
        $this->collaborationService = new CollaborationService(
            $snippetRepository,
            $collaborationRepository,
            $auditRepository,
            $securityHelper,
            $this->userRepository, // Pass UserRepository
            new RoleRepository($db) // Pass RoleRepository
        );
    }

    public function sessions(string $method, array $params): void
    {
        if ($method !== 'POST') {
            ApiResponse::error('Method not allowed', 405);
        }

        $currentUser = $this->auth->handle();
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            ApiResponse::error('Invalid JSON input');
        }

        try {
            $sessionData = $this->collaborationService->createSession(
                (int)$input['snippet_id'],
                $currentUser->getId()
            );
            ApiResponse::success($sessionData, 'Collaboration session created');

        } catch (\Exception $e) {
            ApiResponse::error($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function session(string $method, array $params): void
    {
        $token = $params[0] ?? null;
        if (!$token) {
            ApiResponse::error('Session token required');
        }

        $currentUser = $this->auth->handle();

        try {
            switch ($method) {
                case 'GET':
                    $sessionData = $this->collaborationService->joinSession($token, $currentUser->getId());
                    ApiResponse::success($sessionData);
                    break;
                case 'POST':
                    $input = json_decode(file_get_contents('php://input'), true);
                    if (!$input) {
                        ApiResponse::error('Invalid JSON input');
                    }
                    $this->collaborationService->pushUpdate($token, $currentUser->getId(), $input);
                    ApiResponse::success(['updated_at' => date('Y-m-d H:i:s')]);
                    break;
                case 'DELETE':
                    $this->collaborationService->endSession($token, $currentUser->getId());
                    ApiResponse::success(null, 'Left collaboration session');
                    break;
                default:
                    ApiResponse::error('Method not allowed', 405);
            }
        } catch (\Exception $e) {
            ApiResponse::error($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function updates(string $method, array $params): void
    {
        if ($method !== 'GET') {
            ApiResponse::error('Method not allowed', 405);
        }

        $token = $params[0] ?? null;
        if (!$token) {
            ApiResponse::error('Session token required');
        }

        $currentUser = $this->auth->handle();
        $since = $_GET['since'] ?? null;

        try {
            $updates = $this->collaborationService->getUpdates($token, $currentUser->getId(), $since);
            ApiResponse::success($updates);
        } catch (\Exception $e) {
            ApiResponse::error($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function cleanup(string $method, array $params): void
    {
        if ($method !== 'POST') {
            ApiResponse::error('Method not allowed', 405);
        }

        try {
            // This endpoint should ideally be protected by admin middleware or cron access
            $deletedCount = $this->collaborationService->cleanupExpiredSessions();
            ApiResponse::success(['deleted_sessions' => $deletedCount], 'Cleanup completed');

        } catch (\Exception $e) {
            ApiResponse::error('Cleanup failed: ' . $e->getMessage(), $e->getCode() ?: 500);
        }
    }
}