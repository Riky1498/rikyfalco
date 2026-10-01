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

## Da fare

1. **Assistente AI** — il pulsante viola con le scintille. L'originale parlava
   con un modello tramite `/api/assistant` e `src/server/assistant-tools.ts`.
   Nel repo oggi c'è `/api/ai/v1`, che è un esecutore di azioni con token, non
   una chat. Serve decidere il modello e avere la chiave.
2. **Area cliente** su `/c/[token]` — diversa dal portale visite che c'è già su
   `/visita/[token]`. Serve uno screenshot di come la vede il cliente.
3. **Calendario a griglia settimanale** con banner Google Calendar e legenda
   dei colori. Lo screenshot c'è.
4. **Collegare Vercel a GitHub** prima di pubblicare (vedi RECUPERO.md).

## Prima di pubblicare

L'app viva è oggi l'unica copia completa del 26/09. Pubblicare la ricostruzione
la sostituirebbe con una versione che ha meno cose. Si pubblica solo quando i
punti 1, 2 e 3 sono chiusi.
