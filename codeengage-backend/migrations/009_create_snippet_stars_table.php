<?php

class Migration_009_create_snippet_stars_table
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
                CREATE TABLE IF NOT EXISTS snippet_stars (
                    user_id INTEGER NOT NULL,
                    snippet_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_id, snippet_id),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE
                )
            ";
        } else {
            $sql = "
                CREATE TABLE IF NOT EXISTS snippet_stars (
                    user_id INT NOT NULL,
                    snippet_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_id, snippet_id),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ";
        }

        return $this->db->exec($sql) !== false;
    }

    public function down(): bool
    {
        return $this->db->exec("DROP TABLE IF EXISTS snippet_stars") !== false;
    }
}
