/* ==========================================================================
   Globe Vacations — frontend app (Bureau of Wanderings edition)
   ========================================================================== */
(() => {
  'use strict';

  const TEXTURE_BASE = 'https://unpkg.com/three-globe@2.32.0/example/img';
  const EARTH_DAY    = `${TEXTURE_BASE}/earth-day.jpg`;
  const EARTH_BUMP   = `${TEXTURE_BASE}/earth-topology.png`;
  const COUNTRIES    = '/assets/data/countries.geojson';

  const COUNTRY_LABELS = [
    { name: 'USA',         lat: 38.9,   lng: -77.04 },
    { name: 'Canada',      lat: 45.42,  lng: -75.69 },
    { name: 'Mexico',      lat: 19.43,  lng: -99.13 },
    { name: 'Brazil',      lat: -15.78, lng: -47.93 },
    { name: 'Argentina',   lat: -34.6,  lng: -58.38 },
    { name: 'Peru',        lat: -12.05, lng: -77.04 },
    { name: 'Colombia',    lat: 4.71,   lng: -74.07 },
    { name: 'UK',          lat: 51.51,  lng: -0.13 },
    { name: 'France',      lat: 48.85,  lng: 2.35 },
    { name: 'Spain',       lat: 40.42,  lng: -3.7 },
    { name: 'Portugal',    lat: 38.72,  lng: -9.14 },
    { name: 'Germany',     lat: 52.52,  lng: 13.4 },
    { name: 'Italy',       lat: 41.9,   lng: 12.5 },
    { name: 'Greece',      lat: 37.98,  lng: 23.73 },
    { name: 'Turkey',      lat: 41.01,  lng: 28.98 },
    { name: 'Egypt',       lat: 30.04,  lng: 31.24 },
    { name: 'Morocco',     lat: 33.97,  lng: -6.85 },
    { name: 'Kenya',       lat: -1.29,  lng: 36.82 },
    { name: 'S. Africa',   lat: -25.75, lng: 28.19 },
    { name: 'Russia',      lat: 55.75,  lng: 37.62 },
    { name: 'China',       lat: 39.9,   lng: 116.4 },
    { name: 'Japan',       lat: 35.68,  lng: 139.69 },
    { name: 'S. Korea',    lat: 37.57,  lng: 126.98 },
    { name: 'India',       lat: 28.61,  lng: 77.21 },
    { name: 'Thailand',    lat: 13.76,  lng: 100.5 },
    { name: 'Vietnam',     lat: 21.03,  lng: 105.85 },
    { name: 'Indonesia',   lat: -6.21,  lng: 106.85 },
    { name: 'Australia',   lat: -35.28, lng: 149.13 },
    { name: 'New Zealand', lat: -41.29, lng: 174.78 },
    { name: 'Saudi Arabia', lat: 24.71, lng: 46.68 },
    { name: 'Iran',        lat: 35.69,  lng: 51.39 },
    { name: 'Israel',      lat: 31.78,  lng: 35.22 },
    { name: 'Norway',      lat: 59.91,  lng: 10.75 },
    { name: 'Sweden',      lat: 59.33,  lng: 18.07 },
    { name: 'Iceland',     lat: 64.13,  lng: -21.94 },
    { name: 'Chile',       lat: -33.45, lng: -70.67 },
  ];

  const CURRENCY_SYMBOLS = {
    JPY: '¥', EUR: '€', USD: '$', GBP: '£', CHF: 'CHF', CNY: '¥', KRW: '₩',
    INR: '₹', THB: '฿', VND: '₫', IDR: 'Rp', SGD: 'S$', NZD: 'NZ$', AUD: 'A$',
    CAD: 'C$', ZAR: 'R', PEN: 'S/', ARS: '$', BRL: 'R$', MXN: '$', COP: '$',
    GTQ: 'Q', TZS: 'TSh', ISK: 'kr', MAD: 'DH', TRY: '₺', JOD: 'JD',
    NPR: '₨', EGP: 'E£', LAK: '₭', SEK: 'kr', NOK: 'kr', GEL: '₾',
  };

  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const $ = (sel) => document.querySelector(sel);

  // ---------- State ----------
  const state = {
    destination: null,
    isSpinning: false,
    pins: [],
    issueNum: parseInt(localStorage.getItem('gv_issue') || '0', 10),
  };

  const els = {
    globe:            $('#globe'),
    scene:            document.querySelector('.scene'),
    spinBtn:          $('#spin-btn'),
    spinCaption:      $('#spin-caption'),
    issueNum:         $('#issue-num'),
    coordLat:         $('#coord-lat'),
    coordLng:         $('#coord-lng'),
    postcard:         $('#postcard'),
    postcardClose:    $('#card-close'),
    cardPhoto:        $('#card-photo'),
    cardPhotoSkel:    $('#card-photo-skeleton'),
    cardPhotoLabel:   $('#card-photo-label'),
    cardPhotoCoords:  $('#card-photo-coords'),
    cardPhotoCredit:  $('#card-photo-credit'),
    cardStampCur:     $('#card-stamp-cur'),
    cardStampBot:     $('#card-stamp-bot'),
    cardCountry:      $('#card-country'),
    cardName:         $('#card-name'),
    cardTagline:      $('#card-tagline'),
    cardDesc:         $('#card-desc'),
    cardBest:         $('#card-best'),
    cardCur:          $('#card-cur'),
    cardMapLink:      $('#card-map-link'),
    cardBook:         $('#card-book'),
    cardTours:        $('#card-tours'),
    cardGpt:          $('#card-gpt'),
    cardShare:        $('#card-share'),
    cardRespin:       $('#card-respin'),
    postmark:         $('#postmark'),
    postmarkDate:     $('#postmark-date'),
  };

  // ---------- Globe setup ----------
  const globe = Globe()
    .globeImageUrl(EARTH_DAY)
    .bumpImageUrl(EARTH_BUMP)
    .backgroundColor('rgba(0,0,0,0)')
    .showAtmosphere(true)
    .atmosphereColor('#d4a574')
    .atmosphereAltitude(0.20)
    .pointsData([])
    .pointAltitude(0.012)
    .pointRadius(0.16)
    .pointColor(() => 'rgba(142, 47, 39, 0.78)')
    .pointsMerge(true)
    (els.globe);

  const fit = () => {
    const r = els.scene.getBoundingClientRect();
    globe.width(r.width).height(r.height);
  };
  fit();
  window.addEventListener('resize', fit);

  const renderer = globe.renderer();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  globe.pointOfView({ lat: 25, lng: 10, altitude: 2.6 }, 0);

  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;
  controls.enableZoom = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 180;
  controls.maxDistance = 600;

  // Warm vintage lighting
  const scene = globe.scene();
  const sun = new THREE.DirectionalLight(0xffe7c4, 0.85);
  sun.position.set(-1, 0.6, 1).multiplyScalar(400);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xb8862a, 0.45));

  // ---------- 3D pin (wax-seal style) ----------
  const PIN_GROUP = new THREE.Group();
  PIN_GROUP.visible = false;
  scene.add(PIN_GROUP);

  const pinHeight = 12;
  const pinHeadR  = 4.0;

  const stemGeo = new THREE.CylinderGeometry(0.5, 0.5, pinHeight, 12);
  stemGeo.translate(0, pinHeight / 2, 0);
  const stem = new THREE.Mesh(stemGeo, new THREE.MeshStandardMaterial({
    color: 0xecddbc, emissive: 0xecddbc, emissiveIntensity: 0.2,
    metalness: 0.2, roughness: 0.4,
  }));
  PIN_GROUP.add(stem);

  const headGeo = new THREE.SphereGeometry(pinHeadR, 28, 28);
  const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({
    color: 0xb8443a, emissive: 0x8e2f27, emissiveIntensity: 0.7,
    roughness: 0.4, metalness: 0.1,
  }));
  head.position.y = pinHeight + pinHeadR * 0.7;
  PIN_GROUP.add(head);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(pinHeadR * 1.9, 28, 28),
    new THREE.MeshBasicMaterial({ color: 0xb8443a, transparent: true, opacity: 0.16, depthWrite: false })
  );
  glow.position.copy(head.position);
  PIN_GROUP.add(glow);

  const pulseRings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.5, 2.1, 48),
      new THREE.MeshBasicMaterial({
        color: 0xb8443a, side: THREE.DoubleSide, transparent: true,
        opacity: 0.65, depthWrite: false,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.userData.phase = i / 3;
    PIN_GROUP.add(ring);
    pulseRings.push(ring);
  }

  const clock = new THREE.Clock();
  (function animatePulses() {
    requestAnimationFrame(animatePulses);
    if (!PIN_GROUP.visible) return;
    const t = clock.getElapsedTime();
    pulseRings.forEach((ring) => {
      const local = (t + ring.userData.phase * 2.0) % 2.0;
      const k = local / 2.0;
      ring.scale.setScalar(1 + k * 7);
      ring.material.opacity = Math.max(0, 0.55 * (1 - k));
    });
    const bob = Math.sin(t * 2.0) * 0.4;
    head.position.y = pinHeight + pinHeadR * 0.7 + bob;
    glow.position.y = head.position.y;
  })();

  function placePinAt(lat, lng) {
    const radius = globe.getGlobeRadius();
    const coords = globe.getCoords(lat, lng, 0);
    const pos = new THREE.Vector3(coords.x, coords.y, coords.z);
    PIN_GROUP.position.copy(pos);
    const normal = pos.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);
    PIN_GROUP.setRotationFromQuaternion(quat);
    PIN_GROUP.scale.setScalar(radius / 110);
    PIN_GROUP.visible = true;
  }

  function hidePin() { PIN_GROUP.visible = false; }

  // ---------- Data layers ----------
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
      globe
        .polygonsTransitionDuration(1600)
        .polygonAltitude(0.006)
        .polygonCapColor(() => 'rgba(29, 36, 64, 0.04)')
        .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
        .polygonStrokeColor(() => 'rgba(142, 47, 39, 0.45)')
        .polygonsData(geo.features);
      globe
        .labelsTransitionDuration(2200)
        .labelLat((d) => d.lat)
        .labelLng((d) => d.lng)
        .labelText((d) => d.name)
        .labelSize(0.42)
        .labelDotRadius(0.12)
        .labelColor(() => 'rgba(29, 36, 64, 0.6)')
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

  // ---------- Spin animation ----------
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
    const PIN_LAND_AT   = 2900;
    const ZOOM_IN_ALT   = 0.5;
    const ZOOM_HOLD_MS  = 1100;
    const RETURN_ALT    = 1.35;
    const RETURN_MS     = 1000;
    const EXTRA_TURNS   = 2;

    controls.autoRotate = false;
    const startView = globe.pointOfView();
    const startLat  = startView.lat;
    const startLng  = startView.lng;
    const startAlt  = startView.altitude;

    const baseDelta = shortestLngDelta(startLng, dest.lng);
    const direction = baseDelta >= 0 ? 1 : -1;
    const lngDelta  = baseDelta + direction * 360 * EXTRA_TURNS;
    const peakAlt   = Math.max(startAlt, 2.2);

    // Live-update coords readout during spin
    const startedAt = performance.now();
    function tick(now) {
      const t = Math.min((now - startedAt) / SPIN_DURATION, 1);
      const e = easeInOutCubic(t);
      const lat = startLat + (dest.lat - startLat) * e;
      const lng = startLng + lngDelta * e;
      let alt;
      if (e < 0.5) {
        alt = startAlt + (peakAlt - startAlt) * (e / 0.5);
      } else {
        alt = peakAlt + (ZOOM_IN_ALT - peakAlt) * ((e - 0.5) / 0.5);
      }
      globe.pointOfView({ lat, lng, altitude: alt }, 0);
      updateCoordsReadout(lat, lng);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    setTimeout(() => placePinAt(dest.lat, dest.lng), PIN_LAND_AT);

    setTimeout(() => {
      globe.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: RETURN_ALT }, RETURN_MS);
    }, SPIN_DURATION + ZOOM_HOLD_MS);

    setTimeout(() => {
      showDispatchedStamp();
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
      toast('Telegram failed — try again');
      state.isSpinning = false;
      els.spinBtn.disabled = false;
      els.spinBtn.classList.remove('is-spinning');
    }
  }

  // ---------- Coord & issue helpers ----------
  function formatCoord(value, posChar, negChar) {
    const abs = Math.abs(value).toFixed(2);
    return `${abs}°${value >= 0 ? posChar : negChar}`;
  }
  function updateCoordsReadout(lat, lng) {
    els.coordLat.textContent = formatCoord(lat, 'N', 'S');
    els.coordLng.textContent = formatCoord(lng, 'E', 'W');
  }
  function bumpIssue() {
    state.issueNum += 1;
    localStorage.setItem('gv_issue', String(state.issueNum));
    return String(state.issueNum).padStart(3, '0');
  }
  function currentIssueLabel() {
    return String(state.issueNum).padStart(3, '0');
  }
  function todayStamp() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  // ---------- Affiliate URLs ----------
  function bookingUrl(dest) {
    const q = encodeURIComponent(dest.booking_query || `${dest.name}, ${dest.country}`);
    return `https://www.booking.com/searchresults.html?ss=${q}`;
  }
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

  // ---------- Share ----------
  function shareUrl(dest)  { return `${location.origin}/?dest=${dest.id}`; }
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
        if (err.name === 'AbortError') return;
      }
    }
    const ok = await copyToClipboard(`${text}\n${url}`);
    toast(ok ? 'Link copied' : 'Could not copy');
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
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

  // ---------- Postcard reveal ----------
  function showDispatchedStamp() {
    els.postmarkDate.textContent = `№${currentIssueLabel()} · ${todayStamp()}`;
    els.postmark.classList.remove('is-stamped');
    void els.postmark.offsetWidth; // force reflow to restart animation
    els.postmark.classList.add('is-stamped');
  }

  function revealCard(dest) {
    const issueLabel = bumpIssue();
    els.issueNum.textContent = issueLabel;

    els.cardCountry.textContent = `${(dest.country || '').toUpperCase()} · DISPATCH`;
    els.cardName.textContent    = dest.name || '';
    els.cardTagline.textContent = dest.tagline || '';
    els.cardDesc.textContent    = dest.long_description || dest.short_description || '';
    els.cardBest.textContent    = dest.best_time || '—';
    els.cardCur.textContent     = dest.currency || '—';

    // Stamp on postcard
    const cur = (dest.currency || '').toUpperCase();
    els.cardStampCur.textContent = CURRENCY_SYMBOLS[cur] || cur || '★';
    els.cardStampBot.textContent = (dest.country || '').toUpperCase().slice(0, 10);

    // Photo label
    els.cardPhotoLabel.textContent  = `DISPATCH №${issueLabel}`;
    els.cardPhotoCoords.textContent = `${formatCoord(dest.lat, 'N', 'S')} · ${formatCoord(dest.lng, 'E', 'W')}`;

    // Action URLs
    els.cardBook.href     = bookingUrl(dest);
    els.cardTours.href    = klookUrl(dest);
    els.cardMapLink.href  = mapOpenUrl(dest);

    // Photo (Pexels)
    loadHeroPhoto(dest);

    els.postcard.hidden = false;
    requestAnimationFrame(() => els.postcard.classList.add('is-open'));
  }

  function hideCard() {
    els.postcard.classList.remove('is-open');
    setTimeout(() => { els.postcard.hidden = true; }, 400);
  }

  async function loadHeroPhoto(dest) {
    els.cardPhoto.classList.remove('is-loaded');
    els.cardPhoto.removeAttribute('src');
    els.cardPhotoSkel.classList.remove('is-hidden');

    const q = dest.image_keywords || `${dest.name} ${dest.country}`;
    try {
      const res  = await fetch(`/api/photos.php?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!data.configured || !data.photos || !data.photos.length) {
        // Hide skeleton, leave background — photo just won't show.
        els.cardPhotoSkel.classList.add('is-hidden');
        return;
      }
      const p = data.photos[0];
      els.cardPhoto.alt = p.alt || `${dest.name}, ${dest.country}`;
      els.cardPhoto.onload = () => {
        els.cardPhotoSkel.classList.add('is-hidden');
        els.cardPhoto.classList.add('is-loaded');
      };
      els.cardPhoto.src = p.url || p.thumb;
      if (p.page) els.cardPhotoCredit.href = p.page;
      els.cardPhotoCredit.textContent = p.photographer ? `Photo · ${p.photographer} / Pexels` : 'Photo · Pexels';
    } catch (e) {
      console.warn('photos fetch failed', e);
      els.cardPhotoSkel.classList.add('is-hidden');
    }
  }

  // ---------- Toast ----------
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

  // ---------- Deep link ----------
  async function maybeHandleDeepLink() {
    const params = new URLSearchParams(location.search);
    const idStr  = params.get('dest');
    if (!idStr) return false;
    const id = parseInt(idStr, 10);
    if (!Number.isFinite(id)) return false;
    try {
      const dest = await fetchDestinationById(id);
      state.destination = dest;
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

  // ---------- Wire up events ----------
  els.spinBtn.addEventListener('click', spin);
  els.postcardClose.addEventListener('click', hideCard);
  els.cardRespin.addEventListener('click', () => { hideCard(); setTimeout(spin, 250); });
  els.cardGpt.addEventListener('click', async () => {
    if (!state.destination) return;
    const ok = await copyToClipboard(gptPrompt(state.destination));
    toast(ok ? 'Prompt copied — opening ChatGPT' : 'Opening ChatGPT');
    window.open('https://chat.openai.com/', '_blank', 'noopener');
  });
  els.cardShare.addEventListener('click', () => {
    if (state.destination) shareDestination(state.destination);
  });

  // Initial issue display
  els.issueNum.textContent = currentIssueLabel() === '000' ? '001' : currentIssueLabel();

  // ---------- Boot ----------
  loadPins();
  loadCountries();
  maybeHandleDeepLink().then((didDeepLink) => {
    if (didDeepLink) {
      els.spinCaption.textContent = 'A friend picked this one for you';
    }
  });

})();
