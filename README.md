# RF Coaching — gestionale clienti

Web app privata per gestire clienti, percorsi, rate, lezioni, visite conoscitive, messaggi e report.
Gira interamente su **Cloudflare** (niente Vercel):

| Parte | Tecnologia |
|---|---|
| Frontend | React + Vite (servito come asset statici dal Worker) |
| Backend/API | Cloudflare Worker (Hono) |
| Database | Cloudflare D1 (SQLite) — con Time Travel: cronologia ripristinabile di 30 giorni |
| Login | Cloudflare Access (Zero Trust) + verifica del token lato server |
| Calendario | Google Calendar: calendario dedicato "RF Coaching" (si vede su PC e iPhone) |
| Backup | CSV su Google Drive ogni notte + download ZIP + ripristino |

## Sezioni

Dashboard · Clienti (+ scheda cliente) · Visita · Pagamenti · Calendario · Notifiche · Messaggi · Report · Attività · Backup · Impostazioni.
In più: ricerca globale `⌘K` / `Ctrl+K` e pulsante viola ✨ per le azioni rapide.

- **Visita**: le persone che incontri per una prima consulenza conoscitiva; con "Rendi cliente" diventano clienti.
- **Messaggi**: l'app prepara da sola solleciti rate, promemoria lezioni e proposte di rinnovo; li apri già scritti su WhatsApp con un tocco.
- **Report**: "Excel" scarica un CSV del mese, "PDF" apre la stampa (Salva come PDF).

## Sicurezza

1. **Cloudflare Access** davanti a tutta l'app: si entra solo con la tua email (codice OTP via email o login Google).
2. Il Worker **verifica comunque** il token firmato da Cloudflare (firma, scadenza, audience, email autorizzata): se qualcuno aggirasse Access riceve 401/403. L'URL pubblico `*.workers.dev` è disattivato.
3. Header di sicurezza rigidi (CSP senza script esterni, HSTS, anti-iframe, no-referrer); font ospitati in locale.
4. Protezione CSRF su tutte le modifiche (header dedicato + controllo Origin); validazione di ogni input lato server.
5. Google con **permessi minimi**: l'app vede solo il calendario e i file *che crea lei* (`calendar.app.created`, `drive.file`). Il token Google è salvato **cifrato AES-256-GCM** e non finisce mai nei backup.
6. Registro **Attività** di ogni modifica; eliminare un cliente richiede di riscriverne il nome; il ripristino richiede di scrivere `RIPRISTINA` e salva prima una copia dei dati attuali su Drive.
7. Protezione dei CSV dalle "formule malevole" quando li apri in Excel.

## Installazione (una volta sola)

Serve: account Cloudflare (gratuito va bene), un dominio gestito su Cloudflare, Node 20+.

```bash
npm install
npx wrangler login
```

### 1. Database
```bash
npx wrangler d1 create rf-coaching-db
```
Copia il `database_id` mostrato dentro `wrangler.toml`.

### 2. Dominio
In `wrangler.toml` decommenta `routes` e metti il tuo sottodominio (es. `coaching.tuodominio.it`); imposta lo stesso indirizzo in `APP_URL`.

### 3. Cloudflare Access (login)
Dashboard Cloudflare → **Zero Trust** → Access → Applications → *Add application* → **Self-hosted**:
- Domain: `coaching.tuodominio.it`
- Policy: *Allow* → Include → **Emails** → la tua email
- Login methods: One-time PIN (e/o Google)
- Session duration: a piacere (es. 24h)

Poi copia:
- **Application Audience (AUD) Tag** → `ACCESS_AUD` in `wrangler.toml`
- il tuo team domain (`<team>.cloudflareaccess.com`, in Zero Trust → Settings) → `ACCESS_TEAM_DOMAIN`

Consigliato: Zero Trust → Settings → Authentication → attiva anche la verifica in due passaggi del tuo account Cloudflare.

### 4. Google (Calendar + Drive)
1. https://console.cloud.google.com → crea un progetto "RF Coaching".
2. *APIs & Services → Library*: abilita **Google Calendar API** e **Google Drive API**.
3. *OAuth consent screen*: tipo **External**, aggiungi la tua email come *Test user*. Scope: `calendar.app.created`, `drive.file`, `openid`, `email`. Poi **Publish app** (in modalità "Testing" il collegamento scade ogni 7 giorni).
4. *Credentials → Create credentials → OAuth client ID* → **Web application**. Authorized redirect URI: `https://coaching.tuodominio.it/api/google/callback`.

### 5. Segreti
```bash
npx wrangler secret put ALLOWED_EMAILS        # la tua email (più email separate da virgola)
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
openssl rand -base64 32                        # genera la chiave…
npx wrangler secret put ENCRYPTION_KEY         # …e incollala qui (conservane una copia sicura)
```

### 6. Pubblica
```bash
npm run deploy
```
Apri il tuo dominio → login → **Impostazioni → Collega Google**. L'app crea il calendario "RF Coaching" e la cartella Drive "RF Coaching – Backup".

### iPhone / PC
- **PC**: il calendario "RF Coaching" compare in calendar.google.com accanto al tuo.
- **iPhone**: Impostazioni → Calendario → Account → aggiungi l'account Google (se non c'è) con "Calendari" attivo. Nell'app Calendario → Calendari, assicurati che "RF Coaching" sia spuntato.
- App in home: apri il sito in Safari → Condividi → *Aggiungi alla schermata Home*.

## Backup e recupero

- **Automatico**: ogni notte alle ~3:30 una cartella `backup_AAAA-MM-GG_HH-MM` su Drive con un CSV per tabella + `manifest.json` (ne vengono tenuti 60, configurabile).
- **Manuale**: Backup → "Backup su Drive ora" oppure "Scarica backup (.zip)".
- **Ripristino**: Backup → scegli una cartella Drive e "Ripristina", oppure "Scegli file CSV…" per caricare i CSV a mano.
- **Disaster recovery totale** (account Cloudflare perso): reinstalla seguendo questa guida su un nuovo account, poi ripristina dai CSV su Drive.
- **D1 Time Travel**: `npx wrangler d1 time-travel restore rf-coaching-db --timestamp=<ISO>` riporta il DB a qualsiasi minuto degli ultimi 30 giorni.

## Sviluppo locale
```bash
cp .dev.vars.example .dev.vars    # DEV_BYPASS_AUTH funziona SOLO su localhost
npm run db:migrate:local
npm run build && npm run dev:worker   # http://localhost:8787
npm test
```

## Personalizzazioni
- Il mago pixel-art in dashboard: metti il tuo sprite in `public/mascot.png` e verrà usato al suo posto.
- Testi dei messaggi automatici: Impostazioni → Testi dei messaggi.
