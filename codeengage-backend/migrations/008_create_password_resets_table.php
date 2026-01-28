<?php

class Migration_008_create_password_resets_table
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function up(): bool
    {
        $driver = $this->db->getAttribute(PDO::ATTR_DRIVER_NAME);
        
        if ($driver === 'sqlite') {
            $sql = "
                CREATE TABLE IF NOT EXISTS password_resets (
                    email VARCHAR(255) NOT NULL,
                    token VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ";
            $this->db->exec($sql);
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)");
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token)");
            return true;
        } else {
            $sql = "
                CREATE TABLE IF NOT EXISTS password_resets (
                    email VARCHAR(255) NOT NULL,
                    token VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_password_resets_email (email),
                    INDEX idx_password_resets_token (token)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ";
            return $this->db->exec($sql) !== false;
        }
    }

    public function down(): bool
    {
        return $this->db->exec("DROP TABLE IF EXISTS password_resets") !== false;
    }
}
