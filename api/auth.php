<?php

require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$data = getRequestData();

if ($method === 'POST') {
    $action = $data['action'] ?? null;
    
    if ($action === 'register') {
        // User registration
        if (!validateRequired($data, ['username', 'email', 'password'])) {
            sendError('Missing required fields: username, email, password', 400);
        }
        
        $username = sanitizeString($data['username']);
        $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        $password = $data['password'];
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendError('Invalid email format', 400);
        }
        
        // Validate password strength (minimum 6 characters)
        if (strlen($password) < 6) {
            sendError('Password must be at least 6 characters long', 400);
        }
        
        // Check if username or email already exists
        $checkQuery = "SELECT id FROM users WHERE username = ? OR email = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bind_param('ss', $username, $email);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            sendError('Username or email already exists', 400);
        }
        $checkStmt->close();
        
        // Hash password
        $passwordHash = hashPassword($password);
        
        // Insert new user
        $insertQuery = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
        $insertStmt = $db->prepare($insertQuery);
        
        if (!$insertStmt) {
            sendError('Database error: ' . $db->error, 500);
        }
        
        $insertStmt->bind_param('sss', $username, $email, $passwordHash);
        
        if (!$insertStmt->execute()) {
            sendError('Failed to register user: ' . $insertStmt->error, 500);
        }
        
        $userId = $insertStmt->insert_id;
        $insertStmt->close();
        
        // Login the user
        loginUser($userId);
        
        sendResponse([
            'success' => true,
            'message' => 'User registered and logged in successfully',
            'user_id' => $userId,
            'username' => $username
        ], 201);
    }
    
    elseif ($action === 'login') {
        // User login
        if (!validateRequired($data, ['username', 'password'])) {
            sendError('Missing required fields: username, password', 400);
        }
        
        $username = sanitizeString($data['username']);
        $password = $data['password'];
        
        // Query user by username
        $query = "SELECT id, username, email, password_hash FROM users WHERE username = ?";
        $stmt = $db->prepare($query);
        
        if (!$stmt) {
            sendError('Database error: ' . $db->error, 500);
        }
        
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            sendError('Invalid username or password', 401);
        }
        
        $user = $result->fetch_assoc();
        $stmt->close();
        
        // Verify password
        if (!verifyPassword($password, $user['password_hash'])) {
            sendError('Invalid username or password', 401);
        }
        
        // Login successful
        loginUser($user['id']);
        
        sendResponse([
            'success' => true,
            'message' => 'Login successful',
            'user_id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email']
        ], 200);
    }
    
    elseif ($action === 'logout') {
        // User logout
        logoutUser();
        sendResponse([
            'success' => true,
            'message' => 'Logged out successfully'
        ], 200);
    }
    
    else {
        sendError('Invalid action. Use: register, login, or logout', 400);
    }
}

elseif ($method === 'GET') {
    // Check authentication status
    if (isAuthenticated()) {
        $userId = $_SESSION['user_id'];
        
        $query = "SELECT id, username, email, created_at FROM users WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            sendResponse([
                'authenticated' => true,
                'user' => $user
            ], 200);
        }
        $stmt->close();
    }
    
    sendResponse([
        'authenticated' => false
    ], 200);
}

else {
    sendError('Method not allowed', 405);
}
