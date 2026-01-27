<?php

namespace App\Controllers\Api;

use PDO;
use App\Repositories\SnippetRepository;
use App\Repositories\UserRepository;
use App\Repositories\RoleRepository;
use App\Helpers\ApiResponse;
use App\Helpers\ValidationHelper;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Models\Snippet;
use App\Models\User;

class SnippetController
{
    private PDO $db;
    private SnippetRepository $snippetRepository;
    private AuthMiddleware $auth;
    private RoleMiddleware $roleMiddleware;
    private UserRepository $userRepository; // Added for isMemberOfOrganization

    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->userRepository = new UserRepository($db); // Initialize UserRepository
        $this->snippetRepository = new SnippetRepository($db);
        $this->auth = new AuthMiddleware($db);
        $this->roleMiddleware = new RoleMiddleware($this->userRepository, new RoleRepository($db));
    }

    public function index(string $method, array $params): void
    {
        if ($method !== 'GET') {
            ApiResponse::error('Method not allowed', 405);
        }

        try {
            $currentUser = $this->auth->optional();
            $filters = [
                'search' => $_GET['search'] ?? null,
                'language' => $_GET['language'] ?? null,
                'author_id' => $_GET['author_id'] ?? null,
                'visibility' => $_GET['visibility'] ?? null,
                'order_by' => $_GET['order_by'] ?? 'created_at',
                'order' => $_GET['order'] ?? 'DESC',
                'user_id' => $currentUser?->getId()
            ];

            $limit = (int)($_GET['limit'] ?? 20);
            $offset = (int)($_GET['offset'] ?? 0);

            $snippets = $this->snippetRepository->findMany($filters, $limit, $offset);
            $total = $this->snippetRepository->count($filters);
            
            $processedSnippets = array_map(function($snippet) use ($currentUser) {
                $snippetArray = $snippet->toArray();
                $snippetArray['is_starred'] = $currentUser ? $this->snippetRepository->isStarredByUser($snippet->getId(), $currentUser->getId()) : false;
                return $snippetArray;
            }, $snippets);


            ApiResponse::paginated($processedSnippets, $total, $offset / $limit + 1, $limit);

        } catch (\Exception $e) {
            ApiResponse::error('Failed to fetch snippets: ' . $e->getMessage());
        }
    }

    public function show(string $method, array $params): void
    {
        if ($method !== 'GET') {
            ApiResponse::error('Method not allowed', 405);
        }

        $id = (int)($params[0] ?? 0);
        if ($id <= 0) {
            ApiResponse::error('Invalid snippet ID');
        }

        try {
            $snippet = $this->snippetRepository->findById($id);
            if (!$snippet) {
                ApiResponse::error('Snippet not found', 404);
            }

            $currentUser = $this->auth->optional();

            // Check visibility permissions
            if (!$this->canViewSnippet($snippet, $currentUser)) {
                ApiResponse::error('Access denied', 403);
            }

            // Increment view count for non-owners
            if (!$currentUser || $currentUser->getId() !== $snippet->getAuthorId()) {
                $this->snippetRepository->incrementViewCount($id);
            }

            // Load additional data
            $snippet->loadAuthor();
            $snippet->loadTags();
            $snippet->loadVersions();

            ApiResponse::success([
                'snippet' => $snippet->toArray(),
                'versions' => array_map(fn($v) => $v->toArray(), $snippet->getVersions()),
                'tags' => array_map(fn($t) => $t->toArray(), $snippet->getTags()),
                'can_edit' => $this->canEditSnippet($snippet, $currentUser),
                'can_fork' => (bool)$currentUser,
                'is_starred' => $currentUser ? $this->snippetRepository->isStarredByUser($snippet->getId(), $currentUser->getId()) : false,
            ]);

        } catch (\Exception $e) {
            ApiResponse::error('Failed to fetch snippet: ' . $e->getMessage());
        }
    }

    public function store(string $method, array $params): void
    {
        if ($method !== 'POST') {
            ApiResponse::error('Method not allowed', 405);
        }

        $currentUser = $this->auth->handle(); // Requires authentication
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            ApiResponse::error('Invalid JSON input');
        }

        try {
            ValidationHelper::validateRequired($input, ['title', 'language', 'code']);
            ValidationHelper::validateLength($input['title'], 1, 255, 'title');
            ValidationHelper::validateEnum($input['visibility'] ?? 'public', ['public', 'private', 'organization'], 'visibility');

            // Check permission to create organization snippet
            if (($input['visibility'] ?? 'public') === 'organization') {
                if (!isset($input['organization_id'])) {
                    ApiResponse::error('organization_id is required for organization visibility', 422);
                }
                if (!$this->userRepository->isMemberOfOrganization($currentUser->getId(), $input['organization_id'])) {
                    ApiResponse::error('Not a member of the specified organization', 403);
                }
            }

            $snippetData = [
                'title' => $input['title'],
                'description' => $input['description'] ?? null,
                'visibility' => $input['visibility'] ?? 'public',
                'language' => $input['language'],
                'author_id' => $currentUser->getId(),
                'organization_id' => $input['organization_id'] ?? null,
                'is_template' => $input['is_template'] ?? false,
                'template_variables' => $input['template_variables'] ?? null,
                'tags' => $input['tags'] ?? []
            ];

            $snippet = $this->snippetRepository->create($snippetData, $input['code']);

            ApiResponse::success($snippet->toArray(), 'Snippet created successfully');

        } catch (\App\Exceptions\ValidationException $e) {
            ApiResponse::error($e->getMessage(), 422, $e->getErrors());
        } catch (\Exception $e) {
            ApiResponse::error('Failed to create snippet: ' . $e->getMessage());
        }
    }

    public function update(string $method, array $params): void
    {
        if ($method !== 'PUT') {
            ApiResponse::error('Method not allowed', 405);
        }

        $currentUser = $this->auth->handle(); // Requires authentication
        $id = (int)($params[0] ?? 0);
        if ($id <= 0) {
            ApiResponse::error('Invalid snippet ID');
        }

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            ApiResponse::error('Invalid JSON input');
        }

        try {
            $snippet = $this->snippetRepository->findById($id);
            if (!$snippet) {
                ApiResponse::error('Snippet not found', 404);
            }

            // Check edit permissions
            if (!$this->canEditSnippet($snippet, $currentUser)) {
                ApiResponse::error('Access denied', 403);
            }

            $updateData = [];
            $allowedFields = ['title', 'description', 'visibility', 'language', 'is_template', 'template_variables', 'tags', 'organization_id'];

            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $updateData[$field] = $input[$field];
                }
            }
            
            // If changing to organization visibility, check membership
            if (isset($updateData['visibility']) && $updateData['visibility'] === 'organization') {
                if (!isset($updateData['organization_id'])) {
                    // Use existing organization_id if not provided in update
                    $updateData['organization_id'] = $snippet->getOrganizationId();
                }
                if (!$this->userRepository->isMemberOfOrganization($currentUser->getId(), $updateData['organization_id'])) {
                    ApiResponse::error('Not a member of the specified organization', 403);
                }
            }


            $updatedSnippet = $this->snippetRepository->update($id, $updateData, $input['code'] ?? null, $currentUser->getId());

            ApiResponse::success($updatedSnippet->toArray(), 'Snippet updated successfully');

        } catch (\App\Exceptions\ValidationException $e) {
            ApiResponse::error($e->getMessage(), 422, $e->getErrors());
        } catch (\Exception $e) {
            ApiResponse::error('Failed to update snippet: ' . $e->getMessage());
        }
    }

    public function destroy(string $method, array $params): void
    {
        if ($method !== 'DELETE') {
            ApiResponse::error('Method not allowed', 405);
        }

        $currentUser = $this->auth->handle(); // Requires authentication
        $id = (int)($params[0] ?? 0);
        if ($id <= 0) {
            ApiResponse::error('Invalid snippet ID');
        }

        try {
            $snippet = $this->snippetRepository->findById($id);
            if (!$snippet) {
                ApiResponse::error('Snippet not found', 404);
            }

            // Check delete permissions
            if (!$this->canDeleteSnippet($snippet, $currentUser)) {
                ApiResponse::error('Access denied', 403);
            }

            $this->snippetRepository->delete($id);

            ApiResponse::success(null, 'Snippet deleted successfully');

        } catch (\Exception $e) {
            ApiResponse::error('Failed to delete snippet: ' . $e->getMessage());
        }
    }

    public function fork(string $method, array $params): void
    {
        if ($method !== 'POST') {
            ApiResponse::error('Method not allowed', 405);
        }

        $currentUser = $this->auth->handle(); // Requires authentication
        $id = (int)($params[0] ?? 0);
        if ($id <= 0) {
            ApiResponse::error('Invalid snippet ID');
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $title = $input['title'] ?? null;

        try {
            $originalSnippet = $this->snippetRepository->findById($id);
            if (!$originalSnippet) {
                ApiResponse::error('Snippet not found', 404);
            }

            // Check if user can view the original snippet before forking
            if (!$this->canViewSnippet($originalSnippet, $currentUser)) {
                ApiResponse::error('Access denied: Cannot fork a snippet you cannot view', 403);
            }

            $fork = $this->snippetRepository->fork($id, $currentUser->getId(), $title);

            ApiResponse::success($fork->toArray(), 'Snippet forked successfully');

        } catch (\Exception $e) {
            ApiResponse::error('Failed to fork snippet: ' . $e->getMessage());
        }
    }

    public function star(string $method, array $params): void
    {
        if ($method !== 'POST') {
            ApiResponse::error('Method not allowed', 405);
        }

        $currentUser = $this->auth->handle(); // Requires authentication
        $id = (int)($params[0] ?? 0);
        if ($id <= 0) {
            ApiResponse::error('Invalid snippet ID');
        }

        try {
            $snippet = $this->snippetRepository->findById($id);
            if (!$snippet) {
                ApiResponse::error('Snippet not found', 404);
            }
            
            // Check if user can view the snippet
            if (!$this->canViewSnippet($snippet, $currentUser)) {
                ApiResponse::error('Access denied: Cannot star a snippet you cannot view', 403);
            }

            $isStarred = $this->snippetRepository->isStarredByUser($id, $currentUser->getId());

            if ($isStarred) {
                $this->snippetRepository->unstarSnippet($id, $currentUser->getId());
                $message = 'Snippet unstarred successfully';
            } else {
                $this->snippetRepository->starSnippet($id, $currentUser->getId());
                $message = 'Snippet starred successfully';
            }

            ApiResponse::success([
                'snippet_id' => $id,
                'is_starred' => !$isStarred,
                'star_count' => $this->snippetRepository->findById($id)->getStarCount()
            ], $message);

        } catch (\Exception $e) {
            ApiResponse::error('Failed to toggle star status: ' . $e->getMessage());
        }
    }

    public function versions(string $method, array $params): void
    {
        if ($method !== 'GET') {
            ApiResponse::error('Method not allowed', 405);
        }

        $id = (int)($params[0] ?? 0);
        if ($id <= 0) {
            ApiResponse::error('Invalid snippet ID');
        }

        try {
            $snippet = $this->snippetRepository->findById($id);
            if (!$snippet) {
                ApiResponse::error('Snippet not found', 404);
            }

            $currentUser = $this->auth->optional();

            // Check view permissions
            if (!$this->canViewSnippet($snippet, $currentUser)) {
                ApiResponse::error('Access denied', 403);
            }

            $versions = $this->snippetRepository->getVersions($id);

            ApiResponse::success(array_map(fn($v) => $v->toArray(), $versions));

        } catch (\Exception $e) {
            ApiResponse::error('Failed to fetch versions: ' . $e->getMessage());
        }
    }

    public function analyses(string $method, array $params): void
    {
        if ($method !== 'GET') {
            ApiResponse::error('Method not allowed', 405);
        }

        $id = (int)($params[0] ?? 0);
        if ($id <= 0) {
            ApiResponse::error('Invalid snippet ID');
        }

        try {
            $snippet = $this->snippetRepository->findById($id);
            if (!$snippet) {
                ApiResponse::error('Snippet not found', 404);
            }

            $currentUser = $this->auth->optional();

            // Check view permissions
            if (!$this->canViewSnippet($snippet, $currentUser)) {
                ApiResponse::error('Access denied', 403);
            }

            $versions = $this->snippetRepository->getVersions($id);
            $analyses = [];

            foreach ($versions as $version) {
                $analysisResults = $version->getAnalysisResults();
                if ($analysisResults) {
                    $analyses[] = [
                        'version' => $version->getVersionNumber(),
                        'created_at' => $version->getCreatedAt()->format('Y-m-d H:i:s'),
                        'analysis' => $analysisResults
                    ];
                }
            }

            ApiResponse::success($analyses);

        } catch (\Exception $e) {
            ApiResponse::error('Failed to fetch analyses: ' . $e->getMessage());
        }
    }

    private function canViewSnippet(Snippet $snippet, ?User $user = null): bool
    {
        // Public snippets are always viewable
        if ($snippet->getVisibility() === 'public') {
            return true;
        }

        // Must be authenticated for private or organization snippets
        if (!$user) {
            return false;
        }

        // Owner can always view their own snippets
        if ($user->getId() === $snippet->getAuthorId()) {
            return true;
        }

        // Admin override
        if ($this->roleMiddleware->hasPermission($user->getId(), 'view_any_snippet')) {
            return true;
        }

        // Organization snippets: check if user is member of the organization
        if ($snippet->getVisibility() === 'organization' && $snippet->getOrganizationId()) {
            return $this->userRepository->isMemberOfOrganization($user->getId(), $snippet->getOrganizationId());
        }

        return false;
    }

    private function canEditSnippet(Snippet $snippet, User $user): bool
    {
        // Owner can always edit their own snippets
        if ($user->getId() === $snippet->getAuthorId()) {
            return true;
        }

        // Admin override
        if ($this->roleMiddleware->hasPermission($user->getId(), 'edit_any_snippet')) {
            return true;
        }

        // Organization snippets: check if user has permission within the organization
        if ($snippet->getVisibility() === 'organization' && $snippet->getOrganizationId()) {
            // This would be more complex, involving organization member roles
            // For now, assume if they can view, they can edit within organization
            // Or, more accurately, check for a specific 'edit_organization_snippet' permission
             return $this->roleMiddleware->hasPermission($user->getId(), 'edit_organization_snippet') &&
                    $this->userRepository->isMemberOfOrganization($user->getId(), $snippet->getOrganizationId());
        }

        return false;
    }

    private function canDeleteSnippet(Snippet $snippet, User $user): bool
    {
        // Owner can always delete their own snippets
        if ($user->getId() === $snippet->getAuthorId()) {
            return true;
        }

        // Admin override
        if ($this->roleMiddleware->hasPermission($user->getId(), 'delete_any_snippet')) {
            return true;
        }
        
        // Organization snippets: check if user has permission within the organization
        if ($snippet->getVisibility() === 'organization' && $snippet->getOrganizationId()) {
             return $this->roleMiddleware->hasPermission($user->getId(), 'delete_organization_snippet') &&
                    $this->userRepository->isMemberOfOrganization($user->getId(), $snippet->getOrganizationId());
        }

        return false;
    }
}