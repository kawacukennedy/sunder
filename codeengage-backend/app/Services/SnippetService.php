<?php

namespace App\Services;

use App\Repositories\SnippetRepository;
use App\Repositories\SnippetVersionRepository;
use App\Repositories\TagRepository;
use App\Repositories\AuditRepository;
use App\Repositories\AnalysisRepository;
use App\Helpers\CodeHelper;
use App\Helpers\SecurityHelper;
use App\Exceptions\ValidationException;
use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;

class SnippetService
{
    private SnippetRepository $snippetRepository;
    private SnippetVersionRepository $versionRepository;
    private TagRepository $tagRepository;
    private AuditRepository $auditRepository;
    private AnalysisRepository $analysisRepository;
    private CodeHelper $codeHelper;
    private SecurityHelper $securityHelper;
    private array $config;

    public function __construct(
        SnippetRepository $snippetRepository,
        SnippetVersionRepository $versionRepository,
        TagRepository $tagRepository,
        AuditRepository $auditRepository,
        AnalysisRepository $analysisRepository,
        CodeHelper $codeHelper,
        SecurityHelper $securityHelper,
        array $config = []
    ) {
        $this->snippetRepository = $snippetRepository;
        $this->versionRepository = $versionRepository;
        $this->tagRepository = $tagRepository;
        $this->auditRepository = $auditRepository;
        $this->analysisRepository = $analysisRepository;
        $this->codeHelper = $codeHelper;
        $this->securityHelper = $securityHelper;
        $this->config = array_merge([
            'max_code_size' => 1048576, // 1MB
            'max_title_length' => 255,
            'max_description_length' => 1000,
            'supported_languages' => [
                'javascript', 'python', 'php', 'java', 'cpp', 'c', 'csharp', 
                'ruby', 'go', 'rust', 'typescript', 'html', 'css', 'sql', 'json', 
                'yaml', 'xml', 'markdown', 'bash', 'powershell', 'dockerfile'
            ]
        ], $config);
    }

    public function createSnippet(array $data, int $authorId): array
    {
        $this->validateSnippetData($data);

        $snippetData = [
            'author_id' => $authorId,
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'visibility' => $data['visibility'] ?? 'public',
            'language' => $data['language'],
            'organization_id' => $data['organization_id'] ?? null,
            'is_template' => $data['is_template'] ?? false,
            'template_variables' => $data['template_variables'] ?? null,
            'forked_from_id' => $data['forked_from_id'] ?? null
        ];

        $snippet = $this->snippetRepository->create($snippetData);

        $versionData = [
            'snippet_id' => $snippet->getId(),
            'version_number' => 1,
            'code' => $data['code'],
            'checksum' => hash('sha256', $data['code']),
            'editor_id' => $authorId,
            'change_summary' => 'Initial version'
        ];

        $version = $this->versionRepository->create($versionData);

        if (!empty($data['tags'])) {
            $this->attachTags($snippet->getId(), $data['tags']);
        }

        $this->auditRepository->log(
            $authorId,
            'snippet.create',
            'snippet',
            $snippet->getId(),
            null,
            [
                'title' => $snippet->getTitle(),
                'language' => $snippet->getLanguage(),
                'visibility' => $snippet->getVisibility()
            ]
        );

        return $this->formatSnippetWithVersion($snippet, $version);
    }

    public function updateSnippet(int $snippetId, array $data, int $editorId): array
    {
        $snippet = $this->snippetRepository->findById($snippetId);
        if (!$snippet) {
            throw new NotFoundException('Snippet');
        }

        if ($snippet->getAuthorId() !== $editorId) {
            throw new UnauthorizedException('You can only edit your own snippets');
        }

        $oldValues = $snippet->toArray();
        $updateData = [];

        if (isset($data['title'])) {
            $this->validateTitle($data['title']);
            $updateData['title'] = $data['title'];
        }

        if (isset($data['description'])) {
            $this->validateDescription($data['description']);
            $updateData['description'] = $data['description'];
        }

        if (isset($data['visibility'])) {
            $this->validateVisibility($data['visibility']);
            $updateData['visibility'] = $data['visibility'];
        }

        if (isset($data['language'])) {
            $this->validateLanguage($data['language']);
            $updateData['language'] = $data['language'];
        }

        if (isset($data['organization_id'])) {
            $updateData['organization_id'] = $data['organization_id'];
        }

        if (!empty($updateData)) {
            $snippet = $this->snippetRepository->update($snippetId, $updateData);
        }

        if (isset($data['code'])) {
            $this->validateCode($data['code']);
            
            $latestVersion = $this->versionRepository->getLatestVersion($snippetId);
            $newVersionNumber = $latestVersion ? $latestVersion->getVersionNumber() + 1 : 1;

            if ($latestVersion && $latestVersion->getChecksum() === hash('sha256', $data['code'])) {
                throw new ValidationException('No changes detected in code');
            }

            $versionData = [
                'snippet_id' => $snippetId,
                'version_number' => $newVersionNumber,
                'code' => $data['code'],
                'checksum' => hash('sha256', $data['code']),
                'editor_id' => $editorId,
                'change_summary' => $data['change_summary'] ?? 'Updated code'
            ];

            $version = $this->versionRepository->create($versionData);

            $this->auditRepository->log(
                $editorId,
                'snippet.update_code',
                'snippet_version',
                $version->getId(),
                null,
                [
                    'version_number' => $newVersionNumber,
                    'change_summary' => $versionData['change_summary']
                ]
            );
        } else {
            $version = $this->versionRepository->getLatestVersion($snippetId);
        }

        if (isset($data['tags'])) {
            $this->updateTags($snippetId, $data['tags']);
        }

        $newValues = $snippet->toArray();
        $this->auditRepository->log(
            $editorId,
            'snippet.update',
            'snippet',
            $snippetId,
            $oldValues,
            $newValues
        );

        return $this->formatSnippetWithVersion($snippet, $version);
    }

    public function deleteSnippet(int $snippetId, int $userId): bool
    {
        $snippet = $this->snippetRepository->findById($snippetId);
        if (!$snippet) {
            throw new NotFoundException('Snippet');
        }

        if ($snippet->getAuthorId() !== $userId) {
            throw new UnauthorizedException('You can only delete your own snippets');
        }

        $result = $this->snippetRepository->softDelete($snippetId);

        if ($result) {
            $this->auditRepository->log(
                $userId,
                'snippet.delete',
                'snippet',
                $snippetId,
                $snippet->toArray(),
                null
            );
        }

        return $result;
    }

    public function forkSnippet(int $snippetId, int $userId): array
    {
        $originalSnippet = $this->snippetRepository->findById($snippetId);
        if (!$originalSnippet) {
            throw new NotFoundException('Snippet');
        }

        if ($originalSnippet->getVisibility() === 'private' && $originalSnippet->getAuthorId() !== $userId) {
            throw new UnauthorizedException('Cannot fork private snippet');
        }

        $latestVersion = $this->versionRepository->getLatestVersion($snippetId);
        if (!$latestVersion) {
            throw new NotFoundException('Snippet version');
        }

        $forkData = [
            'author_id' => $userId,
            'title' => "Fork of {$originalSnippet->getTitle()}",
            'description' => $originalSnippet->getDescription(),
            'visibility' => 'public',
            'language' => $originalSnippet->getLanguage(),
            'organization_id' => null,
            'is_template' => false,
            'template_variables' => null,
            'forked_from_id' => $snippetId,
            'code' => $latestVersion->getCode()
        ];

        return $this->createSnippet($forkData, $userId);
    }

    public function starSnippet(int $snippetId, int $userId): bool
    {
        $snippet = $this->snippetRepository->findById($snippetId);
        if (!$snippet) {
            throw new NotFoundException('Snippet');
        }

        $isStarred = $this->snippetRepository->isStarredByUser($snippetId, $userId);
        
        if ($isStarred) {
            $this->snippetRepository->unstarSnippet($snippetId, $userId);
            $action = 'snippet.unstar';
        } else {
            $this->snippetRepository->starSnippet($snippetId, $userId);
            $action = 'snippet.star';
        }

        $this->auditRepository->log(
            $userId,
            $action,
            'snippet',
            $snippetId,
            null,
            ['starred' => !$isStarred]
        );

        return !$isStarred;
    }

    public function getSnippet(int $snippetId, ?int $userId = null): array
    {
        $snippet = $this->snippetRepository->findById($snippetId);
        if (!$snippet) {
            throw new NotFoundException('Snippet');
        }

        if ($snippet->getVisibility() === 'private' && $snippet->getAuthorId() !== $userId) {
            throw new UnauthorizedException('Cannot view private snippet');
        }

        $latestVersion = $this->versionRepository->getLatestVersion($snippetId);
        if (!$latestVersion) {
            throw new NotFoundException('Snippet version');
        }

        if ($userId) {
            $this->snippetRepository->incrementViewCount($snippetId);
        }

        return $this->formatSnippetWithVersion($snippet, $latestVersion, $userId);
    }

    public function getSnippetVersions(int $snippetId, ?int $userId = null): array
    {
        $snippet = $this->snippetRepository->findById($snippetId);
        if (!$snippet) {
            throw new NotFoundException('Snippet');
        }

        if ($snippet->getVisibility() === 'private' && $snippet->getAuthorId() !== $userId) {
            throw new UnauthorizedException('Cannot view private snippet versions');
        }

        return $this->versionRepository->getVersionsBySnippet($snippetId);
    }

    public function searchSnippets(array $filters = [], int $limit = 20, int $offset = 0): array
    {
        $snippets = $this->snippetRepository->search($filters, $limit, $offset);
        $result = [];

        foreach ($snippets as $snippet) {
            $latestVersion = $this->versionRepository->getLatestVersion($snippet->getId());
            if ($latestVersion) {
                $result[] = $this->formatSnippetWithVersion($snippet, $latestVersion);
            }
        }

        return $result;
    }

    public function getSnippetsByUser(int $userId, array $filters = [], int $limit = 20, int $offset = 0): array
    {
        $snippets = $this->snippetRepository->findByAuthor($userId, $filters, $limit, $offset);
        $result = [];

        foreach ($snippets as $snippet) {
            $latestVersion = $this->versionRepository->getLatestVersion($snippet->getId());
            if ($latestVersion) {
                $result[] = $this->formatSnippetWithVersion($snippet, $latestVersion);
            }
        }

        return $result;
    }

    public function getStarredSnippets(int $userId, int $limit = 20, int $offset = 0): array
    {
        $snippets = $this->snippetRepository->findStarredByUser($userId, $limit, $offset);
        $result = [];

        foreach ($snippets as $snippet) {
            $latestVersion = $this->versionRepository->getLatestVersion($snippet->getId());
            if ($latestVersion) {
                $result[] = $this->formatSnippetWithVersion($snippet, $latestVersion);
            }
        }

        return $result;
    }

    public function analyzeCode(int $snippetVersionId): array
    {
        $version = $this->versionRepository->findById($snippetVersionId);
        if (!$version) {
            throw new NotFoundException('Snippet version');
        }

        $existingAnalysis = $this->analysisRepository->findByVersion($snippetVersionId);
        if ($existingAnalysis) {
            return $existingAnalysis;
        }

        $analysisResults = $this->codeHelper->analyzeCode(
            $version->getCode(),
            $version->getSnippet()->getLanguage()
        );

        $analysisData = [
            'snippet_version_id' => $snippetVersionId,
            'analysis_type' => 'comprehensive',
            'complexity_score' => $analysisResults['complexity_score'] ?? null,
            'security_issues' => json_encode($analysisResults['security_issues'] ?? []),
            'performance_suggestions' => json_encode($analysisResults['performance_suggestions'] ?? []),
            'code_smells' => json_encode($analysisResults['code_smells'] ?? [])
        ];

        $analysis = $this->analysisRepository->create($analysisData);

        $this->auditRepository->log(
            $version->getEditorId(),
            'snippet.analyze',
            'code_analysis',
            $analysis->getId(),
            null,
            ['snippet_version_id' => $snippetVersionId]
        );

        return $analysis->toArray();
    }

    private function validateSnippetData(array $data): void
    {
        $this->validateTitle($data['title'] ?? '');
        $this->validateDescription($data['description'] ?? '');
        $this->validateVisibility($data['visibility'] ?? 'public');
        $this->validateLanguage($data['language'] ?? '');
        $this->validateCode($data['code'] ?? '');

        if (isset($data['is_template']) && $data['is_template']) {
            if (empty($data['template_variables']) || !is_array($data['template_variables'])) {
                throw new ValidationException('Template variables are required for template snippets');
            }
        }
    }

    private function validateTitle(string $title): void
    {
        if (empty($title)) {
            throw new ValidationException('Title is required');
        }
        if (strlen($title) > $this->config['max_title_length']) {
            throw new ValidationException("Title cannot exceed {$this->config['max_title_length']} characters");
        }
    }

    private function validateDescription(string $description): void
    {
        if (strlen($description) > $this->config['max_description_length']) {
            throw new ValidationException("Description cannot exceed {$this->config['max_description_length']} characters");
        }
    }

    private function validateVisibility(string $visibility): void
    {
        $validVisibilities = ['public', 'private', 'organization'];
        if (!in_array($visibility, $validVisibilities)) {
            throw new ValidationException('Invalid visibility setting');
        }
    }

    private function validateLanguage(string $language): void
    {
        if (empty($language)) {
            throw new ValidationException('Language is required');
        }
        if (!in_array($language, $this->config['supported_languages'])) {
            throw new ValidationException('Unsupported programming language');
        }
    }

    private function validateCode(string $code): void
    {
        if (empty($code)) {
            throw new ValidationException('Code is required');
        }
        if (strlen($code) > $this->config['max_code_size']) {
            throw new ValidationException('Code size exceeds maximum allowed size');
        }
    }

    private function attachTags(int $snippetId, array $tags): void
    {
        foreach ($tags as $tagName) {
            $tag = $this->tagRepository->findOrCreate($tagName);
            $this->snippetRepository->attachTag($snippetId, $tag->getId());
        }
    }

    private function updateTags(int $snippetId, array $tags): void
    {
        $this->snippetRepository->detachAllTags($snippetId);
        $this->attachTags($snippetId, $tags);
    }

    private function formatSnippetWithVersion($snippet, $version, ?int $userId = null): array
    {
        $data = $snippet->toArray();
        $data['current_version'] = $version->toArray();
        $data['tags'] = $this->snippetRepository->getTags($snippet->getId());
        
        if ($userId) {
            $data['is_starred'] = $this->snippetRepository->isStarredByUser($snippet->getId(), $userId);
        }

        unset($data['current_version']['snippet']);

        return $data;
    }
}