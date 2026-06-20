# Truthmark

**I tuoi agenti scrivono codice. Truthmark mantiene documentazione pensata per le persone e revisionabile in Git.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Banner di Truthmark](../assets/truthmark-banner.png)

## 🚀 Avvio rapido: eseguirlo localmente in cinque minuti

Esegui questo comando nel repository Git che vuoi far gestire a Truthmark:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

Abilita l’host IA che usi davvero. Le nuove configurazioni sono neutrali rispetto all’host, quindi aggiungi un elenco `platforms` di primo livello a `.truthmark/config.yml` prima dell’inizializzazione:

```yaml
version: 2
platforms:
  - codex        # or: claude-code, github-copilot, opencode, antigravity, cursor
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
```

Poi installa i documenti di verità locali al repository, il routing e le superfici di workflow per agenti:

```bash
truthmark init
truthmark check
git diff
```

Ora prova il percorso di adozione più comune: documentare un comportamento esistente a partire da codice e test. Nel tuo host di coding IA, chiedi al workflow installato:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

Dopo questo, di norma gli utenti non dovrebbero invocare Truth Sync direttamente. Continua a scrivere codice tramite il tuo host IA; le istruzioni installate nel repository dicono all’agente di eseguire i test pertinenti e svolgere la revisione Truth Sync prima della consegna quando cambiano parti di codice funzionale. Tu revisioni il diff di codice risultante insieme al diff dei documenti di verità.

Se vuoi solo la validazione CLI e non vuoi ancora workflow IA specifici per un host, lascia `platforms` omesso ed esegui `truthmark init && truthmark check`; potrai aggiungere una piattaforma più tardi e rieseguire `truthmark init`.

## 💡 Il problema: il divario di documentazione dell’IA

Gli agenti di coding IA sono straordinari nello scrivere codice rapidamente. Ma questa velocità crea una nuova modalità di errore pericolosa: **la storia del repository si allontana dalla realtà.**

* Il comportamento si perde in cronologie chat effimere.
* I documenti di architettura restano rapidamente indietro.
* Le decisioni di prodotto scompaiono dopo la consegna.
* I revisori del codice si ritrovano a esaminare diff di codice grezzi senza capire il “perché”.
* Ogni nuova sessione IA è costretta a riscoprire da zero la verità del repository.

## 🎯 La soluzione: Truthmark

**Truthmark** installa nel tuo repository un livello di workflow nativo di Git. Risolve la parte dello sviluppo con IA che di solito si rompe: aiutare la documentazione a restare allineata al codice.

Invece di sperare che persone e agenti IA si ricordino di aggiornare la documentazione, Truthmark rende la documentazione un’abitudine sistematica e revisionabile direttamente nel repository.

### ✨ Perché Truthmark è unico

Truthmark non è semplicemente un altro strumento di documentazione. È profondamente integrato nel workflow IA:

* **🚫 Nessun lock-in del fornitore:** nessun servizio ospitato, nessun database nascosto, nessun server aggiuntivo da gestire.
* **🌳 100% nativo di Git:** tutto vive nel tuo repository. La verità si muove con il tuo branch.
* **🤝 Architettura a due superfici:** separa nettamente gli strumenti che le persone usano per gestire il repository dai workflow che gli agenti IA usano per scrivere codice.
* **✅ Fiducia tramite verifica:** il lavoro dell’IA diventa più facile da fidare perché il lavoro che cambia comportamento include una decisione o un diff di documento di verità revisionabile da una persona.

## 🔄 Come funziona

Quando un agente IA modifica il tuo codice, il lavoro non è finito. Truthmark installa una protezione di workflow a fine attività che gli agenti seguono prima della consegna:

1. 💻 **Codice:** l’agente modifica codice funzionale.
2. 🧪 **Test:** vengono eseguiti i test pertinenti.
3. 🔍 **Controllo:** `Truth Sync` controlla la documentazione mappata quando viene eseguito il workflow installato.
4. 📝 **Documentazione:** i docs vengono aggiornati dall’agente quando la verità del repository è cambiata.
5. 👀 **Revisione:** una persona revisiona il *diff di codice* + il *diff di verità*.

## 🛠 Due superfici, un unico sistema di verità

Truthmark è intenzionalmente diviso in due superfici distinte per servire sia i maintainer umani sia gli agenti IA.

### 1. 🧑‍💻 La CLI umana (maintainer e CI)
Usata dagli sviluppatori per impostare, configurare e validare il repository.
* `truthmark config` - crea la tua configurazione iniziale.
* `truthmark init` - installa il routing, gli scaffold e le istruzioni necessari.
* `truthmark check` - valida gli artefatti di verità dal terminale.

### 2. 🤖 I workflow rivolti all’IA (agenti)
Truthmark installa skills, prompt e comandi nativi che gli host IA supportati (come Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity e Cursor) comprendono. Questi *non* sono comandi shell; sono punti di ingresso di workflow per l’IA.
* `/truthmark-sync` - il workflow di chiusura che gli agenti seguono dopo modifiche di codice funzionale; non è un normale comando avviato dall’utente.
* `/truthmark-document` - genera docs per codice esistente non documentato.
* `/truthmark-structure` - organizza ampie aree del repository in domini specifici.
* `/truthmark-realize` - **Sviluppo doc-first:** legge documenti di architettura e genera codice coerente.
* `/truthmark-check` - audit della verità del repository guidato dall’agente.

## Cosa ottieni

| Capacità | Cosa fa |
| --- | --- |
| Verità nativa di Git | Mantiene la verità del repository in Markdown e configurazione committati. |
| Documentazione con ambito di branch | La verità si muove con il branch invece di vivere in una sessione privata. |
| CLI umana | Offre ai maintainer comandi di setup, aggiornamento, validazione e ispezione. |
| Workflow rivolti all’IA | Offre agli agenti workflow nativi dell’host per sincronizzazione, documentazione, struttura, realizzazione e audit. |
| Routing esplicito | Mappa aree di codice a documenti di verità canonici. |
| Consegne revisionabili | Produce normali diff Git sia per il codice sia per i documenti di verità. |
| Operatività local-first | Non richiede servizi ospitati, daemon, database o server MCP. |
| Confini di scrittura più sicuri | Separa workflow code-first, doc-first, read-only e doc-only. |
| Validazione | Segnala problemi di routing, autorità, frontmatter, link, superfici generate, ambito di branch, freschezza e copertura. |
| Portal opzionale | Genera, quando esplicitamente abilitato e richiesto, un sito statico HTML committato a partire da documenti di verità Markdown. |

## Panoramica visiva

![Funzionalità di Truthmark](../assets/truthmark-features.png)

**Funzionalità:** cosa installa Truthmark e come è divisa la superficie di workflow.

![Posizione di Truthmark](../assets/truthmark-position.png)

**Posizione:** dove Truthmark si colloca rispetto a prompt, memoria e workflow di specifica.

![Flusso di sincronizzazione di Truthmark](../assets/truthmark-syncflow.png)

**Flusso di sincronizzazione:** come Truth Sync conclude le normali modifiche di codice prima della consegna.

## Perché i team lo adottano

Truthmark è per team che sanno già che gli agenti IA possono generare codice.

Il problema successivo è la governance.

Non governance come cerimonia. Governance come una semplice domanda:

> Dopo questa modifica assistita dall’IA, il repository dice ancora la verità?

Truthmark aiuta i team a rispondere con file committati, routing esplicito e diff revisionabili.

È utile quando hai bisogno di:

- meno deriva della documentazione
- consegne migliori
- verità di prodotto specifica per branch
- documentazione durevole di architettura e API
- ownership esplicita tra docs e codice
- confini di scrittura degli agenti più sicuri
- documentazione revisionabile invece di memoria nascosta
- workflow IA che continuano a funzionare da file committati del repository

## Dove si colloca Truthmark

Truthmark non sostituisce prompt, memoria, specifiche, test o code review.

Offre a questi workflow un luogo durevole in cui atterrare in Git.

| Esigenza | Scelta migliore |
| --- | --- |
| Output migliore da una sessione di agente | Prompt migliore |
| Continuità personale o a livello di sessione | Strumento di memoria |
| Lavoro su funzionalità guidato prima da un piano | Workflow di specifica |
| Verità con ambito di branch che viaggia con il codice | Truthmark |
| Validare la correttezza del comportamento | Test e revisione |
| Revisionare modifiche di documentazione assistite dall’IA | Truthmark più revisione Git |

La corsia di Truthmark è stretta per progettazione:

```text
make repository truth explicit
route it to code
install agent workflows around it
keep the result reviewable in Git
```

## Approfondisci

Il README è la vetrina: contesto rapido, avvio rapido e il modello mentale centrale.

Per l’uso comando per comando, confronti tra superfici, dettagli sulle piattaforme supportate, configurazione, routing, Portal ed esempi, leggi la [guida utente di Truthmark](../user-guide.md).

## Stato del progetto

La release attuale fornisce:

- comandi CLI locali per config, init, check, index, impact e stato dei workflow
- superfici di workflow IA generate per Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity e Cursor
- diagnostica su routing, autorità, frontmatter, link, freschezza, superfici generate, ambito di branch e copertura
- documenti di verità con ambito di branch e artefatti derivati di intelligence del repository

## Documentazione

- [Guida utente](../user-guide.md)
- [Indice docs](../README.md)
- [Panoramica dell’architettura](../truthmark/engineering/architecture/overview.md)
- [Contratti API e CLI](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Guida alla manutenzione della verità del repository](../standards/maintaining-repository-truth.md)

Per i comandi di sviluppo locale e contribuzione, vedi [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Confini di progettazione

Truthmark è intenzionalmente piccolo: locale, committato, con ambito di branch e revisionabile.

Non è un servizio ospitato, un server MCP, un database vettoriale, un livello di memoria nascosto, un prodotto di enforcement CI o un motore autonomo di riscrittura del codice. Aiuta la verità del repository a restare visibile; non sostituisce test, code review o giudizio umano.

## Licenza

MIT. Vedi [LICENSE](../../LICENSE).
