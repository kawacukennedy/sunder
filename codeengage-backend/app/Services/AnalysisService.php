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
        $complexity = \App\Helpers\CodeHelper::calculateComplexity($code);
        $loc = substr_count($code, "\n") + 1;
        
        $securityIssues = \App\Helpers\CodeHelper::detectSecurityIssues($code, $language);
        $performanceSuggestions = \App\Helpers\CodeHelper::detectPerformanceIssues($code);
        $duplicates = \App\Helpers\CodeHelper::detectDuplicates($code);
        $codeSmells = \App\Helpers\CodeHelper::detectCodeSmells($code);

        return [
            'complexity' => $complexity,
            'loc' => $loc,
            'language' => $language,
            'security_issues' => $securityIssues,
            'performance_suggestions' => $performanceSuggestions,
            'duplicates' => $duplicates,
            'code_smells' => $codeSmells,
            'analyzed_at' => date('Y-m-d H:i:s')
        ];
    }
}