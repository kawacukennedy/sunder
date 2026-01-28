<?php

return function(PDO $pdo) {
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    
    if ($driver === 'sqlite') {
        $pdo->exec("CREATE TABLE IF NOT EXISTS code_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            snippet_version_id INTEGER NOT NULL,
            analysis_type VARCHAR(50) NOT NULL,
            complexity_score DECIMAL(5,2),
            security_issues TEXT, -- JSON
            performance_suggestions TEXT, -- JSON
            code_smells TEXT, -- JSON
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (snippet_version_id) REFERENCES snippet_versions(id) ON DELETE CASCADE
        )");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_code_analyses_version ON code_analyses(snippet_version_id)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_code_analyses_type ON code_analyses(analysis_type, created_at DESC)");
    } else {
        $pdo->exec("CREATE TABLE IF NOT EXISTS code_analyses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            snippet_version_id INT NOT NULL,
            analysis_type VARCHAR(50) NOT NULL,
            complexity_score DECIMAL(5,2),
            security_issues JSON,
            performance_suggestions JSON,
            code_smells JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (snippet_version_id) REFERENCES snippet_versions(id) ON DELETE CASCADE,
            INDEX idx_code_analyses_version (snippet_version_id),
            INDEX idx_code_analyses_type (analysis_type, created_at DESC)
        ) ENGINE=InnoDB");
    }
};