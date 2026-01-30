<?php

namespace App\Middleware;

use App\Helpers\ApiResponse;

class RateLimitMiddleware
{
    private $storagePath;
    private $limit = 60; // requests per minute
    private $window = 60; // seconds

    public function __construct()
    {
        $this->storagePath = __DIR__ . '/../../storage/cache/ratelimit/';
        if (!is_dir($this->storagePath)) {
            mkdir($this->storagePath, 0777, true);
        }
    }

    public function handle()
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

        // IP Reputation Check (Blacklist)
        if ($this->isIpBlacklisted($ip)) {
            ApiResponse::error('Your IP has been flagged for suspicious activity', 403);
        }

        // Simple sanitization for filename
        $ipHash = md5($ip);
        $file = $this->storagePath . $ipHash . '.json';
        
        $data = ['count' => 0, 'start_time' => time()];
        
        if (file_exists($file)) {
            $json = file_get_contents($file);
            if ($json) {
                $data = json_decode($json, true) ?? $data;
            }
        }

        $currentTime = time();
        
        // Reset if window passed
        if ($currentTime - $data['start_time'] > $this->window) {
            $data['count'] = 0;
            $data['start_time'] = $currentTime;
        }

        $data['count']++;

        file_put_contents($file, json_encode($data));

        if ($data['count'] > $this->limit) {
            $retryAfter = $this->window - ($currentTime - $data['start_time']);
            header('Retry-After: ' . $retryAfter);
            header('X-RateLimit-Limit: ' . $this->limit);
            header('X-RateLimit-Remaining: 0');
            header('X-RateLimit-Reset: ' . ($data['start_time'] + $this->window));
            ApiResponse::error('Too Many Requests', 429);
        }
        
        // Add headers for valid requests
        header('X-RateLimit-Limit: ' . $this->limit);
        header('X-RateLimit-Remaining: ' . max(0, $this->limit - $data['count']));
        header('X-RateLimit-Reset: ' . ($data['start_time'] + $this->window));
    }

    private function isIpBlacklisted(string $ip): bool
    {
        $blacklistFile = __DIR__ . '/../../storage/security/ip_blacklist.json';
        if (!file_exists($blacklistFile)) {
            return false;
        }

        $blacklist = json_decode(file_get_contents($blacklistFile), true) ?? [];
        return in_array($ip, $blacklist);
    }
}