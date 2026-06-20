# Truthmark

**Seus agentes escrevem código. O Truthmark mantém documentação voltada para humanos e revisável no Git.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Banner do Truthmark](../assets/truthmark-banner.png)

## 🚀 Início rápido: rodando localmente em cinco minutos

Execute isto dentro do repositório Git que você quer que o Truthmark gerencie:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

Ative o host de IA que você realmente usa. Configurações novas são neutras em relação a host; portanto, adicione uma lista `platforms` de nível superior a `.truthmark/config.yml` antes da inicialização:

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

Em seguida, instale os documentos de verdade locais do repositório, o roteamento e as instruções para hosts de IA:

```bash
truthmark init
truthmark check
git diff
```

Agora experimente o caminho de adoção mais comum: documentar, a partir do código e dos testes, um comportamento existente. No seu host de codificação com IA, peça ao workflow instalado:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

Depois disso, usuários normalmente não devem invocar o Truth Sync diretamente. Continue codificando por meio do seu host de IA; as instruções instaladas no repositório dizem ao agente para executar os testes relevantes e realizar a revisão Truth Sync antes da entrega quando houver mudanças em código funcional. Você revisa o diff de código resultante junto com o diff dos documentos de verdade.

Se você quer apenas validação por CLI e ainda não quer workflows de IA específicos de host, deixe `platforms` omitido e execute `truthmark init && truthmark check`; você pode adicionar uma plataforma depois e executar `truthmark init` novamente.

## 💡 O problema: a lacuna de documentação da IA

Agentes de codificação com IA são incríveis para escrever código rapidamente. Mas essa velocidade cria um novo modo de falha perigoso: **a história do repositório se afasta da realidade.**

* Comportamentos se perdem em históricos de chat efêmeros.
* Documentos de arquitetura ficam desatualizados rapidamente.
* Decisões de produto desaparecem após a entrega.
* Revisores de código acabam examinando diffs de código crus sem entender o “porquê”.
* Cada nova sessão de IA é forçada a redescobrir do zero a verdade do seu repositório.

## 🎯 A solução: Truthmark

**Truthmark** instala no seu repositório uma camada de workflow nativa do Git. Ele corrige a parte do desenvolvimento com IA que geralmente quebra: ajudar a documentação a permanecer alinhada com o código.

Em vez de esperar que humanos e agentes de IA se lembrem de atualizar a documentação, o Truthmark transforma a documentação em um hábito sistemático e revisável dentro do próprio repositório.

### ✨ Por que o Truthmark é único

Truthmark não é apenas mais uma ferramenta de documentação. Ele é profundamente integrado ao workflow de IA:

* **🚫 Sem dependência de fornecedor:** nenhum serviço hospedado, nenhum banco de dados oculto, nenhum servidor extra para operar.
* **🌳 100% nativo do Git:** tudo vive no seu repositório. A verdade se move com a sua branch.
* **🤝 Contrato pertencente a humanos e seguido por agentes:** Mantenedores possuem o contrato do repositório; agentes seguem as instruções instaladas enquanto programam.
* **✅ Confiança por verificação:** o trabalho da IA fica mais fácil de confiar porque trabalhos que mudam comportamento incluem uma decisão ou diff de documento de verdade revisável por humanos.

## 🔄 Como funciona

Quando um agente de IA modifica seu código, o trabalho não está terminado. O Truthmark instala uma proteção de workflow no fim da tarefa que os agentes seguem antes da entrega:

1. 💻 **Código:** o agente modifica código funcional.
2. 🧪 **Teste:** testes relevantes são executados.
3. 🔍 **Verificar:** Truthmark verifica a documentação mapeada como parte da revisão de encerramento instalada.
4. 📝 **Documentação:** os docs são atualizados pelo agente quando a verdade do repositório mudou.
5. 👀 **Revisão:** uma pessoa revisa o *diff de código* + o *diff de verdade*.

## 🛠 Como você interage com o Truthmark

Truthmark tem um contrato local do repositório e duas formas de usá-lo.

### Pessoas instalam e validam o contrato

Mantenedores e CI usam a CLI:

* `truthmark config` - cria a configuração inicial.
* `truthmark init` - instala ou atualiza roteamento, scaffolds de documentos de verdade e instruções para hosts de IA.
* `truthmark check` - valida a verdade do repositório pelo terminal.

### Agentes seguem o contrato enquanto programam

Truthmark instala instruções locais do repositório para hosts de codificação com IA compatíveis, como Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity e Cursor.

O ciclo normal é simples:

1. Peça ao seu agente uma mudança de código ou que documente um comportamento existente.
2. As instruções instaladas dizem ao agente quando testar, quando atualizar documentos de verdade e quando parar para revisão humana.
3. Você revisa diffs Git comuns: código mais quaisquer mudanças em documentos de verdade.

As solicitações de agente iniciadas pelo usuário são intencionalmente poucas:

* `/truthmark-document` - documenta comportamento implementado existente a partir de código e testes.
* `/truthmark-realize` - implementa código a partir de documentos de verdade existentes.
* `/truthmark-check` - audita a verdade do repositório.

Truth Sync não é o modo usual de começar trabalho; é a revisão de encerramento após mudanças funcionais de código.
Truth Structure não é um comando cotidiano; ele repara roteamento ou propriedade somente quando isso bloqueia o trabalho.

## O que você recebe

| Capacidade | O que faz |
| --- | --- |
| Verdade nativa do Git | Mantém a verdade do repositório em Markdown e configuração commitados. |
| Documentação com escopo de branch | A verdade se move com a branch em vez de viver em uma sessão privada. |
| CLI humana | Dá aos mantenedores comandos de configuração, atualização, validação e inspeção. |
| Orientação de agente instalada | Diz aos agentes de codificação quando documentar, testar, sincronizar verdade, auditar ou parar para revisão. |
| Roteamento explícito | Mapeia áreas de código para documentos de verdade canônicos. |
| Entregas revisáveis | Produz diffs Git comuns tanto para código quanto para documentos de verdade. |
| Operação local-first | Não requer serviço hospedado, daemon, banco de dados nem servidor MCP. |
| Limites de escrita mais seguros | Separa workflows code-first, doc-first, read-only e doc-only. |
| Validação | Relata problemas de roteamento, autoridade, frontmatter, links, superfícies geradas, escopo de branch, frescor e cobertura. |
| Portal opcional | Gera, quando explicitamente ativado e solicitado, um site estático HTML commitado a partir de documentos de verdade em Markdown. |

## Visão geral visual

![Recursos do Truthmark](../assets/truthmark-features.png)

**Recursos:** o que o Truthmark instala e como a superfície de workflow é dividida.

![Posição do Truthmark](../assets/truthmark-position.png)

**Posição:** onde o Truthmark se encaixa em relação a prompts, memória e workflows de especificação.

![Fluxo de sincronização do Truthmark](../assets/truthmark-syncflow.png)

**Fluxo de sincronização:** como o Truth Sync conclui mudanças normais de código antes da entrega.

## Por que equipes o adotam

Truthmark é para equipes que já sabem que agentes de IA podem gerar código.

O próximo problema é governança.

Não governança como cerimônia. Governança como uma pergunta simples:

> Depois desta mudança assistida por IA, o repositório ainda diz a verdade?

Truthmark ajuda equipes a responder isso com arquivos commitados, roteamento explícito e diffs revisáveis.

Ele é útil quando você precisa de:

- menos desvio de documentação
- melhores entregas
- verdade de produto específica por branch
- documentação duradoura de arquitetura e API
- ownership explícito entre docs e código
- limites de escrita de agentes mais seguros
- documentação revisável em vez de memória oculta
- orientação de agente que ainda funciona a partir de arquivos commitados no repositório

## Onde o Truthmark se encaixa

Truthmark não substitui prompts, memória, specs, testes nem revisão de código.

Ele dá a esses workflows um lugar durável para pousar no Git.

| Necessidade | Melhor encaixe |
| --- | --- |
| Melhor saída de uma sessão de agente | Prompt melhor |
| Continuidade pessoal ou no nível da sessão | Ferramenta de memória |
| Trabalho de funcionalidade com plano primeiro | Workflow de especificação |
| Verdade com escopo de branch que viaja com o código | Truthmark |
| Validar correção de comportamento | Testes e revisão |
| Revisar mudanças de documentação assistidas por IA | Truthmark mais revisão Git |

A faixa de atuação do Truthmark é estreita por design:

```text
make repository truth explicit
route it to code
instalar orientação de agente ao redor dela
keep the result reviewable in Git
```

## Aprofunde-se

O README é a vitrine: contexto rápido, início rápido e o modelo mental central.

Para uso comando por comando, comparações de superfícies, detalhes de plataformas compatíveis, configuração, roteamento, Portal e exemplos, leia o [guia do usuário do Truthmark](../user-guide.md).

## Status do projeto

A versão atual fornece:

- comandos CLI locais para config, init, check, index, impact e status de workflows
- instruções de agente locais do repositório geradas para Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity e Cursor
- diagnósticos de roteamento, autoridade, frontmatter, links, frescor, superfícies geradas, escopo de branch e cobertura
- documentos de verdade com escopo de branch e artefatos derivados de inteligência do repositório

## Documentação

- [Guia do usuário](../user-guide.md)
- [Índice de docs](../README.md)
- [Visão geral da arquitetura](../truthmark/engineering/architecture/overview.md)
- [Contratos de API e CLI](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Guia de manutenção da verdade do repositório](../standards/maintaining-repository-truth.md)

Para comandos de desenvolvimento local e contribuição, consulte [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Limites de design

Truthmark é intencionalmente pequeno: local, commitado, com escopo de branch e revisável.

Ele não é um serviço hospedado, servidor MCP, banco de dados vetorial, camada de memória oculta, produto de enforcement de CI nem motor autônomo de reescrita de código. Ele ajuda a verdade do repositório a permanecer visível; não substitui testes, revisão de código nem julgamento humano.

## Licença

MIT. Veja [LICENSE](../../LICENSE).
