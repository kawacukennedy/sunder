<?php

namespace App\Repositories;

use PDO;

class NotificationRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function create(array $data): int
    {
        $sql = "
            INSERT INTO notifications (
                user_id, type, title, message, data, created_at, is_read
            ) VALUES (
                :user_id, :type, :title, :message, :data, NOW(), 0
            )
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':user_id' => $data['user_id'],
            ':type' => $data['type'] ?? 'info',
            ':title' => $data['title'],
            ':message' => $data['message'],
            ':data' => $data['data'] ?? null
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findByUserId(int $userId, int $limit = 20, int $offset = 0): array
    {
        $sql = "
            SELECT * FROM notifications 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':user_id' => $userId,
            ':limit' => $limit,
            ':offset' => $offset
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsRead(int $id, int $userId): bool
    {
        $sql = "UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id, ':user_id' => $userId]);
    }

    public function markAllAsRead(int $userId): bool
    {
        $sql = "UPDATE notifications SET is_read = 1 WHERE user_id = :user_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':user_id' => $userId]);
    }

    public function getUnreadCount(int $userId): int
    {
        $sql = "SELECT COUNT(*) FROM notifications WHERE user_id = :user_id AND is_read = 0";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        return (int) $stmt->fetchColumn();
    }
}
