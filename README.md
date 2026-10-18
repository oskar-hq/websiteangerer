# Website Marvin Angerer

Astro + Tailwind, statisch. Eine Startseite : hellgrauer Grund, in der Mitte der Anruf-Button mit blauem Hörer, drumherum kreisen
Marken, Creator und Arbeiten als gekippte Squircles. Farbe kommt nur aus Logos, Fotos und Arbeiten.

## Entwickeln

```bash
npm install
npm run dev      # http://localhost:4321/
npm run build    # -> dist/
```

## Inhalte pflegen

- **Kontakt & Disziplinen:** `src/site.config.ts` (Name, Disziplinen, Rückruf-Formular: Web3Forms-Access-Key unter `callback.accessKey`)
- **Marken & Creator:** eine JSON-Datei pro Eintrag in `src/content/clients/` (`tier: 1` = Headliner).
  Logos in Originalfarben unter `public/logos/`, Creator-Fotos unter `src/assets/people/`.
  Die Detailansicht („Unser Netzwerk arbeitet für …“) zeigt `items` (Leistung, Profi, Disziplin) und `works`.
- **Arbeiten:** eine Datei pro Arbeit in `src/content/works/*.md`

```md
---
title: "Titel der Arbeit"
client: "Kunde"
discipline: design        # design | video | social | management | software | consulting
medium: image             # image | video
kind: "Thumbnail"         # freie Bezeichnung: Plakat, Reel, Spot …
image: "../../assets/works/datei.jpg"   # Bild bzw. Vorschaubild – jedes Format (Poster, 16:9, 9:16 …)
video: "https://youtu.be/…"   # optional: YouTube-Link oder Datei unter public/, z. B. "videos/spot.mp4"
reference: redbull        # optional: Referenz aus src/content/clients – Logo/Profilbild erscheint auf der Kachel
order: 330                # Reihenfolge
featured: false
---
```

Die Arbeiten stehen in einem Masonry-Raster: jede Kachel behält das Seitenverhältnis ihres Bildes (sehr hohe Formate werden bei 2:3 gekappt, in der Lightbox komplett gezeigt).
Bilder in `src/assets/` werden beim Build automatisch als WebP in mehreren Größen ausgegeben.

> Alle Inhalte sind Platzhalter.

## GitHub Pages

Der Workflow `.github/workflows/deploy.yml` baut und veröffentlicht bei jedem Push.
URL: https://marvinangerer.de (DNS bei Strato: A 185.199.108.153, AAAA 2606:50c0:8000::153, www → CNAME oskar-hq.github.io)
