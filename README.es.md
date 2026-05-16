# Truthmark

**Tus agentes escriben código. Truthmark hace que su contexto sea revisable en Git.**

[English](README.md) | [Deutsch](README.de.md) | [中文](README.zh.md) | Español | [Русский](README.ru.md)

![Banner de Truthmark](docs/assets/truthmark-banner.png)

Los agentes de programación con IA pueden cambiar un repositorio más rápido de lo que las personas pueden mantener alineado su contexto.

Truthmark arregla la parte que normalmente se rompe después de escribir el código: la verdad del repositorio.

Instala una capa de flujo de trabajo nativa de Git y acotada a la rama que ayuda a los agentes de programación con IA a actualizar los documentos correctos, respetar los límites de propiedad y dejar a las personas diffs normales que puedan revisar.

Sin servicio alojado.

Sin base de datos.

Sin capa oculta de memoria.

Sin servidor adicional que operar.

Solo verdad del repositorio que se mueve con la rama.

## El problema

Los agentes de programación con IA son buenos produciendo código. Eso crea un nuevo modo de fallo.

La implementación cambia, pero la historia del repositorio se desvía:

- el comportamiento vive en el historial de chat
- los documentos de arquitectura quedan atrás
- las decisiones de producto desaparecen después del traspaso
- quienes revisan ven diffs de código sin los diffs de verdad relacionados
- las ramas desarrollan silenciosamente distintas versiones de “lo que es verdad”
- cada sesión de agente tiene que redescubrir el contexto desde cero

Truthmark convierte ese contexto frágil en infraestructura del repositorio confirmada en Git.

En lugar de depender de que cada persona y cada agente recuerden el hábito correcto de documentación, Truthmark instala ese hábito en el repositorio.

## La promesa

Cuando un agente cambia código funcional, el trabajo no debería terminar con solo un diff de código.

El camino normal de Truthmark es:

```text
el agente cambia código funcional
se ejecutan pruebas relevantes
Truth Sync revisa los documentos de verdad asignados
los documentos de verdad se actualizan cuando hace falta
una persona revisa el diff de código + el diff de verdad
confirmar o traspasar
```

Ese es el valor central: **el trabajo con IA es más fácil de confiar porque el repositorio sigue siendo legible.**

## Dos superficies, un sistema de verdad

Truthmark no es solo una CLI.

Tiene dos superficies distintas, y la distinción importa.

### 1. CLI orientada a personas

La CLI es para mantenedores, revisores y automatización.

Úsala para configurar un repositorio, instalar o refrescar archivos de flujo de trabajo, validar artefactos de verdad y generar contexto opcional para revisión.

```bash
truthmark config
truthmark init
truthmark check
```

La CLI prepara y valida el entorno del repositorio.

No es el runtime del flujo de trabajo con IA.

### 2. Superficies de flujo orientadas a IA

Las superficies orientadas a IA son para agentes de programación.

Truthmark instala skills, prompts, comandos, bloques de instrucciones administrados y superficies de subagentes nativos del host para que los agentes de IA puedan seguir flujos de verdad específicos del repositorio dentro de sus herramientas normales de programación.

Ejemplos:

```text
/truthmark-sync
/truthmark-document
/truthmark-structure
/truthmark-realize
/truthmark-preview
/truthmark-check
```

Parecen comandos porque los hosts de agentes exponen flujos mediante slash commands, prompts, skills o comandos de proyecto.

No son comandos de shell.

Son puntos de entrada de flujo para IA.

La división es el producto:

```text
las personas poseen el contrato del repositorio
Truthmark instala el contrato en el repo
los agentes operan dentro de ese contrato
las actualizaciones de verdad aparecen como diffs de Git
las personas revisan el resultado
```

## Inicio rápido

### Requisitos

- Node.js `>=20`
- npm
- un repositorio Git

### Instalar Truthmark

Ejecuta esto dentro del repositorio que quieres inicializar:

```bash
cd /path/to/your-repo
npm install -g truthmark
```

### Crear el contrato de verdad del repositorio

```bash
truthmark config
```

Esto crea:

```text
.truthmark/config.yml
```

Revisa este archivo antes de continuar. Define el contrato de jerarquía confirmado en el repositorio.

### Instalar las superficies de flujo

```bash
truthmark init
```

Esto instala o refresca:

- archivos de rutas
- scaffolding de documentos de verdad
- bloques de instrucciones administrados
- superficies de flujo orientadas a IA para las plataformas configuradas

### Validar la configuración

```bash
truthmark check
```

Después revisa los archivos generados antes de confirmar.

Los archivos típicos incluyen:

```text
.truthmark/config.yml
docs/truthmark/areas.md
docs/truthmark/areas/repository.md
docs/templates/
docs/truth/
AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md
.codex/
.claude/
.opencode/
.github/
.gemini/
```

Los archivos exactos dependen de `.truthmark/config.yml`.

## Primer uso real

La mayoría de los repositorios necesita una pasada de limpieza después de la inicialización.

El scaffold predeterminado empieza con un área amplia `repository`. Los repositorios reales suelen necesitar rutas más precisas.

Pide a tu agente que divida la ruta amplia en áreas reales de producto, servicio, dominio o propiedad:

```text
/truthmark-structure divide el área amplia repository en auth, billing y notifications
```

Después usa tu agente de programación con IA normalmente.

Cuando el agente cambia código funcional, Truth Sync actúa como guarda de cierre que revisa si los documentos de verdad asignados deben cambiar antes del traspaso.

## Qué obtienes

| Capacidad | Qué hace |
| --- | --- |
| Verdad nativa de Git | Mantiene la verdad del repositorio en Markdown y config confirmados. |
| Contexto acotado a la rama | La verdad se mueve con la rama en lugar de vivir en una sesión privada. |
| CLI humana | Da a mantenedores comandos de configuración, refresco, validación e inspección. |
| Flujos orientados a IA | Da a los agentes flujos nativos del host para sincronización, documentación, estructura, preview, realización y auditoría. |
| Rutas explícitas | Mapea áreas de código a documentos de verdad canónicos. |
| Traspasos revisables | Produce diffs normales de Git para código y documentos de verdad. |
| Operación local-first | No requiere servicio alojado, demonio, base de datos ni servidor MCP. |
| Límites de escritura más seguros | Separa flujos code-first, doc-first, read-only y doc-only. |
| Validación | Reporta problemas de rutas, autoridad, frontmatter, enlaces, superficies generadas, alcance de rama, frescura y cobertura. |

## Resumen visual

![Características de Truthmark](docs/assets/truthmark-features.png)

**Características:** qué instala Truthmark y cómo se divide la superficie de flujo.

![Posición de Truthmark](docs/assets/truthmark-position.png)

**Posición:** dónde encaja Truthmark frente a prompts, memoria y flujos de especificación.

![Flujo de sync de Truthmark](docs/assets/truthmark-syncflow.png)

**Flujo de sync:** cómo Truth Sync cierra cambios normales de código antes del traspaso.

## Por qué los equipos lo adoptan

Truthmark es para equipos que ya saben que los agentes de IA pueden generar código.

El siguiente problema es la gobernanza.

No gobernanza como ceremonia. Gobernanza como una pregunta simple:

> Después de este cambio asistido por IA, ¿el repositorio todavía dice la verdad?

Truthmark ayuda a los equipos a responder con archivos confirmados, rutas explícitas y diffs revisables.

Es útil cuando necesitas:

- menos deriva de documentación
- mejores traspasos
- verdad de producto específica de cada rama
- contexto duradero de arquitectura y API
- propiedad explícita entre documentos y código
- límites de escritura más seguros para agentes
- contexto revisable en lugar de memoria oculta
- flujos de IA que sigan funcionando desde archivos confirmados del repo

## Dónde encaja Truthmark

Truthmark no reemplaza prompts, memoria, especificaciones, pruebas ni revisión de código.

Les da a esos flujos un lugar duradero donde aterrizar en Git.

| Necesidad | Mejor opción |
| --- | --- |
| Mejor salida de una sesión de agente | Mejor prompt |
| Continuidad personal o por sesión | Herramienta de memoria |
| Trabajo de funciones plan-first | Flujo de especificación |
| Verdad acotada a la rama que viaja con el código | Truthmark |
| Validar la corrección del comportamiento | Pruebas y revisión |
| Revisar cambios de contexto asistidos por IA | Truthmark más revisión Git |

El carril de Truthmark es estrecho por diseño:

```text
hacer explícita la verdad del repositorio
mapearla al código
instalar flujos de agentes alrededor de ella
mantener el resultado revisable en Git
```

## Cómo se ejecuta Truthmark

Truthmark se ejecuta localmente contra el worktree Git activo.

La CLI orientada a personas lee y escribe archivos del repositorio, y luego termina.

Las superficies de flujo orientadas a IA son archivos confirmados que los hosts de agentes pueden cargar después. Eso permite que los agentes sigan el flujo instalado desde el estado del repositorio, sin depender de un proceso de Truthmark en segundo plano.

Las superficies duraderas son archivos ordinarios del repo:

```text
.truthmark/config.yml
docs/truthmark/areas.md
docs/truthmark/areas/**/*.md
docs/**/*
AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md
.codex/skills/
.claude/skills/
.opencode/skills/
.github/prompts/
.gemini/commands/truthmark/
```

Las superficies de flujo generadas incluyen marcadores de versión de Truthmark. Después de actualizar Truthmark, vuelve a ejecutar:

```bash
truthmark init
```

Luego revisa los diffs generados.

## Plataformas de agentes compatibles

La configuración predeterminada incluye todas las plataformas compatibles.

Elimina de `.truthmark/config.yml` las plataformas que no uses, y luego vuelve a ejecutar:

```bash
truthmark init
```

| Nombre de plataforma en config | Superficie generada | Forma de invocación |
| --- | --- | --- |
| `codex` | `.codex/skills/truthmark-*/`, `.codex/agents/` | `/truthmark-*` o `$truthmark-*` |
| `claude-code` | `.claude/skills/truthmark-*/`, `.claude/agents/`, `CLAUDE.md` | `/truthmark-*` |
| `github-copilot` | `.github/prompts/`, `.github/agents/`, `.github/copilot-instructions.md` | `/truthmark-*` en IDEs de Copilot compatibles; agentes personalizados `@truth-*` en Copilot CLI |
| `opencode` | `.opencode/skills/truthmark-*/`, `.opencode/agents/` | `/skill truthmark-*` |
| `gemini-cli` | `.gemini/commands/truthmark/`, `GEMINI.md` | `/truthmark:*` |

Los nombres de plataforma desconocidos son errores de configuración.

Eliminar una plataforma detiene futuros refrescos para esa plataforma. No elimina archivos generados previamente.

## Flujos orientados a IA

Estos flujos se instalan en hosts de programación con IA compatibles.

Los usan agentes o hosts de agentes durante el trabajo en el repositorio. No son comandos de shell de nivel superior.

| Flujo | Dirección | Úsalo cuando | Límite de escritura |
| --- | --- | --- | --- |
| Truth Structure | topology-first | La ruta predeterminada es demasiado amplia, la propiedad abarca varias áreas o los archivos de rutas siguen apuntando a placeholders. | Crea o repara rutas y documentos de verdad iniciales. |
| Truth Document | implementation-first | El comportamiento ya existe en código, pero faltan o son débiles los documentos de verdad canónicos. | Escribe solo documentos de verdad y rutas. No debe cambiar código funcional. |
| Truth Sync | code-first | Cambió código funcional y puede que los documentos de verdad asignados deban actualizarse antes del traspaso. | Actualiza documentos de verdad. Truth Sync no debe reescribir código funcional. |
| Truth Preview | read-only | El agente necesita previsualizar rutas probables antes de editar. | Solo lee. No autoriza escrituras. |
| Truth Realize | doc-first | Documentos de verdad de producto o arquitectura lideran y el código debe actualizarse para coincidir. | Actualiza solo código. El agente no debe editar los documentos de verdad que está realizando. |
| Truth Check | audit-first | Un revisor o agente necesita auditar la salud de la verdad del repositorio. | Audita e informa. |

### Distinción importante

No confundas estas dos superficies:

| Superficie | Usada por | Ejemplo | Significado |
| --- | --- | --- | --- |
| CLI humana | personas, scripts, checks tipo CI | `truthmark check` | Validar artefactos de verdad del repositorio desde la terminal. |
| Flujo orientado a IA | agentes de programación y hosts de agentes | `/truthmark-check` | Pedir a un agente que ejecute el flujo instalado de auditoría. |

Los nombres están relacionados a propósito, pero las superficies son distintas.

## Cambio normal de código asistido por IA

La mayoría de los usuarios no debería invocar Truth Sync manualmente cada vez.

Truth Sync es la guarda de cierre instalada para cambios de código funcional.

```text
el agente cambia código funcional
el agente ejecuta o pide pruebas relevantes
el flujo instalado detecta que cambió código funcional
Truth Sync revisa los documentos de verdad asignados
el agente actualiza documentos de verdad si hace falta
una persona revisa el diff de código + el diff de verdad
```

La invocación directa sigue siendo útil para depurar, forzar una sincronización temprana o hacer explícito el traspaso:

```text
/truthmark-sync sincroniza ahora la verdad del repositorio antes del traspaso
```

## Comportamiento existente sin docs

Usa Truth Document cuando la implementación ya existe pero la verdad del repositorio está incompleta.

```text
/truthmark-document documenta el comportamiento implementado de timeout de sesión bajo docs/truth/authentication
```

Truth Document inspecciona implementación, pruebas, archivos de rutas y documentación existente como evidencia.

Escribe solo documentos de verdad y rutas.

No debe cambiar código funcional.

## Cambios doc-first

Usa Truth Realize cuando una decisión de producto o arquitectura empieza en documentos y el código debe actualizarse para coincidir.

```text
/truthmark-realize realiza docs/truth/authentication/session-timeout.md como código
```

Truth Realize es doc-first.

Los documentos de verdad lideran. El código sigue.

El agente no debe editar los documentos de verdad que está realizando.

## Preview de rutas de solo lectura

Usa Truth Preview antes de un cambio cuando el agente necesita entender la ruta probable.

```text
/truthmark-preview previsualiza la ruta de verdad probable para cambios en la API de billing
```

Truth Preview es read-only.

Es una ayuda de selección y planificación, no una autorización de escritura ni un reemplazo de Truth Check.

## Auditoría de verdad del repositorio

Usa Truth Check cuando quieres un flujo de auditoría orientado a agentes.

```text
/truthmark-check audita rutas y cobertura de verdad antes de la revisión
```

Usa la CLI orientada a personas cuando quieres validación en terminal:

```bash
truthmark check
```

Ambas son útiles. No son la misma superficie.

## Comandos CLI orientados a personas

La mayoría de los mantenedores empieza con tres comandos.

| Comando | Propósito |
| --- | --- |
| `truthmark config` | Crea `.truthmark/config.yml`. Solo escribe ese archivo, salvo que se use `--stdout`. |
| `truthmark init` | Instala o refresca superficies de flujo configuradas desde la config revisada. |
| `truthmark check` | Valida configuración, autoridad, rutas, documentos con decisiones, frontmatter, enlaces internos, alcance de rama, superficies generadas, frescura y diagnósticos de cobertura. |

Los ayudantes opcionales de inteligencia del repositorio generan contexto derivado para revisión sobre el checkout activo.

No son fuentes de verdad.

| Comando | Propósito |
| --- | --- |
| `truthmark index` | Construye JSON de RepoIndex y RouteMap para el checkout activo. |
| `truthmark impact --base <ref>` | Mapea archivos cambiados a documentos de verdad enrutados, rutas propietarias, pruebas cercanas y símbolos públicos. |
| `truthmark context --workflow <workflow> [--base <ref>]` | Genera un ContextPack acotado para Truth Sync, Truth Document o Truth Realize. Usa `--format markdown` para una versión legible por personas. |

La salida estructurada está disponible con `--json` donde se admite.

## Configuración

Truthmark es config-first.

El archivo principal de configuración es:

```text
.truthmark/config.yml
```

Los repositorios nuevos deberían ejecutar:

```bash
truthmark config
```

Luego revisar la config generada antes de ejecutar:

```bash
truthmark init
```

Las áreas importantes de configuración incluyen:

| Área de config | Propósito |
| --- | --- |
| `version` | Versión del contrato de configuración. |
| `platforms` | Hosts de agentes que deben recibir superficies generadas específicas de plataforma. |
| `docs.layout` | Modo actual de layout de documentación. |
| `docs.roots` | Raíces nombradas de documentación canónica. |
| `docs.routing.root_index` | Ruta del índice raíz de rutas. |
| `docs.routing.area_files_root` | Directorio para archivos de rutas secundarias delegadas. |
| `docs.routing.default_area` | Nombre base de la ruta secundaria inicial generada. |
| `docs.routing.max_delegation_depth` | Profundidad máxima actual de delegación de rutas. |
| `authority` | Documentos canónicos y globs ordenados usados como autoridad de verdad del repositorio. |
| `instruction_targets` | Archivos que reciben bloques de instrucciones administrados compartidos, como `AGENTS.md`. |
| `frontmatter.required` | Campos de metadatos que producen diagnósticos de error cuando faltan. |
| `frontmatter.recommended` | Campos de metadatos que producen diagnósticos de revisión cuando faltan. |
| `ignore` | Patrones glob excluidos de checks relevantes y lógica de rutas. |

## Rutas de verdad del repositorio

Truthmark mapea superficies de código a documentos de verdad.

Los archivos principales de rutas son:

```text
docs/truthmark/areas.md
docs/truthmark/areas/**/*.md
```

Una ruta le dice al agente:

- qué superficie de código pertenece a un área
- qué documentos de verdad poseen esa área
- cuándo debe actualizarse la verdad
- qué tipo de documento de verdad participa

El scaffold predeterminado empieza amplio. Los repositorios existentes suelen tener que dividir la ruta predeterminada en áreas reales de propiedad.

Ejemplo:

```text
/truthmark-structure divide el área amplia repository en frontend, backend, billing y deployment
```

Un buen routing da a Truth Sync destinos precisos.

Un mal routing hace que los agentes adivinen.

## Qué instala Truthmark

Truthmark instala una capa compacta de verdad nativa del repositorio.

Los archivos típicos generados y de scaffold incluyen:

```text
.truthmark/config.yml

docs/truthmark/areas.md
docs/truthmark/areas/**/*.md

docs/templates/behavior-doc.md
docs/templates/contract-doc.md
docs/templates/architecture-doc.md
docs/templates/workflow-doc.md
docs/templates/operations-doc.md
docs/templates/test-behavior-doc.md

docs/truth/README.md
docs/truth/repository/README.md
docs/truth/repository/overview.md

docs/standards/default-principles.md
docs/standards/documentation-governance.md

AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md

.codex/skills/truthmark-*/
.codex/agents/

.claude/skills/truthmark-*/
.claude/agents/

.opencode/skills/truthmark-*/
.opencode/agents/

.github/prompts/truthmark-*.prompt.md
.github/agents/

.gemini/commands/truthmark/*.toml
```

Truthmark conserva el contenido manual fuera de los bloques de instrucciones administrados.

Las superficies de flujo generadas son administradas por Truthmark y pueden refrescarse volviendo a ejecutar:

```bash
truthmark init
```

## Subagentes y checks acotados de evidencia

Donde el host lo admite, Truthmark puede instalar agentes verificadores con alcance de proyecto y un `truth-doc-writer` con lease.

Ayudan a mantener acotadas las tareas grandes de verdad:

- route auditors inspeccionan la propiedad de rutas
- claim verifiers revisan si las afirmaciones de docs están respaldadas por evidencia
- doc reviewers inspeccionan la calidad de los documentos de verdad
- leased doc writers manejan shards acotados de escritura de documentos de verdad

El flujo padre sigue siendo dueño de la interpretación final, los límites de escritura, la validación del diff y la aceptación.

Esto es importante: los subagentes ayudan con trabajo acotado de evidencia. No reemplazan el contrato principal del flujo.

## Bucle de revisión

Truthmark está diseñado para revisión normal en Git.

Un buen traspaso asistido por IA debería mostrar:

```text
diff de código
evidencia de pruebas
diff de documentos de verdad, si hace falta
cambios de rutas, si hacen falta
informe del agente
```

Quien revisa debería poder responder:

- ¿Qué código cambió?
- ¿Qué documentos de verdad poseen ese código?
- ¿Esos documentos necesitaron actualizaciones?
- Si no, ¿por qué no?
- ¿El agente permaneció dentro del límite de escritura del flujo?
- ¿Se incluye evidencia de pruebas o verificación?

## Ejemplos

### Inicializar un repositorio

```bash
npm install -g truthmark
truthmark config
truthmark init
truthmark check
```

### Quitar plataformas de agentes no usadas

Edita:

```text
.truthmark/config.yml
```

Luego vuelve a ejecutar:

```bash
truthmark init
truthmark check
```

### Dividir una ruta amplia

```text
/truthmark-structure divide el área amplia repository en auth, billing, notifications y deployment
```

### Documentar comportamiento implementado

```text
/truthmark-document documenta el flujo implementado de restablecimiento de contraseña bajo docs/truth/authentication
```

### Sincronizar después de cambios de código

```text
/truthmark-sync sincroniza ahora la verdad del repositorio antes del traspaso
```

### Realizar una decisión doc-first

```text
/truthmark-realize realiza docs/truth/billing/invoice-retry-policy.md como código
```

### Auditar la salud de verdad desde la terminal

```bash
truthmark check
```

### Generar contexto de impacto de rama

```bash
truthmark impact --base main
```

### Generar contexto de workflow

```bash
truthmark context --workflow truth-sync --base main --format markdown
```

## Estado del proyecto

Truthmark V1 actualmente proporciona:

- `truthmark config`
- `truthmark init`
- `truthmark check`
- `truthmark index`
- `truthmark impact`
- `truthmark context`
- metadatos de alcance de rama
- bloques de instrucciones administrados
- superficies generadas de flujo Truth Structure
- superficies generadas de flujo Truth Document
- superficies generadas de flujo Truth Sync
- superficies generadas de flujo Truth Preview
- superficies generadas de flujo Truth Realize
- superficies generadas de flujo Truth Check
- diagnósticos de rutas, autoridad, estructura de decisiones, frontmatter, enlaces, frescura, superficies generadas y cobertura
- artefactos derivados RepoIndex, RouteMap, ImpactSet y ContextPack
- superficies específicas de host para Codex, Claude Code, GitHub Copilot, OpenCode y Gemini CLI

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Ejecutar la CLI local de desarrollo:

```bash
npm run dev -- init
npm run dev -- check
```

Ejecutar el check completo del proyecto:

```bash
npm run check
```

Scripts útiles:

| Script | Propósito |
| --- | --- |
| `npm run dev` | Ejecuta el punto de entrada CLI en TypeScript con `tsx`. |
| `npm run build` | Construye el paquete. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run typecheck` | Ejecuta checks de TypeScript. |
| `npm run test` | Ejecuta las pruebas. |
| `npm run check` | Ejecuta lint, typecheck, pruebas y build. |
| `npm run release:check` | Ejecuta validación orientada a release. |

Cuando cambies Truthmark en sí, consulta [CONTRIBUTORS.md](CONTRIBUTORS.md).

## Documentación

El README es el camino rápido para evaluación y configuración.

El comportamiento actual detallado vive bajo `docs/`:

- [Índice de documentación](docs/README.md)
- [Resumen de arquitectura](docs/architecture/overview.md)
- [Contratos de API y CLI](docs/truth/contracts.md)
- [Comportamiento de init y scaffold](docs/truth/init-and-scaffold.md)
- [Diagnósticos de check](docs/truth/check-diagnostics.md)
- [Flujos instalados](docs/truth/workflows/overview.md)
- [Guía para mantener la verdad del repositorio](docs/standards/maintaining-repository-truth.md)

## Límites de diseño

Truthmark es intencionalmente pequeño.

No es:

- un servicio alojado
- un servidor MCP
- una base de datos vectorial
- un generador de sitios de documentación
- un producto de enforcement para CI o PR
- un reemplazo de pruebas, revisión de código o liderazgo técnico
- un motor autónomo de reescritura de código
- un framework de entrenamiento o fine-tuning de modelos
- una capa oculta de memoria

Esos límites son parte del producto.

Truthmark mantiene el flujo local, confirmado, acotado a la rama y revisable.

## Seguridad y disciplina de revisión

Truthmark ayuda a que el repositorio se mantenga honesto. No prueba que el código sea correcto.

Los equipos deberían seguir:

- ejecutando pruebas relevantes
- revisando cambios de código funcional
- revisando cambios de documentos de verdad
- manteniendo secretos fuera de la documentación
- manteniendo instrucciones específicas del repositorio fuera de bloques administrados
- revisando diffs de superficies de flujo generadas después de upgrades
- conservando propiedad humana sobre decisiones de producto y arquitectura

Truthmark hace visible el contexto del agente. No reemplaza el juicio humano.

## Dirección de la hoja de ruta

La dirección futura actual enfatiza:

- reportes de evidencia más fuertes en `truthmark check`
- ejemplos de adopción más claros
- repositorios de ejemplo que muestren ciclos reales de Truth Sync
- guías de migración para equipos que ya usan archivos de instrucciones para agentes
- pruebas de conformidad para superficies generadas de host
- pistas de verdad obsoleta conscientes de rutas
- checklists acotadas de implementación para trabajo doc-first

El centro de gravedad se mantiene igual:

```text
verdad del repositorio
flujos nativos para agentes
revisión en Git
contexto acotado a la rama
```

## Licencia

MIT. Consulta [LICENSE](LICENSE).
