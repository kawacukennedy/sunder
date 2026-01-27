<?php
/**
 * Database Seeder Script
 * 
 * Seeds the database with sample data for development and testing.
 * Usage: php seed.php [--fresh]
 * 
 * @package CodeEngage
 */

declare(strict_types=1);

// Load configuration
$configPath = __DIR__ . '/../../config/database.php';
if (!file_exists($configPath)) {
    die("Error: Database configuration not found\n");
}

$config = require $configPath;

// Check for --fresh flag
$freshSeed = in_array('--fresh', $argv ?? []);

/**
 * Create PDO connection
 */
function createConnection(array $config): PDO
{
    $host = $config['host'] ?? 'localhost';
    $dbName = $config['database'] ?? $config['name'] ?? 'codeengage';
    $user = $config['username'] ?? $config['user'] ?? 'root';
    $password = $config['password'] ?? '';

    $dsn = "mysql:host={$host};dbname={$dbName};charset=utf8mb4";
    
    return new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
}

/**
 * Seed users
 */
function seedUsers(PDO $db): void
{
    echo "  Seeding users...\n";
    
    $users = [
        [
            'username' => 'admin',
            'email' => 'admin@codeengage.local',
            'display_name' => 'System Admin',
            'bio' => 'Platform administrator'
        ],
        [
            'username' => 'demo_user',
            'email' => 'demo@codeengage.local',
            'display_name' => 'Demo User',
            'bio' => 'Sample user for demonstrations'
        ],
        [
            'username' => 'jane_dev',
            'email' => 'jane@example.com',
            'display_name' => 'Jane Developer',
            'bio' => 'Full-stack developer passionate about clean code'
        ],
        [
            'username' => 'john_coder',
            'email' => 'john@example.com',
            'display_name' => 'John Coder',
            'bio' => 'Backend specialist with a love for algorithms'
        ]
    ];

    $stmt = $db->prepare("
        INSERT INTO users (username, email, password_hash, display_name, bio, preferences, email_verified_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)
    ");

    $passwordHash = password_hash('Password123!', PASSWORD_ARGON2ID);
    $preferences = json_encode(['theme' => 'dark', 'editor_mode' => 'default']);

    foreach ($users as $user) {
        $stmt->execute([
            $user['username'],
            $user['email'],
            $passwordHash,
            $user['display_name'],
            $user['bio'],
            $preferences
        ]);
    }

    echo "    Created " . count($users) . " users\n";
}

/**
 * Seed roles and permissions
 */
function seedRolesAndPermissions(PDO $db): void
{
    echo "  Seeding roles and permissions...\n";

    $roles = [
        ['name' => 'admin', 'description' => 'Full system access', 'is_system_role' => true],
        ['name' => 'moderator', 'description' => 'Content moderation', 'is_system_role' => true],
        ['name' => 'user', 'description' => 'Standard user', 'is_system_role' => true],
        ['name' => 'guest', 'description' => 'Limited access', 'is_system_role' => true]
    ];

    $roleStmt = $db->prepare("
        INSERT INTO roles (name, description, is_system_role)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE description = VALUES(description)
    ");

    foreach ($roles as $role) {
        $roleStmt->execute([$role['name'], $role['description'], $role['is_system_role']]);
    }

    $permissions = [
        'snippets.create', 'snippets.read', 'snippets.update', 'snippets.delete',
        'users.read', 'users.update', 'users.delete',
        'admin.access', 'admin.users', 'admin.audit'
    ];

    $permStmt = $db->prepare("
        INSERT IGNORE INTO permissions (name, description)
        VALUES (?, ?)
    ");

    foreach ($permissions as $perm) {
        $permStmt->execute([$perm, ucfirst(str_replace('.', ' ', $perm))]);
    }

    echo "    Created " . count($roles) . " roles and " . count($permissions) . " permissions\n";
}

/**
 * Seed sample snippets
 */
function seedSnippets(PDO $db): void
{
    echo "  Seeding snippets...\n";

    $snippets = [
        [
            'title' => 'Hello World - JavaScript',
            'description' => 'Classic Hello World example in JavaScript',
            'language' => 'javascript',
            'code' => "console.log('Hello, World!');"
        ],
        [
            'title' => 'Array Map Example',
            'description' => 'Transform array elements using map()',
            'language' => 'javascript',
            'code' => "const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log(doubled); // [2, 4, 6, 8, 10]"
        ],
        [
            'title' => 'PDO Connection',
            'description' => 'Secure database connection with PDO',
            'language' => 'php',
            'code' => "<?php\n\$pdo = new PDO(\n    'mysql:host=localhost;dbname=mydb',\n    \$user,\n    \$password,\n    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]\n);"
        ],
        [
            'title' => 'CSS Flexbox Center',
            'description' => 'Center content using Flexbox',
            'language' => 'css',
            'code' => ".container {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    min-height: 100vh;\n}"
        ],
        [
            'title' => 'Python List Comprehension',
            'description' => 'Filter and transform lists elegantly',
            'language' => 'python',
            'code' => "squares = [x**2 for x in range(10) if x % 2 == 0]\nprint(squares)  # [0, 4, 16, 36, 64]"
        ]
    ];

    // Get admin user ID
    $adminId = $db->query("SELECT id FROM users WHERE username = 'admin' LIMIT 1")->fetchColumn();
    if (!$adminId) $adminId = 1;

    $snippetStmt = $db->prepare("
        INSERT INTO snippets (author_id, title, description, language, visibility)
        VALUES (?, ?, ?, ?, 'public')
    ");

    $versionStmt = $db->prepare("
        INSERT INTO snippet_versions (snippet_id, version_number, code, checksum, editor_id, change_summary)
        VALUES (?, 1, ?, ?, ?, 'Initial version')
    ");

    foreach ($snippets as $snippet) {
        $snippetStmt->execute([
            $adminId,
            $snippet['title'],
            $snippet['description'],
            $snippet['language']
        ]);
        
        $snippetId = $db->lastInsertId();
        $checksum = hash('sha256', $snippet['code']);
        
        $versionStmt->execute([$snippetId, $snippet['code'], $checksum, $adminId]);
    }

    echo "    Created " . count($snippets) . " snippets\n";
}

/**
 * Seed tags
 */
function seedTags(PDO $db): void
{
    echo "  Seeding tags...\n";

    $tags = [
        ['name' => 'JavaScript', 'slug' => 'javascript'],
        ['name' => 'PHP', 'slug' => 'php'],
        ['name' => 'Python', 'slug' => 'python'],
        ['name' => 'CSS', 'slug' => 'css'],
        ['name' => 'React', 'slug' => 'react'],
        ['name' => 'Vue.js', 'slug' => 'vuejs'],
        ['name' => 'Node.js', 'slug' => 'nodejs'],
        ['name' => 'SQL', 'slug' => 'sql'],
        ['name' => 'API', 'slug' => 'api'],
        ['name' => 'Tutorial', 'slug' => 'tutorial']
    ];

    $stmt = $db->prepare("
        INSERT INTO tags (name, slug, description)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name)
    ");

    foreach ($tags as $tag) {
        $stmt->execute([$tag['name'], $tag['slug'], "Snippets related to {$tag['name']}"]);
    }

    echo "    Created " . count($tags) . " tags\n";
}

// Execute seeding
echo "CodeEngage Database Seeder\n";
echo "==========================\n";
echo "Started: " . date('Y-m-d H:i:s') . "\n\n";

try {
    $db = createConnection($config);
    
    if ($freshSeed) {
        echo "Fresh seed: Truncating tables...\n";
        $db->exec("SET FOREIGN_KEY_CHECKS = 0");
        $db->exec("TRUNCATE TABLE snippet_versions");
        $db->exec("TRUNCATE TABLE snippets");
        $db->exec("TRUNCATE TABLE users");
        $db->exec("SET FOREIGN_KEY_CHECKS = 1");
    }

    seedUsers($db);
    seedRolesAndPermissions($db);
    seedTags($db);
    seedSnippets($db);

    echo "\nStatus: SUCCESS\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Status: FAILED\n";
    exit(1);
}

echo "Completed: " . date('Y-m-d H:i:s') . "\n";
