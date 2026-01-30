<?php

namespace App\Repositories;

use PDO;
use App\Models\ApiKey;

class ApiKeyRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function create(int $userId, string $name, string $plainKey): ApiKey
    {
        $keyHash = hash('sha256', $plainKey);
        
        $sql = "INSERT INTO api_keys (user_id, name, key_hash) VALUES (:user_id, :name, :key_hash)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':user_id' => $userId,
            ':name' => $name,
            ':key_hash' => $keyHash
        ]);

        $id = (int)$this->db->lastInsertId();
        return $this->findById($id);
    }

    public function findById(int $id): ?ApiKey
    {
        $stmt = $this->db->prepare("SELECT * FROM api_keys WHERE id = :id AND deleted_at IS NULL");
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data ? ApiKey::fromData($data) : null;
    }

    public function findByUserId(int $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM api_keys WHERE user_id = :user_id AND deleted_at IS NULL ORDER BY created_at DESC");
        $stmt->execute([':user_id' => $userId]);
        
        $keys = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $keys[] = ApiKey::fromData($data);
        }
        return $keys;
    }

    public function findByKey(string $plainKey): ?ApiKey
    {
        $keyHash = hash('sha256', $plainKey);
        
        $stmt = $this->db->prepare("SELECT * FROM api_keys WHERE key_hash = :key_hash AND deleted_at IS NULL");
        $stmt->execute([':key_hash' => $keyHash]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data ? ApiKey::fromData($data) : null;
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = $this->db->prepare("UPDATE api_keys SET deleted_at = NOW() WHERE id = :id AND user_id = :user_id");
        return $stmt->execute([':id' => $id, ':user_id' => $userId]);
    }

    public function updateLastUsed(int $id): void
    {
        $stmt = $this->db->prepare("UPDATE api_keys SET last_used_at = NOW() WHERE id = :id");
        $stmt->execute([':id' => $id]);
    }
}
