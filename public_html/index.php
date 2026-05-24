<?php
declare(strict_types=1);

$cssV = filemtime(__DIR__ . '/assets/css/style.css');
$jsV  = filemtime(__DIR__ . '/assets/js/app.js');
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Spin the globe. Get a vacation. Discover your next destination at random — handpicked places to sleep, eat and explore.">
<meta name="theme-color" content="#0a0e27">
<title>Globe Vacations — Spin the World, Find Your Next Trip</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://unpkg.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="/assets/css/style.css?v=<?= $cssV ?>">
</head>
<body>

<div class="stars" aria-hidden="true"></div>
<div class="stars stars--far" aria-hidden="true"></div>

<header class="topbar">
  <a href="/" class="brand">
    <span class="brand__dot"></span>
    <span class="brand__name">Globe<span>Vacations</span></span>
  </a>
  <nav class="topbar__nav">
    <button type="button" class="link-btn" data-scroll="how">How it works</button>
    <button type="button" class="link-btn" data-scroll="ad-slot">Sponsored</button>
  </nav>
</header>

<main class="stage">
  <section class="hero">
    <h1>Spin the world.<br><span class="hero__accent">Find your next trip.</span></h1>
    <p class="hero__sub">Click the globe. It picks a place. You go pack.</p>
  </section>

  <div id="globe-wrap" class="globe-wrap" role="img" aria-label="Interactive 3D globe">
    <div id="globe"></div>
    <button id="spin-btn" type="button" class="spin-btn">
      <span class="spin-btn__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-3-6.7"/>
          <polyline points="21 4 21 9 16 9"/>
        </svg>
      </span>
      <span class="spin-btn__label">Spin the globe</span>
    </button>
    <div id="globe-hint" class="globe-hint">Loading the planet…</div>
  </div>

  <!-- Destination reveal card -->
  <article id="card" class="card" aria-live="polite" hidden>
    <button type="button" class="card__close" aria-label="Close">&times;</button>
    <div class="card__head">
      <div>
        <p class="card__eyebrow"><span class="card__pin" aria-hidden="true"></span><span id="card-country"></span></p>
        <h2 id="card-name" class="card__name"></h2>
        <p id="card-tagline" class="card__tagline"></p>
      </div>
      <div class="card__meta">
        <div class="meta">
          <span class="meta__k">Best time</span>
          <span class="meta__v" id="card-best"></span>
        </div>
        <div class="meta">
          <span class="meta__k">Currency</span>
          <span class="meta__v" id="card-currency"></span>
        </div>
      </div>
    </div>
    <p id="card-long" class="card__long"></p>
    <div class="card__actions">
      <a id="card-book" class="btn btn--primary" href="#" target="_blank" rel="noopener sponsored">
        <span>Find places to stay</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>
      </a>
      <button id="card-gpt" class="btn btn--ghost" type="button">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>Ask ChatGPT about it</span>
      </button>
      <button id="card-respin" class="btn btn--text" type="button">
        Try another →
      </button>
    </div>
  </article>
</main>

<!-- Sponsored / ad slot -->
<aside id="ad-slot" class="ad-slot" aria-label="Sponsored">
  <div class="ad-slot__inner">
    <span class="ad-slot__label">Sponsored</span>
    <p class="ad-slot__placeholder">Your ad here — 728&times;90 leaderboard.</p>
  </div>
</aside>

<section id="how" class="how">
  <h2>How it works</h2>
  <ol>
    <li><strong>Spin.</strong> Click the globe and let the planet do the choosing.</li>
    <li><strong>Read.</strong> A handpicked overview, best time to go, and what to do.</li>
    <li><strong>Book.</strong> Jump straight to verified stays from our partners.</li>
  </ol>
  <p class="how__fine">Affiliate disclosure: when you book through our partner links, we may earn a small commission at no extra cost to you. It keeps the globe spinning.</p>
</section>

<footer class="footer">
  <p>© <?= date('Y') ?> Globe Vacations. Made with 🌍 for restless travelers.</p>
</footer>

<!-- Globe.gl + dependencies (Three.js bundled inside) -->
<script src="https://unpkg.com/three@0.158.0/build/three.min.js"></script>
<script src="https://unpkg.com/globe.gl@2.34.4/dist/globe.gl.min.js"></script>
<script src="/assets/js/app.js?v=<?= $jsV ?>"></script>
</body>
</html>
