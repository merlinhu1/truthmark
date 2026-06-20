# Truthmark

**あなたのエージェントはコードを書きます。Truthmark は、人間向けで Git 上でレビュー可能なドキュメントを維持します。**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Truthmark バナー](../assets/truthmark-banner.png)

## 🚀 クイックスタート：5 分でローカル実行

Truthmark に管理させたい Git リポジトリ内でこれを実行します：

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

実際に使っている AI ホストを有効にします。新しい設定はホスト非依存なので、初期化前にトップレベルの `platforms` リストを `.truthmark/config.yml` に追加してください：

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

次に、リポジトリローカルの truth ドキュメント、ルーティング、エージェントワークフローサーフェスをインストールします：

```bash
truthmark init
truthmark check
git diff
```

次に、最も一般的な導入パスを試します。コードとテストから既存の振る舞いを 1 つドキュメント化します。AI コーディングホストで、インストール済みワークフローに依頼してください：

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

その後、通常ユーザーが Truth Sync を直接呼び出す必要はありません。AI ホストを通じてコーディングを続けてください。インストールされたリポジトリ指示が、機能コードの変更時に関連テストを実行し、引き渡し前に Truth Sync レビューを行うようエージェントに伝えます。あなたは結果のコード diff と truth-doc diff をレビューします。

CLI 検証だけが必要で、ホスト固有の AI ワークフローをまだ使わない場合は、`platforms` を省略したまま `truthmark init && truthmark check` を実行してください。後からプラットフォームを追加し、`truthmark init` を再実行できます。

## 💡 問題：AI ドキュメントギャップ

AI コーディングエージェントは、コードを高速に書くことに非常に優れています。しかしその速度は、危険な新しい失敗モードを生みます：**リポジトリの物語が現実からずれていく**ことです。

* 振る舞いが一時的なチャット履歴の中に失われます。
* アーキテクチャ文書はすぐに遅れます。
* プロダクト上の決定は引き渡し後に消えます。
* コードレビュー担当者は「なぜ」を理解できないまま生のコード diff を見ることになります。
* 新しい AI セッションのたびに、リポジトリの truth を一から再発見しなければなりません。

## 🎯 解決策：Truthmark

**Truthmark** は、Git ネイティブなワークフロー層をリポジトリにインストールします。AI 開発で通常壊れやすい部分、つまりドキュメントをコードと整合させ続けることを修復します。

人間や AI エージェントがドキュメント更新を忘れないことに期待するのではなく、Truthmark はドキュメントを体系的でレビュー可能な習慣としてリポジトリ内に組み込みます。

### ✨ Truthmark が独自である理由

Truthmark は単なる別のドキュメントツールではありません。AI ワークフローに深く統合されています：

* **🚫 ベンダーロックインなし：** ホステッドサービスも、隠れたデータベースも、運用すべき追加サーバーもありません。
* **🌳 100% Git ネイティブ：** すべてがリポジトリ内にあります。truth はブランチと一緒に移動します。
* **🤝 人間が所有し、エージェントが従う契約:** メンテナーがリポジトリ契約を所有し、エージェントはコーディング中にインストール済み指示に従います。
* **✅ 検証による信頼：** 振る舞いを変える作業には、人間がレビューできる truth-doc の判断または diff が含まれるため、AI の作業を信頼しやすくなります。

## 🔄 仕組み

AI エージェントがコードを変更しても、仕事はまだ終わりではありません。Truthmark は、引き渡し前にエージェントが従う完了時ワークフローガードをインストールします：

1. 💻 **コード：** エージェントが機能コードを変更します。
2. 🧪 **テスト：** 関連テストを実行します。
3. 🔍 **チェック:** Truthmark は、インストール済みの終了時レビューの一部として、対応するドキュメントを確認します。
4. 📝 **ドキュメント化：** リポジトリの truth が変わった場合、エージェントがドキュメントを更新します。
5. 👀 **レビュー：** 人間が*コード diff* + *truth diff*をレビューします。

## 🛠 Truthmark との関わり方

Truthmark には、リポジトリローカルな契約が 1 つあり、それを使う方法が 2 つあります。

### 人間が契約をインストールして検証する

メンテナーと CI は CLI を使います:

* `truthmark config` - 初期設定を作成します。
* `truthmark init` - ルーティング、truth-doc の足場、AI ホスト向け指示をインストールまたは更新します。
* `truthmark check` - ターミナルからリポジトリ truth を検証します。

### エージェントはコーディング中に契約に従う

Truthmark は、Codex、Claude Code、GitHub Copilot、OpenCode、Antigravity、Cursor などの対応 AI コーディングホスト向けに、リポジトリローカルな指示をインストールします。

通常の流れは単純です:

1. エージェントにコード変更を依頼するか、既存の振る舞いの文書化を依頼します。
2. インストール済みの指示が、いつテストし、いつ truth docs を更新し、いつ人間レビューのために止まるかをエージェントに伝えます。
3. あなたは通常の Git diff をレビューします。コードと、必要なら truth-doc の変更です。

ユーザーが開始するエージェント依頼は意図的に少なくしています:

* `/truthmark-document` - コードとテストから既存の実装済み振る舞いを文書化します。
* `/truthmark-realize` - 既存の truth docs からコードを実装します。
* `/truthmark-check` - リポジトリ truth を監査します。

Truth Sync は作業を始める通常の方法ではありません。機能コード変更後の終了時レビューです。
Truth Structure は日常コマンドではありません。作業をブロックしている場合にだけ、ルーティングや所有者情報を修復します。

## 得られるもの

| 機能 | 内容 |
| --- | --- |
| Git ネイティブな truth | リポジトリの truth をコミット済み Markdown と設定に保持します。 |
| ブランチ単位のドキュメント | truth はプライベートセッションではなく、ブランチと一緒に移動します。 |
| 人間向け CLI | メンテナーにセットアップ、更新、検証、確認のコマンドを提供します。 |
| インストール済みエージェント契約 | ドキュメント化、実現、監査、終了時 sync、限定的なルーティング修復のためのホストネイティブなガイダンスをエージェントに提供します。 |
| 明示的なルーティング | コード領域を正規の truth ドキュメントに対応付けます。 |
| レビュー可能な引き渡し | コードと truth ドキュメントの両方について通常の Git diff を生成します。 |
| ローカルファースト運用 | ホステッドサービス、デーモン、データベース、MCP サーバーを必要としません。 |
| より安全な書き込み境界 | コードファースト、ドキュメントファースト、読み取り専用、ドキュメント専用のワークフローを分離します。 |
| 検証 | ルーティング、権限、frontmatter、リンク、生成サーフェス、ブランチスコープ、鮮度、カバレッジの問題を報告します。 |
| 任意の Portal | 明示的に有効化され要求された場合、Markdown truth ドキュメントからコミット済みの静的 HTML プレゼンテーションサイトを生成します。 |

## ビジュアル概要

![Truthmark の機能](../assets/truthmark-features.png)

**機能：** Truthmark が何をインストールし、ワークフローサーフェスがどのように分割されるか。

![Truthmark の位置づけ](../assets/truthmark-position.png)

**位置づけ：** Truthmark がプロンプト、メモリ、仕様ワークフローに対してどこに位置するか。

![Truthmark の同期フロー](../assets/truthmark-syncflow.png)

**同期フロー：** Truth Sync が通常のコード変更を引き渡し前にどのように締めくくるか。

## チームが採用する理由

Truthmark は、AI エージェントがコードを生成できることをすでに理解しているチームのためのものです。

次の問題はガバナンスです。

儀式としてのガバナンスではありません。ガバナンスとは、単純な問いです：

> この AI 支援の変更後も、リポジトリはまだ真実を伝えているか？

Truthmark は、コミット済みファイル、明示的なルーティング、レビュー可能な diff によって、チームがこの問いに答えるのを助けます。

次のようなものが必要なときに有用です：

- ドキュメントのずれを減らす
- より良い引き渡し
- ブランチ固有のプロダクト truth
- 長持ちするアーキテクチャおよび API ドキュメント
- ドキュメントとコードの間の明示的な所有関係
- より安全なエージェントの書き込み境界
- 隠れたメモリではなく、レビュー可能なドキュメント
- コミット済みリポジトリファイルから引き続き動作する AI ワークフロー

## Truthmark の適用範囲

Truthmark は、プロンプト、メモリ、仕様、テスト、コードレビューを置き換えません。

それらのワークフローが Git に永続的に着地する場所を提供します。

| ニーズ | より適したもの |
| --- | --- |
| 1 回のエージェントセッションからより良い出力を得る | より良いプロンプト |
| 個人またはセッション単位の継続性 | メモリツール |
| 計画ファーストの機能開発 | 仕様ワークフロー |
| コードと一緒に移動するブランチ単位の truth | Truthmark |
| 振る舞いの正しさを検証する | テストとレビュー |
| AI 支援によるドキュメント変更をレビューする | Truthmark と Git レビュー |

Truthmark のレーンは意図的に狭く設計されています：

```text
make repository truth explicit
route it to code
その周囲にエージェント指示をインストールする
keep the result reviewable in Git
```

## さらに詳しく

README は店頭のようなものです。素早い文脈、クイックスタート、核となるメンタルモデルを提供します。

コマンドごとの使い方、サーフェス比較、対応プラットフォームの詳細、設定、ルーティング、Portal、例については、[Truthmark ユーザーガイド](../user-guide.md)を読んでください。

## プロジェクトの状態

現在のリリースは次を提供します：

- config、init、check、index、impact、workflow status のためのローカル CLI コマンド
- Codex、Claude Code、GitHub Copilot、OpenCode、Antigravity、Cursor 向けに生成されるリポジトリローカルなエージェント指示
- ルーティング、権限、frontmatter、リンク、鮮度、生成サーフェス、ブランチスコープ、カバレッジの診断
- ブランチ単位の truth ドキュメントと、派生したリポジトリインテリジェンス成果物

## ドキュメント

- [ユーザーガイド](../user-guide.md)
- [ドキュメント索引](../README.md)
- [アーキテクチャ概要](../truthmark/engineering/architecture/overview.md)
- [API と CLI の契約](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [リポジトリ truth メンテナンスガイド](../standards/maintaining-repository-truth.md)

ローカル開発とコントリビューション用コマンドについては、[CONTRIBUTING.md](../../CONTRIBUTING.md)を参照してください。

## 設計上の境界

Truthmark は意図的に小さく保たれています：ローカル、コミット済み、ブランチ単位、レビュー可能。

これはホステッドサービス、MCP サーバー、ベクトルデータベース、隠れたメモリ層、CI 強制製品、自律的なコード書き換えエンジンではありません。リポジトリの truth を見える状態に保つのを助けますが、テスト、コードレビュー、人間の判断を置き換えるものではありません。

## ライセンス

MIT。[LICENSE](../../LICENSE) を参照してください。
