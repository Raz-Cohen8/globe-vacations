/* ==========================================================================
   Globe Vacations — frontend app
   Builds the 3D globe, handles spin → fetch random destination → reveal card.
   Dependencies (loaded from CDN in index.php): THREE, Globe (globe.gl)
   ========================================================================== */
(() => {
  'use strict';

  const TEXTURE_BASE = 'https://unpkg.com/three-globe@2.32.0/example/img';
  const EARTH_DAY    = `${TEXTURE_BASE}/earth-day.jpg`;        // ~2K resolution (was 8K Blue Marble = 8MB)
  const EARTH_BUMP   = `${TEXTURE_BASE}/earth-topology.png`;
  const COUNTRIES    = '/assets/data/countries.geojson';

  // Hand-picked major-country labels (capital coords). Kept small so the globe
  // doesn't get busy — the user asked for hints, not a textbook.
  const COUNTRY_LABELS = [
    { name: 'USA',       lat: 38.9,  lng: -77.04 },
    { name: 'Canada',    lat: 45.42, lng: -75.69 },
    { name: 'Mexico',    lat: 19.43, lng: -99.13 },
    { name: 'Brazil',    lat: -15.78, lng: -47.93 },
    { name: 'Argentina', lat: -34.6, lng: -58.38 },
    { name: 'Peru',      lat: -12.05, lng: -77.04 },
    { name: 'Colombia',  lat: 4.71,  lng: -74.07 },
    { name: 'UK',        lat: 51.51, lng: -0.13 },
    { name: 'France',    lat: 48.85, lng: 2.35 },
    { name: 'Spain',     lat: 40.42, lng: -3.7 },
    { name: 'Portugal',  lat: 38.72, lng: -9.14 },
    { name: 'Germany',   lat: 52.52, lng: 13.4 },
    { name: 'Italy',     lat: 41.9,  lng: 12.5 },
    { name: 'Greece',    lat: 37.98, lng: 23.73 },
    { name: 'Turkey',    lat: 41.01, lng: 28.98 },
    { name: 'Egypt',     lat: 30.04, lng: 31.24 },
    { name: 'Morocco',   lat: 33.97, lng: -6.85 },
    { name: 'Nigeria',   lat: 9.08,  lng: 7.4 },
    { name: 'Kenya',     lat: -1.29, lng: 36.82 },
    { name: 'S. Africa', lat: -25.75, lng: 28.19 },
    { name: 'Russia',    lat: 55.75, lng: 37.62 },
    { name: 'China',     lat: 39.9,  lng: 116.4 },
    { name: 'Japan',     lat: 35.68, lng: 139.69 },
    { name: 'S. Korea',  lat: 37.57, lng: 126.98 },
    { name: 'India',     lat: 28.61, lng: 77.21 },
    { name: 'Thailand',  lat: 13.76, lng: 100.5 },
    { name: 'Vietnam',   lat: 21.03, lng: 105.85 },
    { name: 'Indonesia', lat: -6.21, lng: 106.85 },
    { name: 'Australia', lat: -35.28, lng: 149.13 },
    { name: 'New Zealand', lat: -41.29, lng: 174.78 },
    { name: 'Saudi Arabia', lat: 24.71, lng: 46.68 },
    { name: 'Iran',      lat: 35.69, lng: 51.39 },
    { name: 'Israel',    lat: 31.78, lng: 35.22 },
    { name: 'Norway',    lat: 59.91, lng: 10.75 },
    { name: 'Sweden',    lat: 59.33, lng: 18.07 },
    { name: 'Iceland',   lat: 64.13, lng: -21.94 },
    { name: 'Chile',     lat: -33.45, lng: -70.67 },
  ];

  const $ = (sel) => document.querySelector(sel);

  // ---------- State ----------
  const state = {
    destination: null,
    isSpinning: false,
    pins: [],
  };

  const els = {
    globe:        $('#globe'),
    wrap:         $('#globe-wrap'),
    spinBtn:      $('#spin-btn'),
    hint:         $('#globe-hint'),
    card:         $('#card'),
    cardClose:    $('.card__close'),
    cardCountry:  $('#card-country'),
    cardName:     $('#card-name'),
    cardTagline:  $('#card-tagline'),
    cardLong:     $('#card-long'),
    cardBest:     $('#card-best'),
    cardCurrency: $('#card-currency'),
    cardBook:     $('#card-book'),
    cardTours:    $('#card-tours'),
    cardGpt:      $('#card-gpt'),
    cardRespin:   $('#card-respin'),
    cardMap:      $('#card-map'),
    cardMapLink:  $('#card-map-link'),
    cardShare:    $('#card-share'),
    cardPhotos:      $('#card-photos'),
    cardPhotosTrack: $('#card-photos-track'),
    cardPhotosEmpty: $('#card-photos-empty'),
  };

  // ---------- Globe setup ----------
  const globe = Globe()
    .globeImageUrl(EARTH_DAY)
    .bumpImageUrl(EARTH_BUMP)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true)
    .atmosphereColor('#6fb3ff')
    .atmosphereAltitude(0.22)
    .pointsData([])
    .pointAltitude(0.012)
    .pointRadius(0.18)
    .pointColor(() => 'rgba(244, 162, 97, 0.85)')
    .pointsMerge(true)
    (els.globe);

  // Fit + tune renderer
  const fit = () => {
    const r = els.wrap.getBoundingClientRect();
    globe.width(r.width).height(r.height);
  };
  fit();
  window.addEventListener('resize', fit);

  // Renderer quality — cap pixel ratio at 1.5 (Retina would otherwise render 4x pixels,
  // which freezes lower-spec machines on first paint)
  const renderer = globe.renderer();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Initial camera
  globe.pointOfView({ lat: 25, lng: 10, altitude: 2.6 }, 0);

  // Auto-rotate (gentle, only when idle)
  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;
  controls.enableZoom = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 180;
  controls.maxDistance = 600;

  // Soft directional light for nicer bump shading
  const scene = globe.scene();
  const sun = new THREE.DirectionalLight(0xfff1d6, 0.85);
  sun.position.set(-1, 0.6, 1).multiplyScalar(400);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x9aa9c9, 0.55));

  // ---------- Pin (custom Three.js object) ----------
  const PIN_GROUP = new THREE.Group();
  PIN_GROUP.visible = false;
  scene.add(PIN_GROUP);

  // Build pin geometry: stem + head + glow + pulse rings
  const pinHeight = 14;
  const pinHeadR  = 4.2;
  const stemGeo = new THREE.CylinderGeometry(0.6, 0.6, pinHeight, 12);
  stemGeo.translate(0, pinHeight / 2, 0);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0xfaf5e6,
    emissive: 0xfaf5e6,
    emissiveIntensity: 0.25,
    metalness: 0.2,
    roughness: 0.4,
  });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  PIN_GROUP.add(stem);

  const headGeo = new THREE.SphereGeometry(pinHeadR, 28, 28);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xff4f5a,
    emissive: 0xff2a3a,
    emissiveIntensity: 0.9,
    roughness: 0.35,
    metalness: 0.1,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = pinHeight + pinHeadR * 0.7;
  PIN_GROUP.add(head);

  // Outer glow sphere around the head
  const glowGeo = new THREE.SphereGeometry(pinHeadR * 1.9, 28, 28);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff4f5a,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.copy(head.position);
  PIN_GROUP.add(glow);

  // Pulse rings at base of pin (on the globe surface)
  const PULSE_COUNT = 3;
  const pulseRings = [];
  for (let i = 0; i < PULSE_COUNT; i++) {
    const ringGeo = new THREE.RingGeometry(1.5, 2.2, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff4f5a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2; // flat on surface
    ring.userData.phase = i / PULSE_COUNT;
    PIN_GROUP.add(ring);
    pulseRings.push(ring);
  }

  // Animate pulses
  const clock = new THREE.Clock();
  (function animatePulses() {
    requestAnimationFrame(animatePulses);
    if (!PIN_GROUP.visible) return;
    const t = clock.getElapsedTime();
    pulseRings.forEach((ring) => {
      const local = (t + ring.userData.phase * 2.0) % 2.0;
      const k = local / 2.0;
      const scale = 1 + k * 7;
      ring.scale.setScalar(scale);
      ring.material.opacity = Math.max(0, 0.55 * (1 - k));
    });
    // Subtle head bob
    const bob = Math.sin(t * 2.0) * 0.4;
    head.position.y = pinHeight + pinHeadR * 0.7 + bob;
    glow.position.y = head.position.y;
  })();

  /** Position + orient PIN_GROUP at lat/lng so it stands perpendicular to surface. */
  function placePinAt(lat, lng) {
    const radius = globe.getGlobeRadius();
    const coords = globe.getCoords(lat, lng, 0);
    const pos = new THREE.Vector3(coords.x, coords.y, coords.z);
    PIN_GROUP.position.copy(pos);

    const normal = pos.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);
    PIN_GROUP.setRotationFromQuaternion(quat);

    // Scale based on globe radius (so it looks right at any size)
    const s = radius / 110;
    PIN_GROUP.scale.setScalar(s);
    PIN_GROUP.visible = true;
  }

  function hidePin() { PIN_GROUP.visible = false; }

  // ---------- Data ----------
  async function loadPins() {
    try {
      const res = await fetch('/api/pins.php');
      if (!res.ok) throw new Error('pins http ' + res.status);
      state.pins = await res.json();
      globe.pointsData(state.pins);
    } catch (e) {
      console.warn('Could not load pins layer', e);
    }
  }

  async function loadCountries() {
    try {
      const res = await fetch(COUNTRIES);
      if (!res.ok) throw new Error('countries http ' + res.status);
      const geo = await res.json();

      // Polygons (country borders, very subtle fill + warm gold stroke).
      // globe.gl animates from prior altitude (0) when polygonsTransitionDuration is set.
      globe
        .polygonsTransitionDuration(1600)
        .polygonAltitude(0.006)
        .polygonCapColor(() => 'rgba(255, 255, 255, 0.018)')
        .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
        .polygonStrokeColor(() => 'rgba(244, 162, 97, 0.32)')
        .polygonsData(geo.features);

      // Labels for major countries only — animated in over 2.2s.
      globe
        .labelsTransitionDuration(2200)
        .labelLat((d) => d.lat)
        .labelLng((d) => d.lng)
        .labelText((d) => d.name)
        .labelSize(0.42)
        .labelDotRadius(0.15)
        .labelColor(() => 'rgba(255, 255, 255, 0.55)')
        .labelResolution(2)
        .labelAltitude(0.012)
        .labelsData(COUNTRY_LABELS);
    } catch (e) {
      console.warn('Could not load countries layer', e);
    }
  }

  async function fetchRandomDestination() {
    const res = await fetch('/api/random-destination.php');
    if (!res.ok) throw new Error('random http ' + res.status);
    return res.json();
  }

  async function fetchDestinationById(id) {
    const res = await fetch(`/api/destination.php?id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('byId http ' + res.status);
    return res.json();
  }

  // ---------- Spin flow ----------
  // Multi-rotation playful spin: ~3.5s of spinning around (2 extra full turns
  // around the chosen direction) easing to a stop on the target, then zoom in,
  // then ease back out so the user gets context.
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function shortestLngDelta(fromLng, toLng) {
    let d = toLng - fromLng;
    while (d > 180)  d -= 360;
    while (d < -180) d += 360;
    return d;
  }

  function spinTo(dest) {
    const SPIN_DURATION = 3400;
    const PIN_LAND_AT   = 2900;        // pin appears just before the globe settles
    const ZOOM_IN_ALT   = 0.5;
    const ZOOM_HOLD_MS  = 1200;
    const RETURN_ALT    = 1.3;
    const RETURN_MS     = 1000;
    const EXTRA_TURNS   = 2;            // extra full rotations during the spin

    controls.autoRotate = false;

    const startView = globe.pointOfView();
    const startLat  = startView.lat;
    const startLng  = startView.lng;
    const startAlt  = startView.altitude;

    const baseDelta = shortestLngDelta(startLng, dest.lng);
    // Direction of travel: same direction as the shortest path (or +1 if zero)
    const direction = baseDelta >= 0 ? 1 : -1;
    const lngDelta  = baseDelta + direction * 360 * EXTRA_TURNS;

    // Bow out slightly during the spin (camera pulls back a touch, then zooms in)
    const peakAlt = Math.max(startAlt, 2.2);

    const startedAt = performance.now();
    function tick(now) {
      const t = Math.min((now - startedAt) / SPIN_DURATION, 1);
      const e = easeInOutCubic(t);

      // Latitude eases linearly through ease-curve toward target
      const lat = startLat + (dest.lat - startLat) * e;
      const lng = startLng + lngDelta * e;

      // Altitude: ramp up to peakAlt mid-spin, then descend to ZOOM_IN_ALT
      // Triangle shape: 0 -> peak -> target
      let alt;
      if (e < 0.5) {
        const k = e / 0.5;
        alt = startAlt + (peakAlt - startAlt) * k;
      } else {
        const k = (e - 0.5) / 0.5;
        alt = peakAlt + (ZOOM_IN_ALT - peakAlt) * k;
      }

      globe.pointOfView({ lat, lng, altitude: alt }, 0);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    setTimeout(() => placePinAt(dest.lat, dest.lng), PIN_LAND_AT);

    setTimeout(() => {
      globe.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: RETURN_ALT }, RETURN_MS);
    }, SPIN_DURATION + ZOOM_HOLD_MS);

    setTimeout(() => {
      revealCard(dest);
      state.isSpinning = false;
      els.spinBtn.disabled = false;
      els.spinBtn.classList.remove('is-spinning');
    }, SPIN_DURATION + ZOOM_HOLD_MS + RETURN_MS - 150);
  }

  async function spin() {
    if (state.isSpinning) return;
    state.isSpinning = true;
    els.spinBtn.disabled = true;
    els.spinBtn.classList.add('is-spinning');
    hideCard();
    hidePin();

    try {
      const dest = await fetchRandomDestination();
      state.destination = dest;
      spinTo(dest);
    } catch (e) {
      console.error('spin failed', e);
      toast('Could not load a destination. Try again?');
      state.isSpinning = false;
      els.spinBtn.disabled = false;
      els.spinBtn.classList.remove('is-spinning');
    }
  }

  // ---------- Card ----------
  function bookingUrl(dest) {
    // Booking.com search URL. Add &aid=YOUR_AFFILIATE_ID when you have one.
    const q = encodeURIComponent(dest.booking_query || `${dest.name}, ${dest.country}`);
    return `https://www.booking.com/searchresults.html?ss=${q}`;
  }

  // Klook activities, tracked via Travelpayouts. The aff_pid + aff_adid + utm_*
  // combo is what attributes the click to Raz's TP account (extracted from his
  // short link: https://klook.tpx.li/3R0R0biM).
  function klookUrl(dest) {
    const q = encodeURIComponent(`${dest.name} ${dest.country}`);
    const params =
      'aff_pid=732374' +
      '&aff_adid=1284717' +
      '&utm_medium=affiliate-alwayson' +
      '&utm_source=network' +
      '&utm_campaign=13694';
    return `https://www.klook.com/en/search/result/?query=${q}&${params}`;
  }

  function mapEmbedUrl(dest) {
    // Google Maps embed without API key. Zoom 5 gives regional context.
    return `https://maps.google.com/maps?q=${dest.lat},${dest.lng}&z=5&output=embed`;
  }
  function mapOpenUrl(dest) {
    const q = encodeURIComponent(`${dest.name}, ${dest.country}`);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  function gptPrompt(dest) {
    const book = bookingUrl(dest);
    return [
      `Plan a 5-day trip to ${dest.name}, ${dest.country} for me.`,
      `Tagline of the place: "${dest.tagline}".`,
      `Best time to go: ${dest.best_time}.`,
      `Give me a realistic day-by-day itinerary with 1–2 unmissable activities per day, where to eat (with a budget option and a splurge), where to stay (neighborhood-level), an approximate total budget in USD for a mid-range traveler, and one off-the-beaten-path tip locals would mention. Keep it concrete.`,
      `When you recommend hotels or places to book, please include this comparison link in your reply so I can check rates: ${book}`,
    ].join(' ');
  }

  function shareUrl(dest) {
    return `${location.origin}/?dest=${dest.id}`;
  }

  function shareText(dest) {
    return `I'm thinking ${dest.name}, ${dest.country} — "${dest.tagline}". Spin the globe for yours:`;
  }

  async function shareDestination(dest) {
    const url  = shareUrl(dest);
    const text = shareText(dest);
    if (navigator.share) {
      try {
        await navigator.share({ title: `${dest.name} — Globe Vacations`, text, url });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // user dismissed
        // fall through to clipboard fallback
      }
    }
    const ok = await copyToClipboard(`${text}\n${url}`);
    toast(ok ? 'Link copied — paste it to your friend' : 'Could not copy link');
  }

  function revealCard(dest) {
    els.cardCountry.textContent  = dest.country;
    els.cardName.textContent     = dest.name;
    els.cardTagline.textContent  = dest.tagline;
    els.cardLong.textContent     = dest.long_description;
    els.cardBest.textContent     = dest.best_time || '—';
    els.cardCurrency.textContent = dest.currency || '—';
    els.cardBook.href            = bookingUrl(dest);
    els.cardTours.href           = klookUrl(dest);
    els.cardMap.src              = mapEmbedUrl(dest);
    els.cardMapLink.href         = mapOpenUrl(dest);
    els.card.hidden = false;
    els.card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    loadPhotos(dest);
  }

  function hideCard() {
    els.card.hidden = true;
    // Unload the iframe so it doesn't keep network connections open
    if (els.cardMap.src) els.cardMap.src = 'about:blank';
    els.cardPhotos.hidden = true;
  }

  // ---------- Pexels photos ----------
  function renderPhotoSkeleton() {
    els.cardPhotos.hidden = false;
    els.cardPhotosEmpty.hidden = true;
    els.cardPhotosTrack.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const sk = document.createElement('div');
      sk.className = 'card__photo card__photo--skeleton';
      els.cardPhotosTrack.appendChild(sk);
    }
  }

  function renderPhotos(photos, dest) {
    els.cardPhotosTrack.innerHTML = '';
    if (!photos.length) {
      els.cardPhotosEmpty.hidden = false;
      return;
    }
    for (const p of photos) {
      const link = document.createElement('a');
      link.className = 'card__photo';
      link.href      = p.page || p.photographer_url || p.url;
      link.target    = '_blank';
      link.rel       = 'noopener';
      link.title     = p.photographer ? `Photo by ${p.photographer} on Pexels` : 'Photo on Pexels';

      const img = document.createElement('img');
      img.src     = p.url || p.thumb;
      img.alt     = p.alt || `${dest.name}, ${dest.country}`;
      img.loading = 'lazy';

      link.appendChild(img);
      els.cardPhotosTrack.appendChild(link);
    }
  }

  async function loadPhotos(dest) {
    renderPhotoSkeleton();
    const q = dest.image_keywords || `${dest.name} ${dest.country}`;
    try {
      const res  = await fetch(`/api/photos.php?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!data.configured) {
        // No API key configured yet — hide the section silently.
        els.cardPhotos.hidden = true;
        return;
      }
      renderPhotos(data.photos || [], dest);
    } catch (e) {
      console.warn('photos fetch failed', e);
      els.cardPhotos.hidden = true;
    }
  }

  // ---------- Misc UI ----------
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('is-visible'));
    setTimeout(() => t.classList.remove('is-visible'), 2400);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity  = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    }
  }

  // ---------- Event wiring ----------
  els.spinBtn.addEventListener('click', spin);

  els.cardClose.addEventListener('click', hideCard);
  els.cardRespin.addEventListener('click', spin);
  els.cardGpt.addEventListener('click', async () => {
    if (!state.destination) return;
    const prompt = gptPrompt(state.destination);
    const ok = await copyToClipboard(prompt);
    toast(ok ? 'Prompt copied. Opening ChatGPT…' : 'Opening ChatGPT…');
    window.open('https://chat.openai.com/', '_blank', 'noopener');
  });
  els.cardShare.addEventListener('click', () => {
    if (!state.destination) return;
    shareDestination(state.destination);
  });

  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-scroll');
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ---------- Deep link (?dest=ID) ----------
  async function maybeHandleDeepLink() {
    const params = new URLSearchParams(location.search);
    const idStr  = params.get('dest');
    if (!idStr) return false;
    const id = parseInt(idStr, 10);
    if (!Number.isFinite(id)) return false;
    try {
      const dest = await fetchDestinationById(id);
      state.destination = dest;
      // Wait a beat for textures + countries layer to settle, then spin.
      setTimeout(() => {
        state.isSpinning = true;
        els.spinBtn.disabled = true;
        els.spinBtn.classList.add('is-spinning');
        spinTo(dest);
      }, 1700);
      return true;
    } catch (e) {
      console.warn('Deep link failed', e);
      return false;
    }
  }

  // ---------- Boot ----------
  loadPins();
  loadCountries();

  maybeHandleDeepLink().then((didDeepLink) => {
    setTimeout(() => {
      els.hint.textContent = didDeepLink
        ? 'A friend picked this one for you'
        : 'Click "Spin the globe" to begin';
      els.hint.classList.add('is-visible');
    }, 1200);
  });

})();
