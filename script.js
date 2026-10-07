/* =========================================================
   RICARDO ALENCAR — LANDING PAGE
   ========================================================= */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Número do WhatsApp que recebe o formulário ---------- */
  const WHATSAPP_NUMBER = '5511999999999'; // DDI + DDD + número

  /* =======================================================
     HEADER — efeito vidro + menu mobile + link ativo
     ======================================================= */
  const header = $('#header');
  const onScrollHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
  addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  const burger = $('#burger');
  const nav = $('#nav');
  const closeMenu = () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('#nav a').forEach(a => a.addEventListener('click', closeMenu));

  const links = $$('[data-link]');
  const sectionIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle('is-active', l.dataset.link === e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['inicio', 'sobre', 'experiencia', 'diferencial', 'contato'].forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionIO.observe(el);
  });

  /* =======================================================
     HERO — entrada + parallax (scroll e mouse)
     ======================================================= */
  function initHero() {
    if (!hasGsap || reduceMotion) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__bg-img', { opacity: 0, duration: 1.8 }, 0)
      .from('.hero__mark img', { opacity: 0, scale: 1.1, duration: 2.2 }, 0.2)
      .from('.hero__title span', { opacity: 0, y: 50, duration: 1.3 }, 0.3)
      .from('.hero__photo img', { opacity: 0, scale: 1.06, filter: 'blur(16px)', duration: 1.7 }, 0.5)
      .from('.hero__content > *', { opacity: 0, y: 30, duration: 1, stagger: 0.15 }, 1);

    // Parallax com a rolagem
    const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('.hero__bg',          { yPercent: 28, ease: 'none', scrollTrigger: st });
    gsap.to('.hero__mark',        { yPercent: -24, ease: 'none', scrollTrigger: st });
    gsap.to('.hero__title',       { yPercent: -56, ease: 'none', scrollTrigger: st });
    gsap.to('.hero__photo-inner', { yPercent: 14, ease: 'none', scrollTrigger: st });
    gsap.to('.hero__content',     { yPercent: -40, opacity: 0.1, ease: 'none', scrollTrigger: st });
  }

  /* =======================================================
     REVEAL genérico
     ======================================================= */
  function initReveal() {
    if (!hasGsap || reduceMotion) return;
    $$('[data-reveal]').forEach(el => {
      gsap.from(el, {
        opacity: 0, y: 40, duration: 1, ease: 'power3.out',
        delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* =======================================================
     VÍDEO DA ESTÁTUA — só toca quando está visível
     ======================================================= */
  function initStatueVideo() {
    const video = $('.statue__video');
    if (!video) return;

    const saveData = navigator.connection && navigator.connection.saveData;
    if (reduceMotion || saveData) return; // mantém apenas o poster (imagem estática)

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const p = video.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { rootMargin: '200px 0px', threshold: 0.01 });
    io.observe(video);

    document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
  }

  /* =======================================================
     LINHA LUMINOSA (seção 2 → árvore da seção 3)
     O brilho acompanha a rolagem nos dois sentidos.
     ======================================================= */
  function initJourney() {
    const journey = $('#journey');
    const svg = $('#journeySvg');
    const base = $('#lineBase');
    const trail = $('#lineTrail');
    const comet = $('#lineComet');
    const head = $('#lineHead');
    const card = $('#aboutCard');
    const anchor = $('#treeAnchor');
    const stage = $('#treeStage');
    if (!journey || !svg || !card || !anchor) return;

    const state = { p: 0 };
    let len = 0;

    // posição de um elemento dentro do .journey (ignora transforms de animação)
    const offsetIn = (el, root) => {
      let x = 0, y = 0;
      while (el && el !== root) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
      return { x, y };
    };

    function build() {
      const W = journey.offsetWidth;
      const c = offsetIn(card, journey);
      const a = offsetIn(anchor, journey);

      const x1 = c.x + card.offsetWidth * 0.46;
      const y1 = c.y + card.offsetHeight;
      const x2 = a.x;
      const y2 = a.y;
      const H = Math.max(40, y2 - y1);
      const dx = x2 - x1;

      svg.style.top = y1 + 'px';
      svg.style.width = W + 'px';
      svg.style.height = H + 'px';
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

      // curva em "S" com leve sobra lateral, como no design
      const d = `M ${x1} 0 C ${x1} ${H * 0.4}, ${x2 + dx * 0.55} ${H * 0.5}, ${x2} ${H}`;
      [base, trail, comet].forEach(p => p.setAttribute('d', d));
      len = base.getTotalLength();

      render(state.p);
    }

    function render(p) {
      if (!len) return;
      const h = p * len;

      // rastro aceso até a posição atual
      trail.style.strokeDasharray = `${len} ${len}`;
      trail.style.strokeDashoffset = len - h;

      // "cometa" brilhante na ponta
      const seg = Math.min(h, Math.max(10, len * 0.03));
      comet.style.strokeDasharray = `${seg} ${len * 2}`;
      comet.style.strokeDashoffset = -(h - seg);

      const pt = base.getPointAtLength(h);
      head.setAttribute('cx', pt.x);
      head.setAttribute('cy', pt.y);

      const visible = p > 0.002 ? clamp((1 - p) / 0.05) : 0; // some ao chegar na árvore
      comet.style.opacity = visible;
      head.style.opacity = visible;

      // árvore acende no final do trajeto
      const t = clamp((p - 0.88) / 0.12);
      stage.style.setProperty('--g', (t * t * (3 - 2 * t)).toFixed(3));
    }

    if (hasGsap) {
      gsap.to(state, {
        p: 1, ease: 'none',
        onUpdate: () => render(state.p),
        scrollTrigger: {
          trigger: svg,
          start: 'top 30%',
          end: 'bottom 52%',
          scrub: reduceMotion ? true : 0.6
        }
      });
    } else {
      // fallback sem GSAP
      const onScroll = () => {
        const r = svg.getBoundingClientRect();
        const s = innerHeight * 0.72, e = innerHeight * 0.52;
        state.p = clamp((s - r.top) / (r.height + (s - e)) );
        render(state.p);
      };
      addEventListener('scroll', onScroll, { passive: true });
    }

    build();
    let raf;
    new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { build(); if (hasGsap) ScrollTrigger.refresh(); });
    }).observe(journey);
    addEventListener('load', () => { build(); if (hasGsap) ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  }

  /* =======================================================
     CARROSSEL DE AVALIAÇÕES
     ======================================================= */
  function initSlider() {
    const slider = $('#slider');
    if (!slider) return;
    const slides = $$('.review', slider);
    let i = 0, timer;

    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    };
    const start = () => { if (!reduceMotion) timer = setInterval(() => show(i + 1), 7000); };
    const stop = () => clearInterval(timer);

    $('.slider__btn--prev', slider).addEventListener('click', () => { stop(); show(i - 1); start(); });
    $('.slider__btn--next', slider).addEventListener('click', () => { stop(); show(i + 1); start(); });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    $$('.review__more', slider).forEach(btn => {
      btn.addEventListener('click', () => {
        const open = btn.closest('.review').classList.toggle('is-open');
        btn.textContent = open ? 'Mostrar menos' : 'Leia mais';
      });
    });
    start();
  }

  /* =======================================================
     FORMULÁRIO — máscara, validação e envio via WhatsApp
     ======================================================= */
  function initForm() {
    const form = $('#contactForm');
    if (!form) return;
    const status = $('#formStatus');
    const phone = $('#whatsapp');

    phone.addEventListener('input', () => {
      const d = phone.value.replace(/\D/g, '').slice(0, 11);
      let v = d;
      if (d.length > 10) v = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
      else if (d.length > 6) v = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
      else if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      else if (d.length > 0) v = `(${d}`;
      phone.value = v;
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;

      $$('.field', form).forEach(f => {
        const input = $('input, textarea', f);
        let valid = input.value.trim().length > 0;
        if (input.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        if (input.type === 'tel') valid = input.value.replace(/\D/g, '').length >= 10;
        f.classList.toggle('is-invalid', !valid);
        if (!valid) ok = false;
      });

      status.classList.toggle('is-error', !ok);
      if (!ok) { status.textContent = 'Por favor, preencha todos os campos corretamente.'; return; }

      const data = new FormData(form);
      const text =
        `Olá, Dr. Ricardo! Gostaria de agendar uma consultoria.%0A%0A` +
        `*Nome:* ${encodeURIComponent(data.get('nome'))}%0A` +
        `*WhatsApp:* ${encodeURIComponent(data.get('whatsapp'))}%0A` +
        `*E-mail:* ${encodeURIComponent(data.get('email'))}%0A` +
        `*Mensagem:* ${encodeURIComponent(data.get('mensagem'))}`;

      status.textContent = 'Abrindo o WhatsApp para finalizar o envio...';
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener');
      form.reset();
    });

    form.addEventListener('input', e => e.target.closest('.field')?.classList.remove('is-invalid'));
  }

  /* ---------- Rodapé ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Init ---------- */
  initHero();
  initReveal();
  initStatueVideo();
  initJourney();
  initSlider();
  initForm();
})();
