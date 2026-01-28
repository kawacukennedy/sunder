<?php

return function(PDO $pdo) {
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    
    if ($driver === 'sqlite') {
        $pdo->exec("CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            badge_type VARCHAR(50) NOT NULL,
            badge_name VARCHAR(100) NOT NULL,
            badge_description TEXT,
            badge_icon VARCHAR(100),
            points_awarded INTEGER DEFAULT 0,
            metadata TEXT, -- JSON
            earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id, earned_at DESC)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(badge_type)");
    } else {
        $pdo->exec("CREATE TABLE IF NOT EXISTS achievements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            badge_type VARCHAR(50) NOT NULL,
            badge_name VARCHAR(100) NOT NULL,
            badge_description TEXT,
            badge_icon VARCHAR(100),
            points_awarded INT DEFAULT 0,
            metadata JSON,
            earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_achievements_user (user_id, earned_at DESC),
            INDEX idx_achievements_type (badge_type)
        ) ENGINE=InnoDB");
    }
};