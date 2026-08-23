# Truthmark

**您的代理负责写代码。Truthmark 负责维护面向人、可在 Git 中审查的文档。**

Truthmark 安装 Git 原生工作流，让 AI 编码代理能够根据现有代码和测试创建新的产品与工程文档，在每次代码变更后持续保持文档最新，并将普通的 Markdown diff 交给您审查。

[![npm version](https://img.shields.io/npm/v/truthmark?color=cb3837&label=npm)](https://www.npmjs.com/package/truthmark)
[![CI](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Node.js >=24](https://img.shields.io/badge/node-%3E%3D24-339933?logo=node.js&logoColor=white)](../../package.json)

[立即开始](#快速开始创建您的第一份事实文档) · [网站](https://merlinhu1.github.io/truthmark/) · [用户指南](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md) · [GitHub](https://github.com/merlinhu1/truthmark)

<details>
<summary>阅读其他 15 种语言版本</summary>

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

</details>

## 创建首批文档，并让它们始终真实

大多数文档工具生成文档后便止步于此。Truthmark 在您的仓库中为代理提供完整的文档生命周期：

- **从可运行的软件创建新文档。** Truth Document 读取代码和测试，然后创建边界清晰的产品或工程文档。
- **自动保持文档一致。** 功能代码变更后，Truth Sync 会在代理交接时运行，并在工作完成前更新仓库事实。
- **将文档变回代码。** Truth Realize 实现已获批准的事实文档，同时保持清晰的文档优先工作流。
- **随着代码库增长修复所有权。** Truth Structure 为新区域或负载过重的区域创建边界清晰的路由和起始文档。
- **在 Git 中审查一切。** 代码、决策、契约、架构、运维和行为与分支始终同行。

无需托管知识库。无需私有代理记忆。文档不会被困在聊天记录中。

## 快速开始：创建您的第一份事实文档

**要求：** Node.js 24 或更高版本、一个 Git 仓库，以及支持代理工作流的 AI 编码宿主。

在您希望由 Truthmark 管理的仓库中运行：

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark init
```

`truthmark init` 可让您选择 Codex、Claude Code、GitHub Copilot、OpenCode、Antigravity、Cursor，或与宿主无关的命令行界面设置。

现在，让已配置的代理记录一个真实行为：

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

如果尚不存在对应文档，Truth Document 会创建一份边界清晰的新事实文档；如果已有所有者文档，则更新该文档；需要时还会更新路由。它不会更改功能代码。

审查结果：

```bash
truthmark check
git status --short --untracked-files=all
git diff
```

此时您应该会看到：

```text
docs/truthmark/engineering/behaviors/session-timeout.md
docs/truthmark/routes/areas/authentication.md
```

确切路径取决于仓库的所有权结构。新文件会出现在 `git status` 中；对已跟踪文件的更改会出现在 `git diff` 中。

不同宿主的调用方式有所不同。OpenCode 使用 `/skill truthmark-document`，Antigravity 使用 `@truthmark-document`，其他受支持宿主则使用各自原生的技能或斜杠命令界面。有关准确命令，请参阅[平台表](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md#supported-agent-platforms)。

对于脚本和持续集成，请显式传入所选平台：

```bash
truthmark init --platform codex --platform cursor
truthmark init --json
```

在交互模式中选择 `none`，或运行 `truthmark init --clear-platforms`，即可获得与宿主无关的仓库。之后可重新运行 `truthmark init` 添加代理平台。

如需相对于分支的时效性诊断，请传入 Git 基准：

```bash
truthmark check --base <base-ref>
```

## Truthmark 的工作原理

<picture>
  <source media="(max-width: 700px)" srcset="../assets/truthmark-workflow-mobile.svg">
  <img src="../assets/truthmark-workflow.svg" alt="Truthmark 的工作原理" width="1440">
</picture>

Truthmark 命令行界面负责安装并验证仓库契约。您的编码代理通过已安装的宿主原生工作流完成证据审查和文档工作。

一次常规代码变更遵循一个简单循环：

1. 代理更改功能代码。
2. 运行相关测试。
3. Truth Sync 检查已映射的文档。
4. 当仓库事实发生变化时，代理创建或更新文档和路由。
5. 您同时审查代码 diff 和事实 diff。

## 工作流

| 工作流               | 使用时机                                 | 结果                                                     |
| -------------------- | ---------------------------------------- | -------------------------------------------------------- |
| **Truth Document**   | 现有代码需要文档                         | 创建或更新以证据为基础的产品与工程文档                   |
| **Truth Sync**       | 功能代码发生变化                         | 在交接前保持已映射的文档和路由一致                       |
| **Truth Structure**  | 新区域需要明确所有权，或现有文档范围过大 | 创建边界清晰的路由和骨架式起始文档                       |
| **Truth Realize**    | 已获批准的事实文档应转化为可运行软件     | 根据文档更新功能代码                                     |
| **Truth Check**      | 需要审计仓库事实                         | 报告路由、所有权、证据和文档问题                         |
| **Truthmark Portal** | 团队需要可浏览的文档站点                 | 根据 Markdown 事实文档生成提交到仓库的静态 HTML 展示站点 |

Truthmark 将这些工作流安装为 Codex、Claude Code、GitHub Copilot、OpenCode、Antigravity 和 Cursor 的原生仓库界面。

## 您将获得什么

### 从现实出发的文档

Truthmark 可以为产品能力、实现行为、应用程序编程接口、架构、工作流、运维和测试创建文档。代码和测试提供证据；边界清晰的 Markdown 文档保存成果。

### 经得起下一次变更的文档

路由将代码区域连接到规范文档。当代理改变行为时，Truth Sync 知道对应事实应归属何处，并让交接始终可审查。

### 分道管理的产品事实与工程事实

产品事实记录面向用户的承诺、边界、决策和验收标准。工程事实记录当前行为、契约、架构、工作流、运维和测试行为。

### Git 原生协作

一切重要内容都存在于提交到仓库的文件中。事实跟随分支，适用于普通的拉取请求，并对每位维护者和编码代理保持可见。

### 本地优先运行

Truthmark 不需要托管服务、守护进程、数据库、向量存储或 Model Context Protocol 服务器。仓库自身就携带完整的文档工作流。

## Truthmark 的定位

| 需求                   | 最佳选择                 |
| ---------------------- | ------------------------ |
| 提升单次代理会话的输出 | 更好的提示词             |
| 个人或会话级连续性     | 记忆工具                 |
| 计划优先的功能开发     | 规格工作流               |
| 随代码同行的分支级文档 | **Truthmark**            |
| 行为正确性             | 测试和代码审查           |
| 可审查的 AI 辅助文档   | **Truthmark + Git 审查** |

Truthmark 专为已经使用 AI 编码代理，并希望仓库事实与代码同速更新的维护者和工程团队打造。

## 支持的宿主和命令行

支持的代理宿主：

- Codex
- Claude Code
- GitHub Copilot
- OpenCode
- Antigravity
- Cursor

<details>
<summary>命令行参考</summary>

| 命令                                                              | 用途                                               |
| ----------------------------------------------------------------- | -------------------------------------------------- |
| `truthmark init`                                                  | 创建或刷新配置、路由、模板和所选宿主的工作流       |
| `truthmark check [--base <ref>]`                                  | 验证仓库事实，并可选择运行分支时效性诊断           |
| `truthmark index --json`                                          | 检查派生的仓库和路由元数据                         |
| `truthmark impact --base <ref> --json`                            | 将变更文件映射到文档、所有者和附近的测试           |
| `truthmark workflow status --workflow <id> [--base <ref>] --json` | 检查工作流适用性和目标                             |
| `truthmark validate ...`                                          | 验证工作流报告和写入租约                           |
| `truthmark uninstall --dry-run` / `truthmark uninstall --apply`   | 预览或移除生成的宿主界面，同时保留已编写的事实内容 |

整个命令行界面都提供结构化 JSON 输出，便于脚本和持续集成使用。

</details>

## 了解更多

- [Truthmark 用户指南](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md)
- [文档索引](https://github.com/merlinhu1/truthmark/blob/main/docs/README.md)
- [架构概览](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/architecture/overview.md)
- [配置、路由和命令契约](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [参与贡献](https://github.com/merlinhu1/truthmark/blob/main/CONTRIBUTING.md)

**立即安装 Truthmark，选择您的编码宿主，今天就把一个真实行为转化为文档。**

## 许可证

MIT。请参阅 [LICENSE](../../LICENSE)。
