/**
 * Seitenverhalten:
 * – Einblenden beim Scrollen ([data-reveal])
 * – Detailansicht für Marken und Creator ([data-client] öffnet #client-dialog)
 */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

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

