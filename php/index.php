<?php

define('ENVIRONMENT', 'development');

use CodeIgniter\Boot;
use Config\Paths;

/**
 * CodeIgniter Front Controller
 */

// Check PHP version.
$minPhpVersion = '8.1';
if (version_compare(PHP_VERSION, $minPhpVersion, '<')) {
    $message = sprintf(
        'Your PHP version must be %s or higher to run CodeIgniter. Current version: %s',
        $minPhpVersion,
        PHP_VERSION,
    );

    header('HTTP/1.1 503 Service Unavailable.', true, 503);
    echo $message;

    exit(1);
}

// Path to the front controller (this file)
define('FCPATH', __DIR__ . DIRECTORY_SEPARATOR);

// Path to the shared framework
define('FRAMEWORKPATH', '/home/quqiufeng/CodeIgniter');

// Path to the application
$appPath = __DIR__ . DIRECTORY_SEPARATOR;

// Ensure the current directory is pointing to the front controller's directory
if (getcwd() . DIRECTORY_SEPARATOR !== FCPATH) {
    chdir(FCPATH);
}

// Load framework Paths config
require FRAMEWORKPATH . '/app/Config/Paths.php';

$paths = new Paths();

// Override app directory paths
$paths->appDirectory = $appPath;
$paths->writableDirectory = $appPath . 'writable';
$paths->viewDirectory = $appPath . 'Views';

// Define path constants
if (!defined('APPPATH')) {
    define('APPPATH', realpath(rtrim($paths->appDirectory, '\\/ ')) . DIRECTORY_SEPARATOR);
}
if (!defined('ROOTPATH')) {
    define('ROOTPATH', realpath(APPPATH . '../') . DIRECTORY_SEPARATOR);
}

// Load framework bootstrap
require $paths->systemDirectory . '/Boot.php';

exit(Boot::bootWeb($paths));
