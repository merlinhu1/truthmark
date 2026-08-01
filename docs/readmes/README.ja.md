# Truthmark

**あなたのエージェントはコードを書きます。Truthmark は、人が読み、Git でレビューできるドキュメントを維持します。**

Truthmark は Git ネイティブなワークフローをインストールし、AI コーディングエージェントが既存のコードとテストから新しいプロダクトおよびエンジニアリングドキュメントを作成し、コードが変更されるたびに最新の状態を保ち、通常の Markdown diff としてレビューできるようにします。

[![npm version](https://img.shields.io/npm/v/truthmark?color=cb3837&label=npm)](https://www.npmjs.com/package/truthmark)
[![CI](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Node.js >=24](https://img.shields.io/badge/node-%3E%3D24-339933?logo=node.js&logoColor=white)](../../package.json)

[今すぐ始める](#クイックスタート最初の-truth-ドキュメントを作成する) · [ウェブサイト](https://merlinhu1.github.io/truthmark/) · [ユーザーガイド](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md) · [GitHub](https://github.com/merlinhu1/truthmark)

<details>
<summary>この README を 16 言語で読む</summary>

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

</details>

## 最初のドキュメントを作り、常に真実に保つ

多くのドキュメントツールは生成した時点で役目を終えます。Truthmark は、リポジトリ内でエージェントに完全なドキュメントライフサイクルを提供します。

- **動作するソフトウェアから新しいドキュメントを作成。** Truth Document がコードとテストを読み、範囲の明確なプロダクトまたはエンジニアリングドキュメントを作成します。
- **ドキュメントを自動的に整合。** 機能コードの変更後、Truth Sync がエージェントの引き渡し時に実行され、作業完了前にリポジトリの事実を更新します。
- **ドキュメントをコードに戻す。** Truth Realize が承認済みの truth ドキュメントを実装し、明快なドキュメントファーストのワークフローを維持します。
- **コードベースの成長に合わせて所有範囲を修復。** Truth Structure が、新しい領域や肥大化した領域に、範囲の明確なルートと初期ドキュメントを作成します。
- **すべてを Git でレビュー。** コード、意思決定、契約、アーキテクチャ、運用、振る舞いがブランチと一緒に移動します。

ホスト型ナレッジベースは不要。非公開のエージェントメモリも不要。チャット履歴に閉じ込められるドキュメントもありません。

## クイックスタート：最初の Truth ドキュメントを作成する

**要件：** Node.js 24 以降、Git リポジトリ、エージェントワークフローに対応する AI コーディングホスト。

Truthmark に管理させたいリポジトリ内で実行します。

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark init
```

`truthmark init` では、Codex、Claude Code、GitHub Copilot、OpenCode、Antigravity、Cursor、またはホストに依存しないコマンドラインインターフェース設定を選択できます。

次に、設定済みのエージェントへ、実際の振る舞いを 1 つドキュメント化するよう依頼します。

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

対応するドキュメントがなければ、Truth Document は範囲の明確な truth ドキュメントを新規作成します。既存の所有ドキュメントがあれば更新し、必要に応じてルーティングも更新します。機能コードは変更しません。

結果をレビューします。

```bash
truthmark check
git status --short --untracked-files=all
git diff
```

これで、次のファイルが作成されているはずです。

```text
docs/truthmark/engineering/behaviors/session-timeout.md
docs/truthmark/routes/areas/authentication.md
```

正確なパスは、リポジトリの所有構造に従います。新規ファイルは `git status` に表示され、追跡済みファイルへの変更は `git diff` に表示されます。

呼び出し方法はホストによって異なります。OpenCode は `/skill truthmark-document`、Antigravity は `@truthmark-document`、その他の対応ホストは各ホスト固有のスキルまたはスラッシュコマンドを使用します。正確なコマンドは[プラットフォーム表](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md#supported-agent-platforms)を参照してください。

スクリプトと継続的インテグレーションでは、選択するプラットフォームを明示的に渡します。

```bash
truthmark init --platform codex --platform cursor
truthmark init --json
```

対話形式で `none` を選択するか、`truthmark init --clear-platforms` を実行すると、ホストに依存しないリポジトリになります。後から `truthmark init` を再実行して、エージェントプラットフォームを追加できます。

ブランチを基準とした鮮度診断には、Git のベースを渡します。

```bash
truthmark check --base <base-ref>
```

## Truthmark の仕組み

<picture>
  <source media="(max-width: 700px)" srcset="../assets/truthmark-workflow-mobile.svg">
  <img src="../assets/truthmark-workflow.svg" alt="Truthmark の仕組み" width="1440">
</picture>

Truthmark のコマンドラインインターフェースがリポジトリ契約をインストールして検証します。コーディングエージェントは、インストール済みのホストネイティブなワークフローを通じて、証拠の確認とドキュメント作業を実行します。

通常のコード変更は、次のシンプルなループに従います。

1. エージェントが機能コードを変更します。
2. 関連するテストを実行します。
3. Truth Sync が対応付けられたドキュメントを確認します。
4. リポジトリの事実が変わった場合、エージェントがドキュメントとルーティングを作成または更新します。
5. コード diff と truth diff を一緒にレビューします。

## ワークフロー

| ワークフロー         | 使用する場面                                                       | 結果                                                                                 |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| **Truth Document**   | 既存のコードにドキュメントが必要                                   | 証拠に基づくプロダクトおよびエンジニアリングドキュメントを作成または更新             |
| **Truth Sync**       | 機能コードが変更された                                             | 引き渡し前に、対応付けられたドキュメントとルーティングを整合                         |
| **Truth Structure**  | 新しい領域に所有範囲が必要、または既存ドキュメントの範囲が広すぎる | 範囲の明確なルートと骨組みとなる初期ドキュメントを作成                               |
| **Truth Realize**    | 承認済みの truth ドキュメントを動作するソフトウェアにする          | ドキュメントに基づいて機能コードを更新                                               |
| **Truth Check**      | リポジトリの事実を監査する必要がある                               | ルーティング、所有範囲、証拠、ドキュメントの問題を報告                               |
| **Truthmark Portal** | チームが閲覧可能なドキュメントサイトを必要としている               | Markdown の truth ドキュメントから、コミットされる静的 HTML プレゼンテーションを生成 |

Truthmark は、Codex、Claude Code、GitHub Copilot、OpenCode、Antigravity、Cursor 向けのネイティブなリポジトリサーフェスとして、これらのワークフローをインストールします。

## 得られるもの

### 現実から始まるドキュメント

Truthmark は、プロダクト機能、実装の振る舞い、アプリケーションプログラミングインターフェース、アーキテクチャ、ワークフロー、運用、テストのドキュメントを作成できます。コードとテストが証拠を提供し、範囲の明確な Markdown ドキュメントが結果を保持します。

### 次の変更にも耐えるドキュメント

ルートがコード領域と正規ドキュメントを結び付けます。エージェントが振る舞いを変更すると、Truth Sync は対応する事実の格納先を把握し、引き渡しをレビュー可能な状態に保ちます。

### プロダクトの事実とエンジニアリングの事実を別レーンで管理

プロダクトの事実は、ユーザー向けの約束、境界、意思決定、受け入れ基準を記録します。エンジニアリングの事実は、現在の振る舞い、契約、アーキテクチャ、ワークフロー、運用、テストの振る舞いを記録します。

### Git ネイティブなコラボレーション

重要なものはすべて、コミットされたリポジトリファイルに存在します。事実はブランチに従い、通常のプルリクエストで機能し、すべてのメンテナーとコーディングエージェントから確認できます。

### ローカルファーストの運用

Truthmark に、ホスト型サービス、デーモン、データベース、ベクトルストア、Model Context Protocol サーバーは不要です。リポジトリ自体がドキュメントワークフローを保持します。

## Truthmark が適する領域

| ニーズ                                             | 最適な選択肢                 |
| -------------------------------------------------- | ---------------------------- |
| 1 回のエージェントセッションからより良い出力を得る | より良いプロンプト           |
| 個人またはセッション単位の継続性                   | メモリツール                 |
| 計画優先の機能開発                                 | 仕様ワークフロー             |
| コードと一緒に移動するブランチ単位のドキュメント   | **Truthmark**                |
| 振る舞いの正しさ                                   | テストとコードレビュー       |
| レビュー可能な AI 支援ドキュメント                 | **Truthmark + Git レビュー** |

Truthmark は、すでに AI コーディングエージェントを利用し、コードの変化と同じ速さでリポジトリが真実を伝え続けることを求めるメンテナーとエンジニアリングチームのために作られています。

## 対応ホストとコマンドライン

対応するエージェントホスト：

- Codex
- Claude Code
- GitHub Copilot
- OpenCode
- Antigravity
- Cursor

<details>
<summary>コマンドラインリファレンス</summary>

| コマンド                                                          | 目的                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `truthmark init`                                                  | 設定、ルーティング、テンプレート、選択したホストのワークフローを作成または更新 |
| `truthmark check [--base <ref>]`                                  | リポジトリの事実を検証し、必要に応じてブランチの鮮度診断を実行                 |
| `truthmark index --json`                                          | 導出されたリポジトリおよびルーティングのメタデータを確認                       |
| `truthmark impact --base <ref> --json`                            | 変更されたファイルをドキュメント、所有者、近隣のテストに対応付け               |
| `truthmark workflow status --workflow <id> [--base <ref>] --json` | ワークフローの適用可否と対象を確認                                             |
| `truthmark validate ...`                                          | ワークフローレポートと書き込みリースを検証                                     |
| `truthmark uninstall --dry-run` / `truthmark uninstall --apply`   | 作成済みの事実を保持したまま、生成されたホストサーフェスをプレビューまたは削除 |

スクリプトと継続的インテグレーション向けに、コマンドラインインターフェース全体で構造化 JSON 出力を利用できます。

</details>

## 詳細情報

- [Truthmark ユーザーガイド](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md)
- [ドキュメント索引](https://github.com/merlinhu1/truthmark/blob/main/docs/README.md)
- [アーキテクチャ概要](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/architecture/overview.md)
- [設定、ルーティング、コマンドの契約](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [リポジトリの事実を維持する](https://github.com/merlinhu1/truthmark/blob/main/docs/standards/maintaining-repository-truth.md)
- [コントリビューション](https://github.com/merlinhu1/truthmark/blob/main/CONTRIBUTING.md)

**Truthmark をインストールし、コーディングホストを選び、今日から実際の振る舞いをドキュメントに変えましょう。**

## ライセンス

MIT。[LICENSE](../../LICENSE) を参照してください。
