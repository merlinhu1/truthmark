# Truthmark

**당신의 에이전트는 코드를 작성합니다. Truthmark는 사람이 읽고 Git에서 검토할 수 있는 문서를 유지합니다.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Truthmark 배너](../assets/truthmark-banner.png)

## 🚀 빠른 시작: 5분 안에 로컬에서 실행하기

Truthmark가 관리하길 원하는 Git 저장소 안에서 실행하세요:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

실제로 사용하는 AI 호스트를 활성화하세요. 새 설정은 기본적으로 호스트 중립적이므로, 초기화 전에 `.truthmark/config.yml`에 최상위 `platforms` 목록을 추가하세요:

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

그런 다음 저장소 로컬 truth 문서, 라우팅, 에이전트 워크플로 표면을 설치하세요:

```bash
truthmark init
truthmark check
git diff
```

이제 가장 흔한 도입 경로를 시도해 보세요. 코드와 테스트에서 기존 동작 하나를 문서화합니다. AI 코딩 호스트에서 설치된 워크플로에 요청하세요:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

그 이후에는 사용자가 일반적으로 Truth Sync를 직접 호출할 필요가 없습니다. AI 호스트를 통해 계속 코딩하세요. 설치된 저장소 지침이 기능 코드가 변경될 때 에이전트에게 관련 테스트를 실행하고 인계 전에 Truth Sync 검토를 수행하라고 알려줍니다. 사용자는 결과 코드 diff와 truth-doc diff를 함께 검토합니다.

아직 호스트별 AI 워크플로는 원하지 않고 CLI 검증만 원한다면 `platforms`를 생략한 채 `truthmark init && truthmark check`를 실행하세요. 나중에 플랫폼을 추가하고 `truthmark init`을 다시 실행할 수 있습니다.

## 💡 문제: AI 문서화 격차

AI 코딩 에이전트는 코드를 빠르게 작성하는 데 탁월합니다. 하지만 이 속도는 위험한 새로운 실패 모드를 만듭니다. **저장소가 말하는 이야기가 현실과 어긋나는 것**입니다.

* 동작은 일시적인 채팅 기록 속에서 사라집니다.
* 아키텍처 문서는 빠르게 뒤처집니다.
* 제품 결정은 인계 후 사라집니다.
* 코드 리뷰어는 “왜”를 이해하지 못한 채 원시 코드 diff만 보게 됩니다.
* 모든 새 AI 세션은 저장소의 truth를 처음부터 다시 발견해야 합니다.

## 🎯 해결책: Truthmark

**Truthmark**는 저장소에 Git 네이티브 워크플로 계층을 설치합니다. AI 개발에서 보통 깨지는 부분, 즉 문서가 코드와 계속 정렬되도록 돕는 일을 해결합니다.

사람과 AI 에이전트가 문서 업데이트를 기억하길 기대하는 대신, Truthmark는 문서화를 저장소 안의 체계적이고 검토 가능한 습관으로 만듭니다.

### ✨ Truthmark가 특별한 이유

Truthmark는 단순한 또 하나의 문서화 도구가 아닙니다. AI 워크플로에 깊이 통합되어 있습니다:

* **🚫 벤더 종속 없음:** 호스팅 서비스, 숨겨진 데이터베이스, 운영해야 할 추가 서버가 없습니다.
* **🌳 100% Git 네이티브:** 모든 것이 저장소 안에 있습니다. truth는 브랜치와 함께 이동합니다.
* **🤝 이중 표면 아키텍처:** 사람이 저장소를 관리하는 데 쓰는 도구와 AI 에이전트가 코드를 작성하는 데 쓰는 워크플로를 명확히 분리합니다.
* **✅ 검증을 통한 신뢰:** 동작을 바꾸는 작업에는 사람이 검토할 수 있는 truth-doc 결정 또는 diff가 포함되므로 AI 작업을 더 쉽게 신뢰할 수 있습니다.

## 🔄 작동 방식

AI 에이전트가 코드를 수정해도 작업은 끝난 것이 아닙니다. Truthmark는 인계 전에 에이전트가 따르는 완료 시점 워크플로 보호 장치를 설치합니다:

1. 💻 **코드:** 에이전트가 기능 코드를 수정합니다.
2. 🧪 **테스트:** 관련 테스트가 실행됩니다.
3. 🔍 **확인:** 설치된 워크플로가 실행될 때 `Truth Sync`가 매핑된 문서를 확인합니다.
4. 📝 **문서화:** 저장소 truth가 변경되면 에이전트가 문서를 업데이트합니다.
5. 👀 **검토:** 사람이 *코드 diff* + *truth diff*를 검토합니다.

## 🛠 두 표면, 하나의 truth 시스템

Truthmark는 사람 유지관리자와 AI 에이전트 모두를 지원하기 위해 의도적으로 두 가지 별도 표면으로 나뉩니다.

### 1. 🧑‍💻 사람용 CLI(유지관리자 및 CI)
개발자가 저장소를 설정, 구성, 검증하는 데 사용합니다.
* `truthmark config` - 초기 설정을 만듭니다.
* `truthmark init` - 필요한 라우팅, 스캐폴드, 지침을 설치합니다.
* `truthmark check` - 터미널에서 truth 산출물을 검증합니다.

### 2. 🤖 AI용 워크플로(에이전트)
Truthmark는 Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, Cursor 같은 지원 AI 호스트가 이해하는 네이티브 스킬, 프롬프트, 명령을 설치합니다. 이것들은 shell 명령이 *아니라*, AI를 위한 워크플로 진입점입니다.
* `/truthmark-sync` - 기능 코드 변경 후 에이전트가 따르는 완료 시점 워크플로입니다. 일반적인 사용자 시작 명령이 아닙니다.
* `/truthmark-document` - 문서화되지 않은 기존 코드에 대한 문서를 생성합니다.
* `/truthmark-structure` - 넓은 저장소 영역을 구체적인 도메인으로 조직합니다.
* `/truthmark-realize` - **문서 우선 개발:** 아키텍처 문서를 읽고 그에 맞는 코드를 생성합니다.
* `/truthmark-check` - 에이전트가 주도하는 저장소 truth 감사입니다.

## 얻는 것

| 역량 | 하는 일 |
| --- | --- |
| Git 네이티브 truth | 저장소 truth를 커밋된 Markdown과 설정에 보관합니다. |
| 브랜치 범위 문서화 | truth는 비공개 세션에 머무르지 않고 브랜치와 함께 이동합니다. |
| 사람용 CLI | 유지관리자에게 설정, 새로고침, 검증, 검사 명령을 제공합니다. |
| AI용 워크플로 | 에이전트에게 동기화, 문서화, 구조화, 실현, 감사를 위한 호스트 네이티브 워크플로를 제공합니다. |
| 명시적 라우팅 | 코드 영역을 정식 truth 문서에 매핑합니다. |
| 검토 가능한 인계 | 코드와 truth 문서 모두에 대해 일반 Git diff를 생성합니다. |
| 로컬 우선 운영 | 호스팅 서비스, 데몬, 데이터베이스, MCP 서버가 필요 없습니다. |
| 더 안전한 쓰기 경계 | 코드 우선, 문서 우선, 읽기 전용, 문서 전용 워크플로를 분리합니다. |
| 검증 | 라우팅, 권한, frontmatter, 링크, 생성 표면, 브랜치 범위, 신선도, 커버리지 문제를 보고합니다. |
| 선택적 Portal | 명시적으로 활성화하고 요청한 경우 Markdown truth 문서에서 커밋된 정적 HTML 프레젠테이션 사이트를 생성합니다. |

## 시각적 개요

![Truthmark 기능](../assets/truthmark-features.png)

**기능:** Truthmark가 무엇을 설치하고 워크플로 표면이 어떻게 나뉘는지.

![Truthmark 위치](../assets/truthmark-position.png)

**위치:** Truthmark가 프롬프트, 메모리, 사양 워크플로와 비교해 어디에 들어맞는지.

![Truthmark 동기화 흐름](../assets/truthmark-syncflow.png)

**동기화 흐름:** Truth Sync가 일반적인 코드 변경을 인계 전에 어떻게 마무리하는지.

## 팀이 도입하는 이유

Truthmark는 AI 에이전트가 코드를 생성할 수 있음을 이미 아는 팀을 위한 것입니다.

다음 문제는 거버넌스입니다.

의식으로서의 거버넌스가 아닙니다. 거버넌스란 단순한 질문입니다:

> 이 AI 지원 변경 이후에도 저장소는 여전히 truth를 말하는가?

Truthmark는 커밋된 파일, 명시적 라우팅, 검토 가능한 diff로 팀이 그 질문에 답하도록 돕습니다.

다음이 필요할 때 유용합니다:

- 문서 드리프트 감소
- 더 나은 인계
- 브랜치별 제품 truth
- 지속 가능한 아키텍처 및 API 문서
- 문서와 코드 사이의 명시적 소유권
- 더 안전한 에이전트 쓰기 경계
- 숨겨진 메모리가 아닌 검토 가능한 문서
- 커밋된 저장소 파일에서 계속 작동하는 AI 워크플로

## Truthmark가 들어맞는 곳

Truthmark는 프롬프트, 메모리, 사양, 테스트, 코드 리뷰를 대체하지 않습니다.

그 워크플로들이 Git 안에 지속적으로 자리 잡을 수 있는 장소를 제공합니다.

| 필요 | 더 적합한 것 |
| --- | --- |
| 한 번의 에이전트 세션에서 더 나은 출력 | 더 나은 프롬프트 |
| 개인 또는 세션 수준의 연속성 | 메모리 도구 |
| 계획 우선 기능 작업 | 사양 워크플로 |
| 코드와 함께 이동하는 브랜치 범위 truth | Truthmark |
| 동작 정확성 검증 | 테스트와 리뷰 |
| AI 지원 문서 변경 검토 | Truthmark와 Git 리뷰 |

Truthmark의 영역은 의도적으로 좁게 설계되었습니다:

```text
make repository truth explicit
route it to code
install agent workflows around it
keep the result reviewable in Git
```

## 더 깊이 보기

README는 쇼윈도입니다. 빠른 맥락, 빠른 시작, 핵심 사고 모델을 제공합니다.

명령별 사용법, 표면 비교, 지원 플랫폼 상세, 설정, 라우팅, Portal, 예시는 [Truthmark 사용자 가이드](../user-guide.md)를 읽어보세요.

## 프로젝트 상태

현재 릴리스는 다음을 제공합니다:

- config, init, check, index, impact, workflow status를 위한 로컬 CLI 명령
- Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, Cursor용 생성 AI 워크플로 표면
- 라우팅, 권한, frontmatter, 링크, 신선도, 생성 표면, 브랜치 범위, 커버리지 진단
- 브랜치 범위 truth 문서와 파생된 저장소 인텔리전스 산출물

## 문서

- [사용자 가이드](../user-guide.md)
- [문서 색인](../README.md)
- [아키텍처 개요](../truthmark/engineering/architecture/overview.md)
- [API 및 CLI 계약](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [저장소 truth 유지관리 가이드](../standards/maintaining-repository-truth.md)

로컬 개발 및 기여 명령은 [CONTRIBUTING.md](../../CONTRIBUTING.md)를 참조하세요.

## 설계 경계

Truthmark는 의도적으로 작습니다. 로컬이고, 커밋되며, 브랜치 범위이고, 검토 가능합니다.

Truthmark는 호스팅 서비스, MCP 서버, 벡터 데이터베이스, 숨겨진 메모리 계층, CI 강제 제품, 자율 코드 재작성 엔진이 아닙니다. 저장소 truth가 보이도록 돕지만, 테스트, 코드 리뷰, 사람의 판단을 대체하지는 않습니다.

## 라이선스

MIT. [LICENSE](../../LICENSE)를 참조하세요.
