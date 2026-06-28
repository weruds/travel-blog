(function() {
  'use strict';

  /* ── 1. BLOCK RIGHT-CLICK everywhere ──────────────────────────────── */
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault(); e.stopPropagation(); return false;
  }, true);

  /* ── 2. BLOCK drag-start on images / SVGs ─────────────────────────── */
  document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'SVG' ||
        e.target.closest('.blog-card-img') || e.target.closest('.masonry-item')) {
      e.preventDefault();
    }
  }, true);

  /* ── 3. BLOCK keyboard shortcuts ─────────────────────────────────── */
  document.addEventListener('keydown', function(e) {
    var k = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey, shift = e.shiftKey;
    // Ctrl+S / Ctrl+U / Ctrl+P — save, view-source, print
    if (ctrl && !shift && (k === 's' || k === 'u' || k === 'p')) { e.preventDefault(); e.stopPropagation(); return false; }
    // F12 — DevTools
    if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); showWarning('Unauthorized Access Detected', 'Developer tools are not permitted on this page.'); return false; }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C — DevTools panels
    if (ctrl && shift && (k === 'i' || k === 'j' || k === 'c')) { e.preventDefault(); e.stopPropagation(); showWarning('Unauthorized Access Detected', 'Developer tools are not permitted on this page.'); return false; }
    // PrintScreen
    if (k === 'printscreen' || k === 'print screen') { e.preventDefault(); showWarning('Screenshot Blocked', 'Screenshots are not permitted on this page.'); flashOverlay(); }
  }, true);

  /* ── 4. DEVTOOLS SIZE DETECTION — disabled (false positives on mobile) ── */
  /* outerWidth/outerHeight gap on mobile browsers triggers this incorrectly */

  /* ── 5b. FOCUS / VISIBILITY / SNIP TOOL PROTECTION ─────────────────
     Blurs the page the instant the window loses focus (window.blur,
     visibilitychange, mouseleave on <html>) so any OS-level screenshot
     tool, Snip & Sketch, or screen recorder captures only a blurred frame.
  ─────────────────────────────────────────────────────────────────── */
  (function() {
    var wrap = null;
    var BLUR  = 'blur(20px)';
    var CLEAR = '';

    function getWrap() { return wrap || (wrap = document.getElementById('pageWrap')); }

    function obscure() {
      var w = getWrap(); if (w) w.style.filter = BLUR;
    }
    function reveal() {
      /* Delay unblur so a snip tool can't grab the clear frame on return */
      setTimeout(function() { var w = getWrap(); if (w) w.style.filter = CLEAR; }, 600);
    }

    /* Tab hidden / minimised */
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) obscure(); else reveal();
    });

    /* Window loses focus (user clicks elsewhere, opens Snip tool, etc.) */
    window.addEventListener('blur', obscure);
    window.addEventListener('focus', reveal);

    /* Mouse leaves the browser viewport */
    document.documentElement.addEventListener('mouseleave', obscure);
    document.documentElement.addEventListener('mouseenter', reveal);

    /* Touch: finger lifts and app loses focus */
    window.addEventListener('pagehide', obscure);
    window.addEventListener('pageshow', reveal);
  })();

  /* ── 6. BLOCK touch-hold ─────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.blog-card-img, .masonry-item, svg, img').forEach(function(el) {
      el.addEventListener('touchstart', function(e) { e.preventDefault(); }, { passive: false });
    });
  });

  /* ── 7. INTERCEPT download links ─────────────────────────────────── */
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (a && (a.hasAttribute('download') || (a.href && a.href.startsWith('blob:')))) {
      e.preventDefault();
      showWarning('Download Blocked', 'Downloading content from this page is not permitted.');
    }
  }, true);

  /* ── 8. FLASH OVERLAY ────────────────────────────────────────────── */
  function flashOverlay() {
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:999999;pointer-events:none;opacity:1;transition:opacity 0.15s';
    document.body.appendChild(div);
    requestAnimationFrame(function() {
      setTimeout(function() { div.style.opacity = '0'; setTimeout(function() { div.remove(); }, 200); }, 50);
    });
  }

  /* ── 9. SHOW WARNING ─────────────────────────────────────────────── */
  function showWarning(title, msg) {
    var w = document.getElementById('sec-warning');
    w.querySelector('h2').textContent = title;
    w.querySelector('p').textContent  = msg;
    w.classList.add('show');
    document.getElementById('pageWrap').style.filter = 'blur(8px)';
    setTimeout(function() { w.classList.remove('show'); document.getElementById('pageWrap').style.filter = ''; }, 3500);
  }

  /* ── 10. DISABLE selection ───────────────────────────────────────── */
  document.addEventListener('selectstart', function(e) {
    if (!e.target.closest('input, textarea')) e.preventDefault();
  });

  /* ── 11. BLOCK copy / cut ────────────────────────────────────────── */
  document.addEventListener('copy', function(e) { e.preventDefault(); });
  document.addEventListener('cut',  function(e) { e.preventDefault(); });

  /* ── 12a. HERO SCENE ─────────────────────────────────────────────── */
  (function() {
    var scene = document.getElementById('heroScene');
    if (!scene) return;
    var sun = document.createElement('div'); sun.className = 'sun-glow'; scene.appendChild(sun);
    ['mountain m1','mountain m2','mountain m3','mountain m4'].forEach(function(cls) {
      var el = document.createElement('div'); el.className = cls; scene.appendChild(el);
    });
    var hor = document.createElement('div'); hor.className = 'horizon'; scene.appendChild(hor);
    for (var i = 0; i < 60; i++) {
      var s = document.createElement('div'); s.className = 'star';
      var sz = Math.random() * 2.5 + 0.8, isE = Math.random() > 0.55;
      s.style.cssText = 'width:'+sz+'px;height:'+sz+'px;left:'+(Math.random()*100)+'%;top:'+(Math.random()*65)+'%;animation-delay:'+(Math.random()*4)+'s;animation-duration:'+(2+Math.random()*3)+'s;'+(isE?'background:rgba(245,158,11,'+(0.5+Math.random()*0.5)+')':'background:rgba(255,255,255,'+(0.4+Math.random()*0.6)+')');
      scene.appendChild(s);
    }
    for (var j = 0; j < 18; j++) {
      var em = document.createElement('div');
      em.style.cssText = 'position:absolute;width:'+(1+Math.random()*2)+'px;height:'+(1+Math.random()*2)+'px;border-radius:50%;background:rgba(251,191,36,'+(0.3+Math.random()*0.7)+');left:'+(Math.random()*100)+'%;bottom:'+(Math.random()*40)+'%;animation:emberFloat '+(4+Math.random()*6)+'s '+(Math.random()*4)+'s ease-in-out infinite';
      scene.appendChild(em);
    }
    if (!document.getElementById('emberFloatStyle')) {
      var st = document.createElement('style'); st.id = 'emberFloatStyle';
      st.textContent = '@keyframes emberFloat{0%{transform:translateY(0) scale(1);opacity:0.7}50%{transform:translateY(-40px) scale(1.3);opacity:1}100%{transform:translateY(-80px) scale(0.6);opacity:0}}';
      document.head.appendChild(st);
    }
  })();

  /* ── 12b. SECTION HEADING UNDERLINE ─────────────────────────────── */
  (function() {
    if (!window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(en) { if (en.isIntersecting) { en.target.querySelector('h2') && en.target.querySelector('h2').classList.add('in-view'); } });
    }, { threshold: 0.3 });
    document.querySelectorAll('.section-header').forEach(function(el) { obs.observe(el); });
  })();

  /* ── SHARED: carousel initialiser ───────────────────────────────── */
  function initCarouselOn(container) {
    var track = container.querySelector('.sv-carousel-track');
    var dotsEl = container.querySelector('.sv-carousel-dots');
    var prevBtn = container.querySelector('.sv-carousel-btn.prev');
    var nextBtn = container.querySelector('.sv-carousel-btn.next');
    if (!track) return;
    var imgs = track.querySelectorAll('img'), n = imgs.length, cur = 0, timer;
    if (dotsEl) {
      dotsEl.innerHTML = '';
      Array.prototype.forEach.call(imgs, function(_, i) {
        var d = document.createElement('button');
        d.className = 'sv-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Photo ' + (i + 1));
        d.addEventListener('click', function(e) { e.stopPropagation(); stopAuto(); goTo(i); startAuto(); });
        dotsEl.appendChild(d);
      });
    }
    function goTo(idx) {
      cur = (idx + n) % n;
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
      if (dotsEl) Array.prototype.forEach.call(dotsEl.querySelectorAll('.sv-dot'), function(d, i) { d.classList.toggle('active', i === cur); });
    }
    function startAuto() { timer = setInterval(function() { goTo(cur + 1); }, 3200); }
    function stopAuto()  { clearInterval(timer); }
    if (prevBtn) prevBtn.addEventListener('click', function(e) { e.stopPropagation(); stopAuto(); goTo(cur - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function(e) { e.stopPropagation(); stopAuto(); goTo(cur + 1); startAuto(); });
    container.addEventListener('mouseenter', stopAuto);
    container.addEventListener('mouseleave', startAuto);
    startAuto();
  }

  /* ── SVG placeholders for destinations without photos yet ───────── */
  var DEST_SVG = {
    'ha long bay': '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#04101e"/><rect x="0" y="115" width="320" height="85" fill="#041520"/><polygon points="0,115 30,55 60,115" fill="#071a2a"/><polygon points="40,115 85,30 130,115" fill="#051422"/><polygon points="100,115 140,48 180,115" fill="#071a2a"/><polygon points="160,115 200,38 240,115" fill="#051422"/><polygon points="230,115 268,60 306,115" fill="#071a2a"/><rect x="0" y="95" width="320" height="25" fill="rgba(100,160,200,0.08)"/><circle cx="160" cy="42" r="30" fill="rgba(30,111,219,0.18)"/><circle cx="160" cy="42" r="14" fill="rgba(74,158,255,0.36)"/><circle cx="35" cy="18" r="1.2" fill="white" opacity=".7"/><circle cx="260" cy="22" r="1" fill="white" opacity=".6"/><circle cx="200" cy="12" r="1.4" fill="white" opacity=".8"/></svg>',
    'hanoi': '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#080c18"/><rect x="20" y="100" width="18" height="100" fill="#0d1528"/><rect x="50" y="80" width="28" height="120" fill="#0a1220"/><rect x="90" y="90" width="22" height="110" fill="#0d1528"/><rect x="124" y="70" width="32" height="130" fill="#0a1220"/><rect x="168" y="85" width="20" height="115" fill="#0d1528"/><rect x="200" y="75" width="30" height="125" fill="#0a1220"/><rect x="242" y="95" width="18" height="105" fill="#0d1528"/><rect x="272" y="82" width="26" height="118" fill="#0a1220"/><rect x="56" y="88" width="4" height="3" fill="rgba(74,158,255,0.5)"/><rect x="64" y="95" width="4" height="3" fill="rgba(74,158,255,0.4)"/><rect x="130" y="78" width="4" height="3" fill="rgba(74,158,255,0.55)"/><circle cx="260" cy="30" r="20" fill="rgba(30,111,219,0.15)"/><circle cx="260" cy="30" r="10" fill="rgba(74,158,255,0.3)"/><circle cx="40" cy="20" r="1" fill="white" opacity=".6"/><circle cx="100" cy="14" r="1.2" fill="white" opacity=".7"/></svg>',
    'ninh binh': '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#051208"/><rect x="0" y="130" width="320" height="70" fill="#071a0a"/><polygon points="0,130 50,55 100,130" fill="#0a1f0c"/><polygon points="60,130 130,35 200,130" fill="#081808"/><polygon points="170,130 230,52 290,130" fill="#0a1f0c"/><polygon points="260,130 295,72 330,130" fill="#081808"/><rect x="60" y="128" width="200" height="6" fill="rgba(74,180,100,0.12)"/><circle cx="160" cy="45" r="26" fill="rgba(30,150,80,0.15)"/><circle cx="160" cy="45" r="12" fill="rgba(74,200,120,0.28)"/><circle cx="30" cy="18" r="1.2" fill="white" opacity=".65"/><circle cx="285" cy="24" r="1.3" fill="white" opacity=".75"/></svg>',
    'sapa': '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#060a10"/><polygon points="0,200 0,80 80,50 160,70 240,40 320,60 320,200" fill="#0c1a10"/><polygon points="0,200 0,110 80,85 160,100 240,75 320,90 320,200" fill="#0f2214"/><polygon points="0,200 0,140 80,120 160,135 240,110 320,125 320,200" fill="#122a18"/><polygon points="0,200 0,165 80,148 160,160 240,140 320,155 320,200" fill="#163015"/><polygon points="160,0 240,40 80,40" fill="#080e14"/><rect x="0" y="62" width="320" height="18" fill="rgba(180,200,220,0.07)"/><circle cx="50" cy="28" r="14" fill="rgba(200,210,230,0.14)"/><circle cx="50" cy="28" r="7" fill="rgba(220,230,255,0.25)"/><circle cx="200" cy="16" r="1.2" fill="white" opacity=".7"/></svg>'
  };

  /* ── 12c. BLOG MAP BACKGROUND — world map + animated flight paths ── */
  (function () {
    var canvas = document.getElementById('blogMapBg');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    /* ── Geo → canvas coordinate (equirectangular) ──
       Single Asia-Pacific window for all sizes — Philippines and its
       destinations are centred and fill the panel properly.
       Covers India → Pacific, Antarctica crop → north of Japan.          */
    var VIEW = { lonMin: 50, lonMax: 180, latMin: -25, latMax: 55 };

    function getWindow() { return VIEW; }

    function project(lon, lat, W, H) {
      var win = getWindow();
      var normLon = lon;
      /* wrap longitude into window */
      if (normLon < win.lonMin) normLon += 360;
      if (normLon > win.lonMax) normLon -= 360;
      var x = (normLon  - win.lonMin) / (win.lonMax - win.lonMin) * W;
      var y = (1 - (lat - win.latMin) / (win.latMax - win.latMin)) * H;
      return { x: x, y: y };
    }

    /* ── Known destination coordinates (lon, lat) ──
       Philippines is the fixed origin.
       ADD A NEW COUNTRY: just add one line here matching the countryId used
       in __STORIES_DATA__. The plane will appear automatically.             */
    var ORIGIN = { id: 'philippines', lon: 121, lat: 14.6 };
    var DEST_COORDS = {
      'vietnam':     { lon: 106, lat: 16 },
      'japan':       { lon: 138, lat: 36 },
      'thailand':    { lon: 101, lat: 15 },
      'indonesia':   { lon: 118, lat: -5 },
      'singapore':   { lon: 104, lat:  1 },
      'malaysia':    { lon: 110, lat:  4 },
      'southkorea':  { lon: 128, lat: 37 },
      'taiwan':      { lon: 121, lat: 24 },
      'china':       { lon: 104, lat: 35 },
      'india':       { lon:  79, lat: 21 },
      'australia':   { lon: 134, lat:-25 },
      'usa':         { lon:-100, lat: 38 },
      'uae':         { lon:  54, lat: 24 },
    };

    /* ── World land polygons — loaded from lands.js to keep this file smaller ── */
    var LANDS = window.__LANDS__ || [];


    /* ── Great-circle interpolation ──
       Returns a point fraction t (0→1) along the geodesic from (lon1,lat1) to (lon2,lat2). */
    function toRad(d) { return d * Math.PI / 180; }
    function toDeg(r) { return r * 180 / Math.PI; }

    function greatCirclePoint(lon1, lat1, lon2, lat2, t) {
      var φ1 = toRad(lat1), λ1 = toRad(lon1);
      var φ2 = toRad(lat2), λ2 = toRad(lon2);
      var dφ = φ2 - φ1, dλ = λ2 - λ1;
      var a = Math.sin(dφ/2)*Math.sin(dφ/2) + Math.cos(φ1)*Math.cos(φ2)*Math.sin(dλ/2)*Math.sin(dλ/2);
      var d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      if (d < 0.0001) return { lon: lon1, lat: lat1 };
      var A = Math.sin((1-t)*d) / Math.sin(d);
      var B = Math.sin(t*d)     / Math.sin(d);
      var x = A*Math.cos(φ1)*Math.cos(λ1) + B*Math.cos(φ2)*Math.cos(λ2);
      var y = A*Math.cos(φ1)*Math.sin(λ1) + B*Math.cos(φ2)*Math.sin(λ2);
      var z = A*Math.sin(φ1)              + B*Math.sin(φ2);
      var φ = Math.atan2(z, Math.sqrt(x*x + y*y));
      var λ = Math.atan2(y, x);
      return { lon: toDeg(λ), lat: toDeg(φ) };
    }

    /* ── Get a CSS variable value ── */
    function cssVar(name) {
      return getComputedStyle(document.getElementById('pageWrap') || document.body).getPropertyValue(name).trim();
    }

    /* ── Detect dark mode ── */
    function isDark() {
      var chk = document.getElementById('themeChk');
      return chk && chk.checked;
    }

    /* ── Resize canvas to fill the map wrap panel ── */
    function resizeCanvas() {
      var wrap = document.getElementById('blogMapWrap');
      if (!wrap) return;
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
    }

    /* ── Build routes from live stories data ── */
    function buildRoutes() {
      var routes = [];
      var manifest = window.__STORIES_DATA__ || { stories: [] };
      var seenDest = {};
      (manifest.stories || []).forEach(function(s) {
        var cid = (s.countryId || '').toLowerCase();
        if (cid === ORIGIN.id || seenDest[cid]) return;
        var coords = DEST_COORDS[cid];
        if (!coords) return;
        seenDest[cid] = true;
        routes.push({ to: coords, label: s.countryLabel || cid });
      });
      return routes;
    }

    /* ── Draw static world map ── */
    function drawMap(W, H, dark) {
      /* Map is now a dedicated visible panel — use clear, readable opacities */
      var landFill   = dark ? 'rgba(245,158,11,0.18)' : 'rgba(180,120,0,0.20)';
      var landStroke = dark ? 'rgba(245,158,11,0.45)' : 'rgba(150,100,0,0.45)';

      LANDS.forEach(function(poly) {
        ctx.beginPath();
        for (var i = 0; i < poly.length; i++) {
          var p = project(poly[i][0], poly[i][1], W, H);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fillStyle = landFill;
        ctx.fill();
        ctx.strokeStyle = landStroke;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });
    }

    /* ── Draw a dot with glow at a geo coordinate ── */
    function drawDot(lon, lat, W, H, color, r) {
      var p = project(lon, lat, W, H);
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    /* ── Draw the arc trail from origin to current plane position ── */
    function drawTrail(lon1, lat1, lon2, lat2, t, W, H, dark) {
      var steps = 60;
      var color = dark ? 'rgba(245,158,11,' : 'rgba(180,100,0,';
      ctx.beginPath();
      for (var i = 0; i <= steps; i++) {
        var frac = (i / steps) * t;
        var pt = greatCirclePoint(lon1, lat1, lon2, lat2, frac);
        var p  = project(pt.lon, pt.lat, W, H);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = color + '0.70)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    /* ── Draw the plane icon (tiny rotated ✈) ── */
    function drawPlane(lon1, lat1, lon2, lat2, t, W, H, dark) {
      var pt   = greatCirclePoint(lon1, lat1, lon2, lat2, t);
      var ptB  = greatCirclePoint(lon1, lat1, lon2, lat2, Math.max(0, t - 0.01));
      var p    = project(pt.lon,  pt.lat,  W, H);
      var pB   = project(ptB.lon, ptB.lat, W, H);
      var angle = Math.atan2(p.y - pB.y, p.x - pB.x);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.font = '14px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha  = 1;
      ctx.fillText('✈', 0, 0);
      ctx.globalAlpha  = 1;
      ctx.restore();
    }

    /* ── Animation state per route ──
       Phases: 'fly' (PH→dest) → 'pause_dest' → 'return' (dest→PH) → 'pause_ph' → repeat */
    var routes   = buildRoutes();
    var states   = routes.map(function(_, i) {
      return { t: 0, phase: 'fly', pause: 0, delay: i * 3500 };
    });
    var lastTs   = null;
    var FLY_MS   = 9000;   /* ms for one full leg (PH→dest or dest→PH) */
    var PAUSE_MS = 2000;   /* ms pause at each end                      */

    /* ── Main render loop ── */
    function render(ts) {
      if (!lastTs) lastTs = ts;
      var dt = ts - lastTs;
      lastTs = ts;

      var W = canvas.width, H = canvas.height;
      if (W === 0 || H === 0) { requestAnimationFrame(render); return; }

      var dark = isDark();
      ctx.clearRect(0, 0, W, H);
      drawMap(W, H, dark);

      /* origin dot — Manila/Philippines */
      var originColor = dark ? 'rgba(249,115,22,1)' : 'rgba(200,80,0,0.90)';
      drawDot(ORIGIN.lon, ORIGIN.lat, W, H, originColor, 5);

      routes.forEach(function(route, i) {
        var st = states[i];

        /* countdown initial stagger delay */
        if (st.delay > 0) { st.delay -= dt; return; }

        /* ── advance state machine ── */
        if (st.phase === 'fly' || st.phase === 'return') {
          st.t += dt / FLY_MS;
          if (st.t >= 1) {
            st.t = 1;
            st.phase = (st.phase === 'fly') ? 'pause_dest' : 'pause_ph';
            st.pause = PAUSE_MS;
          }
        } else {
          /* pause_dest or pause_ph */
          st.pause -= dt;
          if (st.pause <= 0) {
            st.t = 0;
            st.phase = (st.phase === 'pause_dest') ? 'return' : 'fly';
          }
        }

        /* destination dot — always visible once route starts */
        var destColor = dark ? 'rgba(251,191,36,0.90)' : 'rgba(180,100,0,0.80)';
        drawDot(route.to.lon, route.to.lat, W, H, destColor, 4);

        if (st.t <= 0) return;

        /* ── choose leg direction ── */
        var isReturn = (st.phase === 'return' || st.phase === 'pause_ph');
        var lon1 = isReturn ? route.to.lon  : ORIGIN.lon;
        var lat1 = isReturn ? route.to.lat  : ORIGIN.lat;
        var lon2 = isReturn ? ORIGIN.lon    : route.to.lon;
        var lat2 = isReturn ? ORIGIN.lat    : route.to.lat;

        drawTrail(lon1, lat1, lon2, lat2, st.t, W, H, dark);
        if (st.phase === 'fly' || st.phase === 'return') {
          drawPlane(lon1, lat1, lon2, lat2, st.t, W, H, dark);
        }
      });

      requestAnimationFrame(render);
    }

    /* ── Boot — desktop only (canvas is display:none on ≤1024px) ── */
    if (window.innerWidth > 1024) {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      requestAnimationFrame(render);
    }
  })();

  /* ── 13. STORIES — dynamic blog cards from inline data ─── */
  (function() {
    var filterBar      = document.getElementById('storyFilterBar');
    var container      = document.getElementById('blogCardsContainer');
    var backdrop       = document.getElementById('cardBackdrop');
    var overlay        = document.getElementById('cardOverlay');
    var allStories     = [];
    var activeFilter   = 'all';
    var activeCard     = null;
    var blogGrid       = null;   /* set by renderStories — points to .blog-grid or .blog-carousel-track */
    var carouselOffset = 0;      /* current carousel page offset */
    var CARDS_PER_PAGE = 5;

    var manifest = window.__STORIES_DATA__ || { stories: [] };
    allStories = manifest.stories || [];
    buildStoryFilters();
    renderStories('all');
    updateStats();

    /* update bio stats from story data */
    function updateStats() {
      var countries = {}, cities = {};
      allStories.forEach(function(s) {
        if (s.countryId) countries[s.countryId] = true;
        if (s.destination) cities[s.destination] = true;
      });
      var ec = document.getElementById('stat-countries');
      var eci = document.getElementById('stat-cities');
      var ep = document.getElementById('stat-posts');
      if (ec)  ec.textContent  = Object.keys(countries).length;
      if (eci) eci.textContent = Object.keys(cities).length;
      if (ep)  ep.textContent  = allStories.length;
    }

    /* build filter pills from unique countries */
    function buildStoryFilters() {
      if (!filterBar) return;
      filterBar.innerHTML = '';
      var seen = {};
      var localIds = [], intlIds = [];
      allStories.forEach(function(s) {
        if (!seen[s.countryId]) {
          seen[s.countryId] = true;
          if (s.region === 'Local') localIds.push({ id: s.countryId, label: s.countryLabel });
          else intlIds.push({ id: s.countryId, label: s.countryLabel });
        }
      });

      function makeBtn(id, label, isActive) {
        var btn = document.createElement('button');
        btn.className = 'filter-btn story-filter-btn' + (isActive ? ' story-filter-active' : '');
        btn.textContent = label;
        btn.setAttribute('data-filter', id);
        btn.addEventListener('click', function() {
          activeFilter = id;
          filterBar.querySelectorAll('.story-filter-btn').forEach(function(b) {
            b.classList.toggle('story-filter-active', b.getAttribute('data-filter') === id);
          });
          renderStories(id);
        });
        return btn;
      }

      filterBar.appendChild(makeBtn('all', 'All', true));
      if (localIds.length) {
        var lbl = document.createElement('span'); lbl.className = 'filter-section-label'; lbl.textContent = 'Local';
        filterBar.appendChild(lbl);
        localIds.forEach(function(c) { filterBar.appendChild(makeBtn(c.id, c.label, false)); });
      }
      if (intlIds.length) {
        var lbl2 = document.createElement('span'); lbl2.className = 'filter-section-label'; lbl2.textContent = 'International';
        filterBar.appendChild(lbl2);
        intlIds.forEach(function(c) { filterBar.appendChild(makeBtn(c.id, c.label, false)); });
      }
    }

    /* render cards — flat row (≤5) or carousel (6+) */
    function renderStories(filterId) {
      if (!container) return;
      closeOverlay();
      var stories = filterId === 'all' ? allStories : allStories.filter(function(s) { return s.countryId === filterId; });
      container.innerHTML = '';
      carouselOffset = 0;

      if (false) {
        /* flat row mode disabled — always use carousel */
      } else {
        /* ── carousel ── */
        var wrap = document.createElement('div');
        wrap.className = 'blog-carousel-wrap';

        var track = document.createElement('div');
        track.className = 'blog-carousel-track';
        if (stories.length < CARDS_PER_PAGE) {
          track.style.justifyContent = 'center';
        }
        stories.forEach(function(s) { track.appendChild(buildCard(s)); });
        wrap.appendChild(track);
        blogGrid = track;

        /* card width = (100% / 5) including gap */
        function visibleCards() {
          /* match CSS breakpoints */
          var w = window.innerWidth;
          if (w <= 640) return 2;
          if (w <= 960) return 3;
          return CARDS_PER_PAGE; /* 5 */
        }

        function updateTrack() {
          var gap = parseInt(getComputedStyle(track).gap) || 14;
          var firstCard = track.querySelector('.blog-card');
          var cardPx = firstCard ? (firstCard.offsetWidth + gap) : 0;
          var maxOffset = Math.max(0, stories.length - visibleCards());
          if (carouselOffset > maxOffset) carouselOffset = maxOffset;
          track.style.transform = 'translateX(-' + (carouselOffset * cardPx) + 'px)';
          prevBtn.style.opacity = carouselOffset <= 0 ? '0.3' : '1';
          nextBtn.style.opacity = carouselOffset >= maxOffset ? '0.3' : '1';
          prevBtn.style.pointerEvents = carouselOffset <= 0 ? 'none' : 'auto';
          nextBtn.style.pointerEvents = carouselOffset >= maxOffset ? 'none' : 'auto';
        }

        window.addEventListener('resize', updateTrack);

        var prevBtn = document.createElement('button');
        prevBtn.className = 'blog-carousel-btn prev';
        prevBtn.setAttribute('aria-label', 'Previous');
        prevBtn.innerHTML = '&#8249;';
        prevBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (carouselOffset > 0) { carouselOffset--; updateTrack(); }
        });

        var nextBtn = document.createElement('button');
        nextBtn.className = 'blog-carousel-btn next';
        nextBtn.setAttribute('aria-label', 'Next');
        nextBtn.innerHTML = '&#8250;';
        nextBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          var maxOffset = Math.max(0, stories.length - visibleCards());
          if (carouselOffset < maxOffset) { carouselOffset++; updateTrack(); }
        });

        wrap.appendChild(prevBtn);
        wrap.appendChild(nextBtn);
        container.appendChild(wrap);

        /* init arrow states after layout */
        setTimeout(updateTrack, 0);
      }
    }

    /* build one blog card DOM node */
    function buildCard(story) {
      var card = document.createElement('div');
      card.className = 'blog-card';
      card.setAttribute('data-country', story.countryId);

      /* — image strip: horizontal row of all photos, auto-slides every 5s — */
      var imgWrap = document.createElement('div');
      imgWrap.className = 'blog-card-img';

      if (story.images && story.images.length > 0) {
        /* horizontal strip viewport */
        var stripViewport = document.createElement('div');
        stripViewport.className = 'bc-strip-viewport';

        var strip = document.createElement('div');
        strip.className = 'bc-strip';

        story.images.forEach(function(img) {
          var cell = document.createElement('div');
          cell.className = 'bc-strip-cell';
          var el = document.createElement('img');
          el.src = story.path + '/' + img.file;
          el.alt = img.alt || story.destination;
          el.loading = 'lazy';
          cell.appendChild(el);
          strip.appendChild(cell);
        });

        stripViewport.appendChild(strip);
        imgWrap.appendChild(stripViewport);

        /* auto-advance the strip every 4s */
        if (story.images.length > 1) {
          var bcIdx = 0;
          setInterval(function() {
            bcIdx = (bcIdx + 1) % story.images.length;
            strip.style.transform = 'translateX(-' + (bcIdx * 100) + '%)';
          }, 4000);
        }
      } else {
        /* SVG placeholder */
        var destKey = story.destination.toLowerCase();
        var svgHtml = DEST_SVG[destKey] || ('<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#0a0800"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="rgba(245,158,11,0.5)" font-size="14" font-family="sans-serif">' + story.destination + '</text></svg>');
        imgWrap.innerHTML = svgHtml;
      }

      /* hint overlay — visible when NOT hovered */
      var hint = document.createElement('div');
      hint.className = 'bc-hint';
      hint.textContent = 'Click on this card to read storyline';
      imgWrap.appendChild(hint);

      var guard = document.createElement('div'); guard.className = 'img-guard'; guard.setAttribute('aria-hidden', 'true');
      var tagEl = document.createElement('div'); tagEl.className = 'blog-card-tag'; tagEl.textContent = story.countryLabel;
      imgWrap.appendChild(guard); imgWrap.appendChild(tagEl);
      card.appendChild(imgWrap);

      /* — card body — */
      var body = document.createElement('div'); body.className = 'blog-card-body';
      var meta = document.createElement('div'); meta.className = 'blog-card-meta';
      var spanDate = document.createElement('span'); spanDate.textContent = story.date;
      var spanDest = document.createElement('span'); spanDest.textContent = story.destination;
      meta.appendChild(spanDate); meta.appendChild(spanDest);
      var h3 = document.createElement('h3'); h3.textContent = story.title;
      body.appendChild(meta); body.appendChild(h3);

      if (story.paragraphs && story.paragraphs.length > 0) {
        var storyDiv = document.createElement('div'); storyDiv.className = 'card-story';
        story.paragraphs.forEach(function(p) {
          var el = document.createElement('p'); el.textContent = p; storyDiv.appendChild(el);
        });
        body.appendChild(storyDiv);
      }
      card.appendChild(body);

      /* — card footer (region only, no Read More) — */
      var footer = document.createElement('div'); footer.className = 'blog-card-footer';
      var regionSpan = document.createElement('span'); regionSpan.textContent = story.region;
      footer.appendChild(regionSpan);
      card.appendChild(footer);

      /* click to open overlay */
      card.addEventListener('click', function() {
        openOverlay(card);
        /* track blog card click */
        if (window.goatcounter && window.goatcounter.count) {
          window.goatcounter.count({ path: 'blog/' + story.id, title: story.title, event: true });
        }
      });
      return card;
    }

    /* overlay open */
    function openOverlay(card) {
      if (!overlay || !backdrop) return;
      overlay.innerHTML = card.innerHTML;
      /* remove the click-hint — not needed in full view */
      var hint = overlay.querySelector('.bc-hint');
      if (hint) hint.parentNode.removeChild(hint);
      var closeBtn = document.createElement('button');
      closeBtn.id = 'overlayClose'; closeBtn.setAttribute('aria-label', 'Close'); closeBtn.textContent = 'Close';
      closeBtn.addEventListener('click', function(e) { e.stopPropagation(); closeOverlay(); });
      overlay.insertBefore(closeBtn, overlay.firstChild);
      /* reinit strip auto-slide — the cloned strip has no interval attached */
      var strip = overlay.querySelector('.bc-strip');
      if (strip) {
        var cells = strip.querySelectorAll('.bc-strip-cell');
        if (cells.length > 1) {
          var idx = 0;
          var stripTimer = setInterval(function() {
            idx = (idx + 1) % cells.length;
            strip.style.transform = 'translateX(-' + (idx * 100) + '%)';
          }, 4000);
          /* clear timer when overlay closes */
          overlay.dataset.stripTimer = stripTimer;
        }
      }
      overlay.classList.add('show'); backdrop.classList.add('show');
      if (blogGrid) blogGrid.classList.add('has-expanded');
      activeCard = card;
    }

    /* overlay close */
    function closeOverlay() {
      if (!activeCard) return;
      /* clear the strip timer if running */
      if (overlay.dataset.stripTimer) {
        clearInterval(parseInt(overlay.dataset.stripTimer));
        delete overlay.dataset.stripTimer;
      }
      overlay.classList.remove('show'); backdrop.classList.remove('show');
      if (blogGrid) blogGrid.classList.remove('has-expanded');
      activeCard = null;
      setTimeout(function() { if (!activeCard && overlay) overlay.innerHTML = ''; }, 300);
    }

    if (backdrop) backdrop.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeOverlay(); });
  })();

  /* ── 14. GALLERY — 5-up orientation-grouped sideways slideshow ── */
  (function() {
    var viewport   = document.getElementById('galleryViewport');
    var dotsWrap   = document.getElementById('galleryDots');
    var modal      = document.getElementById('modalBackdrop');
    var modalImg   = document.getElementById('modalImg');
    var modalTitle = document.getElementById('modalTitle');
    var modalDesc  = document.getElementById('modalDesc');
    var modalClose = document.getElementById('modalClose');
    var SLOTS      = 5;
    var INTERVAL   = 5000;
    var allItems   = [];
    var pages      = [];   /* array of 5-item arrays */
    var current    = 0;    /* current page index */
    var timer      = null;
    var animating  = false;

    /* ── Portrait filename lookup (measured from actual image dimensions) ── */
    var PORTRAIT_FILES = {
      'IMG_1042.JPEG':1, 'IMG_1061.JPEG':1,
      'IMG_1681.JPEG':1, 'IMG_1684.JPEG':1,
      'IMG_20241105_0009.JPEG':1,
      'IMG_5914.JPEG':1,
      'IMG_6047.JPEG':1, 'IMG_6134.JPEG':1, 'IMG_6247.JPEG':1,
      'IMG_6523.JPEG':1, 'IMG_6562.JPEG':1,
      'IMG_6826.JPEG':1, 'IMG_6829.JPEG':1, 'IMG_6843.JPEG':1,
      'IMG_7213.JPEG':1, 'IMG_7239.JPEG':1,
      'IMG_7275.JPEG':1,
      'IMG_7327.JPEG':1, 'IMG_7347.JPEG':1, 'IMG_7373.JPEG':1,
      'IMG_7505.JPEG':1
    };

    /* ── Build flat item list with orientation resolved synchronously ── */
    var manifest = window.__GALLERY_DATA__ || { categories: [] };
    (manifest.categories || []).forEach(function(cat) {
      (cat.folders || []).forEach(function(folder) {
        (folder.photos || []).forEach(function(photo) {
          var fname = photo.file.split('/').pop();
          allItems.push({
            src:     folder.path === '.' ? 'bob-artifacts/Gallery - Compiled/' + photo.file : 'bob-artifacts/Gallery - Compiled/' + folder.path + '/' + photo.file,
            caption: photo.caption || folder.name,
            alt:     photo.alt     || folder.name,
            orient:  PORTRAIT_FILES[fname] ? 'portrait' : 'landscape'
          });
        });
      });
    });

    if (!viewport || allItems.length === 0) return;

    /* ── Build pages: all landscape first, then all portrait ── */
    function buildPages() {
      var landscapeQueue = [];
      var portraitQueue  = [];

      allItems.forEach(function(item) {
        if (item.orient === 'portrait') {
          portraitQueue.push(item);
        } else {
          landscapeQueue.push(item);
        }
      });

      /* chunk each bucket into pages of SLOTS — never mix orientations */
      pages = [];
      for (var l = 0; l < landscapeQueue.length; l += SLOTS) {
        pages.push(landscapeQueue.slice(l, l + SLOTS));
      }
      for (var p = 0; p < portraitQueue.length; p += SLOTS) {
        pages.push(portraitQueue.slice(p, p + SLOTS));
      }

      if (pages.length === 0) return;

      renderPage(0, false);
      buildDots();
      timer = setInterval(advance, INTERVAL);

      /* pause on hover */
      viewport.addEventListener('mouseenter', function() { clearInterval(timer); });
      viewport.addEventListener('mouseleave', function() { timer = setInterval(advance, INTERVAL); });
    }
    buildPages();

    /* ── Build one page (row of 5 cells) ── */
    function makePage(pageItems) {
      var row = document.createElement('div');
      row.className = 'gallery-page' + (pageItems.length < SLOTS ? ' partial' : '');
      pageItems.forEach(function(item) {
        var cell = document.createElement('div');
        cell.className = 'gallery-cell';

        var img = document.createElement('img');
        img.src = item.src; img.alt = item.alt;
        img.loading = 'lazy'; img.decoding = 'async';

        var cap = document.createElement('div');
        cap.className = 'gallery-cell-cap';
        cap.textContent = item.caption;

        var guard = document.createElement('div');
        guard.className = 'img-guard'; guard.setAttribute('aria-hidden', 'true');

        cell.appendChild(img); cell.appendChild(cap); cell.appendChild(guard);

        /* click → modal */
        cell.addEventListener('click', function() {
          openModal(item.src, item.alt);
          /* track gallery photo click */
          if (window.goatcounter && window.goatcounter.count) {
            window.goatcounter.count({ path: 'gallery/' + item.caption, title: 'Gallery: ' + item.caption, event: true });
          }
        });
        row.appendChild(cell);
      });
      return row;
    }

    /* ── Render a page (with or without animation) ── */
    var activePageEl = null;
    function renderPage(idx, animate) {
      var newPage = makePage(pages[idx]);
      if (!animate || !activePageEl) {
        viewport.innerHTML = '';
        viewport.appendChild(newPage);
        activePageEl = newPage;
        return;
      }
      animating = true;
      /* position the exiting page absolutely so the entering page
         flows in the normal document flow (no height collapse) */
      var exitHeight = activePageEl.offsetHeight;
      viewport.style.minHeight = exitHeight + 'px';
      activePageEl.style.cssText = 'position:absolute;top:0;left:0;width:100%;';
      activePageEl.classList.add('exit');

      newPage.classList.add('enter');
      viewport.appendChild(newPage);

      var oldPage = activePageEl;
      activePageEl = newPage;
      setTimeout(function() {
        newPage.classList.remove('enter');
        viewport.style.minHeight = '';
        if (oldPage.parentNode) oldPage.parentNode.removeChild(oldPage);
        animating = false;
      }, 700);
    }

    /* ── Dots ── */
    var dots = [];
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      dots = [];
      pages.forEach(function(_, i) {
        var dot = document.createElement('button');
        dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to page ' + (i + 1));
        dot.addEventListener('click', function(e) {
          e.stopPropagation();
          if (i !== current && !animating) goTo(i);
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }
    function updateDots(idx) {
      dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
    }

    function goTo(nextIdx) {
      if (animating) return;
      current = nextIdx;
      updateDots(current);
      renderPage(current, true);
    }

    function advance() {
      goTo((current + 1) % pages.length);
    }

    /* ── Modal ── */
    function openModal(src, alt) {
      if (!modal) return;
      modalImg.innerHTML = '';
      var mi = document.createElement('img');
      mi.src = src; mi.alt = alt;
      mi.style.cssText = 'width:100%;display:block;max-height:65vh;object-fit:contain;background:var(--surface)';
      modalImg.appendChild(mi);
      if (modalTitle) modalTitle.textContent = '';
      if (modalDesc)  modalDesc.textContent  = '';
      modal.classList.add('open');
    }

    if (modalClose) modalClose.addEventListener('click', function() { modal && modal.classList.remove('open'); });
    if (modal) modal.addEventListener('click', function(e) { if (e.target === modal) modal.classList.remove('open'); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modal) modal.classList.remove('open'); });
  })();

})();
