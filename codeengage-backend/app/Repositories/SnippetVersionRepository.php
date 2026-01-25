<?php

namespace App\Repositories;

use PDO;
use App\Models\SnippetVersion;
use App\Exceptions\NotFoundException;
use App\Exceptions\ValidationException;

class SnippetVersionRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?SnippetVersion
    {
        return SnippetVersion::findById($this->db, $id);
    }

    public function findBySnippet(int $snippetId, int $limit = 50): array
    {
        return SnippetVersion::findBySnippet($this->db, $snippetId, $limit);
    }

    public function getLatestVersion(int $snippetId): ?SnippetVersion
    {
        $sql = "
            SELECT * FROM snippet_versions 
            WHERE snippet_id = :snippet_id 
            ORDER BY version_number DESC 
            LIMIT 1
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':snippet_id' => $snippetId]);
        $data = $stmt->fetch();
        
        return $data ? SnippetVersion::fromData($this->db, $data) : null;
    }

    public function create(array $data): SnippetVersion
    {
        $sql = "
            INSERT INTO snippet_versions (
                snippet_id, version_number, code, checksum, editor_id, change_summary
            ) VALUES (
                :snippet_id, :version_number, :code, :checksum, :editor_id, :change_summary
            )
        ";

        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            ':snippet_id' => $data['snippet_id'],
            ':version_number' => $data['version_number'],
            ':code' => $data['code'],
            ':checksum' => $data['checksum'],
            ':editor_id' => $data['editor_id'],
            ':change_summary' => $data['change_summary'] ?? null
        ]);

        if (!$result) {
            throw new \Exception('Failed to create snippet version');
        }

        return $this->findById($this->db->lastInsertId());
    }

    public function getVersionsBySnippet(int $snippetId, int $limit = 50, int $offset = 0): array
    {
        $sql = "
            SELECT sv.*, u.username as editor_username, u.display_name as editor_display_name
            FROM snippet_versions sv
            LEFT JOIN users u ON sv.editor_id = u.id
            WHERE sv.snippet_id = :snippet_id
            ORDER BY sv.version_number DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':snippet_id' => $snippetId,
            ':limit' => $limit,
            ':offset' => $offset
        ]);

        $versions = [];
        while ($data = $stmt->fetch()) {
            $version = SnippetVersion::fromData($this->db, $data);
            $versions[] = $version;
        }

        return $versions;
    }

    public function countBySnippet(int $snippetId): int
    {
        $sql = "SELECT COUNT(*) FROM snippet_versions WHERE snippet_id = :snippet_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':snippet_id' => $snippetId]);
        
        return (int) $stmt->fetchColumn();
    }

    public function findByEditor(int $editorId, int $limit = 20, int $offset = 0): array
    {
        $sql = "
            SELECT sv.*, s.title as snippet_title, s.language as snippet_language
            FROM snippet_versions sv
            JOIN snippets s ON sv.snippet_id = s.id
            WHERE sv.editor_id = :editor_id
            ORDER BY sv.created_at DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':editor_id' => $editorId,
            ':limit' => $limit,
            ':offset' => $offset
        ]);

        $versions = [];
        while ($data = $stmt->fetch()) {
            $versions[] = SnippetVersion::fromData($this->db, $data);
        }

        return $versions;
    }

    public function findByChecksum(string $checksum): ?SnippetVersion
    {
        $sql = "SELECT * FROM snippet_versions WHERE checksum = :checksum LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':checksum' => $checksum]);
        $data = $stmt->fetch();
        
        return $data ? SnippetVersion::fromData($this->db, $data) : null;
    }

    public function delete(int $id): bool
    {
        $sql = "DELETE FROM snippet_versions WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    public function deleteBySnippet(int $snippetId): bool
    {
        $sql = "DELETE FROM snippet_versions WHERE snippet_id = :snippet_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':snippet_id' => $snippetId]);
    }

    public function searchCode(string $query, int $limit = 20, int $offset = 0): array
    {
        $sql = "
            SELECT sv.*, s.title as snippet_title, s.language as snippet_language, s.author_id
            FROM snippet_versions sv
            JOIN snippets s ON sv.snippet_id = s.id
            WHERE MATCH(sv.code) AGAINST(:query IN NATURAL LANGUAGE MODE)
            AND s.visibility = 'public'
            AND s.deleted_at IS NULL
            ORDER BY MATCH(sv.code) AGAINST(:query IN NATURAL LANGUAGE MODE) DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':query' => $query,
            ':limit' => $limit,
            ':offset' => $offset
        ]);

        $versions = [];
        while ($data = $stmt->fetch()) {
            $versions[] = SnippetVersion::fromData($this->db, $data);
        }

        return $versions;
    }

    public function getStatistics(int $snippetId): array
    {
        $sql = "
            SELECT 
                COUNT(*) as total_versions,
                MIN(created_at) as first_version,
                MAX(created_at) as last_version,
                AVG(CHAR_LENGTH(code)) as avg_code_length
            FROM snippet_versions 
            WHERE snippet_id = :snippet_id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':snippet_id' => $snippetId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}