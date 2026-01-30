<?php

namespace App\Helpers;

class CodeHelper
{
    public static function calculateComplexity(string $code): float
    {
        $complexity = 1; // Base complexity
        
        // Count control structures
        $patterns = [
            '/\bif\b/i' => 1,
            '/\belse\s+if\b/i' => 1,
            '/\belse\b/i' => 0, // else doesn't add cyclomatic complexity usually, but branching yes
            '/\bwhile\b/i' => 1,
            '/\bfor\b/i' => 1,
            '/\bforeach\b/i' => 1,
            '/\bswitch\b/i' => 1,
            '/\bcase\b/i' => 1, // case adds branching
            '/\bcatch\b/i' => 1,
            '/\b\?\s*:/' => 1, // ternary operator
            '/\|\|/' => 0.5, // Boolean operators
            '/&&/' => 0.5,
            '/\band\b/i' => 0.5,
            '/\bor\b/i' => 0.5,
        ];
        
        foreach ($patterns as $pattern => $weight) {
            $matches = [];
            preg_match_all($pattern, $code, $matches);
            $complexity += count($matches[0]) * $weight;
        }
        
        return round($complexity, 2);
    }

    public static function detectSecurityIssues(string $code, string $language): array
    {
        $issues = [];
        
        $commonPatterns = [
             'SQL Injection' => [
                '/(mysqli_|mysql_|pg_).*(query|execute).*\$.*/i' => 'Potential SQL injection using unsecured variable in query.',
                '/PDO::prepare.*\$.*/i' => 'Verify variable usage in PDO prepare statement.',
            ],
            'XSS' => [
                '/echo.*\$_GET/i' => 'Direct echo of $_GET variable may lead to XSS.',
                '/echo.*\$_POST/i' => 'Direct echo of $_POST variable may lead to XSS.',
                '/(innerHTML|outerHTML)\s*=\s*.*(\$|window\.location|document\.cookie)/i' => 'Unsafe DOM assignment detected.',
            ],
            'Command Injection' => [
                '/(system|exec|passthru|shell_exec|popen)\s*\(.*\$.*\)/i' => 'Potential command injection via variable execution.',
                '/eval\s*\(.*\)/i' => 'Use of eval() is highly dangerous and should be avoided.',
            ],
             'Weak Cryptography' => [
                '/md5\s*\(.*\)/i' => 'MD5 is considered weak for hashing passwords.',
                '/sha1\s*\(.*\)/i' => 'SHA1 is considered weak.',
            ]
        ];

        foreach ($commonPatterns as $type => $rules) {
             foreach ($rules as $pattern => $message) {
                 if (preg_match($pattern, $code)) {
                     $issues[] = [
                         'type' => $type,
                         'severity' => 'high',
                         'description' => $message
                     ];
                 }
             }
        }
        
        return $issues;
    }
    
    public static function detectPerformanceIssues(string $code): array
    {
        $issues = [];
        
        if (preg_match_all('/\bfor\b/i', $code) > 3) {
             if (preg_match('/for\s*\(.*for\s*\(/s', $code)) {
                 $issues[] = 'Nested loops detected, which may cause O(n^2) or worse performance.';
             }
        }
        
        if (substr_count($code, "\n") > 500) {
            $issues[] = 'File length exceeds 500 lines. Consider refactoring into smaller modules.';
        }
        
        if (preg_match('/SELECT\s+\*\s+FROM/i', $code)) {
            $issues[] = 'Avoid "SELECT *" in SQL queries to reduce data load.';
        }
        
        return $issues;
    }

    public static function detectDuplicates(string $code): array
    {
        $duplicates = [];
        $lines = explode("\n", $code);
        $lineCount = count($lines);
        
        if ($lineCount < 10) return [];
        
        $blocks = [];
        $blockSize = 5; // Minimum lines to consider a duplicate
        
        for ($i = 0; $i <= $lineCount - $blockSize; $i++) {
            $block = trim(implode("\n", array_slice($lines, $i, $blockSize)));
            if (strlen($block) < 50) continue; 
            
            if (isset($blocks[$block])) {
                $blocks[$block][] = $i + 1;
            } else {
                $blocks[$block] = [$i + 1];
            }
        }
        
        foreach ($blocks as $block => $lineNumbers) {
            if (count($lineNumbers) > 1) {
                $duplicates[] = [
                    'lines' => $lineNumbers,
                    'content_summary' => substr($block, 0, 100) . '...'
                ];
            }
        }
        
        return $duplicates;
    }

    public static function detectCodeSmells(string $code): array
    {
        $smells = [];
        $lines = explode("\n", $code);
        
        if (count($lines) > 100) {
            $smells[] = 'Large code block detected. Consider breaking into smaller modules.';
        }
        
        if (preg_match_all('/function.*\(([^)]+,[^)]+,[^)]+,[^)]+)\)/', $code, $matches)) {
            $smells[] = 'Function with too many parameters detected.';
        }
        
        if (preg_match('/(\s+){8,}/', $code)) {
            $smells[] = 'Deep nesting detected. Consider using guard clauses.';
        }

        return $smells;
    }

    public static function formatCode(string $code, string $language): string
    {
        // Basic formatting - in production, you'd use language-specific formatters
        return trim($code);
    }

    public static function generateChecksum(string $code): string
    {
        return hash('sha256', $code);
    }
}