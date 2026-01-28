<?php

return function(PDO $pdo) {
    // Audit Logs
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

    if ($driver === 'sqlite') {
        // Audit Logs
        $pdo->exec("CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            actor_id INTEGER NULL,
            action_type VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INTEGER NULL,
            old_values TEXT NULL, -- JSON
            new_values TEXT NULL, -- JSON
            ip_address VARCHAR(45),
            user_agent TEXT,
            request_id VARCHAR(64),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
        )");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action_type, created_at DESC)");
    } else {
        // Audit Logs
        $pdo->exec("CREATE TABLE IF NOT EXISTS audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            actor_id INT NULL,
            action_type VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INT NULL,
            old_values JSON NULL,
            new_values JSON NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            request_id VARCHAR(64),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_audit_logs_actor (actor_id, created_at DESC),
            INDEX idx_audit_logs_entity (entity_type, entity_id),
            INDEX idx_audit_logs_action (action_type, created_at DESC)
        ) ENGINE=InnoDB");
    }

    // Login Attempts
    if ($driver === 'sqlite') {
        // Login Attempts
        $pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NULL,
            ip_address VARCHAR(45) NOT NULL,
            attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            success BOOLEAN DEFAULT 0,
            user_agent TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, attempt_time DESC)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_login_attempts_user ON login_attempts(user_id, attempt_time DESC)");
    } else {
        // Login Attempts
        $pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            ip_address VARCHAR(45) NOT NULL,
            attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            success BOOLEAN DEFAULT FALSE,
            user_agent TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_login_attempts_ip (ip_address, attempt_time DESC),
            INDEX idx_login_attempts_user (user_id, attempt_time DESC)
        ) ENGINE=InnoDB");
    }
};
