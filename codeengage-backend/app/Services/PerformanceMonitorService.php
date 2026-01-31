<?php

namespace App\Services;

use App\Helpers\Logger;
use PDO;

/**
 * Performance Monitoring Service
 */
class PerformanceMonitorService
{
    private Logger $logger;
    private array $config;
    private array $metrics = [];
    private array $thresholds = [
        'response_time_ms' => 1000,      // 1 second
        'memory_usage_mb' => 128,        // 128 MB
        'cpu_time_ms' => 500,           // 500ms
        'query_time_ms' => 100,           // 100ms
        'file_size_kb' => 10240,          // 10MB
        'concurrent_requests' => 100
    ];

    public function __construct(PDO $db = null)
    {
        $this->logger = new Logger();
        $this->config = require __DIR__ . '/../../config/app.php';
    }

    /**
     * Start monitoring a request or operation
     */
    public function startOperation(string $operationId, array $context = []): void
    {
        $this->metrics[$operationId] = [
            'start_time' => microtime(true),
            'start_memory' => memory_get_usage(true),
            'peak_memory' => memory_get_peak_usage(true),
            'context' => $context,
            'events' => []
        ];
    }

    /**
     * End monitoring and record metrics
     */
    public function endOperation(string $operationId, array $result = []): array
    {
        if (!isset($this->metrics[$operationId])) {
            return [];
        }

        $metrics = $this->metrics[$operationId];
        $endTime = microtime(true);
        $endMemory = memory_get_usage(true);

        $performanceData = [
            'operation_id' => $operationId,
            'start_time' => $metrics['start_time'],
            'end_time' => $endTime,
            'duration_ms' => round(($endTime - $metrics['start_time']) * 1000, 2),
            'memory_start_bytes' => $metrics['start_memory'],
            'memory_end_bytes' => $endMemory,
            'memory_used_bytes' => $endMemory - $metrics['start_memory'],
            'memory_peak_bytes' => memory_get_peak_usage(true),
            'memory_used_mb' => round(($endMemory - $metrics['start_memory']) / 1024 / 1024, 2),
            'memory_peak_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
            'context' => $metrics['context'],
            'result' => $result,
            'events' => $metrics['events'],
            'timestamp' => date('Y-m-d H:i:s'),
            'request_id' => $_SERVER['REQUEST_ID'] ?? uniqid('perf_', true)
        ];

        // Check for performance issues
        $this->checkPerformanceThresholds($operationId, $performanceData);

        // Store in database if configured
        $this->storePerformanceData($performanceData);

        // Clean up metrics
        unset($this->metrics[$operationId]);

        return $performanceData;
    }

    /**
     * Add an event during operation monitoring
     */
    public function addEvent(string $operationId, string $eventType, array $data = []): void
    {
        if (!isset($this->metrics[$operationId])) {
            return;
        }

        $this->metrics[$operationId]['events'][] = [
            'type' => $eventType,
            'timestamp' => microtime(true),
            'data' => $data
        ];
    }

    /**
     * Monitor database query performance
     */
    public function monitorQuery(string $sql, array $params = [], float $executionTime = null): array
    {
        $startTime = microtime(true);
        
        // Simulate query execution (in real implementation, this would be done in LoggedPDO)
        if ($executionTime === null) {
            // This would be the actual query execution
            $executionTime = (microtime(true) - $startTime) * 1000;
        }

        $queryMetrics = [
            'sql_hash' => md5($sql),
            'sql_template' => $this->sanitizeSql($sql),
            'execution_time_ms' => round($executionTime, 2),
            'param_count' => count($params),
            'timestamp' => date('Y-m-d H:i:s')
        ];

        // Check query performance
        if ($executionTime > $this->thresholds['query_time_ms']) {
            $this->logger->warn('Slow query detected', [
                'query_time_ms' => round($executionTime, 2),
                'threshold_ms' => $this->thresholds['query_time_ms'],
                'sql_template' => $queryMetrics['sql_template'],
                'param_count' => $queryMetrics['param_count'],
                'request_id' => $_SERVER['REQUEST_ID'] ?? null
            ]);
        }

        return $queryMetrics;
    }

    /**
     * Monitor file operation performance
     */
    public function monitorFileOperation(string $operation, string $filePath, int $fileSize = null): array
    {
        $startTime = microtime(true);
        
        $fileMetrics = [
            'operation' => $operation, // read, write, upload, delete
            'file_path' => $filePath,
            'file_size_bytes' => $fileSize ?? filesize($filePath),
            'start_time' => $startTime
        ];

        return $fileMetrics;
    }

    /**
     * Complete file operation monitoring
     */
    public function completeFileOperation(array $fileMetrics): array
    {
        $endTime = microtime(true);
        $durationMs = round(($endTime - $fileMetrics['start_time']) * 1000, 2);

        $performanceData = [
            'operation' => $fileMetrics['operation'],
            'file_path' => $fileMetrics['file_path'],
            'file_size_bytes' => $fileMetrics['file_size_bytes'],
            'file_size_kb' => round($fileMetrics['file_size_bytes'] / 1024, 2),
            'duration_ms' => $durationMs,
            'throughput_kbps' => $durationMs > 0 ? round($fileMetrics['file_size_bytes'] / 1024 / ($durationMs / 1000), 2) : 0,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        // Check file performance
        if ($fileMetrics['file_size_bytes'] > $this->thresholds['file_size_kb'] * 1024) {
            $this->logger->warn('Large file operation', [
                'operation' => $fileMetrics['operation'],
                'file_size_kb' => $performanceData['file_size_kb'],
                'threshold_kb' => $this->thresholds['file_size_kb'],
                'request_id' => $_SERVER['REQUEST_ID'] ?? null
            ]);
        }

        return $performanceData;
    }

    /**
     * Monitor API endpoint performance
     */
    public function monitorApiCall(string $method, string $endpoint, callable $operation): array
    {
        $operationId = uniqid('api_', true);
        $this->startOperation($operationId, [
            'type' => 'api_call',
            'method' => $method,
            'endpoint' => $endpoint
        ]);

        try {
            $result = $operation();
            $performanceData = $this->endOperation($operationId, [
                'success' => true,
                'response_size' => strlen(json_encode($result ?? []))
            ]);
            
            return [
                'result' => $result,
                'performance' => $performanceData
            ];
        } catch (\Exception $e) {
            $performanceData = $this->endOperation($operationId, [
                'success' => false,
                'error' => $e->getMessage(),
                'error_type' => get_class($e)
            ]);
            
            throw $e;
        }
    }

    /**
     * Check performance against thresholds
     */
    private function checkPerformanceThresholds(string $operationId, array $performanceData): void
    {
        $violations = [];

        // Check response time
        if ($performanceData['duration_ms'] > $this->thresholds['response_time_ms']) {
            $violations[] = [
                'type' => 'response_time',
                'value' => $performanceData['duration_ms'],
                'threshold' => $this->thresholds['response_time_ms'],
                'severity' => $this->getSeverity($performanceData['duration_ms'], $this->thresholds['response_time_ms'])
            ];
        }

        // Check memory usage
        if ($performanceData['memory_used_mb'] > $this->thresholds['memory_usage_mb']) {
            $violations[] = [
                'type' => 'memory_usage',
                'value' => $performanceData['memory_used_mb'],
                'threshold' => $this->thresholds['memory_usage_mb'],
                'severity' => $this->getSeverity($performanceData['memory_used_mb'], $this->thresholds['memory_usage_mb'])
            ];
        }

        // Check peak memory
        if ($performanceData['memory_peak_mb'] > $this->thresholds['memory_usage_mb'] * 2) {
            $violations[] = [
                'type' => 'peak_memory',
                'value' => $performanceData['memory_peak_mb'],
                'threshold' => $this->thresholds['memory_usage_mb'] * 2,
                'severity' => $this->getSeverity($performanceData['memory_peak_mb'], $this->thresholds['memory_usage_mb'] * 2)
            ];
        }

        // Log violations
        if (!empty($violations)) {
            $this->logger->warn('Performance threshold violations detected', [
                'operation_id' => $operationId,
                'violations' => $violations,
                'performance_data' => $performanceData,
                'request_id' => $_SERVER['REQUEST_ID'] ?? null
            ]);
        }
    }

    /**
     * Get severity level based on value vs threshold
     */
    private function getSeverity(float $value, float $threshold): string
    {
        $ratio = $value / $threshold;
        
        if ($ratio < 1.5) return 'low';
        if ($ratio < 2.0) return 'medium';
        if ($ratio < 3.0) return 'high';
        return 'critical';
    }

    /**
     * Store performance data in database
     */
    private function storePerformanceData(array $performanceData): void
    {
        if (!$this->config['performance_monitoring']['enabled'] ?? false) {
            return;
        }

        try {
            // This would insert into a performance_metrics table
            // For now, just log the data
            $this->logger->log('Performance data recorded', 'DEBUG', [
                'operation_id' => $performanceData['operation_id'],
                'duration_ms' => $performanceData['duration_ms'],
                'memory_used_mb' => $performanceData['memory_used_mb'],
                'memory_peak_mb' => $performanceData['memory_peak_mb'],
                'context' => $performanceData['context']
            ]);
        } catch (\Exception $e) {
            $this->logger->log('Failed to store performance data', 'ERROR', [
                'error' => $e->getMessage(),
                'operation_id' => $performanceData['operation_id']
            ]);
        }
    }

    /**
     * Get system performance metrics
     */
    public function getSystemMetrics(): array
    {
        return [
            'timestamp' => date('Y-m-d H:i:s'),
            'memory' => [
                'current_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
                'peak_usage_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
                'limit_mb' => $this->getMemoryLimit(),
                'usage_percent' => $this->getMemoryUsagePercent()
            ],
            'cpu' => $this->getCpuUsage(),
            'disk' => $this->getDiskUsage(),
            'processes' => $this->getProcessCount(),
            'load_average' => sys_getloadavg()
        ];
    }

    /**
     * Get memory limit
     */
    private function getMemoryLimit(): int
    {
        $limit = ini_get('memory_limit');
        
        if ($limit === '-1') {
            return -1; // Unlimited
        }
        
        return $this->parseIniSize($limit);
    }

    /**
     * Get memory usage percentage
     */
    private function getMemoryUsagePercent(): float
    {
        $current = memory_get_usage(true);
        $limit = $this->getMemoryLimit();
        
        if ($limit <= 0) {
            return 0; // Unlimited or unknown
        }
        
        return round(($current / $limit) * 100, 2);
    }

    /**
     * Get CPU usage (simplified)
     */
    private function getCpuUsage(): array
    {
        // This is a simplified version - in production you'd want more detailed CPU monitoring
        $load = sys_getloadavg();
        
        return [
            'load_1min' => $load[0] ?? 0,
            'load_5min' => $load[1] ?? 0,
            'load_15min' => $load[2] ?? 0,
            'cpu_count' => $this->getCpuCount()
        ];
    }

    /**
     * Get CPU count
     */
    private function getCpuCount(): int
    {
        // Linux/Unix
        if (function_exists('shell_exec')) {
            $cpuCount = shell_exec('nproc');
            if (is_numeric($cpuCount)) {
                return (int)$cpuCount;
            }
        }
        
        // Fallback
        return 1;
    }

    /**
     * Get disk usage
     */
    private function getDiskUsage(): array
    {
        $root = '/';
        $total = disk_total_space($root);
        $free = disk_free_space($root);
        $used = $total - $free;

        return [
            'total_gb' => round($total / 1024 / 1024 / 1024, 2),
            'used_gb' => round($used / 1024 / 1024 / 1024, 2),
            'free_gb' => round($free / 1024 / 1024 / 1024, 2),
            'usage_percent' => $total > 0 ? round(($used / $total) * 100, 2) : 0
        ];
    }

    /**
     * Get process count
     */
    private function getProcessCount(): int
    {
        // This is a simplified version
        if (function_exists('shell_exec')) {
            $count = shell_exec('ps aux | wc -l');
            return is_numeric($count) ? (int)$count - 1 : 0; // Subtract header line
        }
        
        return 0;
    }

    /**
     * Parse INI size values
     */
    private function parseIniSize(string $size): int
    {
        $unit = strtoupper(substr($size, -1));
        $value = (int)substr($size, 0, -1);

        switch ($unit) {
            case 'G':
                return $value * 1024 * 1024 * 1024;
            case 'M':
                return $value * 1024 * 1024;
            case 'K':
                return $value * 1024;
            default:
                return (int)$size;
        }
    }

    /**
     * Sanitize SQL for logging
     */
    private function sanitizeSql(string $sql): string
    {
        // Remove sensitive data from SQL for logging
        $patterns = [
            '/(\'([^\']{8,})\'\)/', // Replace long string literals
            '/(\b\d{4,}\b)/',       // Replace long numbers
            '/(\b[0-9a-f]{32,}\b)/i' // Replace long hex strings (like passwords)
        ];
        
        return preg_replace($patterns, "('***')", $sql);
    }

    /**
     * Configure performance thresholds
     */
    public function setThresholds(array $thresholds): void
    {
        $this->thresholds = array_merge($this->thresholds, $thresholds);
    }

    /**
     * Get current thresholds
     */
    public function getThresholds(): array
    {
        return $this->thresholds;
    }

    /**
     * Get performance statistics for dashboard
     */
    public function getPerformanceStats(string $period = '24h'): array
    {
        // This would query performance_metrics table
        // For now, return current system metrics
        return [
            'current_metrics' => $this->getSystemMetrics(),
            'thresholds' => $this->thresholds,
            'period' => $period,
            'generated_at' => date('Y-m-d H:i:s')
        ];
    }
}