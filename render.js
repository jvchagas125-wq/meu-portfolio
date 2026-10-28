// render.js — transforma os dados (banco ou padrão) em HTML e liga o carrossel.
// Todo texto passa por esc() antes de entrar na página.

const CORES = ['blue', 'purple', 'green', 'amber', 'rose'];

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// **negrito** dentro de um texto já escapado
export const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

// "linha 1|linha 2" vira quebra de linha
export const br = (s) => esc(s).replace(/\s*\|\s*/g, '<br>');

// Só aceita http(s), mailto, tel e caminhos relativos (bloqueia javascript: etc.)
export function safeUrl(u) {
  const s = String(u ?? '').trim();
  if (!s) return '';
  if (/^(https?:|mailto:|tel:)/i.test(s)) return s;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return '';
  return s;
}

export const isVideo = (u) => /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(u || '') || /\/video\/upload\//.test(u || '');
const cor = (c) => (CORES.includes(c) ? c : 'blue');
const safeColor = (c) => (/^#[0-9a-f]{3,8}$/i.test(String(c || '')) ? c : '');
const arr = (a) => (Array.isArray(a) ? a : []);
const ext = (u) => /^https?:/i.test(u);
const $ = (sel) => document.querySelector(sel);
const put = (sel, html) => {
  const el = $(sel);
  if (el) el.innerHTML = html;
};

const head = (s = {}) =>
  `<p class="section-eyebrow">${esc(s.eyebrow)}</p><h2 class="section-title">${esc(s.titulo)}${
    s.destaque ? ` <span class="accent">${esc(s.destaque)}</span>` : ''
  }</h2>`;

/* ---------------------------------------------------------------- INÍCIO */
function heroHTML(h = {}) {
  const foto = safeUrl(h.foto);
  return `
  <div class="hero-grid">
    <div>
      <p class="hero-tag">${esc(h.tag)}</p>
      <h1 class="hero-name">${esc(h.nome)}<span class="accent">.</span></h1>
      <p class="hero-role">${esc(h.cargo)}</p>
      <p class="hero-desc">${inline(h.descricao)}</p>
      <div class="hero-ctas">
        <a href="#projetos" class="btn-primary">${esc(h.btn1)}</a>
        <a href="#contato" class="btn-secondary">${esc(h.btn2)}</a>
      </div>
    </div>
    <div class="hero-photo">
      <div class="photo-frame">
        <div class="photo-placeholder" style="padding:0;overflow:hidden;">
          ${foto ? `<img src="${esc(foto)}" alt="${esc(h.nome)}" style="width:100%;height:100%;object-fit:cover;object-position:top center;display:block;"/>` : `<div class="photo-icon">👤</div>`}
        </div>
        <div class="photo-corner tl"></div><div class="photo-corner br"></div>
        ${h.badgeNum || h.badgeLabel ? `<div class="photo-badge"><div class="photo-badge-text">${esc(h.badgeLabel)}</div><div class="photo-badge-num">${esc(h.badgeNum)}</div></div>` : ''}
      </div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------ QUEM SOU EU */
function paragrafos(texto) {
  return String(texto || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p class="sobre-text">${inline(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function sobreHTML(s = {}) {
  const flags = arr(s.flags).map((f) => `<div class="skill-item"><div class="skill-dot"></div>${esc(f)}</div>`).join('');
  const stats = arr(s.stats)
    .map((x) => `<div class="stat-card"><div class="stat-num">${esc(x.num)}</div><div class="stat-label">${esc(x.label)}</div></div>`)
    .join('');
  return `${head(s)}
  <div class="sobre-grid">
    <div class="reveal">${paragrafos(s.texto)}${flags ? `<div class="skills-grid">${flags}</div>` : ''}</div>
    ${stats ? `<div class="stats-block reveal">${stats}</div>` : ''}
  </div>`;
}

/* ------------------------------------------------------------ EXPERIÊNCIA */
function experienciaHTML(sec, items) {
  const cards = arr(items)
    .map((it) => {
      const tags = arr(it.tags).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
      return `
      <div class="timeline-item${it.badge ? ' active' : ''} reveal" data-c="${cor(it.cor)}">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <p class="timeline-company">${esc(it.empresa)}</p>
          <h3 class="timeline-role">${esc(it.cargo)}</h3>
          <div class="timeline-period"><span>${esc(it.periodo)}</span>${it.badge ? `<span class="active-badge">${esc(it.badge)}</span>` : ''}</div>
          <p class="timeline-desc">${inline(it.descricao).replace(/\n/g, '<br>')}</p>
          ${tags ? `<div class="timeline-tags">${tags}</div>` : ''}
        </div>
      </div>`;
    })
    .join('');
  return `${head(sec)}<div class="timeline">${cards}</div>`;
}

/* -------------------------------------------------------------- CARROSSEL */
function mediaHTML(it, kind) {
  const u = safeUrl(it.midia);
  const bg = safeColor(it.fundo);
  let inner;
  if (u) {
    inner = isVideo(u)
      ? `<video src="${esc(u)}" muted loop playsinline preload="metadata"></video>`
      : `<img src="${esc(u)}" alt="${esc(it.titulo)}" loading="lazy" decoding="async"/>`;
  } else {
    inner = `<span class="cx-emoji" aria-hidden="true">${esc(it.icone || (kind === 'curso' ? '🎓' : '🌐'))}</span>`;
  }
  return `<div class="cx-media${it.ajuste === 'contain' && u ? ' is-contain' : ''}"${bg ? ` style="--mbg:${bg}"` : ''}>${inner}</div>`;
}

function cardHTML(it, kind) {
  const cert = safeUrl(it.linkCertificado);
  const site = safeUrl(it.linkSite);
  const git = safeUrl(it.linkGithub);
  const flags = arr(it.flags).map((f) => `<span class="tag">${esc(f)}</span>`).join('');
  const a = (href, cls, txt) => `<a class="cx-btn ${cls}" href="${esc(href)}"${ext(href) ? ' target="_blank" rel="noopener"' : ''}>${txt}</a>`;
  const links = [
    cert ? a(cert, '', '🎓 Ver certificado') : '',
    site ? a(site, 'main', '↗ Ver site') : '',
    git ? a(git, '', '⌥ Código no GitHub') : '',
    it.painelAdmin ? '<span class="projeto-badge-admin">⚙ Painel admin incluído</span>' : ''
  ].join('');
  return `
  <article class="cx-card" data-c="${cor(it.cor)}">
    ${mediaHTML(it, kind)}
    <div class="cx-body">
      ${it.tipo ? `<p class="cx-type">${esc(it.tipo)}</p>` : ''}
      <h3 class="cx-title">${esc(it.titulo)}</h3>
      ${it.instituicao ? `<p class="cx-sub">${esc(it.instituicao)}</p>` : ''}
      ${it.descricao ? `<p class="cx-desc">${esc(it.descricao).replace(/\n/g, '<br>')}</p>` : ''}
      ${flags ? `<div class="cx-flags">${flags}</div>` : ''}
      ${it.status ? `<p class="cx-status">${esc(it.status)}</p>` : ''}
      ${links ? `<div class="cx-links">${links}</div>` : ''}
    </div>
  </article>`;
}

function carrosselHTML(kind, items, rotulo) {
  const list = arr(items);
  if (!list.length) return `<p class="cx-empty">Em breve por aqui.</p>`;
  const dots = list.map((_, i) => `<button class="cx-dot" type="button" aria-label="Ir para o item ${i + 1}"><i></i></button>`).join('');
  return `
  <div class="cx" tabindex="0" role="region" aria-roledescription="carrossel" aria-label="${esc(rotulo)}">
    <div class="cx-stage">${list.map((it) => cardHTML(it, kind)).join('')}</div>
    ${list.length > 1 ? `<button class="cx-nav prev" type="button" aria-label="Anterior">‹</button><button class="cx-nav next" type="button" aria-label="Próximo">›</button>` : ''}
    ${list.length > 1 ? `<div class="cx-dots">${dots}</div>` : ''}
  </div>`;
}

const live = [];
export function destroyCarousels() {
  while (live.length) live.pop()();
}

const media = (q) => (typeof matchMedia === 'function' ? matchMedia(q).matches : false);

function mountCarousel(el) {
  const cards = [...el.querySelectorAll('.cx-card')];
  const dots = [...el.querySelectorAll('.cx-dot')];
  const stage = el.querySelector('.cx-stage');
  const n = cards.length;
  let active = 0;
  let hovered = false;
  let focused = false;
  let visible = true;
  const prevO = cards.map(() => null);
  const reduce = media('(prefers-reduced-motion: reduce)');
  const canHover = media('(hover: hover)');

  const offsetOf = (i) => {
    if (n === 1) return 0;
    if (n === 2) return i === active ? 0 : i > active ? 1 : -1;
    const h = Math.floor(n / 2);
    return ((i - active + n + h) % n) - h;
  };

  function layout() {
    const step = (typeof innerWidth === 'number' && innerWidth < 700) ? 94 : 72;
    cards.forEach((c, i) => {
      const o = offsetOf(i);
      const abs = Math.abs(o);
      const jump = prevO[i] !== null && Math.abs(o - prevO[i]) > 1;
      if (jump) c.style.transition = 'none';
      c.style.transform = `translateX(${o * step}%) translateZ(${-abs * 90}px) rotateY(${-o * 9}deg) scale(${abs === 0 ? 1 : 0.88})`;
      c.style.opacity = abs === 0 ? '1' : abs === 1 ? '0.55' : '0';
      c.style.zIndex = String(10 - abs);
      c.style.pointerEvents = abs === 0 ? 'auto' : 'none';
      c.classList.toggle('is-active', abs === 0);
      c.setAttribute('aria-hidden', abs === 0 ? 'false' : 'true');
      c.inert = abs !== 0;
      if (jump) {
        void c.offsetWidth;
        c.style.transition = '';
      }
      prevO[i] = o;
      const v = c.querySelector('video');
      if (v) {
        if (abs === 0) v.play && v.play().catch(() => {});
        else v.pause && v.pause();
      }
    });
    dots.forEach((d) => d.classList.remove('on'));
    if (dots[active]) {
      void el.offsetWidth;
      dots[active].classList.add('on');
    }
  }

  const go = (i) => {
    active = (i + n) % n;
    layout();
  };
  const next = () => go(active + 1);
  const prev = () => go(active - 1);
  const sync = () => el.classList.toggle('paused', hovered || focused || !visible || document.hidden);

  el.querySelector('.cx-nav.next')?.addEventListener('click', next);
  el.querySelector('.cx-nav.prev')?.addEventListener('click', prev);
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // O avanço automático é guiado pela barrinha do ponto ativo: quando ela termina, passa para o próximo.
  el.querySelector('.cx-dots')?.addEventListener('animationend', (e) => {
    if (e.animationName === 'cxFill' && !reduce) next();
  });

  let sx = null;
  let sy = null;
  stage.addEventListener('pointerdown', (e) => {
    sx = e.clientX;
    sy = e.clientY;
  });
  stage.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) dx < 0 ? next() : prev();
  });
  stage.addEventListener('pointercancel', () => (sx = null));

  if (canHover) {
    el.addEventListener('mouseenter', () => ((hovered = true), sync()));
    el.addEventListener('mouseleave', () => ((hovered = false), sync()));
  }
  el.addEventListener('focusin', () => ((focused = true), sync()));
  el.addEventListener('focusout', () => ((focused = false), sync()));
  const onVis = () => sync();
  document.addEventListener('visibilitychange', onVis);

  let io = null;
  if (typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(([en]) => ((visible = en.isIntersecting), sync()), { threshold: 0.25 });
    io.observe(el);
  }
  let rt;
  const onResize = () => {
    clearTimeout(rt);
    rt = setTimeout(layout, 120);
  };
  addEventListener('resize', onResize);

  layout();
  live.push(() => {
    io && io.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    removeEventListener('resize', onResize);
    clearTimeout(rt);
  });
}

export function initCarousels() {
  document.querySelectorAll('.cx').forEach(mountCarousel);
}

/* ---------------------------------------------------------------- CONTATO */
function contatoHTML(c = {}) {
  const links = arr(c.links)
    .map((l) => {
      const u = safeUrl(l.url);
      return u ? `<a href="${esc(u)}"${ext(u) ? ' target="_blank" rel="noopener"' : ''} class="contato-link">${esc(l.icone)} ${esc(l.label)}</a>` : '';
    })
    .join('');
  return `
  <div class="contato-inner reveal">
    <h2 class="contato-title">${br(c.titulo)}<br><span style="color: var(--accent)">${esc(c.destaque)}</span></h2>
    <p class="contato-sub">${esc(c.subtitulo)}</p>
    ${c.btnServicos ? `<div style="display:flex;justify-content:center;margin-bottom:32px;"><a href="servicos.html" class="btn-primary">${esc(c.btnServicos)}</a></div>` : ''}
    <div class="contato-links">${links}</div>
  </div>`;
}

const rodapeHTML = (r = {}) => `<span class="footer-text">${esc(r.esquerda)}</span><span class="footer-text">${esc(r.direita)}</span>`;

/* --------------------------------------------------------------- REVELAR */
let revealIO = null;
export function setupReveal(selector) {
  if (revealIO) revealIO.disconnect();
  const els = [...document.querySelectorAll(selector)];
  if (typeof IntersectionObserver !== 'function') {
    els.forEach((e) => e.classList.add('visible'));
    return;
  }
  revealIO = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          revealIO.unobserve(en.target);
        }
      }),
    { threshold: 0.1 }
  );
  els.forEach((e) => revealIO.observe(e));
}

/* ------------------------------------------------------------- PORTFÓLIO */
export function renderHome(d) {
  destroyCarousels();
  put('#hero', heroHTML(d.hero));
  put('#sobre', sobreHTML(d.sobre));
  put('#experiencia', experienciaHTML(d.expSec, d.experiencias));
  put('#formacao', head(d.cursosSec) + carrosselHTML('curso', d.cursos, 'Cursos e certificações'));
  put('#projetos', head(d.projetosSec) + carrosselHTML('projeto', d.projetos, 'Projetos'));
  put('#contato', contatoHTML(d.contato));
  put('#rodape', rodapeHTML(d.rodape));
  initCarousels();
  setupReveal('.reveal');
  const nome = $('.hero-name');
  if (nome) {
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    nome.appendChild(cursor);
    setTimeout(() => cursor.remove(), 3500);
  }
}

/* -------------------------------------------------------------- SERVIÇOS */
function obsCorpo(itens) {
  const grupos = [{ label: null, itens: [] }];
  arr(itens).forEach((t) => {
    const s = String(t ?? '').trim();
    if (!s) return;
    if (s.startsWith('#')) grupos.push({ label: s.replace(/^#+\s*/, ''), itens: [] });
    else grupos[grupos.length - 1].itens.push(s);
  });
  return grupos
    .filter((g) => g.itens.length || g.label)
    .map((g) => {
      const ul = g.itens.length ? `<ul class="obs-list">${g.itens.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>` : '';
      return g.label !== null ? `<div class="obs-group"><p class="obs-group-label">${esc(g.label)}</p>${ul}</div>` : ul;
    })
    .join('');
}

export function renderServicos(d) {
  const h = d.hero || {};
  put(
    '#sv-hero',
    `<p class="hero-eyebrow">${esc(h.eyebrow)}</p>
     <h1 class="hero-title">${br(h.titulo)} <span class="accent">${esc(h.destaque)}</span></h1>
     <p class="hero-sub">${esc(h.sub)}</p>`
  );

  const cards = arr(d.servicos)
    .map((s) => {
      const inc = arr(s.incluso).map((i) => `<li><span class="feat-dot"></span>${inline(i)}</li>`).join('');
      const add = arr(s.adicionais)
        .map((a) => `<span class="addon-pill">+ ${esc(a.texto)}${a.preco ? ` · ${esc(a.preco)}` : ''}</span>`)
        .join('');
      return `
      <div class="service-card ${cor(s.cor)} reveal-card">
        <div class="service-top">
          <div class="service-icon-name">
            <span class="service-emoji">${esc(s.emoji)}</span>
            <div><p class="service-type">${esc(s.tipo)}</p><h2 class="service-name">${esc(s.nome)}</h2></div>
          </div>
          <div class="price-badge">${s.prefixo ? `<span class="price-from">${esc(s.prefixo)}</span>` : ''}<span class="price-value">${esc(s.preco)}</span></div>
        </div>
        <div class="service-divider"></div>
        <p class="includes-label">// O QUE INCLUI</p>
        <ul class="features-list">${inc}</ul>
        ${add ? `<div class="addons-block"><p class="addons-label">// ADICIONAIS</p><div class="addons-row">${add}</div></div>` : ''}
      </div>`;
    })
    .join('');
  put('#sv-services', `<div class="services-grid">${cards}</div>`);

  const o = d.obs || {};
  const blocos = arr(o.blocos)
    .map((b) => `<div class="obs-block"><div class="obs-title"><span class="obs-icon">${esc(b.icone)}</span> ${esc(b.titulo)}</div>${obsCorpo(b.itens)}</div>`)
    .join('');
  const r = o.rodape || {};
  const ru = safeUrl(r.linkUrl);
  put(
    '#sv-obs',
    `<div class="obs-inner reveal-card">
       <p class="obs-eyebrow">${esc(o.eyebrow)}</p>
       <div class="obs-grid">${blocos}</div>
       <div class="obs-footer-msg"><p>${esc(r.antes)} ${ru ? `<a href="${esc(ru)}"${ext(ru) ? ' target="_blank" rel="noopener"' : ''}>${esc(r.linkLabel)}</a>` : esc(r.linkLabel)} ${esc(r.depois)}</p></div>
     </div>`
  );

  const c = d.cta || {};
  const b1 = safeUrl(c.btn1Url);
  const b2 = safeUrl(c.btn2Url);
  put(
    '#sv-cta',
    `<div class="cta-inner reveal-card">
       <h2 class="cta-title">${br(c.titulo)} <span class="accent">${esc(c.destaque)}</span></h2>
       <p class="cta-sub">${esc(c.sub)}</p>
       <div class="cta-buttons">
         ${c.btn1Texto ? `<a href="${esc(b1)}"${ext(b1) ? ' target="_blank" rel="noopener"' : ''} class="btn-primary">${esc(c.btn1Texto)}</a>` : ''}
         ${c.btn2Texto ? `<a href="${esc(b2)}"${ext(b2) ? ' target="_blank" rel="noopener"' : ''} class="btn-secondary">${esc(c.btn2Texto)}</a>` : ''}
       </div>
     </div>`
  );

  put('#sv-footer', rodapeHTML(d.rodape));
  setupReveal('.reveal-card');
}
