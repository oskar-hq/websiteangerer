/**
 * Gemeinsames Verhalten für alle Versionen:
 * – Einblenden beim Scrollen ([data-reveal])
 * – Filter der Wand ([data-filter] Buttons/Links, [data-tile] Kacheln)
 * – Video-Kacheln: Desktop spielt bei Hover, Mobile spielt, wenn sichtbar
 * – Sticky-Bar / Header-Zustand ([data-after-hero])
 */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/* ---------- Reveal ---------- */
const revealIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      }
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
);
document.querySelectorAll('[data-reveal]').forEach((el) => {
  // Hero blendet direkt beim Laden ein, unabhängig von der Scroll-Position
  if (el.closest('[data-hero]')) requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
  else revealIO.observe(el);
});

/* ---------- Videos ---------- */
function play(v: HTMLVideoElement) {
  if (reduce.matches) return;
  if (v.preload === 'none') v.preload = 'auto';
  v.play().catch(() => {});
}
function pause(v: HTMLVideoElement, rewind = false) {
  v.pause();
  if (rewind) v.currentTime = 0;
}

const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video[data-work-video]'));

if (finePointer.matches) {
  for (const v of videos) {
    const tile = v.closest<HTMLElement>('[data-tile], [data-hover-root]') ?? v;
    tile.addEventListener('mouseenter', () => play(v));
    tile.addEventListener('mouseleave', () => pause(v));
    tile.addEventListener('focusin', () => play(v));
    tile.addEventListener('focusout', () => pause(v));
  }
  // Ambient-Videos (z. B. Hero) laufen dauerhaft
  document.querySelectorAll<HTMLVideoElement>('video[data-ambient]').forEach((v) => play(v));
} else {
  const vio = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting && e.intersectionRatio > 0.55) play(v);
        else pause(v);
      }
    },
    { threshold: [0, 0.55, 0.9] },
  );
  videos.forEach((v) => vio.observe(v));
  document.querySelectorAll<HTMLVideoElement>('video[data-ambient]').forEach((v) => vio.observe(v));
}

/* ---------- Filter ---------- */
const wall = document.querySelector<HTMLElement>('[data-wall]');
const tiles = Array.from(document.querySelectorAll<HTMLElement>('[data-tile]'));
const filterBtns = Array.from(document.querySelectorAll<HTMLElement>('[data-filter]'));

function applyFilter(id: string) {
  const run = () => {
    let i = 0;
    for (const t of tiles) {
      const show = id === 'all' || t.dataset.discipline === id;
      t.hidden = !show;
      if (show) {
        t.style.setProperty('--i', String(i++));
        const pos = t.querySelector('[data-pos]');
        if (pos) pos.textContent = String(i).padStart(2, '0');
      }
    }
    for (const b of filterBtns) {
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.dataset.filter === id));
    }
    wall?.setAttribute('data-active', id);
    const visible = String(tiles.filter((t) => !t.hidden).length).padStart(2, '0');
    document.querySelectorAll('[data-total]').forEach((el) => (el.textContent = visible));
    const count = document.querySelector('[data-count]');
    if (count) count.textContent = String(tiles.filter((t) => !t.hidden).length).padStart(2, '0');
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !reduce.matches && window.innerWidth >= 768) doc.startViewTransition(run);
  else run();
}

// Vorfilter über Hash, z. B. /arbeiten/#design
const initial = location.hash.slice(1);
if (wall && filterBtns.some((b) => b.dataset.filter === initial)) applyFilter(initial);

for (const b of filterBtns) {
  b.addEventListener('click', (ev) => {
    const id = b.dataset.filter ?? 'all';
    if (b.tagName === 'A') {
      ev.preventDefault();
      document.getElementById('wand')?.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
    }
    applyFilter(id);
    // Feed (Mobile): nach dem Filtern direkt zur ersten passenden Arbeit
    if (document.documentElement.classList.contains('feed') && window.innerWidth < 768) {
      const first = tiles.find((t) => !t.hidden);
      requestAnimationFrame(() => first?.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' }));
    }
  });
}

/* ---------- Zustand nach dem Hero (Header verdichtet sich) ---------- */
const hero = document.querySelector('[data-hero]');
if (hero) {
  const hio = new IntersectionObserver(
    ([e]) => document.documentElement.toggleAttribute('data-after-hero', !e.isIntersecting),
    { threshold: 0, rootMargin: '-64px 0px 0px 0px' },
  );
  hio.observe(hero);
}

/* ---------- Detailansicht Marke / Creator ---------- */
const dlg = document.getElementById('client-dialog') as HTMLDialogElement | null;
if (dlg) {
  const body = dlg.querySelector<HTMLElement>('.cd-body')!;
  let lastTrigger: HTMLElement | null = null;

  const open = (id: string, trigger: HTMLElement) => {
    const tpl = document.getElementById(`client-${id}`) as HTMLTemplateElement | null;
    if (!tpl) return;
    lastTrigger = trigger;
    body.replaceChildren(tpl.content.cloneNode(true));
    dlg.querySelector<HTMLElement>('.cd-panel')!.scrollTop = 0;
    document.documentElement.classList.add('cd-lock');
    dlg.showModal();
    requestAnimationFrame(() => requestAnimationFrame(() => dlg.classList.add('is-open')));
  };

  const close = () => {
    if (!dlg.open) return;
    dlg.classList.remove('is-open');
    const done = () => {
      dlg.close();
      document.documentElement.classList.remove('cd-lock');
      lastTrigger?.focus({ preventScroll: true });
    };
    if (reduce.matches) done();
    else setTimeout(done, 480);
  };

  document.querySelectorAll<HTMLElement>('[data-client]').forEach((t) =>
    t.addEventListener('click', () => open(t.dataset.client!, t)),
  );
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || (e.target as HTMLElement).closest('[data-close]')) close();
  });

  // Mobile-Sheet: nach unten ziehen zum Schließen
  const panel = dlg.querySelector<HTMLElement>('.cd-panel')!;
  let startY = 0, dy = 0, dragging = false;
  panel.addEventListener('touchstart', (e) => {
    if (panel.scrollTop > 0) return;
    dragging = true; startY = e.touches[0].clientY; dy = 0;
    panel.style.transition = 'none';
  }, { passive: true });
  panel.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    dy = Math.max(0, e.touches[0].clientY - startY);
    panel.style.transform = `translate3d(0, ${dy}px, 0)`;
  }, { passive: true });
  panel.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    panel.style.transition = '';
    panel.style.transform = '';
    if (dy > 110) close();
  });
}

/* ---------- Arbeiten: Farbe, sobald im Bild (nur Touch-Geräte) ---------- */
if (!finePointer.matches) {
  const cio = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('is-color', e.isIntersecting && e.intersectionRatio > 0.6)),
    { threshold: [0, 0.6, 1] },
  );
  document.querySelectorAll('[data-colorize]').forEach((el) => cio.observe(el));
}

/* ---------- Wortmarke exakt auf Containerbreite setzen ---------- */
const fitEls = Array.from(document.querySelectorAll<HTMLElement>('[data-fit]'));
const fit = () => {
  for (const el of fitEls) {
    const box = el.parentElement!;
    const avail = box.clientWidth;
    el.style.fontSize = '';
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const w = el.getBoundingClientRect().width;
    if (w > 0) el.style.fontSize = `${(fs * avail) / w}px`;
  }
};
if (fitEls.length) {
  fit();
  document.fonts?.ready.then(fit);
  let t = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(t); t = requestAnimationFrame(fit); });
}
