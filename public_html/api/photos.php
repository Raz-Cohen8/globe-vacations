<?php
declare(strict_types=1);

require __DIR__ . '/../../includes/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=86400');

$query = filter_input(INPUT_GET, 'q');
$query = is_string($query) ? trim($query) : '';
if ($query === '' || strlen($query) > 200) {
    http_response_code(400);
    echo json_encode(['error' => 'q required']);
    exit;
}

$cfg    = config();
$apiKey = (string) ($cfg['pexels_api_key'] ?? '');

if ($apiKey === '') {
    // No key configured yet — return empty so the frontend hides the section.
    echo json_encode(['photos' => [], 'configured' => false]);
    exit;
}

// File-based cache (1 day per query). Saves API calls and speeds up repeat visits.
$cacheDir = __DIR__ . '/../../data/cache';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0775, true);
}
$cachePath = $cacheDir . '/pexels_' . substr(sha1($query), 0, 20) . '.json';
if (is_file($cachePath) && filemtime($cachePath) > time() - 86400) {
    readfile($cachePath);
    exit;
}

$url = 'https://api.pexels.com/v1/search?per_page=6&orientation=landscape&query=' . urlencode($query);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 6,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_HTTPHEADER     => ['Authorization: ' . $apiKey],
    CURLOPT_USERAGENT      => 'GlobeVacations/1.0',
]);
$raw    = curl_exec($ch);
$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$cerr   = curl_error($ch);
curl_close($ch);

if (!$raw || $status !== 200) {
    http_response_code(502);
    echo json_encode(['error' => 'upstream', 'status' => $status]);
    error_log("photos.php: pexels HTTP $status query=$query err=$cerr");
    exit;
}

$data   = json_decode($raw, true);
$photos = [];
if (is_array($data) && isset($data['photos']) && is_array($data['photos'])) {
    foreach ($data['photos'] as $p) {
        if (!is_array($p) || !isset($p['src'])) {
            continue;
        }
        $photos[] = [
            'url'              => (string) ($p['src']['large'] ?? $p['src']['medium'] ?? ''),
            'thumb'            => (string) ($p['src']['medium'] ?? $p['src']['small'] ?? ''),
            'page'             => (string) ($p['url'] ?? ''),
            'photographer'     => (string) ($p['photographer'] ?? ''),
            'photographer_url' => (string) ($p['photographer_url'] ?? ''),
            'alt'              => (string) ($p['alt'] ?? ''),
        ];
    }
}

$out  = ['photos' => $photos, 'configured' => true];
$json = json_encode($out, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
@file_put_contents($cachePath, $json);
echo $json;
