# RF Coaching — sezione "Visita"

Modulo da integrare nell'app RF Coaching (Next.js + Supabase). Porta nell'app il foglio Google "Visita" (fogli *Anamnesi iniziale*, *Check da duplicare*, *Note 1.0*): solo la struttura (sezioni, domande, opzioni dei menu), nessun dato cliente.

## Contenuto

| File | Cosa fa |
|---|---|
| `scripts/build_modello_visita.py` | Definisce il **Modello visita** e genera il JSON e il seed SQL. Da qui si modificano domande e opzioni. |
| `src/lib/modello-visita.json` | Il Modello visita generato: *Visita iniziale* (90 campi) e *Check* ogni 2 mesi (65 campi). |
| `src/lib/visit-template.ts` | Tipi, calcoli (MG, MM, Kcal, Kcal/kg, totali), radar "Area personale", filtro dei campi del cliente. |
| `supabase/migrations/20260930120000_visite.sql` | Tabelle `visit_templates` e `visits`, vista `visit_overview`, funzioni del portale cliente, automazione giornaliera. |
| `supabase/migrations/20260930120100_modello_visita_seed.sql` | Inserisce il Modello visita predefinito. |

## Come funziona

- Ogni campo ha un responsabile: **cliente** (anamnesi, salute, stile di vita, aderenza, protocollo, voti di benessere) o **coach** (misure, osservazioni posturali, macro, appunti, area personale, obiettivi).
- La visita salva una copia della sezione del modello usata: se il modello cambia, le visite passate restano leggibili.
- `visit_overview` calcola per ogni cliente l'ultima visita, il prossimo check (`visit_interval_days`, default 60 giorni) e lo stato (`mai_fatta`, `in_regola`, `in_scadenza`, `scaduta`, `aperta`).
- `run_visit_automations()` (pg_cron alle 06:05): se il check di un cliente con percorso attivo è in scadenza, crea la visita *check* dal modello e invia una notifica al coach.
- Portale cliente: `client_visit(token)` restituisce solo le sezioni del cliente; `client_visit_submit(token, id, risposte, finale)` salva solo i campi del cliente e, all'invio, notifica il coach.

Differenze rispetto al foglio: la formula *Kcal/kg* della visita iniziale puntava a `#REF!`, qui usa il peso della visita. La sezione *Piano iniziale* duplicata in fondo al foglio è stata unificata.

## Stato

Base dati e modello testati su Postgres locale; **non ancora applicati al database di produzione**. Le pagine dell'app (voce "Visita" nel menu laterale, scheda visite nel cliente, modulo nel portale) vanno scritte sul codice attualmente online, non ancora accessibile da Vercel.
