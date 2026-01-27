<?php

namespace App\Controllers\Api;

use PDO;
use App\Services\AnalysisService;
use App\Repositories\SnippetRepository;
use App\Repositories\UserRepository;
use App\Repositories\RoleRepository;
use App\Helpers\ApiResponse;
use App\Helpers\ValidationHelper;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Models\Snippet;
use App\Models\User;

class AnalysisController
{
    private PDO $db;
    private AnalysisService $analysisService;
    private AuthMiddleware $auth;
    private UserRepository $userRepository; // Needed for RoleMiddleware constructor
    private RoleMiddleware $roleMiddleware;

    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->userRepository = new UserRepository($db);
        $this->auth = new AuthMiddleware($db);
        $this->roleMiddleware = new RoleMiddleware($this->userRepository, new RoleRepository($db));
        $this->analysisService = new AnalysisService(
            new SnippetRepository($db),
            $this->userRepository,
            $this->roleMiddleware
        );
    }

    public function analyze(string $method, array $params): void
    {
        if ($method !== 'POST') {
            ApiResponse::error('Method not allowed', 405);
        }

        $currentUser = $this->auth->handle(); // Authenticated user is required for analysis
        $snippetId = (int)($params[0] ?? 0);
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            ApiResponse::error('Invalid JSON input', 400);
        }

        try {
            ValidationHelper::validateRequired($input, ['code', 'language']);
            $analysisResult = $this->analysisService->analyzeCode(
                $input['code'], 
                $input['language'], 
                $currentUser, 
                $snippetId
            );
            ApiResponse::success($analysisResult, 'Analysis completed successfully');

        } catch (\App\Exceptions\ValidationException $e) {
            ApiResponse::error($e->getMessage(), 422, $e->getErrors());
        } catch (\App\Exceptions\UnauthorizedException $e) {
            ApiResponse::error($e->getMessage(), 403);
        } catch (\App\Exceptions\NotFoundException $e) {
            ApiResponse::error($e->getMessage(), 404);
        } catch (\Exception $e) {
            ApiResponse::error('Analysis failed: ' . $e->getMessage(), 500);
        }
    }

    public function snippet(string $method, array $params): void
    {
        if ($method !== 'GET') {
            ApiResponse::error('Method not allowed', 405);
        }

        $snippetId = (int)($params[0] ?? 0);
        if ($snippetId <= 0) {
            ApiResponse::error('Invalid snippet ID', 400);
        }

        $currentUser = $this->auth->optional();

        try {
            $analysis = $this->analysisService->getSnippetAnalysis($snippetId, $currentUser);
            ApiResponse::success($analysis);
        } catch (\App\Exceptions\UnauthorizedException $e) {
            ApiResponse::error($e->getMessage(), 403);
        } catch (\App\Exceptions\NotFoundException $e) {
            ApiResponse::error($e->getMessage(), 404);
        } catch (\Exception $e) {
            ApiResponse::error('Failed to fetch analysis: ' . $e->getMessage(), 500);
        }
    }

    public function batch(string $method, array $params): void
    {
        if ($method !== 'POST') {
            ApiResponse::error('Method not allowed', 405);
        }

        $currentUser = $this->auth->handle(); // Authenticated user is required for batch analysis
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['snippet_ids']) || !is_array($input['snippet_ids'])) {
            ApiResponse::error('Invalid JSON input: array of snippet_ids required', 400);
        }

        try {
            $results = $this->analysisService->performBatchAnalysis($input['snippet_ids'], $currentUser);
            ApiResponse::success($results, 'Batch analysis completed');
        } catch (\App\Exceptions\UnauthorizedException $e) {
            ApiResponse::error($e->getMessage(), 403);
        } catch (\Exception $e) {
            ApiResponse::error('Batch analysis failed: ' . $e->getMessage(), 500);
        }
    }

    public function reanalyze(string $method, array $params): void
    {
        if ($method !== 'POST') {
            ApiResponse::error('Method not allowed', 405);
        }

        $snippetId = (int)($params[0] ?? 0);
        if ($snippetId <= 0) {
            ApiResponse::error('Invalid snippet ID', 400);
        }

        $currentUser = $this->auth->handle(); // Authenticated user is required for reanalysis

        try {
            $analysisResult = $this->analysisService->reanalyzeSnippet($snippetId, $currentUser);
            ApiResponse::success($analysisResult, 'Reanalysis completed successfully');
        } catch (\App\Exceptions\UnauthorizedException $e) {
            ApiResponse::error($e->getMessage(), 403);
        } catch (\App\Exceptions\NotFoundException $e) {
            ApiResponse::error($e->getMessage(), 404);
        } catch (\Exception $e) {
            ApiResponse::error('Reanalysis failed: ' . $e->getMessage(), 500);
        }
    }
}