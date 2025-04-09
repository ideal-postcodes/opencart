<?php
/**
 * Self-contained setup script for the Ideal Postcodes OpenCart 4 extension.
 * This script correctly bootstraps the OpenCart framework to ensure all
 * models, libraries, and configurations are available.
 */

// --- Bootstrap OpenCart using the official framework --- 

// Set the working directory to the admin folder, to mimic the admin entry point
chdir('/var/www/html/admin');

// Configuration
// Load the root config file first.
if (is_file('config.php')) {
    require_once('config.php');
}

// Startup
require_once(DIR_SYSTEM . 'startup.php');

// Framework - this bootstraps the entire application and populates the registry
// Autoloader
$autoloader = new \Opencart\System\Engine\Autoloader();
$autoloader->register('Opencart\\' . APPLICATION, DIR_APPLICATION);
$autoloader->register('Opencart\Extension', DIR_EXTENSION);
$autoloader->register('Opencart\System', DIR_SYSTEM);

require_once(DIR_SYSTEM . 'vendor.php');

// Registry
$registry = new \Opencart\System\Engine\Registry();
$registry->set('autoloader', $autoloader);

// Config
$config = new \Opencart\System\Engine\Config();
$registry->set('config', $config);
$config->addPath(DIR_CONFIG);

// Load the default config
$config->load('default');
$config->load(strtolower(APPLICATION));

// Set the default application
$config->set('application', APPLICATION);

// Set the default time zone
date_default_timezone_set($config->get('date_timezone'));

// Logging
$log = new \Opencart\System\Library\Log($config->get('error_filename'));
$registry->set('log', $log);

// Error Handler
set_error_handler(function(string $code, string $message, string $file, string $line) use ($log, $config) {
	switch ($code) {
		case E_NOTICE:
		case E_USER_NOTICE:
			$error = 'Notice';
			break;
		case E_WARNING:
		case E_USER_WARNING:
			$error = 'Warning';
			break;
		case E_ERROR:
		case E_USER_ERROR:
			$error = 'Fatal Error';
			break;
		default:
			$error = 'Unknown';
			break;
	}

	if ($config->get('error_log')) {
		$log->write('PHP ' . $error . ':  ' . $message . ' in ' . $file . ' on line ' . $line);
	}

	echo '<b>' . $error . '</b>: ' . $message . ' in <b>' . $file . '</b> on line <b>' . $line . '</b>';

	return true;
});

// Exception Handler
set_exception_handler(function(\Throwable $e) use ($log, $config)  {
	if ($config->get('error_log')) {
		$log->write($e->getMessage() . ': in ' . $e->getFile() . ' on line ' . $e->getLine());
	}
	echo '<b>' . $e->getMessage() . '</b>: in <b>' . $e->getFile() . '</b> on line <b>' . $e->getLine() . '</b>';
});

// Event
$event = new \Opencart\System\Engine\Event($registry);
$registry->set('event', $event);

// Event Register
if ($config->has('action_event')) {
	foreach ($config->get('action_event') as $key => $value) {
		foreach ($value as $priority => $action) {
			$event->register($key, new \Opencart\System\Engine\Action($action), $priority);
		}
	}
}

// Loader
$loader = new \Opencart\System\Engine\Loader($registry);
$registry->set('load', $loader);

// Database
if ($config->get('db_autostart')) {
	$db = new \Opencart\System\Library\DB($config->get('db_engine'), $config->get('db_hostname'), $config->get('db_username'), $config->get('db_password'), $config->get('db_database'), $config->get('db_port'));
	$registry->set('db', $db);
}

// Language
$language = new \Opencart\System\Library\Language($config->get('language_code'));
$language->addPath(DIR_LANGUAGE);
$registry->set('language', $language);
$language->load($config->get('language_code'));

// Request (needed for some controller operations)
$request = new \Opencart\System\Library\Request();
$registry->set('request', $request);

// Response (needed for some controller operations)
$response = new \Opencart\System\Library\Response();
$registry->set('response', $response);

// Cache
$cache = new \Opencart\System\Library\Cache('file');
$registry->set('cache', $cache);

// --- Main Installation Logic ---

echo "Starting Ideal Postcodes extension setup...\n";

// --- Configuration ---
$extensionCode = 'idealpostcodes';
$moduleCode = 'ukaddresssearch';
$moduleType = 'module';
$fullModulePath = "extension/{$extensionCode}/{$moduleType}/{$moduleCode}";

// 1. Install the extension (adds to Extensions -> Installer list)
installExtension($extensionCode);

// 2. Add module to Extensions -> Modules list
addModuleToList($extensionCode, $moduleType, $moduleCode);

// 3. Grant permissions to admin user group
grantPermissions($fullModulePath);

// 4. Call the module's own install() method
callModuleInstall($fullModulePath);

// 5. Enable the module
enableModule($moduleType, $moduleCode);

// 6. Force clear cache directory
forceClearCache();

echo "Ideal Postcodes extension setup completed successfully!\n";

// --- Helper Functions ---

function installExtension(string $extensionCode): int {
    global $registry;
    
    echo "Registering extension in installer...\n";
    
    $loader = $registry->get('load');
    
    // Get the extension data from install.json
    $installJsonPath = DIR_EXTENSION . $extensionCode . '/install.json';
    echo "Reading install.json from: {$installJsonPath}\n";
    
    if (!file_exists($installJsonPath)) {
        echo "ERROR: install.json not found at {$installJsonPath}\n";
        return 0;
    }
    
    $jsonData = json_decode(file_get_contents($installJsonPath), true);
    
    if (empty($jsonData)) {
        echo "ERROR: Failed to parse install.json or file is empty\n";
        return 0;
    }
    
    // Load the extension model
    $loader->model('setting/extension');
    $model_setting_extension = $registry->get('model_setting_extension');
    
    // Prepare extension data from install.json
    $extension_data = [
        'extension_id' => 0, // Not used for our purpose
        'extension_download_id' => 0, // Not used for our purpose
        'name' => $jsonData['name'] ?? $extensionCode,
        'code' => $extensionCode, // Always use lowercase for code
        'version' => $jsonData['version'] ?? '1.0.0',
        'author' => $jsonData['author'] ?? 'Unknown',
        'link' => $jsonData['link'] ?? ''
    ];
    
    // Register extension
    $extension_install_id = $model_setting_extension->addInstall($extension_data);
    
    if ($extension_install_id) {
        echo "Extension added to installer list with ID: {$extension_install_id}\n";
        
        // Mark extension as installed (status = 1)
        echo "Marking extension as installed (setting status=1)...\n";
        $model_setting_extension->editStatus($extension_install_id, 1);
        echo "Extension marked as installed.\n";
        
        // Register extension file paths
        echo "Registering extension file paths...\n";
        $pathCount = registerExtensionPaths($extension_install_id, $extensionCode);
        echo "Registered {$pathCount} extension paths.\n";
        
        // Add to extension list - ensure lowercase extension code
        $moduleType = 'module';
        $moduleCode = 'ukaddresssearch';
        addModuleToList($extensionCode, $moduleType, $moduleCode);
        
        // Grant permissions for admin users - ensure lowercase path
        $fullModulePath = 'extension/' . strtolower($extensionCode) . '/module/' . $moduleCode;
        echo "Granting permissions for path: {$fullModulePath}\n";
        grantPermissions($fullModulePath);
        
        // Call module's install method - ensure lowercase path
        echo "Calling install method for: {$fullModulePath}\n";
        callModuleInstall($fullModulePath);
        
        // Enable the module
        enableModule($moduleType, $moduleCode);
        
        // Clear cache
        forceClearCache();
        
        echo "Ideal Postcodes extension setup completed successfully!\n";
        
        return $extension_install_id;
    } else {
        echo "ERROR: Failed to add extension to installer list\n";
        return 0;
    }
}

function addModuleToList(string $extensionCode, string $moduleType, string $moduleCode): void {
    global $registry;
    $db = $registry->get('db');
    echo "Adding module to extensions list...\n";
    
    // Make sure we're using the correct case for the extension code as per memory notes
    // OpenCart is case-sensitive and the namespace must match directory structure exactly
    $extensionCode = strtolower($extensionCode); // Ensuring 'idealpostcodes' not 'Idealpostcodes'
    
    echo "Using: extension='{$extensionCode}', type='{$moduleType}', code='{$moduleCode}'\n";
    
    $query = $db->query("SELECT * FROM `" . DB_PREFIX . "extension` WHERE `type` = '" . $db->escape($moduleType) . "' AND `code` = '" . $db->escape($moduleCode) . "'");
    
    if (!$query->num_rows) {
        // Create the SQL insert statement
        $sql = "INSERT INTO `" . DB_PREFIX . "extension` SET `extension` = '" . $db->escape($extensionCode) . "', `type` = '" . $db->escape($moduleType) . "', `code` = '" . $db->escape($moduleCode) . "'";
        
        // Execute the insert query
        $db->query($sql);
        
        // Get the last insert ID to verify if the insert worked
        $lastId = $db->getLastId();
        
        if ($lastId) {
            echo "Module added to list with ID: {$lastId}\n";
            
            // Double check the entry was added by querying again
            $verify_query = $db->query("SELECT * FROM `" . DB_PREFIX . "extension` WHERE `extension_id` = '" . (int)$lastId . "'");
            if ($verify_query->num_rows) {
                $row = $verify_query->row;
                echo "Verified in database: ID={$row['extension_id']}, extension={$row['extension']}, type={$row['type']}, code={$row['code']}\n";
            } else {
                echo "ERROR: Could not verify the inserted row despite having an ID!\n";
            }
        } else {
            echo "ERROR: Failed to add module to list! No ID returned.\n";
        }
    } else {
        $row = $query->row;
        echo "Module already in list with ID: {$row['extension_id']}\n";
    }
}

function grantPermissions(string $fullModulePath): void {
    global $registry;
    $loader = $registry->get('load');
    echo "Granting permissions to admin user group...\n";
    $loader->model('user/user_group');
    $model_user_user_group = $registry->get('model_user_user_group');
    $adminUserGroupId = 1;
    $user_group = $model_user_user_group->getUserGroup($adminUserGroupId);
    
    $permissions = $user_group['permission'];
    if (!in_array($fullModulePath, $permissions['access'])) {
        $permissions['access'][] = $fullModulePath;
    }
    if (!in_array($fullModulePath, $permissions['modify'])) {
        $permissions['modify'][] = $fullModulePath;
    }

    $model_user_user_group->editUserGroup($adminUserGroupId, ['permission' => $permissions]);
    echo "Permissions granted.\n";
}

function callModuleInstall(string $fullModulePath): void {
    global $registry;
    $loader = $registry->get('load');
    echo "Calling module's install() method...\n";
    
    // Make sure we're using the correct case sensitivity
    // Convert path to lowercase to match the directory structure exactly as required
    // Based on our memory that namespace must match directory structure exactly
    $fullModulePath = str_replace('Idealpostcodes', 'idealpostcodes', $fullModulePath);
    echo "Using module path with correct case sensitivity: {$fullModulePath}\n";
    
    $loader->controller($fullModulePath . '|install');
    echo "install() method executed.\n";
}

function enableModule(string $moduleType, string $moduleCode): void {
    global $registry;
    $loader = $registry->get('load');
    echo "Enabling module...\n";
    $loader->model('setting/setting');
    $model_setting_setting = $registry->get('model_setting_setting');
    $settings = [
        $moduleType . '_' . $moduleCode . '_status' => 1
    ];
    $model_setting_setting->editSetting($moduleType . '_' . $moduleCode, $settings);
    echo "Module enabled.\n";
}

function forceClearCache(): void {
    echo "Forcibly clearing cache directory...\n";
    $cacheDir = DIR_CACHE;
    if (!is_dir($cacheDir)) {
        echo "Cache directory not found at: " . $cacheDir . "\n";
        return;
    }
    
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($cacheDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );

    foreach ($files as $fileinfo) {
        $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
        @$todo($fileinfo->getRealPath());
    }
    echo "Cache directory cleared.\n";
}

/**
 * Register essential extension paths in the database
 * Rather than scanning directories, we'll register the specific paths
 * that OpenCart needs to recognize the extension
 * 
 * @param int $extension_install_id The extension install ID
 * @param string $extensionCode The extension code (e.g. 'idealpostcodes')
 * @return int Number of paths registered
 */
function registerExtensionPaths(int $extension_install_id, string $extensionCode): int {
    global $registry;
    $model_setting_extension = $registry->get('model_setting_extension');
    $base = DIR_EXTENSION;
    $pathCount = 0;
    
    echo "Registering essential extension paths...\n";
    
    // List of paths to register
    $paths = [
        // Root extension path
        $extensionCode,
        
        // Admin files
        $extensionCode . '/admin',
        $extensionCode . '/admin/controller',
        $extensionCode . '/admin/controller/module',
        $extensionCode . '/admin/controller/module/ukaddresssearch.php',
        $extensionCode . '/admin/language',
        $extensionCode . '/admin/language/en-gb',
        $extensionCode . '/admin/language/en-gb/module',
        $extensionCode . '/admin/language/en-gb/module/ukaddresssearch.php',
        $extensionCode . '/admin/view',
        $extensionCode . '/admin/view/template',
        $extensionCode . '/admin/view/template/module',
        $extensionCode . '/admin/view/template/module/ukaddresssearch.twig',
        
        // Catalog files
        $extensionCode . '/catalog',
        $extensionCode . '/catalog/controller',
        $extensionCode . '/catalog/controller/module',
        $extensionCode . '/catalog/controller/module/ukaddresssearch.php',
        $extensionCode . '/catalog/language',
        $extensionCode . '/catalog/language/en-gb',
        $extensionCode . '/catalog/language/en-gb/module',
        $extensionCode . '/catalog/language/en-gb/module/ukaddresssearch.php',
        $extensionCode . '/catalog/view',
        $extensionCode . '/catalog/view/template',
        $extensionCode . '/catalog/view/template/module',
        $extensionCode . '/catalog/view/template/module/ukaddresssearch.twig',
        
        // Install files
        $extensionCode . '/install.json'
    ];
    
    // Register each path
    foreach ($paths as $path) {
        // Check if the file/directory exists before registering
        $fullPath = $base . $path;
        $exists = (is_dir($fullPath) || is_file($fullPath)) ? "exists" : "does not exist";
        
        $model_setting_extension->addPath($extension_install_id, $path);
        $pathCount++;
        
        echo "Registered path: {$path} ({$exists})\n";
    }
    
    echo "Registered {$pathCount} essential extension paths\n";
    return $pathCount;
}
