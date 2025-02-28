<?php
header('Content-Type: application/json');

$file = 'data/age_indices.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $indices = json_decode($input);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        if (file_put_contents($file, json_encode($indices, JSON_PRETTY_PRINT))) {
            http_response_code(200);
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Failed to save file']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>
