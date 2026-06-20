# Truthmark

**Twoi agenci piszą kod. Truthmark utrzymuje dokumentację dla ludzi, możliwą do przeglądu w Git.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Baner Truthmark](../assets/truthmark-banner.png)

## 🚀 Szybki start: lokalne uruchomienie w pięć minut

Uruchom to w repozytorium Git, którym ma zarządzać Truthmark:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

Włącz hosta AI, którego faktycznie używasz. Nowe konfiguracje są neutralne wobec hosta, więc przed inicjalizacją dodaj listę najwyższego poziomu `platforms` do `.truthmark/config.yml`:

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

Następnie zainstaluj lokalne dla repozytorium dokumenty truth, routing i powierzchnie workflow agentów:

```bash
truthmark init
truthmark check
git diff
```

Teraz wypróbuj najczęstszą ścieżkę adopcji: udokumentuj jedno istniejące zachowanie na podstawie kodu i testów. W swoim hoście kodowania AI poproś zainstalowany workflow:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

Po tym użytkownicy zwykle nie powinni wywoływać Truth Sync bezpośrednio. Kontynuuj kodowanie przez swojego hosta AI; zainstalowane instrukcje repozytorium mówią agentowi, aby przy zmianach kodu funkcjonalnego uruchomił odpowiednie testy i wykonał przegląd Truth Sync przed przekazaniem pracy. Ty przeglądasz wynikowy diff kodu oraz diff truth-doc.

Jeśli chcesz tylko walidacji CLI i nie potrzebujesz jeszcze workflow AI specyficznych dla hosta, pozostaw `platforms` pominięte i uruchom `truthmark init && truthmark check`; później możesz dodać platformę i ponownie uruchomić `truthmark init`.

## 💡 Problem: luka w dokumentacji AI

Agenci kodujący AI są niezwykle dobrzy w szybkim pisaniu kodu. Ta prędkość tworzy jednak groźny nowy tryb awarii: **historia repozytorium zaczyna rozmijać się z rzeczywistością.**

* Zachowanie ginie w ulotnych historiach czatu.
* Dokumenty architektoniczne szybko zostają w tyle.
* Decyzje produktowe znikają po przekazaniu pracy.
* Recenzenci kodu oglądają surowe diffy kodu bez zrozumienia „dlaczego”.
* Każda nowa sesja AI musi od zera odkrywać truth repozytorium.

## 🎯 Rozwiązanie: Truthmark

**Truthmark** instaluje w Twoim repozytorium warstwę workflow natywną dla Git. Naprawia tę część rozwoju z AI, która zwykle się psuje: pomaga utrzymać dokumentację w zgodzie z kodem.

Zamiast liczyć, że ludzie i agenci AI będą pamiętać o aktualizowaniu dokumentów, Truthmark zamienia dokumentację w systematyczny, możliwy do przeglądu nawyk wewnątrz repozytorium.

### ✨ Dlaczego Truthmark jest wyjątkowy

Truthmark nie jest tylko kolejnym narzędziem do dokumentacji. Jest głęboko zintegrowany z workflow AI:

* **🚫 Zero zależności od dostawcy:** brak usług hostowanych, ukrytych baz danych i dodatkowych serwerów do utrzymywania.
* **🌳 100% natywny dla Git:** wszystko mieszka w Twoim repozytorium. Truth porusza się razem z gałęzią.
* **🤝 Kontrakt należący do ludzi i wykonywany przez agentów:** Opiekunowie posiadają kontrakt repozytorium; agenci podczas kodowania podążają za zainstalowanymi instrukcjami.
* **✅ Zaufanie przez weryfikację:** pracy AI łatwiej zaufać, ponieważ zmiany wpływające na zachowanie zawierają decyzję lub diff truth-doc możliwy do przeglądu przez człowieka.

## 🔄 Jak to działa

Gdy agent AI modyfikuje Twój kod, praca nie jest skończona. Truthmark instaluje strażnika workflow na zakończenie pracy, którego agenci przestrzegają przed przekazaniem:

1. 💻 **Kod:** agent modyfikuje kod funkcjonalny.
2. 🧪 **Test:** wykonywane są odpowiednie testy.
3. 🔍 **Sprawdzenie:** Truthmark sprawdza zmapowaną dokumentację jako część zainstalowanego końcowego przeglądu.
4. 📝 **Dokumentacja:** agent aktualizuje dokumenty, gdy truth repozytorium się zmieniła.
5. 👀 **Przegląd:** człowiek przegląda *diff kodu* + *diff truth*.

## 🛠 Jak używasz Truthmark

Truthmark ma jeden lokalny kontrakt repozytorium i dwa sposoby korzystania z niego.

### Ludzie instalują i walidują kontrakt

Opiekunowie i CI używają CLI:

* `truthmark config` - tworzy początkową konfigurację.
* `truthmark init` - instaluje lub odświeża routing, szkielety truth-doc i instrukcje dla hostów AI.
* `truthmark check` - waliduje truth repozytorium z terminala.

### Agenci podążają za kontraktem podczas kodowania

Truthmark instaluje lokalne instrukcje repozytorium dla obsługiwanych hostów kodowania AI, takich jak Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity i Cursor.

Normalna pętla jest prosta:

1. Poproś agenta o zmianę kodu albo o udokumentowanie istniejącego zachowania.
2. Zainstalowane instrukcje mówią agentowi, kiedy testować, kiedy aktualizować truth docs i kiedy zatrzymać się do ludzkiego przeglądu.
3. Przeglądasz zwykłe diffy Git: kod plus ewentualne zmiany w truth-doc.

Żądania agenta uruchamiane przez użytkownika są celowo nieliczne:

* `/truthmark-document` - dokumentuje istniejące zaimplementowane zachowanie z kodu i testów.
* `/truthmark-realize` - implementuje kod z istniejących truth docs.
* `/truthmark-check` - audytuje truth repozytorium.

Truth Sync nie jest zwykłym sposobem rozpoczynania pracy; to końcowy przegląd po funkcjonalnych zmianach kodu.
Truth Structure nie jest codzienną komendą; naprawia routing lub własność tylko wtedy, gdy blokuje to pracę.

## Co otrzymujesz

| Możliwość | Co robi |
| --- | --- |
| Truth natywny dla Git | Utrzymuje truth repozytorium w zatwierdzonych plikach Markdown i konfiguracji. |
| Dokumentacja w zakresie gałęzi | Truth porusza się z gałęzią zamiast mieszkać w prywatnej sesji. |
| CLI dla ludzi | Daje opiekunom komendy konfiguracji, odświeżania, walidacji i inspekcji. |
| Zainstalowana instrukcja agenta | Mówi agentom kodującym, kiedy dokumentować, testować, synchronizować truth, audytować lub zatrzymać się do przeglądu. |
| Jawny routing | Mapuje obszary kodu na kanoniczne dokumenty truth. |
| Przekazania możliwe do przeglądu | Tworzy zwykłe diffy Git zarówno dla kodu, jak i dokumentów truth. |
| Działanie local-first | Nie wymaga hostowanej usługi, demona, bazy danych ani serwera MCP. |
| Bezpieczniejsze granice zapisu | Rozdziela workflow code-first, doc-first, read-only i doc-only. |
| Walidacja | Raportuje problemy z routingiem, uprawnieniami, frontmatter, linkami, wygenerowaną powierzchnią, zakresem gałęzi, świeżością i pokryciem. |
| Opcjonalny Portal | Generuje zatwierdzoną statyczną witrynę prezentacyjną HTML z dokumentów truth w Markdown, gdy jest wyraźnie włączony i zażądany. |

## Przegląd wizualny

![Funkcje Truthmark](../assets/truthmark-features.png)

**Funkcje:** co Truthmark instaluje i jak podzielona jest powierzchnia workflow.

![Pozycja Truthmark](../assets/truthmark-position.png)

**Pozycja:** gdzie Truthmark mieści się względem promptów, pamięci i workflow specyfikacji.

![Przepływ synchronizacji Truthmark](../assets/truthmark-syncflow.png)

**Przepływ synchronizacji:** jak Truth Sync zamyka zwykłe zmiany kodu przed przekazaniem.

## Dlaczego zespoły go przyjmują

Truthmark jest dla zespołów, które już wiedzą, że agenci AI potrafią generować kod.

Następnym problemem jest governance.

Nie governance jako ceremonia. Governance jako proste pytanie:

> Czy po tej zmianie wspieranej przez AI repozytorium nadal mówi truth?

Truthmark pomaga zespołom odpowiedzieć na to pytanie za pomocą zatwierdzonych plików, jawnego routingu i diffów możliwych do przeglądu.

Jest przydatny, gdy potrzebujesz:

- mniejszego rozjazdu dokumentacji
- lepszych przekazań pracy
- truth produktu specyficznego dla gałęzi
- trwałej dokumentacji architektury i API
- jawnej własności między dokumentami a kodem
- bezpieczniejszych granic zapisu dla agentów
- dokumentacji możliwej do przeglądu zamiast ukrytej pamięci
- instrukcje agenta, które nadal działają z commitowanych plików repozytorium

## Gdzie pasuje Truthmark

Truthmark nie zastępuje promptów, pamięci, specyfikacji, testów ani przeglądu kodu.

Daje tym workflow trwałe miejsce w Git.

| Potrzeba | Lepsze dopasowanie |
| --- | --- |
| Lepszy wynik z jednej sesji agenta | Lepszy prompt |
| Ciągłość osobista lub na poziomie sesji | Narzędzie pamięci |
| Praca nad funkcją zaczynająca się od planu | Workflow specyfikacji |
| Truth w zakresie gałęzi, która podróżuje z kodem | Truthmark |
| Walidacja poprawności zachowania | Testy i przegląd |
| Przegląd zmian dokumentacji wspieranych przez AI | Truthmark plus przegląd Git |

Zakres Truthmark jest celowo wąski:

```text
make repository truth explicit
route it to code
zainstalować wokół niej instrukcje agenta
keep the result reviewable in Git
```

## Więcej szczegółów

README jest witryną sklepową: szybki kontekst, szybki start i podstawowy model myślowy.

Aby poznać użycie komenda po komendzie, porównanie powierzchni, szczegóły obsługiwanych platform, konfigurację, routing, Portal i przykłady, przeczytaj [Przewodnik użytkownika Truthmark](../user-guide.md).

## Status projektu

Obecne wydanie zapewnia:

- lokalne komendy CLI dla config, init, check, index, impact i workflow status
- wygenerowane lokalne instrukcje agenta dla Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity i Cursor
- diagnostykę route, authority, frontmatter, link, freshness, generated-surface, branch-scope i coverage
- dokumenty truth w zakresie gałęzi oraz pochodne artefakty inteligencji repozytorium

## Dokumentacja

- [Przewodnik użytkownika](../user-guide.md)
- [Indeks dokumentacji](../README.md)
- [Przegląd architektury](../truthmark/engineering/architecture/overview.md)
- [Kontrakty API i CLI](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Przewodnik utrzymania repository truth](../standards/maintaining-repository-truth.md)

Komendy lokalnego rozwoju i kontrybuowania znajdziesz w [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Granice projektu

Truthmark jest celowo mały: lokalny, zatwierdzony, ograniczony do gałęzi i możliwy do przeglądu.

Nie jest usługą hostowaną, serwerem MCP, wektorową bazą danych, ukrytą warstwą pamięci, produktem wymuszającym CI ani autonomicznym silnikiem przepisywania kodu. Pomaga utrzymać widoczność truth repozytorium; nie zastępuje testów, przeglądu kodu ani ludzkiego osądu.

## Licencja

MIT. Zobacz [LICENSE](../../LICENSE).
