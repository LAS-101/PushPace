<?php

require_once __DIR__ . '/config.php';

$db = getDB();
$userId = getCurrentUserId();
$method = $_SERVER['REQUEST_METHOD'];
$data = getRequestData();

if ($method === 'GET') {
    // Retrieve activities of a specific type
    $type = $data['type'] ?? null;
    
    if (!$type) {
        sendError('Missing required parameter: type (walking, gym, running)', 400);
    }
    
    if ($type === 'walking') {
        $query = "SELECT id, user_id, date, duration, distance, steps, calories, created_at 
                  FROM walking_activities WHERE user_id = ? ORDER BY date DESC";
        $stmt = $db->prepare($query);
        
        if (!$stmt) {
            sendError('Database error: ' . $db->error, 500);
        }
        
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $activities = [];
        while ($row = $result->fetch_assoc()) {
            // Convert numeric strings to proper types
            $row['duration'] = (int)$row['duration'];
            $row['distance'] = (float)$row['distance'];
            $row['steps'] = (int)$row['steps'];
            $row['calories'] = (int)$row['calories'];
            $row['id'] = (int)$row['id'];
            $activities[] = $row;
        }
        
        $stmt->close();
        sendResponse($activities);
    }
    
    elseif ($type === 'gym') {
        $query = "SELECT id, user_id, date, duration, calories, created_at 
                  FROM gym_workouts WHERE user_id = ? ORDER BY date DESC";
        $stmt = $db->prepare($query);
        
        if (!$stmt) {
            sendError('Database error: ' . $db->error, 500);
        }
        
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $workouts = [];
        while ($row = $result->fetch_assoc()) {
            // Convert numeric strings to proper types
            $row['duration'] = (int)$row['duration'];
            $row['calories'] = (int)$row['calories'];
            $row['id'] = (int)$row['id'];
            
            // Fetch exercises for this workout
            $exQuery = "SELECT id, workout_id, name, sets, reps, weight 
                       FROM gym_exercises WHERE workout_id = ?";
            $exStmt = $db->prepare($exQuery);
            $workoutId = $row['id'];
            $exStmt->bind_param('i', $workoutId);
            $exStmt->execute();
            $exResult = $exStmt->get_result();
            
            $exercises = [];
            while ($ex = $exResult->fetch_assoc()) {
                $ex['sets'] = (int)$ex['sets'];
                $ex['reps'] = (int)$ex['reps'];
                $ex['weight'] = (float)$ex['weight'];
                $exercises[] = $ex;
            }
            $exStmt->close();
            
            $row['exercises'] = $exercises;
            $workouts[] = $row;
        }
        
        $stmt->close();
        sendResponse($workouts);
    }
    
    elseif ($type === 'running') {
        $query = "SELECT id, user_id, date, duration, distance, pace, calories, created_at 
                  FROM running_activities WHERE user_id = ? ORDER BY date DESC";
        $stmt = $db->prepare($query);
        
        if (!$stmt) {
            sendError('Database error: ' . $db->error, 500);
        }
        
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $activities = [];
        while ($row = $result->fetch_assoc()) {
            // Convert numeric strings to proper types
            $row['duration'] = (int)$row['duration'];
            $row['distance'] = (float)$row['distance'];
            $row['pace'] = (float)$row['pace'];
            $row['calories'] = (int)$row['calories'];
            $row['id'] = (int)$row['id'];
            $activities[] = $row;
        }
        
        $stmt->close();
        sendResponse($activities);
    }
    
    else {
        sendError('Invalid activity type. Use: walking, gym, or running.', 400);
    }
}

elseif ($method === 'POST') {
    // Create new activity
    $type = $data['type'] ?? null;
    
    if (!$type) {
        sendError('Missing required parameter: type (walking, gym, running)', 400);
    }
    
    if ($type === 'walking') {
        // Validate walking activity fields
        if (!validateRequired($data, ['date', 'duration', 'distance', 'steps', 'calories'])) {
            sendError('Missing required fields for walking activity', 400);
        }
        
        if (!validateDate($data['date'])) {
            sendError('Invalid date format. Use YYYY-MM-DD.', 400);
        }
        
        // Validate values
        if (!validateNumber($data['duration'], 1)) {
            sendError('Invalid duration.', 400);
        }
        if (!validateNumber($data['distance'], 0)) {
            sendError('Invalid distance.', 400);
        }
        if (!validateNumber($data['steps'], 0)) {
            sendError('Invalid steps.', 400);
        }
        if (!validateNumber($data['calories'], 0)) {
            sendError('Invalid calories.', 400);
        }
        
        $query = "INSERT INTO walking_activities (user_id, date, duration, distance, steps, calories) 
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        
        if (!$stmt) {
            sendError('Database error: ' . $db->error, 500);
        }
        
        $duration = (int)$data['duration'];
        $distance = (float)$data['distance'];
        $steps = (int)$data['steps'];
        $calories = (int)$data['calories'];
        $date = $data['date'];
        
        $stmt->bind_param('isidii', $userId, $date, $duration, $distance, $steps, $calories);
        
        if (!$stmt->execute()) {
            sendError('Failed to create activity: ' . $stmt->error, 500);
        }
        
        $activityId = $stmt->insert_id;
        $stmt->close();
        
        sendResponse(['success' => true, 'message' => 'Walking activity created', 'id' => $activityId], 201);
    }
    
    elseif ($type === 'gym') {
        // Validate gym workout fields
        if (!validateRequired($data, ['date', 'duration', 'calories'])) {
            sendError('Missing required fields for gym workout', 400);
        }
        
        if (!isset($data['exercises']) || !is_array($data['exercises']) || count($data['exercises']) === 0) {
            sendError('At least one exercise is required', 400);
        }
        
        if (!validateDate($data['date'])) {
            sendError('Invalid date format. Use YYYY-MM-DD.', 400);
        }
        
        if (!validateNumber($data['duration'], 1)) {
            sendError('Invalid duration.', 400);
        }
        if (!validateNumber($data['calories'], 0)) {
            sendError('Invalid calories.', 400);
        }
        
        $query = "INSERT INTO gym_workouts (user_id, date, duration, calories) VALUES (?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        
        if (!$stmt) {
            sendError('Database error: ' . $db->error, 500);
        }
        
        $duration = (int)$data['duration'];
        $calories = (int)$data['calories'];
        $date = $data['date'];
        
        $stmt->bind_param('isii', $userId, $date, $duration, $calories);
        
        if (!$stmt->execute()) {
            sendError('Failed to create workout: ' . $stmt->error, 500);
        }
        
        $workoutId = $stmt->insert_id;
        $stmt->close();
        
        // Insert exercises
        foreach ($data['exercises'] as $exercise) {
            if (!isset($exercise['name']) || !isset($exercise['sets']) || 
                !isset($exercise['reps']) || !isset($exercise['weight'])) {
                // Skip invalid exercises
                continue;
            }
            
            $exQuery = "INSERT INTO gym_exercises (workout_id, name, sets, reps, weight) 
                       VALUES (?, ?, ?, ?, ?)";
            $exStmt = $db->prepare($exQuery);
            
            if (!$exStmt) {
                continue;
            }
            
            $sets = (int)$exercise['sets'];
            $reps = (int)$exercise['reps'];
            $weight = (float)$exercise['weight'];
            $name = sanitizeString($exercise['name']);
            
            $exStmt->bind_param('isidi', $workoutId, $name, $sets, $reps, $weight);
            $exStmt->execute();
            $exStmt->close();
        }
        
        sendResponse(['success' => true, 'message' => 'Gym workout created', 'id' => $workoutId], 201);
    }
    
    elseif ($type === 'running') {
        // Validate running activity fields
        if (!validateRequired($data, ['date', 'duration', 'distance', 'pace', 'calories'])) {
            sendError('Missing required fields for running activity', 400);
        }
        
        if (!validateDate($data['date'])) {
            sendError('Invalid date format. Use YYYY-MM-DD.', 400);
        }
        
        if (!validateNumber($data['duration'], 1)) {
            sendError('Invalid duration.', 400);
        }
        if (!validateNumber($data['distance'], 0)) {
            sendError('Invalid distance.', 400);
        }
        if (!validateNumber($data['pace'], 0)) {
            sendError('Invalid pace.', 400);
        }
        if (!validateNumber($data['calories'], 0)) {
            sendError('Invalid calories.', 400);
        }
        
        $query = "INSERT INTO running_activities (user_id, date, duration, distance, pace, calories) 
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        
        if (!$stmt) {
            sendError('Database error: ' . $db->error, 500);
        }
        
        $duration = (int)$data['duration'];
        $distance = (float)$data['distance'];
        $pace = (float)$data['pace'];
        $calories = (int)$data['calories'];
        $date = $data['date'];
        
        $stmt->bind_param('isiddi', $userId, $date, $duration, $distance, $pace, $calories);
        
        if (!$stmt->execute()) {
            sendError('Failed to create activity: ' . $stmt->error, 500);
        }
        
        $activityId = $stmt->insert_id;
        $stmt->close();
        
        sendResponse(['success' => true, 'message' => 'Running activity created', 'id' => $activityId], 201);
    }
    
    else {
        sendError('Invalid activity type. Use: walking, gym, or running.', 400);
    }
}

elseif ($method === 'DELETE') {
    // Delete activity
    $type = $data['type'] ?? null;
    $id = $data['id'] ?? null;
    
    if (!$type || !$id) {
        sendError('Missing required parameters: type and id', 400);
    }
    
    if (!validateNumber($id, 1)) {
        sendError('Invalid id.', 400);
    }
    
    $id = (int)$id;
    
    if ($type === 'walking') {
        $query = "DELETE FROM walking_activities WHERE id = ? AND user_id = ?";
        $stmt = $db->prepare($query);
        $stmt->bind_param('ii', $id, $userId);
        
        if (!$stmt->execute()) {
            sendError('Failed to delete activity: ' . $stmt->error, 500);
        }
        
        if ($stmt->affected_rows === 0) {
            sendError('Activity not found', 404);
        }
        
        $stmt->close();
        sendResponse(['success' => true, 'message' => 'Walking activity deleted']);
    }
    
    elseif ($type === 'gym') {
        $query = "DELETE FROM gym_workouts WHERE id = ? AND user_id = ?";
        $stmt = $db->prepare($query);
        $stmt->bind_param('ii', $id, $userId);
        
        if (!$stmt->execute()) {
            sendError('Failed to delete workout: ' . $stmt->error, 500);
        }
        
        if ($stmt->affected_rows === 0) {
            sendError('Workout not found', 404);
        }
        
        $stmt->close();
        sendResponse(['success' => true, 'message' => 'Gym workout deleted']);
    }
    
    elseif ($type === 'running') {
        $query = "DELETE FROM running_activities WHERE id = ? AND user_id = ?";
        $stmt = $db->prepare($query);
        $stmt->bind_param('ii', $id, $userId);
        
        if (!$stmt->execute()) {
            sendError('Failed to delete activity: ' . $stmt->error, 500);
        }
        
        if ($stmt->affected_rows === 0) {
            sendError('Activity not found', 404);
        }
        
        $stmt->close();
        sendResponse(['success' => true, 'message' => 'Running activity deleted']);
    }
    
    else {
        sendError('Invalid activity type. Use: walking, gym, or running.', 400);
    }
}

else {
    sendError('Method not allowed. Use GET, POST, or DELETE.', 405);
}
