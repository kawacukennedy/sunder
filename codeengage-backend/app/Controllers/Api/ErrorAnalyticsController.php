<?php

namespace App\Controllers\Api;

use App\Helpers\ApiResponse;
use PDO;

class ErrorAnalyticsController extends BaseController
{
    /**
     * Get error analytics overview
     */
    public function overview($method, $params)
    {
        $this->requireGet($method);
        $this->requireAuth();
        $this->setResponseHeaders();

        try {
            $period = $_GET['period'] ?? '24h';
            $stats = $this->getErrorOverview($period);
            
            ApiResponse::success($stats, 'Error analytics overview retrieved successfully');

        } catch (\Exception $e) {
            $this->handleException($e, [
                'error_type' => 'analytics_failed',
                'action' => 'get_error_overview'
            ], 500);
        }
    }

    /**
     * Get frontend error statistics
     */
    public function frontendErrors($method, $params)
    {
        $this->requireGet($method);
        $this->requireAuth();
        $this->setResponseHeaders();

        try {
            $period = $_GET['period'] ?? '24h';
            $errors = $this->getFrontendErrorStats($period);
            
            ApiResponse::success($errors, 'Frontend error statistics retrieved successfully');

        } catch (\Exception $e) {
            $this->handleException($e, [
                'error_type' => 'analytics_failed',
                'action' => 'get_frontend_errors'
            ], 500);
        }
    }

    /**
     * Get backend error statistics
     */
    public function backendErrors($method, $params)
    {
        $this->requireGet($method);
        $this->requireAuth();
        $this->setResponseHeaders();

        try {
            $period = $_GET['period'] ?? '24h';
            $errors = $this->getBackendErrorStats($period);
            
            ApiResponse::success($errors, 'Backend error statistics retrieved successfully');

        } catch (\Exception $e) {
            $this->handleException($e, [
                'error_type' => 'analytics_failed',
                'action' => 'get_backend_errors'
            ], 500);
        }
    }

    /**
     * Get security event statistics
     */
    public function securityEvents($method, $params)
    {
        $this->requireGet($method);
        $this->requireAuth();
        $this->setResponseHeaders();

        try {
            $period = $_GET['period'] ?? '24h';
            $events = $this->getSecurityEventStats($period);
            
            ApiResponse::success($events, 'Security event statistics retrieved successfully');

        } catch (\Exception $e) {
            $this->handleException($e, [
                'error_type' => 'analytics_failed',
                'action' => 'get_security_events'
            ], 500);
        }
    }

    /**
     * Get performance statistics
     */
    public function performance($method, $params)
    {
        $this->requireGet($method);
        $this->requireAuth();
        $this->setResponseHeaders();

        try {
            $period = $_GET['period'] ?? '24h';
            $performance = $this->getPerformanceStats($period);
            
            ApiResponse::success($performance, 'Performance statistics retrieved successfully');

        } catch (\Exception $e) {
            $this->handleException($e, [
                'error_type' => 'analytics_failed',
                'action' => 'get_performance_stats'
            ], 500);
        }
    }

    /**
     * Get error trends over time
     */
    public function trends($method, $params)
    {
        $this->requireGet($method);
        $this->requireAuth();
        $this->setResponseHeaders();

        try {
            $period = $_GET['period'] ?? '24h';
            $granularity = $_GET['granularity'] ?? 'hour';
            $trends = $this->getErrorTrends($period, $granularity);
            
            ApiResponse::success($trends, 'Error trends retrieved successfully');

        } catch (\Exception $e) {
            $this->handleException($e, [
                'error_type' => 'analytics_failed',
                'action' => 'get_error_trends'
            ], 500);
        }
    }

    /**
     * Get top error patterns
     */
    public function patterns($method, $params)
    {
        $this->requireGet($method);
        $this->requireAuth();
        $this->setResponseHeaders();

        try {
            $period = $_GET['period'] ?? '24h';
            $patterns = $this->getErrorPatterns($period);
            
            ApiResponse::success($patterns, 'Error patterns retrieved successfully');

        } catch (\Exception $e) {
            $this->handleException($e, [
                'error_type' => 'analytics_failed',
                'action' => 'get_error_patterns'
            ], 500);
        }
    }

    /**
     * Get error heatmap data
     */
    public function heatmap($method, $params)
    {
        $this->requireGet($method);
        $this->requireAuth();
        $this->setResponseHeaders();

        try {
            $period = $_GET['period'] ?? '7d';
            $heatmap = $this->getErrorHeatmap($period);
            
            ApiResponse::success($heatmap, 'Error heatmap data retrieved successfully');

        } catch (\Exception $e) {
            $this->handleException($e, [
                'error_type' => 'analytics_failed',
                'action' => 'get_error_heatmap'
            ], 500);
        }
    }

    /**
     * Export error analytics data
     */
    public function export($method, $params)
    {
        $this->requireGet($method);
        $this->requireAuth();
        $this->setResponseHeaders();

        try {
            $period = $_GET['period'] ?? '24h';
            $format = $_GET['format'] ?? 'json';
            $type = $_GET['type'] ?? 'all';

            $data = $this->exportErrorData($period, $format, $type);
            
            ApiResponse::success($data, 'Error data exported successfully');

        } catch (\Exception $e) {
            $this->handleException($e, [
                'error_type' => 'analytics_failed',
                'action' => 'export_error_data'
            ], 500);
        }
    }

    /**
     * Get comprehensive error overview
     */
    private function getErrorOverview(string $period): array
    {
        $timeFilter = $this->getTimeFilter($period);

        try {
            // Frontend errors
            $frontendStats = $this->db->query("
                SELECT 
                    COUNT(*) as total_errors,
                    COUNT(DISTINCT user_id) as affected_users,
                    COUNT(DISTINCT session_id) as affected_sessions,
                    COUNT(DISTINCT error_type) as unique_error_types,
                    COUNT(DISTINCT request_id) as unique_requests
                FROM frontend_errors 
                WHERE created_at >= {$timeFilter}
            ")->fetch(PDO::FETCH_ASSOC);

            // Backend errors from logs (simplified)
            $backendStats = $this->getBackendLogStats($period);

            // Security events
            $securityStats = $this->db->query("
                SELECT 
                    COUNT(*) as total_events,
                    COUNT(DISTINCT client_ip) as unique_ips,
                    COUNT(DISTINCT user_id) as affected_users,
                    COUNT(DISTINCT event_type) as unique_event_types,
                    SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_events,
                    SUM(CASE WHEN severity = 'error' THEN 1 ELSE 0 END) as error_events
                FROM security_events 
                WHERE timestamp >= {$timeFilter}
            ")->fetch(PDO::FETCH_ASSOC);

            return [
                'period' => $period,
                'frontend_errors' => $frontendStats,
                'backend_errors' => $backendStats,
                'security_events' => $securityStats,
                'health_score' => $this->calculateHealthScore($frontendStats, $backendStats, $securityStats),
                'generated_at' => date('Y-m-d H:i:s')
            ];

        } catch (\Exception $e) {
            // Return empty stats if tables don't exist
            return [
                'period' => $period,
                'frontend_errors' => ['total_errors' => 0],
                'backend_errors' => ['total_errors' => 0],
                'security_events' => ['total_events' => 0],
                'health_score' => 100,
                'generated_at' => date('Y-m-d H:i:s'),
                'error' => 'Tables not created yet'
            ];
        }
    }

    /**
     * Get frontend error statistics
     */
    private function getFrontendErrorStats(string $period): array
    {
        $timeFilter = $this->getTimeFilter($period);

        try {
            // Top errors
            $topErrors = $this->db->query("
                SELECT message, COUNT(*) as count, COUNT(DISTINCT user_id) as affected_users
                FROM frontend_errors 
                WHERE created_at >= {$timeFilter}
                GROUP BY message 
                ORDER BY count DESC 
                LIMIT 10
            ")->fetchAll(PDO::FETCH_ASSOC);

            // Errors by type
            $errorsByType = $this->db->query("
                SELECT error_type, COUNT(*) as count, COUNT(DISTINCT user_id) as affected_users
                FROM frontend_errors 
                WHERE created_at >= {$timeFilter}
                GROUP BY error_type 
                ORDER BY count DESC
            ")->fetchAll(PDO::FETCH_ASSOC);

            // Errors by hour
            $errorsByHour = $this->db->query("
                SELECT HOUR(created_at) as hour, COUNT(*) as count
                FROM frontend_errors 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                GROUP BY HOUR(created_at) 
                ORDER BY hour
            ")->fetchAll(PDO::FETCH_ASSOC);

            // Browser statistics
            $errorsByBrowser = $this->db->query("
                SELECT 
                    SUBSTRING_INDEX(SUBSTRING_INDEX(user_agent, ' ', 1), '/', 1) as browser,
                    COUNT(*) as count
                FROM frontend_errors 
                WHERE created_at >= {$timeFilter}
                    AND user_agent IS NOT NULL
                    AND user_agent != 'unknown'
                GROUP BY browser 
                ORDER BY count DESC 
                LIMIT 10
            ")->fetchAll(PDO::FETCH_ASSOC);

            return [
                'period' => $period,
                'top_errors' => $topErrors,
                'errors_by_type' => $errorsByType,
                'errors_by_hour' => $errorsByHour,
                'errors_by_browser' => $errorsByBrowser,
                'generated_at' => date('Y-m-d H:i:s')
            ];

        } catch (\Exception $e) {
            return [
                'period' => $period,
                'top_errors' => [],
                'errors_by_type' => [],
                'errors_by_hour' => [],
                'errors_by_browser' => [],
                'generated_at' => date('Y-m-d H:i:s'),
                'error' => 'Frontend errors table not available'
            ];
        }
    }

    /**
     * Get backend error statistics
     */
    private function getBackendErrorStats(string $period): array
    {
        // This would parse backend log files
        // For now, return placeholder data
        return [
            'period' => $period,
            'total_errors' => 0,
            'errors_by_level' => [
                'ERROR' => 0,
                'WARNING' => 0,
                'CRITICAL' => 0
            ],
            'errors_by_endpoint' => [],
            'errors_by_status_code' => [],
            'generated_at' => date('Y-m-d H:i:s'),
            'note' => 'Backend error statistics require log file parsing'
        ];
    }

    /**
     * Get security event statistics
     */
    private function getSecurityEventStats(string $period): array
    {
        $timeFilter = $this->getTimeFilter($period);

        try {
            // Events by type
            $eventsByType = $this->db->query("
                SELECT event_type, COUNT(*) as count, COUNT(DISTINCT client_ip) as unique_ips
                FROM security_events 
                WHERE timestamp >= {$timeFilter}
                GROUP BY event_type 
                ORDER BY count DESC
            ")->fetchAll(PDO::FETCH_ASSOC);

            // Events by severity
            $eventsBySeverity = $this->db->query("
                SELECT severity, COUNT(*) as count
                FROM security_events 
                WHERE timestamp >= {$timeFilter}
                GROUP BY severity 
                ORDER BY 
                    CASE severity 
                        WHEN 'critical' THEN 1
                        WHEN 'error' THEN 2
                        WHEN 'warning' THEN 3
                        WHEN 'info' THEN 4
                    END
            ")->fetchAll(PDO::FETCH_ASSOC);

            // Top suspicious IPs
            $topIps = $this->db->query("
                SELECT client_ip, COUNT(*) as event_count, AVG(risk_score) as avg_risk_score
                FROM security_events 
                WHERE timestamp >= {$timeFilter}
                    AND client_ip IS NOT NULL
                GROUP BY client_ip 
                HAVING event_count > 1
                ORDER BY event_count DESC 
                LIMIT 10
            ")->fetchAll(PDO::FETCH_ASSOC);

            // Recent critical events
            $criticalEvents = $this->db->query("
                SELECT event_type, client_ip, timestamp, details
                FROM security_events 
                WHERE timestamp >= {$timeFilter}
                    AND severity = 'critical'
                ORDER BY timestamp DESC 
                LIMIT 20
            ")->fetchAll(PDO::FETCH_ASSOC);

            return [
                'period' => $period,
                'events_by_type' => $eventsByType,
                'events_by_severity' => $eventsBySeverity,
                'top_suspicious_ips' => $topIps,
                'critical_events' => $criticalEvents,
                'generated_at' => date('Y-m-d H:i:s')
            ];

        } catch (\Exception $e) {
            return [
                'period' => $period,
                'events_by_type' => [],
                'events_by_severity' => [],
                'top_suspicious_ips' => [],
                'critical_events' => [],
                'generated_at' => date('Y-m-d H:i:s'),
                'error' => 'Security events table not available'
            ];
        }
    }

    /**
     * Get performance statistics
     */
    private function getPerformanceStats(string $period): array
    {
        // This would use PerformanceMonitorService
        // For now, return basic system metrics
        return [
            'period' => $period,
            'response_times' => [
                'average_ms' => 0,
                'median_ms' => 0,
                'p95_ms' => 0,
                'p99_ms' => 0
            ],
            'memory_usage' => [
                'current_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
                'peak_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2)
            ],
            'slow_queries' => [],
            'slow_endpoints' => [],
            'generated_at' => date('Y-m-d H:i:s'),
            'note' => 'Performance statistics require PerformanceMonitorService integration'
        ];
    }

    /**
     * Get error trends over time
     */
    private function getErrorTrends(string $period, string $granularity): array
    {
        $timeFilter = $this->getTimeFilter($period);
        $dateFormat = $this->getDateFormat($granularity);

        try {
            // Frontend error trends
            $frontendTrends = $this->db->query("
                SELECT 
                    DATE_FORMAT(created_at, '{$dateFormat}') as time_period,
                    COUNT(*) as error_count,
                    COUNT(DISTINCT user_id) as affected_users
                FROM frontend_errors 
                WHERE created_at >= {$timeFilter}
                GROUP BY DATE_FORMAT(created_at, '{$dateFormat}')
                ORDER BY time_period
            ")->fetchAll(PDO::FETCH_ASSOC);

            // Security event trends
            $securityTrends = $this->db->query("
                SELECT 
                    DATE_FORMAT(timestamp, '{$dateFormat}') as time_period,
                    COUNT(*) as event_count,
                    SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_count
                FROM security_events 
                WHERE timestamp >= {$timeFilter}
                GROUP BY DATE_FORMAT(timestamp, '{$dateFormat}')
                ORDER BY time_period
            ")->fetchAll(PDO::FETCH_ASSOC);

            return [
                'period' => $period,
                'granularity' => $granularity,
                'frontend_errors' => $frontendTrends,
                'security_events' => $securityTrends,
                'generated_at' => date('Y-m-d H:i:s')
            ];

        } catch (\Exception $e) {
            return [
                'period' => $period,
                'granularity' => $granularity,
                'frontend_errors' => [],
                'security_events' => [],
                'generated_at' => date('Y-m-d H:i:s'),
                'error' => 'Trend data not available'
            ];
        }
    }

    /**
     * Get error patterns
     */
    private function getErrorPatterns(string $period): array
    {
        $timeFilter = $this->getTimeFilter($period);

        try {
            // Common error patterns
            $patterns = $this->db->query("
                SELECT 
                    error_type,
                    message,
                    COUNT(*) as frequency,
                    COUNT(DISTINCT user_id) as affected_users,
                    GROUP_CONCAT(DISTINCT filename ORDER BY filename SEPARATOR ', ') as files_affected
                FROM frontend_errors 
                WHERE created_at >= {$timeFilter}
                GROUP BY error_type, message
                HAVING frequency > 1
                ORDER BY frequency DESC, error_type
                LIMIT 50
            ")->fetchAll(PDO::FETCH_ASSOC);

            // Error clusters (similar messages)
            $clusters = $this->findErrorClusters($timeFilter);

            return [
                'period' => $period,
                'common_patterns' => $patterns,
                'error_clusters' => $clusters,
                'generated_at' => date('Y-m-d H:i:s')
            ];

        } catch (\Exception $e) {
            return [
                'period' => $period,
                'common_patterns' => [],
                'error_clusters' => [],
                'generated_at' => date('Y-m-d H:i:s'),
                'error' => 'Pattern analysis not available'
            ];
        }
    }

    /**
     * Get error heatmap data
     */
    private function getErrorHeatmap(string $period): array
    {
        $timeFilter = $this->getTimeFilter($period);

        try {
            // Errors by day of week and hour
            $heatmap = $this->db->query("
                SELECT 
                    DAYOFWEEK(created_at) as day_of_week,
                    HOUR(created_at) as hour,
                    COUNT(*) as error_count
                FROM frontend_errors 
                WHERE created_at >= {$timeFilter}
                GROUP BY DAYOFWEEK(created_at), HOUR(created_at)
                ORDER BY day_of_week, hour
            ")->fetchAll(PDO::FETCH_ASSOC);

            // Format for heatmap visualization
            $heatmapData = [];
            foreach ($heatmap as $data) {
                $day = $data['day_of_week'] - 1; // Convert to 0-6
                $hour = $data['hour'];
                $heatmapData[$day][$hour] = $data['error_count'];
            }

            return [
                'period' => $period,
                'heatmap_data' => $heatmapData,
                'peak_hour' => $this->findPeakHour($heatmap),
                'peak_day' => $this->findPeakDay($heatmap),
                'generated_at' => date('Y-m-d H:i:s')
            ];

        } catch (\Exception $e) {
            return [
                'period' => $period,
                'heatmap_data' => [],
                'peak_hour' => null,
                'peak_day' => null,
                'generated_at' => date('Y-m-d H:i:s'),
                'error' => 'Heatmap data not available'
            ];
        }
    }

    /**
     * Export error data
     */
    private function exportErrorData(string $period, string $format, string $type): array
    {
        $timeFilter = $this->getTimeFilter($period);
        $data = [];

        switch ($type) {
            case 'frontend':
                $data = $this->db->query("
                    SELECT * FROM frontend_errors 
                    WHERE created_at >= {$timeFilter}
                    ORDER BY created_at DESC
                    LIMIT 10000
                ")->fetchAll(PDO::FETCH_ASSOC);
                break;

            case 'security':
                $data = $this->db->query("
                    SELECT * FROM security_events 
                    WHERE timestamp >= {$timeFilter}
                    ORDER BY timestamp DESC
                    LIMIT 10000
                ")->fetchAll(PDO::FETCH_ASSOC);
                break;

            default:
                // Combine all data
                $frontendErrors = $this->db->query("
                    SELECT 'frontend' as source, * FROM frontend_errors 
                    WHERE created_at >= {$timeFilter}
                    LIMIT 5000
                ")->fetchAll(PDO::FETCH_ASSOC);

                $securityEvents = $this->db->query("
                    SELECT 'security' as source, * FROM security_events 
                    WHERE timestamp >= {$timeFilter}
                    LIMIT 5000
                ")->fetchAll(PDO::FETCH_ASSOC);

                $data = array_merge($frontendErrors, $securityEvents);
        }

        return [
            'format' => $format,
            'type' => $type,
            'period' => $period,
            'record_count' => count($data),
            'data' => $data,
            'exported_at' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * Helper methods
     */
    private function getTimeFilter(string $period): string
    {
        switch ($period) {
            case '1h':
                return "DATE_SUB(NOW(), INTERVAL 1 HOUR)";
            case '24h':
                return "DATE_SUB(NOW(), INTERVAL 24 HOUR)";
            case '7d':
                return "DATE_SUB(NOW(), INTERVAL 7 DAY)";
            case '30d':
                return "DATE_SUB(NOW(), INTERVAL 30 DAY)";
            default:
                return "DATE_SUB(NOW(), INTERVAL 24 HOUR)";
        }
    }

    private function getDateFormat(string $granularity): string
    {
        switch ($granularity) {
            case 'minute':
                return '%Y-%m-%d %H:%i';
            case 'hour':
                return '%Y-%m-%d %H:00';
            case 'day':
                return '%Y-%m-%d';
            case 'week':
                return '%Y-%u';
            case 'month':
                return '%Y-%m';
            default:
                return '%Y-%m-%d %H:00';
        }
    }

    private function calculateHealthScore(array $frontend, array $backend, array $security): int
    {
        $totalErrors = ($frontend['total_errors'] ?? 0) + ($backend['total_errors'] ?? 0);
        $criticalEvents = $security['critical_events'] ?? 0;
        
        // Simple health score calculation
        $score = 100;
        $score -= min(50, $totalErrors * 0.1); // Deduct up to 50 points for errors
        $score -= min(30, $criticalEvents * 10); // Deduct up to 30 points for critical events
        
        return max(0, (int)$score);
    }

    private function getBackendLogStats(string $period): array
    {
        // This would parse log files for backend errors
        return [
            'total_errors' => 0,
            'by_level' => ['ERROR' => 0, 'WARNING' => 0, 'CRITICAL' => 0],
            'by_endpoint' => []
        ];
    }

    private function findErrorClusters(string $timeFilter): array
    {
        // This would implement clustering algorithm for similar errors
        return [];
    }

    private function findPeakHour(array $heatmap): ?int
    {
        $hourCounts = array_fill(0, 24, 0);
        
        foreach ($heatmap as $dayData) {
            foreach ($dayData as $hour => $count) {
                $hourCounts[$hour] += $count;
            }
        }
        
        return array_keys($hourCounts, max($hourCounts))[0] ?? null;
    }

    private function findPeakDay(array $heatmap): ?int
    {
        $dayCounts = array_fill(0, 7, 0);
        
        foreach ($heatmap as $day => $dayData) {
            $dayCounts[$day] = array_sum($dayData);
        }
        
        return array_keys($dayCounts, max($dayCounts))[0] ?? null;
    }
}