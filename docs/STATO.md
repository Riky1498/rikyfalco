# Stato del lavoro

Aggiornato il 01/10/2026.

## Dove siamo

Il ramo `claude/eloquent-bell-37d1x4` (PR #4) contiene:

- l'app ricostruita dall'export Drive del **24/09**;
- il modulo **Visita** nuovo (modello, portale cliente, schede, migrazioni);
- la ricostruzione dagli screenshot della versione del **26/09**.

La build passa e il controllo dei tipi è pulito. **Niente di tutto questo è
ancora pubblicato**: l'app sul telefono è il deployment del 26/09.

## Ricostruito dagli screenshot

- Dashboard: hero con saluto, data, chip, mago e pianeta viola
- Tessere cliente con avanzamento del mese, ultima e prossima lezione, pagamento
- Sezione "Da gestire"
- Ricerca nell'intestazione, anche con ⌘K / Ctrl+K
- Barra inferiore con Calendario al quarto posto
- Pagina "Altro" con l'ordine giusto delle voci
- "Messaggi da inviare" con bozze WhatsApp pronte
- "Report mensile" con incassi, lezioni, nuovi clienti e metodi di pagamento
- WhatsApp nella scheda cliente

## Non identico all'originale

- **Mago**: l'originale era uno sprite PNG a 12 fotogrammi, non più
  recuperabile. Ora è pixel-art vettoriale ridisegnata.
- **Pianeta**: l'originale usava i contorni reali dei continenti da un dataset
  geografico. Ora i continenti sono approssimati con ellissi.

Se salta fuori il PNG originale (`public/assets/riccardo-mage-sheet.png`),
rimetterlo al suo posto è questione di minuti.

## Assistente, scelta fatta

Il pulsante con le scintille c'è e funziona, ma **senza modello linguistico**.
`src/server/assistant.ts` riconosce l'intento della domanda e compone la
risposta leggendo il database: rate scoperte, incassi del mese, appuntamenti,
percorsi in scadenza, scheda di un cliente per nome.

Motivo della scelta: nessuna chiave API da gestire né costi, e su soldi e
scadenze una risposta esatta vale più di una discorsiva.

Per passare a un modello vero in futuro basta riscrivere `ask()` mantenendo la
firma: l'interfaccia (`src/components/assistant.tsx`) e la rotta
(`/api/assistant`) restano com'è.

## Area cliente

`/c/[token]` riusa il `portal_token` già presente sui clienti, lo stesso del
portale visite. I dati escono dalla funzione SQL `client_area` (migrazione
`20261001070000_client_area.sql`), security definer e con un insieme di campi
volutamente ristretto: niente note interne, niente dati di altri clienti.

Mostra prossimo allenamento, giorni rimanenti e lezioni, prossime date,
pagamenti e l'eventuale modulo visita da compilare. Il link si copia dalla
scheda cliente, pulsante **Area cliente**.

Non essendoci screenshot dell'originale, questa pagina è progettata da zero.

## Da fare

1. **Calendario a griglia settimanale** con banner Google Calendar e legenda
   dei colori. Lo screenshot c'è.
2. **Collegare Vercel a GitHub** prima di pubblicare (vedi RECUPERO.md).
3. **Applicare la migrazione** `20261001070000_client_area.sql` al database
   prima di pubblicare, altrimenti `/c/[token]` non trova la funzione.

## Prima di pubblicare

L'app viva è oggi l'unica copia completa del 26/09. Pubblicare la ricostruzione
la sostituirebbe con una versione che ha meno cose. Si pubblica solo quando i
punti 1, 2 e 3 sono chiusi.
