# Truthmark

**Vos agents écrivent du code. Truthmark maintient une documentation destinée aux humains et vérifiable dans Git.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Bannière Truthmark](../assets/truthmark-banner.png)

## 🚀 Démarrage rapide : exécution locale en cinq minutes

Exécutez ceci dans le dépôt Git que vous voulez faire gérer par Truthmark :

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

Activez l’hôte d’IA que vous utilisez réellement. Les nouvelles configurations sont neutres vis-à-vis des hôtes ; ajoutez donc une liste `platforms` de premier niveau à `.truthmark/config.yml` avant l’initialisation :

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

Installez ensuite les documents de vérité locaux au dépôt, le routage et les surfaces de workflow pour agents :

```bash
truthmark init
truthmark check
git diff
```

Essayez maintenant le chemin d’adoption le plus courant : documenter, à partir du code et des tests, un comportement existant. Dans votre hôte de codage IA, demandez au workflow installé :

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

Après cela, les utilisateurs ne devraient normalement pas invoquer Truth Sync directement. Continuez à coder dans votre hôte d’IA ; les instructions installées dans le dépôt indiquent à l’agent d’exécuter les tests pertinents et d’effectuer la revue Truth Sync avant la remise lorsqu’il y a des changements de code fonctionnel. Vous examinez le diff de code obtenu ainsi que le diff des documents de vérité.

Si vous voulez seulement la validation CLI et ne voulez pas encore de workflows IA propres à un hôte, laissez `platforms` omis et exécutez `truthmark init && truthmark check` ; vous pourrez ajouter une plateforme plus tard et relancer `truthmark init`.

## 💡 Le problème : l’écart de documentation avec l’IA

Les agents de codage IA sont incroyablement efficaces pour écrire du code rapidement. Mais cette vitesse crée un nouveau mode de défaillance dangereux : **le récit du dépôt s’éloigne de la réalité.**

* Les comportements se perdent dans des historiques de discussion éphémères.
* Les documents d’architecture deviennent vite obsolètes.
* Les décisions produit disparaissent après la remise.
* Les réviseurs de code se retrouvent face à des diffs de code bruts sans comprendre le « pourquoi ».
* Chaque nouvelle session IA est contrainte de redécouvrir la vérité de votre dépôt depuis zéro.

## 🎯 La solution : Truthmark

**Truthmark** installe dans votre dépôt une couche de workflow native Git. Il corrige la partie du développement avec l’IA qui casse généralement : aider la documentation à rester alignée sur le code.

Au lieu d’espérer que les humains et les agents IA se souviennent de mettre les docs à jour, Truthmark transforme la documentation en habitude systématique et vérifiable directement dans votre dépôt.

### ✨ Pourquoi Truthmark est unique

Truthmark n’est pas simplement un autre outil de documentation. Il est profondément intégré au workflow IA :

* **🚫 Zéro dépendance fournisseur :** aucun service hébergé, aucune base de données cachée, aucun serveur supplémentaire à exploiter.
* **🌳 100 % natif Git :** tout vit dans votre dépôt. La vérité se déplace avec votre branche.
* **🤝 Architecture à deux surfaces :** il sépare clairement les outils que les humains utilisent pour gérer le dépôt des workflows que les agents IA utilisent pour écrire du code.
* **✅ Confiance par la vérification :** le travail de l’IA devient plus facile à faire confiance, car tout travail qui change le comportement inclut une décision ou un diff de document de vérité vérifiable par un humain.

## 🔄 Fonctionnement

Lorsqu’un agent IA modifie votre code, le travail n’est pas terminé. Truthmark installe une garde de workflow de fin de tâche que les agents suivent avant la remise :

1. 💻 **Code :** l’agent modifie le code fonctionnel.
2. 🧪 **Test :** les tests pertinents sont exécutés.
3. 🔍 **Vérification :** `Truth Sync` vérifie la documentation mappée lorsque le workflow installé s’exécute.
4. 📝 **Documentation :** les docs sont mises à jour par l’agent lorsque la vérité du dépôt a changé.
5. 👀 **Revue :** un humain examine le *diff de code* + le *diff de vérité*.

## 🛠 Deux surfaces, un seul système de vérité

Truthmark est volontairement divisé en deux surfaces distinctes afin de servir à la fois les mainteneurs humains et les agents IA.

### 1. 🧑‍💻 La CLI humaine (mainteneurs et CI)
Utilisée par les développeurs pour configurer, paramétrer et valider le dépôt.
* `truthmark config` - crée votre configuration initiale.
* `truthmark init` - installe le routage, les échafaudages et les instructions nécessaires.
* `truthmark check` - valide les artefacts de vérité depuis le terminal.

### 2. 🤖 Les workflows destinés à l’IA (agents)
Truthmark installe des skills, prompts et commandes natifs que les hôtes IA pris en charge (comme Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity et Cursor) comprennent. Ce ne sont *pas* des commandes shell ; ce sont des points d’entrée de workflow pour l’IA.
* `/truthmark-sync` - le workflow de fin de tâche que les agents suivent après des changements de code fonctionnel ; ce n’est pas une commande normale lancée par l’utilisateur.
* `/truthmark-document` - génère des docs pour du code existant non documenté.
* `/truthmark-structure` - organise de larges zones du dépôt en domaines spécifiques.
* `/truthmark-realize` - **Développement doc-first :** lit les documents d’architecture et génère le code correspondant.
* `/truthmark-check` - audit de la vérité du dépôt piloté par l’agent.

## Ce que vous obtenez

| Capacité | Ce qu’elle fait |
| --- | --- |
| Vérité native Git | Conserve la vérité du dépôt dans du Markdown et de la configuration commités. |
| Documentation limitée à la branche | La vérité se déplace avec la branche au lieu de vivre dans une session privée. |
| CLI humaine | Fournit aux mainteneurs des commandes de configuration, d’actualisation, de validation et d’inspection. |
| Workflows destinés à l’IA | Fournit aux agents des workflows natifs de l’hôte pour la synchronisation, la documentation, la structure, la réalisation et l’audit. |
| Routage explicite | Mappe les zones de code vers des documents de vérité canoniques. |
| Remises vérifiables | Produit des diffs Git ordinaires pour le code comme pour les documents de vérité. |
| Fonctionnement local d’abord | Ne nécessite aucun service hébergé, démon, base de données ni serveur MCP. |
| Limites d’écriture plus sûres | Sépare les workflows code-first, doc-first, read-only et doc-only. |
| Validation | Signale les problèmes de routage, d’autorité, de frontmatter, de liens, de surfaces générées, de portée de branche, de fraîcheur et de couverture. |
| Portal optionnel | Génère, lorsqu’il est explicitement activé et demandé, un site de présentation HTML statique commité à partir des documents de vérité Markdown. |

## Aperçu visuel

![Fonctionnalités Truthmark](../assets/truthmark-features.png)

**Fonctionnalités :** ce que Truthmark installe et comment la surface de workflow est divisée.

![Position de Truthmark](../assets/truthmark-position.png)

**Position :** où Truthmark se situe par rapport aux prompts, à la mémoire et aux workflows de spécification.

![Flux de synchronisation Truthmark](../assets/truthmark-syncflow.png)

**Flux de synchronisation :** comment Truth Sync conclut les changements de code ordinaires avant la remise.

## Pourquoi les équipes l’adoptent

Truthmark s’adresse aux équipes qui savent déjà que les agents IA peuvent générer du code.

Le prochain problème est la gouvernance.

Pas la gouvernance comme cérémonie. La gouvernance comme une question simple :

> Après ce changement assisté par l’IA, le dépôt dit-il encore la vérité ?

Truthmark aide les équipes à y répondre avec des fichiers commités, un routage explicite et des diffs vérifiables.

Il est utile lorsque vous avez besoin de :

- moins de dérive documentaire
- meilleures remises
- vérité produit spécifique à la branche
- documentation d’architecture et d’API durable
- propriété explicite entre docs et code
- limites d’écriture d’agents plus sûres
- documentation vérifiable plutôt que mémoire cachée
- workflows IA qui fonctionnent toujours à partir des fichiers commités du dépôt

## Où Truthmark se situe

Truthmark ne remplace pas les prompts, la mémoire, les spécifications, les tests ni la revue de code.

Il donne à ces workflows un endroit durable où atterrir dans Git.

| Besoin | Meilleur choix |
| --- | --- |
| Meilleure sortie d’une session d’agent | Meilleur prompt |
| Continuité personnelle ou au niveau de la session | Outil de mémoire |
| Travail fonctionnel planifié d’abord | Workflow de spécification |
| Vérité limitée à une branche qui voyage avec le code | Truthmark |
| Validation de la correction du comportement | Tests et revue |
| Revue de changements de documentation assistés par l’IA | Truthmark plus revue Git |

Le périmètre de Truthmark est étroit par conception :

```text
make repository truth explicit
route it to code
install agent workflows around it
keep the result reviewable in Git
```

## Aller plus loin

Le README est la vitrine : contexte rapide, démarrage rapide et modèle mental central.

Pour l’utilisation commande par commande, les comparaisons de surfaces, les détails des plateformes prises en charge, la configuration, le routage, Portal et des exemples, lisez le [guide d’utilisation Truthmark](../user-guide.md).

## État du projet

La version actuelle fournit :

- des commandes CLI locales pour config, init, check, index, impact et l’état des workflows
- des surfaces de workflow IA générées pour Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity et Cursor
- des diagnostics de routage, d’autorité, de frontmatter, de liens, de fraîcheur, de surfaces générées, de portée de branche et de couverture
- des documents de vérité limités à la branche et des artefacts dérivés d’intelligence du dépôt

## Documentation

- [Guide d’utilisation](../user-guide.md)
- [Index des docs](../README.md)
- [Vue d’ensemble de l’architecture](../truthmark/engineering/architecture/overview.md)
- [Contrats API et CLI](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Guide de maintenance de la vérité du dépôt](../standards/maintaining-repository-truth.md)

Pour les commandes de développement local et de contribution, consultez [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Limites de conception

Truthmark est volontairement petit : local, commité, limité à la branche et vérifiable.

Ce n’est pas un service hébergé, un serveur MCP, une base de données vectorielle, une couche de mémoire cachée, un produit d’application CI ni un moteur autonome de réécriture de code. Il aide la vérité du dépôt à rester visible ; il ne remplace pas les tests, la revue de code ni le jugement humain.

## Licence

MIT. Voir [LICENSE](../../LICENSE).
