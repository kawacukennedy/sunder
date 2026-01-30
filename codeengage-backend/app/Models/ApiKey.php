<?php

namespace App\Models;

use PDO;

class ApiKey
{
    private ?int $id = null;
    private int $userId;
    private string $name;
    private string $keyHash;
    private ?string $lastUsedAt = null;
    private ?string $expiresAt = null;
    private ?string $createdAt = null;
    private ?string $deletedAt = null;

    // Getters
    public function getId(): ?int { return $this->id; }
    public function getUserId(): int { return $this->userId; }
    public function getName(): string { return $this->name; }
    public function getKeyHash(): string { return $this->keyHash; }
    public function getLastUsedAt(): ?string { return $this->lastUsedAt; }
    public function getExpiresAt(): ?string { return $this->expiresAt; }
    public function getCreatedAt(): ?string { return $this->createdAt; }
    public function getDeletedAt(): ?string { return $this->deletedAt; }

    // Setters
    public function setId(int $id): self { $this->id = $id; return $this; }
    public function setUserId(int $userId): self { $this->userId = $userId; return $this; }
    public function setName(string $name): self { $this->name = $name; return $this; }
    public function setKeyHash(string $keyHash): self { $this->keyHash = $keyHash; return $this; }
    public function setLastUsedAt(?string $date): self { $this->lastUsedAt = $date; return $this; }
    public function setExpiresAt(?string $date): self { $this->expiresAt = $date; return $this; }
    public function setCreatedAt(string $createdAt): self { $this->createdAt = $createdAt; return $this; }
    public function setDeletedAt(?string $deletedAt): self { $this->deletedAt = $deletedAt; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'name' => $this->name,
            'last_used_at' => $this->lastUsedAt,
            'expires_at' => $this->expiresAt,
            'created_at' => $this->createdAt
        ];
    }

    public static function fromData(array $data): self
    {
        $key = new self();
        if (isset($data['id'])) $key->setId((int)$data['id']);
        if (isset($data['user_id'])) $key->setUserId((int)$data['user_id']);
        if (isset($data['name'])) $key->setName($data['name']);
        if (isset($data['key_hash'])) $key->setKeyHash($data['key_hash']);
        if (isset($data['last_used_at'])) $key->setLastUsedAt($data['last_used_at']);
        if (isset($data['expires_at'])) $key->setExpiresAt($data['expires_at']);
        if (isset($data['created_at'])) $key->setCreatedAt($data['created_at']);
        if (isset($data['deleted_at'])) $key->setDeletedAt($data['deleted_at']);
        return $key;
    }
}
