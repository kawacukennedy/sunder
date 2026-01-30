<?php

namespace App\Services;

use PDO;
use App\Services\LoggerService;

class LoggedPDO extends PDO
{
    public function __construct($dsn, $username, $password, $options)
    {
        parent::__construct($dsn, $username, $password, $options);
        $this->setAttribute(PDO::ATTR_STATEMENT_CLASS, [LoggedPDOStatement::class, [$this]]);
    }

    public function exec($statement): int
    {
        $start = microtime(true);
        $result = parent::exec($statement);
        $this->logQuery($statement, [], microtime(true) - $start);
        return $result;
    }

    public function query($statement, $mode = PDO::ATTR_DEFAULT_FETCH_MODE, ...$fetch_mode_args): \PDOStatement|false
    {
        $start = microtime(true);
        $result = parent::query($statement, $mode, ...$fetch_mode_args);
        $this->logQuery($statement, [], microtime(true) - $start);
        return $result;
    }

    public function prepare($query, $options = []): \PDOStatement|false
    {
        return parent::prepare($query, $options);
    }
    
    public function logQuery($sql, $params, $duration)
    {
        // Log queries taking longer than 100ms
        if ($duration > 0.1) {
            LoggerService::warning('Slow Query Detected', [
                'sql' => $sql,
                'params' => $params,
                'duration_ms' => round($duration * 1000, 2)
            ]);
        }
    }
}

class LoggedPDOStatement extends \PDOStatement
{
    private $pdo;

    protected function __construct(LoggedPDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function execute($params = null): bool
    {
        $start = microtime(true);
        $result = parent::execute($params);
        $this->pdo->logQuery($this->queryString, $params, microtime(true) - $start);
        return $result;
    }
}
