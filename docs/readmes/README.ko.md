# Truthmark

**에이전트는 코드를 작성합니다. Truthmark는 사람이 읽고 Git에서 검토할 수 있는 문서를 유지합니다.**

Truthmark는 Git 네이티브 워크플로를 설치하여 AI 코딩 에이전트가 기존 코드와 테스트에서 새로운 제품 및 엔지니어링 문서를 만들고, 코드가 변경될 때마다 최신 상태로 유지하며, 일반적인 Markdown diff로 검토할 수 있게 합니다.

[![npm version](https://img.shields.io/npm/v/truthmark?color=cb3837&label=npm)](https://www.npmjs.com/package/truthmark)
[![CI](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Node.js >=24](https://img.shields.io/badge/node-%3E%3D24-339933?logo=node.js&logoColor=white)](../../package.json)

[시작하기](#빠른-시작-첫-truth-문서-만들기) · [웹사이트](https://merlinhu1.github.io/truthmark/) · [사용자 가이드](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md) · [GitHub](https://github.com/merlinhu1/truthmark)

<details>
<summary>16개 언어로 이 README 읽기</summary>

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

</details>

## 첫 문서를 만들고, 언제나 진실하게 유지하세요

대부분의 문서화 도구는 생성에서 멈춥니다. Truthmark는 저장소 안에서 에이전트에게 완전한 문서 수명 주기를 제공합니다.

- **작동하는 소프트웨어에서 새 문서를 만듭니다.** Truth Document는 코드와 테스트를 읽고 범위가 명확한 제품 또는 엔지니어링 문서를 만듭니다.
- **문서를 자동으로 일치시킵니다.** 기능 코드가 변경되면 Truth Sync가 에이전트 인계 시 실행되어 작업이 끝나기 전에 저장소의 진실을 업데이트합니다.
- **문서를 다시 코드로 만듭니다.** Truth Realize는 승인된 truth 문서를 구현하면서 깔끔한 문서 우선 워크플로를 유지합니다.
- **코드베이스가 성장함에 따라 소유권을 정비합니다.** Truth Structure는 새 영역이나 과도하게 넓어진 영역을 위해 범위가 명확한 경로와 시작 문서를 만듭니다.
- **모든 것을 Git에서 검토합니다.** 코드, 결정, 계약, 아키텍처, 운영, 동작이 브랜치와 함께 이동합니다.

호스팅 지식 베이스가 필요 없습니다. 비공개 에이전트 메모리도 없습니다. 채팅 기록에 갇힌 문서도 없습니다.

## 빠른 시작: 첫 Truth 문서 만들기

**요구 사항:** Node.js 24 이상, Git 저장소, 에이전트 워크플로를 지원하는 AI 코딩 호스트.

Truthmark가 관리할 저장소 안에서 실행하세요.

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark init
```

`truthmark init`에서 Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, Cursor 또는 호스트 중립적인 명령줄 인터페이스 설정을 선택할 수 있습니다.

이제 설정된 에이전트에게 실제 동작 하나를 문서화하도록 요청하세요.

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

해당 문서가 없으면 Truth Document가 범위가 명확한 새 truth 문서를 만들고, 기존 소유 문서가 있으면 업데이트하며, 필요할 때 라우팅도 업데이트합니다. 기능 코드는 변경하지 않습니다.

결과를 검토하세요.

```bash
truthmark check
git status --short --untracked-files=all
git diff
```

이제 다음 파일이 있어야 합니다.

```text
docs/truthmark/engineering/behaviors/session-timeout.md
docs/truthmark/routes/areas/authentication.md
```

정확한 경로는 저장소의 소유권 구조를 따릅니다. 새 파일은 `git status`에 표시되고, 추적 중인 파일의 변경 사항은 `git diff`에 표시됩니다.

호출 방식은 호스트마다 다릅니다. OpenCode는 `/skill truthmark-document`, Antigravity는 `@truthmark-document`를 사용하며, 그 밖의 지원 호스트는 각자의 네이티브 스킬 또는 슬래시 명령 표면을 사용합니다. 정확한 명령은 [플랫폼 표](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md#supported-agent-platforms)를 참조하세요.

스크립트와 지속적 통합에서는 선택한 플랫폼을 명시적으로 전달하세요.

```bash
truthmark init --platform codex --platform cursor
truthmark init --json
```

대화형으로 `none`을 선택하거나 `truthmark init --clear-platforms`를 실행하면 호스트 중립적인 저장소가 됩니다. 나중에 `truthmark init`을 다시 실행해 에이전트 플랫폼을 추가할 수 있습니다.

브랜치 기준 최신성 진단에는 Git 기준점을 전달하세요.

```bash
truthmark check --base <base-ref>
```

## Truthmark 작동 방식

<picture>
  <source media="(max-width: 700px)" srcset="../assets/truthmark-workflow-mobile.svg">
  <img src="../assets/truthmark-workflow.svg" alt="Truthmark 작동 방식" width="1440">
</picture>

Truthmark 명령줄 인터페이스는 저장소 계약을 설치하고 검증합니다. 코딩 에이전트는 설치된 호스트 네이티브 워크플로를 통해 근거를 검토하고 문서화 작업을 수행합니다.

일반적인 코드 변경은 하나의 단순한 순환을 따릅니다.

1. 에이전트가 기능 코드를 변경합니다.
2. 관련 테스트가 실행됩니다.
3. Truth Sync가 매핑된 문서를 확인합니다.
4. 저장소의 진실이 변경되면 에이전트가 문서와 라우팅을 만들거나 업데이트합니다.
5. 코드 diff와 truth diff를 함께 검토합니다.

## 워크플로

| 워크플로             | 사용 시점                                                     | 결과                                                           |
| -------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| **Truth Document**   | 기존 코드에 문서가 필요할 때                                  | 근거 기반 제품 및 엔지니어링 문서를 만들거나 업데이트          |
| **Truth Sync**       | 기능 코드가 변경되었을 때                                     | 인계 전에 매핑된 문서와 라우팅을 일치시킴                      |
| **Truth Structure**  | 새 영역에 소유권이 필요하거나 기존 문서의 범위가 너무 넓을 때 | 범위가 명확한 경로와 골격형 시작 문서를 만듦                   |
| **Truth Realize**    | 승인된 truth 문서를 작동하는 소프트웨어로 구현해야 할 때      | 문서를 기반으로 기능 코드를 업데이트                           |
| **Truth Check**      | 저장소의 진실을 감사해야 할 때                                | 라우팅, 소유권, 근거, 문서 문제를 보고                         |
| **Truthmark Portal** | 팀에 탐색 가능한 문서 사이트가 필요할 때                      | Markdown truth 문서에서 커밋되는 정적 HTML 프레젠테이션을 생성 |

Truthmark는 Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, Cursor의 네이티브 저장소 표면으로 이러한 워크플로를 설치합니다.

## 제공되는 가치

### 현실에서 시작하는 문서

Truthmark는 제품 기능, 구현 동작, 애플리케이션 프로그래밍 인터페이스, 아키텍처, 워크플로, 운영, 테스트를 위한 문서를 만들 수 있습니다. 코드와 테스트가 근거를 제공하고, 범위가 명확한 Markdown 문서가 결과를 보존합니다.

### 다음 변경에도 살아남는 문서

경로는 코드 영역을 표준 문서에 연결합니다. 에이전트가 동작을 변경하면 Truth Sync는 해당 진실이 속할 위치를 알고 인계를 계속 검토 가능한 상태로 유지합니다.

### 제품의 진실과 엔지니어링의 진실을 분리된 흐름으로 관리

제품의 진실은 사용자 대상 약속, 경계, 결정, 인수 기준을 담습니다. 엔지니어링의 진실은 현재 동작, 계약, 아키텍처, 워크플로, 운영, 테스트 동작을 담습니다.

### Git 네이티브 협업

중요한 모든 것은 커밋된 저장소 파일에 있습니다. 진실은 브랜치를 따르고, 일반적인 풀 리퀘스트와 함께 작동하며, 모든 유지관리자와 코딩 에이전트에게 보입니다.

### 로컬 우선 운영

Truthmark에는 호스팅 서비스, 데몬, 데이터베이스, 벡터 저장소, Model Context Protocol 서버가 필요 없습니다. 저장소 자체가 문서 워크플로를 가지고 있습니다.

## Truthmark가 적합한 영역

| 필요                                   | 최적의 선택              |
| -------------------------------------- | ------------------------ |
| 한 번의 에이전트 세션에서 더 나은 결과 | 더 나은 프롬프트         |
| 개인 또는 세션 수준의 연속성           | 메모리 도구              |
| 계획 우선 기능 개발                    | 사양 워크플로            |
| 코드와 함께 이동하는 브랜치 범위 문서  | **Truthmark**            |
| 동작 정확성                            | 테스트와 코드 리뷰       |
| 검토 가능한 AI 지원 문서               | **Truthmark + Git 리뷰** |

Truthmark는 이미 AI 코딩 에이전트를 사용하며, 코드가 변하는 속도만큼 빠르게 저장소가 계속 진실을 말하기를 원하는 유지관리자와 엔지니어링 팀을 위해 만들어졌습니다.

## 지원 호스트와 명령줄

지원되는 에이전트 호스트:

- Codex
- Claude Code
- GitHub Copilot
- OpenCode
- Antigravity
- Cursor

<details>
<summary>명령줄 참조</summary>

| 명령                                                              | 목적                                                              |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `truthmark init`                                                  | 구성, 라우팅, 템플릿, 선택한 호스트 워크플로를 만들거나 새로 고침 |
| `truthmark check [--base <ref>]`                                  | 저장소의 진실을 검증하고 선택적으로 브랜치 최신성 진단을 실행     |
| `truthmark index --json`                                          | 파생된 저장소 및 라우팅 메타데이터를 검사                         |
| `truthmark impact --base <ref> --json`                            | 변경된 파일을 문서, 소유자, 인접 테스트에 매핑                    |
| `truthmark workflow status --workflow <id> [--base <ref>] --json` | 워크플로 적용 가능성과 대상을 검사                                |
| `truthmark validate ...`                                          | 워크플로 보고서와 쓰기 임대를 검증                                |
| `truthmark uninstall --dry-run` / `truthmark uninstall --apply`   | 작성된 진실을 보존하면서 생성된 호스트 표면을 미리 보거나 제거    |

스크립트와 지속적 통합을 위해 명령줄 인터페이스 전반에서 구조화된 JSON 출력을 사용할 수 있습니다.

</details>

## 더 알아보기

- [Truthmark 사용자 가이드](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md)
- [문서 색인](https://github.com/merlinhu1/truthmark/blob/main/docs/README.md)
- [아키텍처 개요](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/architecture/overview.md)
- [구성, 라우팅, 명령 계약](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [기여하기](https://github.com/merlinhu1/truthmark/blob/main/CONTRIBUTING.md)

**Truthmark를 설치하고 코딩 호스트를 선택해 오늘 바로 실제 동작 하나를 문서로 바꾸세요.**

## 라이선스

MIT. [LICENSE](../../LICENSE)를 참조하세요.
