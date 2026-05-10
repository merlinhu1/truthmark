# Truthmark 是 AI 软件开发的事实层。

[English](README.md) | [Deutsch](README.de.md) | 中文 | [Español](README.es.md) | [Русский](README.ru.md)

AI 编码代理已经很会写代码了。它们仍然不擅长从过时文档、零散聊天和短暂的工具记忆中，可靠还原产品意图、架构边界和仓库归属。
Truthmark 通过把分支内的仓库事实变成代理运行时的一等载体来解决这个问题。它把一个 Git 原生、按分支生效的事实层直接安装到仓库里，为代理明确路由和工作流边界，并让这些事实随真正交付的代码一起移动。
这不是更好的提示词工程，而是在真实代码库中更可治理地使用 AI 的方式：少一些重复决策，少一些陈旧文档，交接更清楚，AI 编码会话也会留下可审查的工程记录，而不是消失在提示历史或不透明的工具状态里。
它面向这样的团队：你们已经知道代理能生成代码，现在需要仓库本身继续保持清晰、可审查、可治理。

## Truthmark 解决什么问题

AI 编码现在上手很容易，治理却很昂贵。一旦代理能快速写代码，仓库事实就会成为控制面。
这种失效模式很常见：需求留在聊天里，架构决策反复重做，代理改到了错误的区域，分支继承了审查者无法可靠检查的上下文。代码也许推进得很快，但仓库会变得越来越难以信任。
Truthmark 改变的是工作模型：

- 分支内事实随分支一起流转，而不是藏在私有工具存储里。
- Git 让这些事实可以被审查、对比，并在团队内共享。
- 文档跟着代码走，而不是悄悄变成虚构。
- 路由明确保存在 `docs/truthmark/areas.md` 和委托的子路由文件中，让代理知道哪些文档负责哪些代码。
- 当前有效的产品和架构决策保存在它们所治理的规范文档中，而不是带时间戳的规划日志里。
- 本地优先的工作流不需要守护进程、数据库、远程服务或 MCP 依赖。
- 这个模型适用于 JavaScript、TypeScript、Go、Python、C# 和 Java 代码库。

对技术负责人来说，它的价值是没有表演成分的治理：测试、代码审查和所有权仍然承担真正的工作；Truthmark 让代理上下文变得持久、可检查，并且限定在当前分支内。

## Truthmark 适合放在哪里

Truthmark 并不想取代所有其他 AI 工作流工具。它位于工具栈中的一个特定层级：

| 如果你需要                                   | 最合适的选择                   |
| -------------------------------------------- | ------------------------------ |
| 单次编码会话获得更好结果                     | 更好的提示词和更清晰的任务边界 |
| 一个代理或操作者跨会话延续便利性             | 记忆类工具                     |
| 为新功能做规格优先的规划                     | Spec Kit 等规格工具            |
| 随代码一起流转、可审查、按分支生效的仓库事实 | Truthmark                      |

重点不是提示词、记忆或规格没有用。重点是，它们单独都不能把仓库事实变成一个已提交、可检查，并且能经受交接、审查和分支分叉的资产。

## 目录

- [Truthmark 解决什么问题](#truthmark-解决什么问题)
- [Truthmark 适合放在哪里](#truthmark-适合放在哪里)
- [工作流载体](#工作流载体)
- [快速开始](#快速开始)
- [它如何运行](#它如何运行)
- [它会安装什么](#它会安装什么)
- [命令](#命令)
- [它为什么存在](#它为什么存在)
- [项目状态](#项目状态)
- [文档](#文档)
- [非目标](#非目标)
- [许可证](#许可证)

## 工作流载体

Truthmark 把仓库事实变成代理可见的显式工作流载体：

- `TRUTHMARK.md` 定义分支内工作流契约。
- `docs/truthmark/areas.md` 和委托的子路由文件把代码区域映射到负责它们的文档。
- Truth Sync 在功能性变更发生时，让已映射的事实文档保持同步。
- Truth Realize 为文档优先的变更提供有边界的代码更新路径。
- `truthmark check` 验证最终形成的事实产物。
- 整个模型保持本地优先和 Git 原生。

核心承诺很简单：代理上下文会成为已提交的仓库状态，而不是私有会话产物。

## 快速开始

在你想初始化的仓库中安装 Truthmark：

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
truthmark init
truthmark check
```

如果你想从源码检出中试用尚未发布的变更：

```bash
cd /path/to/truthmark
npm install
npm run build
cd /path/to/your-repo
node /path/to/truthmark/dist/main.js config
node /path/to/truthmark/dist/main.js init
node /path/to/truthmark/dist/main.js check
```

在运行 `init` 之前先检查 `.truthmark/config.yml`；它是已提交的层级契约。`init` 之后，检查生成的工作流载体和路由文件，确保路由指向的文档确实是拥有你代码的文档：

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
```

支持的平台是 `codex`、`opencode`、`claude-code`、`github-copilot` 和 `gemini-cli`。默认配置包含全部平台；请先从 `.truthmark/config.yml` 中移除不使用的平台，再重新运行 `truthmark init`。
默认脚手架把功能 `README.md` 作为索引，并把当前行为事实放在有边界的叶子文档中，例如 `docs/features/repository/overview.md`。

现有仓库通常需要在 `init` 之后做一次清理：当生成的 `repository` 路由过宽、所有权跨越多个产品或服务，或路由文件仍指向占位文档时，运行已安装的 Truth Structure 工作流。Truth Structure 会拆分过宽的路由，创建或修复初始的规范事实文档，并在功能代码工作开始前为 Truth Sync 提供精确目标。Codex、Claude Code 和支持的 Copilot IDE 可以用 `/truthmark-structure` 调用它；OpenCode 风格的宿主可以用 `/skill truthmark-structure` 调用它。

## 它如何运行

Truthmark 不规定应该由哪个子代理运行 Truth Sync。由实际执行的代理和宿主环境决定是委托执行，还是内联运行工作流。
多数用户不需要直接调用 Truth Sync。正常路径是：

```text
代理修改功能代码
运行相关测试
代理结束前触发 Truth Sync
如果生成了事实文档 diff，就审查它
提交或交接工作
```

Truth Sync 是 code-first：代码在前，事实文档跟随，且 Truth Sync 不能重写功能代码。它的主要职责是在功能代码发生变化时，作为收尾阶段的自动安全检查。直接调用主要用于排查问题、交接前提前同步，或有意运行这套工作流。
Codex、Claude Code 和支持的 Copilot IDE 可以用 `/truthmark-sync` 调用它。OpenCode 风格的宿主可以用 `/skill truthmark-sync` 调用它。
当产品或架构决策从文档开始时，使用这个流程：

```text
用户编辑事实文档
用户显式调用 Truth Realize
代理读取事实文档和相关代码
代理只更新代码
运行相关测试
提交或交接工作
```

Truth Realize 是手动、文档优先的流程：事实文档在前，代码跟随，代理不能编辑它正在实现的事实文档。
Codex、Claude Code 和支持的 Copilot IDE 可以用 `/truthmark-realize` 调用它。OpenCode 风格的宿主可以用 `/skill truthmark-realize` 调用它。

## 它会安装什么

Truthmark 把持久化的工作流载体保持得很小：

- `.truthmark/config.yml`，用于机器可读配置
- `TRUTHMARK.md`，用于分支内工作流契约
- `docs/truthmark/areas.md`，用于根路由索引
- `docs/truthmark/areas/**/*.md`，用于委托的子路由文件
- 面向已配置平台的受管说明块，例如 `AGENTS.md`、`CLAUDE.md`、Copilot 指令和 `GEMINI.md`
- 面向 Truth Structure、Truth Sync、Truth Realize 和 Truth Check 的宿主原生技能、提示或命令

安装后的工作流载体就是运行时：

- Truth Structure 创建或修复区域路由和起始事实文档。
- Truth Sync 在功能性变更发生时，让已映射的事实文档保持同步。
- Truth Realize 更新代码，使其符合事实文档。
- Truth Check 审计仓库事实的健康状况。

功能 `README.md` 是索引。Truth Sync 预期读取并更新用于描述当前行为的有边界叶子文档。

生成的载体由 Truthmark 管理，包含版本标记，并可通过 `truthmark init` 刷新。

## 命令

Truthmark V1 有意保持 CLI 很小。在下游仓库中，`truthmark config` 创建已提交的层级契约，`truthmark init` 根据这份已审查的配置安装和刷新工作流载体，`truthmark check` 则为人工审计、CI 或问题排查验证事实产物。

```bash
truthmark config
truthmark init
truthmark check
truthmark config --json
truthmark check --json
```

`config` 只写入 `.truthmark/config.yml`，除非使用 `--stdout`。
`init` 需要 `.truthmark/config.yml`，然后安装或刷新本地工作流文件。
`check` 验证配置、权限边界、路由、承载决策的文档、frontmatter、内部链接、分支范围和覆盖率诊断。
Truth Structure、Truth Sync、Truth Realize 和 Truth Check 是已安装的代理工作流，不是日常使用的顶层 CLI 命令。

## 它为什么存在

大多数 AI 编码工作流优化的是下一次回答。Truthmark 优化的是下一次交接。
它假设严肃团队需要：

- 按分支生效的产品事实
- 持久的架构和 API 决策
- 文档与代码之间明确的所有权
- 给代理设置安全的写入边界
- 人类可以审查的普通 Git diff
- 团队成员无需特殊工具也能检查的可读 Markdown
- 随分支一起流转、而不是留在隐藏会话状态里的事实
- 即使包没有全局安装也能工作的流程

## 项目状态

Truthmark 不是记忆服务器，也不是 MCP 服务器。它是一套仓库实践，被打包成一个小型 CLI 安装器和代理原生的工作流载体。
V1 目前提供：

- `truthmark config`
- `truthmark init`
- `truthmark check`
- 受管的 `AGENTS.md` 工作流说明
- 为已配置代理宿主生成的 Truth Structure、Truth Sync、Truth Realize 和 Truth Check 技能载体
- 分支范围元数据
- 配置、权限边界、路由、决策结构、frontmatter、链接和多语言覆盖率诊断

## 文档

根 README 面向评估和试用这个包的人。详细的功能和业务规范位于 `docs/` 下：

- [文档索引](docs/README.md)
- [架构概览](docs/architecture/overview.md)
- [API 和 CLI 契约](docs/features/contracts.md)
- [Init 和脚手架行为](docs/features/init-and-scaffold.md)
- [Check 诊断](docs/features/check-diagnostics.md)
- [已安装工作流](docs/features/installed-workflows.md)
- [仓库事实维护指南](docs/standards/maintaining-repository-truth.md)

当前行为应放在上面的规范文档树中。

## 非目标

Truthmark V1 不是：

- 托管服务
- MCP 服务器
- 向量数据库
- 文档网站生成器
- CI 或 PR 强制执行产品
- 测试、代码审查或技术领导力的替代品
- 自主代码重写引擎

它是一种轻量方式，让本地 AI 编码代理尊重你的团队保存在 Git 中的事实。

## 许可证

MIT。见 [LICENSE](LICENSE)。
