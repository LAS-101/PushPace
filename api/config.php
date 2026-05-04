<?php

// Database credentials (for XAMPP on localhost)
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');  // Default XAMPP password is empty
define('DB_NAME', 'pushpace_db');

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set JSON response header
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getDB() {
    static $conn = null;
    
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        if ($conn->connect_error) {
            http_response_code(500);
            die(json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]));
        }
        
        $conn->set_charset('utf8mb4');
    }
    
    return $conn;
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

function sendError($message, $statusCode = 400) {
    sendResponse(['error' => $message], $statusCode);
}

function getCurrentUserId() {
    return 1; // Default user ID for testing
}

function validateRequired($data, $fields) {
    foreach ($fields as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            return false;
        }
    }
    return true;
}

function sanitizeString($input) {
    return trim(htmlspecialchars($input, ENT_QUOTES, 'UTF-8'));
}

function validateNumber($value, $min = null, $max = null) {
    if (!is_numeric($value)) {
        return false;
    }
    if ($min !== null && $value < $min) {
        return false;
    }
    if ($max !== null && $value > $max) {
        return false;
    }
    return true;
}


function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

function validateGender($gender) {
    return in_array($gender, ['male', 'female']);
}

function getRequestData() {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        return $_GET;
    }
    
    $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
    
    if (strpos($contentType, 'application/json') !== false) {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
    
    return $_POST;
}

// Ensure database connection is established
getDB();
