<?php

return function(PDO $pdo) {
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

    if ($driver === 'sqlite') {
        // Content Reports
        $pdo->exec("CREATE TABLE IF NOT EXISTS content_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reporter_id INTEGER NOT NULL,
            target_type VARCHAR(50) NOT NULL,
            target_id INTEGER NOT NULL,
            reason TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            resolved_by INTEGER NULL,
            resolved_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
        )");

        // System Settings
        $pdo->exec("CREATE TABLE IF NOT EXISTS system_settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Export History
        $pdo->exec("CREATE TABLE IF NOT EXISTS export_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            snippet_id INTEGER NOT NULL,
            export_format VARCHAR(50) NOT NULL,
            exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE
        )");
    } else {
        // Content Reports
        $pdo->exec("CREATE TABLE IF NOT EXISTS content_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reporter_id INT NOT NULL,
            target_type VARCHAR(50) NOT NULL,
            target_id INT NOT NULL,
            reason TEXT NOT NULL,
            status ENUM('pending', 'investigating', 'resolved', 'dismissed') DEFAULT 'pending',
            resolved_by INT NULL,
            resolved_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_reports_status (status),
            INDEX idx_reports_target (target_type, target_id)
        ) ENGINE=InnoDB");

        // System Settings
        $pdo->exec("CREATE TABLE IF NOT EXISTS system_settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB");

        // Export History
        $pdo->exec("CREATE TABLE IF NOT EXISTS export_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            snippet_id INT NOT NULL,
            export_format VARCHAR(50) NOT NULL,
            exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE,
            INDEX idx_export_user (user_id),
            INDEX idx_export_snippet (snippet_id)
        ) ENGINE=InnoDB");
    }
};
