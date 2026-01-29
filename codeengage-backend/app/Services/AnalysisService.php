<?php

namespace App\Services;

class AnalysisService
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function analyze($code, $language)
    {
        $complexity = 1;
        $lines = explode("\n", $code);
        $loc = count($lines);
        
        // Cyclomatic Complexity Patterns
        $patterns = [
            '/\bif\b/i', '/\bfor\b/i', '/\bwhile\b/i', 
            '/\bcase\b/i', '/\bcatch\b/i', '/\b&& \b/', '/\b\|\| \b/'
        ];

        foreach ($lines as $line) {
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $line)) {
                    $complexity++;
                }
            }
        }
        
        $securityIssues = [];
        $secPatterns = [
            'eval\(' => 'Dangerous use of eval() detected. Please avoid as it allows arbitrary code execution.',
            'exec\(' => 'Command execution detected. Potential command injection risk.',
            'base64_decode\(' => 'Obfuscated data decoding detected. Ensure source is trusted.',
            'mysqli_query\(.*\$' => 'Potential SQL injection detected. Use prepared statements instead.',
            'document\.write\(' => 'Potential XSS vulnerability. Use safer DOM manipulation methods.'
        ];

        foreach ($secPatterns as $pattern => $msg) {
            if (preg_match("/$pattern/i", $code)) {
                $securityIssues[] = ['type' => 'security', 'message' => $msg];
            }
        }

        $performanceSuggestions = [];
        if ($loc > 300) {
            $performanceSuggestions[] = 'File is too large (> 300 lines). Consider breaking it down into modules.';
        }
        if (preg_match_all('/\bfor\b/i', $code) > 3 && preg_match('/for.*for/s', $code)) {
            $performanceSuggestions[] = 'Deeply nested loops detected. This may cause performance issues.';
        }

        return [
            'complexity' => $complexity,
            'loc' => $loc,
            'security_issues' => $securityIssues,
            'performance_suggestions' => $performanceSuggestions,
            'code_smells' => $complexity > 15 ? ['High complexity detected. Refactoring recommended.'] : [],
            'analyzed_at' => date('Y-m-d H:i:s')
        ];
    }
}