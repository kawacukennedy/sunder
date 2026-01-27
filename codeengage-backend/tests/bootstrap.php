<?php
/**
 * PHPUnit Bootstrap File
 * 
 * Sets up the testing environment for CodeEngage backend tests.
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Load environment variables for testing
$_ENV['APP_ENV'] = 'testing';
$_ENV['APP_DEBUG'] = 'true';

// Simple autoloader
spl_autoload_register(function ($className) {
    $ds = DIRECTORY_SEPARATOR;
    $className = str_replace('App\\', '', $className);
    $className = str_replace('\\', $ds, $className);
    $className = trim($className, $ds);
    
    $path = __DIR__ . '/../app/' . $className . '.php';
    
    if (is_readable($path)) {
        require $path;
        return true;
    }
    
    return false;
});

// Load test case base class
require_once __DIR__ . '/TestCase.php';
require_once __DIR__ . '/DatabaseTestCase.php';
