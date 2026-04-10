/* ============================================================
   HARVVEST Stock Market Institute — main.js
   All interactivity: cursor, navbar, candlestick, stats,
   scroll animations, mobile drawer, form submission
   ============================================================ */

(function () {
  'use strict';

  /* ─── Custom Cursor ─────────────────────────────────────── */
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursorTrail');
  let mx = -100, my = -100, tx = -100, ty = -100;

  if (cursor && trail && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });
    function animateTrail() {
      tx += (mx - tx) * 0.14;
      ty += (my - ty) * 0.14;
      trail.style.left = tx + 'px';
      trail.style.top  = ty + 'px';
      requestAnimationFrame(animateTrail);
    }
    animateTrail();
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(2)';
        cursor.style.background = 'rgba(0,255,106,0.5)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.background = '#00FF6A';
      });
    });
  } else if (cursor) {
    cursor.style.display = 'none';
    if (trail) trail.style.display = 'none';
  }

  /* ─── Navbar scroll effect ──────────────────────────────── */
  const navbar   = document.getElementById('navbar');
  const tickerH  = document.getElementById('tickerBar')?.offsetHeight || 36;

  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }
  }, { passive: true });

  /* ─── Hamburger / Mobile Drawer ─────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('mobileDrawer');
  const overlay   = document.getElementById('drawerOverlay');
  const closeBtn  = document.getElementById('drawerClose');

  function openDrawer() {
    drawer?.classList.add('open');
    overlay?.classList.add('open');
    hamburger?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);
  document.querySelectorAll('.drawer-link').forEach(l => l.addEventListener('click', closeDrawer));

  /* ─── Intersection Observer: section fade-in ────────────── */
  const fadeEls = document.querySelectorAll('.section-fade');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings a bit
        const delay = (entry.target.dataset.delay || 0) * 100;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Stagger children in grids
  document.querySelectorAll('.features-grid, .faculty-grid, .testimonials-grid, .courses-grid, .power-grid').forEach(grid => {
    [...grid.querySelectorAll('.section-fade')].forEach((el, i) => {
      el.dataset.delay = i;
    });
  });

  fadeEls.forEach(el => fadeObserver.observe(el));

  /* ─── Stats Counter ─────────────────────────────────────── */
  const statNums = document.querySelectorAll('.stat-number');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => statObserver.observe(el));

  function animateCount(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const dur     = 1800;
    const start   = performance.now();
    function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(eased * target);
      el.textContent = val + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ─── Candlestick Chart ─────────────────────────────────── */
  const canvas = document.getElementById('candlestickCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.offsetWidth  || 480;
    const H   = canvas.offsetHeight || 320;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // Candle data: [open, close, low, high]
    const candles = [
      [60, 80,  50, 90],
      [78, 70,  60, 85],
      [70, 95,  65, 100],
      [93, 88,  80, 100],
      [88, 105, 82, 110],
      [103,98,  90, 112],
      [97, 118, 92, 122],
      [115,112, 102,124],
      [110,130, 104,135],
      [128,122, 115,136],
      [121,142, 116,148],
      [140,155, 134,160],
      [153,148, 140,162],
      [146,168, 142,174],
      [165,180, 158,185],
    ];

    const totalCandles = candles.length;
    let drawn = 0;
    const PAD = { l: 20, r: 20, t: 24, b: 32 };
    const chartW = W - PAD.l - PAD.r;
    const chartH = H - PAD.t - PAD.b;

    const allVals  = candles.flat();
    const minVal   = Math.min(...allVals);
    const maxVal   = Math.max(...allVals);
    const range    = maxVal - minVal || 1;

    function yPos(v) { return PAD.t + chartH - ((v - minVal) / range) * chartH; }

    const candleW  = (chartW / totalCandles) * 0.55;
    const spacing  = chartW / totalCandles;

    function drawGrid() {
      ctx.strokeStyle = 'rgba(0,255,106,0.06)';
      ctx.lineWidth   = 1;
      for (let i = 0; i <= 4; i++) {
        const y = PAD.t + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(PAD.l, y);
        ctx.lineTo(W - PAD.r, y);
        ctx.stroke();
        // Value label
        const v = maxVal - (range / 4) * i;
        ctx.fillStyle = 'rgba(136,136,136,0.6)';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(Math.round(v), W - PAD.r + 2, y + 4);
      }
    }

    function drawCandle(i, progress) {
      const [open, close, low, high] = candles[i];
      const isGreen = close >= open;
      const x = PAD.l + i * spacing + spacing / 2;
      const op = progress;

      ctx.globalAlpha = op;
      const color = isGreen ? '#00FF6A' : '#FF4444';

      // Wick
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1.5;
      ctx.moveTo(x, yPos(high));
      ctx.lineTo(x, yPos(low));
      ctx.stroke();

      // Body
      const bodyTop = yPos(Math.max(open, close));
      const bodyBot = yPos(Math.min(open, close));
      const bodyH   = Math.max(bodyBot - bodyTop, 2);
      ctx.fillStyle  = color;
      if (isGreen) {
        ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth   = 1.5;
        ctx.strokeRect(x - candleW / 2, bodyTop, candleW, bodyH);
      }

      // Glow for green candles
      if (isGreen) {
        ctx.shadowColor  = '#00FF6A';
        ctx.shadowBlur   = 8;
        ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
        ctx.shadowBlur   = 0;
      }

      ctx.globalAlpha = 1;
    }

    let start;
    const perCandle = 120; // ms per candle reveal

    function render(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const idx = Math.min(Math.floor(elapsed / perCandle), totalCandles - 1);
      const frac = Math.min((elapsed % perCandle) / perCandle, 1);

      ctx.clearRect(0, 0, W, H);
      drawGrid();

      for (let i = 0; i <= idx; i++) {
        const progress = (i < idx) ? 1 : frac;
        drawCandle(i, progress);
      }

      if (idx < totalCandles - 1 || frac < 1) {
        requestAnimationFrame(render);
      }
    }

    // Start after short delay
    setTimeout(() => requestAnimationFrame(render), 600);
  }

  /* ─── Enquiry Form (Netlify) ────────────────────────────── */
  const form    = document.getElementById('enquiryForm');
  const success = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      try {
        const res = await fetch('/__forms.html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString(),
        });
        if (res.ok) {
          form.reset();
          if (success) {
            success.classList.add('show');
            setTimeout(() => success.classList.remove('show'), 6000);
          }
          submitBtn.textContent = 'Send Enquiry';
          submitBtn.disabled = false;
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (err) {
        // Fallback: open WhatsApp
        window.open('https://wa.me/919998288268?text=Hi%20Harvvest!%20I%20have%20an%20enquiry.', '_blank');
        submitBtn.textContent = 'Send Enquiry';
        submitBtn.disabled = false;
      }
    });
  }

  /* ─── Mobile sticky CTA: show after scroll ──────────────── */
  const mobileCta = document.getElementById('mobileCta');
  if (mobileCta && window.innerWidth <= 768) {
    window.addEventListener('scroll', () => {
      mobileCta.style.display = window.scrollY > 200 ? 'block' : 'none';
    }, { passive: true });
    mobileCta.style.display = 'none';
  }

  /* ─── Power banner stagger ──────────────────────────────── */
  document.querySelectorAll('.power-claim').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.15) + 's';
  });

})();
