<?php

namespace App\Repositories;

use PDO;
use App\Models\CodeAnalysis;
use App\Exceptions\NotFoundException;
use App\Exceptions\ValidationException;

class AnalysisRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function findById(int $id): ?CodeAnalysis
    {
        return CodeAnalysis::findById($this->db, $id);
    }

    public function findByVersion(int $snippetVersionId): ?CodeAnalysis
    {
        $sql = "
            SELECT ca.* FROM code_analyses ca
            WHERE ca.snippet_version_id = :snippet_version_id
            ORDER BY ca.created_at DESC
            LIMIT 1
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':snippet_version_id' => $snippetVersionId]);
        $data = $stmt->fetch();
        
        return $data ? CodeAnalysis::fromData($this->db, $data) : null;
    }

    public function findByType(string $analysisType, int $limit = 50, int $offset = 0): array
    {
        $sql = "
            SELECT ca.*, sv.code, s.language, s.title as snippet_title
            FROM code_analyses ca
            JOIN snippet_versions sv ON ca.snippet_version_id = sv.id
            JOIN snippets s ON sv.snippet_id = s.id
            WHERE ca.analysis_type = :analysis_type
            ORDER BY ca.created_at DESC
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':analysis_type' => $analysisType,
            ':limit' => $limit,
            ':offset' => $offset
        ]);

        $analyses = [];
        while ($data = $stmt->fetch()) {
            $analyses[] = CodeAnalysis::fromData($this->db, $data);
        }

        return $analyses;
    }

    public function create(array $data): CodeAnalysis
    {
        if (empty($data['snippet_version_id'])) {
            throw new ValidationException('Snippet version ID is required');
        }

        if (empty($data['analysis_type'])) {
            throw new ValidationException('Analysis type is required');
        }

        $sql = "
            INSERT INTO code_analyses (
                snippet_version_id, analysis_type, complexity_score,
                security_issues, performance_suggestions, code_smells
            ) VALUES (
                :snippet_version_id, :analysis_type, :complexity_score,
                :security_issues, :performance_suggestions, :code_smells
            )
        ";

        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            ':snippet_version_id' => $data['snippet_version_id'],
            ':analysis_type' => $data['analysis_type'],
            ':complexity_score' => $data['complexity_score'] ?? null,
            ':security_issues' => $data['security_issues'] ?? json_encode([]),
            ':performance_suggestions' => $data['performance_suggestions'] ?? json_encode([]),
            ':code_smells' => $data['code_smells'] ?? json_encode([])
        ]);

        if (!$result) {
            throw new \Exception('Failed to create code analysis');
        }

        return $this->findById($this->db->lastInsertId());
    }

    public function update(int $id, array $data): CodeAnalysis
    {
        $analysis = $this->findById($id);
        if (!$analysis) {
            throw new NotFoundException('Code analysis');
        }

        $updateData = [];

        if (isset($data['complexity_score'])) {
            $updateData['complexity_score'] = $data['complexity_score'];
        }

        if (isset($data['security_issues'])) {
            $updateData['security_issues'] = is_array($data['security_issues']) 
                ? json_encode($data['security_issues']) 
                : $data['security_issues'];
        }

        if (isset($data['performance_suggestions'])) {
            $updateData['performance_suggestions'] = is_array($data['performance_suggestions'])
                ? json_encode($data['performance_suggestions'])
                : $data['performance_suggestions'];
        }

        if (isset($data['code_smells'])) {
            $updateData['code_smells'] = is_array($data['code_smells'])
                ? json_encode($data['code_smells'])
                : $data['code_smells'];
        }

        if (empty($updateData)) {
            return $analysis;
        }

        $setClause = [];
        foreach ($updateData as $key => $value) {
            $setClause[] = "{$key} = :{$key}";
        }

        $sql = "UPDATE code_analyses SET " . implode(', ', $setClause) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        
        foreach ($updateData as $key => $value) {
            $stmt->bindValue(":{$key}", $value);
        }
        $stmt->bindValue(':id', $id);
        
        if (!$stmt->execute()) {
            throw new \Exception('Failed to update code analysis');
        }

        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $sql = "DELETE FROM code_analyses WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    public function deleteByVersion(int $snippetVersionId): bool
    {
        $sql = "DELETE FROM code_analyses WHERE snippet_version_id = :snippet_version_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':snippet_version_id' => $snippetVersionId]);
    }

    public function findBySnippet(int $snippetId, ?string $analysisType = null): array
    {
        $sql = "
            SELECT ca.*, sv.version_number, sv.created_at as version_created_at
            FROM code_analyses ca
            JOIN snippet_versions sv ON ca.snippet_version_id = sv.id
            WHERE sv.snippet_id = :snippet_id
        ";

        $params = [':snippet_id' => $snippetId];

        if ($analysisType) {
            $sql .= " AND ca.analysis_type = :analysis_type";
            $params[':analysis_type'] = $analysisType;
        }

        $sql .= " ORDER BY sv.version_number DESC, ca.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $analyses = [];
        while ($data = $stmt->fetch()) {
            $analyses[] = CodeAnalysis::fromData($this->db, $data);
        }

        return $analyses;
    }

    public function findByUser(int $userId, ?string $analysisType = null, int $limit = 20, int $offset = 0): array
    {
        $sql = "
            SELECT ca.*, s.title as snippet_title, s.language
            FROM code_analyses ca
            JOIN snippet_versions sv ON ca.snippet_version_id = sv.id
            JOIN snippets s ON sv.snippet_id = s.id
            WHERE s.author_id = :user_id
        ";

        $params = [':user_id' => $userId];

        if ($analysisType) {
            $sql .= " AND ca.analysis_type = :analysis_type";
            $params[':analysis_type'] = $analysisType;
        }

        $sql .= " ORDER BY ca.created_at DESC LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $analyses = [];
        while ($data = $stmt->fetch()) {
            $analyses[] = CodeAnalysis::fromData($this->db, $data);
        }

        return $analyses;
    }

    public function getStatistics(?string $dateFrom = null, ?string $dateTo = null): array
    {
        $sql = "
            SELECT 
                analysis_type,
                COUNT(*) as total_analyses,
                AVG(complexity_score) as avg_complexity,
                MIN(created_at) as first_analysis,
                MAX(created_at) as last_analysis
            FROM code_analyses
        ";

        $params = [];
        $whereClause = [];

        if ($dateFrom) {
            $whereClause[] = "created_at >= :date_from";
            $params[':date_from'] = $dateFrom;
        }

        if ($dateTo) {
            $whereClause[] = "created_at <= :date_to";
            $params[':date_to'] = $dateTo;
        }

        if (!empty($whereClause)) {
            $sql .= " WHERE " . implode(" AND ", $whereClause);
        }

        $sql .= " GROUP BY analysis_type ORDER BY total_analyses DESC";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTopComplexityScores(int $limit = 10): array
    {
        $sql = "
            SELECT 
                ca.*,
                s.title as snippet_title,
                s.language,
                u.username as author_username
            FROM code_analyses ca
            JOIN snippet_versions sv ON ca.snippet_version_id = sv.id
            JOIN snippets s ON sv.snippet_id = s.id
            JOIN users u ON s.author_id = u.id
            WHERE ca.complexity_score IS NOT NULL
            ORDER BY ca.complexity_score DESC
            LIMIT :limit
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        $analyses = [];
        while ($data = $stmt->fetch()) {
            $analyses[] = CodeAnalysis::fromData($this->db, $data);
        }

        return $analyses;
    }

    public function search(array $filters = [], int $limit = 20, int $offset = 0): array
    {
        $sql = "
            SELECT ca.*, s.title as snippet_title, s.language, u.username as author_username
            FROM code_analyses ca
            JOIN snippet_versions sv ON ca.snippet_version_id = sv.id
            JOIN snippets s ON sv.snippet_id = s.id
            JOIN users u ON s.author_id = u.id
            WHERE 1=1
        ";

        $params = [];

        if (!empty($filters['analysis_type'])) {
            $sql .= " AND ca.analysis_type = :analysis_type";
            $params[':analysis_type'] = $filters['analysis_type'];
        }

        if (!empty($filters['language'])) {
            $sql .= " AND s.language = :language";
            $params[':language'] = $filters['language'];
        }

        if (!empty($filters['author_id'])) {
            $sql .= " AND s.author_id = :author_id";
            $params[':author_id'] = $filters['author_id'];
        }

        if (!empty($filters['complexity_min'])) {
            $sql .= " AND ca.complexity_score >= :complexity_min";
            $params[':complexity_min'] = $filters['complexity_min'];
        }

        if (!empty($filters['complexity_max'])) {
            $sql .= " AND ca.complexity_score <= :complexity_max";
            $params[':complexity_max'] = $filters['complexity_max'];
        }

        if (!empty($filters['date_from'])) {
            $sql .= " AND ca.created_at >= :date_from";
            $params[':date_from'] = $filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $sql .= " AND ca.created_at <= :date_to";
            $params[':date_to'] = $filters['date_to'];
        }

        $sql .= " ORDER BY ca.created_at DESC LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $analyses = [];
        while ($data = $stmt->fetch()) {
            $analyses[] = CodeAnalysis::fromData($this->db, $data);
        }

        return $analyses;
    }

    public function count(array $filters = []): int
    {
        $sql = "
            SELECT COUNT(*) as total
            FROM code_analyses ca
            JOIN snippet_versions sv ON ca.snippet_version_id = sv.id
            JOIN snippets s ON sv.snippet_id = s.id
            WHERE 1=1
        ";

        $params = [];

        if (!empty($filters['analysis_type'])) {
            $sql .= " AND ca.analysis_type = :analysis_type";
            $params[':analysis_type'] = $filters['analysis_type'];
        }

        if (!empty($filters['language'])) {
            $sql .= " AND s.language = :language";
            $params[':language'] = $filters['language'];
        }

        if (!empty($filters['author_id'])) {
            $sql .= " AND s.author_id = :author_id";
            $params[':author_id'] = $filters['author_id'];
        }

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        return (int) $stmt->fetch()['total'];
    }
}