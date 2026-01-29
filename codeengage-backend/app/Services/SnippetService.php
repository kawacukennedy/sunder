<?php

namespace App\Services;

use App\Models\Snippet;
use App\Helpers\ApiResponse;

class SnippetService
{
    private $snippetModel;

    public function getById($id) {
        return $this->get($id);
    }

    public function __construct($pdo)
    {
        $this->snippetModel = new Snippet($pdo);
    }

    public function create(array $data, $userId)
    {
        if (empty($data['title']) || empty($data['code']) || empty($data['language'])) {
            ApiResponse::error('Missing required fields', 422);
        }

        $data['author_id'] = $userId;
        
        try {
            // Start transaction
            // Only hypothetical here as I'm not accessing PDO object directly to beginTransaction
            // But usually model calls should be wrapped.
            
            $snippetId = $this->snippetModel->create($data);
            $this->snippetModel->createVersion($snippetId, $data['code'], $userId, 1);
            
            return $this->get($snippetId);
            
        } catch (\Exception $e) {
            ApiResponse::error('Failed to create snippet: ' . $e->getMessage(), 500);
        }
    }

    public function list($filters)
    {
        return $this->snippetModel->findAll($filters);
    }

    public function get($id)
    {
        $snippet = $this->snippetModel->findById($id);
        if (!$snippet) {
            ApiResponse::error('Snippet not found', 404);
        }
        
        $version = $this->snippetModel->getLatestVersion($id);
        $snippet['code'] = $version ? $version['code'] : '';
        $snippet['version'] = $version ? $version['version_number'] : 0;
        
        return $snippet;
    }
    public function update($id, array $data, $userId)
    {
        $snippet = $this->get($id);
        if ($snippet['author_id'] != $userId) {
            ApiResponse::error('Unauthorized to update this snippet', 403);
        }

        $this->snippetModel->update($id, $data);
        
        if (!empty($data['code'])) {
            $newVersionNumber = $snippet['version'] + 1;
            $this->snippetModel->createVersion($id, $data['code'], $userId, $newVersionNumber);
        }
        
        return $this->get($id);
    }

    public function delete($id, $userId)
    {
        $snippet = $this->get($id);
        if ($snippet['author_id'] != $userId) {
            ApiResponse::error('Unauthorized to delete this snippet', 403);
        }

        return $this->snippetModel->delete($id);
    }

    public function star($id, $userId)
    {
        return $this->snippetModel->star($id, $userId);
    }

    public function unstar($id, $userId)
    {
        return $this->snippetModel->unstar($id, $userId);
    }

    public function fork($id, $userId, $newTitle = null)
    {
        $original = $this->get($id);
        $forkData = [
            'author_id' => $userId,
            'title' => $newTitle ?? "Fork of " . $original['title'],
            'description' => $original['description'],
            'visibility' => 'public',
            'language' => $original['language'],
            'code' => $original['code'],
            'forked_from_id' => $id
        ];
        
        return $this->create($forkData, $userId);
    }

    public function getVersions($id)
    {
        return $this->snippetModel->getAllVersions($id);
    }
}