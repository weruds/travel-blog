(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
   * SECTION 1 — CONTENT PROTECTION
   * Blocks right-click, keyboard shortcuts, drag, touch-hold, copy, cut,
   * and download links. Also detects DevTools via size/timing and blurs the
   * page while the window is out of focus (snip-tool protection).
   * ───────────────────────────────────────────────────────────────────────── */

  /* 1a. Block right-click context menu on all elements */
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault(); e.stopPropagation(); return false;
  }, true);

  /* 1b. Block drag-start on images and gallery items */
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'SVG' ||
        e.target.closest('.blog-card-img') || e.target.closest('.masonry-item')) {
      e.preventDefault();
    }
  }, true);

  /* 1c. Block keyboard shortcuts: save, view-source, print, F12, DevTools panels, PrintScreen */
  document.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey, shift = e.shiftKey;
    if (ctrl && !shift && (k === 's' || k === 'u' || k === 'p')) { e.preventDefault(); e.stopPropagation(); return false; }
    if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); showWarning('Unauthorized Access Detected', 'Developer tools are not permitted on this page.'); return false; }
    if (ctrl && shift && (k === 'i' || k === 'j' || k === 'c')) { e.preventDefault(); e.stopPropagation(); showWarning('Unauthorized Access Detected', 'Developer tools are not permitted on this page.'); return false; }
    if (k === 'printscreen' || k === 'print screen') { e.preventDefault(); showWarning('Screenshot Blocked', 'Screenshots are not permitted on this page.'); flashOverlay(); }
  }, true);

  /* 1d. Detect DevTools by window size difference (docked panel widens the chrome) */
  (function () {
    var threshold = 160;
    function checkDevTools() {
      var widthDiff  = window.outerWidth  - window.innerWidth;
      var heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > threshold || heightDiff > threshold) {
        showWarning('Unauthorized Access Detected', 'Developer tools are not permitted on this page. Content is protected under copyright.');
        document.getElementById('pageWrap').style.filter = 'blur(12px)';
      } else {
        document.getElementById('pageWrap').style.filter = '';
      }
    }
    setInterval(checkDevTools, 800);
  })();

  /* 1e. Detect DevTools by timing — debugger pauses increase elapsed time significantly */
  (function () {
    function devTimingCheck() {
      var t0 = performance.now();
      (function () { /* no-op — trips debugger if paused */ })();
      if (performance.now() - t0 > 100) {
        showWarning('Unauthorized Access Detected', 'Developer tools are not permitted on this page.');
      }
    }
    setInterval(devTimingCheck, 3000);
  })();

  /* 1f. Blur the page the instant the window loses focus so OS screenshot tools
         (Snip & Sketch, print screen, screen recorders) only capture a blurred frame */
  (function () {
    var wrap = null;
    var BLUR  = 'blur(20px)';
    var CLEAR = '';

    function getWrap() { return wrap || (wrap = document.getElementById('pageWrap')); }
    function obscure() { var w = getWrap(); if (w) w.style.filter = BLUR; }
    function unblur()  { setTimeout(function () { var w = getWrap(); if (w) w.style.filter = CLEAR; }, 600); }

    document.addEventListener('visibilitychange', function () { if (document.hidden) obscure(); else unblur(); });
    window.addEventListener('blur',      obscure);
    window.addEventListener('focus',     unblur);
    window.addEventListener('pagehide',  obscure);
    window.addEventListener('pageshow',  unblur);
    document.documentElement.addEventListener('mouseleave', obscure);
    document.documentElement.addEventListener('mouseenter', unblur);
  })();

  /* 1g. Block touch-hold (long press) on images to prevent the native save dialog */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.blog-card-img, .masonry-item, svg, img').forEach(function (el) {
      el.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
    });
  });

  /* 1h. Intercept and block download-attribute links and blob URLs */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (a && (a.hasAttribute('download') || (a.href && a.href.startsWith('blob:')))) {
      e.preventDefault();
      showWarning('Download Blocked', 'Downloading content from this page is not permitted.');
    }
  }, true);

  /* 1i. Disable text selection everywhere except input/textarea fields */
  document.addEventListener('selectstart', function (e) {
    if (!e.target.closest('input, textarea')) e.preventDefault();
  });

  /* 1j. Block clipboard copy and cut events */
  document.addEventListener('copy', function (e) { e.preventDefault(); });
  document.addEventListener('cut',  function (e) { e.preventDefault(); });

  /* ─────────────────────────────────────────────────────────────────────────
   * SECTION 2 — SHARED UTILITY FUNCTIONS
   * flashOverlay: quick white-flash on PrintScreen key
   * showWarning: display the sec-warning banner and blur the page
   * ───────────────────────────────────────────────────────────────────────── */

  /* Flash a white overlay — visually "ruins" any screenshot attempt */
  function flashOverlay() {
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:999999;pointer-events:none;opacity:1;transition:opacity 0.15s';
    document.body.appendChild(div);
    requestAnimationFrame(function () {
      setTimeout(function () { div.style.opacity = '0'; setTimeout(function () { div.remove(); }, 200); }, 50);
    });
  }

  /* Show the security warning banner for 3.5s and blur the page behind it */
  function showWarning(title, msg) {
    var w = document.getElementById('sec-warning');
    w.querySelector('h2').textContent = title;
    w.querySelector('p').textContent  = msg;
    w.classList.add('show');
    document.getElementById('pageWrap').style.filter = 'blur(8px)';
    setTimeout(function () { w.classList.remove('show'); document.getElementById('pageWrap').style.filter = ''; }, 3500);
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * SECTION 3 — HERO SCENE
   * Builds the animated night-sky landscape (sun glow, mountains, stars,
   * floating embers) entirely in JS. The emberFloat keyframe is injected
   * into the document once so it only runs when the scene is present.
   * ───────────────────────────────────────────────────────────────────────── */

  (function () {
    var scene = document.getElementById('heroScene');
    if (!scene) return;

    /* Sun glow and mountain silhouettes */
    var sun = document.createElement('div'); sun.className = 'sun-glow'; scene.appendChild(sun);
    ['mountain m1', 'mountain m2', 'mountain m3', 'mountain m4'].forEach(function (cls) {
      var el = document.createElement('div'); el.className = cls; scene.appendChild(el);
    });
    var hor = document.createElement('div'); hor.className = 'horizon'; scene.appendChild(hor);

    /* 60 randomised stars — alternating white and warm-amber colours */
    for (var i = 0; i < 60; i++) {
      var s  = document.createElement('div'); s.className = 'star';
      var sz = Math.random() * 2.5 + 0.8, isEmber = Math.random() > 0.55;
      s.style.cssText =
        'width:' + sz + 'px;height:' + sz + 'px;' +
        'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 65) + '%;' +
        'animation-delay:' + (Math.random() * 4) + 's;animation-duration:' + (2 + Math.random() * 3) + 's;' +
        (isEmber
          ? 'background:rgba(245,158,11,' + (0.5 + Math.random() * 0.5) + ')'
          : 'background:rgba(255,255,255,' + (0.4 + Math.random() * 0.6) + ')');
      scene.appendChild(s);
    }

    /* 18 rising ember particles */
    for (var j = 0; j < 18; j++) {
      var em = document.createElement('div');
      em.style.cssText =
        'position:absolute;' +
        'width:' + (1 + Math.random() * 2) + 'px;height:' + (1 + Math.random() * 2) + 'px;' +
        'border-radius:50%;background:rgba(251,191,36,' + (0.3 + Math.random() * 0.7) + ');' +
        'left:' + (Math.random() * 100) + '%;bottom:' + (Math.random() * 40) + '%;' +
        'animation:emberFloat ' + (4 + Math.random() * 6) + 's ' + (Math.random() * 4) + 's ease-in-out infinite';
      scene.appendChild(em);
    }

    /* Inject the emberFloat keyframe only once */
    if (!document.getElementById('emberFloatStyle')) {
      var st = document.createElement('style'); st.id = 'emberFloatStyle';
      st.textContent = '@keyframes emberFloat{0%{transform:translateY(0) scale(1);opacity:0.7}50%{transform:translateY(-40px) scale(1.3);opacity:1}100%{transform:translateY(-80px) scale(0.6);opacity:0}}';
      document.head.appendChild(st);
    }
  })();

  /* ─────────────────────────────────────────────────────────────────────────
   * SECTION 4 — MOBILE MENU
   * Toggles the hamburger icon state and the .open class on the menu panel.
   * Closes on outside click, nav link click, or window resize above 720px.
   * ───────────────────────────────────────────────────────────────────────── */

  (function () {
    var hamburger = document.getElementById('hamburger');
    var menu      = document.getElementById('mobileMenu');
    if (!hamburger || !menu) return;

    function setOpen(open) {
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('open', open);
    }

    hamburger.addEventListener('click', function () { setOpen(!menu.classList.contains('open')); });

    /* Close when a nav link is tapped */
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('open')) return;
      if (menu.contains(e.target) || hamburger.contains(e.target)) return;
      setOpen(false);
    });

    /* Close when viewport expands past mobile breakpoint */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720) setOpen(false);
    });
  })();

  /* ─────────────────────────────────────────────────────────────────────────
   * SECTION 5 — SCROLL ANIMATIONS
   * 5a. Section heading accent: adds .in-view to h2 when .section-header enters view
   * 5b. Section reveal: adds .is-visible to .reveal-up elements once visible
   * 5c. Hero parallax tilt: rotates heroScene based on pointer position on desktop
   * ───────────────────────────────────────────────────────────────────────── */

  /* 5a. Activate heading accent underline once section header is scrolled into view */
  (function () {
    if (!window.IntersectionObserver) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && en.target.querySelector('h2')) {
          en.target.querySelector('h2').classList.add('in-view');
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.section-header').forEach(function (el) { obs.observe(el); });
  })();

  /* 5b. Reveal major page sections with a fade-up as they enter the viewport */
  (function () {
    if (!window.IntersectionObserver) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); /* fire once only */
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal-up').forEach(function (target) { observer.observe(target); });
  })();

  /* 5c. Cinematic 3-D tilt on the hero scene — pointer moves offset rotateX/Y.
         Skipped entirely on touch devices or when prefers-reduced-motion is set. */
  (function () {
    var hero  = document.getElementById('hero');
    var scene = document.getElementById('heroScene');
    if (!hero || !scene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var frame = null;
    hero.addEventListener('pointermove', function (e) {
      var rect = hero.getBoundingClientRect();
      var px   = (e.clientX - rect.left) / rect.width  - 0.5;
      var py   = (e.clientY - rect.top)  / rect.height - 0.5;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        scene.style.transform = 'rotateX(' + (-py * 5) + 'deg) rotateY(' + (px * 8) + 'deg) scale(1.02)';
      });
    });

    hero.addEventListener('pointerleave', function () {
      scene.style.transform = '';
    });
  })();

  /* ─────────────────────────────────────────────────────────────────────────
   * SECTION 6 — CAROUSEL
   * Shared initialiser attached to any .sv-carousel element (used on both
   * the story cards and the expanded overlay). Supports prev/next buttons,
   * dot indicators, and auto-advance that pauses on hover.
   * ───────────────────────────────────────────────────────────────────────── */

  function initCarouselOn(container) {
    var track   = container.querySelector('.sv-carousel-track');
    var dotsEl  = container.querySelector('.sv-carousel-dots');
    var prevBtn = container.querySelector('.sv-carousel-btn.prev');
    var nextBtn = container.querySelector('.sv-carousel-btn.next');
    if (!track) return;

    var imgs = track.querySelectorAll('img'), n = imgs.length, cur = 0, timer;

    /* Build dot indicators */
    if (dotsEl) {
      dotsEl.innerHTML = '';
      Array.prototype.forEach.call(imgs, function (_, i) {
        var d = document.createElement('button');
        d.className = 'sv-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Photo ' + (i + 1));
        d.addEventListener('click', function (e) { e.stopPropagation(); stopAuto(); goTo(i); startAuto(); });
        dotsEl.appendChild(d);
      });
    }

    function goTo(idx) {
      cur = (idx + n) % n;
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
      if (dotsEl) {
        Array.prototype.forEach.call(dotsEl.querySelectorAll('.sv-dot'), function (d, i) {
          d.classList.toggle('active', i === cur);
        });
      }
    }

    function startAuto() { timer = setInterval(function () { goTo(cur + 1); }, 3200); }
    function stopAuto()  { clearInterval(timer); }

    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); stopAuto(); goTo(cur - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); stopAuto(); goTo(cur + 1); startAuto(); });
    container.addEventListener('mouseenter', stopAuto);
    container.addEventListener('mouseleave', startAuto);
    startAuto();
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * SECTION 7 — STORIES
   * Renders story filter pills and blog cards from window.__STORIES_DATA__.
   * Cards open in a full-page overlay with a re-initialised carousel.
   * SVG placeholders cover destinations that have no photos yet.
   * ───────────────────────────────────────────────────────────────────────── */

  /* Inline SVG art for destinations without real photos */
  var DEST_SVG = {
    'ha long bay': '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#04101e"/><rect x="0" y="115" width="320" height="85" fill="#041520"/><polygon points="0,115 30,55 60,115" fill="#071a2a"/><polygon points="40,115 85,30 130,115" fill="#051422"/><polygon points="100,115 140,48 180,115" fill="#071a2a"/><polygon points="160,115 200,38 240,115" fill="#051422"/><polygon points="230,115 268,60 306,115" fill="#071a2a"/><rect x="0" y="95" width="320" height="25" fill="rgba(100,160,200,0.08)"/><circle cx="160" cy="42" r="30" fill="rgba(30,111,219,0.18)"/><circle cx="160" cy="42" r="14" fill="rgba(74,158,255,0.36)"/><circle cx="35" cy="18" r="1.2" fill="white" opacity=".7"/><circle cx="260" cy="22" r="1" fill="white" opacity=".6"/><circle cx="200" cy="12" r="1.4" fill="white" opacity=".8"/></svg>',
    'hanoi':       '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#080c18"/><rect x="20" y="100" width="18" height="100" fill="#0d1528"/><rect x="50" y="80" width="28" height="120" fill="#0a1220"/><rect x="90" y="90" width="22" height="110" fill="#0d1528"/><rect x="124" y="70" width="32" height="130" fill="#0a1220"/><rect x="168" y="85" width="20" height="115" fill="#0d1528"/><rect x="200" y="75" width="30" height="125" fill="#0a1220"/><rect x="242" y="95" width="18" height="105" fill="#0d1528"/><rect x="272" y="82" width="26" height="118" fill="#0a1220"/><rect x="56" y="88" width="4" height="3" fill="rgba(74,158,255,0.5)"/><rect x="64" y="95" width="4" height="3" fill="rgba(74,158,255,0.4)"/><rect x="130" y="78" width="4" height="3" fill="rgba(74,158,255,0.55)"/><circle cx="260" cy="30" r="20" fill="rgba(30,111,219,0.15)"/><circle cx="260" cy="30" r="10" fill="rgba(74,158,255,0.3)"/><circle cx="40" cy="20" r="1" fill="white" opacity=".6"/><circle cx="100" cy="14" r="1.2" fill="white" opacity=".7"/></svg>',
    'ninh binh':   '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#051208"/><rect x="0" y="130" width="320" height="70" fill="#071a0a"/><polygon points="0,130 50,55 100,130" fill="#0a1f0c"/><polygon points="60,130 130,35 200,130" fill="#081808"/><polygon points="170,130 230,52 290,130" fill="#0a1f0c"/><polygon points="260,130 295,72 330,130" fill="#081808"/><rect x="60" y="128" width="200" height="6" fill="rgba(74,180,100,0.12)"/><circle cx="160" cy="45" r="26" fill="rgba(30,150,80,0.15)"/><circle cx="160" cy="45" r="12" fill="rgba(74,200,120,0.28)"/><circle cx="30" cy="18" r="1.2" fill="white" opacity=".65"/><circle cx="285" cy="24" r="1.3" fill="white" opacity=".75"/></svg>',
    'sapa':        '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#060a10"/><polygon points="0,200 0,80 80,50 160,70 240,40 320,60 320,200" fill="#0c1a10"/><polygon points="0,200 0,110 80,85 160,100 240,75 320,90 320,200" fill="#0f2214"/><polygon points="0,200 0,140 80,120 160,135 240,110 320,125 320,200" fill="#122a18"/><polygon points="0,200 0,165 80,148 160,160 240,140 320,155 320,200" fill="#163015"/><polygon points="160,0 240,40 80,40" fill="#080e14"/><rect x="0" y="62" width="320" height="18" fill="rgba(180,200,220,0.07)"/><circle cx="50" cy="28" r="14" fill="rgba(200,210,230,0.14)"/><circle cx="50" cy="28" r="7" fill="rgba(220,230,255,0.25)"/><circle cx="200" cy="16" r="1.2" fill="white" opacity=".7"/></svg>'
  };

  (function () {
    var filterBar   = document.getElementById('storyFilterBar');
    var blogGrid    = document.getElementById('blogGrid');
    var backdrop    = document.getElementById('cardBackdrop');
    var overlay     = document.getElementById('cardOverlay');
    var allStories  = (window.__STORIES_DATA__ || { stories: [] }).stories;
    var activeCard  = null;

    buildStoryFilters();
    renderStories('all');

    /* Build filter pills grouped by Local / International */
    function buildStoryFilters() {
      if (!filterBar) return;
      filterBar.innerHTML = '';
      var seen = {}, localIds = [], intlIds = [];
      allStories.forEach(function (s) {
        if (!seen[s.countryId]) {
          seen[s.countryId] = true;
          if (s.region === 'Local') localIds.push({ id: s.countryId, label: s.countryLabel });
          else                      intlIds.push({ id: s.countryId, label: s.countryLabel });
        }
      });

      function makeBtn(id, label, isActive) {
        var btn = document.createElement('button');
        btn.className = 'filter-btn story-filter-btn' + (isActive ? ' story-filter-active' : '');
        btn.textContent = label;
        btn.setAttribute('data-filter', id);
        btn.addEventListener('click', function () {
          filterBar.querySelectorAll('.story-filter-btn').forEach(function (b) {
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
        localIds.forEach(function (c) { filterBar.appendChild(makeBtn(c.id, c.label, false)); });
      }
      if (intlIds.length) {
        var lbl2 = document.createElement('span'); lbl2.className = 'filter-section-label'; lbl2.textContent = 'International';
        filterBar.appendChild(lbl2);
        intlIds.forEach(function (c) { filterBar.appendChild(makeBtn(c.id, c.label, false)); });
      }
    }

    /* Render only the stories matching filterId (or all) */
    function renderStories(filterId) {
      if (!blogGrid) return;
      closeOverlay();
      blogGrid.innerHTML = '';
      var stories = filterId === 'all' ? allStories : allStories.filter(function (s) { return s.countryId === filterId; });
      stories.forEach(function (story) { blogGrid.appendChild(buildCard(story)); });
    }

    /* Build a single story card DOM node */
    function buildCard(story) {
      var card = document.createElement('div');
      card.className = 'blog-card';
      card.setAttribute('data-country', story.countryId);

      /* Image area: photo carousel or SVG placeholder */
      var imgWrap = document.createElement('div');
      imgWrap.className = 'blog-card-img';

      if (story.images && story.images.length > 0) {
        var carousel = document.createElement('div'); carousel.className = 'sv-carousel';
        var track    = document.createElement('div'); track.className    = 'sv-carousel-track';
        story.images.forEach(function (img) {
          var el = document.createElement('img');
          el.src = story.path + '/' + img.file; el.alt = img.alt || story.destination; el.loading = 'lazy';
          track.appendChild(el);
        });
        carousel.appendChild(track);
        if (story.images.length > 1) {
          var prevBtn = document.createElement('button'); prevBtn.className = 'sv-carousel-btn prev'; prevBtn.setAttribute('aria-label', 'Previous photo'); prevBtn.innerHTML = '&#8249;';
          var nextBtn = document.createElement('button'); nextBtn.className = 'sv-carousel-btn next'; nextBtn.setAttribute('aria-label', 'Next photo');     nextBtn.innerHTML = '&#8250;';
          var dotsEl  = document.createElement('div');   dotsEl.className  = 'sv-carousel-dots';
          carousel.appendChild(prevBtn); carousel.appendChild(nextBtn); carousel.appendChild(dotsEl);
        }
        imgWrap.appendChild(carousel);
        setTimeout(function () { initCarouselOn(carousel); }, 0); /* init after DOM append */
      } else {
        /* Fall back to an inline SVG illustration keyed by destination name */
        var destKey = story.destination.toLowerCase();
        var svgHtml = DEST_SVG[destKey] || ('<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#0a0800"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="rgba(245,158,11,0.5)" font-size="14" font-family="sans-serif">' + story.destination + '</text></svg>');
        imgWrap.innerHTML = svgHtml;
      }

      var guard = document.createElement('div'); guard.className = 'img-guard'; guard.setAttribute('aria-hidden', 'true');
      var tagEl = document.createElement('div'); tagEl.className = 'blog-card-tag'; tagEl.textContent = story.countryLabel;
      imgWrap.appendChild(guard); imgWrap.appendChild(tagEl);
      card.appendChild(imgWrap);

      /* Card body: date, destination, title, story paragraphs */
      var body = document.createElement('div'); body.className = 'blog-card-body';
      var meta = document.createElement('div'); meta.className = 'blog-card-meta';
      var spanDate = document.createElement('span'); spanDate.textContent = story.date;
      var spanDest = document.createElement('span'); spanDest.textContent = story.destination;
      meta.appendChild(spanDate); meta.appendChild(spanDest);
      var h3 = document.createElement('h3'); h3.textContent = story.title;
      body.appendChild(meta); body.appendChild(h3);
      if (story.paragraphs && story.paragraphs.length > 0) {
        var storyDiv = document.createElement('div'); storyDiv.className = 'card-story';
        story.paragraphs.forEach(function (p) { var el = document.createElement('p'); el.textContent = p; storyDiv.appendChild(el); });
        body.appendChild(storyDiv);
      }
      card.appendChild(body);

      /* Card footer: region tag, optional "Read More" link */
      var footer = document.createElement('div'); footer.className = 'blog-card-footer';
      var regionSpan = document.createElement('span'); regionSpan.textContent = story.region;
      footer.appendChild(regionSpan);
      if (!story.paragraphs || story.paragraphs.length === 0) {
        var rm = document.createElement('span'); rm.className = 'read-more'; rm.textContent = 'Read More \u2192';
        footer.appendChild(rm);
      }
      card.appendChild(footer);

      card.addEventListener('click', function () { openOverlay(card); });
      return card;
    }

    /* Clone card content into the full-page overlay and reinit its carousel */
    function openOverlay(card) {
      if (!overlay || !backdrop) return;
      overlay.innerHTML = card.innerHTML;
      var closeBtn = document.createElement('button');
      closeBtn.id = 'overlayClose'; closeBtn.setAttribute('aria-label', 'Close'); closeBtn.textContent = 'Close';
      closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeOverlay(); });
      overlay.insertBefore(closeBtn, overlay.firstChild);
      var c = overlay.querySelector('.sv-carousel');
      if (c) initCarouselOn(c);
      overlay.classList.add('show'); backdrop.classList.add('show');
      blogGrid.classList.add('has-expanded');
      activeCard = card;
    }

    function closeOverlay() {
      if (!activeCard) return;
      overlay.classList.remove('show'); backdrop.classList.remove('show');
      blogGrid.classList.remove('has-expanded');
      activeCard = null;
      setTimeout(function () { if (!activeCard && overlay) overlay.innerHTML = ''; }, 300);
    }

    if (backdrop) backdrop.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOverlay(); });
  })();

  /* ─────────────────────────────────────────────────────────────────────────
   * SECTION 8 — GALLERY
   * Loads photos from window.__GALLERY_DATA__, optionally shows a category
   * filter bar (only when ≥ 2 named categories exist), colour-sorts photos
   * by dominant hue, and opens a lightbox modal on click or keyboard enter.
   * ───────────────────────────────────────────────────────────────────────── */

  (function () {
    var grid       = document.getElementById('masonryGrid');
    var filterBar  = document.getElementById('galleryFilterBar');
    var modal      = document.getElementById('modalBackdrop');
    var modalImg   = document.getElementById('modalImg');
    var modalTitle = document.getElementById('modalTitle');
    var modalDesc  = document.getElementById('modalDesc');
    var modalClose = document.getElementById('modalClose');
    var allItems   = [];

    var manifest = window.__GALLERY_DATA__ || { categories: [] };
    buildGalleryItems(manifest);
    buildGalleryFilters(manifest);
    renderGallery('all');

    /* Flatten all photos into allItems with resolved src paths */
    function buildGalleryItems(manifest) {
      (manifest.categories || []).forEach(function (cat) {
        (cat.folders || []).forEach(function (folder) {
          (folder.photos || []).forEach(function (photo) {
            allItems.push({
              src:      folder.path === '.' ? 'Gallery - Compiled/' + photo.file : 'Gallery - Compiled/' + folder.path + '/' + photo.file,
              caption:  photo.caption || folder.name,
              alt:      photo.alt     || folder.name,
              category: cat.id,
              catLabel: cat.label,
              folder:   folder.name
            });
          });
        });
      });
    }

    /* Show filter bar only when there are 2+ distinct named categories */
    function buildGalleryFilters(manifest) {
      if (!filterBar) return;
      var rawCats = manifest.categories || [];
      if (rawCats.length < 2) { filterBar.style.display = 'none'; return; }
      filterBar.style.display = '';
      filterBar.innerHTML = '';
      var cats = [{ id: 'all', label: 'All' }].concat(rawCats.map(function (c) { return { id: c.id, label: c.label }; }));
      cats.forEach(function (cat) {
        var btn = document.createElement('button');
        btn.className = 'filter-btn gallery-filter-btn' + (cat.id === 'all' ? ' active' : '');
        btn.textContent = cat.label;
        btn.setAttribute('data-filter', cat.id);
        btn.addEventListener('click', function () {
          filterBar.querySelectorAll('.gallery-filter-btn').forEach(function (b) {
            b.classList.toggle('active', b.getAttribute('data-filter') === cat.id);
          });
          renderGallery(cat.id);
        });
        filterBar.appendChild(btn);
      });
    }

    /* Convert R,G,B (0–255) to HSL — used for colour-based sorting */
    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          default: h = ((r - g) / d + 4) / 6;
        }
      }
      return [h * 360, s, l];
    }

    /* Sample a 32×32 canvas thumbnail to get the average dominant hue */
    function getDominantHue(imgEl, callback) {
      try {
        var cv = document.createElement('canvas'); cv.width = 32; cv.height = 32;
        var ctx = cv.getContext('2d');
        ctx.drawImage(imgEl, 0, 0, 32, 32);
        var data = ctx.getImageData(0, 0, 32, 32).data;
        var hueSum = 0, count = 0;
        for (var i = 0; i < data.length; i += 16) {
          var hsl = rgbToHsl(data[i], data[i + 1], data[i + 2]);
          if (hsl[1] > 0.08) { hueSum += hsl[0]; count++; }
        }
        /* Low-saturation (greyscale) photos go to hue 999 so they sort last */
        callback(count > 4 ? hueSum / count : 999);
      } catch (e) { callback(999); }
    }

    /* Build a single gallery card tile */
    function buildCard(item) {
      var div = document.createElement('div');
      div.className = 'masonry-item';
      div.setAttribute('role', 'listitem'); div.setAttribute('tabindex', '0'); div.setAttribute('aria-label', item.alt);

      var img = document.createElement('img');
      img.className = 'gallery-img'; img.src = item.src; img.alt = item.alt; img.loading = 'lazy'; img.decoding = 'async';
      img.onerror = function () {
        /* Show caption as text placeholder if image fails to load */
        div.style.background = 'var(--surface)'; img.style.display = 'none';
        var ph = document.createElement('div');
        ph.style.cssText = 'width:100%;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;padding:1rem;text-align:center';
        ph.textContent = item.caption; div.insertBefore(ph, div.querySelector('.masonry-overlay'));
      };

      var ovl = document.createElement('div'); ovl.className = 'masonry-overlay';
      var cap = document.createElement('span'); cap.className = 'masonry-caption'; cap.textContent = item.caption + ' \u00b7 ' + item.catLabel;
      ovl.appendChild(cap);

      var gd = document.createElement('div'); gd.className = 'img-guard'; gd.setAttribute('aria-hidden', 'true');
      div.appendChild(img); div.appendChild(ovl); div.appendChild(gd);

      function openModal() {
        if (!modal) return;
        modalImg.innerHTML = '';
        var mi = document.createElement('img'); mi.src = item.src; mi.alt = item.alt;
        mi.style.cssText = 'width:100%;display:block;max-height:65vh;object-fit:contain;background:var(--surface)';
        modalImg.appendChild(mi);
        if (modalTitle) modalTitle.textContent = '';
        if (modalDesc)  modalDesc.textContent  = '';
        modal.classList.add('open');
      }

      div.addEventListener('click', openModal);
      div.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });
      return { div: div, img: img };
    }

    /* Render gallery cards, then colour-sort them once all images have decoded */
    function renderGallery(filterId) {
      if (!grid) return;
      var items = filterId === 'all' ? allItems : allItems.filter(function (it) { return it.category === filterId; });
      grid.innerHTML = '';
      if (items.length === 0) return;

      var cards  = items.map(function (item) { var c = buildCard(item); return { div: c.div, img: c.img, hue: 999 }; });
      var loaded = 0;

      function trySort() {
        if (++loaded < cards.length) return;
        cards.sort(function (a, b) { return a.hue - b.hue; });
        grid.innerHTML = '';
        cards.forEach(function (c) { grid.appendChild(c.div); });
      }

      cards.forEach(function (card) {
        if (card.img.complete && card.img.naturalWidth > 0) {
          getDominantHue(card.img, function (h) { card.hue = h; trySort(); });
        } else {
          card.img.addEventListener('load',  function () { getDominantHue(card.img, function (h) { card.hue = h; trySort(); }); });
          card.img.addEventListener('error', function () { trySort(); });
          grid.appendChild(card.div); /* show immediately while loading */
        }
      });
    }

    /* Close modal on button click, backdrop click, or Escape key */
    if (modalClose) modalClose.addEventListener('click', function () { modal && modal.classList.remove('open'); });
    if (modal)      modal.addEventListener('click',      function (e) { if (e.target === modal) modal.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal) modal.classList.remove('open'); });
  })();

})();
