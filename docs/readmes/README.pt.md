# Truthmark

**Seus agentes escrevem código. O Truthmark mantém a documentação voltada para pessoas e revisável no Git.**

O Truthmark instala fluxos de trabalho nativos do Git que permitem que agentes de programação com IA criem nova documentação de produto e engenharia a partir de código e testes existentes, mantenham-na atualizada após cada mudança de código e entreguem diffs comuns de Markdown para sua revisão.

[![versão no npm](https://img.shields.io/npm/v/truthmark?color=cb3837&label=npm)](https://www.npmjs.com/package/truthmark)
[![CI](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml)
[![Licença: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Node.js >=24](https://img.shields.io/badge/node-%3E%3D24-339933?logo=node.js&logoColor=white)](../../package.json)

[Comece agora](#início-rápido-crie-seu-primeiro-documento-de-verdade) · [Site](https://merlinhu1.github.io/truthmark/) · [Guia do usuário](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md) · [GitHub](https://github.com/merlinhu1/truthmark)

<details>
<summary>Leia este README em 16 idiomas</summary>

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

</details>

## Crie os primeiros documentos. Mantenha-os verdadeiros.

A maioria das ferramentas de documentação para depois da geração. O Truthmark oferece aos agentes um ciclo de vida completo da documentação dentro do seu repositório:

- **Crie novos documentos a partir de software funcional.** O Truth Document lê código e testes e, em seguida, cria documentação delimitada de produto ou engenharia.
- **Mantenha os documentos alinhados automaticamente.** O Truth Sync é executado na entrega do agente após mudanças funcionais no código e atualiza a verdade do repositório antes que o trabalho seja concluído.
- **Transforme documentos de volta em código.** O Truth Realize implementa documentos de verdade aprovados e preserva um fluxo de trabalho limpo que começa pela documentação.
- **Repare a propriedade conforme a base de código cresce.** O Truth Structure cria rotas delimitadas e documentos iniciais para áreas novas ou sobrecarregadas.
- **Revise tudo no Git.** Código, decisões, contratos, arquitetura, operações e comportamento viajam juntos com a branch.

Sem base de conhecimento hospedada. Sem memória privada de agentes. Sem documentação presa no histórico de chats.

## Início rápido: crie seu primeiro documento de verdade

**Requisitos:** Node.js 24 ou mais recente, um repositório Git e um host de programação com IA compatível com fluxos de trabalho de agentes.

Execute isto dentro do repositório que você quer que o Truthmark gerencie:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark init
```

`truthmark init` permite selecionar Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, Cursor ou uma configuração de interface de linha de comando neutra em relação ao host.

Agora peça ao agente configurado que documente um comportamento real:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

O Truth Document cria um novo documento de verdade delimitado quando nenhum existe, atualiza o proprietário existente quando ele já existe e atualiza o roteamento quando necessário. Ele não altera o código funcional.

Revise o resultado:

```bash
truthmark check
git status --short --untracked-files=all
git diff
```

Agora você deve ter:

```text
docs/truthmark/engineering/behaviors/session-timeout.md
docs/truthmark/routes/areas/authentication.md
```

Os caminhos exatos seguem a estrutura de propriedade do seu repositório. Novos arquivos aparecem em `git status`; mudanças em arquivos rastreados aparecem em `git diff`.

A forma de invocação varia conforme o host. O OpenCode usa `/skill truthmark-document`, o Antigravity usa `@truthmark-document` e os outros hosts compatíveis usam sua superfície nativa de skills ou comandos com barra. Consulte a [tabela de plataformas](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md#supported-agent-platforms) para ver os comandos exatos.

Para scripts e integração contínua, informe explicitamente as plataformas selecionadas:

```bash
truthmark init --platform codex --platform cursor
truthmark init --json
```

Escolha `none` interativamente ou execute `truthmark init --clear-platforms` para ter um repositório neutro em relação ao host. Você pode adicionar plataformas de agentes mais tarde executando `truthmark init` novamente.

Para diagnósticos de atualidade relativos à branch, informe uma base do Git:

```bash
truthmark check --base <base-ref>
```

## Como o Truthmark funciona

<picture>
  <source media="(max-width: 700px)" srcset="../assets/truthmark-workflow-mobile.svg">
  <img src="../assets/truthmark-workflow.svg" alt="Como o Truthmark funciona" width="1440">
</picture>

A interface de linha de comando do Truthmark instala e valida o contrato do repositório. Seu agente de programação realiza a revisão de evidências e o trabalho de documentação por meio dos fluxos de trabalho nativos do host que foram instalados.

Uma mudança normal de código segue um ciclo simples:

1. O agente altera o código funcional.
2. Os testes relevantes são executados.
3. O Truth Sync verifica a documentação mapeada.
4. O agente cria ou atualiza documentos e roteamento quando a verdade do repositório muda.
5. Você revisa o diff de código e o diff de verdade juntos.

## Fluxos de trabalho

| Fluxo de trabalho    | Quando usar                                                                             | Resultado                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Truth Document**   | O código existente precisa de documentação                                              | Cria ou atualiza documentação de produto e engenharia respaldada por evidências                |
| **Truth Sync**       | O código funcional mudou                                                                | Mantém os documentos mapeados e o roteamento alinhados antes da entrega                        |
| **Truth Structure**  | Uma área nova precisa de propriedade ou os documentos existentes são abrangentes demais | Cria rotas delimitadas e documentos iniciais básicos                                           |
| **Truth Realize**    | Um documento de verdade aprovado deve se tornar software funcional                      | Atualiza o código funcional a partir da documentação                                           |
| **Truth Check**      | A verdade do repositório precisa de uma auditoria                                       | Relata problemas de roteamento, propriedade, evidências e documentação                         |
| **Truthmark Portal** | A equipe quer um site de documentação navegável                                         | Gera uma apresentação HTML estática e versionada a partir de documentos de verdade em Markdown |

O Truthmark instala esses fluxos de trabalho como superfícies nativas do repositório para Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity e Cursor.

## O que você recebe

### Documentação que parte da realidade

O Truthmark pode criar documentação de recursos do produto, comportamento da implementação, interfaces de programação de aplicações, arquitetura, fluxos de trabalho, operações e testes. Código e testes fornecem as evidências; documentos Markdown delimitados preservam o resultado.

### Documentação que resiste à próxima mudança

As rotas conectam áreas de código a documentos canônicos. Quando agentes alteram o comportamento, o Truth Sync sabe onde a verdade correspondente deve ficar e mantém a entrega pronta para revisão.

### Verdade de produto e engenharia em faixas separadas

A verdade de produto registra promessas voltadas ao usuário, limites, decisões e critérios de aceitação. A verdade de engenharia registra o comportamento atual, contratos, arquitetura, fluxos de trabalho, operações e comportamento dos testes.

### Colaboração nativa do Git

Tudo que importa vive em arquivos versionados do repositório. A verdade acompanha a branch, funciona com pull requests comuns e permanece visível para cada mantenedor e agente de programação.

### Operação local-first

O Truthmark não precisa de serviço hospedado, daemon, banco de dados, banco vetorial ou servidor do Model Context Protocol. O repositório carrega seu próprio fluxo de trabalho de documentação.

## Onde o Truthmark se encaixa

| Necessidade                                             | Melhor opção                          |
| ------------------------------------------------------- | ------------------------------------- |
| Melhor resultado de uma sessão de agente                | Um prompt melhor                      |
| Continuidade pessoal ou no nível da sessão              | Uma ferramenta de memória             |
| Desenvolvimento de recursos que começa por um plano     | Um fluxo de trabalho de especificação |
| Documentação no escopo da branch que viaja com o código | **Truthmark**                         |
| Correção do comportamento                               | Testes e revisão de código            |
| Documentação assistida por IA e revisável               | **Truthmark + revisão no Git**        |

O Truthmark foi criado para mantenedores e equipes de engenharia que já usam agentes de programação com IA e querem que o repositório continue dizendo a verdade na mesma velocidade em que o código muda.

## Hosts compatíveis e linha de comando

Hosts de agentes compatíveis:

- Codex
- Claude Code
- GitHub Copilot
- OpenCode
- Antigravity
- Cursor

<details>
<summary>Referência da linha de comando</summary>

| Comando                                                           | Finalidade                                                                                                 |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `truthmark init`                                                  | Cria ou atualiza a configuração, o roteamento, os templates e os fluxos de trabalho dos hosts selecionados |
| `truthmark check [--base <ref>]`                                  | Valida a verdade do repositório e, opcionalmente, executa diagnósticos de atualidade da branch             |
| `truthmark index --json`                                          | Inspeciona metadados derivados do repositório e do roteamento                                              |
| `truthmark impact --base <ref> --json`                            | Mapeia arquivos alterados para documentos, proprietários e testes próximos                                 |
| `truthmark workflow status --workflow <id> [--base <ref>] --json` | Inspeciona a aplicabilidade e os alvos do fluxo de trabalho                                                |
| `truthmark validate ...`                                          | Valida relatórios de fluxos de trabalho e concessões de escrita                                            |
| `truthmark uninstall --dry-run` / `truthmark uninstall --apply`   | Visualiza ou remove superfícies de host geradas, preservando a verdade criada                              |

A saída JSON estruturada está disponível em toda a interface de linha de comando para scripts e integração contínua.

</details>

## Saiba mais

- [Guia do usuário do Truthmark](https://github.com/merlinhu1/truthmark/blob/main/docs/user-guide.md)
- [Índice da documentação](https://github.com/merlinhu1/truthmark/blob/main/docs/README.md)
- [Visão geral da arquitetura](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/architecture/overview.md)
- [Contratos de configuração, roteamento e comandos](https://github.com/merlinhu1/truthmark/blob/main/docs/truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Manutenção da verdade do repositório](https://github.com/merlinhu1/truthmark/blob/main/docs/repo/standards/maintaining-repository-truth.md)
- [Como contribuir](https://github.com/merlinhu1/truthmark/blob/main/CONTRIBUTING.md)

**Instale o Truthmark, selecione seu host de programação e transforme hoje um comportamento real em documentação.**

## Licença

MIT. Consulte [LICENSE](../../LICENSE).
