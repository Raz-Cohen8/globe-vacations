<?php
declare(strict_types=1);

require __DIR__ . '/../../includes/destinations.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

try {
    $dest = (new Destinations())->random();
    echo json_encode($dest, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not load destinations']);
    error_log('random-destination: ' . $e->getMessage());
}
