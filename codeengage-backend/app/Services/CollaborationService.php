<?php

namespace App\Services;

use App\Repositories\SnippetRepository;
use App\Repositories\CollaborationRepository;
use App\Repositories\AuditRepository;
use App\Repositories\UserRepository;
use App\Repositories\RoleRepository;
use App\Helpers\SecurityHelper;
use App\Exceptions\ValidationException;
use App\Exceptions\NotFoundException;
use App\Exceptions\UnauthorizedException;
use App\Middleware\RoleMiddleware;
use App\Models\Snippet;
use App\Models\User;
use App\Models\CollaborationSession;

class CollaborationService
{
    private SnippetRepository $snippetRepository;
    private CollaborationRepository $collaborationRepository;
    private AuditRepository $auditRepository;
    private SecurityHelper $securityHelper;
    private UserRepository $userRepository;
    private RoleMiddleware $roleMiddleware;
    private array $config;

    public function __construct(
        SnippetRepository $snippetRepository,
        CollaborationRepository $collaborationRepository,
        AuditRepository $auditRepository,
        SecurityHelper $securityHelper,
        UserRepository $userRepository,
        RoleRepository $roleRepository,
        array $config = []
    ) {
        $this->snippetRepository = $snippetRepository;
        $this->collaborationRepository = $collaborationRepository;
        $this->auditRepository = $auditRepository;
        $this->securityHelper = $securityHelper;
        $this->userRepository = $userRepository;
        $this->roleMiddleware = new RoleMiddleware($userRepository, $roleRepository);
        $this->config = array_merge([
            'session_timeout' => 86400, // 24 hours
            'max_participants' => 10,
            'cleanup_interval' => 3600 // 1 hour
        ], $config);
    }

    public function createSession(int $snippetId, int $userId): array
    {
        $snippet = $this->snippetRepository->findById($snippetId);
        if (!$snippet) {
            throw new NotFoundException('Snippet not found');
        }

        $user = $this->userRepository->findById($userId);
        if (!$user) {
            throw new UnauthorizedException('User not found');
        }

        // Check if user can collaborate on this snippet based on RBAC
        if (!$this->canCollaborate($snippet, $user)) {
            throw new UnauthorizedException('Cannot create collaboration session for this snippet');
        }

        $existingSessionData = $this->collaborationRepository->findBySnippet($snippetId);
        if ($existingSessionData) {
            $existingSession = CollaborationSession::fromData($this->db, $existingSessionData);
            // If session exists, try to join it instead of creating a new one
            if ($this->canJoinSession($existingSession->toArray(), $userId)) {
                return $this->joinSession($existingSession->getSessionToken(), $userId);
            }
            throw new ValidationException('Collaboration session already exists and cannot be joined');
        }

        $sessionToken = $this->generateSessionToken();
        
        $session = new CollaborationSession($this->db);
        $session->setSnippetId($snippetId);
        $session->setSessionToken($sessionToken);
        $session->addParticipant($userId);
        $session->setLastActivity(new \DateTime());

        if (!$session->save()) {
            throw new \Exception('Failed to create collaboration session');
        }

        $this->auditRepository->log(
            $userId,
            'collaboration.session_create',
            'collaboration_session',
            $session->getId(),
            null,
            [
                'snippet_id' => $snippetId,
                'session_token' => $sessionToken
            ]
        );

        return $session->toArray();
    }

    public function joinSession(string $sessionToken, int $userId): array
    {
        $session = CollaborationSession::findByToken($this->db, $sessionToken);
        if (!$session) {
            throw new NotFoundException('Collaboration session not found');
        }

        if (!$session->isActive()) {
            throw new ValidationException('Session has expired');
        }
        
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            throw new UnauthorizedException('User not found');
        }

        $snippet = $this->snippetRepository->findById($session->getSnippetId());
        if (!$snippet) {
            throw new NotFoundException('Snippet not found');
        }

        if (!$this->canCollaborate($snippet, $user)) {
            throw new UnauthorizedException('Cannot join this collaboration session');
        }

        // If already a participant, just return current session info
        if (in_array($userId, $session->getParticipants())) {
            return $session->toArray();
        }

        if (count($session->getParticipants()) >= $this->config['max_participants']) {
            throw new ValidationException('Session is full');
        }

        $session->addParticipant($userId);
        $session->setLastActivity(new \DateTime());
        $session->save();

        $this->auditRepository->log(
            $userId,
            'collaboration.session_join',
            'collaboration_session',
            $session->getId(),
            null,
            ['session_token' => $sessionToken]
        );

        return $session->toArray();
    }

    public function pushUpdate(string $sessionToken, int $userId, array $input): void
    {
        $session = CollaborationSession::findByToken($this->db, $sessionToken);
        if (!$session) {
            throw new NotFoundException('Collaboration session not found');
        }

        if (!$session->isActive()) {
            throw new ValidationException('Session has expired');
        }

        if (!in_array($userId, $session->getParticipants())) {
            throw new UnauthorizedException('User is not a participant in this session');
        }

        // Handle different update types
        switch ($input['type'] ?? 'message') {
            case 'cursor':
                $this->handleCursorUpdate($session, $userId, $input['position'] ?? []);
                break;
            case 'text_change':
                $this->handleTextChange($session, $userId, $input['change'] ?? []);
                break;
            case 'selection':
                $this->handleSelectionChange($session, $userId, $input['selection'] ?? []);
                break;
            case 'message':
                $this->handleChatMessage($session, $userId, $input['message'] ?? '');
                break;
            default:
                // Log or ignore unknown update types
                break;
        }

        $session->setLastActivity(new \DateTime());
        $session->save();
        
        // Audit log for text changes (more critical)
        if (($input['type'] ?? '') === 'text_change') {
            $this->auditRepository->log(
                $userId,
                'collaboration.text_change',
                'collaboration_session',
                $session->getId(),
                null,
                ['session_token' => $sessionToken, 'change_type' => $input['change']['type'] ?? 'unknown']
            );
        }
    }

    public function endSession(string $sessionToken, int $userId): void
    {
        $session = CollaborationSession::findByToken($this->db, $sessionToken);
        if (!$session) {
            throw new NotFoundException('Collaboration session not found');
        }

        $snippet = $this->snippetRepository->findById($session->getSnippetId());
        if (!$snippet) {
            throw new NotFoundException('Snippet not found');
        }

        // Only snippet owner or a participant can end the session
        $isOwner = $snippet->getAuthorId() === $userId;
        $isParticipant = in_array($userId, $session->getParticipants());

        if (!$isOwner && !$isParticipant) {
            throw new UnauthorizedException('You do not have permission to end this session');
        }

        $session->removeParticipant($userId);
        $session->setLastActivity(new \DateTime());
        $session->save();

        if (empty($session->getParticipants())) {
            $session->delete();
        }

        $this->auditRepository->log(
            $userId,
            'collaboration.session_end',
            'collaboration_session',
            $session->getId(),
            null,
            ['session_token' => $sessionToken]
        );
    }

    public function getUpdates(string $sessionToken, int $userId, ?string $since = null): array
    {
        $session = CollaborationSession::findByToken($this->db, $sessionToken);
        if (!$session) {
            throw new NotFoundException('Collaboration session not found');
        }

        if (!$session->isActive()) {
            throw new ValidationException('Session has expired');
        }

        if (!in_array($userId, $session->getParticipants())) {
            throw new UnauthorizedException('User is not a participant in this session');
        }

        $updates = [];
        $timestamp = $since ? strtotime($since) : 0;

        // Get cursor and selection updates
        foreach ($session->getCursorPositions() as $participantId => $position) {
            if (isset($position['updated_at']) && $position['updated_at'] > $timestamp) {
                $updates[] = [
                    'type' => 'cursor_or_selection',
                    'user_id' => $participantId,
                    'data' => $position,
                    'timestamp' => $position['updated_at']
                ];
            }
        }
        
        // Get chat messages and text changes from metadata
        $updates = array_merge($updates, $this->getUpdatesFromSessionMetadata($session, $timestamp));

        // Sort by timestamp
        usort($updates, fn($a, $b) => $a['timestamp'] - $b['timestamp']);

        return [
            'session_token' => $session->getSessionToken(),
            'participants' => $session->getParticipants(),
            'cursor_positions' => $session->getCursorPositions(),
            'last_activity' => $session->getLastActivity()->format('Y-m-d H:i:s'),
            'updates' => $updates
        ];
    }
    
    public function cleanupExpiredSessions(): int
    {
        return CollaborationSession::cleanupOld($this->db);
    }

    private function canCollaborate(Snippet $snippet, User $user): bool
    {
        // Owner can always collaborate
        if ($user->getId() === $snippet->getAuthorId()) {
            return true;
        }

        // Admin override
        if ($this->roleMiddleware->hasPermission($user->getId(), 'collaborate_any_snippet')) {
            return true;
        }

        // Public snippets are generally collaborative
        if ($snippet->getVisibility() === 'public') {
            return true;
        }

        // Organization snippets: check if user is member of the organization
        if ($snippet->getVisibility() === 'organization' && $snippet->getOrganizationId()) {
            return $this->userRepository->isMemberOfOrganization($user->getId(), $snippet->getOrganizationId());
        }

        return false;
    }

    private function isSessionExpired(array $session): bool
    {
        $lastActivity = strtotime($session['last_activity']);
        return (time() - $lastActivity) > $this->config['session_timeout'];
    }

    private function canJoinSession(array $sessionData, int $userId): bool
    {
        $session = CollaborationSession::fromData($this->db, $sessionData);
        if (!$session->isActive()) {
            return false;
        }

        if (count($session->getParticipants()) >= $this->config['max_participants']) {
            return false;
        }

        $snippet = $this->snippetRepository->findById($session->getSnippetId());
        $user = $this->userRepository->findById($userId);

        if (!$snippet || !$user) {
            return false;
        }

        return $this->canCollaborate($snippet, $user);
    }

    private function isParticipant(array $session, int $userId): bool
    {
        return in_array($userId, json_decode($session['participants'], true) ?: []);
    }

    private function generateSessionToken(): string
    {
        return $this->securityHelper->generateSecureToken(64);
    }

    private function handleCursorUpdate(CollaborationSession $session, int $userId, array $position): void
    {
        $cursorPositions = $session->getCursorPositions();
        $cursorPositions[$userId] = [
            'line' => $position['line'] ?? 0,
            'ch' => $position['ch'] ?? 0,
            'selection' => $position['selection'] ?? null,
            'updated_at' => time()
        ];
        $session->setCursorPositions($cursorPositions);
    }

    private function handleTextChange(CollaborationSession $session, int $userId, array $change): void
    {
        // Store text change in session metadata
        // In a real implementation, you'd store this in a separate table for richer history and conflict resolution
        $metadata = $session->getMetadata() ?? [];
        if (!isset($metadata['text_changes'])) {
            $metadata['text_changes'] = [];
        }
        
        $metadata['text_changes'][] = [
            'user_id' => $userId,
            'change' => $change,
            'timestamp' => time()
        ];
        
        $session->setMetadata($metadata);
    }

    private function handleSelectionChange(CollaborationSession $session, int $userId, array $selection): void
    {
        $cursorPositions = $session->getCursorPositions();
        if (!isset($cursorPositions[$userId])) {
            $cursorPositions[$userId] = ['line' => 0, 'ch' => 0]; // Default if cursor not set
        }
        $cursorPositions[$userId]['selection'] = $selection;
        $cursorPositions[$userId]['updated_at'] = time();
        $session->setCursorPositions($cursorPositions);
    }

    private function handleChatMessage(CollaborationSession $session, int $userId, string $message): void
    {
        $metadata = $session->getMetadata() ?? [];
        if (!isset($metadata['chat_messages'])) {
            $metadata['chat_messages'] = [];
        }
        
        $metadata['chat_messages'][] = [
            'user_id' => $userId,
            'message' => $message,
            'timestamp' => time()
        ];
        
        $session->setMetadata($metadata);
    }

    private function getUpdatesFromSessionMetadata(CollaborationSession $session, int $since): array
    {
        $updates = [];
        $metadata = $session->getMetadata() ?? [];

        // Get text changes
        if (isset($metadata['text_changes'])) {
            foreach ($metadata['text_changes'] as $change) {
                if ($change['timestamp'] > $since) {
                    $updates[] = [
                        'type' => 'text_change',
                        'user_id' => $change['user_id'],
                        'data' => $change['change'],
                        'timestamp' => $change['timestamp']
                    ];
                }
            }
        }

        // Get chat messages
        if (isset($metadata['chat_messages'])) {
            foreach ($metadata['chat_messages'] as $message) {
                if ($message['timestamp'] > $since) {
                    $updates[] = [
                        'type' => 'chat_message',
                        'user_id' => $message['user_id'],
                        'data' => $message['message'],
                        'timestamp' => $message['timestamp']
                    ];
                }
            }
        }
        return $updates;
    }

    private function resolveEditConflicts(int $snippetId, array $edit, int $userId): array
    {
        // Simplified conflict resolution - in production, implement proper three-way merge
        $currentVersion = $this->snippetRepository->getLatestVersion($snippetId);
        
        if (!$currentVersion) {
            return ['has_conflicts' => false, 'conflicts' => []];
        }

        // Placeholder for real-time conflict detection and resolution logic
        // This would involve comparing the incoming edit with recent changes from other collaborators
        // and applying a merge strategy (e.g., Operational Transformation)
        
        return [
            'has_conflicts' => false, // For now, assume no conflicts for simplicity
            'conflicts' => []
        ];
    }

    private function checkEditOverlaps(array $edit, int $userId): array
    {
        // This method is part of the placeholder conflict resolution and would be implemented
        // as part of a full three-way merge algorithm.
        return [];
    }

    private function applyEditToSnippet(int $snippetId, array $edit, int $userId): array
    {
        // Get current code
        $currentCode = $this->snippetRepository->getLatestCode($snippetId);
        
        // Apply edit based on type
        switch ($edit['type'] ?? 'insert') {
            case 'insert':
                $newCode = $this->insertText($currentCode, $edit);
                break;
            case 'delete':
                $newCode = $this->deleteText($currentCode, $edit);
                break;
            case 'replace':
                $newCode = $this->replaceText($currentCode, $edit);
                break;
            default:
                throw new ValidationException('Invalid edit type');
        }

        // Create new version with the edit
        $this->snippetRepository->update($snippetId, ['change_summary' => 'Collaborative edit'], $newCode, $userId);
        
        return $this->snippetRepository->findById($snippetId)->toArray();
    }

    private function insertText(string $code, array $edit): string
    {
        $lines = explode("\n", $code);
        $line = $edit['line'] ?? 0;
        $column = $edit['column'] ?? 0;
        $text = $edit['text'] ?? '';

        if (!isset($lines[$line])) {
            // Handle insertion beyond current lines (e.g., adding new lines at the end)
            if ($line == count($lines)) {
                $lines[] = $text;
                return implode("\n", $lines);
            }
            // If line is much further, pad with empty lines (or throw error)
            while (count($lines) < $line) {
                $lines[] = '';
            }
            $lines[$line] = $text;
            return implode("\n", $lines);
        }

        $currentLine = $lines[$line];
        $lines[$line] = substr($currentLine, 0, $column) . $text . substr($currentLine, $column);
        
        return implode("\n", $lines);
    }

    private function deleteText(string $code, array $edit): string
    {
        $lines = explode("\n", $code);
        $startLine = $edit['start_line'] ?? 0;
        $startColumn = $edit['start_column'] ?? 0;
        $endLine = $edit['end_line'] ?? $startLine;
        $endColumn = $edit['end_column'] ?? $startColumn;

        if ($startLine === $endLine) {
            // Single line deletion
            if (!isset($lines[$startLine])) {
                return $code;
            }
            $currentLine = $lines[$startLine];
            $lines[$startLine] = substr($currentLine, 0, $startColumn) . substr($currentLine, $endColumn);
        } else {
            // Multi-line deletion
            if (!isset($lines[$startLine]) || !isset($lines[$endLine])) {
                return $code;
            }
            
            $start = substr($lines[$startLine], 0, $startColumn);
            $end = substr($lines[$endLine], $endColumn);
            
            array_splice($lines, $startLine, $endLine - $startLine + 1, [$start . $end]);
        }
        
        return implode("\n", $lines);
    }

    private function replaceText(string $code, array $edit): string
    {
        $deleted = $this->deleteText($code, [
            'start_line' => $edit['start_line'] ?? 0,
            'start_column' => $edit['start_column'] ?? 0,
            'end_line' => $edit['end_line'] ?? 0,
            'end_column' => $edit['end_column'] ?? 0
        ]);

        return $this->insertText($deleted, [
            'line' => $edit['start_line'] ?? 0,
            'column' => $edit['start_column'] ?? 0,
            'text' => $edit['text'] ?? ''
        ]);
    }

    private function getSnippetUpdates(int $snippetId, int $since): array
    {
        // Get recent versions of the snippet
        $sinceDate = date('Y-m-d H:i:s', $since);
        return $this->snippetRepository->getVersionsSince($snippetId, $sinceDate);
    }
}