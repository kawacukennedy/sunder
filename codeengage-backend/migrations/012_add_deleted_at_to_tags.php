<?php

return function(PDO $pdo) {
    $sql = "ALTER TABLE tags ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL";
    
    // Check if column exists first (SQLite doesn't support IF NOT EXISTS for columns easily in one statement, 
    // but try/catch is safer or just running it since migration shouldn't run twice)
    try {
        $pdo->exec($sql);
    } catch (PDOException $e) {
        // Column might already exist, which is fine
        // MySQL 1060: Duplicate column name
        // SQLite: duplicate column name
        if (strpos($e->getMessage(), 'duplicate column') === false && strpos($e->getMessage(), 'Duplicate column') === false) {
            throw $e;
        }
    }
    
    return true;
};
