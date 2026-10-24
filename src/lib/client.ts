/**
 * Seitenverhalten der Startseite:
 * Einblenden, Header-Zustand, Menü, 3D-Orbit, Magnet- & Kipp-Effekte, Rückruf-Formular,
 * Filter, Lightbox, Disziplin-Vorschau, Detailansicht für Marken/Creator.
 */
const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
const ease = 'cubic-bezier(0.16,1,0.3,1)';
let md = innerWidth >= 768;

const state = { hovering: false, dialog: false, lightbox: false, menu: false };
const halted = () => state.hovering || state.dialog || state.lightbox || state.menu;
const lock = (v: boolean) => root.classList.toggle('is-locked', v);

/* ---------- Einblenden ---------- */
const io = new IntersectionObserver(
  (es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const t = e.target as HTMLElement;
    play(t.classList.contains('line-mask') ? (t.firstElementChild as HTMLElement) : t);
    io.unobserve(t);
  }),
  { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
);
function play(el: HTMLElement) {
  if (el.classList.contains('is-in') || el.hidden) return;
  if (reduce) { el.classList.add('is-in'); return; }
  const line = el.hasAttribute('data-line');
  const delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
  const a = el.animate(
    line
      ? [{ transform: 'translate3d(0,108%,0) rotate(2.5deg)' }, { transform: 'none' }]
      : [{ opacity: 0, transform: 'translate3d(0,22px,0)', filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
    { duration: line ? 1400 : 1200, delay, easing: ease, fill: 'both' },
  );
  a.onfinish = () => { el.classList.add('is-in'); a.cancel(); };
}
function observeReveal(scope: ParentNode = document) {
  $$('[data-reveal]:not(.is-in),[data-line]:not(.is-in)', scope).forEach((el) => {
    if (el.hidden) return;
    if (el.closest('[data-hero]') || el.closest('header')) requestAnimationFrame(() => play(el));
    // Zeilen stecken verschoben in einer Maske – beobachtet wird die sichtbare Maske
    else io.observe(el.hasAttribute('data-line') ? el.parentElement! : el);
  });
}
observeReveal();

/* ---------- Header & Scroll ---------- */
const onScroll = () => {
  root.classList.toggle('is-scrolled', scrollY > 40);
  root.classList.toggle('is-past', scrollY > innerHeight * 0.6);
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Menü ---------- */
const menuBtn = $('[data-menu-btn]');
const setMenu = (v: boolean) => {
  state.menu = v;
  root.classList.toggle('menu-open', v);
  menuBtn?.setAttribute('aria-expanded', String(v));
  const l = $('[data-menu-label]'); if (l) l.textContent = v ? 'Schließen' : 'Menü';
};
menuBtn?.addEventListener('click', (e) => { e.stopPropagation(); setMenu(!state.menu); });
$$('[data-menu-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', (e) => {
  if (state.menu && !(e.target as HTMLElement).closest('[data-menu],nav')) setMenu(false);
});

/* ---------- Maus ---------- */
const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
addEventListener('mousemove', (e) => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  mouse.nx = e.clientX / innerWidth - 0.5; mouse.ny = e.clientY / innerHeight - 0.5;
}, { passive: true });

/* ---------- Drück-Feedback ---------- */
type Animated = HTMLElement & { __pa?: Animation };
addEventListener('pointerdown', (e) => {
  let el = (e.target as HTMLElement).closest?.<Animated>('a,button,[data-tilt],[data-disc-row]');
  if (!el || reduce) return;
  if (el.classList.contains('orb')) el = el.firstElementChild as Animated;
  el.__pa?.cancel();
  el.__pa = el.animate([{ scale: '1' }, { scale: '0.94' }], { duration: 130, easing: 'cubic-bezier(0.3,0,0.5,1)', fill: 'forwards' });
  const target = el;
  const up = () => {
    removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
    const prev = target.__pa;
    target.__pa = target.animate([{ scale: '0.94' }, { scale: '1.03', offset: 0.45 }, { scale: '1' }], { duration: 560, easing: ease });
    prev?.cancel();
    navigator.vibrate?.(8);
  };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
});

/* ---------- Magnet ---------- */
$$('[data-magnet]').forEach((el) => {
  const k = +el.dataset.magnet!;
  const inner = $('[data-magnet-inner]', el);
  el.style.transition = `${getComputedStyle(el).transition},translate .6s ${ease}`;
  if (inner) inner.style.transition = `translate .6s ${ease}`;
  el.addEventListener('mousemove', (e) => {
    if (reduce) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    el.style.translate = `${x * k}px ${y * k}px`;
    if (inner) inner.style.translate = `${x * k * 0.5}px ${y * k * 0.5}px`;
  });
  el.addEventListener('mouseleave', () => { el.style.translate = '0 0'; if (inner) inner.style.translate = '0 0'; });
});

/* ---------- Kippen ---------- */
$$('[data-tilt]').forEach((el) => {
  const inner = $('[data-tilt-el]', el)!;
  el.addEventListener('mousemove', (e) => {
    if (reduce) return;
    const r = inner.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    inner.style.transform = `rotateX(${(-y * 14).toFixed(2)}deg) rotateY(${(x * 14).toFixed(2)}deg)`;
  });
  el.addEventListener('mouseleave', () => { inner.style.transform = ''; });
});

/* ---------- Ambiente ---------- */
const blobs = $$('[data-blob]');
if (!reduce) {
  blobs.forEach((b, i) => b.animate(
    [{ transform: 'translate3d(0,0,0) scale(1)' }, { transform: `translate3d(${[60, -80, 50, -40][i]}px,${[40, 70, -60, -50][i]}px,0) scale(${[1.15, 0.9, 1.1, 1.2][i]})` }],
    { duration: [18000, 22000, 26000, 20000][i], direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
  ));
  $('[data-intro-tile]')?.animate(
    [{ opacity: 0, scale: '0.6', filter: 'blur(10px)' }, { opacity: 1, scale: '1', filter: 'blur(0)' }],
    { duration: 1200, easing: 'cubic-bezier(0.34,1.4,0.5,1)', fill: 'backwards' },
  );
}

/* ---------- Orbit & Bildlauf-Effekte ---------- */
const ring = $('[data-ring]');
const stage = $('[data-stage]');
const heroFoot = $('[data-hero-foot]');
const orbs = ring ? $$('.orb', ring) : [];
const orbData = orbs.map((el) => ({ a: +el.dataset.a!, o: +el.dataset.o! }));
ring?.addEventListener('mouseenter', () => (state.hovering = true));
ring?.addEventListener('mouseleave', () => (state.hovering = false));

let spin = 0, speed = 1;
const par = { x: 0, y: 0 };
const t0 = performance.now();
let last = t0;
const REV = 120_000;

function frame(t: number) {
  const dt = Math.min(64, t - last); last = t;
  par.x += (mouse.nx - par.x) * 0.06; par.y += (mouse.ny - par.y) * 0.06;
  const vh = innerHeight, sp = Math.min(1, Math.max(0, scrollY / vh));
  speed += ((halted() ? 0 : 1 + sp * 4) - speed) * 0.05;
  if (!reduce && !document.hidden) spin += (dt / REV) * 360 * speed;
  const since = t - t0;

  if (sp < 1) {
    const rx = (md ? 300 : 150) * (1 + sp * 0.5), ry = (md ? 240 : 185) * (1 + sp * 0.5);
    const tilt = 0.86 + par.y * 0.18;
    orbs.forEach((el, i) => {
      const o = orbData[i];
      const k = reduce ? 1 : Math.min(1, Math.max(0, (since - 250 - i * 55) / 1100));
      const e = k === 1 ? 1 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
      const a = ((o.a + spin) * Math.PI) / 180, z = Math.sin(a);
      const x = Math.cos(a) * rx * e + par.x * 30 * (z + 1.4);
      const y = z * ry * tilt * e + par.y * 20 * (z + 1.4);
      const depth = 0.88 + (z + 1) * 0.1;
      el.style.translate = `calc(-50% + ${x.toFixed(2)}px) calc(-50% + ${y.toFixed(2)}px)`;
      el.style.scale = (depth * Math.max(0.001, e)).toFixed(3);
      el.style.zIndex = String(Math.round(100 + z * 50));
      el.style.opacity = String(Math.min(1, k * 1.6) * o.o * (0.75 + (z + 1) * 0.125));
    });
  }
  if (stage) stage.style.opacity = String(1 - sp * 0.9);
  if (heroFoot) heroFoot.style.transform = `translate3d(0,${(-sp * vh * 0.18).toFixed(1)}px,0)`;
  blobs.forEach((b, i) => { b.style.translate = `${(par.x * (i % 2 ? -60 : 60)).toFixed(1)}px ${(par.y * 40 - scrollY * (0.05 + i * 0.02)).toFixed(1)}px`; });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- Arbeiten: Filter, „Alle zeigen“ ---------- */
type WorkData = { title: string; discipline: string; meta: string; full: string; video?: { type: 'youtube' | 'file'; src: string } };
const workData: WorkData[] = JSON.parse($('#works-data')?.textContent || '[]');
const works = $('[data-works]');
// Das Masonry ist an jeder Reihe geteilt: mehrere Raster, dazwischen Reihen-Blöcke
const grids = works ? $$('[data-grid]', works).map((el) => ({ el, cells: $$('[data-work]', el) })) : [];
const rows = works ? $$('[data-row-block]', works).map((el) => ({ el, cells: $$('[data-work]', el) })) : [];
const cells = works ? $$('[data-work]', works) : [];
const bar = $('[data-filter-bar]');
const thumb = $('[data-thumb]');
const moreBtn = $('[data-more-btn]');
const SHOWN = 12;
let filter = 'all', showAll = false;

// Filter = Antwort auf „Wonach suchst du?“ oder eine Disziplin (Klick in der Disziplinen-Liste)
const filtered = () => cells.filter((c) => filter === 'all' || c.dataset.tags!.split(' ').includes(filter));
// Erste 12 – eine angeschnittene Reihe wird ganz gezeigt, nie halb
function limit(list: HTMLElement[]) {
  let k = Math.min(SHOWN, list.length);
  while (k < list.length && list[k].dataset.row && list[k].dataset.row === list[k - 1].dataset.row) k++;
  return list.slice(0, k);
}
function moveThumb() {
  const btn = bar && $(`[data-filter="${filter}"]`, bar);
  // Disziplin ohne eigene Antwort (z. B. Design): keine Antwort markiert
  if (thumb) thumb.style.opacity = btn ? '1' : '0';
  if (!btn || !thumb) return;
  // Mobil brechen die Antworten um – die Markierung wandert dann auch in die nächste Zeile
  thumb.style.translate = `${btn.offsetLeft}px ${btn.offsetTop}px`;
  thumb.style.width = `${btn.offsetWidth}px`;
  thumb.style.height = `${btn.offsetHeight}px`;
}
// Masonry: sichtbare Arbeiten der Reihe nach in die jeweils kürzeste Spalte.
// Raster ohne sichtbare Reihe dazwischen bilden ein gemeinsames Masonry. Über einer Reihe
// müssen alle Spalten bündig enden: überstehende Kacheln rutschen hinter die Reihe.
const segs = works ? Array.from(works.children as HTMLCollectionOf<HTMLElement>) : [];
let colCount = 0;
function layoutGrid() {
  const n = innerWidth >= 768 ? 3 : 2;
  if (n !== colCount) {
    grids.forEach(({ el }) => {
      $$('.works-col', el).forEach((c) => c.remove());
      for (let i = 0; i < n; i++) el.append(Object.assign(document.createElement('div'), { className: 'works-col' }));
      el.classList.add('is-js');
    });
    colCount = n;
  }
  rows.forEach(({ el, cells }) => (el.hidden = cells.every((c) => c.hidden)));
  let carry: HTMLElement[] = [];
  let target: HTMLElement | null = null, queue: HTMLElement[] = [];
  const flush = (beforeRow: boolean) => {
    if (!target) return;
    const cols = $$('.works-col', target);
    const h = cols.map(() => 0);
    const placed: { c: HTMLElement; k: number }[] = [];
    queue.forEach((c) => {
      if (c.hidden) { cols[0].append(c); return; }
      const k = h.indexOf(Math.min(...h));
      cols[k].append(c);
      h[k] += +c.dataset.ratio! + 0.15;
      placed.push({ c, k });
    });
    carry = [];
    // Von hinten abtragen, bis alle Spalten gleich hoch sind (gleiche Formate gehen sofort auf)
    while (beforeRow && placed.length && Math.max(...h) - Math.min(...h) > 0.01) {
      const { c, k } = placed.pop()!;
      h[k] -= +c.dataset.ratio! + 0.15;
      carry.unshift(c);
    }
    target = null; queue = [];
  };
  segs.forEach((el) => {
    if (el.hasAttribute('data-grid')) {
      if (!target) { target = el; queue = carry; carry = []; }
      queue.push(...grids.find((g) => g.el === el)!.cells);
    } else if (!el.hidden) flush(true);
  });
  flush(false);
  // Rest (z. B. hinter der letzten Reihe ohne folgendes Raster) bleibt im letzten Raster
  if (carry.length) { const last = grids.at(-1)?.el; if (last) { target = last; queue = carry; flush(false); } }
}
function applyFilter(animate: boolean) {
  const list = filtered();
  const visible = filter === 'all' && !showAll ? limit(list) : list;
  cells.forEach((c) => (c.hidden = !visible.includes(c)));
  layoutGrid();
  const count = $('[data-work-count]'); if (count) count.textContent = String(list.length).padStart(2, '0');
  if (moreBtn) moreBtn.parentElement!.hidden = visible.length >= list.length;
  $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
  moveThumb();
  if (!animate) return;
  visible.forEach((el, i) => {
    el.classList.add('is-in'); io.unobserve(el);
    if (!reduce) el.animate(
      [{ opacity: 0, transform: 'translate3d(0,20px,0) scale(.94)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
      { duration: 900, delay: Math.min(i, 12) * 35, easing: ease, fill: 'backwards' },
    );
  });
}
function setFilter(id: string) {
  filter = id;
  applyFilter(true);
  // Auswahl steht in der Adresse (?suche=software) – so lässt sich die Ansicht teilen
  const url = new URL(location.href);
  if (id === 'all') url.searchParams.delete('suche'); else url.searchParams.set('suche', id);
  history.replaceState(history.state, '', url);
}
$$('[data-filter]').forEach((b) => b.addEventListener('click', () => setFilter(b.dataset.filter!)));
moreBtn?.addEventListener('click', () => { showAll = true; applyFilter(false); observeReveal(works!); });
addEventListener('resize', () => {
  const m = innerWidth >= 768;
  if (m !== md) { md = m; layoutGrid(); }
  moveThumb();
});
document.fonts?.ready.then(moveThumb);
const asked = new URLSearchParams(location.search).get('suche');
if (asked && cells.some((c) => c.dataset.tags!.split(' ').includes(asked))) { filter = asked; applyFilter(false); observeReveal(works!); }
moveThumb();
layoutGrid();

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: reduce ? 'auto' : 'smooth' });
};

/* ---------- Lightbox ---------- */
const lb = $<HTMLDialogElement>('#lb');
function renderLb(cell: HTMLElement) {
  const d = workData[+cell.dataset.work!];
  const img = $<HTMLImageElement>('[data-lb-img]', lb!)!;
  const vid = $<HTMLVideoElement>('[data-lb-video]', lb!)!;
  const yt = $<HTMLIFrameElement>('[data-lb-yt]', lb!)!;
  stopLbMedia();
  // Bild zeigen, bei Videos stattdessen Player (Datei oder YouTube) mit Vorschaubild als Poster
  img.hidden = !!d.video; vid.hidden = d.video?.type !== 'file'; yt.hidden = d.video?.type !== 'youtube';
  if (d.video?.type === 'file') { vid.poster = d.full; vid.src = d.video.src; vid.play().catch(() => {}); }
  else if (d.video?.type === 'youtube') yt.src = d.video.src;
  else { img.src = d.full; img.alt = d.title; }
  $('[data-lb-title]', lb!)!.textContent = d.title;
  $('[data-lb-meta]', lb!)!.textContent = d.meta;
  $('[data-callback]', lb!)!.dataset.callback = d.title;
}
function stopLbMedia() {
  const vid = lb && $<HTMLVideoElement>('[data-lb-video]', lb);
  const yt = lb && $<HTMLIFrameElement>('[data-lb-yt]', lb);
  if (vid) { vid.pause(); vid.removeAttribute('src'); vid.load(); }
  if (yt) yt.src = 'about:blank';
}
function openLb(cell: HTMLElement) {
  if (!lb) return;
  renderLb(cell);
  state.lightbox = true; setMenu(false); lock(true);
  lb.showModal();
  requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('is-open')));
}
function closeLb() {
  if (!lb?.open) return;
  lb.classList.remove('is-open');
  stopLbMedia();
  setTimeout(() => { lb.close(); state.lightbox = false; lock(false); }, reduce ? 0 : 450);
}
cells.forEach((c) => {
  c.addEventListener('click', () => openLb(c));
  c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(c); } });
});
if (lb) {
  lb.addEventListener('cancel', (e) => { e.preventDefault(); closeLb(); });
  lb.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('a,[data-callback]')) return;
    if (t.closest('[data-lb-close]') || !t.closest('.lb-img')) closeLb();
  });
}

/* ---------- Disziplinen ---------- */
const discList = $('[data-disc-list]');
$$('[data-disc-row]').forEach((row) => {
  const id = row.dataset.discRow!;
  row.addEventListener('mouseenter', () => {
    discList?.classList.add('has-hover');
    $$('[data-disc-row]').forEach((r) => r.classList.toggle('is-hover', r === row));
  });
  // Zeilen mit [data-callback] (Disziplin ohne Arbeiten) öffnen stattdessen den Rückruf
  const go = () => { if (row.dataset.callback === undefined) { setFilter(id); scrollToId('arbeiten'); } };
  row.addEventListener('click', go);
  row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); } });
});
discList?.addEventListener('mouseleave', () => {
  discList.classList.remove('has-hover');
  $$('[data-disc-row]').forEach((r) => r.classList.remove('is-hover'));
});

/* ---------- Detailansicht Marke / Creator ---------- */
const dlg = $<HTMLDialogElement>('#client-dialog');
if (dlg) {
  const body = $('.cd-body', dlg)!;
  const panel = $('.cd-panel', dlg)!;
  let lastTrigger: HTMLElement | null = null;

  const open = (id: string, trigger: HTMLElement) => {
    const tpl = document.getElementById(`client-${id}`) as HTMLTemplateElement | null;
    if (!tpl) return;
    lastTrigger = trigger;
    body.replaceChildren(tpl.content.cloneNode(true));
    panel.scrollTop = 0;
    state.dialog = true; setMenu(false); lock(true);
    dlg.showModal();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      dlg.classList.add('is-open');
      if (!reduce) $$('[data-dlg]', body).forEach((el, i) => el.animate(
        [{ opacity: 0, transform: 'translate3d(0,16px,0)' }, { opacity: 1, transform: 'none' }],
        { duration: 900, delay: 80 + i * 60, easing: ease, fill: 'backwards' },
      ));
    }));
  };

  const close = () => {
    if (!dlg.open) return;
    dlg.classList.remove('is-open');
    const done = () => {
      dlg.close();
      state.dialog = false; lock(false);
      lastTrigger?.focus({ preventScroll: true });
    };
    if (reduce) done(); else setTimeout(done, 480);
  };

  $$('[data-client]').forEach((t) => t.addEventListener('click', () => open(t.dataset.client!, t)));
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || (e.target as HTMLElement).closest('[data-close]')) close();
  });

  // Mobile-Sheet: nach unten ziehen zum Schließen
  let startY = 0, dy = 0, dragging = false;
  panel.addEventListener('touchstart', (e) => {
    if (panel.scrollTop > 0 || md) return;
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

/* ---------- Rückruf ---------- */
const cb = $<HTMLDialogElement>('#callback-dialog');
if (cb) {
  const form = $<HTMLFormElement>('[data-cb-form]', cb)!;
  const done = $('[data-cb-done]', cb)!;
  const ctx = $('[data-cb-context]', cb)!;
  const err = $('[data-cb-error]', cb)!;
  const submit = $<HTMLButtonElement>('[data-cb-submit]', cb)!;
  const panel = $('.cd-panel', cb)!;
  let context = '';

  const openCb = (about: string) => {
    context = about;
    ctx.textContent = about ? `Zu: ${about}` : '';
    ctx.classList.toggle('hidden', !about);
    form.classList.remove('hidden'); done.classList.add('hidden'); err.classList.add('hidden');
    panel.scrollTop = 0;
    state.dialog = true; setMenu(false); lock(true);
    cb.showModal();
    requestAnimationFrame(() => requestAnimationFrame(() => cb.classList.add('is-open')));
    if (fine) setTimeout(() => $<HTMLInputElement>('input[name="name"]', form)?.focus(), 300);
  };
  const closeCb = () => {
    if (!cb.open) return;
    cb.classList.remove('is-open');
    setTimeout(() => {
      cb.close();
      // Andere Overlays (Lightbox, Detailansicht) können darunter noch offen sein
      if (!document.querySelector('dialog[open]')) { state.dialog = false; lock(false); }
    }, reduce ? 0 : 480);
  };

  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest?.<HTMLElement>('[data-callback]');
    if (!t) return;
    e.preventDefault();
    openCb(t.dataset.callback || '');
  });
  cb.addEventListener('cancel', (e) => { e.preventDefault(); closeCb(); });
  cb.addEventListener('click', (e) => {
    if (e.target === cb || (e.target as HTMLElement).closest('[data-close]')) closeCb();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const fields = { name: !!name, phone: /^[+0-9 ()/-]{6,}$/.test(phone) };
    Object.entries(fields).forEach(([k, ok]) => $(`[name="${k}"]`, form)!.setAttribute('aria-invalid', String(!ok)));
    const fail = (msg: string) => { err.textContent = msg; err.classList.remove('hidden'); };
    if (!fields.name || !fields.phone) return fail('Bitte Name und eine gültige Telefonnummer angeben.');
    if (fd.get('botcheck')) return;
    const key = cb.dataset.key;
    if (!key) return fail('Das Rückruf-Formular ist noch nicht verbunden. Bitte später erneut versuchen.');

    submit.disabled = true; err.classList.add('hidden');
    try {
      const res = await fetch(cb.dataset.endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: key,
          subject: `Rückruf-Wunsch: ${name}${context ? ` (${context})` : ''}`,
          from_name: 'Website',
          name, phone,
          anliegen: String(fd.get('message') || '').trim() || '–',
          zeit: fd.get('time'),
          ueber: context || 'Allgemein',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || res.statusText);
      $('[data-cb-name]', done)!.textContent = `, ${name.split(' ')[0]}`;
      form.reset();
      form.classList.add('hidden'); done.classList.remove('hidden');
    } catch {
      fail('Das hat leider nicht geklappt. Bitte versuch es gleich noch einmal.');
    } finally {
      submit.disabled = false;
    }
  });
}

addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.menu) setMenu(false); });
