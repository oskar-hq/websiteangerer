# Website Marvin Angerer – Entwurf

Astro + Tailwind, statisch. Eine Startseite nach dem Museum-Prinzip: Die Seite ist nahezu farblos,
die Kundenlogos in Originalfarben sind das Lauteste. Hellblau nur für Anruf, WhatsApp und aktiven Filter.

## Entwickeln

```bash
npm install
npm run dev      # http://localhost:4321/websiteangerer/
npm run build    # -> dist/
```

## Inhalte pflegen

- **Kontakt:** `src/site.config.ts` (Telefon, WhatsApp, Name, Disziplinen)
- **Kunden-Lineup:** eine JSON-Datei pro Marke/Creator in `src/content/clients/` (`tier: 1` = Headliner, groß). Logos in Originalfarben unter `public/logos/`, Creator-Fotos unter `src/assets/people/`.
- **Arbeiten (Die Wand):** eine Datei pro Arbeit in `src/content/works/*.md`

```md
---
title: "Titel der Arbeit"
client: "Kunde"
discipline: design        # design | video | social | management | software
medium: image             # image | video
kind: "Thumbnail"         # freie Bezeichnung: Plakat, Reel, Spot …
image: "../../assets/works/datei.jpg"   # Bild bzw. Poster bei Videos
video: "media/datei.mp4"  # nur bei medium: video, Datei liegt in public/media/
order: 330                # Reihenfolge auf der Wand
---
```

Bilder in `src/assets/works/` werden beim Build automatisch als WebP in mehreren Größen ausgegeben.

> Alle Inhalte sind Platzhalter.

## GitHub Pages

Workflow `.github/workflows/deploy.yml` baut und veröffentlicht bei jedem Push.
Einmalig nötig: Repo → Settings → Pages → Source: **GitHub Actions**.
URL: https://oskar-hq.github.io/websiteangerer/
