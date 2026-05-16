# Truthmark

**Truthmark installiert Repository-Wahrheits-Workflows für KI-Softwareentwicklung.**

[English](README.md) | Deutsch | [中文](README.zh.md) | [Español](README.es.md) | [Русский](README.ru.md)

<img src="docs/assets/truthmark-banner.png" alt="Truthmark-Banner" width="100%" />

KI-Coding-Agenten schreiben bereits schnell Code. Der teure Teil ist, die Repository-Wahrheit mit den tatsächlichen Änderungen im Gleichschritt zu halten.

Truthmark fügt diesem Ablauf eine Abschlusskontrolle als Workflow hinzu. Der normale Pfad ist einfach:

- Agent ändert funktionalen Code
- relevante Tests laufen
- der installierte Truth-Sync-Workflow aktualisiert zugeordnete Wahrheitsdokumente, bevor der Agent fertig ist
- Truth-Doc-Diff prüfen, wenn einer erzeugt wurde

Die meisten Tools bitten Teams darum, sich eine Gewohnheit anzueignen. Truthmark macht daraus Repository-Workflow-Infrastruktur.

Truthmark macht aus einem KI-Workflow Repository-Infrastruktur statt persönlichem Tooling. Es installiert eine Git-native, branch-gebundene Wahrheitsschicht im Repository, gibt Agenten explizites Routing und begrenzte Workflow-Flächen und hält diese Wahrheit in Git prüfbar, statt sie über Prompt-Verlauf, veraltete Dokumentation oder privaten Tool-Zustand zu verstreuen.

Das ist wichtig, weil der Workflow mit dem Branch lebt. Sobald ein Repository initialisiert ist, reisen Regeln, Routing und installierte Workflow-Flächen im Repository mit, sodass Zusammenarbeit und Übergaben weniger von der Rechnerkonfiguration einer einzelnen Person abhängen.

Für Teams, die bereits wissen, dass Agenten Code erzeugen können, beantwortet Truthmark das nächste Problem: wie das Repository selbst lesbar, prüfbar und steuerbar bleibt, wenn KI-gestützte Arbeit skaliert.

## Visueller Überblick

<table>
	<tr>
		<td align="center" width="50%">
			<img src="docs/assets/truthmark-features.png" alt="Truthmark-Funktionen" width="100%" />
			<br><strong>Funktionen</strong><br>
			Was Truthmark installiert und wie sich die Workflow-Fläche aufteilt.
		</td>
		<td align="center" width="50%">
			<img src="docs/assets/truthmark-position.png" alt="Truthmark-Positionierung" width="100%" />
			<br><strong>Positionierung</strong><br>
			Wo Truthmark im Verhältnis zu Prompts, Memory und Spec-Workflows steht.
		</td>
	</tr>
	<tr>
		<td align="center" colspan="2">
			<img src="docs/assets/truthmark-syncflow.png" alt="Truthmark-Sync-Ablauf" width="100%" />
			<br><strong>Sync-Ablauf</strong><br>
			Wie Truth Sync normale Codeänderungen vor einer Übergabe abschließt.
		</td>
	</tr>
</table>

## Warum Teams es nutzen

Truthmark versucht nicht, Agenten klüger wirken zu lassen. Es soll KI-gestützte Repository-Änderungen vertrauenswürdiger machen.

- Installierte Truth-Sync-Läufe nach Codeänderungen machen Dokumentationspflege zu einer Workflow-Schutzschicht statt zu einer Teamgewohnheit.
- Branch-gebundene Wahrheit bewegt sich mit dem Code, sodass Reviewer aktuelle Wahrheit in normalen Git-Diffs prüfen können.
- Repository-native Workflow-Flächen machen Rollout leichter und Übergaben robuster als reine Pro-User-Konfiguration.
- Explizites Routing in `docs/truthmark/areas.md` und delegierten untergeordneten Routendateien gibt Agenten Zuständigkeitsgrenzen und sicherere Schreibpfade.
- Local-first-Betrieb vermeidet einen Daemon, eine Datenbank, einen Remote-Dienst oder eine MCP-Abhängigkeit.
- Das Routing-Modell ist sprachunabhängig, mit Coverage-Diagnostik für gängige JavaScript-, TypeScript-, Go-, Python-, C#- und Java-Codeflächen.

Für Tech Leads liegt der Wert in Governance ohne Zusatzinfrastruktur: Tests, Code Review und Ownership leisten weiterhin die eigentliche Arbeit; Truthmark macht den Kontext des Agenten dauerhaft, prüfbar und branch-gebunden.

## Wo Truthmark hineinpasst

Truthmark ist keine allgemeine KI-Produktivitätssuite. Es besetzt eine bestimmte Schicht im Stack: branch-gebundene, prüfbare Repository-Wahrheit, die mit der Implementierung synchron bleibt.

| Wenn du brauchst                                                            | Beste Wahl                                  |
| --------------------------------------------------------------------------- | ------------------------------------------- |
| Bessere Ergebnisse aus einer einzelnen Coding-Sitzung                       | Bessere Prompts und enger gefasste Aufgaben |
| Bequemlichkeit über Sitzungen hinweg für einen Agenten oder eine Person     | Speicherwerkzeuge                           |
| Spec-first-Planung für neue Features                                        | Spezifikations-Tools wie Spec Kit           |
| Branch-gebundene, prüfbare Repository-Wahrheit, die mit dem Code mitwandert | Truthmark                                   |

Der Punkt ist nicht, dass Prompts, Memory oder Specs nutzlos wären. Der Punkt ist, dass keines davon allein Repository-Wahrheit in ein in Git festgeschriebenes, prüfbares Asset verwandelt, das Übergaben, Reviews und auseinanderlaufende Branches übersteht.

## Inhalt

- [Warum Teams es nutzen](#warum-teams-es-nutzen)
- [Was Truthmark löst](#was-truthmark-löst)
- [Wo Truthmark hineinpasst](#wo-truthmark-hineinpasst)
- [Erste Schritte](#erste-schritte)
- [Wie es läuft](#wie-es-läuft)
- [Was es installiert](#was-es-installiert)
- [Befehle](#befehle)
- [Warum es existiert](#warum-es-existiert)
- [Projektstatus](#projektstatus)
- [Dokumentation](#dokumentation)
- [Nicht-Ziele](#nicht-ziele)
- [Lizenz](#lizenz)

## Was Truthmark löst

Truthmark macht Repository-Wahrheit zu einer expliziten Workflow-Fläche für Agenten:

- `.truthmark/config.yml` definiert den festgeschriebenen Hierarchievertrag.
- `docs/truthmark/areas.md` und delegierte untergeordnete Routendateien ordnen Codebereiche den Dokumenten zu, die sie verantworten.
- Truth Document erstellt oder repariert kanonische Wahrheitsdokumente für bereits implementiertes Verhalten, wenn keine Codeänderung nötig ist.
- Truth Sync hält zugeordnete Wahrheitsdokumente bei funktionalen Änderungen synchron.
- Truth Realize gibt doc-first Änderungen einen begrenzten Pfad für Code-Updates.
- `truthmark check` validiert die daraus entstehenden Wahrheitsartefakte.
- Das gesamte Modell bleibt local-first und Git-nativ.

Das ist das Kernversprechen: Agentenkontext wird zu festgeschriebenem Repository-Zustand statt zu einem privaten Sitzungsartefakt.

## Erste Schritte

Installiere Truthmark in dem Repository, das du initialisieren möchtest:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
truthmark init
truthmark check
```

Wenn du stattdessen unveröffentlichte Änderungen aus einem Source-Checkout ausprobieren möchtest:

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
docs/truthmark/areas.md
docs/truthmark/areas/repository.md
docs/templates/behavior-doc.md
docs/truth/README.md
docs/truth/repository/README.md
docs/truth/repository/overview.md
AGENTS.md
CLAUDE.md
GEMINI.md
```

Unterstützte Plattformen sind `codex`, `opencode`, `claude-code`, `github-copilot` und `gemini-cli`. Die Standardkonfiguration enthält alle davon; entferne Plattformen, die du nicht nutzt, aus `.truthmark/config.yml`, bevor du `truthmark init` erneut ausführst.
Die standardmäßig erzeugte Struktur verwendet Truth-`README.md`-Dateien als Indizes und beginnt die Wahrheit über aktuelles Verhalten in begrenzten Blattdokumenten wie `docs/truth/repository/overview.md`.

Bestehende Repositories brauchen nach `init` meist einen Aufräumschritt: Führe den installierten Truth-Structure-Workflow aus, wenn die erzeugte `repository`-Route zu breit ist, Ownership mehrere Produkte oder Services umfasst oder Routendateien noch auf Platzhalterdokumente zeigen. Truth Structure teilt breite Routings auf, erstellt oder repariert erste kanonische Wahrheitsdokumente und gibt Truth Sync präzise Ziele, bevor funktionale Codearbeit beginnt. Codex, Claude Code und unterstützte Copilot-IDEs können ihn mit `/truthmark-structure` aufrufen; Hosts im OpenCode-Stil können `/skill truthmark-structure` verwenden.

## Wie es läuft

Truthmark ist am stärksten auf dem Standardpfad, nicht als Sammlung manueller Befehle. Der handelnde Agent und die Host-Umgebung entscheiden, ob delegiert oder der installierte Workflow inline ausgeführt wird.

### Vorhandenes Verhalten ohne Doku

Nutze das, wenn die Implementierung bereits existiert, aber die kanonischen Wahrheitsdokumente fehlen oder schwach sind:

```text
benutzer identifiziert ein implementiertes verhalten oder einen api-endpunkt
benutzer ruft truth document ausdrücklich auf
agent liest implementierung, tests, routing und vorhandene docs
agent schreibt nur truth docs und routing
truth-doc-diff prüfen
```

Truth Document ist manuell und implementation-first: Code dient als Beleg, Wahrheitsdokumente werden erstellt oder repariert, und funktionaler Code darf nicht geändert werden. Codex, Claude Code und unterstützte Copilot-IDEs können es mit `/truthmark-document` aufrufen. Hosts im OpenCode-Stil können `/skill truthmark-document` verwenden.

```text
/truthmark-document dokumentiere das implementierte session-timeout-verhalten unter docs/truth/authentication
```

### Normale Codeänderungen

Die meisten Nutzer sollten Truth Sync nicht direkt aufrufen müssen. Entscheidend ist, dass der installierte Agenten-Workflow Truth Sync als Abschlusskontrolle behandelt, wenn funktionaler Code geändert wurde. Der normale Ablauf ist:

```text
agent ändert funktionalen code
relevante tests laufen
der installierte truth-sync-workflow läuft, bevor der agent fertig ist
truth-doc-diff prüfen, falls einer erzeugt wurde
arbeit committen oder übergeben
```

Truth Sync ist code-first: Code führt, Wahrheitsdokumente folgen, und Truth Sync darf funktionalen Code nicht umschreiben. Seine Hauptaufgabe ist, über den installierten Agenten-Workflow als Abschlusskontrolle zu laufen, wenn funktionaler Code geändert wurde. Direkte Aufrufe sind vor allem für Fehlersuche, frühe Synchronisierung vor einer Übergabe oder bewusstes Ausführen des Workflows gedacht.

Codex, Claude Code und unterstützte Copilot-IDEs können es mit `/truthmark-sync` aufrufen. Hosts im OpenCode-Stil können `/skill truthmark-sync` verwenden.

```text
/truthmark-sync die repository-wahrheit jetzt vor der übergabe synchronisieren
```

### Doc-first-Änderungen

Nutze das, wenn eine Produkt- oder Architekturentscheidung in der Doku beginnt:

```text
benutzer bearbeitet wahrheitsdokumente
benutzer ruft truth realize ausdrücklich auf
agent liest wahrheitsdokumente und relevanten code
agent aktualisiert nur code
relevante tests laufen
arbeit committen oder übergeben
```

Truth Realize ist manuell und doc-first: Wahrheitsdokumente führen, Code folgt, und der Agent darf die Wahrheitsdokumente, die er realisiert, nicht bearbeiten.

Codex, Claude Code und unterstützte Copilot-IDEs können es mit `/truthmark-realize` aufrufen. Hosts im OpenCode-Stil können `/skill truthmark-realize` verwenden.

```text
/truthmark-realize docs/truth/authentication/session-timeout.md in code umsetzen
```

## Was es installiert

Truthmark hält die dauerhafte Workflow-Fläche klein und repository-nativ. Nach `truthmark init` trägt das Repository selbst Routing, Regeln und installierte Workflow-Flächen, sodass Teams nicht nur auf die lokale Konfiguration einer einzelnen Person angewiesen sind.

- `.truthmark/config.yml` für den maschinenlesbaren, festgeschriebenen Hierarchievertrag
- `docs/truthmark/areas.md` für den Root-Routenindex
- `docs/truthmark/areas/**/*.md` für delegierte untergeordnete Routendateien
- `docs/templates/behavior-doc.md` sowie die weiteren typspezifischen Vorlagen unter `docs/templates/` für die editierbaren Truth-Doc-Standards der generierten Workflows
- verwaltete Instruktionsblöcke für konfigurierte Plattformen wie `AGENTS.md`, `CLAUDE.md`, Copilot-Anweisungen und `GEMINI.md`
- host-native Skills, Prompts oder Commands für Truth Structure, Truth Document, Truth Sync, Truth Realize und Truth Check
- projektbezogene Codex-, Claude-Code-, GitHub-Copilot- und OpenCode-Prüfagenten plus `truth-doc-writer`-Agenten mit explizit erteiltem Schreibumfang unter `.codex/agents/`, `.claude/agents/`, `.github/agents/` und `.opencode/agents/` für workflow-eigene Subagent-Audits und vom Parent freigegebene Dokument-Shards

Die installierten Workflow-Flächen sind die Runtime:

- Truth Structure erstellt oder repariert Area-Routing und erste Wahrheitsdokumente.
- Truth Document erstellt oder repariert Wahrheitsdokumente für bereits implementiertes Verhalten.
- Truth Sync hält zugeordnete Wahrheitsdokumente bei funktionalen Änderungen synchron.
- Truth Realize aktualisiert Code so, dass er zu den Wahrheitsdokumenten passt.
- Truth Check auditiert die Gesundheit der Repository-Wahrheit.

`README.md`-Dateien von Features sind Indizes. Truth Sync soll begrenzte Blattdokumente für aktuelles Verhalten lesen und aktualisieren. Generierte Workflow-Flächen bewahren die Autorität der Repository-Regeln, während sie Implementierungscode und kanonische Wahrheitsdokumente als Belege für aktuelles Verhalten behandeln.

Generierte Flächen werden von Truthmark verwaltet, enthalten einen Versionsmarker und können mit `truthmark init` aktualisiert werden.

## Befehle

Truthmark V1 hält die CLI fokussiert, weil der laufende Workflow in den installierten Agenten-Flächen leben soll und nicht in einer langen Liste täglicher manueller Befehle. In nachgelagerten Repositories erzeugt `truthmark config` den in Git festgeschriebenen Hierarchievertrag, `truthmark init` installiert und aktualisiert Workflow-Flächen aus dieser geprüften Konfiguration, `truthmark check` validiert Wahrheitsartefakte für manuelle Audits, CI oder Fehlersuche, und die Repository-Intelligence-Befehle erzeugen abgeleitete Prüfarbeitsstände, wenn lokale Werkzeuge verfügbar sind.

```bash
truthmark config
truthmark init
truthmark check
truthmark index
truthmark impact --base main
truthmark context --workflow truth-sync --base main
truthmark config --json
truthmark check --json
truthmark index --json
truthmark impact --base main --json
truthmark context --workflow truth-sync --base main --json
```

`config` schreibt nur `.truthmark/config.yml`, außer `--stdout` wird verwendet.

`init` benötigt `.truthmark/config.yml` und installiert oder aktualisiert anschließend die lokalen Workflow-Dateien.

`check` validiert Konfiguration, Autorität, Routing, entscheidungstragende Dokumente, Frontmatter, interne Links, Branch-Scope und Coverage-Diagnostik.

`index` baut RepoIndex- und RouteMap-JSON für den aktiven Checkout.

`impact --base <ref>` ordnet geänderte Dateien den gerouteten Truth-Dokumenten, Routen, nahen Tests und öffentlichen Symbolen zu.

`context --workflow <workflow> [--base <ref>]` erzeugt ein begrenztes ContextPack für Truth Sync, Truth Document oder Truth Realize. `--format markdown` rendert eine menschenlesbare Fassung.

Truth Structure, Truth Document, Truth Sync, Truth Realize und Truth Check sind installierte Agenten-Workflows, keine täglichen Top-Level-CLI-Befehle.

Sie laufen über die konfigurierten Agenten-Host-Flächen, zum Beispiel Codex/Claude/Copilot `/truthmark-*`, OpenCode `/skill truthmark-*` oder Gemini `/truthmark:*`.

```text
/truthmark-check routing und truth-abdeckung vor der review prüfen
```

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

Truthmark ist kein Memory-Server und kein MCP-Server. Es ist eine Repository-Praxis, verpackt als kleiner CLI-Installer plus agent-native Workflow-Flächen, die KI-Workflow-Regeln in Repository-Infrastruktur verwandeln.

V1 bietet derzeit:

- `truthmark config`
- `truthmark init`
- `truthmark check`
- `truthmark index`
- `truthmark impact`
- `truthmark context`
- verwaltete `AGENTS.md`-Workflow-Anweisungen
- generierte Truth Structure-, Truth Document-, Truth Sync-, Truth Realize- und Truth Check-Skill-Flächen für konfigurierte Agenten-Hosts
- Branch-Scope-Metadaten
- Diagnostik für Konfiguration, Autorität, Routing, Entscheidungsstruktur, Frontmatter, Links, Freshness und polyglotte Abdeckung
- abgeleitete RepoIndex-, RouteMap-, ImpactSet- und ContextPack-Artefakte für schnellere lokale Prüfung, wenn die CLI verfügbar ist

## Dokumentation

Die Root-README ist für Menschen gedacht, die das Paket evaluieren und ausprobieren. Detaillierte funktionale und geschäftliche Spezifikationen liegen unter `docs/`:

- [Dokumentationsindex](docs/README.md)
- [Architekturüberblick](docs/architecture/overview.md)
- [API- und CLI-Verträge](docs/truth/contracts.md)
- [Init- und Scaffold-Verhalten](docs/truth/init-and-scaffold.md)
- [Check-Diagnostik](docs/truth/check-diagnostics.md)
- [Installierte Workflows](docs/truth/workflows/overview.md)
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
