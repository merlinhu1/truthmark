# Truthmark

**Truthmark 为 AI 软件开发安装仓库事实工作流。**

[English](README.md) | [Deutsch](README.de.md) | 中文 | [Español](README.es.md) | [Русский](README.ru.md)

<img src="docs/assets/truthmark-banner.png" alt="Truthmark 横幅" width="100%" />

AI 编码代理已经能很快写代码了。真正昂贵的是让仓库事实和实际变更保持一致。

Truthmark 在这个流程里加入了一个收尾阶段的工作流保护。正常路径很简单：

- 代理修改功能代码
- 运行相关测试
- 代理结束前，已安装的 Truth Sync 工作流更新已映射的事实文档
- 如果产生了事实文档 diff，就审查它

大多数工具要求团队养成一种习惯。Truthmark 把这个习惯变成仓库工作流基础设施。

Truthmark 把 AI 工作流变成仓库基础设施，而不是个人工具配置。它把一个 Git 原生、按分支生效的事实层安装到仓库里，为代理提供明确的路由和有边界的工作流载体，并让这些事实继续以 Git diff 的形式可审查，而不是散落在提示历史、陈旧文档或私有工具状态里。

这之所以重要，是因为工作流跟着分支一起存在。仓库一旦初始化，规则、路由和已安装的工作流载体就会随仓库一起移动，协作和交接也就不再过度依赖某个人的本地配置。

对于已经知道代理能生成代码的团队，Truthmark 解决的是下一个问题：当 AI 辅助开发规模化时，怎样让仓库本身继续保持清晰、可审查、可治理。

## 可视化概览

<table>
	<tr>
		<td align="center" width="50%">
			<img src="docs/assets/truthmark-features.png" alt="Truthmark 功能" width="100%" />
			<br><strong>功能</strong><br>
			Truthmark 安装了什么，以及工作流载体如何拆分。
		</td>
		<td align="center" width="50%">
			<img src="docs/assets/truthmark-position.png" alt="Truthmark 定位" width="100%" />
			<br><strong>定位</strong><br>
			Truthmark 相对提示词、记忆和规格工作流所处的位置。
		</td>
	</tr>
	<tr>
		<td align="center" colspan="2">
			<img src="docs/assets/truthmark-syncflow.png" alt="Truthmark 同步流程" width="100%" />
			<br><strong>同步流程</strong><br>
			Truth Sync 如何在交接前收束普通代码变更。
		</td>
	</tr>
</table>

## 为什么团队会采用它

Truthmark 不是为了让代理显得更聪明，而是为了让 AI 辅助的仓库变更更值得信任。

- 代码变更后的已安装 Truth Sync 工作流，把文档维护从团队习惯变成工作流保护。
- 按分支生效的事实会跟着代码一起走，所以审查者可以在普通 Git diff 里检查当前事实。
- 仓库原生的工作流载体让推广更轻、交接更稳，不再只依赖个人本地配置。
- `docs/truthmark/areas.md` 和委托的子路由文件里的显式路由，为代理提供更清晰的所有权边界和更安全的写入路径。
- 本地优先的运行方式避免了守护进程、数据库、远程服务或 MCP 依赖。
- 路由模型与语言无关，并为常见的 JavaScript、TypeScript、Go、Python、C# 和 Java 代码表面提供覆盖率诊断。

对技术负责人来说，它的价值是没有额外基础设施负担的治理：测试、代码审查和所有权仍然承担真正的工作；Truthmark 让代理上下文变得持久、可检查，并且限定在当前分支内。

## Truthmark 适合放在哪里

Truthmark 不是一套通用 AI 生产力套件。它占据的是工具栈里的一个特定层级：随实现保持一致、按分支生效、可审查的仓库事实。

| 如果你需要                                   | 最合适的选择                   |
| -------------------------------------------- | ------------------------------ |
| 单次编码会话获得更好结果                     | 更好的提示词和更清晰的任务边界 |
| 一个代理或操作者跨会话延续便利性             | 记忆类工具                     |
| 为新功能做规格优先的规划                     | Spec Kit 等规格工具            |
| 随代码一起流转、可审查、按分支生效的仓库事实 | Truthmark                      |

重点不是提示词、记忆或规格没有用。重点是，它们单独都不能把仓库事实变成一个已提交、可检查，并且能经受交接、审查和分支分叉的资产。

## 目录

- [为什么团队会采用它](#为什么团队会采用它)
- [Truthmark 解决什么问题](#truthmark-解决什么问题)
- [Truthmark 适合放在哪里](#truthmark-适合放在哪里)
- [快速开始](#快速开始)
- [它如何运行](#它如何运行)
- [它会安装什么](#它会安装什么)
- [命令](#命令)
- [它为什么存在](#它为什么存在)
- [项目状态](#项目状态)
- [文档](#文档)
- [非目标](#非目标)
- [许可证](#许可证)

## Truthmark 解决什么问题

Truthmark 把仓库事实变成代理可见的显式工作流载体：

- `.truthmark/config.yml` 定义已提交的层级契约。
- `docs/truthmark/areas.md` 和委托的子路由文件把代码区域映射到负责它们的文档。
- Truth Document 在无需修改代码时，为已实现行为生成或修复规范事实文档。
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

支持的平台是 `codex`、`opencode`、`claude-code`、`github-copilot` 和 `gemini-cli`。默认配置包含全部平台；请先从 `.truthmark/config.yml` 中移除不使用的平台，再重新运行 `truthmark init`。
默认脚手架把 truth `README.md` 作为索引，并把当前行为事实放在有边界的叶子文档中，例如 `docs/truth/repository/overview.md`。

现有仓库通常需要在 `init` 之后做一次清理：当生成的 `repository` 路由过宽、所有权跨越多个产品或服务，或路由文件仍指向占位文档时，运行已安装的 Truth Structure 工作流。Truth Structure 会拆分过宽的路由，创建或修复初始的规范事实文档，并在功能代码工作开始前为 Truth Sync 提供精确目标。Codex、Claude Code 和支持的 Copilot IDE 可以用 `/truthmark-structure` 调用它；OpenCode 风格的宿主可以用 `/skill truthmark-structure` 调用它。

## 它如何运行

Truthmark 最强的地方是默认路径，而不是一堆手动命令。由实际执行的代理和宿主环境决定是委托执行，还是内联运行已安装的工作流。

### 已实现但无文档的行为

当实现已经存在，但规范事实文档缺失或较弱时，使用这个流程：

```text
用户识别一个已实现的行为或 API 端点
用户显式调用 Truth Document
代理读取实现、测试、路由和现有文档
代理只写 truth docs 和路由
审查 truth-doc diff
```

Truth Document 是手动、implementation-first 的流程：代码作为证据，事实文档被创建或修复，且不能修改功能代码。Codex、Claude Code 和支持的 Copilot IDE 可以用 `/truthmark-document` 调用它；OpenCode 风格的宿主可以用 `/skill truthmark-document` 调用它。

```text
/truthmark-document 在 docs/truth/authentication 下记录已实现的会话超时行为
```

### 常规代码变更

多数用户不需要直接调用 Truth Sync。关键在于，只要功能代码发生变化，已安装的代理工作流就会把 Truth Sync 当作收尾保护。正常路径是：

```text
代理修改功能代码
运行相关测试
已安装的 Truth Sync 工作流在代理结束前运行
如果生成了 truth-doc diff，就审查它
提交或交接工作
```

Truth Sync 是 code-first：代码在前，事实文档跟随，且 Truth Sync 不能重写功能代码。它的主要职责是在功能代码发生变化时，通过已安装的代理工作流充当收尾保护。直接调用主要用于排查问题、交接前提前同步，或有意运行这套工作流。

Codex、Claude Code 和支持的 Copilot IDE 可以用 `/truthmark-sync` 调用它。OpenCode 风格的宿主可以用 `/skill truthmark-sync` 调用它。

```text
/truthmark-sync 现在同步仓库 truth，然后再交接
```

### 文档优先变更

当产品或架构决策从文档开始时，使用这个流程：

```text
用户编辑 truth docs
用户显式调用 Truth Realize
代理读取 truth docs 和相关代码
代理只更新代码
运行相关测试
提交或交接工作
```

Truth Realize 是手动、文档优先的流程：事实文档在前，代码跟随，代理不能编辑它正在实现的事实文档。

Codex、Claude Code 和支持的 Copilot IDE 可以用 `/truthmark-realize` 调用它。OpenCode 风格的宿主可以用 `/skill truthmark-realize` 调用它。

```text
/truthmark-realize 将 docs/truth/authentication/session-timeout.md 实现为代码
```

## 它会安装什么

Truthmark 把持久化的工作流载体保持得很小，而且是仓库原生的。运行 `truthmark init` 之后，仓库本身就携带路由、规则和已安装的工作流载体，因此团队不再只依赖某个人的本地配置。

- `.truthmark/config.yml`，用于机器可读的已提交层级契约
- `docs/truthmark/areas.md`，用于根路由索引
- `docs/truthmark/areas/**/*.md`，用于委托的子路由文件
- `docs/templates/behavior-doc.md` 以及 `docs/templates/` 下其他按类型划分的模板，用作生成工作流采用的可编辑 truth doc 标准
- 面向已配置平台的受管说明块，例如 `AGENTS.md`、`CLAUDE.md`、Copilot 指令和 `GEMINI.md`
- 面向 Truth Structure、Truth Document、Truth Sync、Truth Realize 和 Truth Check 的宿主原生技能、提示或命令

安装后的工作流载体就是运行时：

- Truth Structure 创建或修复区域路由和起始事实文档。
- Truth Document 为已实现行为创建或修复事实文档。
- Truth Sync 在功能性变更发生时，让已映射的事实文档保持同步。
- Truth Realize 更新代码，使其符合事实文档。
- Truth Check 审计仓库事实的健康状况。

功能 `README.md` 是索引。Truth Sync 预期读取并更新用于描述当前行为的有边界叶子文档。生成的工作流载体会保留仓库规则的权威性，同时把实现代码和规范事实文档当作当前行为的证据。

生成的载体由 Truthmark 管理，包含版本标记，并可通过 `truthmark init` 刷新。

## 命令

Truthmark V1 有意保持 CLI 很小，因为持续运行的工作流应该活在已安装的代理载体里，而不是一长串日常手动命令里。在下游仓库中，`truthmark config` 创建已提交的层级契约，`truthmark init` 根据这份已审查的配置安装和刷新工作流载体，`truthmark check` 则为人工审计、CI 或问题排查验证事实产物，而仓库情报命令会在有本地工具时生成派生审查产物。

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

`config` 只写入 `.truthmark/config.yml`，除非使用 `--stdout`。

`init` 需要 `.truthmark/config.yml`，然后安装或刷新本地工作流文件。

`check` 验证配置、权限边界、路由、承载决策的文档、frontmatter、内部链接、分支范围和覆盖率诊断。

`index` 为当前 checkout 构建 RepoIndex 和 RouteMap JSON。

`impact --base <ref>` 会把变更文件映射到已路由的 truth docs、所属路由、附近测试和 public symbols。

`context --workflow <workflow> [--base <ref>]` 会为 Truth Sync、Truth Document 或 Truth Realize 生成一个受限的 ContextPack。`--format markdown` 会把它渲染成可读文本。

Truth Structure、Truth Document、Truth Sync、Truth Realize 和 Truth Check 是已安装的代理工作流，不是日常使用的顶层 CLI 命令。

它们通过已配置的代理宿主表面运行，例如 Codex/Claude/Copilot 的 `/truthmark-*`、OpenCode 的 `/skill truthmark-*`，或者 Gemini 的 `/truthmark:*`。

```text
/truthmark-check 在 review 前审计路由和 truth 覆盖
```

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

Truthmark 不是记忆服务器，也不是 MCP 服务器。它是一套仓库实践，被打包成一个小型 CLI 安装器和代理原生的工作流载体，用来把 AI 工作流规则变成仓库基础设施。

V1 目前提供：

- `truthmark config`
- `truthmark init`
- `truthmark check`
- `truthmark index`
- `truthmark impact`
- `truthmark context`
- 受管的 `AGENTS.md` 工作流说明
- 为已配置代理宿主生成的 Truth Structure、Truth Document、Truth Sync、Truth Realize 和 Truth Check 技能载体
- 分支范围元数据
- 配置、权限边界、路由、决策结构、frontmatter、链接和多语言覆盖率诊断
- RepoIndex、RouteMap、ImpactSet 和 ContextPack 派生产物，可在 CLI 可用时加快本地检查

## 文档

根 README 面向评估和试用这个包的人。详细的功能和业务规范位于 `docs/` 下：

- [文档索引](docs/README.md)
- [架构概览](docs/architecture/overview.md)
- [API 和 CLI 契约](docs/truth/contracts.md)
- [Init 和脚手架行为](docs/truth/init-and-scaffold.md)
- [Check 诊断](docs/truth/check-diagnostics.md)
- [已安装工作流](docs/truth/workflows/overview.md)
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
