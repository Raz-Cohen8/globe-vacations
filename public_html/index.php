<?php
declare(strict_types=1);

$cssV = filemtime(__DIR__ . '/assets/css/style.css');
$jsV  = filemtime(__DIR__ . '/assets/js/app.js');
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="The Bureau of Wanderings dispatches you to a destination at random. Spin the world and receive your travel dossier — by airmail.">
<meta name="theme-color" content="#ecddbc">
<title>Globe Vacations — Bureau of Wanderings</title>

<!-- Travelpayouts Drive (affiliate tracking) -->
<script nowprocket data-noptimize="1" data-cfasync="false" data-wpfc-render="false" seraph-accel-crit="1" data-no-defer="1">
  (function () {
      var script = document.createElement("script");
      script.async = 1;
      script.src = 'https://emrldtp.cc/NTMyNjgx.js?t=532681';
      document.head.appendChild(script);
  })();
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://unpkg.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="/assets/css/style.css?v=<?= $cssV ?>">
</head>
<body>

<header class="brand">
  <div class="brand__seal">G</div>
  <div>
    <div class="brand__text">Globe Vacations</div>
    <span class="brand__sub">Est. 1924 · Routes worldwide</span>
  </div>
</header>

<div class="meta-top" aria-hidden="true">
  <div>Bureau of <strong>Wanderings</strong></div>
  <div>Issue №<strong id="issue-num">001</strong></div>
</div>

<div class="hero">
  <div class="hero__eyebrow">Spin · Voyage · Discover</div>
  <h1 class="hero__title">Turn the world<br><em>and go.</em></h1>
</div>

<div class="scene">
  <div id="globe" role="img" aria-label="Interactive vintage globe"></div>
</div>

<svg class="compass-deco" viewBox="0 0 100 100" aria-hidden="true">
  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="1"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2 3"/>
  <path d="M50 10 L54 50 L50 90 L46 50 Z" fill="currentColor" opacity="0.85"/>
  <path d="M10 50 L50 46 L90 50 L50 54 Z" fill="currentColor" opacity="0.4"/>
  <text x="50" y="8" font-family="DM Mono, monospace" font-size="7" text-anchor="middle" fill="currentColor">N</text>
  <text x="50" y="98" font-family="DM Mono, monospace" font-size="7" text-anchor="middle" fill="currentColor">S</text>
  <text x="6" y="53" font-family="DM Mono, monospace" font-size="7" text-anchor="middle" fill="currentColor">W</text>
  <text x="94" y="53" font-family="DM Mono, monospace" font-size="7" text-anchor="middle" fill="currentColor">E</text>
</svg>

<div class="coords" aria-hidden="true">
  <div>Lat <strong id="coord-lat">—</strong></div>
  <div>Lng <strong id="coord-lng">—</strong></div>
</div>

<div class="spin-zone">
  <button id="spin-btn" class="spin-btn" type="button" aria-label="Spin the globe">
    <div class="spin-btn__inner">
      <span class="spin-btn__top">— Bureau of —</span>
      <span class="spin-btn__main">Depart</span>
      <span class="spin-btn__compass">↦</span>
    </div>
  </button>
  <span class="spin-caption" id="spin-caption">Turn the globe — receive your dispatch</span>
</div>

<article id="postcard" class="postcard" aria-live="polite" hidden>
  <button class="postcard__close" id="card-close" aria-label="Close">×</button>
  <div class="postcard__grid">
    <div class="postcard__photo" id="card-photo-wrap">
      <img id="card-photo" alt="" loading="lazy">
      <div class="postcard__photo-skeleton" id="card-photo-skeleton"></div>
      <div class="postcard__photo-label">
        <span id="card-photo-label">DISPATCH №001</span>
        <span id="card-photo-coords">—</span>
      </div>
      <a id="card-photo-credit" class="postcard__photo-credit" href="https://www.pexels.com" target="_blank" rel="noopener">Photo · Pexels</a>
    </div>
    <div class="postcard__body">
      <div class="postcard__stamp">
        <div class="postcard__stamp-content">
          <span class="postcard__stamp-top">PAR AVION</span>
          <span class="postcard__stamp-currency" id="card-stamp-cur">¥</span>
          <span class="postcard__stamp-bottom" id="card-stamp-bot">JAPAN</span>
        </div>
      </div>
      <div class="postcard__country" id="card-country">JAPAN · ASIA</div>
      <h2 class="postcard__name" id="card-name">Kyoto</h2>
      <p class="postcard__tagline" id="card-tagline">Temples, tea, and cherry blossoms.</p>
      <p class="postcard__desc" id="card-desc">Japan's old imperial capital, where wooden teahouses and Zen gardens sit beside neon arcades.</p>
      <div class="postcard__meta-row">
        <div class="postcard__meta">
          <span class="postcard__meta-k">Best Season</span>
          <span class="postcard__meta-v" id="card-best">Mar–Apr</span>
        </div>
        <div class="postcard__meta">
          <span class="postcard__meta-k">Currency</span>
          <span class="postcard__meta-v" id="card-cur">JPY</span>
        </div>
        <div class="postcard__meta">
          <span class="postcard__meta-k">Plot</span>
          <a class="postcard__meta-v postcard__meta-link" id="card-map-link" href="#" target="_blank" rel="noopener">Open map ↗</a>
        </div>
      </div>
      <div class="postcard__actions">
        <a id="card-book" class="btn-depart" href="#" target="_blank" rel="noopener sponsored">
          <span>Book passage</span>
          <span class="btn-depart__arrow">→</span>
        </a>
        <a id="card-tours" class="btn-tours" href="#" target="_blank" rel="noopener sponsored">
          <span>Activities</span>
          <span class="btn-depart__arrow">→</span>
        </a>
      </div>
      <div class="postcard__secondary">
        <button id="card-gpt" class="link-tiny" type="button">Ask ChatGPT</button>
        <span class="link-tiny__sep">·</span>
        <button id="card-share" class="link-tiny" type="button">Send to a friend</button>
        <span class="link-tiny__sep">·</span>
        <button id="card-respin" class="link-tiny" type="button">Re-spin</button>
      </div>
    </div>
  </div>
</article>

<div id="postmark" class="postmark" aria-hidden="true">
  Dispatched
  <span class="postmark__date" id="postmark-date">— · <?= date('Y') ?></span>
</div>

<footer class="footer">
  <span>© <?= date('Y') ?> Globe Vacations · Bureau of Wanderings</span>
  <span class="footer__sep">·</span>
  <span>Affiliate links may earn us commission. It keeps the globe spinning.</span>
</footer>

<!-- Globe.gl + dependencies -->
<script src="https://unpkg.com/three@0.158.0/build/three.min.js"></script>
<script src="https://unpkg.com/globe.gl@2.34.4/dist/globe.gl.min.js"></script>
<script src="/assets/js/app.js?v=<?= $jsV ?>"></script>
</body>
</html>
