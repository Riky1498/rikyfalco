/* =========================================================
   CONFIGURAZIONE DEL SITO — modifica solo questo file
   ========================================================= */

window.SITE = {
  // Numero WhatsApp in formato internazionale, SOLO cifre (es. 393331234567)
  whatsapp: "390000000000",

  // Messaggio precompilato che la persona invia cliccando i pulsanti
  messaggio:
    "Ciao Riccardo! Ho visto il tuo sito e vorrei prenotare un incontro conoscitivo in palestra.",

  // Città / zona mostrata sul sito
  zona: "Bovolone (VR)",
};

/* ---------------------------------------------------------
   CASI DI SUCCESSO (3 in evidenza)
   Sostituisci i testi segnaposto con le storie reali.
   foto: percorso di un'immagine in assets/clienti/ (oppure "" per nessuna foto)
   --------------------------------------------------------- */
window.CASI = [
  {
    nome: "Nome Cliente",
    info: "Età · Professione",
    foto: "",
    risultato: "Risultato principale",
    durata: "in X mesi",
    prima: "Com'era la situazione quando è arrivato/a da me: poco tempo, stanchezza, tentativi falliti…",
    dopo: "Cosa è cambiato grazie al percorso: forza, energia, fisico, abitudini…",
    citazione: "Una frase del cliente, con le sue parole.",
  },
  {
    nome: "Nome Cliente",
    info: "Età · Professione",
    foto: "",
    risultato: "Risultato principale",
    durata: "in X mesi",
    prima: "Com'era la situazione quando è arrivato/a da me.",
    dopo: "Cosa è cambiato grazie al percorso.",
    citazione: "Una frase del cliente, con le sue parole.",
  },
  {
    nome: "Nome Cliente",
    info: "Età · Professione",
    foto: "",
    risultato: "Risultato principale",
    durata: "in X mesi",
    prima: "Com'era la situazione quando è arrivato/a da me.",
    dopo: "Cosa è cambiato grazie al percorso.",
    citazione: "Una frase del cliente, con le sue parole.",
  },
];

/* ---------------------------------------------------------
   GALLERIA STORIE — foto e video delle persone che alleni
   Aggiungi quante voci vuoi. Metti i file in assets/clienti/
   tipo: "foto" oppure "video"
   file: es. "assets/clienti/marco.jpg" o "assets/clienti/marco.mp4"
   copertina (solo video, facoltativa): immagine mostrata prima del play
   Se la lista è vuota, la sezione mostra dei riquadri "in arrivo".
   --------------------------------------------------------- */
window.STORIE = [
  // {
  //   tipo: "foto",
  //   file: "assets/clienti/marco.jpg",
  //   nome: "Marco, 42 anni",
  //   titolo: "Impiegato, 2 figli, 3 allenamenti da 40'",
  //   storia: "Racconta qui la sua storia in 2-3 frasi.",
  // },
  // {
  //   tipo: "video",
  //   file: "assets/clienti/giulia.mp4",
  //   copertina: "assets/clienti/giulia.jpg",
  //   nome: "Giulia, 37 anni",
  //   titolo: "Infermiera su turni",
  //   storia: "Racconta qui la sua storia in 2-3 frasi.",
  // },
];
