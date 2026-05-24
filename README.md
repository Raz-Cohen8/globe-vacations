# Globe Vacations

An interactive 3D globe that suggests random vacation destinations and links to booking partners.

## Stack

- PHP 8.4 (production on Hostinger) / 8.5 (local dev)
- MySQL on production, JSON file on local dev
- Frontend: vanilla JS + [globe.gl](https://globe.gl) (Three.js wrapper)
- Hosting: Hostinger shared hosting

## Local development

```bash
php -S localhost:8000 -t public_html
```

Open http://localhost:8000

## Project layout

```
public_html/        Web root — only this is exposed
  index.php         Main page
  api/              JSON endpoints
  assets/           CSS, JS, images
includes/           Server-side code (not web-accessible)
data/               JSON datasets used in local dev
migrations/         SQL migrations for production
docs/               Project notes
```

Follows the conventions in [Hostinger-PHP-Guide](https://github.com/omegis/Hostinger-PHP-Guide).
