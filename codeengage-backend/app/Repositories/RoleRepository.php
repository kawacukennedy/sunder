<?php

namespace App\Repositories;

use PDO;

class RoleRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM roles WHERE id = ?");
        $stmt->execute([$id]);
        $role = $stmt->fetch();
        return $role ?: null;
    }

    public function findByName(string $name): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM roles WHERE name = ?");
        $stmt->execute([$name]);
        $role = $stmt->fetch();
        return $role ?: null;
    }

    public function getRolePermissions(int $roleId): array
    {
        $stmt = $this->db->prepare("
            SELECT p.* 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
        ");
        $stmt->execute([$roleId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare("
            INSERT INTO roles (name, description, is_system_role) 
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([
            $data['name'],
            $data['description'] ?? null,
            $data['is_system_role'] ?? false
        ]);

        $id = $this->db->lastInsertId();
        return $this->findById($id);
    }
}
