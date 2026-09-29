# Riccardo Falconi · Landing page

Sito statico (HTML/CSS/JS, nessuna build). Apri `index.html` o pubblicalo su qualsiasi hosting statico (Netlify, Vercel, GitHub Pages).

## Cosa modificare

Tutto si modifica in **`js/config.js`**:

- `whatsapp` — il tuo numero in formato internazionale, solo cifre (es. `393331234567`). **Da impostare prima di pubblicare.**
- `messaggio` — il testo precompilato che arriva su WhatsApp.
- `CASI` — i 3 casi di successo (nome, risultato, prima/dopo, citazione, foto).
- `STORIE` — galleria di foto/video dei clienti. Carica i file in `assets/clienti/` e aggiungi una voce per ciascuno (ci sono esempi commentati).

## Video a scorrimento

Il video dell'hero è convertito in 120 fotogrammi (`assets/frames/lg` per desktop, `assets/frames/sm` per mobile) disegnati su canvas in base allo scroll. Per sostituire il video:

```bash
ffmpeg -i nuovo.mp4 -vf "fps=12,scale=1280:-2" -c:v libwebp -quality 68 assets/frames/lg/f%03d.webp
ffmpeg -i nuovo.mp4 -vf "fps=12,scale=768:-2"  -c:v libwebp -quality 62 assets/frames/sm/f%03d.webp
```

Se il numero di fotogrammi cambia, aggiorna `FRAME_COUNT` in `js/main.js`.
