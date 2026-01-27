<?php
/**
 * Database Backup Script
 * 
 * Creates timestamped SQL backups of the CodeEngage database.
 * Designed for cron execution: 0 3 * * * php /path/to/backup.php
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

// Backup settings
$backupDir = __DIR__ . '/../../storage/backups';
$retentionDays = 30;
$timestamp = date('Y-m-d_H-i-s');
$backupFile = "{$backupDir}/codeengage_backup_{$timestamp}.sql";

// Ensure backup directory exists
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

/**
 * Create database backup using mysqldump
 */
function createBackup(array $config, string $outputFile): bool
{
    $host = $config['host'] ?? 'localhost';
    $dbName = $config['database'] ?? $config['name'] ?? 'codeengage';
    $user = $config['username'] ?? $config['user'] ?? 'root';
    $password = $config['password'] ?? '';

    // Build mysqldump command
    $command = sprintf(
        'mysqldump --host=%s --user=%s --password=%s --single-transaction --routines --triggers %s > %s 2>&1',
        escapeshellarg($host),
        escapeshellarg($user),
        escapeshellarg($password),
        escapeshellarg($dbName),
        escapeshellarg($outputFile)
    );

    exec($command, $output, $returnCode);

    return $returnCode === 0;
}

/**
 * Compress backup file using gzip
 */
function compressBackup(string $file): ?string
{
    $compressedFile = $file . '.gz';
    
    $fp = fopen($file, 'rb');
    $zp = gzopen($compressedFile, 'wb9');
    
    if (!$fp || !$zp) {
        return null;
    }

    while (!feof($fp)) {
        gzwrite($zp, fread($fp, 1024 * 512));
    }

    fclose($fp);
    gzclose($zp);
    unlink($file);

    return $compressedFile;
}

/**
 * Clean up old backups
 */
function cleanOldBackups(string $dir, int $retentionDays): int
{
    $cutoff = time() - ($retentionDays * 86400);
    $deleted = 0;

    foreach (glob("{$dir}/codeengage_backup_*.sql*") as $file) {
        if (filemtime($file) < $cutoff) {
            unlink($file);
            $deleted++;
        }
    }

    return $deleted;
}

// Execute backup
echo "CodeEngage Database Backup\n";
echo "=========================\n";
echo "Started: " . date('Y-m-d H:i:s') . "\n";

if (createBackup($config, $backupFile)) {
    echo "Backup created: {$backupFile}\n";
    
    // Compress
    $compressed = compressBackup($backupFile);
    if ($compressed) {
        $size = round(filesize($compressed) / 1024 / 1024, 2);
        echo "Compressed: {$compressed} ({$size} MB)\n";
    }
    
    // Cleanup old backups
    $deleted = cleanOldBackups($backupDir, $retentionDays);
    if ($deleted > 0) {
        echo "Cleaned up {$deleted} old backup(s)\n";
    }
    
    echo "Status: SUCCESS\n";
} else {
    echo "Status: FAILED\n";
    exit(1);
}

echo "Completed: " . date('Y-m-d H:i:s') . "\n";
