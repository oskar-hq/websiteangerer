# Website Marvin Angerer – Designentwürfe

Astro + Tailwind, statisch. Drei Entwürfe auf einer gemeinsamen Basis:

| Route | Entwurf |
|---|---|
| `/` | Übersicht aller Entwürfe |
| `/v1/` | **Ruhe** – Off-White, große Typo (Geist) |
| `/v2/` | **Nacht** – sehr dunkles Blau, Arbeiten im Hero (Bricolage Grotesque + Inter) |
| `/v3/` | **Index** – redaktionell, Haarlinien, Serif-Akzente (Instrument Sans/Serif) |

## Entwickeln

```bash
npm install
npm run dev      # http://localhost:4321/websiteangerer/
npm run build    # -> dist/
```

## Inhalte pflegen

- **Kontakt & Logos:** `src/site.config.ts` (Telefon, WhatsApp, Name, Logo-Platzhalter, Disziplinen)
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
placeholder: false        # true = Kachel zeigt „Platzhalter“-Label
---
```

Bilder in `src/assets/works/` werden beim Build automatisch als WebP in mehreren Größen ausgegeben.

> Alle aktuellen Medien, Kunden, Logos und Nummern sind **Platzhalter**.

## GitHub Pages

Workflow `.github/workflows/deploy.yml` baut und veröffentlicht bei jedem Push.
Einmalig nötig: Repo → Settings → Pages → Source: **GitHub Actions**.
URL: https://oskar-hq.github.io/websiteangerer/
