# Truthmark ist die Wahrheitsschicht für KI-Softwareentwicklung.

[English](README.md) | Deutsch | [中文](README.zh.md) | [Español](README.es.md) | [Русский](README.ru.md)

KI-Coding-Agenten können bereits gut Code schreiben. Womit sie weiterhin Schwierigkeiten haben: Produktabsicht, Architekturgrenzen und Zuständigkeiten im Repository zuverlässig aus veralteter Dokumentation, verstreuten Chats und flüchtigem Tool-Gedächtnis zu rekonstruieren.
Truthmark löst das, indem es branch-lokale Repository-Wahrheit zu einer erstklassigen Laufzeitfläche für Agenten macht. Es installiert eine Git-native, branch-gebundene Wahrheitsschicht direkt im Repository, gibt Agenten explizite Routing- und Workflow-Grenzen und sorgt dafür, dass diese Wahrheit mit dem Code mitwandert, der tatsächlich ausgeliefert wird.
Das ist kein besseres Prompt-Engineering. Es ist eine besser steuerbare Art, KI in einer echten Codebasis einzusetzen: weniger wiederholte Entscheidungen, weniger veraltete Dokumentation, sauberere Übergaben und KI-Coding-Sitzungen, die prüfbare Engineering-Aufzeichnungen hinterlassen, statt im Prompt-Verlauf oder in undurchsichtigen Tool-Zuständen zu verschwinden.
Für Teams, die bereits wissen, dass Agenten Code erzeugen können, und jetzt wollen, dass das Repository selbst lesbar, prüfbar und steuerbar bleibt.

## Was Truthmark löst

KI-Coding ist heute leicht zu starten, aber teuer zu beherrschen. Sobald Agenten schnell Code schreiben können, wird Repository-Wahrheit zur Steuerfläche.
Dieses Fehlermuster zeigt sich vorhersehbar: Anforderungen bleiben im Chat, Architekturentscheidungen werden wiederholt, Agenten bearbeiten die falschen Bereiche, und Branches erben Kontext, den Reviewer nicht zuverlässig prüfen können. Der Code kommt vielleicht schnell voran, aber dem Repository wird schwerer zu vertrauen.
Truthmark verändert das Arbeitsmodell:

- Branch-lokale Wahrheit wandert mit dem Branch, statt in einem privaten Tool-Speicher zu liegen.
- Git macht diese Wahrheit prüfbar, diffbar und im Team teilbar.
- Dokumentation folgt dem Code, statt still in Fiktion abzudriften.
- Routing bleibt in `docs/truthmark/areas.md` und delegierten untergeordneten Routendateien explizit, damit Agenten wissen, welche Dokumentation welchen Code verantwortet.
- Aktive Produkt- und Architekturentscheidungen stehen in den kanonischen Dokumenten, die sie betreffen, nicht in zeitgestempelten Planungsprotokollen.
- Local-first-Workflows vermeiden die Abhängigkeit von Daemon, Datenbank, Remote-Dienst oder MCP.
- Das Modell funktioniert in Codebasen mit JavaScript, TypeScript, Go, Python, C# und Java.

Für Tech Leads liegt der Wert in Governance ohne Theater: Tests, Code Review und Ownership leisten weiterhin die eigentliche Arbeit; Truthmark macht den Kontext des Agenten dauerhaft, prüfbar und branch-gebunden.

## Wo Truthmark hineinpasst

Truthmark versucht nicht, jedes andere KI-Workflow-Tool zu ersetzen. Es sitzt in einer bestimmten Schicht des Stacks:

| Wenn du brauchst                                                            | Beste Wahl                                  |
| --------------------------------------------------------------------------- | ------------------------------------------- |
| Bessere Ergebnisse aus einer einzelnen Coding-Sitzung                       | Bessere Prompts und enger gefasste Aufgaben |
| Bequemlichkeit über Sitzungen hinweg für einen Agenten oder eine Person     | Speicherwerkzeuge                           |
| Spec-first-Planung für neue Features                                        | Spezifikations-Tools wie Spec Kit           |
| Branch-gebundene, prüfbare Repository-Wahrheit, die mit dem Code mitwandert | Truthmark                                   |

Der Punkt ist nicht, dass Prompts, Memory oder Specs nutzlos wären. Der Punkt ist, dass keines davon allein Repository-Wahrheit in ein in Git festgeschriebenes, prüfbares Asset verwandelt, das Übergaben, Reviews und auseinanderlaufende Branches übersteht.

## Inhalt

- [Was Truthmark löst](#was-truthmark-löst)
- [Wo Truthmark hineinpasst](#wo-truthmark-hineinpasst)
- [Workflow-Fläche](#workflow-fläche)
- [Erste Schritte](#erste-schritte)
- [Wie es läuft](#wie-es-läuft)
- [Was es installiert](#was-es-installiert)
- [Befehle](#befehle)
- [Warum es existiert](#warum-es-existiert)
- [Projektstatus](#projektstatus)
- [Dokumentation](#dokumentation)
- [Nicht-Ziele](#nicht-ziele)
- [Lizenz](#lizenz)

## Workflow-Fläche

Truthmark macht Repository-Wahrheit zu einer expliziten Workflow-Fläche für Agenten:

- `TRUTHMARK.md` definiert den branch-lokalen Workflow-Vertrag.
- `docs/truthmark/areas.md` und delegierte untergeordnete Routendateien ordnen Codebereiche den Dokumenten zu, die sie verantworten.
- Truth Sync hält zugeordnete Wahrheitsdokumente bei funktionalen Änderungen synchron.
- Truth Realize gibt doc-first Änderungen einen begrenzten Pfad für Code-Updates.
- `truthmark check` validiert die daraus entstehenden Wahrheitsartefakte.
- Das gesamte Modell bleibt local-first und Git-nativ.

Das ist das Kernversprechen: Agentenkontext wird zu festgeschriebenem Repository-Zustand statt zu einem privaten Sitzungsartefakt.

## Erste Schritte

Wenn du Truthmark zunächst gegen ein anderes lokales Repository ausprobieren willst, bevor das Paket anderswo veröffentlicht ist:

```bash
cd /path/to/truthmark
npm install
npm run build
cd /path/to/your-repo
node /path/to/truthmark/dist/main.js config
node /path/to/truthmark/dist/main.js init
node /path/to/truthmark/dist/main.js check
```

Prüfe `.truthmark/config.yml` vor `init`; es ist der in Git festgeschriebene Hierarchievertrag. Nach `init` solltest du die generierte Workflow-Fläche und die Routendateien prüfen, damit die gerouteten Dokumente zu den Dokumenten passen, die deinen Code tatsächlich verantworten:

```text
.truthmark/config.yml
TRUTHMARK.md
docs/truthmark/areas.md
docs/truthmark/areas/repository.md
docs/features/README.md
docs/features/repository/README.md
docs/features/repository/overview.md
AGENTS.md
CLAUDE.md
skills/truthmark-structure/SKILL.md
skills/truthmark-sync/SKILL.md
skills/truthmark-realize/SKILL.md
skills/truthmark-check/SKILL.md
```

Wenn du zusätzliche Plattformen in `.truthmark/config.yml` aktivierst, aktualisiert Truthmark die entsprechenden verwalteten Flächen beim nächsten `init`.
Die standardmäßig erzeugte Struktur verwendet `README.md`-Dateien von Features als Indizes und beginnt die Wahrheit über aktuelles Verhalten in begrenzten Blattdokumenten wie `docs/features/repository/overview.md`.

## Wie es läuft

Truthmark legt nicht fest, welcher Subagent Truth Sync ausführen soll. Der handelnde Agent und die Host-Umgebung entscheiden, ob delegiert oder der Workflow inline ausgeführt wird.
Die meisten Nutzer sollten Truth Sync nicht direkt aufrufen müssen. Der normale Ablauf ist:

```text
Agent ändert funktionalen Code
relevante Tests laufen
Truth Sync wird vor dem Abschluss des Agenten ausgelöst
Truth-Doc-Diff prüfen, falls einer erzeugt wurde
Arbeit committen oder übergeben
```

Truth Sync ist code-first: Code führt, Wahrheitsdokumente folgen, und Truth Sync darf funktionalen Code nicht umschreiben. Seine Hauptaufgabe ist eine automatische Abschlusskontrolle, wenn funktionaler Code geändert wurde. Direkte Aufrufe sind vor allem für Fehlersuche, frühe Synchronisierung vor einer Übergabe oder bewusstes Ausführen des Workflows gedacht.
Codex-Nutzer können es mit `/truthmark-sync` oder `$truthmark-sync` aufrufen. Hosts im OpenCode-Stil können `/skill truthmark-sync` verwenden.
Nutze diesen Ablauf, wenn eine Produkt- oder Architekturentscheidung in der Dokumentation beginnt:

```text
Benutzer bearbeitet Wahrheitsdokumente
Benutzer ruft Truth Realize ausdrücklich auf
Agent liest Wahrheitsdokumente und relevanten Code
Agent aktualisiert nur Code
relevante Tests laufen
Arbeit committen oder übergeben
```

Truth Realize ist manuell und doc-first: Wahrheitsdokumente führen, Code folgt, und der Agent darf die Wahrheitsdokumente, die er realisiert, nicht bearbeiten.
Codex-Nutzer können es mit `/truthmark-realize` oder `$truthmark-realize` aufrufen. Hosts im OpenCode-Stil können `/skill truthmark-realize` verwenden.

## Was es installiert

Truthmark hält die dauerhafte Workflow-Fläche klein:

- `.truthmark/config.yml` für maschinenlesbare Konfiguration
- `TRUTHMARK.md` für den branch-lokalen Workflow-Vertrag
- `docs/truthmark/areas.md` für den Root-Routenindex
- `docs/truthmark/areas/**/*.md` für delegierte untergeordnete Routendateien
- verwaltete Instruktionsblöcke für konfigurierte Plattformen wie `AGENTS.md`, `CLAUDE.md`, Cursor-Regeln, Copilot-Anweisungen und `GEMINI.md`
- Codex- und repo-lokale Skills für Truth Structure, Truth Sync, Truth Realize und Truth Check

Die installierten Workflow-Flächen sind die Runtime:

- Truth Structure erstellt oder repariert Area-Routing und erste Wahrheitsdokumente.
- Truth Sync hält zugeordnete Wahrheitsdokumente bei funktionalen Änderungen synchron.
- Truth Realize aktualisiert Code so, dass er zu den Wahrheitsdokumenten passt.
- Truth Check auditiert die Gesundheit der Repository-Wahrheit.

`README.md`-Dateien von Features sind Indizes. Truth Sync soll begrenzte Blattdokumente für aktuelles Verhalten lesen und aktualisieren.

Generierte Flächen werden von Truthmark verwaltet, enthalten einen Versionsmarker und können mit `truthmark init` aktualisiert werden.

## Befehle

Truthmark V1 hält die CLI absichtlich klein. In nachgelagerten Repositories erzeugt `truthmark config` den in Git festgeschriebenen Hierarchievertrag, `truthmark init` installiert und aktualisiert Workflow-Flächen aus dieser geprüften Konfiguration, und `truthmark check` validiert Wahrheitsartefakte für manuelle Audits, CI oder Fehlersuche.

```bash
truthmark config
truthmark init
truthmark check
truthmark config --json
truthmark check --json
```

`config` schreibt nur `.truthmark/config.yml`, außer `--stdout` wird verwendet.
`init` benötigt `.truthmark/config.yml` und installiert oder aktualisiert anschließend die lokalen Workflow-Dateien.
`check` validiert Konfiguration, Autorität, Routing, entscheidungstragende Dokumente, Frontmatter, interne Links, Branch-Scope und Coverage-Diagnostik.
Truth Structure, Truth Sync, Truth Realize und Truth Check sind installierte Agenten-Workflows, keine täglichen Top-Level-CLI-Befehle.

## Warum es existiert

Die meisten KI-Coding-Workflows optimieren für die nächste Antwort. Truthmark optimiert für die nächste Übergabe.
Es geht davon aus, dass ernsthafte Teams Folgendes brauchen:

- branch-spezifische Produktwahrheit
- dauerhafte Architektur- und API-Entscheidungen
- explizite Zuständigkeit zwischen Dokumentation und Code
- sichere Schreibgrenzen für Agenten
- normale Git-Diffs, die Menschen prüfen können
- lesbares Markdown, das Teammitglieder ohne Spezialwerkzeuge inspizieren können
- Wahrheit, die mit dem Branch mitwandert, statt in verborgenem Sitzungszustand zu leben
- Workflows, die auch funktionieren, wenn das Paket nicht global installiert ist

## Projektstatus

Truthmark ist kein Memory-Server und kein MCP-Server. Es ist eine Repository-Praxis, verpackt als kleiner CLI-Installer plus agent-native Workflow-Flächen.
V1 bietet derzeit:

- `truthmark config`
- `truthmark init`
- `truthmark check`
- verwaltete `AGENTS.md`-Workflow-Anweisungen
- generierte Skill-Flächen für Truth Structure, Truth Sync, Truth Realize und Truth Check für konfigurierte Agenten-Hosts
- Branch-Scope-Metadaten
- Diagnostik für Konfiguration, Autorität, Routing, Entscheidungsstruktur, Frontmatter, Links und polyglotte Abdeckung

Es wird nicht angenommen, dass das ungescopte Paket `truthmark` bereits veröffentlicht ist.

## Dokumentation

Die Root-README ist für Menschen gedacht, die das Paket evaluieren und ausprobieren. Detaillierte funktionale und geschäftliche Spezifikationen liegen unter `docs/`:

- [Dokumentationsindex](docs/README.md)
- [Architekturüberblick](docs/architecture/overview.md)
- [API- und CLI-Verträge](docs/features/contracts.md)
- [Init- und Scaffold-Verhalten](docs/features/init-and-scaffold.md)
- [Check-Diagnostik](docs/features/check-diagnostics.md)
- [Installierte Workflows](docs/features/installed-workflows.md)
- [Leitfaden zur Pflege von Repository-Wahrheit](docs/standards/maintaining-repository-truth.md)

Aktuelles Verhalten gehört in den oben genannten kanonischen Dokumentationsbaum.

## Nicht-Ziele

Truthmark V1 ist nicht:

- ein gehosteter Dienst
- ein MCP-Server
- eine Vektordatenbank
- ein Generator für Dokumentations-Websites
- ein CI- oder PR-Enforcement-Produkt
- ein Ersatz für Tests, Code Review oder technische Führung
- eine autonome Code-Rewrite-Engine

Es ist ein leichtgewichtiger Weg, lokale KI-Coding-Agenten dazu zu bringen, die Wahrheit zu respektieren, die dein Team in Git pflegt.

## Lizenz

MIT. Siehe [LICENSE](LICENSE).
