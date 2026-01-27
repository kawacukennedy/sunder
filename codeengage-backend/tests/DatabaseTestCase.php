<?php
/**
 * Database TestCase for integration tests
 * 
 * Provides database connection and transaction management for tests.
 */

namespace Tests;

use PDO;

abstract class DatabaseTestCase extends TestCase
{
    protected static ?PDO $db = null;
    protected bool $useTransactions = true;

    /**
     * Set up database connection before each test
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        if (self::$db === null) {
            $this->initDatabase();
        }
        
        if ($this->useTransactions) {
            self::$db->beginTransaction();
        }
    }

    /**
     * Roll back transaction after each test
     */
    protected function tearDown(): void
    {
        if ($this->useTransactions && self::$db !== null && self::$db->inTransaction()) {
            self::$db->rollBack();
        }
        
        parent::tearDown();
    }

    /**
     * Initialize database connection
     */
    protected function initDatabase(): void
    {
        $config = require __DIR__ . '/../config/database.php';
        
        // Override with test database if specified
        $host = $_ENV['DB_HOST'] ?? $config['host'];
        $name = $_ENV['DB_NAME'] ?? $config['name'] . '_test';
        $user = $_ENV['DB_USER'] ?? $config['user'];
        $pass = $_ENV['DB_PASSWORD'] ?? $config['pass'];
        $charset = $config['charset'] ?? 'utf8mb4';
        
        $dsn = "mysql:host={$host};dbname={$name};charset={$charset}";
        
        try {
            self::$db = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (\PDOException $e) {
            $this->markTestSkipped('Database connection failed: ' . $e->getMessage());
        }
    }

    /**
     * Get the database connection
     *
     * @return PDO
     */
    protected function getDb(): PDO
    {
        if (self::$db === null) {
            $this->initDatabase();
        }
        
        return self::$db;
    }

    /**
     * Insert a test user and return user ID
     *
     * @param array $data User data overrides
     * @return int
     */
    protected function insertTestUser(array $data = []): int
    {
        $userData = $this->getTestUserData($data);
        
        $sql = "INSERT INTO users (username, email, password_hash, display_name, bio, preferences, created_at, updated_at)
                VALUES (:username, :email, :password_hash, :display_name, :bio, :preferences, NOW(), NOW())";
        
        $stmt = self::$db->prepare($sql);
        $stmt->execute([
            'username' => $userData['username'],
            'email' => $userData['email'],
            'password_hash' => $userData['password_hash'],
            'display_name' => $userData['display_name'],
            'bio' => $userData['bio'],
            'preferences' => $userData['preferences']
        ]);
        
        return (int) self::$db->lastInsertId();
    }

    /**
     * Insert a test snippet and return snippet ID
     *
     * @param int $authorId Author user ID
     * @param array $data Snippet data overrides
     * @return int
     */
    protected function insertTestSnippet(int $authorId, array $data = []): int
    {
        $snippetData = $this->getTestSnippetData(array_merge(['author_id' => $authorId], $data));
        
        $sql = "INSERT INTO snippets (author_id, title, description, visibility, language, created_at, updated_at)
                VALUES (:author_id, :title, :description, :visibility, :language, NOW(), NOW())";
        
        $stmt = self::$db->prepare($sql);
        $stmt->execute([
            'author_id' => $snippetData['author_id'],
            'title' => $snippetData['title'],
            'description' => $snippetData['description'],
            'visibility' => $snippetData['visibility'],
            'language' => $snippetData['language']
        ]);
        
        return (int) self::$db->lastInsertId();
    }

    /**
     * Insert a test snippet version
     *
     * @param int $snippetId Snippet ID
     * @param int $editorId Editor user ID
     * @param array $data Version data overrides
     * @return int
     */
    protected function insertTestSnippetVersion(int $snippetId, int $editorId, array $data = []): int
    {
        $versionData = $this->getTestSnippetVersionData(array_merge([
            'snippet_id' => $snippetId,
            'editor_id' => $editorId
        ], $data));
        
        $sql = "INSERT INTO snippet_versions (snippet_id, version_number, code, checksum, editor_id, change_summary, created_at)
                VALUES (:snippet_id, :version_number, :code, :checksum, :editor_id, :change_summary, NOW())";
        
        $stmt = self::$db->prepare($sql);
        $stmt->execute([
            'snippet_id' => $versionData['snippet_id'],
            'version_number' => $versionData['version_number'],
            'code' => $versionData['code'],
            'checksum' => $versionData['checksum'],
            'editor_id' => $versionData['editor_id'],
            'change_summary' => $versionData['change_summary']
        ]);
        
        return (int) self::$db->lastInsertId();
    }

    /**
     * Clear all test data from tables
     */
    protected function clearTestData(): void
    {
        $tables = [
            'audit_logs', 'login_attempts', 'achievements', 'code_analyses',
            'collaboration_sessions', 'snippet_tags', 'snippet_versions',
            'snippets', 'organization_members', 'organizations', 'user_roles',
            'role_permissions', 'permissions', 'roles', 'tags', 'users'
        ];
        
        self::$db->exec('SET FOREIGN_KEY_CHECKS = 0');
        
        foreach ($tables as $table) {
            self::$db->exec("TRUNCATE TABLE {$table}");
        }
        
        self::$db->exec('SET FOREIGN_KEY_CHECKS = 1');
    }
}
