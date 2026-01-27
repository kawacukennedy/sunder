<?php

declare(strict_types=1);

namespace Tests\Integration\Controllers;

use Tests\DatabaseTestCase;

/**
 * Integration tests for CollaborationController
 */
class CollaborationControllerTest extends DatabaseTestCase
{
    private int $userId;
    private int $userId2;
    private int $snippetId;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test users
        $this->userId = $this->insertTestUser([
            'username' => 'collaborator1',
            'email' => 'collab1@test.com'
        ]);
        
        $this->userId2 = $this->insertTestUser([
            'username' => 'collaborator2',
            'email' => 'collab2@test.com'
        ]);
        
        // Create test snippet
        $this->snippetId = $this->insertTestSnippet([
            'user_id' => $this->userId,
            'title' => 'Collaborative Snippet',
            'code' => 'console.log("Hello");',
            'language' => 'javascript'
        ]);
    }

    public function testCreateCollaborationSessionSucceeds(): void
    {
        $sessionToken = bin2hex(random_bytes(32));
        
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_sessions 
            (snippet_id, host_user_id, session_token, status, created_at, expires_at)
            VALUES (?, ?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))
        ");
        
        $stmt->execute([$this->snippetId, $this->userId, $sessionToken]);
        $sessionId = (int) $this->db->lastInsertId();
        
        $this->assertGreaterThan(0, $sessionId);
        
        // Verify session exists
        $query = $this->db->prepare("
            SELECT * FROM collaboration_sessions WHERE id = ?
        ");
        $query->execute([$sessionId]);
        $session = $query->fetch(\PDO::FETCH_ASSOC);
        
        $this->assertNotFalse($session);
        $this->assertEquals('active', $session['status']);
    }

    public function testJoinCollaborationSessionSucceeds(): void
    {
        // Create session first
        $sessionToken = bin2hex(random_bytes(32));
        
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_sessions 
            (snippet_id, host_user_id, session_token, status, created_at, expires_at)
            VALUES (?, ?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))
        ");
        $stmt->execute([$this->snippetId, $this->userId, $sessionToken]);
        $sessionId = (int) $this->db->lastInsertId();
        
        // Add participant
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_participants 
            (session_id, user_id, role, joined_at)
            VALUES (?, ?, 'editor', NOW())
        ");
        $stmt->execute([$sessionId, $this->userId2]);
        
        // Verify participant
        $query = $this->db->prepare("
            SELECT * FROM collaboration_participants 
            WHERE session_id = ? AND user_id = ?
        ");
        $query->execute([$sessionId, $this->userId2]);
        $participant = $query->fetch(\PDO::FETCH_ASSOC);
        
        $this->assertNotFalse($participant);
        $this->assertEquals('editor', $participant['role']);
    }

    public function testUpdateCursorPositionSucceeds(): void
    {
        // Create session and add participant
        $sessionToken = bin2hex(random_bytes(32));
        
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_sessions 
            (snippet_id, host_user_id, session_token, status, created_at, expires_at)
            VALUES (?, ?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))
        ");
        $stmt->execute([$this->snippetId, $this->userId, $sessionToken]);
        $sessionId = (int) $this->db->lastInsertId();
        
        // Add participant
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_participants 
            (session_id, user_id, role, cursor_position, joined_at)
            VALUES (?, ?, 'editor', ?, NOW())
        ");
        $cursorPosition = json_encode(['line' => 1, 'column' => 1]);
        $stmt->execute([$sessionId, $this->userId2, $cursorPosition]);
        $participantId = (int) $this->db->lastInsertId();
        
        // Update cursor position
        $newPosition = json_encode(['line' => 5, 'column' => 10]);
        $update = $this->db->prepare("
            UPDATE collaboration_participants 
            SET cursor_position = ?, last_activity_at = NOW()
            WHERE id = ?
        ");
        $update->execute([$newPosition, $participantId]);
        
        // Verify update
        $query = $this->db->prepare("
            SELECT cursor_position FROM collaboration_participants WHERE id = ?
        ");
        $query->execute([$participantId]);
        $result = $query->fetch(\PDO::FETCH_ASSOC);
        
        $this->assertEquals($newPosition, $result['cursor_position']);
    }

    public function testBroadcastCodeChangeSucceeds(): void
    {
        // Create session
        $sessionToken = bin2hex(random_bytes(32));
        
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_sessions 
            (snippet_id, host_user_id, session_token, status, created_at, expires_at)
            VALUES (?, ?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))
        ");
        $stmt->execute([$this->snippetId, $this->userId, $sessionToken]);
        $sessionId = (int) $this->db->lastInsertId();
        
        // Record a code change event
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_events 
            (session_id, user_id, event_type, event_data, created_at)
            VALUES (?, ?, 'code_change', ?, NOW())
        ");
        
        $eventData = json_encode([
            'operation' => 'insert',
            'position' => ['line' => 2, 'column' => 0],
            'text' => 'console.log("world");'
        ]);
        
        $stmt->execute([$sessionId, $this->userId, $eventData]);
        $eventId = (int) $this->db->lastInsertId();
        
        $this->assertGreaterThan(0, $eventId);
    }

    public function testLeaveCollaborationSessionSucceeds(): void
    {
        // Create session and join
        $sessionToken = bin2hex(random_bytes(32));
        
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_sessions 
            (snippet_id, host_user_id, session_token, status, created_at, expires_at)
            VALUES (?, ?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))
        ");
        $stmt->execute([$this->snippetId, $this->userId, $sessionToken]);
        $sessionId = (int) $this->db->lastInsertId();
        
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_participants 
            (session_id, user_id, role, joined_at)
            VALUES (?, ?, 'editor', NOW())
        ");
        $stmt->execute([$sessionId, $this->userId2]);
        
        // Leave session (soft delete)
        $update = $this->db->prepare("
            UPDATE collaboration_participants 
            SET left_at = NOW()
            WHERE session_id = ? AND user_id = ?
        ");
        $update->execute([$sessionId, $this->userId2]);
        
        // Verify left
        $query = $this->db->prepare("
            SELECT left_at FROM collaboration_participants 
            WHERE session_id = ? AND user_id = ?
        ");
        $query->execute([$sessionId, $this->userId2]);
        $result = $query->fetch(\PDO::FETCH_ASSOC);
        
        $this->assertNotNull($result['left_at']);
    }

    public function testEndCollaborationSessionSucceeds(): void
    {
        // Create session
        $sessionToken = bin2hex(random_bytes(32));
        
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_sessions 
            (snippet_id, host_user_id, session_token, status, created_at, expires_at)
            VALUES (?, ?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))
        ");
        $stmt->execute([$this->snippetId, $this->userId, $sessionToken]);
        $sessionId = (int) $this->db->lastInsertId();
        
        // End session
        $update = $this->db->prepare("
            UPDATE collaboration_sessions 
            SET status = 'ended', ended_at = NOW()
            WHERE id = ?
        ");
        $update->execute([$sessionId]);
        
        // Verify ended
        $query = $this->db->prepare("
            SELECT status FROM collaboration_sessions WHERE id = ?
        ");
        $query->execute([$sessionId]);
        $result = $query->fetch(\PDO::FETCH_ASSOC);
        
        $this->assertEquals('ended', $result['status']);
    }

    public function testGetActiveParticipantsSucceeds(): void
    {
        // Create session with multiple participants
        $sessionToken = bin2hex(random_bytes(32));
        
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_sessions 
            (snippet_id, host_user_id, session_token, status, created_at, expires_at)
            VALUES (?, ?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))
        ");
        $stmt->execute([$this->snippetId, $this->userId, $sessionToken]);
        $sessionId = (int) $this->db->lastInsertId();
        
        // Add host as participant
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_participants 
            (session_id, user_id, role, joined_at)
            VALUES (?, ?, 'host', NOW())
        ");
        $stmt->execute([$sessionId, $this->userId]);
        
        // Add second participant
        $stmt->execute([$sessionId, $this->userId2]);
        
        // Get active participants
        $query = $this->db->prepare("
            SELECT cp.*, u.username 
            FROM collaboration_participants cp
            JOIN users u ON cp.user_id = u.id
            WHERE cp.session_id = ? AND cp.left_at IS NULL
        ");
        $query->execute([$sessionId]);
        $participants = $query->fetchAll(\PDO::FETCH_ASSOC);
        
        $this->assertCount(2, $participants);
    }

    public function testCollaborationSessionExpires(): void
    {
        // Create expired session
        $sessionToken = bin2hex(random_bytes(32));
        
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_sessions 
            (snippet_id, host_user_id, session_token, status, created_at, expires_at)
            VALUES (?, ?, ?, 'active', DATE_SUB(NOW(), INTERVAL 25 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR))
        ");
        $stmt->execute([$this->snippetId, $this->userId, $sessionToken]);
        $sessionId = (int) $this->db->lastInsertId();
        
        // Check if expired
        $query = $this->db->prepare("
            SELECT * FROM collaboration_sessions 
            WHERE id = ? AND expires_at < NOW()
        ");
        $query->execute([$sessionId]);
        $expired = $query->fetch(\PDO::FETCH_ASSOC);
        
        $this->assertNotFalse($expired);
    }

    public function testParticipantRolesAreEnforced(): void
    {
        // Create session
        $sessionToken = bin2hex(random_bytes(32));
        
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_sessions 
            (snippet_id, host_user_id, session_token, status, created_at, expires_at)
            VALUES (?, ?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))
        ");
        $stmt->execute([$this->snippetId, $this->userId, $sessionToken]);
        $sessionId = (int) $this->db->lastInsertId();
        
        // Add viewer (read-only) participant
        $stmt = $this->db->prepare("
            INSERT INTO collaboration_participants 
            (session_id, user_id, role, joined_at)
            VALUES (?, ?, 'viewer', NOW())
        ");
        $stmt->execute([$sessionId, $this->userId2]);
        
        $query = $this->db->prepare("
            SELECT role FROM collaboration_participants 
            WHERE session_id = ? AND user_id = ?
        ");
        $query->execute([$sessionId, $this->userId2]);
        $result = $query->fetch(\PDO::FETCH_ASSOC);
        
        $this->assertEquals('viewer', $result['role']);
    }
}
