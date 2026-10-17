/**
 * Zentrale Kontaktdaten. Hier ändern – die ganze Seite übernimmt es automatisch.
 * Die Telefonnummer steht bewusst nirgends auf der Seite – Kontakt nur per Rückruf-Formular.
 */
export const site = {
  name: 'Marvin Angerer',
  /** Kurzform für kleine Flächen */
  short: 'Angerer',
  claim: 'Ein Name. Ein Anruf. Das Beste, was Deutschland zu bieten hat.',
};

/**
 * Rückruf-Formular: Besucher hinterlassen ihre Nummer, Marvin bekommt eine E-Mail.
 * Dienst: Web3Forms (kostenlos). Auf https://web3forms.com mit Marvins E-Mail einen
 * Access Key erzeugen und hier eintragen. Solange er leer ist, wird nichts verschickt.
 */
export const callback = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: '0df4eda0-b143-47df-a735-deaa8dfb8847',
};

export const disciplines = [
  { id: 'design', label: 'Design', line: 'Plakate, Key Visuals, Thumbnails, Corporate Design.' },
  { id: 'video', label: 'Video', line: 'Produktion, Schnitt, Live-Produktion.' },
  { id: 'social', label: 'Social Media', line: 'Formate, Content-Pläne, laufende Betreuung.' },
  { id: 'management', label: 'Management', line: 'Vermittlung in die Creator-Welt, Booking, Events.' },
  { id: 'software', label: 'Software', line: 'KI & Optimierung für Outreach und Operatives – Ylva Labs.' },
  { id: 'consulting', label: 'Consulting', line: 'Social-Media-Content-Strategie, Business Development für Kreativ-Dienstleister, Sales.' },
] as const;

export type DisciplineId = (typeof disciplines)[number]['id'];
