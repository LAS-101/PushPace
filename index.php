<?php
// Start session for authentication
session_start();

// Redirect to login if not authenticated, otherwise to dashboard
if (isset($_SESSION['user_id']) && !empty($_SESSION['user_id'])) {
    header('Location: frontend/dashboard.html');
} else {
    header('Location: frontend/login.html');
}
exit;
