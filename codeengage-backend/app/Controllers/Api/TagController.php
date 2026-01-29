<?php

namespace App\Controllers\Api;

use App\Repositories\TagRepository;
use App\Helpers\ApiResponse;
use PDO;

class TagController
{
    private $tagRepository;

    public function __construct(PDO $pdo)
    {
        $this->tagRepository = new TagRepository($pdo);
    }

    public function index($method, $params)
    {
        if ($method !== 'GET') {
            ApiResponse::error('Method not allowed', 405);
        }

        $filters = [
            'search' => $_GET['search'] ?? null,
            'usage_min' => $_GET['usage_min'] ?? 0
        ];

        $tags = $this->tagRepository->findMany($filters);
        // Serialize tags
        $data = array_map(fn($tag) => $tag->toArray(), $tags);
        
        ApiResponse::success($data);
    }

    public function popular($method, $params)
    {
        if ($method !== 'GET') {
            ApiResponse::error('Method not allowed', 405);
        }

        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $tags = $this->tagRepository->findPopular($limit);
        
        // Serialize tags
        $data = array_map(fn($tag) => $tag->toArray(), $tags);
        
        ApiResponse::success($data);
    }

    public function __call($name, $arguments)
    {
        ApiResponse::error('Action not found: ' . $name, 404);
    }
}
