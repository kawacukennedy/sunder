<?php
/**
 * Base TestCase for all CodeEngage tests
 * 
 * Provides common testing utilities and mock helpers.
 */

namespace Tests;

use PHPUnit\Framework\TestCase as BaseTestCase;
use PHPUnit\Framework\MockObject\MockObject;
use PDO;

abstract class TestCase extends BaseTestCase
{
    /**
     * Create a mock PDO instance
     *
     * @return MockObject&PDO
     */
    protected function createMockPDO(): MockObject
    {
        return $this->createMock(PDO::class);
    }

    /**
     * Create a mock PDOStatement
     *
     * @param array $returnData Data to return from fetch/fetchAll
     * @param int $rowCount Number of affected rows
     * @return MockObject
     */
    protected function createMockStatement(array $returnData = [], int $rowCount = 0): MockObject
    {
        $stmt = $this->createMock(\PDOStatement::class);
        
        $stmt->method('execute')->willReturn(true);
        $stmt->method('fetch')->willReturn($returnData[0] ?? false);
        $stmt->method('fetchAll')->willReturn($returnData);
        $stmt->method('rowCount')->willReturn($rowCount);
        $stmt->method('fetchColumn')->willReturn($returnData[0][0] ?? false);
        
        return $stmt;
    }

    /**
     * Get a test user data array
     *
     * @param array $overrides Override default values
     * @return array
     */
    protected function getTestUserData(array $overrides = []): array
    {
        return array_merge([
            'id' => 1,
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password_hash' => password_hash('Password123!', PASSWORD_ARGON2ID),
            'display_name' => 'Test User',
            'avatar_url' => null,
            'bio' => 'A test user',
            'preferences' => json_encode(['theme' => 'dark', 'editor_mode' => 'default']),
            'achievement_points' => 0,
            'last_active_at' => date('Y-m-d H:i:s'),
            'email_verified_at' => date('Y-m-d H:i:s'),
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
            'deleted_at' => null
        ], $overrides);
    }

    /**
     * Get a test snippet data array
     *
     * @param array $overrides Override default values
     * @return array
     */
    protected function getTestSnippetData(array $overrides = []): array
    {
        return array_merge([
            'id' => 1,
            'author_id' => 1,
            'organization_id' => null,
            'title' => 'Test Snippet',
            'description' => 'A test snippet for unit tests',
            'visibility' => 'public',
            'language' => 'javascript',
            'forked_from_id' => null,
            'is_template' => false,
            'template_variables' => null,
            'view_count' => 0,
            'star_count' => 0,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
            'deleted_at' => null
        ], $overrides);
    }

    /**
     * Get a test snippet version data array
     *
     * @param array $overrides Override default values
     * @return array
     */
    protected function getTestSnippetVersionData(array $overrides = []): array
    {
        return array_merge([
            'id' => 1,
            'snippet_id' => 1,
            'version_number' => 1,
            'code' => 'console.log("Hello, World!");',
            'checksum' => hash('sha256', 'console.log("Hello, World!");'),
            'editor_id' => 1,
            'change_summary' => 'Initial version',
            'analysis_results' => null,
            'created_at' => date('Y-m-d H:i:s')
        ], $overrides);
    }

    /**
     * Assert array has required keys
     *
     * @param array $keys Expected keys
     * @param array $array Array to check
     */
    protected function assertArrayHasKeys(array $keys, array $array): void
    {
        foreach ($keys as $key) {
            $this->assertArrayHasKey($key, $array, "Array missing required key: {$key}");
        }
    }

    /**
     * Create JSON content for API request simulation
     *
     * @param array $data Request data
     * @return string
     */
    protected function createJsonInput(array $data): string
    {
        return json_encode($data);
    }
}
