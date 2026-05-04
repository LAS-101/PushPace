<?php
/**
 * PushPace Profile API
 * Handles GET (retrieve profile) and POST (update/create profile)
 * 
 * GET  /api/profile.php → Get user profile
 * POST /api/profile.php → Create/Update user profile
 */

require_once __DIR__ . '/config.php';

$db = getDB();
$userId = getCurrentUserId();
$method = $_SERVER['REQUEST_METHOD'];
$data = getRequestData();

if ($method === 'GET') {
    // Retrieve user profile
    $query = "SELECT id, username, email, weight, height, age, gender, created_at, updated_at 
              FROM users WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        sendError('Database error: ' . $db->error, 500);
    }
    
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('User profile not found', 404);
    }
    
    $profile = $result->fetch_assoc();
    $stmt->close();
    
    // Convert numeric strings to proper types
    $profile['weight'] = $profile['weight'] ? (float)$profile['weight'] : null;
    $profile['height'] = $profile['height'] ? (int)$profile['height'] : null;
    $profile['age'] = $profile['age'] ? (int)$profile['age'] : null;
    
    sendResponse($profile);
}

elseif ($method === 'POST') {
    // Update user profile
    $data = getRequestData();
    
    // Validate required fields
    if (!isset($data['weight']) || !isset($data['height']) || 
        !isset($data['age']) || !isset($data['gender'])) {
        sendError('Missing required fields: weight, height, age, gender', 400);
    }
    
    // Validate input values
    if (!validateNumber($data['weight'], 30, 300)) {
        sendError('Invalid weight. Must be between 30 and 300 kg.', 400);
    }
    
    if (!validateNumber($data['height'], 100, 250)) {
        sendError('Invalid height. Must be between 100 and 250 cm.', 400);
    }
    
    if (!validateNumber($data['age'], 10, 120)) {
        sendError('Invalid age. Must be between 10 and 120.', 400);
    }
    
    if (!validateGender($data['gender'])) {
        sendError('Invalid gender. Must be "male" or "female".', 400);
    }
    
    // Prepare data
    $weight = (float)$data['weight'];
    $height = (int)$data['height'];
    $age = (int)$data['age'];
    $gender = $data['gender'];
    
    // Update profile
    $query = "UPDATE users SET weight = ?, height = ?, age = ?, gender = ? WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if (!$stmt) {
        sendError('Database error: ' . $db->error, 500);
    }
    
    $stmt->bind_param('ddssi', $weight, $height, $age, $gender, $userId);
    
    if (!$stmt->execute()) {
        sendError('Failed to update profile: ' . $stmt->error, 500);
    }
    
    $stmt->close();
    
    // Return updated profile
    $query = "SELECT id, username, email, weight, height, age, gender, created_at, updated_at 
              FROM users WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $profile = $result->fetch_assoc();
    $stmt->close();
    
    // Convert numeric strings to proper types
    $profile['weight'] = $profile['weight'] ? (float)$profile['weight'] : null;
    $profile['height'] = $profile['height'] ? (int)$profile['height'] : null;
    $profile['age'] = $profile['age'] ? (int)$profile['age'] : null;
    
    sendResponse(['success' => true, 'message' => 'Profile updated successfully', 'profile' => $profile], 200);
}

else {
    sendError('Method not allowed. Use GET or POST.', 405);
}
