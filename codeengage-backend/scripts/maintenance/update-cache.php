<?php
/**
 * Cache Update Script
 * 
 * Maintains cache health by invalidating stale entries and warming up frequently accessed data.
 * Designed for hourly cron execution: 0 * * * * php /path/to/update-cache.php
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
$cacheDir = __DIR__ . '/../../storage/cache';

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
 * Get cache statistics
 */
function getCacheStats(string $dir): array
{
    $stats = [
        'total_files' => 0,
        'total_bytes' => 0,
        'expired' => 0,
        'valid' => 0
    ];

    if (!is_dir($dir)) {
        return $stats;
    }

    foreach (glob("{$dir}/*/*.cache") as $file) {
        $stats['total_files']++;
        $stats['total_bytes'] += filesize($file);

        // Check if cache is expired (older than 1 hour)
        if (filemtime($file) < time() - 3600) {
            $stats['expired']++;
        } else {
            $stats['valid']++;
        }
    }

    return $stats;
}

/**
 * Invalidate expired cache entries
 */
function invalidateExpiredCache(string $dir, int $maxAgeSeconds = 3600): int
{
    $invalidated = 0;
    
    if (!is_dir($dir)) {
        return $invalidated;
    }

    $cutoff = time() - $maxAgeSeconds;

    foreach (glob("{$dir}/*/*.cache") as $file) {
        if (filemtime($file) < $cutoff) {
            unlink($file);
            $invalidated++;
        }
    }

    return $invalidated;
}

/**
 * Warm up popular snippets cache
 */
function warmupPopularSnippets(PDO $db, string $cacheDir): int
{
    $warmed = 0;
    $snippetCacheDir = "{$cacheDir}/snippets";
    
    if (!is_dir($snippetCacheDir)) {
        mkdir($snippetCacheDir, 0755, true);
    }

    // Get top 20 most viewed public snippets
    $stmt = $db->query("
        SELECT s.id, s.title, s.language, s.view_count, sv.code
        FROM snippets s
        JOIN snippet_versions sv ON s.id = sv.snippet_id
        WHERE s.visibility = 'public' 
          AND s.deleted_at IS NULL
          AND sv.version_number = (
              SELECT MAX(version_number) FROM snippet_versions WHERE snippet_id = s.id
          )
        ORDER BY s.view_count DESC
        LIMIT 20
    ");

    while ($snippet = $stmt->fetch()) {
        $cacheKey = "snippet_{$snippet['id']}";
        $cacheFile = "{$snippetCacheDir}/{$cacheKey}.cache";
        
        $data = [
            'id' => $snippet['id'],
            'title' => $snippet['title'],
            'language' => $snippet['language'],
            'code' => $snippet['code'],
            'cached_at' => time()
        ];

        file_put_contents($cacheFile, serialize($data));
        $warmed++;
    }

    return $warmed;
}

/**
 * Warm up tag cloud cache
 */
function warmupTagCloud(PDO $db, string $cacheDir): bool
{
    $queryCacheDir = "{$cacheDir}/query";
    
    if (!is_dir($queryCacheDir)) {
        mkdir($queryCacheDir, 0755, true);
    }

    $stmt = $db->query("
        SELECT t.id, t.name, t.slug, COUNT(st.snippet_id) as usage_count
        FROM tags t
        LEFT JOIN snippet_tags st ON t.id = st.tag_id
        GROUP BY t.id
        ORDER BY usage_count DESC
        LIMIT 50
    ");

    $tags = $stmt->fetchAll();
    $cacheFile = "{$queryCacheDir}/tag_cloud.cache";

    return file_put_contents($cacheFile, serialize([
        'tags' => $tags,
        'cached_at' => time()
    ])) !== false;
}

/**
 * Warm up language stats cache
 */
function warmupLanguageStats(PDO $db, string $cacheDir): bool
{
    $queryCacheDir = "{$cacheDir}/query";
    
    if (!is_dir($queryCacheDir)) {
        mkdir($queryCacheDir, 0755, true);
    }

    $stmt = $db->query("
        SELECT language, COUNT(*) as count
        FROM snippets
        WHERE visibility = 'public' AND deleted_at IS NULL
        GROUP BY language
        ORDER BY count DESC
    ");

    $stats = $stmt->fetchAll();
    $cacheFile = "{$queryCacheDir}/language_stats.cache";

    return file_put_contents($cacheFile, serialize([
        'stats' => $stats,
        'cached_at' => time()
    ])) !== false;
}

// Execute cache update
echo "CodeEngage Cache Update\n";
echo "=======================\n";
echo "Started: " . date('Y-m-d H:i:s') . "\n\n";

$stats = [
    'invalidated' => 0,
    'snippets_warmed' => 0,
    'tag_cloud' => false,
    'language_stats' => false
];

try {
    $db = createConnection($config);

    // Get current cache status
    echo "Cache status:\n";
    $cacheStats = getCacheStats($cacheDir);
    echo "  - Total files: {$cacheStats['total_files']}\n";
    echo "  - Total size: " . round($cacheStats['total_bytes'] / 1024, 2) . " KB\n";
    echo "  - Expired: {$cacheStats['expired']}\n";
    echo "  - Valid: {$cacheStats['valid']}\n";

    // Invalidate expired cache
    echo "\nCache invalidation:\n";
    $stats['invalidated'] = invalidateExpiredCache($cacheDir);
    echo "  - Removed {$stats['invalidated']} expired entries\n";

    // Warm up caches
    echo "\nCache warmup:\n";
    
    $stats['snippets_warmed'] = warmupPopularSnippets($db, $cacheDir);
    echo "  - Popular snippets: {$stats['snippets_warmed']}\n";

    $stats['tag_cloud'] = warmupTagCloud($db, $cacheDir);
    echo "  - Tag cloud: " . ($stats['tag_cloud'] ? 'OK' : 'FAILED') . "\n";

    $stats['language_stats'] = warmupLanguageStats($db, $cacheDir);
    echo "  - Language stats: " . ($stats['language_stats'] ? 'OK' : 'FAILED') . "\n";

    echo "\nStatus: SUCCESS\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Status: FAILED\n";
    exit(1);
}

echo "Completed: " . date('Y-m-d H:i:s') . "\n";
