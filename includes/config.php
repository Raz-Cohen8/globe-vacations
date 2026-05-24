<?php
declare(strict_types=1);

/**
 * Loads project configuration from includes/secrets.php (gitignored).
 * Returns sensible empty defaults if secrets.php is missing, so the
 * site keeps running locally before keys are provisioned.
 */
function config(): array
{
    static $cfg = null;
    if ($cfg !== null) {
        return $cfg;
    }

    $defaults = [
        'pexels_api_key' => '',
        'booking_aid'    => '',
    ];

    $path = __DIR__ . '/secrets.php';
    if (is_file($path)) {
        $loaded = require $path;
        $cfg = is_array($loaded) ? array_replace($defaults, $loaded) : $defaults;
    } else {
        $cfg = $defaults;
    }
    return $cfg;
}
