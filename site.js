/* Wish Genie site: animations and reading aids only. No network requests, no storage, no tracking.
   All text is in the HTML; if this file fails to load the pages read the same. */
(function () {
  var doc = document, root = doc.documentElement;
  root.classList.add('js');

  function start() {
    var still = window.matchMedia('(prefers-reduced-motion: reduce)');
    var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

    /* Reveal on scroll */
    var targets = doc.querySelectorAll('[data-reveal], .sentence, .row');
    each(doc.querySelectorAll('.sentence .chip'), function (chip, i) { chip.style.setProperty('--i', i); });
    if ('IntersectionObserver' in window && !still.matches) {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('in'); seen.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
      each(targets, function (el) { seen.observe(el); });
    } else {
      each(targets, function (el) { el.classList.add('in'); });
    }

    /* Top links: on a narrow screen they scroll inside the pill. Start at the current page, fade the cut edge. */
    var strip = doc.querySelector('.nav-links');
    if (strip) {
      var here = strip.querySelector('[aria-current]');
      if (here) { strip.scrollLeft = Math.max(0, here.offsetLeft - strip.offsetLeft - 24); }
      var edge = function () {
        strip.classList.toggle('less', strip.scrollLeft > 2);
        strip.classList.toggle('more', strip.scrollWidth - strip.clientWidth - strip.scrollLeft > 2);
      };
      strip.addEventListener('scroll', edge, { passive: true });
      window.addEventListener('resize', edge);
      edge();
    }

    /* Contents list: closed on small screens, follows the section being read */
    var toc = doc.querySelector('.toc');
    var links = toc ? toc.querySelectorAll('a[href^="#"]') : [];
    var heads = [];
    each(links, function (a) {
      var h = doc.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
      if (h) { heads.push({ a: a, h: h }); }
    });
    var narrow = window.matchMedia('(max-width: 959px)');
    var fold = toc && toc.querySelector('details');
    if (fold) {
      var sync = function () { fold.open = !narrow.matches; };
      sync();
      if (narrow.addEventListener) { narrow.addEventListener('change', sync); }
      toc.addEventListener('click', function (e) {
        if (narrow.matches && e.target.closest && e.target.closest('a')) { fold.open = false; }
      });
    }

    var bar = null;
    if (toc && !still.matches) {
      bar = doc.createElement('div');
      bar.className = 'progress';
      bar.setAttribute('aria-hidden', 'true');
      doc.body.appendChild(bar);
    }

    var heroBg = doc.querySelector('.hero-bg');
    var heroCopy = doc.querySelector('.hero-copy');
    var heroPhone = doc.querySelector('.hero-phone');
    var skyBg = doc.querySelector('.sky-bg');
    var current = null, queued = false;

    function frame() {
      queued = false;
      var y = window.pageYOffset || 0, vh = window.innerHeight;
      root.classList.toggle('scrolled', y > 24);

      if (!still.matches) {
        if (heroBg && y < vh * 1.3) {
          heroBg.style.transform = 'translate3d(0,' + (y * 0.2).toFixed(1) + 'px,0)';
          heroCopy.style.transform = 'translate3d(0,' + (y * -0.1).toFixed(1) + 'px,0)';
          heroCopy.style.opacity = Math.max(0, 1 - y / (vh * 0.7)).toFixed(3);
          heroPhone.style.transform = 'translate3d(0,' + (y * -0.16).toFixed(1) + 'px,0)';
        }
        if (skyBg) {
          var r = skyBg.parentNode.getBoundingClientRect();
          if (r.bottom > 0 && r.top < vh) {
            skyBg.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -0.1).toFixed(1) + 'px,0)';
          }
        }
        if (bar) {
          var max = root.scrollHeight - vh;
          bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
        }
      }

      if (heads.length) {
        var now = heads[0];
        for (var i = 0; i < heads.length; i++) {
          if (heads[i].h.getBoundingClientRect().top < 150) { now = heads[i]; } else { break; }
        }
        if (now !== current) {
          if (current) { current.a.classList.remove('on'); current.a.removeAttribute('aria-current'); }
          now.a.classList.add('on');
          now.a.setAttribute('aria-current', 'true');
          current = now;
          if (!narrow.matches) {
            var top = now.a.offsetTop, view = toc.clientHeight;
            if (top < toc.scrollTop + 40 || top > toc.scrollTop + view - 60) { toc.scrollTop = top - view / 2; }
          }
        }
      }
    }

    function queue() { if (!queued) { queued = true; window.requestAnimationFrame(frame); } }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    frame();
  }

  function safeStart() {
    try { start(); } catch (err) { root.classList.remove('js'); }
  }
  if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', safeStart); } else { safeStart(); }
})();
