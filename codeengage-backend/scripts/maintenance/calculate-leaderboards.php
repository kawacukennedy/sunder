<?php
/**
 * Leaderboard Calculation Script
 * 
 * Calculates and stores leaderboard rankings for daily, weekly, monthly, and all-time periods.
 * Designed for daily cron execution: 0 5 * * * php /path/to/calculate-leaderboards.php
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
$cacheDir = __DIR__ . '/../../storage/cache/leaderboards';

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
 * Calculate leaderboard for a time period
 */
function calculateLeaderboard(PDO $db, string $period): array
{
    $dateFilter = match($period) {
        'daily' => 'DATE(a.earned_at) = CURDATE()',
        'weekly' => 'a.earned_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)',
        'monthly' => 'a.earned_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
        'all_time' => '1=1',
        default => '1=1'
    };

    $stmt = $db->query("
        SELECT 
            u.id,
            u.username,
            u.display_name,
            u.avatar_url,
            COALESCE(SUM(a.points_awarded), 0) as period_points,
            u.achievement_points as total_points,
            COUNT(DISTINCT a.id) as achievements_earned,
            (SELECT COUNT(*) FROM snippets s WHERE s.author_id = u.id AND s.deleted_at IS NULL) as snippet_count
        FROM users u
        LEFT JOIN achievements a ON u.id = a.user_id AND {$dateFilter}
        WHERE u.deleted_at IS NULL
        GROUP BY u.id
        ORDER BY period_points DESC, total_points DESC
        LIMIT 100
    ");

    $users = $stmt->fetchAll();
    
    // Add rankings
    $rank = 0;
    $lastPoints = null;
    foreach ($users as $i => &$user) {
        if ($user['period_points'] !== $lastPoints) {
            $rank = $i + 1;
        }
        $user['rank'] = $rank;
        $lastPoints = $user['period_points'];
    }

    return $users;
}

/**
 * Calculate top contributors by snippets
 */
function calculateTopContributors(PDO $db): array
{
    $stmt = $db->query("
        SELECT 
            u.id,
            u.username,
            u.display_name,
            u.avatar_url,
            COUNT(s.id) as snippet_count,
            SUM(s.view_count) as total_views,
            SUM(s.star_count) as total_stars
        FROM users u
        JOIN snippets s ON u.id = s.author_id
        WHERE u.deleted_at IS NULL 
          AND s.deleted_at IS NULL
          AND s.visibility = 'public'
        GROUP BY u.id
        HAVING snippet_count > 0
        ORDER BY snippet_count DESC, total_stars DESC
        LIMIT 50
    ");

    return $stmt->fetchAll();
}

/**
 * Calculate trending users (most activity in last 7 days)
 */
function calculateTrendingUsers(PDO $db): array
{
    $stmt = $db->query("
        SELECT 
            u.id,
            u.username,
            u.display_name,
            u.avatar_url,
            COUNT(DISTINCT s.id) as recent_snippets,
            COALESCE(SUM(a.points_awarded), 0) as recent_points
        FROM users u
        LEFT JOIN snippets s ON u.id = s.author_id 
            AND s.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND s.deleted_at IS NULL
        LEFT JOIN achievements a ON u.id = a.user_id 
            AND a.earned_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        WHERE u.deleted_at IS NULL
        GROUP BY u.id
        HAVING recent_snippets > 0 OR recent_points > 0
        ORDER BY recent_points DESC, recent_snippets DESC
        LIMIT 20
    ");

    return $stmt->fetchAll();
}

/**
 * Store leaderboard data
 */
function storeLeaderboard(string $cacheDir, string $name, array $data): bool
{
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0755, true);
    }

    $cacheFile = "{$cacheDir}/{$name}.json";
    
    $payload = [
        'data' => $data,
        'generated_at' => date('c'),
        'count' => count($data)
    ];

    return file_put_contents($cacheFile, json_encode($payload, JSON_PRETTY_PRINT)) !== false;
}

// Execute leaderboard calculation
echo "CodeEngage Leaderboard Calculator\n";
echo "==================================\n";
echo "Started: " . date('Y-m-d H:i:s') . "\n\n";

$results = [
    'daily' => 0,
    'weekly' => 0,
    'monthly' => 0,
    'all_time' => 0,
    'contributors' => 0,
    'trending' => 0
];

try {
    $db = createConnection($config);

    // Calculate period leaderboards
    echo "Calculating leaderboards:\n";
    
    foreach (['daily', 'weekly', 'monthly', 'all_time'] as $period) {
        $leaderboard = calculateLeaderboard($db, $period);
        $results[$period] = count($leaderboard);
        
        if (storeLeaderboard($cacheDir, "leaderboard_{$period}", $leaderboard)) {
            echo "  - {$period}: {$results[$period]} entries\n";
        } else {
            echo "  - {$period}: FAILED\n";
        }
    }

    // Calculate top contributors
    echo "\nCalculating top contributors:\n";
    $contributors = calculateTopContributors($db);
    $results['contributors'] = count($contributors);
    
    if (storeLeaderboard($cacheDir, 'top_contributors', $contributors)) {
        echo "  - Top contributors: {$results['contributors']} entries\n";
    } else {
        echo "  - Top contributors: FAILED\n";
    }

    // Calculate trending users
    echo "\nCalculating trending users:\n";
    $trending = calculateTrendingUsers($db);
    $results['trending'] = count($trending);
    
    if (storeLeaderboard($cacheDir, 'trending_users', $trending)) {
        echo "  - Trending users: {$results['trending']} entries\n";
    } else {
        echo "  - Trending users: FAILED\n";
    }

    // Update user achievement points (aggregate)
    echo "\nUpdating aggregate points:\n";
    $updateStmt = $db->query("
        UPDATE users u
        SET achievement_points = (
            SELECT COALESCE(SUM(points_awarded), 0)
            FROM achievements
            WHERE user_id = u.id
        )
    ");
    echo "  - Updated {$updateStmt->rowCount()} user(s)\n";

    echo "\nStatus: SUCCESS\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Status: FAILED\n";
    exit(1);
}

// Summary
$total = array_sum($results);
echo "\nTotal entries calculated: {$total}\n";
echo "Completed: " . date('Y-m-d H:i:s') . "\n";
