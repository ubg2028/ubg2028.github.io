/* ============================================================
   KawaiiPlay — shared site script (one file, cached everywhere)
   Handles: theme toggle, sidebar, search, load-more, hover
   videos, favorites, recently-played, play streak, session
   timer, star ratings, and the featured-game iframe player.
   Pure vanilla JS + localStorage — no build step required.
   ============================================================ */
(function () {
  'use strict';

  var LS = {
    theme: 'kp_theme',
    favorites: 'kp_favorites',
    recent: 'kp_recent',
    streak: 'kp_streak',
    ratings: 'kp_ratings'
  };

  function safeGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  /* Keeps header dropdown popups (streak/favorites) fully on-screen on any
     width — anchors below the button and clamps horizontally so it never
     gets cut off, regardless of how the navbar wraps on small screens. */
  function positionDropdown(btn, panel) {
    if (!btn || !panel) return;
    var margin = 10;
    var rect = btn.getBoundingClientRect();
    var panelWidth = Math.min(panel.offsetWidth || 280, window.innerWidth - margin * 2);
    var left = rect.right - panelWidth;
    left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin));
    panel.style.position = 'fixed';
    panel.style.left = left + 'px';
    panel.style.right = 'auto';
    panel.style.top = (rect.bottom + margin) + 'px';
    panel.style.width = panelWidth + 'px';
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initSidebar();
    initSearch();
    initSearchToggle();
    initLoadMore();
    initHoverVideos();
    initBackToGame();
    initFeaturedPlayer();
    initFavorites();
    initRecentlyPlayed();
    initStreak();
    initRatings();
  });

  /* ---------------- Theme ---------------- */
  function initTheme() {
    var btn = document.getElementById('themeToggleBtn');
    var sun = document.getElementById('sunIcon');
    var moon = document.getElementById('moonIcon');
    var text = document.getElementById('themeText');

    function apply(isDark) {
      document.documentElement.classList.toggle('dark', isDark);
      if (sun) sun.classList.toggle('hidden', !isDark);
      if (moon) moon.classList.toggle('hidden', isDark);
      if (text) text.textContent = isDark ? 'Dark Mode' : 'Light Mode';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
    if (btn) {
      btn.addEventListener('click', function () {
        apply(!document.documentElement.classList.contains('dark'));
      });
    }
  }

  /* ---------------- Sidebar ---------------- */
  function initSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('menuOverlay');
    var openBtn = document.getElementById('openMenuBtn');
    var closeBtn = document.getElementById('closeMenuBtn');

    function close() {
      sidebar && sidebar.classList.remove('open');
      overlay && overlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
    if (openBtn) {
      openBtn.addEventListener('click', function () {
        overlay && overlay.classList.remove('hidden');
        sidebar && sidebar.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }
    closeBtn && closeBtn.addEventListener('click', close);
    overlay && overlay.addEventListener('click', close);
  }

  /* ---------------- Live search ---------------- */
  function initSearch() {
    var input = document.getElementById('siteSearch');
    if (!input) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
    var emptyMsg = document.getElementById('searchEmpty');
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var cat = (card.getAttribute('data-category') || '').toLowerCase();
        var match = !q || title.indexOf(q) !== -1 || cat.indexOf(q) !== -1;
        card.classList.toggle('card-hidden', !match);
        if (match) visible++;
      });
      if (emptyMsg) emptyMsg.style.display = visible === 0 ? 'block' : 'none';
      var loadMoreBtn = document.querySelector('.btn-loadmore');
      if (loadMoreBtn) loadMoreBtn.style.display = q ? 'none' : '';
    });
  }

  /* ---------------- Mobile search toggle (icon opens a search row below) ---------------- */
  function initSearchToggle() {
    var btn = document.getElementById('searchToggleBtn');
    var wrapper = document.getElementById('searchWrapper');
    var input = document.getElementById('siteSearch');
    if (!btn || !wrapper) return;
    btn.addEventListener('click', function () {
      var isOpen = wrapper.classList.toggle('mobile-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen && input) {
        setTimeout(function () { input.focus(); }, 50);
      }
    });
  }

  /* ---------------- Load more (progressive reveal) ---------------- */
  function initLoadMore() {
    document.querySelectorAll('.btn-loadmore').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-target');
        var grid = targetId ? document.getElementById(targetId) : btn.closest('.games-section').querySelector('.games-grid');
        if (!grid) return;
        var hidden = grid.querySelectorAll('.card-hidden');
        var batch = Array.prototype.slice.call(hidden, 0, 12);
        batch.forEach(function (el) { el.classList.remove('card-hidden'); });
        if (grid.querySelectorAll('.card-hidden').length === 0) {
          btn.style.display = 'none';
        }
      });
    });
  }

  /* ---------------- Hover-to-preview videos ---------------- */
  function initHoverVideos() {
    document.querySelectorAll('.game-card').forEach(function (card) {
      var video = card.querySelector('.hover-video');
      if (!video) return;
      card.addEventListener('mouseenter', function () {
        if (!video.src && video.dataset.src) video.src = video.dataset.src;
        video.play().catch(function () {});
      });
      card.addEventListener('mouseleave', function () {
        video.pause();
        video.currentTime = 0;
      });
    });
  }

  /* ---------------- Back-to-game floating button ---------------- */
  function initBackToGame() {
    var backBtn = document.getElementById('backToGameBtn');
    var container = document.getElementById('gameScreenContainer');
    if (!backBtn) return;
    window.addEventListener('scroll', function () {
      backBtn.classList.toggle('hidden-floating', window.scrollY <= 350);
    }, { passive: true });
    backBtn.addEventListener('click', function () {
      container ? container.scrollIntoView({ behavior: 'smooth', block: 'center' }) : window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Featured / hero iframe player ---------------- */
  function initFeaturedPlayer() {
    var cover = document.getElementById('gameCoverOverlay');
    var iframe = document.getElementById('gameIframe');
    var fullscreenBtn = document.getElementById('fullscreenBtn');
    var container = document.getElementById('gameScreenContainer');

    function startGame() {
      if (iframe && !iframe.src && iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
        iframe.classList.remove('hidden');
        cover && cover.classList.add('hidden');
        startSessionTimer();
        recordRecentlyPlayed();
      }
    }
    cover && cover.addEventListener('click', startGame);
    fullscreenBtn && fullscreenBtn.addEventListener('click', function () {
      startGame();
      if (!document.fullscreenElement) {
        container && container.requestFullscreen && container.requestFullscreen().catch(function () {});
      } else {
        document.exitFullscreen();
      }
    });
  }

  /* ---------------- Session play timer (dwell-time widget) ---------------- */
  function startSessionTimer() {
    var el = document.getElementById('sessionTimer');
    if (!el || el.dataset.running) return;
    el.dataset.running = '1';
    var seconds = 0;
    setInterval(function () {
      seconds++;
      var m = Math.floor(seconds / 60).toString().padStart(2, '0');
      var s = (seconds % 60).toString().padStart(2, '0');
      el.textContent = '⏱️ Playing: ' + m + ':' + s;
    }, 1000);
  }

  /* ---------------- Favorites (heart button, localStorage) ---------------- */
  function getFavorites() { return safeGet(LS.favorites, []); }
  function isFavorite(slug) { return getFavorites().some(function (f) { return f.slug === slug; }); }

  function toggleFavorite(data, sourceEl) {
    var list = getFavorites();
    var idx = list.findIndex(function (f) { return f.slug === data.slug; });
    var wasAdded = idx === -1;
    if (wasAdded) list.unshift(data); else list.splice(idx, 1);
    safeSet(LS.favorites, list.slice(0, 60));
    refreshFavoriteButtons();
    renderFavoritesRow();
    renderHeaderFavPanel();
    if (wasAdded && sourceEl) flyToHeaderFav(sourceEl);
  }

  function refreshFavoriteButtons() {
    document.querySelectorAll('[data-fav-toggle]').forEach(function (btn) {
      var slug = btn.getAttribute('data-slug');
      var fav = isFavorite(slug);
      btn.classList.toggle('is-favorite', fav);
      if (btn.hasAttribute('data-fav-label')) {
        btn.innerHTML = (fav ? '💗 Saved' : '🤍 Save Game');
      } else {
        btn.textContent = fav ? '💗' : '🤍';
      }
    });
  }

  /* Flies a heart emoji from the clicked save button to the header favorites icon */
  function flyToHeaderFav(sourceEl) {
    var target = document.getElementById('headerFavBtn');
    if (!target || !sourceEl) return;
    var from = sourceEl.getBoundingClientRect();
    var to = target.getBoundingClientRect();

    var flyer = document.createElement('span');
    flyer.className = 'fav-fly-emoji';
    flyer.textContent = '💗';
    flyer.style.left = (from.left + from.width / 2 - 12) + 'px';
    flyer.style.top = (from.top + from.height / 2 - 12) + 'px';
    flyer.style.transform = 'translate(0, 0) scale(1)';
    flyer.style.opacity = '1';
    document.body.appendChild(flyer);

    requestAnimationFrame(function () {
      var dx = (to.left + to.width / 2 - 12) - (from.left + from.width / 2 - 12);
      var dy = (to.top + to.height / 2 - 12) - (from.top + from.height / 2 - 12);
      flyer.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(0.35)';
      flyer.style.opacity = '0.15';
    });

    setTimeout(function () {
      flyer.remove();
      target.classList.add('fav-bump');
      setTimeout(function () { target.classList.remove('fav-bump'); }, 400);
    }, 620);
  }

  function initFavorites() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-fav-toggle]');
      if (!btn) return;
      e.preventDefault();
      toggleFavorite({
        slug: btn.getAttribute('data-slug'),
        title: btn.getAttribute('data-title'),
        thumbnail: btn.getAttribute('data-thumbnail'),
        category: btn.getAttribute('data-category') || ''
      }, btn);
    });
    refreshFavoriteButtons();
    renderFavoritesRow();
    initHeaderFavPanel();
  }

  function renderFavoritesRow() {
    var row = document.getElementById('favoritesRow');
    var empty = document.getElementById('favoritesEmpty');
    if (!row) return;
    var list = getFavorites();
    row.innerHTML = list.map(chipHtml).join('');
    if (empty) empty.style.display = list.length ? 'none' : 'block';
  }

  /* ---------------- Header favorites icon + dropdown popup ---------------- */
  function renderHeaderFavPanel() {
    var icon = document.getElementById('headerFavIcon');
    var countBadge = document.getElementById('headerFavCount');
    var list = document.getElementById('favPanelList');
    var empty = document.getElementById('favPanelEmpty');
    if (!icon || !list || !empty || !countBadge) return;

    var favs = getFavorites();
    icon.textContent = favs.length ? '💗' : '🤍';
    countBadge.textContent = String(favs.length);
    countBadge.classList.toggle('hidden', favs.length === 0);

    empty.style.display = favs.length ? 'none' : 'block';
    list.innerHTML = favs.slice(0, 6).map(function (g) {
      var img = g.thumbnail ? '<img class="fav-panel-thumb" src="' + g.thumbnail + '" alt="' + g.title + '" loading="lazy" decoding="async" width="44" height="44">' : '<div class="fav-panel-thumb"></div>';
      return '<a class="fav-panel-item" href="/games/' + g.slug + '/">' + img + '<span class="fav-panel-item-title">' + g.title + '</span></a>';
    }).join('');
  }

  function initHeaderFavPanel() {
    var btn = document.getElementById('headerFavBtn');
    var panel = document.getElementById('favPanel');
    if (!btn || !panel) return;
    renderHeaderFavPanel();

    function closePanel() {
      panel.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isHidden = panel.classList.contains('hidden');
      if (isHidden) positionDropdown(btn, panel);
      panel.classList.toggle('hidden', !isHidden);
      btn.setAttribute('aria-expanded', String(isHidden));
    });
    window.addEventListener('resize', function () {
      if (!panel.classList.contains('hidden')) positionDropdown(btn, panel);
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== btn) closePanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });
  }

  /* ---------------- Recently played ---------------- */
  function recordRecentlyPlayed() {
    var card = document.querySelector('[data-current-game]');
    if (!card) return;
    var entry = {
      slug: card.getAttribute('data-slug'),
      title: card.getAttribute('data-title'),
      thumbnail: card.getAttribute('data-thumbnail'),
      category: card.getAttribute('data-category') || ''
    };
    var list = safeGet(LS.recent, []).filter(function (g) { return g.slug !== entry.slug; });
    list.unshift(entry);
    safeSet(LS.recent, list.slice(0, 12));
  }

  function initRecentlyPlayed() {
    var row = document.getElementById('recentlyPlayedRow');
    var empty = document.getElementById('recentlyPlayedEmpty');
    if (!row) return;
    var list = safeGet(LS.recent, []);
    row.innerHTML = list.map(chipHtml).join('');
    if (empty) empty.style.display = list.length ? 'none' : 'block';
  }

  function chipHtml(g) {
    var img = g.thumbnail ? '<img class="chip-thumb" src="' + g.thumbnail + '" alt="' + g.title + '" loading="lazy" decoding="async" width="120" height="90">' : '<div class="chip-thumb"></div>';
    return '<a class="chip-card" href="/games/' + g.slug + '/">' + img + '<span class="chip-title">' + g.title + '</span></a>';
  }

  /* ---------------- Daily play streak ---------------- */
  function initStreak() {
    var btn = document.getElementById('streakBadge');
    var panel = document.getElementById('streakPanel');
    var panelCount = document.getElementById('streakPanelCount');
    var panelDays = document.getElementById('streakPanelDays');
    if (!btn) return;

    var today = new Date().toISOString().slice(0, 10);
    var data = safeGet(LS.streak, { last: null, count: 0, days: [] });
    if (!Array.isArray(data.days)) data.days = [];

    if (data.last !== today) {
      var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      data.count = data.last === yesterday ? data.count + 1 : 1;
      data.last = today;
      data.days.push(today);
      data.days = data.days.slice(-30); // keep last 30 days of history
      safeSet(LS.streak, data);
    }

    btn.textContent = '🔥 ' + data.count + '-day streak';

    if (!panel || !panelCount || !panelDays) return;
    panelCount.textContent = '🔥 ' + data.count + '-day streak';

    // Build a rolling 7-day view ending today.
    panelDays.innerHTML = '';
    var dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(Date.now() - i * 86400000);
      var iso = d.toISOString().slice(0, 10);
      var played = data.days.indexOf(iso) !== -1;
      var isToday = iso === today;
      var wrap = document.createElement('div');
      wrap.className = 'streak-day' + (played ? ' played' : '') + (isToday ? ' today' : '');
      var dot = document.createElement('span');
      dot.className = 'streak-day-dot';
      dot.textContent = played ? '🔥' : '·';
      var label = document.createElement('span');
      label.textContent = dayLabels[d.getDay()];
      wrap.appendChild(dot);
      wrap.appendChild(label);
      panelDays.appendChild(wrap);
    }

    function closePanel() {
      panel.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isHidden = panel.classList.contains('hidden');
      if (isHidden) positionDropdown(btn, panel);
      panel.classList.toggle('hidden', !isHidden);
      btn.setAttribute('aria-expanded', String(isHidden));
    });
    window.addEventListener('resize', function () {
      if (!panel.classList.contains('hidden')) positionDropdown(btn, panel);
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== btn) closePanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });
  }

  /* ---------------- Star ratings (local, per game) ---------------- */
  function initRatings() {
    document.querySelectorAll('.rating-stars').forEach(function (group) {
      var slug = group.getAttribute('data-slug');
      var label = group.parentElement ? group.parentElement.querySelector('.rating-label') : null;
      var ratings = safeGet(LS.ratings, {});
      var current = ratings[slug] || 0;
      paint(current);

      function paint(value) {
        group.querySelectorAll('.rating-star').forEach(function (star) {
          star.classList.toggle('filled', Number(star.getAttribute('data-value')) <= value);
        });
        if (label) label.textContent = value ? 'You rated this ' + value + '/5' : 'Tap to rate this game';
      }
      group.addEventListener('click', function (e) {
        var star = e.target.closest('.rating-star');
        if (!star) return;
        var value = Number(star.getAttribute('data-value'));
        ratings[slug] = value;
        safeSet(LS.ratings, ratings);
        paint(value);
      });
    });
  }
})();
