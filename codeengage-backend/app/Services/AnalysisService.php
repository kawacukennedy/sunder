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
        // Simple mock analysis for demo purposes
        // In real app, this would parse AST
        
        $complexity = 1;
        $lines = explode("\n", $code);
        $loc = count($lines);
        
        foreach ($lines as $line) {
            if (preg_match('/(if|for|while|case|catch)\\s*\\(/', $line)) {
                $complexity++;
            }
        }
        
        $securityIssues = [];
        if (stripos($code, 'eval(') !== false) {
            $securityIssues[] = 'Avoid using eval() - it is a security risk.';
        }
        if (stripos($code, 'exec(') !== false) {
            $securityIssues[] = 'Avoid using exec() - command injection risk.';
        }

        return [
            'complexity' => $complexity,
            'loc' => $loc,
            'security_issues' => $securityIssues,
            'suggestions' => $complexity > 5 ? ['Consider refactoring large implementation.'] : []
        ];
    }
}