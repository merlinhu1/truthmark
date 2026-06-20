# Truthmark

**Deine Agenten schreiben Code. Truthmark pflegt menschenorientierte, in Git überprüfbare Dokumentation.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Truthmark-Banner](../assets/truthmark-banner.png)

## 🚀 Schnellstart: lokal in fünf Minuten ausführen

Führe dies in dem Git-Repository aus, das Truthmark verwalten soll:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

Aktiviere den KI-Host, den du tatsächlich nutzt. Neue Konfigurationen sind host-neutral; füge daher vor der Initialisierung eine `platforms`-Liste auf oberster Ebene zu `.truthmark/config.yml` hinzu:

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

Installiere anschließend die repo-lokalen Truth-Dokumente, das Routing und die Anweisungen für KI-Hosts:

```bash
truthmark init
truthmark check
git diff
```

Probiere nun den häufigsten Einstiegspfad: ein bestehendes Verhalten anhand von Code und Tests dokumentieren. Bitte in deinem KI-Coding-Host den installierten Workflow:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

Danach sollten Nutzer Truth Sync normalerweise nicht direkt aufrufen. Programmiere weiter über deinen KI-Host; die installierten Repository-Anweisungen weisen den Agenten an, relevante Tests auszuführen und vor der Übergabe die Truth Sync-Prüfung durchzuführen, wenn funktionaler Code geändert wurde. Du prüfst den daraus entstehenden Code-Diff plus den Truth-Doc-Diff.

Wenn du nur CLI-Validierung möchtest und noch keine host-spezifischen KI-Workflows willst, lasse `platforms` weg und führe `truthmark init && truthmark check` aus; du kannst später eine Plattform hinzufügen und `truthmark init` erneut ausführen.

## 💡 Das Problem: die KI-Dokumentationslücke

KI-Coding-Agenten sind unglaublich gut darin, schnell Code zu schreiben. Doch diese Geschwindigkeit erzeugt einen gefährlichen neuen Fehlermodus: **die Geschichte des Repositories driftet von der Realität ab.**

* Verhalten geht in flüchtigen Chatverläufen verloren.
* Architekturdokumente geraten schnell in Rückstand.
* Produktentscheidungen verschwinden nach der Übergabe.
* Code-Reviewer prüfen rohe Code-Diffs, ohne das „Warum“ zu verstehen.
* Jede neue KI-Sitzung muss die Wahrheit deines Repositories von Grund auf neu entdecken.

## 🎯 Die Lösung: Truthmark

**Truthmark** installiert eine Git-native Workflow-Schicht in deinem Repository. Es behebt den Teil der KI-Entwicklung, der normalerweise kaputtgeht: die Dokumentation dabei zu unterstützen, mit dem Code synchron zu bleiben.

Statt darauf zu hoffen, dass Menschen und KI-Agenten daran denken, Dokumentation zu aktualisieren, macht Truthmark Dokumentation direkt in deinem Repo zu einer systematischen, überprüfbaren Gewohnheit.

### ✨ Warum Truthmark einzigartig ist

Truthmark ist nicht einfach nur ein weiteres Dokumentationstool. Es ist tief in den KI-Workflow integriert:

* **🚫 Kein Vendor-Lock-in:** keine gehosteten Dienste, keine versteckten Datenbanken, keine zusätzlichen Server im Betrieb.
* **🌳 100 % Git-nativ:** alles lebt in deinem Repository. Die Wahrheit bewegt sich mit deinem Branch.
* **🤝 Von Menschen besessener, von Agenten befolgter Vertrag:** Maintainer besitzen den Repository-Vertrag; Agenten folgen beim Coden den installierten Anweisungen.
* **✅ Vertrauen durch Verifikation:** KI-Arbeit wird leichter vertrauenswürdig, weil verhaltensändernde Arbeit eine für Menschen überprüfbare Truth-Doc-Entscheidung oder einen Diff enthält.

## 🔄 Wie es funktioniert

Wenn ein KI-Agent deinen Code verändert, ist die Arbeit nicht erledigt. Truthmark installiert eine Workflow-Schutzschiene zum Abschluss, der Agenten vor der Übergabe folgen:

1. 💻 **Code:** Der Agent ändert funktionalen Code.
2. 🧪 **Test:** Relevante Tests werden ausgeführt.
3. 🔍 **Prüfen:** Truthmark prüft zugeordnete Dokumentation als Teil der installierten Abschlussprüfung.
4. 📝 **Dokumentation:** Docs werden vom Agenten aktualisiert, wenn sich die Repository-Wahrheit geändert hat.
5. 👀 **Review:** Ein Mensch prüft den *Code-Diff* + den *Truth-Diff*.

## 🛠 Wie du mit Truthmark interagierst

Truthmark hat einen repo-lokalen Vertrag und zwei Arten, ihn zu nutzen.

### Menschen installieren und validieren den Vertrag

Maintainer und CI nutzen die CLI:

* `truthmark config` - erstellt die Anfangskonfiguration.
* `truthmark init` - installiert oder aktualisiert Routing, Truth-Doc-Scaffolds und Anweisungen für KI-Hosts.
* `truthmark check` - validiert die Repository-Truth im Terminal.

### Agenten folgen dem Vertrag beim Coden

Truthmark installiert repo-lokale Anweisungen für unterstützte KI-Coding-Hosts wie Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity und Cursor.

Der normale Ablauf ist einfach:

1. Bitte deinen Agenten um eine Codeänderung oder darum, vorhandenes Verhalten zu dokumentieren.
2. Die installierten Anweisungen sagen dem Agenten, wann er testen, wann er Truth-Dokumente aktualisieren und wann er für menschliche Prüfung stoppen soll.
3. Du prüfst normale Git-Diffs: Code plus alle Truth-Doc-Änderungen.

Die vom Nutzer gestarteten Agentenanfragen bleiben bewusst wenige:

* `/truthmark-document` - dokumentiert vorhandenes implementiertes Verhalten aus Code und Tests.
* `/truthmark-realize` - implementiert Code aus vorhandenen Truth-Dokumenten.
* `/truthmark-check` - auditiert die Repository-Truth.

Truth Sync ist nicht der übliche Weg, Arbeit zu starten; es ist die Abschlussprüfung nach funktionalen Codeänderungen.
Truth Structure ist kein Alltagsbefehl; es repariert Routing oder Ownership nur, wenn das die Arbeit blockiert.

## Was du bekommst

| Fähigkeit | Was sie tut |
| --- | --- |
| Git-native Wahrheit | Hält Repository-Wahrheit in committetem Markdown und Konfiguration. |
| Branch-bezogene Dokumentation | Die Wahrheit bewegt sich mit dem Branch, statt in einer privaten Sitzung zu leben. |
| Menschliche CLI | Gibt Maintainern Befehle für Einrichtung, Aktualisierung, Validierung und Inspektion. |
| Installierte Agentenanleitung | Sagt Coding-Agenten, wann sie dokumentieren, testen, Truth synchronisieren, auditieren oder für Review stoppen sollen. |
| Explizites Routing | Ordnet Codebereiche kanonischen Truth-Dokumenten zu. |
| Überprüfbare Übergaben | Erzeugt normale Git-Diffs sowohl für Code als auch für Truth-Dokumente. |
| Local-first-Betrieb | Benötigt keinen gehosteten Dienst, Daemon, keine Datenbank und keinen MCP-Server. |
| Sicherere Schreibgrenzen | Trennt code-first-, doc-first-, read-only- und doc-only-Workflows. |
| Validierung | Meldet Probleme bei Routing, Autorität, Frontmatter, Links, generierten Oberflächen, Branch-Scope, Aktualität und Abdeckung. |
| Optionales Portal | Erzeugt bei ausdrücklicher Aktivierung und Anforderung eine committete statische HTML-Präsentationssite aus Markdown-Truth-Dokumenten. |

## Visueller Überblick

![Truthmark-Funktionen](../assets/truthmark-features.png)

**Funktionen:** was Truthmark installiert und wie Agenten repo-lokale Anweisungen nutzen.

![Truthmark-Position](../assets/truthmark-position.png)

**Position:** wo Truthmark im Verhältnis zu Prompts, Memory und Spec-Workflows steht.

![Truthmark-Sync-Ablauf](../assets/truthmark-syncflow.png)

**Sync-Ablauf:** wie Truth Sync normale Codeänderungen vor der Übergabe abschließt.

## Warum Teams es einsetzen

Truthmark ist für Teams, die bereits wissen, dass KI-Agenten Code erzeugen können.

Das nächste Problem ist Governance.

Nicht Governance als Zeremonie. Governance als einfache Frage:

> Sagt das Repository nach dieser KI-gestützten Änderung noch die Wahrheit?

Truthmark hilft Teams, diese Frage mit committeten Dateien, explizitem Routing und überprüfbaren Diffs zu beantworten.

Es ist nützlich, wenn du Folgendes brauchst:

- weniger Dokumentationsdrift
- bessere Übergaben
- branch-spezifische Produktwahrheit
- dauerhafte Architektur- und API-Dokumentation
- explizite Ownership zwischen Docs und Code
- sicherere Schreibgrenzen für Agenten
- überprüfbare Dokumentation statt versteckter Memory
- Agentenanleitung, die weiterhin aus committeten Repo-Dateien funktioniert

## Wo Truthmark hineinpasst

Truthmark ersetzt keine Prompts, Memory, Specs, Tests oder Code-Reviews.

Es gibt diesen Workflows einen dauerhaften Ort in Git.

| Bedarf | Besser geeignet |
| --- | --- |
| Bessere Ausgabe aus einer Agentensitzung | Besserer Prompt |
| Persönliche oder sitzungsbezogene Kontinuität | Memory-Tool |
| Plan-first-Feature-Arbeit | Spec-Workflow |
| Branch-bezogene Wahrheit, die mit Code reist | Truthmark |
| Verhaltenskorrektheit validieren | Tests und Review |
| KI-gestützte Dokumentationsänderungen prüfen | Truthmark plus Git-Review |

Truthmarks Spur ist bewusst schmal:

```text
make repository truth explicit
route it to code
Agentenanleitung darum installieren
keep the result reviewable in Git
```

## Tiefer einsteigen

Das README ist das Schaufenster: schneller Kontext, Schnellstart und das zentrale Denkmodell.

Für befehlsweise Nutzung, Oberflächenvergleiche, Details zu unterstützten Plattformen, Konfiguration, Routing, Portal und Beispiele lies den [Truthmark-Benutzerleitfaden](../user-guide.md).

## Projektstatus

Die aktuelle Version bietet:

- lokale CLI-Befehle für config, init, check, index, impact und Workflow-Status
- generierte repo-lokale Agentenanweisungen für Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity und Cursor
- Diagnosen für Routing, Autorität, Frontmatter, Links, Aktualität, generierte Oberflächen, Branch-Scope und Abdeckung
- branch-bezogene Truth-Dokumente und abgeleitete Repository-Intelligence-Artefakte

## Dokumentation

- [Benutzerleitfaden](../user-guide.md)
- [Docs-Index](../README.md)
- [Architekturüberblick](../truthmark/engineering/architecture/overview.md)
- [API- und CLI-Verträge](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Leitfaden zur Pflege der Repository-Wahrheit](../standards/maintaining-repository-truth.md)

Für lokale Entwicklungs- und Beitragsbefehle siehe [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Designgrenzen

Truthmark ist bewusst klein: lokal, committet, branch-bezogen und überprüfbar.

Es ist kein gehosteter Dienst, MCP-Server, keine Vektordatenbank, versteckte Memory-Schicht, kein CI-Enforcement-Produkt und keine autonome Code-Rewrite-Engine. Es hilft, Repository-Wahrheit sichtbar zu halten; es ersetzt keine Tests, Code-Reviews oder menschliches Urteil.

## Lizenz

MIT. Siehe [LICENSE](../../LICENSE).
