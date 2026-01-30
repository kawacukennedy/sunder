<?php

return [
    'up' => function (PDO $pdo) {
        // User Tokens (Refresh Tokens)
        $pdo->exec("CREATE TABLE IF NOT EXISTS user_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(50) NOT NULL DEFAULT 'refresh', -- 'refresh', 'api_key'
            token VARCHAR(64) UNIQUE NOT NULL, -- Hashed token
            name VARCHAR(255) NULL, -- Device name or friendly name
            expires_at TIMESTAMP NULL,
            last_used_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");

        // Email Verifications
        $pdo->exec("CREATE TABLE IF NOT EXISTS email_verifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");

        // Password Resets
        $pdo->exec("CREATE TABLE IF NOT EXISTS password_resets (
            email VARCHAR(255) NOT NULL,
            token VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_password_resets_email (email)
        )");
        
        // Add email_verified_at column to users if it doesn't exist
        // Note: It might already exist from my previous edits to specs/user.php but we need to ensure DB has it.
        try {
            $pdo->exec("ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL AFTER last_active_at");
        } catch (PDOException $e) {
            // Column likely exists, ignore
        }
    },
    'down' => function (PDO $pdo) {
        $pdo->exec("DROP TABLE IF EXISTS password_resets");
        $pdo->exec("DROP TABLE IF EXISTS email_verifications");
        $pdo->exec("DROP TABLE IF EXISTS user_tokens");
    }
];
