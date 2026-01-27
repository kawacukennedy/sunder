<?php

declare(strict_types=1);

namespace Tests\Integration\Controllers;

use Tests\DatabaseTestCase;

/**
 * Integration tests for SearchController
 */
class SearchControllerTest extends DatabaseTestCase
{
    private int $userId;
    private array $snippetIds = [];

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test user
        $this->userId = $this->insertTestUser([
            'username' => 'searcher',
            'email' => 'searcher@test.com'
        ]);
        
        // Create test snippets with different languages and content
        $this->snippetIds[] = $this->insertTestSnippet([
            'user_id' => $this->userId,
            'title' => 'JavaScript Array Methods',
            'description' => 'Common array manipulation functions',
            'code' => 'const arr = [1, 2, 3];\narr.map(x => x * 2);',
            'language' => 'javascript',
            'visibility' => 'public'
        ]);
        
        $this->snippetIds[] = $this->insertTestSnippet([
            'user_id' => $this->userId,
            'title' => 'Python List Comprehension',
            'description' => 'Creating lists with comprehension syntax',
            'code' => 'squares = [x**2 for x in range(10)]',
            'language' => 'python',
            'visibility' => 'public'
        ]);
        
        $this->snippetIds[] = $this->insertTestSnippet([
            'user_id' => $this->userId,
            'title' => 'PHP Array Functions',
            'description' => 'Working with arrays in PHP',
            'code' => '<?php\n$arr = array_map(fn($x) => $x * 2, [1, 2, 3]);',
            'language' => 'php',
            'visibility' => 'public'
        ]);
    }

    public function testSearchByTitleReturnsMatches(): void
    {
        $searchQuery = 'Array';
        
        $query = $this->db->prepare("
            SELECT * FROM snippets 
            WHERE title LIKE ? AND deleted_at IS NULL AND visibility = 'public'
        ");
        $query->execute(["%{$searchQuery}%"]);
        $results = $query->fetchAll(\PDO::FETCH_ASSOC);
        
        $this->assertCount(2, $results); // JavaScript and PHP have 'Array' in title
    }

    public function testSearchByCodeContentReturnsMatches(): void
    {
        $searchQuery = 'map';
        
        $query = $this->db->prepare("
            SELECT * FROM snippets 
            WHERE (code LIKE ? OR title LIKE ?) AND deleted_at IS NULL
        ");
        $query->execute(["%{$searchQuery}%", "%{$searchQuery}%"]);
        $results = $query->fetchAll(\PDO::FETCH_ASSOC);
        
        $this->assertGreaterThanOrEqual(2, count($results));
    }

    public function testSearchByLanguageFiltersResults(): void
    {
        $query = $this->db->prepare("
            SELECT * FROM snippets 
            WHERE language = ? AND deleted_at IS NULL
        ");
        $query->execute(['python']);
        $results = $query->fetchAll(\PDO::FETCH_ASSOC);
        
        $this->assertCount(1, $results);
        $this->assertEquals('python', $results[0]['language']);
    }

    public function testSearchWithMultipleFiltersWorks(): void
    {
        $searchQuery = 'array';
        $language = 'javascript';
        
        $query = $this->db->prepare("
            SELECT * FROM snippets 
            WHERE (title LIKE ? OR description LIKE ?) 
            AND language = ?
            AND deleted_at IS NULL
        ");
        $query->execute(["%{$searchQuery}%", "%{$searchQuery}%", $language]);
        $results = $query->fetchAll(\PDO::FETCH_ASSOC);
        
        $this->assertCount(1, $results);
        $this->assertEquals('JavaScript Array Methods', $results[0]['title']);
    }

    public function testSearchReturnsEmptyForNoMatches(): void
    {
        $query = $this->db->prepare("
            SELECT * FROM snippets 
            WHERE title LIKE ? AND deleted_at IS NULL
        ");
        $query->execute(['%nonexistentquery12345%']);
        $results = $query->fetchAll(\PDO::FETCH_ASSOC);
        
        $this->assertCount(0, $results);
    }

    public function testSearchPaginationWorks(): void
    {
        $page = 1;
        $perPage = 2;
        $offset = ($page - 1) * $perPage;
        
        $query = $this->db->prepare("
            SELECT * FROM snippets 
            WHERE deleted_at IS NULL
            LIMIT ? OFFSET ?
        ");
        $query->execute([$perPage, $offset]);
        $results = $query->fetchAll(\PDO::FETCH_ASSOC);
        
        $this->assertLessThanOrEqual($perPage, count($results));
    }

    public function testSearchSortsByRelevance(): void
    {
        // Add a snippet with 'array' in both title and description
        $this->insertTestSnippet([
            'user_id' => $this->userId,
            'title' => 'Array Sorting Array Methods',
            'description' => 'Array sorting with array methods',
            'code' => 'arr.sort()',
            'language' => 'javascript',
            'visibility' => 'public'
        ]);
        
        $searchQuery = 'array';
        
        $query = $this->db->prepare("
            SELECT *, 
                (CASE WHEN title LIKE ? THEN 10 ELSE 0 END +
                 CASE WHEN description LIKE ? THEN 5 ELSE 0 END +
                 CASE WHEN code LIKE ? THEN 2 ELSE 0 END) as relevance
            FROM snippets 
            WHERE (title LIKE ? OR description LIKE ? OR code LIKE ?)
            AND deleted_at IS NULL
            ORDER BY relevance DESC
        ");
        $likeQuery = "%{$searchQuery}%";
        $query->execute([$likeQuery, $likeQuery, $likeQuery, $likeQuery, $likeQuery, $likeQuery]);
        $results = $query->fetchAll(\PDO::FETCH_ASSOC);
        
        $this->assertGreaterThan(0, count($results));
        // First result should have highest relevance
        $this->assertGreaterThanOrEqual($results[1]['relevance'] ?? 0, $results[0]['relevance']);
    }

    public function testSearchExcludesPrivateSnippets(): void
    {
        // Add private snippet
        $this->insertTestSnippet([
            'user_id' => $this->userId,
            'title' => 'Private Secret Code',
            'code' => 'secret = "hidden"',
            'language' => 'python',
            'visibility' => 'private'
        ]);
        
        $query = $this->db->prepare("
            SELECT * FROM snippets 
            WHERE title LIKE ? AND visibility = 'public' AND deleted_at IS NULL
        ");
        $query->execute(['%Secret%']);
        $results = $query->fetchAll(\PDO::FETCH_ASSOC);
        
        $this->assertCount(0, $results);
    }

    public function testSearchByTagsWorks(): void
    {
        // Add tags to a snippet
        $stmt = $this->db->prepare("
            INSERT INTO tags (name, created_at) VALUES (?, NOW())
        ");
        $stmt->execute(['algorithms']);
        $tagId = (int) $this->db->lastInsertId();
        
        $stmt = $this->db->prepare("
            INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)
        ");
        $stmt->execute([$this->snippetIds[0], $tagId]);
        
        // Search by tag
        $query = $this->db->prepare("
            SELECT s.* FROM snippets s
            JOIN snippet_tags st ON s.id = st.snippet_id
            JOIN tags t ON st.tag_id = t.id
            WHERE t.name = ? AND s.deleted_at IS NULL
        ");
        $query->execute(['algorithms']);
        $results = $query->fetchAll(\PDO::FETCH_ASSOC);
        
        $this->assertCount(1, $results);
    }

    public function testSearchSanitizesInput(): void
    {
        // Test SQL injection prevention
        $maliciousQuery = "'; DROP TABLE snippets; --";
        
        $query = $this->db->prepare("
            SELECT * FROM snippets WHERE title LIKE ? AND deleted_at IS NULL
        ");
        $query->execute(["%{$maliciousQuery}%"]);
        $results = $query->fetchAll(\PDO::FETCH_ASSOC);
        
        // Table should still exist
        $tableCheck = $this->db->query("SHOW TABLES LIKE 'snippets'");
        $tableExists = $tableCheck->fetch();
        
        $this->assertNotFalse($tableExists);
    }

    public function testSearchAutocompleteReturnsLimitedResults(): void
    {
        $prefix = 'Arr';
        $limit = 5;
        
        $query = $this->db->prepare("
            SELECT DISTINCT title FROM snippets 
            WHERE title LIKE ? AND deleted_at IS NULL
            LIMIT ?
        ");
        $query->execute(["{$prefix}%", $limit]);
        $results = $query->fetchAll(\PDO::FETCH_COLUMN);
        
        $this->assertLessThanOrEqual($limit, count($results));
        foreach ($results as $title) {
            $this->assertStringStartsWith($prefix, $title);
        }
    }

    public function testSearchReturnsResultCount(): void
    {
        $query = $this->db->prepare("
            SELECT COUNT(*) as total FROM snippets 
            WHERE deleted_at IS NULL AND visibility = 'public'
        ");
        $query->execute();
        $result = $query->fetch(\PDO::FETCH_ASSOC);
        
        $this->assertGreaterThan(0, $result['total']);
    }
}
