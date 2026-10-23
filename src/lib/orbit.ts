/**
 * Orbit um den Anruf-Button: nur Marken und Creator im Wechsel – Größe (s), Neigung (r).
 * Wird von der Startseite und vom Teilen-Bild (src/lib/share.ts) genutzt.
 * Ausgeblendete Einträge ("hidden": true in src/content/clients) lassen beide automatisch weg.
 */
export const orbit = [
  { client: 'redbull', s: 1.0, r: 10 },
  { client: 'paluten', s: 0.95, r: -8 },
  { client: 'netflix', s: 0.95, r: 6 },
  { client: 'papaplatte', s: 1.0, r: -6 },
  { client: 'knabe', s: 0.9, r: 4 },
  { client: 'gronkh', s: 0.9, r: 12 },
  { client: 'joyn', s: 0.9, r: -4 },
  { client: 'marvinwildhage', s: 0.95, r: -10 },
  { client: 'missgermany', s: 0.95, r: 8 },
  { client: 'dave', s: 1.0, r: -12 },
  { client: 'dzbank', s: 0.95, r: 4 },
  { client: 'itvstudios', s: 0.9, r: -8 },
  { client: 'mexify', s: 0.9, r: -6 },
  { client: 'ciberdime', s: 0.9, r: 8 },
  { client: 'therace', s: 0.95, r: -4 },
];

/** Startwinkel der Kachel i von n in Grad – wie im 3D-Orbit (src/lib/client.ts) */
export const orbitAngle = (i: number, n: number) => (360 / n) * i - 100;
