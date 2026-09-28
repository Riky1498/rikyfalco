# Reel "Squat e ginocchia" (9:16)

Battuta: *"Esegui lo squat ad ogni allenamento? Occhio perché così rischi di danneggiare gravemente le tue ginocchia."*

- `out/squat-reel-preview.mp4`: anteprima con grafiche animate Remotion e personaggio statico (senza voce).
- `out/avatar-input.png`: inquadratura frontale 9:16, ragazzo seduto alla scrivania vuota: è l'immagine da dare a HeyGen.

## Pipeline

```bash
npm install
npm run prepare-assets      # sfondo dallo studio (Drive) + ritaglio del personaggio
npm run still:avatar        # out/avatar-input.png
export HEYGEN_API_KEY=...   # HeyGen > Settings > API
npm run heygen              # Avatar IV: foto -> video parlante con voce italiana -> public/avatar.mp4
npm run render:final        # out/squat-reel.mp4 = avatar HeyGen + testi + motion graphics
```

Senza chiave API: carica `out/avatar-input.png` su HeyGen (Avatar IV / Photo Avatar), incolla il testo,
formato verticale, scarica l'MP4 in `public/avatar.mp4` e lancia `npm run render:final`.

I tempi dei testi (max 3 parole) e delle grafiche sono in `src/timeline.ts`: ritoccali sul parlato reale.
`npm run studio` apre l'editor di Remotion per vederli in tempo reale.
