/* Frank Githui — portfolio interactions
   Vanilla, no dependencies. Every effect degrades safely and
   is disabled when the user prefers reduced motion. */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- scroll progress bar ---------- */

  function initProgress() {
    var bar = document.querySelector('.progress');
    if (!bar) return;
    var ticking = false;

    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? window.scrollY / h : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- nav border on scroll ---------- */

  function initNav() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var ticking = false;

    function update() {
      nav.classList.toggle('scrolled', window.scrollY > 12);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- scroll reveal ---------- */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    items.forEach(function (el, i) {
      // stagger items that share a parent, capped so nothing waits long
      var sibs = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--d', Math.min(sibs, 6) * 70 + 'ms');
      io.observe(el);
    });
  }

  /* ---------- card cursor spotlight ---------- */

  function initSpotlight() {
    if (reduced) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- project filtering ---------- */

  function initFilters() {
    var filters = document.querySelectorAll('.filter');
    var cards = document.querySelectorAll('[data-categories]');
    var count = document.querySelector('[data-count]');
    if (!filters.length) return;

    function apply(cat, animate) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = cat === 'all' ||
                    card.dataset.categories.split(' ').indexOf(cat) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) {
          shown++;
          if (animate && !reduced) {
            card.classList.remove('filtering');
            void card.offsetWidth;          // restart the animation
            card.classList.add('filtering');
          }
        }
      });
      if (count) count.textContent = shown + (shown === 1 ? ' project' : ' projects');
    }

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        apply(btn.dataset.filter, true);
      });
    });

    apply('all', false);
  }

  /* ---------- hero terminal typing ---------- */

  var SCRIPT = [
    { t: 'cmd', text: 'whoami' },
    { t: 'out', text: 'frank_githui — security analyst, msc student' },
    { t: 'cmd', text: 'cat ./what_i_do.txt' },
    { t: 'out', text: 'breaking things · cryptography · privacy' },
    { t: 'cmd', text: './find_key --from-power --traces 500' },
    { t: 'ok',  text: '[+] AES key found' }
  ];

  function initTerminal() {
    var body = document.querySelector('.terminal-body');
    if (!body) return;

    // Reduced motion: render the finished transcript, no animation.
    if (reduced) {
      body.innerHTML = SCRIPT.map(function (l) {
        return l.t === 'cmd'
          ? '<div><span class="ps1">$</span> <span class="cmd">' + l.text + '</span></div>'
          : '<div class="' + l.t + '">' + l.text + '</div>';
      }).join('');
      return;
    }

    var li = 0;

    function nextLine() {
      if (li >= SCRIPT.length) {
        var done = document.createElement('span');
        done.className = 'caret';
        body.appendChild(done);
        return;
      }
      var line = SCRIPT[li++];
      var row = document.createElement('div');

      if (line.t === 'cmd') {
        row.innerHTML = '<span class="ps1">$</span> <span class="cmd"></span>';
        body.appendChild(row);
        typeInto(row.querySelector('.cmd'), line.text, function () {
          setTimeout(nextLine, 260);
        });
      } else {
        row.className = line.t;
        row.textContent = line.text;
        row.style.opacity = '0';
        row.style.transition = 'opacity .3s ease';
        body.appendChild(row);
        requestAnimationFrame(function () { row.style.opacity = '1'; });
        setTimeout(nextLine, 420);
      }
    }

    function typeInto(el, text, done) {
      var i = 0;
      var caret = document.createElement('span');
      caret.className = 'caret';
      el.parentNode.appendChild(caret);

      (function step() {
        if (i >= text.length) {
          caret.remove();
          done();
          return;
        }
        el.textContent += text.charAt(i++);
        setTimeout(step, 26 + Math.random() * 34);
      })();
    }

    setTimeout(nextLine, 500);
  }

  /* ---------- init ---------- */

  function boot() {
    initProgress();
    initNav();
    initReveal();
    initSpotlight();
    initFilters();
    initTerminal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
