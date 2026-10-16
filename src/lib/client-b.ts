/**
 * Entwurf B: ziehbare Fenster/Sticker im Hero (Desktop) und Karussell-Steuerung.
 */
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Ziehen (heyclicky) ---------- */
if (fine) {
  let z = 20;
  document.querySelectorAll<HTMLElement>('[data-drag]').forEach((el) => {
    let sx = 0, sy = 0, ox = 0, oy = 0, moved = false;
    el.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest('a, button')) return;
      el.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY; moved = false;
      ox = parseFloat(el.dataset.x ?? '0'); oy = parseFloat(el.dataset.y ?? '0');
      el.classList.add('is-dragging');
      el.style.zIndex = String(++z);
    });
    el.addEventListener('pointermove', (e) => {
      if (!el.classList.contains('is-dragging')) return;
      const x = ox + e.clientX - sx, y = oy + e.clientY - sy;
      if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 3) moved = true;
      el.dataset.x = String(x); el.dataset.y = String(y);
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    const end = () => el.classList.remove('is-dragging');
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    // Ein echter Zug soll keinen Klick (z. B. Detailansicht) auslösen
    el.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
  });
}

/* ---------- Karussell (Nutshell) ---------- */
document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((root) => {
  const track = root.querySelector<HTMLElement>('[data-track]')!;
  const step = () => (track.querySelector<HTMLElement>('[data-slide]')?.offsetWidth ?? 300) + 16;
  root.querySelector('[data-prev]')?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  root.querySelector('[data-next]')?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
});
