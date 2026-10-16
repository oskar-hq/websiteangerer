/**
 * Zentrale Kontaktdaten. Hier ändern – die ganze Seite übernimmt es automatisch.
 * PLATZHALTER: Name und Nummern sind Dummy-Werte.
 */
export const site = {
  name: 'Marvin Angerer',
  /** Kurzform für kleine Flächen */
  short: 'Angerer',
  claim: 'Ein Name. Ein Anruf. Das Beste, was Deutschland zu bieten hat.',
  /** Anzeige-Format */
  phoneDisplay: '+49 170 000 00 00',
  /** E.164 ohne Leerzeichen, für tel:-Link */
  phone: '+491700000000',
  /** Nur Ziffern inkl. Ländervorwahl, für wa.me */
  whatsapp: '491700000000',
  whatsappText: 'Hallo Marvin, ich habe deine Seite gesehen und möchte kurz sprechen.',
};

export const tel = `tel:${site.phone}`;
/** WhatsApp-Link mit vorausgefülltem Text */
export const waWith = (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
/** Text, wenn jemand über ein bestimmtes Projekt oder eine Marke kommt */
export const waFrom = (what: string) => waWith(`Hey Marvin, ich bin über „${what}“ auf deiner Website zu dir gelangt und möchte kurz sprechen.`);
export const wa = waWith(site.whatsappText);

export const disciplines = [
  { id: 'design', label: 'Design', line: 'Plakate, Key Visuals, Thumbnails, Corporate Design.' },
  { id: 'video', label: 'Video', line: 'Produktion, Schnitt, Live-Produktion.' },
  { id: 'social', label: 'Social Media', line: 'Formate, Content-Pläne, laufende Betreuung.' },
  { id: 'management', label: 'Management', line: 'Vermittlung in die Creator-Welt, Booking, Events.' },
  { id: 'software', label: 'Software', line: 'KI & Optimierung für Outreach und Operatives – Ylva Labs.' },
] as const;

export type DisciplineId = (typeof disciplines)[number]['id'];
