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
      if (show) t.style.setProperty('--i', String(i++));
    }
    for (const b of filterBtns) {
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.dataset.filter === id));
    }
    wall?.setAttribute('data-active', id);
    const count = document.querySelector('[data-count]');
    if (count) count.textContent = String(tiles.filter((t) => !t.hidden).length).padStart(2, '0');
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !reduce.matches && window.innerWidth >= 768) doc.startViewTransition(run);
  else run();
}

for (const b of filterBtns) {
  b.addEventListener('click', (ev) => {
    const id = b.dataset.filter ?? 'all';
    if (b.tagName === 'A') {
      ev.preventDefault();
      document.getElementById('wand')?.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
    }
    applyFilter(id);
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
