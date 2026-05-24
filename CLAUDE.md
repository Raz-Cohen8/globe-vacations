# Globe Vacations — Claude instructions

## What this project is

Interactive 3D globe that recommends random vacation destinations. Revenue model: affiliate links (Booking.com, Agoda, etc.) + ad placements. Target audience: global English-speaking travelers.

**All user-facing copy is English.** Buttons, labels, destination descriptions, alt text, error messages shown to users — English only. Internal code comments may be in any language.

## Conventions

This project follows [Hostinger-PHP-Guide](https://github.com/omegis/Hostinger-PHP-Guide). Key points:

- **Layout:** `public_html/` is the only web-accessible directory. `includes/` and `data/` must never be reachable via URL.
- **PHP:** target PHP 8.4 (production); local dev runs 8.5+ (compatible).
- **DB:** local dev uses `data/destinations.json` for now. Production will use MySQL on Hostinger. Code reads through `includes/destinations.php` so the storage backend is swappable.
- **Frontend:** Three.js / globe.gl loaded from CDN. No bundler — keep it simple, ship to shared hosting cleanly.
- **Design:** characterful, intentional. Avoid generic "AI slop" patterns. Current palette: deep space navy `#0a0e27`, warm gold `#f4a261`, off-white text. Font: Space Grotesk.
- **No secrets in repo.** Production credentials live in `includes/secrets.php` (gitignored) on the server.

## Common commands

```bash
# Run locally
php -S localhost:8000 -t public_html

# Production PHP path on Hostinger (CLI defaults to 7.4 there)
/opt/alt/php84/usr/bin/php
```

## Hostinger deploy notes

- SSH port: **65002** (not 22)
- Disabled functions on Hostinger: `exec, shell_exec, system, passthru, popen, proc_open` — do not depend on these
- OPcache caches PHP files; deploys may need cache reset to take effect
