<?php
declare(strict_types=1);

/**
 * Destinations data access layer.
 *
 * Local dev reads from data/destinations.json.
 * Production swaps to MySQL by adding a PDO-backed implementation here.
 */

final class Destinations
{
    private string $jsonPath;

    public function __construct(?string $jsonPath = null)
    {
        $this->jsonPath = $jsonPath ?? __DIR__ . '/../data/destinations.json';
    }

    /** @return array<int, array<string, mixed>> */
    public function all(): array
    {
        $raw = @file_get_contents($this->jsonPath);
        if ($raw === false) {
            throw new RuntimeException('destinations.json not found');
        }
        $data = json_decode($raw, true, flags: JSON_THROW_ON_ERROR);
        if (!is_array($data)) {
            throw new RuntimeException('destinations.json malformed');
        }
        return $data;
    }

    /** @return array<string, mixed> */
    public function random(): array
    {
        $all = $this->all();
        return $all[random_int(0, count($all) - 1)];
    }

    /** @return array<int, array{id:int,lat:float,lng:float}> */
    public function pinPoints(): array
    {
        return array_map(
            fn(array $d): array => [
                'id'  => (int) $d['id'],
                'lat' => (float) $d['lat'],
                'lng' => (float) $d['lng'],
            ],
            $this->all()
        );
    }
}
