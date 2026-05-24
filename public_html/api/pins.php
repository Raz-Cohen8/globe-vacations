<?php
declare(strict_types=1);

require __DIR__ . '/../../includes/destinations.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

try {
    echo json_encode((new Destinations())->pinPoints(), JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not load pins']);
    error_log('pins: ' . $e->getMessage());
}
