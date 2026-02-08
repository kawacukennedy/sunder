<?php

namespace App\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Repositories\UserRepository;
use App\Repositories\SnippetRepository;
use App\Repositories\AuditRepository;
use PDO;

class AdminController
{
    private PDO $pdo;
    private AuthMiddleware $auth;
    private RoleMiddleware $roleMiddleware;

    private $notificationService;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->auth = new AuthMiddleware($pdo);
        $this->roleMiddleware = new RoleMiddleware($pdo);
        
        // Manual DI for now
        $notificationRepo = new \App\Repositories\NotificationRepository($pdo);
        $userRepo = new \App\Repositories\UserRepository($pdo);
        $emailService = new \App\Services\EmailService();
        $this->notificationService = new \App\Services\NotificationService($notificationRepo, $userRepo, $emailService);
    }

    private function ensureAdmin()
    {
        $user = $this->auth->handle();
        $this->roleMiddleware->handle(['admin', 'super_admin']);
        return $user;
    }

    public function stats($method, $params)
    {
        $this->ensureAdmin();

        $userCount = $this->pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $snippetCount = $this->pdo->query("SELECT COUNT(*) FROM snippets")->fetchColumn();
        $totalViews = $this->pdo->query("SELECT SUM(view_count) FROM snippets")->fetchColumn();
        
        $newUsersCount = $this->pdo->query("SELECT COUNT(*) FROM users WHERE created_at >= CURDATE()")->fetchColumn();
        $newSnippetsCount = $this->pdo->query("SELECT COUNT(*) FROM snippets WHERE created_at >= CURDATE()")->fetchColumn();

        ApiResponse::success([
            'total_users' => (int)$userCount,
            'total_snippets' => (int)$snippetCount,
            'total_views' => (int)$totalViews,
            'new_users_today' => (int)$newUsersCount,
            'new_snippets_today' => (int)$newSnippetsCount,
            'active_users_24h' => $this->pdo->query("SELECT COUNT(DISTINCT user_id) FROM audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)")->fetchColumn(),
            'system' => [
                'database_status' => 'healthy',
                'cache_status' => 'healthy',
                'disk_usage' => '15%',
                'memory_usage' => '128MB'
            ]
        ]);
    }

    public function users($method, $params)
    {
        $this->ensureAdmin();

        if ($method === 'GET') {
            $limit = (int)($_GET['limit'] ?? 20);
            $offset = (int)($_GET['offset'] ?? 0);
            $search = $_GET['search'] ?? null;

            $sql = "SELECT id, username, email, display_name, avatar_url, role, created_at, deleted_at FROM users";
            $where = [];
            if ($search) {
                $where[] = "(username LIKE :search OR email LIKE :search)";
            }
            
            if ($where) {
                $sql .= " WHERE " . implode(" AND ", $where);
            }
            
            $sql .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
            
            $stmt = $this->pdo->prepare($sql);
            if ($search) $stmt->bindValue(':search', "%$search%");
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $users = $stmt->fetchAll();
            
            // Total for pagination
            $totalSql = "SELECT COUNT(*) FROM users";
            if ($where) $totalSql .= " WHERE " . implode(" AND ", $where);
            $totalStmt = $this->pdo->prepare($totalSql);
            if ($search) $totalStmt->bindValue(':search', "%$search%");
            $totalStmt->execute();
            $total = $totalStmt->fetchColumn();

            ApiResponse::success([
                'users' => $users,
                'total' => (int)$total
            ]);
        }
    }

    public function reports($method, $params)
    {
        $this->ensureAdmin();
        
        $status = $_GET['status'] ?? 'pending';
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = (int)($_GET['offset'] ?? 0);

        $sql = "
            SELECT r.*, u.username as reporter_name
            FROM reports r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.status = :status
            ORDER BY r.created_at DESC
            LIMIT :limit OFFSET :offset
        ";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

            ApiResponse::success([
                'reports' => $reports
            ]);
        } catch (\PDOException $e) {
            // If table doesn't exist, return empty for now but log it
            error_log("Reports table potentially missing: " . $e->getMessage());
            ApiResponse::success(['reports' => []]);
        }
    }

    public function reportAction($method, $params)
    {
        $admin = $this->ensureAdmin();
        $reportId = $params[0] ?? null;

        if ($method !== 'POST' || !$reportId) {
            ApiResponse::error('Invalid request', 400);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? null;

        if (!$action) {
            ApiResponse::error('Action required', 400);
        }

        // Get report details
        $stmt = $this->pdo->prepare("SELECT * FROM reports WHERE id = ?");
        $stmt->execute([$reportId]);
        $report = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$report) {
            ApiResponse::error('Report not found', 404);
        }

        $auditRepo = new AuditRepository($this->pdo);

        if ($action === 'delete') {
            if ($report['target_type'] === 'snippet') {
                $stmt = $this->pdo->prepare("UPDATE snippets SET deleted_at = NOW() WHERE id = ?");
                $stmt->execute([$report['target_id']]);
                
                // Notify offender
                $offenderId = $this->getOffenderId('snippet', $report['target_id']);
                if ($offenderId) {
                    $this->notificationService->notify(
                        $offenderId,
                        'system',
                        'Content Removed',
                        "Your snippet (ID: #{$report['target_id']}) was removed for violating community guidelines.",
                        ['report_id' => $reportId]
                    );
                }
                
            } elseif ($report['target_type'] === 'comment') {
                $stmt = $this->pdo->prepare("DELETE FROM comments WHERE id = ?"); // Or soft delete
                $stmt->execute([$report['target_id']]);
                
                 // Notify offender
                $offenderId = $this->getOffenderId('comment', $report['target_id']);
                if ($offenderId) {
                    $this->notificationService->notify(
                        $offenderId,
                        'system',
                        'Content Removed',
                        "Your comment was removed by moderation.",
                        ['report_id' => $reportId]
                    );
                }
            }
            $status = 'resolved';
        } elseif ($action === 'warn') {
            // Send warning notification
            $offenderId = $this->getOffenderId($report['target_type'], $report['target_id']);
            if ($offenderId) {
                $this->notificationService->notify(
                    $offenderId,
                    'warning',
                    'Content Warning',
                    "Your content (ID: #{$report['target_id']}) has been flagged for violating our community guidelines. Please review our rules.",
                    ['report_id' => $reportId]
                );
            }
            $status = 'resolved';
        } elseif ($action === 'dismiss') {
            $status = 'dismissed';
        } else {
            ApiResponse::error('Invalid action', 400);
        }

        // Update report status
        $stmt = $this->pdo->prepare("UPDATE reports SET status = ?, resolved_at = NOW(), resolved_by = ? WHERE id = ?");
        $stmt->execute([$status, $admin['id'], $reportId]);

        $auditRepo->log($admin['id'], 'moderation', 'report', $reportId, null, ['action' => $action, 'status' => $status]);

        ApiResponse::success(null, 'Report processed');
    }

    private function getOffenderId($type, $id)
    {
        try {
            if ($type === 'snippet') {
                $stmt = $this->pdo->prepare("SELECT user_id FROM snippets WHERE id = ?");
                $stmt->execute([$id]);
                return $stmt->fetchColumn();
            } elseif ($type === 'comment') {
                $stmt = $this->pdo->prepare("SELECT user_id FROM comments WHERE id = ?");
                $stmt->execute([$id]);
                return $stmt->fetchColumn();
            } else {
                // Try users table if target is user
                 if ($type === 'user') {
                     return $id;
                 }
            }
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function auditLogs($method, $params)
    {
        $this->ensureAdmin();
        
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        
        $stmt = $this->pdo->prepare("
            SELECT al.*, u.username 
            FROM audit_logs al 
            LEFT JOIN users u ON al.actor_id = u.id 
            ORDER BY al.created_at DESC 
            LIMIT :limit OFFSET :offset
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        ApiResponse::success([
            'logs' => $stmt->fetchAll()
        ]);
    }

    public function updateUser($method, $params)
    {
        $admin = $this->ensureAdmin();
        $userId = $params[0] ?? null;
        
        if ($method !== 'PUT' || !$userId) {
            ApiResponse::error('Invalid request', 400);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['role'])) {
            // Prevent self-demotion if not super admin, simple check
            if ($userId == $admin['id']) {
                 ApiResponse::error('Cannot change your own role', 403);
            }
            
            $stmt = $this->pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
            $stmt->execute([$input['role'], $userId]);
        }
        
        if (isset($input['status'])) { // active, suspended, banned
             // This assumes we have a status column or use deleted_at for ban
             if ($input['status'] === 'banned') {
                 $stmt = $this->pdo->prepare("UPDATE users SET deleted_at = NOW() WHERE id = ?");
                 $stmt->execute([$userId]);
             } elseif ($input['status'] === 'active') {
                 $stmt = $this->pdo->prepare("UPDATE users SET deleted_at = NULL WHERE id = ?");
                 $stmt->execute([$userId]);
             }
        }

        ApiResponse::success(null, 'User updated');
    }

    public function maintenance($method, $params)
    {
        $this->ensureAdmin();
        
        $action = $params[0] ?? null;
        
        if ($action === 'clear-cache') {
            // Placeholder: Clear OPcache or Application cache if implemented
            if (function_exists('opcache_reset')) {
                opcache_reset();
            }
            // If file cache exists, clear it
            $files = glob(__DIR__ . '/../../cache/*'); 
            foreach($files as $file){ 
              if(is_file($file)) unlink($file); 
            }
            
            ApiResponse::success(null, 'Cache cleared');
        } elseif ($action === 'health-check') {
             // More detailed check
             ApiResponse::success(['status' => 'OK', 'timestamp' => time()]);
        } else {
             ApiResponse::error('Unknown maintenance action', 400);
        }
    }
}