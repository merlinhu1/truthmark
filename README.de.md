# Truthmark

**Deine Agenten schreiben Code. Truthmark macht ihren Kontext in Git prüfbar.**

[English](README.md) | Deutsch | [中文](README.zh.md) | [Español](README.es.md) | [Русский](README.ru.md)

![Truthmark-Banner](docs/assets/truthmark-banner.png)

KI-Coding-Agenten können ein Repository schneller verändern, als Menschen den Kontext ausrichten können.

Truthmark repariert den Teil, der normalerweise nach dem Code-Schreiben bricht: die Repository-Wahrheit.

Es installiert eine Git-native, branch-gebundene Workflow-Schicht, die KI-Coding-Agenten hilft, die richtigen Dokumente zu aktualisieren, Ownership-Grenzen zu respektieren und Menschen normale Diffs zur Prüfung zu hinterlassen.

Kein gehosteter Dienst.

Keine Datenbank.

Keine verborgene Memory-Schicht.

Kein zusätzlicher Server im Betrieb.

Nur Repository-Wahrheit, die mit dem Branch mitwandert.

## Das Problem

KI-Coding-Agenten sind gut darin, Code zu erzeugen. Dadurch entsteht eine neue Fehlerart.

Die Implementierung ändert sich, aber die Repository-Erzählung driftet ab:

- Verhalten lebt im Chatverlauf
- Architekturdokumente fallen zurück
- Produktentscheidungen verschwinden nach der Übergabe
- Reviewer sehen Code-Diffs ohne die zugehörigen Truth-Diffs
- Branches entwickeln unbemerkt unterschiedliche Versionen davon, „was wahr ist“
- jede Agentensitzung muss Kontext neu entdecken

Truthmark verwandelt diesen fragilen Kontext in festgeschriebene Repository-Infrastruktur.

Statt darauf zu vertrauen, dass jeder Mensch und jeder Agent die richtige Dokumentationsgewohnheit beibehält, installiert Truthmark diese Gewohnheit im Repository.

## Das Versprechen

Wenn ein Agent funktionalen Code ändert, sollte die Arbeit nicht mit einem reinen Code-Diff enden.

Der normale Truthmark-Pfad ist:

```text
agent ändert funktionalen Code
relevante Tests laufen
Truth Sync prüft zugeordnete Truth-Dokumente
Truth-Dokumente werden bei Bedarf aktualisiert
Mensch prüft Code-Diff + Truth-Diff
committen oder übergeben
```

Das ist der Kernwert: **KI-Arbeit wird leichter vertrauenswürdig, weil das Repository lesbar bleibt.**

## Zwei Oberflächen, ein Wahrheitssystem

Truthmark ist nicht nur eine CLI.

Es hat zwei unterschiedliche Oberflächen, und diese Unterscheidung ist wichtig.

### 1. Menschenorientierte CLI

Die CLI ist für Maintainer, Reviewer und Automatisierung.

Nutze sie, um ein Repository zu konfigurieren, Workflow-Dateien zu installieren oder zu aktualisieren, Truth-Artefakte zu validieren und optionalen Review-Kontext zu erzeugen.

```bash
truthmark config
truthmark init
truthmark check
```

Die CLI bereitet die Repository-Umgebung vor und validiert sie.

Sie ist nicht die Runtime für den KI-Workflow.

### 2. KI-orientierte Workflow-Oberflächen

Die KI-orientierten Oberflächen sind für Coding-Agenten.

Truthmark installiert host-native Skills, Prompts, Commands, verwaltete Instruktionsblöcke und unterstützte Subagent-Oberflächen, damit KI-Agenten repository-spezifische Truth-Workflows in ihren normalen Coding-Tools befolgen können.

Beispiele:

```text
/truthmark-sync
/truthmark-document
/truthmark-structure
/truthmark-realize
/truthmark-preview
/truthmark-check
```

Sie sehen wie Befehle aus, weil Agenten-Hosts Workflows über Slash-Commands, Prompts, Skills oder Projektbefehle bereitstellen.

Es sind keine Shell-Befehle.

Es sind KI-orientierte Workflow-Einstiegspunkte.

Die Trennung ist das Produkt:

```text
Menschen besitzen den Repository-Vertrag
Truthmark installiert den Vertrag ins Repo
Agenten arbeiten innerhalb dieses Vertrags
Truth-Updates erscheinen als Git-Diffs
Menschen prüfen das Ergebnis
```

## Quick Start

### Voraussetzungen

- Node.js `>=20`
- npm
- ein Git-Repository

### Truthmark installieren

Führe dies in dem Repository aus, das du initialisieren möchtest:

```bash
cd /path/to/your-repo
npm install -g truthmark
```

### Den Repository-Wahrheitsvertrag erstellen

```bash
truthmark config
```

Das erzeugt:

```text
.truthmark/config.yml
```

Prüfe diese Datei, bevor du fortfährst. Sie definiert den festgeschriebenen Hierarchievertrag für das Repository.

### Die Workflow-Oberflächen installieren

```bash
truthmark init
```

Das installiert oder aktualisiert:

- Routendateien
- Truth-Doc-Scaffolding
- verwaltete Instruktionsblöcke
- KI-orientierte Workflow-Oberflächen für konfigurierte Plattformen

### Das Setup validieren

```bash
truthmark check
```

Prüfe danach die generierten Dateien, bevor du committest.

Typische Dateien sind:

```text
.truthmark/config.yml
docs/truthmark/areas.md
docs/truthmark/areas/repository.md
docs/templates/
docs/truth/
AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md
.codex/
.claude/
.opencode/
.github/
.gemini/
```

Die genauen Dateien hängen von `.truthmark/config.yml` ab.

## Erste echte Nutzung

Die meisten Repositories brauchen nach der Initialisierung einen Aufräumschritt.

Das Standard-Scaffold beginnt mit einem breiten Bereich `repository`. Echte Repositories brauchen meist präziseres Routing.

Bitte deinen Agenten, die breite Route in tatsächliche Produkt-, Service-, Domänen- oder Ownership-Bereiche aufzuteilen:

```text
/truthmark-structure die breite repository-area in auth, billing und notifications aufteilen
```

Danach nutzt du deinen KI-Coding-Agenten normal.

Wenn der Agent funktionalen Code ändert, wirkt Truth Sync als Abschlusskontrolle und prüft vor der Übergabe, ob zugeordnete Truth-Dokumente geändert werden müssen.

## Was du bekommst

| Fähigkeit | Was sie tut |
| --- | --- |
| Git-native Wahrheit | Hält Repository-Wahrheit in festgeschriebenem Markdown und Config. |
| Branch-gebundener Kontext | Wahrheit wandert mit dem Branch statt in einer privaten Sitzung zu leben. |
| Menschen-CLI | Gibt Maintainern Befehle für Setup, Aktualisierung, Validierung und Inspektion. |
| KI-orientierte Workflows | Gibt Agenten host-native Workflows für Sync, Dokumentation, Struktur, Preview, Realisierung und Audit. |
| Explizites Routing | Ordnet Codebereiche kanonischen Truth-Dokumenten zu. |
| Prüffähige Übergaben | Erzeugt normale Git-Diffs für Code und Truth-Dokumente. |
| Local-first-Betrieb | Benötigt keinen gehosteten Dienst, Daemon, keine Datenbank und keinen MCP-Server. |
| Sicherere Schreibgrenzen | Trennt code-first, doc-first, read-only und doc-only Workflows. |
| Validierung | Meldet Probleme bei Routing, Autorität, Frontmatter, Links, generierten Oberflächen, Branch-Scope, Freshness und Coverage. |

## Visueller Überblick

![Truthmark-Funktionen](docs/assets/truthmark-features.png)

**Funktionen:** was Truthmark installiert und wie die Workflow-Oberfläche aufgeteilt ist.

![Truthmark-Positionierung](docs/assets/truthmark-position.png)

**Positionierung:** wo Truthmark im Verhältnis zu Prompts, Memory und Spec-Workflows steht.

![Truthmark-Sync-Ablauf](docs/assets/truthmark-syncflow.png)

**Sync-Ablauf:** wie Truth Sync normale Codeänderungen vor der Übergabe abschließt.

## Warum Teams es nutzen

Truthmark ist für Teams, die bereits wissen, dass KI-Agenten Code erzeugen können.

Das nächste Problem ist Governance.

Nicht Governance als Zeremonie. Governance als einfache Frage:

> Erzählt das Repository nach dieser KI-gestützten Änderung noch die Wahrheit?

Truthmark hilft Teams, diese Frage mit festgeschriebenen Dateien, explizitem Routing und prüffähigen Diffs zu beantworten.

Es ist nützlich, wenn du Folgendes brauchst:

- weniger Dokumentationsdrift
- bessere Übergaben
- branch-spezifische Produktwahrheit
- dauerhaften Architektur- und API-Kontext
- explizite Ownership zwischen Dokumentation und Code
- sicherere Schreibgrenzen für Agenten
- prüffähigen Kontext statt verborgener Memory
- KI-Workflows, die weiterhin aus festgeschriebenen Repo-Dateien funktionieren

## Wo Truthmark hineinpasst

Truthmark ersetzt keine Prompts, Memory, Specs, Tests oder Code Review.

Es gibt diesen Workflows einen dauerhaften Ort in Git.

| Bedarf | Besser passend |
| --- | --- |
| Bessere Ausgabe aus einer Agentensitzung | Besserer Prompt |
| Persönliche oder sitzungsbezogene Kontinuität | Memory-Tool |
| Plan-first Feature-Arbeit | Spec-Workflow |
| Branch-gebundene Wahrheit, die mit dem Code mitwandert | Truthmark |
| Korrektheit von Verhalten validieren | Tests und Review |
| KI-gestützte Kontextänderungen prüfen | Truthmark plus Git-Review |

Truthmarks Spur ist absichtlich eng:

```text
Repository-Wahrheit explizit machen
sie zu Code routen
Agenten-Workflows darum installieren
das Ergebnis in Git prüffähig halten
```

## Wie Truthmark läuft

Truthmark läuft lokal gegen den aktiven Git-Worktree.

Die menschenorientierte CLI liest und schreibt Repository-Dateien und beendet sich danach.

Die KI-orientierten Workflow-Oberflächen sind festgeschriebene Dateien, die Agenten-Hosts später laden können. Dadurch können Agenten dem installierten Workflow aus dem Repository-Zustand folgen, statt von einem Hintergrundprozess von Truthmark abzuhängen.

Die dauerhaften Oberflächen sind normale Repo-Dateien:

```text
.truthmark/config.yml
docs/truthmark/areas.md
docs/truthmark/areas/**/*.md
docs/**/*
AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md
.codex/skills/
.claude/skills/
.opencode/skills/
.github/prompts/
.gemini/commands/truthmark/
```

Generierte Workflow-Oberflächen enthalten Truthmark-Versionsmarker. Nach einem Upgrade von Truthmark erneut ausführen:

```bash
truthmark init
```

Prüfe danach die generierten Diffs.

## Unterstützte Agentenplattformen

Die Standardkonfiguration enthält jede unterstützte Plattform.

Entferne Plattformen, die du nicht nutzt, aus `.truthmark/config.yml`, und führe danach erneut aus:

```bash
truthmark init
```

| Plattform-Configname | Generierte Oberfläche | Aufrufform |
| --- | --- | --- |
| `codex` | `.codex/skills/truthmark-*/`, `.codex/agents/` | `/truthmark-*` oder `$truthmark-*` |
| `claude-code` | `.claude/skills/truthmark-*/`, `.claude/agents/`, `CLAUDE.md` | `/truthmark-*` |
| `github-copilot` | `.github/prompts/`, `.github/agents/`, `.github/copilot-instructions.md` | `/truthmark-*` in unterstützten Copilot-IDEs; `@truth-*` Custom Agents in Copilot CLI |
| `opencode` | `.opencode/skills/truthmark-*/`, `.opencode/agents/` | `/skill truthmark-*` |
| `gemini-cli` | `.gemini/commands/truthmark/`, `GEMINI.md` | `/truthmark:*` |

Unbekannte Plattformnamen sind Config-Fehler.

Das Entfernen einer Plattform stoppt künftige Aktualisierungen für diese Plattform. Es löscht zuvor generierte Dateien nicht.

## KI-orientierte Workflows

Diese Workflows werden in unterstützte KI-Coding-Hosts installiert.

Sie werden von Agenten oder Agenten-Hosts während der Repository-Arbeit genutzt. Sie sind keine Top-Level-Shell-Befehle.

| Workflow | Richtung | Nutze ihn, wenn | Schreibgrenze |
| --- | --- | --- | --- |
| Truth Structure | topology-first | Die Standardroute zu breit ist, Ownership mehrere Bereiche umfasst oder Routendateien noch auf Platzhalter zeigen. | Erstellt oder repariert Routing und Starter-Truth-Dokumente. |
| Truth Document | implementation-first | Verhalten bereits im Code existiert, aber kanonische Truth-Dokumente fehlen oder schwach sind. | Schreibt nur Truth-Dokumente und Routing. Funktionaler Code darf nicht geändert werden. |
| Truth Sync | code-first | Funktionaler Code geändert wurde und zugeordnete Truth-Dokumente vor der Übergabe aktualisiert werden müssen könnten. | Aktualisiert Truth-Dokumente. Funktionaler Code darf von Truth Sync nicht umgeschrieben werden. |
| Truth Preview | read-only | Der Agent vor Änderungen wahrscheinliches Routing einschätzen muss. | Liest nur. Autorisiert keine Schreibzugriffe. |
| Truth Realize | doc-first | Produkt- oder Architektur-Truth-Dokumente führen und Code daran angepasst werden soll. | Aktualisiert nur Code. Der Agent darf die Truth-Dokumente, die er realisiert, nicht bearbeiten. |
| Truth Check | audit-first | Ein Reviewer oder Agent die Gesundheit der Repository-Wahrheit auditieren muss. | Auditiert und berichtet. |

### Wichtige Unterscheidung

Verwechsle diese zwei Oberflächen nicht:

| Oberfläche | Genutzt von | Beispiel | Bedeutung |
| --- | --- | --- | --- |
| Menschen-CLI | Menschen, Skripte, CI-ähnliche Checks | `truthmark check` | Truth-Artefakte des Repositorys im Terminal validieren. |
| KI-orientierter Workflow | Coding-Agenten und Agenten-Hosts | `/truthmark-check` | Einen Agenten bitten, den installierten Audit-Workflow auszuführen. |

Die Namen sind absichtlich verwandt, aber die Oberflächen sind unterschiedlich.

## Normale KI-gestützte Codeänderung

Die meisten Nutzer sollten Truth Sync nicht jedes Mal manuell aufrufen müssen.

Truth Sync ist die installierte Abschlusskontrolle für funktionale Codeänderungen.

```text
agent ändert funktionalen Code
agent führt relevante Tests aus oder fordert sie an
installierter Workflow erkennt, dass funktionaler Code geändert wurde
Truth Sync prüft zugeordnete Truth-Dokumente
agent aktualisiert Truth-Dokumente bei Bedarf
Mensch prüft Code-Diff + Truth-Diff
```

Der direkte Aufruf ist trotzdem nützlich für Fehlersuche, frühes Synchronisieren oder eine explizite Übergabe:

```text
/truthmark-sync die Repository-Wahrheit jetzt vor der Übergabe synchronisieren
```

## Bestehendes Verhalten ohne Doku

Nutze Truth Document, wenn die Implementierung bereits existiert, aber die Repository-Wahrheit unvollständig ist.

```text
/truthmark-document das implementierte Session-Timeout-Verhalten unter docs/truth/authentication dokumentieren
```

Truth Document prüft Implementierung, Tests, Routendateien und vorhandene Dokumente als Evidenz.

Es schreibt nur Truth-Dokumente und Routing.

Es darf keinen funktionalen Code ändern.

## Doc-first-Änderungen

Nutze Truth Realize, wenn eine Produkt- oder Architekturentscheidung in Dokumenten beginnt und Code daran angepasst werden soll.

```text
/truthmark-realize docs/truth/authentication/session-timeout.md in Code realisieren
```

Truth Realize ist doc-first.

Die Truth-Dokumente führen. Der Code folgt.

Der Agent darf die Truth-Dokumente, die er realisiert, nicht bearbeiten.

## Read-only-Routing-Preview

Nutze Truth Preview vor einer Änderung, wenn der Agent wahrscheinliches Routing verstehen muss.

```text
/truthmark-preview das wahrscheinliche Truth-Routing für Änderungen an der Billing-API prüfen
```

Truth Preview ist read-only.

Es ist Auswahl- und Planungshilfe, keine Schreibautorisierung und kein Ersatz für Truth Check.

## Repository-Truth-Audit

Nutze Truth Check, wenn du einen agentenorientierten Audit-Workflow möchtest.

```text
/truthmark-check Routing und Truth-Coverage vor dem Review auditieren
```

Nutze die menschenorientierte CLI, wenn du Terminalvalidierung möchtest:

```bash
truthmark check
```

Beides ist nützlich. Es ist nicht dieselbe Oberfläche.

## Menschenorientierte CLI-Befehle

Die meisten Maintainer beginnen mit drei Befehlen.

| Befehl | Zweck |
| --- | --- |
| `truthmark config` | Erstellt `.truthmark/config.yml`. Schreibt nur diese Datei, außer `--stdout` wird verwendet. |
| `truthmark init` | Installiert oder aktualisiert konfigurierte Workflow-Oberflächen aus der geprüften Config. |
| `truthmark check` | Validiert Config, Autorität, Routing, entscheidungstragende Dokumente, Frontmatter, interne Links, Branch-Scope, generierte Oberflächen, Freshness und Coverage-Diagnostik. |

Optionale Repository-Intelligence-Helfer erzeugen abgeleiteten Review-Kontext für den aktiven Checkout.

Sie sind keine Quellen der Wahrheit.

| Befehl | Zweck |
| --- | --- |
| `truthmark index` | Baut RepoIndex- und RouteMap-JSON für den aktiven Checkout. |
| `truthmark impact --base <ref>` | Ordnet geänderte Dateien gerouteten Truth-Dokumenten, besitzenden Routen, nahen Tests und öffentlichen Symbolen zu. |
| `truthmark context --workflow <workflow> [--base <ref>]` | Erzeugt ein begrenztes ContextPack für Truth Sync, Truth Document oder Truth Realize. Nutze `--format markdown` für eine menschenlesbare Fassung. |

Strukturierte Ausgabe ist mit `--json` verfügbar, wo sie unterstützt wird.

## Konfiguration

Truthmark ist config-first.

Die wichtigste Config-Datei ist:

```text
.truthmark/config.yml
```

Neue Repositories sollten ausführen:

```bash
truthmark config
```

Prüfe danach die generierte Config, bevor du ausführst:

```bash
truthmark init
```

Wichtige Config-Bereiche sind:

| Config-Bereich | Zweck |
| --- | --- |
| `version` | Version des Config-Vertrags. |
| `platforms` | Agenten-Hosts, die plattformspezifische generierte Oberflächen erhalten sollen. |
| `docs.layout` | Aktueller Docs-Layoutmodus. |
| `docs.roots` | Benannte kanonische Dokumentationswurzeln. |
| `docs.routing.root_index` | Pfad zum Root-Routenindex. |
| `docs.routing.area_files_root` | Verzeichnis für delegierte untergeordnete Routendateien. |
| `docs.routing.default_area` | Dateiname des initial erzeugten untergeordneten Routings ohne Erweiterung. |
| `docs.routing.max_delegation_depth` | Aktuelle maximale Routing-Delegationstiefe. |
| `authority` | Geordnete kanonische Dokumente und Globs, die als Repository-Truth-Autorität dienen. |
| `instruction_targets` | Dateien, die gemeinsam verwaltete Instruktionsblöcke erhalten, etwa `AGENTS.md`. |
| `frontmatter.required` | Metadatenfelder, die bei Fehlen Error-Diagnostik erzeugen. |
| `frontmatter.recommended` | Metadatenfelder, die bei Fehlen Review-Diagnostik erzeugen. |
| `ignore` | Glob-Muster, die von relevanten Checks und Routing-Logik ausgeschlossen sind. |

## Repository-Truth-Routing

Truthmark ordnet Codeoberflächen Truth-Dokumenten zu.

Die wichtigsten Routendateien sind:

```text
docs/truthmark/areas.md
docs/truthmark/areas/**/*.md
```

Eine Route sagt dem Agenten:

- welche Codeoberfläche zu einem Bereich gehört
- welche Truth-Dokumente diesen Bereich besitzen
- wann Truth aktualisiert werden sollte
- welche Art von Truth-Dokument beteiligt ist

Das Standard-Scaffold beginnt breit. Bestehende Repositories sollten die Standardroute meist in echte Ownership-Bereiche aufteilen.

Beispiel:

```text
/truthmark-structure die breite repository-area in frontend, backend, billing und deployment aufteilen
```

Gutes Routing gibt Truth Sync präzise Ziele.

Schlechtes Routing zwingt Agenten zum Raten.

## Was Truthmark installiert

Truthmark installiert eine kompakte, repository-native Truth-Schicht.

Typische Scaffold- und generierte Dateien sind:

```text
.truthmark/config.yml

docs/truthmark/areas.md
docs/truthmark/areas/**/*.md

docs/templates/behavior-doc.md
docs/templates/contract-doc.md
docs/templates/architecture-doc.md
docs/templates/workflow-doc.md
docs/templates/operations-doc.md
docs/templates/test-behavior-doc.md

docs/truth/README.md
docs/truth/repository/README.md
docs/truth/repository/overview.md

docs/standards/default-principles.md
docs/standards/documentation-governance.md

AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md

.codex/skills/truthmark-*/
.codex/agents/

.claude/skills/truthmark-*/
.claude/agents/

.opencode/skills/truthmark-*/
.opencode/agents/

.github/prompts/truthmark-*.prompt.md
.github/agents/

.gemini/commands/truthmark/*.toml
```

Truthmark bewahrt manuellen Inhalt außerhalb verwalteter Instruktionsblöcke.

Generierte Workflow-Oberflächen werden von Truthmark verwaltet und können durch erneutes Ausführen aktualisiert werden:

```bash
truthmark init
```

## Subagents und begrenzte Evidenzprüfungen

Wo der Host es unterstützt, kann Truthmark projektbezogene Prüfer-Agenten und einen geleasten `truth-doc-writer` installieren.

Diese helfen, große Truth-Aufgaben begrenzt zu halten:

- Route Auditors prüfen Route-Ownership
- Claim Verifiers prüfen, ob Dokumentclaims durch Evidenz gestützt sind
- Doc Reviewers prüfen Truth-Doc-Qualität
- geleaste Doc Writers bearbeiten begrenzte Truth-Doc-Schreib-Shards

Der Parent-Workflow besitzt weiterhin finale Interpretation, Schreibgrenzen, Diff-Validierung und Abnahme.

Das ist wichtig: Subagents helfen bei begrenzter Evidenzarbeit. Sie ersetzen den Haupt-Workflow-Vertrag nicht.

## Review-Schleife

Truthmark ist für normalen Git-Review entworfen.

Eine gute KI-gestützte Übergabe sollte Folgendes zeigen:

```text
Code-Diff
Test-Evidenz
Truth-Doc-Diff, falls nötig
Routing-Änderungen, falls nötig
Agentenbericht
```

Der Reviewer sollte beantworten können:

- Welcher Code hat sich geändert?
- Welche Truth-Dokumente besitzen diesen Code?
- Mussten diese Dokumente aktualisiert werden?
- Falls nicht, warum nicht?
- Ist der Agent innerhalb der Workflow-Schreibgrenze geblieben?
- Sind Test- oder Verifikationsevidenz enthalten?

## Beispiele

### Ein Repository initialisieren

```bash
npm install -g truthmark
truthmark config
truthmark init
truthmark check
```

### Unbenutzte Agentenplattformen entfernen

Bearbeiten:

```text
.truthmark/config.yml
```

Danach erneut ausführen:

```bash
truthmark init
truthmark check
```

### Breites Routing aufteilen

```text
/truthmark-structure die breite repository-area in auth, billing, notifications und deployment aufteilen
```

### Implementiertes Verhalten dokumentieren

```text
/truthmark-document den implementierten Password-Reset-Flow unter docs/truth/authentication dokumentieren
```

### Nach Codeänderungen synchronisieren

```text
/truthmark-sync die Repository-Wahrheit jetzt vor der Übergabe synchronisieren
```

### Eine doc-first Entscheidung realisieren

```text
/truthmark-realize docs/truth/billing/invoice-retry-policy.md in Code realisieren
```

### Truth-Gesundheit im Terminal auditieren

```bash
truthmark check
```

### Branch-Impact-Kontext erzeugen

```bash
truthmark impact --base main
```

### Workflow-Kontext erzeugen

```bash
truthmark context --workflow truth-sync --base main --format markdown
```

## Projektstatus

Truthmark V1 bietet derzeit:

- `truthmark config`
- `truthmark init`
- `truthmark check`
- `truthmark index`
- `truthmark impact`
- `truthmark context`
- Branch-Scope-Metadaten
- verwaltete Instruktionsblöcke
- generierte Truth-Structure-Workflow-Oberflächen
- generierte Truth-Document-Workflow-Oberflächen
- generierte Truth-Sync-Workflow-Oberflächen
- generierte Truth-Preview-Workflow-Oberflächen
- generierte Truth-Realize-Workflow-Oberflächen
- generierte Truth-Check-Workflow-Oberflächen
- Diagnostik für Route, Autorität, Entscheidungsstruktur, Frontmatter, Links, Freshness, generierte Oberflächen und Coverage
- abgeleitete RepoIndex-, RouteMap-, ImpactSet- und ContextPack-Artefakte
- host-spezifische Oberflächen für Codex, Claude Code, GitHub Copilot, OpenCode und Gemini CLI

## Entwicklung

Abhängigkeiten installieren:

```bash
npm install
```

Die lokale Entwicklungs-CLI ausführen:

```bash
npm run dev -- init
npm run dev -- check
```

Den vollständigen Projektcheck ausführen:

```bash
npm run check
```

Nützliche Skripte:

| Skript | Zweck |
| --- | --- |
| `npm run dev` | Führt den TypeScript-CLI-Einstiegspunkt mit `tsx` aus. |
| `npm run build` | Baut das Paket. |
| `npm run lint` | Führt ESLint aus. |
| `npm run typecheck` | Führt TypeScript-Checks aus. |
| `npm run test` | Führt Tests aus. |
| `npm run check` | Führt Lint, Typecheck, Tests und Build aus. |
| `npm run release:check` | Führt release-orientierte Validierung aus. |

Wenn du Truthmark selbst änderst, siehe [CONTRIBUTORS.md](CONTRIBUTORS.md).

## Dokumentation

Die README ist der schnelle Pfad für Evaluation und Setup.

Aktuelles Verhalten im Detail lebt unter `docs/`:

- [Dokumentationsindex](docs/README.md)
- [Architekturüberblick](docs/architecture/overview.md)
- [API- und CLI-Verträge](docs/truth/contracts.md)
- [Init- und Scaffold-Verhalten](docs/truth/init-and-scaffold.md)
- [Check-Diagnostik](docs/truth/check-diagnostics.md)
- [Installierte Workflows](docs/truth/workflows/overview.md)
- [Leitfaden zur Pflege von Repository-Wahrheit](docs/standards/maintaining-repository-truth.md)

## Designgrenzen

Truthmark ist absichtlich klein.

Es ist nicht:

- ein gehosteter Dienst
- ein MCP-Server
- eine Vektordatenbank
- ein Generator für Dokumentations-Websites
- ein CI- oder PR-Enforcement-Produkt
- ein Ersatz für Tests, Code Review oder technische Führung
- eine autonome Code-Rewrite-Engine
- ein Framework für Modelltraining oder Fine-Tuning
- eine verborgene Memory-Schicht

Diese Grenzen sind Teil des Produkts.

Truthmark hält den Workflow lokal, festgeschrieben, branch-gebunden und prüffähig.

## Sicherheit und Review-Disziplin

Truthmark hilft dem Repository, ehrlich zu bleiben. Es beweist nicht, dass der Code korrekt ist.

Teams sollten weiterhin:

- relevante Tests ausführen
- funktionale Codeänderungen prüfen
- Truth-Doc-Änderungen prüfen
- Secrets aus der Dokumentation heraushalten
- repository-spezifische Instruktionen außerhalb verwalteter Blöcke halten
- Diffs generierter Workflow-Oberflächen nach Upgrades prüfen
- menschliche Ownership über Produkt- und Architekturentscheidungen behalten

Truthmark macht Agentenkontext sichtbar. Es ersetzt menschliches Urteil nicht.

## Roadmap-Richtung

Die aktuelle Zukunftsrichtung betont:

- stärkere Evidenzberichte in `truthmark check`
- klarere Adoptionsbeispiele
- Beispiel-Repositories mit echten Truth-Sync-Zyklen
- Migrationsleitfäden für Teams, die bereits Agenten-Instruktionsdateien nutzen
- Konformitätstests für generierte Host-Oberflächen
- route-aware Hinweise auf stale truth
- begrenzte Implementierungschecklisten für doc-first Arbeit

Der Schwerpunkt bleibt gleich:

```text
Repository-Wahrheit
agent-native Workflows
Git-Review
branch-gebundener Kontext
```

## Lizenz

MIT. Siehe [LICENSE](LICENSE).
