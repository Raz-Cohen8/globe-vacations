<?php
declare(strict_types=1);

require __DIR__ . '/../../includes/destinations.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60');

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'id required']);
    exit;
}

try {
    $dest = (new Destinations())->byId($id);
    if (!$dest) {
        http_response_code(404);
        echo json_encode(['error' => 'destination not found']);
        exit;
    }
    echo json_encode($dest, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'server error']);
    error_log('destination: ' . $e->getMessage());
}
