# Truthmark

**你的代理会写代码。Truthmark 维护面向人类、可在 Git 中审查的文档。**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Truthmark 横幅](../assets/truthmark-banner.png)

## 🚀 快速开始：五分钟本地运行

在你希望由 Truthmark 管理的 Git 仓库中运行：

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

启用你实际使用的 AI 宿主。新配置默认与宿主无关，因此在初始化前，先把顶层 `platforms` 列表添加到 `.truthmark/config.yml`：

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

然后安装仓库本地的事实文档、路由和代理工作流界面：

```bash
truthmark init
truthmark check
git diff
```

现在尝试最常见的采用路径：根据代码和测试记录一个已有行为。在你的 AI 编码宿主中，请求已安装的工作流：

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

之后，用户通常不应直接调用 Truth Sync。继续通过你的 AI 宿主编写代码；已安装的仓库指令会告诉代理：当功能代码发生变化时，在交接前运行相关测试并执行 Truth Sync 审查。你审查最终的代码 diff 和事实文档 diff。

如果你暂时只想要 CLI 验证，而不需要特定宿主的 AI 工作流，可以省略 `platforms`，并运行 `truthmark init && truthmark check`；之后你可以再添加平台并重新运行 `truthmark init`。

## 💡 问题：AI 文档缺口

AI 编码代理非常擅长快速编写代码。但这种速度会产生一种危险的新失效模式：**仓库所讲述的故事与现实发生偏移。**

* 行为遗失在短暂的聊天历史中。
* 架构文档很快落后。
* 产品决策在交接后消失。
* 代码审查者只能查看原始代码 diff，却不了解“为什么”。
* 每个新的 AI 会话都被迫从头重新发现仓库事实。

## 🎯 解决方案：Truthmark

**Truthmark** 会在你的仓库中安装一个 Git 原生的工作流层。它修复 AI 开发中通常会坏掉的部分：帮助文档与代码保持一致。

Truthmark 不是指望人类和 AI 代理都记得更新文档，而是在你的仓库中把文档变成一种系统化、可审查的习惯。

### ✨ Truthmark 的独特之处

Truthmark 不只是另一个文档工具。它深度集成到 AI 工作流中：

* **🚫 零供应商锁定：** 没有托管服务、隐藏数据库，也没有需要额外运维的服务器。
* **🌳 100% Git 原生：** 一切都存在于你的仓库中。事实随分支一起移动。
* **🤝 双界面架构：** 它清晰分离人类用于管理仓库的工具，以及 AI 代理用于编写代码的工作流。
* **✅ 通过验证建立信任：** 因为改变行为的工作会包含可由人类审查的事实文档决策或 diff，AI 工作更容易被信任。

## 🔄 工作原理

当 AI 代理修改你的代码时，工作并未完成。Truthmark 会安装一个交接前的收尾工作流保护，代理在交接前遵循它：

1. 💻 **代码：** 代理修改功能代码。
2. 🧪 **测试：** 执行相关测试。
3. 🔍 **检查：** 已安装工作流运行时，`Truth Sync` 会检查已映射的文档。
4. 📝 **记录：** 当仓库事实发生变化时，代理更新文档。
5. 👀 **审查：** 人类审查*代码 diff* + *事实 diff*。

## 🛠 两个界面，一个事实系统

Truthmark 有意拆分为两个不同界面，以同时服务人类维护者和 AI 代理。

### 1. 🧑‍💻 人类 CLI（维护者和 CI）
供开发者设置、配置和验证仓库使用。
* `truthmark config` - 创建初始配置。
* `truthmark init` - 安装必要的路由、脚手架和指令。
* `truthmark check` - 从终端验证事实产物。

### 2. 🤖 面向 AI 的工作流（代理）
Truthmark 会安装受支持 AI 宿主（如 Codex、Claude Code、GitHub Copilot、OpenCode、Antigravity 和 Cursor）能够理解的原生技能、提示和命令。这些*不是* shell 命令；它们是 AI 的工作流入口点。
* `/truthmark-sync` - 代理在功能代码变化后遵循的收尾工作流；不是普通的用户启动命令。
* `/truthmark-document` - 为尚未记录的既有代码生成文档。
* `/truthmark-structure` - 将宽泛的仓库区域组织为具体领域。
* `/truthmark-realize` - **文档优先开发：** 阅读架构文档并生成与之匹配的代码。
* `/truthmark-check` - 由代理驱动的仓库事实审计。

## 你会得到什么

| 能力 | 作用 |
| --- | --- |
| Git 原生事实 | 将仓库事实保存在已提交的 Markdown 和配置中。 |
| 按分支生效的文档 | 事实随分支移动，而不是存在于私有会话中。 |
| 人类 CLI | 为维护者提供设置、刷新、验证和检查命令。 |
| 面向 AI 的工作流 | 为代理提供宿主原生的同步、文档、结构、实现和审计工作流。 |
| 显式路由 | 将代码区域映射到规范事实文档。 |
| 可审查交接 | 为代码和事实文档都产生普通 Git diff。 |
| 本地优先运行 | 不需要托管服务、守护进程、数据库或 MCP 服务器。 |
| 更安全的写入边界 | 区分代码优先、文档优先、只读和仅文档工作流。 |
| 验证 | 报告路由、权限、frontmatter、链接、生成界面、分支范围、新鲜度和覆盖率问题。 |
| 可选 Portal | 在明确启用并请求时，从 Markdown 事实文档生成已提交的静态 HTML 展示站点。 |

## 视觉概览

![Truthmark 功能](../assets/truthmark-features.png)

**功能：** Truthmark 会安装什么，以及工作流界面如何拆分。

![Truthmark 定位](../assets/truthmark-position.png)

**定位：** Truthmark 相对于提示、记忆和规格工作流的位置。

![Truthmark 同步流程](../assets/truthmark-syncflow.png)

**同步流程：** Truth Sync 如何在交接前收尾普通代码变更。

## 团队为什么采用它

Truthmark 面向已经知道 AI 代理能够生成代码的团队。

下一个问题是治理。

不是作为仪式的治理。治理只是一个简单问题：

> 在这次 AI 辅助变更之后，仓库仍然讲述事实吗？

Truthmark 通过已提交文件、显式路由和可审查 diff 帮助团队回答这个问题。

当你需要以下内容时，它很有用：

- 减少文档漂移
- 更好的交接
- 按分支生效的产品事实
- 持久的架构和 API 文档
- 文档和代码之间的明确所有权
- 更安全的代理写入边界
- 可审查的文档，而不是隐藏记忆
- 仍然能从已提交仓库文件运行的 AI 工作流

## Truthmark 的位置

Truthmark 不替代提示、记忆、规格、测试或代码审查。

它为这些工作流提供一个可以持久落在 Git 中的位置。

| 需求 | 更合适的选择 |
| --- | --- |
| 从单次代理会话获得更好输出 | 更好的提示 |
| 个人或会话级连续性 | 记忆工具 |
| 先计划后实现的功能工作 | 规格工作流 |
| 随代码一起移动的按分支事实 | Truthmark |
| 验证行为正确性 | 测试和审查 |
| 审查 AI 辅助的文档变更 | Truthmark 加 Git 审查 |

Truthmark 的边界有意很窄：

```text
make repository truth explicit
route it to code
install agent workflows around it
keep the result reviewable in Git
```

## 深入了解

README 是门面：快速背景、快速开始和核心心智模型。

如需逐条命令的用法、界面对比、受支持平台详情、配置、路由、Portal 和示例，请阅读 [Truthmark 用户指南](../user-guide.md)。

## 项目状态

当前版本提供：

- 用于 config、init、check、index、impact 和 workflow status 的本地 CLI 命令
- 为 Codex、Claude Code、GitHub Copilot、OpenCode、Antigravity 和 Cursor 生成的 AI 工作流界面
- 路由、权限、frontmatter、链接、新鲜度、生成界面、分支范围和覆盖率诊断
- 按分支生效的事实文档和派生的仓库智能产物

## 文档

- [用户指南](../user-guide.md)
- [文档索引](../README.md)
- [架构概览](../truthmark/engineering/architecture/overview.md)
- [API 和 CLI 契约](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [仓库事实维护指南](../standards/maintaining-repository-truth.md)

有关本地开发和贡献命令，请参阅 [CONTRIBUTING.md](../../CONTRIBUTING.md)。

## 设计边界

Truthmark 有意保持小而明确：本地、已提交、按分支生效、可审查。

它不是托管服务、MCP 服务器、向量数据库、隐藏记忆层、CI 强制执行产品，也不是自主代码重写引擎。它帮助仓库事实保持可见；它不替代测试、代码审查或人类判断。

## 许可证

MIT。见 [LICENSE](../../LICENSE)。
