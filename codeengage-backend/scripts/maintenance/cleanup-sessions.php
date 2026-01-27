<?php
/**
 * Session Cleanup Script
 * 
 * Removes expired collaboration sessions and temporary files.
 * Designed for daily cron execution: 0 4 * * * php /path/to/cleanup-sessions.php
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

// Cleanup settings
$sessionExpiryHours = 24;
$tempFileExpiryHours = 48;
$tempDir = __DIR__ . '/../../storage/temp';

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
 * Clean expired collaboration sessions
 */
function cleanExpiredSessions(PDO $db, int $expiryHours): int
{
    $stmt = $db->prepare("
        DELETE FROM collaboration_sessions 
        WHERE last_activity < DATE_SUB(NOW(), INTERVAL ? HOUR)
    ");
    $stmt->execute([$expiryHours]);
    
    return $stmt->rowCount();
}

/**
 * Clean old login attempts
 */
function cleanLoginAttempts(PDO $db): int
{
    $stmt = $db->query("
        DELETE FROM login_attempts 
        WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 7 DAY)
    ");
    
    return $stmt->rowCount();
}

/**
 * Clean expired password reset tokens
 */
function cleanPasswordResets(PDO $db): int
{
    $stmt = $db->query("
        DELETE FROM password_resets 
        WHERE expires_at < NOW()
    ");
    
    return $stmt->rowCount();
}

/**
 * Clean temporary files
 */
function cleanTempFiles(string $dir, int $expiryHours): array
{
    $stats = ['files' => 0, 'bytes' => 0];
    
    if (!is_dir($dir)) {
        return $stats;
    }

    $cutoff = time() - ($expiryHours * 3600);
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($iterator as $file) {
        if ($file->isFile() && $file->getMTime() < $cutoff) {
            $stats['bytes'] += $file->getSize();
            $stats['files']++;
            unlink($file->getPathname());
        }
    }

    // Remove empty directories
    foreach ($iterator as $dir) {
        if ($dir->isDir()) {
            @rmdir($dir->getPathname());
        }
    }

    return $stats;
}

/**
 * Clean old cache files
 */
function cleanCacheFiles(string $cacheDir): int
{
    $deleted = 0;
    
    if (!is_dir($cacheDir)) {
        return $deleted;
    }

    $cutoff = time() - 86400; // 24 hours
    
    foreach (glob("{$cacheDir}/*.cache") as $file) {
        if (filemtime($file) < $cutoff) {
            unlink($file);
            $deleted++;
        }
    }

    return $deleted;
}

// Execute cleanup
echo "CodeEngage Session Cleanup\n";
echo "==========================\n";
echo "Started: " . date('Y-m-d H:i:s') . "\n\n";

$stats = [
    'sessions' => 0,
    'login_attempts' => 0,
    'password_resets' => 0,
    'temp_files' => 0,
    'temp_bytes' => 0,
    'cache_files' => 0
];

try {
    $db = createConnection($config);

    // Database cleanup
    echo "Database cleanup:\n";
    
    $stats['sessions'] = cleanExpiredSessions($db, $sessionExpiryHours);
    echo "  - Expired sessions: {$stats['sessions']}\n";

    $stats['login_attempts'] = cleanLoginAttempts($db);
    echo "  - Old login attempts: {$stats['login_attempts']}\n";

    $stats['password_resets'] = cleanPasswordResets($db);
    echo "  - Expired password resets: {$stats['password_resets']}\n";

    // File cleanup
    echo "\nFile cleanup:\n";
    
    $tempStats = cleanTempFiles($tempDir, $tempFileExpiryHours);
    $stats['temp_files'] = $tempStats['files'];
    $stats['temp_bytes'] = $tempStats['bytes'];
    $sizeMB = round($stats['temp_bytes'] / 1024 / 1024, 2);
    echo "  - Temp files: {$stats['temp_files']} ({$sizeMB} MB)\n";

    $cacheDir = __DIR__ . '/../../storage/cache';
    $stats['cache_files'] = cleanCacheFiles($cacheDir);
    echo "  - Stale cache files: {$stats['cache_files']}\n";

    echo "\nStatus: SUCCESS\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Status: FAILED\n";
    exit(1);
}

// Summary
$total = array_sum($stats);
echo "\nTotal items cleaned: {$total}\n";
echo "Completed: " . date('Y-m-d H:i:s') . "\n";
