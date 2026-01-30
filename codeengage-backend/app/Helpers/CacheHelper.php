<?php

namespace App\Helpers;

class CacheHelper {
    private static $cacheDir = __DIR__ . '/../../storage/cache/';
    private static $defaultTtl = 300; // 5 minutes

    public static function init() {
        if (!file_exists(self::$cacheDir)) {
            mkdir(self::$cacheDir, 0777, true);
        }
    }

    public static function get($key) {
        self::init();
        $file = self::$cacheDir . md5($key) . '.cache';

        if (file_exists($file)) {
            $data = unserialize(file_get_contents($file));
            if ($data['expires_at'] > time()) {
                return $data['value'];
            }
            // Expired
            unlink($file);
        }

        return null;
    }

    public static function set($key, $value, $ttl = null) {
        self::init();
        $ttl = $ttl ?? self::$defaultTtl;
        $file = self::$cacheDir . md5($key) . '.cache';

        $data = [
            'value' => $value,
            'expires_at' => time() + $ttl
        ];

        file_put_contents($file, serialize($data));
    }

    public static function forget($key) {
        self::init();
        $file = self::$cacheDir . md5($key) . '.cache';
        if (file_exists($file)) {
            unlink($file);
        }
    }

    public static function flush() {
        self::init();
        $files = glob(self::$cacheDir . '*.cache');
        foreach ($files as $file) {
            unlink($file);
        }
    }
    
    public static function remember($key, $ttl, $callback) {
        $value = self::get($key);
        if ($value !== null) {
            return $value;
        }

        $value = $callback();
        self::set($key, $value, $ttl);
        return $value;
    }
}
