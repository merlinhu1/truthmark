# Truthmark

**I tuoi agenti scrivono codice. Truthmark mantiene la documentazione pensata per le persone e revisionabile in Git.**

Truthmark installa workflow nativi di Git che permettono agli agenti di coding IA di creare nuova documentazione di prodotto e ingegneria a partire dal codice e dai test esistenti, mantenerla aggiornata dopo ogni modifica al codice e consegnarti normali diff Markdown da revisionare.

[![versione npm](https://img.shields.io/npm/v/truthmark?color=cb3837&label=npm)](https://www.npmjs.com/package/truthmark)
[![CI](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml)
[![Licenza: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Node.js >=24](https://img.shields.io/badge/node-%3E%3D24-339933?logo=node.js&logoColor=white)](../../package.json)

[Inizia](#avvio-rapido-crea-il-tuo-primo-documento-di-verità) · [Sito web](https://merlinhu1.github.io/truthmark/) · [Guida utente](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md) · [GitHub](https://github.com/merlinhu1/truthmark)

<details>
<summary>Leggi questo README in 16 lingue</summary>

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

</details>

## Crea i primi documenti. Mantienili fedeli alla realtà.

La maggior parte degli strumenti di documentazione si ferma dopo la generazione. Truthmark offre agli agenti un ciclo di vita completo della documentazione all’interno del tuo repository:

- **Crea nuova documentazione da software funzionante.** Truth Document legge codice e test, quindi crea documentazione di prodotto o ingegneria con un perimetro definito.
- **Mantieni la documentazione allineata automaticamente.** Truth Sync viene eseguito al passaggio di consegne dell’agente dopo modifiche funzionali al codice e aggiorna la verità del repository prima che il lavoro sia concluso.
- **Trasforma nuovamente la documentazione in codice.** Truth Realize implementa documenti di verità approvati mantenendo un workflow pulito che parte dalla documentazione.
- **Ripristina la proprietà man mano che la codebase cresce.** Truth Structure crea percorsi delimitati e documenti iniziali per aree nuove o sovraccariche.
- **Revisiona tutto in Git.** Codice, decisioni, contratti, architettura, operazioni e comportamento viaggiano insieme al branch.

Nessuna knowledge base ospitata. Nessuna memoria privata degli agenti. Nessuna documentazione intrappolata nella cronologia delle chat.

## Avvio rapido: crea il tuo primo documento di verità

**Requisiti:** Node.js 24 o versione successiva, un repository Git e un host di coding IA supportato per i workflow degli agenti.

Esegui quanto segue nel repository che vuoi far gestire a Truthmark:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark init
```

`truthmark init` permette di selezionare Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, Cursor oppure una configurazione dell’interfaccia a riga di comando neutrale rispetto all’host.

Ora chiedi all’agente configurato di documentare un comportamento reale:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

Truth Document crea un nuovo documento di verità delimitato quando non ne esiste uno, aggiorna il documento proprietario esistente quando è presente e aggiorna il routing quando necessario. Non modifica il codice funzionale.

Revisiona il risultato:

```bash
truthmark check
git status --short --untracked-files=all
git diff
```

Ora dovresti avere:

```text
docs/truthmark/engineering/behaviors/session-timeout.md
docs/truthmark/routes/areas/authentication.md
```

I percorsi esatti seguono la struttura di proprietà del tuo repository. I nuovi file compaiono in `git status`; le modifiche ai file tracciati compaiono in `git diff`.

La modalità di invocazione varia in base all’host. OpenCode usa `/skill truthmark-document`, Antigravity usa `@truthmark-document` e gli altri host supportati utilizzano la propria interfaccia nativa per skill o comandi slash. Consulta la [tabella delle piattaforme](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md#supported-agent-platforms) per i comandi esatti.

Per script e integrazione continua, passa esplicitamente le piattaforme selezionate:

```bash
truthmark init --platform codex --platform cursor
truthmark init --json
```

Scegli `none` in modalità interattiva oppure esegui `truthmark init --clear-platforms` per ottenere un repository neutrale rispetto all’host. Puoi aggiungere piattaforme per agenti in seguito rieseguendo `truthmark init`.

Per la diagnostica di aggiornamento relativa al branch, passa una base Git:

```bash
truthmark check --base <base-ref>
```

## Come funziona Truthmark

<picture>
  <source media="(max-width: 700px)" srcset="../assets/truthmark-workflow-mobile.svg">
  <img src="../assets/truthmark-workflow.svg" alt="Come funziona Truthmark" width="1440">
</picture>

L’interfaccia a riga di comando di Truthmark installa e convalida il contratto del repository. Il tuo agente di coding esegue la revisione delle evidenze e il lavoro di documentazione attraverso i workflow nativi dell’host installati.

Una normale modifica al codice segue un ciclo semplice:

1. L’agente modifica il codice funzionale.
2. Vengono eseguiti i test pertinenti.
3. Truth Sync controlla la documentazione mappata.
4. L’agente crea o aggiorna documentazione e routing quando cambia la verità del repository.
5. Revisioni insieme il diff del codice e il diff della verità.

## Workflow

| Workflow             | Quando usarlo                                                                       | Risultato                                                                           |
| -------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Truth Document**   | Il codice esistente ha bisogno di documentazione                                    | Crea o aggiorna documentazione di prodotto e ingegneria basata su evidenze          |
| **Truth Sync**       | Il codice funzionale è cambiato                                                     | Mantiene allineati la documentazione mappata e il routing prima della consegna      |
| **Truth Structure**  | Una nuova area ha bisogno di proprietà o la documentazione esistente è troppo ampia | Crea percorsi delimitati e strutture iniziali per i documenti                       |
| **Truth Realize**    | Un documento di verità approvato deve diventare software funzionante                | Aggiorna il codice funzionale a partire dalla documentazione                        |
| **Truth Check**      | La verità del repository deve essere sottoposta ad audit                            | Segnala problemi di routing, proprietà, evidenze e documentazione                   |
| **Truthmark Portal** | Il team desidera un sito di documentazione navigabile                               | Genera una presentazione HTML statica e versionata dai documenti di verità Markdown |

Truthmark installa questi workflow come superfici native del repository per Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity e Cursor.

## Cosa ottieni

### Documentazione che parte dalla realtà

Truthmark può creare documentazione per funzionalità di prodotto, comportamento dell’implementazione, interfacce di programmazione delle applicazioni, architettura, workflow, operazioni e test. Codice e test forniscono le evidenze; documenti Markdown delimitati conservano il risultato.

### Documentazione che supera il cambiamento successivo

I percorsi collegano le aree di codice ai documenti canonici. Quando gli agenti modificano il comportamento, Truth Sync sa dove deve risiedere la verità corrispondente e mantiene la consegna revisionabile.

### Verità di prodotto e ingegneria su percorsi separati

La verità di prodotto raccoglie promesse rivolte agli utenti, limiti, decisioni e criteri di accettazione. La verità di ingegneria raccoglie comportamento corrente, contratti, architettura, workflow, operazioni e comportamento dei test.

### Collaborazione nativa di Git

Tutto ciò che conta risiede in file versionati del repository. La verità segue il branch, funziona con normali pull request e rimane visibile a ogni maintainer e agente di coding.

### Operatività local-first

Truthmark non richiede servizi ospitati, daemon, database, archivi vettoriali o server Model Context Protocol. Il repository contiene il proprio workflow di documentazione.

## Dove si colloca Truthmark

| Esigenza                                                      | Soluzione migliore            |
| ------------------------------------------------------------- | ----------------------------- |
| Output migliore da una sessione di agente                     | Un prompt migliore            |
| Continuità personale o a livello di sessione                  | Uno strumento di memoria      |
| Sviluppo di funzionalità che parte da un piano                | Un workflow di specifica      |
| Documentazione con ambito di branch che viaggia con il codice | **Truthmark**                 |
| Correttezza del comportamento                                 | Test e code review            |
| Documentazione assistita dall’IA e revisionabile              | **Truthmark + revisione Git** |

Truthmark è progettato per maintainer e team di ingegneria che usano già agenti di coding IA e vogliono che il repository continui a dire la verità con la stessa rapidità con cui cambia il codice.

## Host supportati e riga di comando

Host per agenti supportati:

- Codex
- Claude Code
- GitHub Copilot
- OpenCode
- Antigravity
- Cursor

<details>
<summary>Riferimento della riga di comando</summary>

| Comando                                                           | Scopo                                                                                                     |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `truthmark init`                                                  | Crea o aggiorna configurazione, routing, template e workflow degli host selezionati                       |
| `truthmark check [--base <ref>]`                                  | Convalida la verità del repository e, facoltativamente, esegue la diagnostica di aggiornamento del branch |
| `truthmark index --json`                                          | Ispeziona i metadati derivati del repository e del routing                                                |
| `truthmark impact --base <ref> --json`                            | Mappa i file modificati su documenti, proprietari e test vicini                                           |
| `truthmark workflow status --workflow <id> [--base <ref>] --json` | Ispeziona applicabilità e obiettivi del workflow                                                          |
| `truthmark validate ...`                                          | Convalida i report dei workflow e le concessioni di scrittura                                             |
| `truthmark uninstall --dry-run` / `truthmark uninstall --apply`   | Mostra in anteprima o rimuove le superfici host generate preservando la verità creata                     |

L’output JSON strutturato è disponibile in tutta l’interfaccia a riga di comando per script e integrazione continua.

</details>

## Scopri di più

- [Guida utente di Truthmark](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md)
- [Indice della documentazione](https://github.com/merlinhu1/truthmark/blob/main/docs/README.md)
- [Panoramica dell’architettura](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/architecture/overview.md)
- [Contratti di configurazione, routing e comandi](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Manutenzione della verità del repository](https://github.com/merlinhu1/truthmark/blob/main/docs/repo/standards/maintaining-repository-truth.md)
- [Contribuire](https://github.com/merlinhu1/truthmark/blob/main/CONTRIBUTING.md)

**Installa Truthmark, seleziona il tuo host di coding e trasforma oggi stesso un comportamento reale in documentazione.**

## Licenza

MIT. Vedi [LICENSE](../../LICENSE).
