# Truthmark

**Truthmark instala flujos de verdad del repositorio para el desarrollo de software con IA.**

[English](README.md) | [Deutsch](README.de.md) | [中文](README.zh.md) | Español | [Русский](README.ru.md)

<img src="docs/assets/truthmark-banner.png" alt="Banner de Truthmark" width="100%" />

Los agentes de programación con IA ya escriben código rápido. La parte costosa es mantener alineada la verdad del repositorio con lo que realmente cambió.

Truthmark añade una guarda de cierre basada en flujo de trabajo. El camino normal es simple:

- el agente cambia código funcional
- se ejecutan las pruebas relevantes
- el flujo instalado Truth Sync actualiza los documentos de verdad asignados antes de que el agente termine
- se revisa el diff de documentos de verdad si se produjo uno

La mayoría de las herramientas pide al equipo adoptar un hábito. Truthmark convierte ese hábito en infraestructura de flujo del repositorio.

Truthmark convierte un flujo de trabajo con IA en infraestructura del repositorio, no en tooling personal. Instala una capa de verdad nativa de Git y acotada a la rama dentro del propio repositorio, da a los agentes rutas explícitas y superficies de trabajo acotadas, y mantiene esa verdad revisable en Git en lugar de dispersarla por el historial de prompts, documentación obsoleta o estado privado de herramientas.

Eso importa porque el flujo vive con la rama. Una vez inicializado un repositorio, las reglas, el enrutamiento y las superficies instaladas viajan dentro del repo, así que la colaboración y los traspasos dependen menos de la configuración local de una sola persona.

Para equipos que ya saben que los agentes pueden generar código, Truthmark responde al siguiente problema: cómo hacer que el repositorio siga siendo legible, revisable y gobernable a medida que crece el trabajo asistido por IA.

## Resumen visual

<table>
	<tr>
		<td align="center" width="50%">
			<img src="docs/assets/truthmark-features.png" alt="Características de Truthmark" width="100%" />
			<br><strong>Características</strong><br>
			Lo que instala Truthmark y cómo se divide la superficie de trabajo.
		</td>
		<td align="center" width="50%">
			<img src="docs/assets/truthmark-position.png" alt="Posicionamiento de Truthmark" width="100%" />
			<br><strong>Posicionamiento</strong><br>
			Dónde encaja Truthmark frente a prompts, memoria y flujos spec-first.
		</td>
	</tr>
	<tr>
		<td align="center" colspan="2">
			<img src="docs/assets/truthmark-syncflow.png" alt="Flujo de sync de Truthmark" width="100%" />
			<br><strong>Flujo de sync</strong><br>
			Cómo Truth Sync cierra cambios normales de código antes del traspaso.
		</td>
	</tr>
</table>

## Por qué los equipos lo adoptan

Truthmark no intenta hacer que los agentes suenen más inteligentes. Intenta que los cambios de repositorio asistidos por IA sean más confiables.

- El flujo instalado Truth Sync tras cambios de código convierte el mantenimiento de documentación en una salvaguarda del flujo, no en un hábito del equipo.
- La verdad acotada a la rama viaja con el código, de modo que quienes revisan pueden inspeccionar la verdad actual en diffs normales de Git.
- Las superficies de flujo nativas del repositorio hacen el despliegue más ligero y los traspasos más resistentes que una simple configuración por usuario.
- El enrutamiento explícito en `docs/truthmark/areas.md` y en archivos de rutas secundarias delegadas da a los agentes límites de responsabilidad y rutas de escritura más seguras.
- La operación local-first evita depender de un demonio, una base de datos, un servicio remoto o MCP.
- El modelo de enrutamiento es independiente del lenguaje, con diagnósticos de cobertura para superficies comunes de código JavaScript, TypeScript, Go, Python, C# y Java.

Para responsables técnicos, el valor es gobernanza sin infraestructura extra: las pruebas, la revisión de código y la propiedad siguen haciendo el trabajo real; Truthmark vuelve el contexto del agente duradero, inspeccionable y acotado a la rama.

## Dónde encaja Truthmark

Truthmark no es una suite general de productividad para IA. Ocupa una capa concreta de la pila: verdad de repositorio revisable, acotada a la rama y alineada con la implementación.

| Si necesitas                                                                   | Mejor opción                                 |
| ------------------------------------------------------------------------------ | -------------------------------------------- |
| Mejores resultados en una sola sesión de programación                          | Mejores prompts y una tarea mejor delimitada |
| Continuidad cómoda entre sesiones para un agente o una persona                 | Herramientas de memoria                      |
| Planificación spec-first para nuevas funciones                                 | Herramientas de especificación como Spec Kit |
| Verdad del repositorio, revisable y acotada a la rama, que viaja con el código | Truthmark                                    |

La idea no es que los prompts, la memoria o las especificaciones no sirvan. La idea es que ninguno de ellos, por sí solo, convierte la verdad del repositorio en un activo confirmado en Git, inspeccionable y capaz de sobrevivir a traspasos, revisiones y divergencias entre ramas.

## Contenido

- [Por qué los equipos lo adoptan](#por-qué-los-equipos-lo-adoptan)
- [Qué resuelve Truthmark](#qué-resuelve-truthmark)
- [Dónde encaja Truthmark](#dónde-encaja-truthmark)
- [Primeros pasos](#primeros-pasos)
- [Cómo se ejecuta](#cómo-se-ejecuta)
- [Qué instala](#qué-instala)
- [Comandos](#comandos)
- [Por qué existe](#por-qué-existe)
- [Estado del proyecto](#estado-del-proyecto)
- [Documentación](#documentación)
- [No objetivos](#no-objetivos)
- [Licencia](#licencia)

## Qué resuelve Truthmark

Truthmark convierte la verdad del repositorio en una superficie explícita de flujo de trabajo para agentes:

- `.truthmark/config.yml` define el contrato de jerarquía confirmado en el repositorio.
- `docs/truthmark/areas.md` y los archivos de rutas secundarias delegadas asignan áreas de código a los documentos que las gobiernan.
- Truth Document genera o repara documentos de verdad canónica para comportamiento ya implementado cuando no hace falta cambiar código.
- Truth Sync mantiene alineados los documentos de verdad asignados cuando hay cambios funcionales.
- Truth Realize ofrece a los cambios que empiezan en documentación una ruta acotada para actualizar código.
- `truthmark check` valida los artefactos de verdad resultantes.
- Todo el modelo se mantiene local-first y nativo de Git.

Esta es la promesa central: el contexto del agente pasa a ser estado confirmado del repositorio, no un artefacto privado de una sesión.

## Primeros pasos

Instala Truthmark en el repositorio que quieras inicializar:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
truthmark init
truthmark check
```

Si quieres probar cambios aún no publicados desde un checkout del código fuente:

```bash
cd /path/to/truthmark
npm install
npm run build
cd /path/to/your-repo
node /path/to/truthmark/dist/main.js config
node /path/to/truthmark/dist/main.js init
node /path/to/truthmark/dist/main.js check
```

Revisa `.truthmark/config.yml` antes de `init`; es el contrato de jerarquía confirmado en el repositorio. Después de `init`, revisa la superficie de flujo de trabajo generada y los archivos de rutas para que los documentos enrutados coincidan con los documentos que realmente gobiernan tu código:

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

Las plataformas compatibles son `codex`, `opencode`, `claude-code`, `github-copilot` y `gemini-cli`. La configuración predeterminada las incluye todas; elimina de `.truthmark/config.yml` las plataformas que no uses antes de volver a ejecutar `truthmark init`.
La estructura generada por defecto usa los `README.md` de verdad como índices y empieza la verdad sobre el comportamiento actual en documentos hoja acotados, como `docs/truth/repository/overview.md`.

Los repositorios existentes suelen necesitar una pasada de limpieza después de `init`: ejecuta el flujo instalado Truth Structure cuando la ruta `repository` generada sea demasiado amplia, la propiedad abarque varios productos o servicios, o los archivos de rutas sigan apuntando a documentos de marcador de posición. Truth Structure divide rutas amplias, crea o repara documentos de verdad canónica iniciales y da a Truth Sync destinos precisos antes de que empiece el trabajo de código funcional. Codex, Claude Code y los IDEs de Copilot compatibles pueden invocarlo con `/truthmark-structure`; los hosts de estilo OpenCode pueden usar `/skill truthmark-structure`.

## Cómo se ejecuta

Truthmark es más fuerte en el camino por defecto, no como un conjunto de comandos manuales. El agente que actúa y el entorno anfitrión deciden si delegan o ejecutan el flujo instalado en línea.

### Comportamiento existente sin docs

Usa esto cuando la implementación ya existe pero faltan o son débiles los documentos de verdad canónica:

```text
el usuario identifica un comportamiento implementado o un endpoint de api
el usuario invoca explícitamente truth document
el agente lee implementación, pruebas, rutas y docs existentes
el agente solo escribe truth docs y rutas
revisar el diff de truth docs
```

Truth Document es manual y con prioridad de implementación: el código sirve como evidencia, los documentos de verdad se crean o reparan, y no se debe cambiar código funcional. Codex, Claude Code y los IDEs de Copilot compatibles pueden invocarlo con `/truthmark-document`; los hosts de estilo OpenCode pueden usar `/skill truthmark-document`.

```text
/truthmark-document documenta el comportamiento implementado del timeout de sesión en docs/truth/authentication
```

### Cambios de código normales

La mayoría de los usuarios no debería invocar Truth Sync directamente. Lo importante es que el flujo instalado del agente trate Truth Sync como una guarda de cierre cuando cambió código funcional. El flujo normal es:

```text
el agente cambia código funcional
se ejecutan las pruebas relevantes
el flujo instalado truth sync se ejecuta antes de que el agente termine
revisar el diff de truth docs si se produjo uno
confirmar o entregar el trabajo
```

Truth Sync es code-first: el código lidera, los documentos de verdad siguen, y Truth Sync no debe reescribir código funcional. Su tarea principal es ejecutarse mediante el flujo instalado del agente como guarda de cierre cuando cambió código funcional. La invocación directa se usa sobre todo para depurar, forzar una sincronización temprana antes de entregar el trabajo o ejecutar el flujo de forma intencional.

Codex, Claude Code y los IDEs de Copilot compatibles pueden invocarlo con `/truthmark-sync`. Los hosts de estilo OpenCode pueden usar `/skill truthmark-sync`.

```text
/truthmark-sync sincroniza ahora la verdad del repositorio antes de la entrega
```

### Cambios doc-first

Usa este flujo cuando una decisión de producto o arquitectura empieza en la documentación:

```text
el usuario edita truth docs
el usuario invoca explícitamente truth realize
el agente lee truth docs y el código relevante
el agente actualiza solo el código
se ejecutan las pruebas relevantes
confirmar o entregar el trabajo
```

Truth Realize es manual y doc-first: los documentos de verdad lideran, el código sigue, y el agente no debe editar los documentos de verdad que está realizando.

Codex, Claude Code y los IDEs de Copilot compatibles pueden invocarlo con `/truthmark-realize`. Los hosts de estilo OpenCode pueden usar `/skill truthmark-realize`.

```text
/truthmark-realize realiza docs/truth/authentication/session-timeout.md como código
```

## Qué instala

Truthmark mantiene pequeña y nativa del repositorio la superficie duradera de flujo de trabajo. Después de `truthmark init`, el propio repositorio lleva el enrutamiento, las reglas y las superficies instaladas, así que el equipo no depende solo de la configuración local de una persona.

- `.truthmark/config.yml` para el contrato de jerarquía confirmado y legible por máquina
- `docs/truthmark/areas.md` para el índice raíz de rutas
- `docs/truthmark/areas/**/*.md` para archivos de rutas secundarias delegadas
- `docs/templates/behavior-doc.md` y las demás plantillas específicas por tipo bajo `docs/templates/` para los estándares editables de truth docs usados por los flujos generados
- bloques de instrucciones administrados para plataformas configuradas como `AGENTS.md`, `CLAUDE.md`, instrucciones de Copilot y `GEMINI.md`
- skills, prompts o comandos nativos del host para Truth Structure, Truth Document, Truth Sync, Truth Realize y Truth Check
- agentes verificadores de Codex, Claude Code, GitHub Copilot y OpenCode de solo lectura y con alcance de proyecto bajo `.codex/agents/`, `.claude/agents/`, `.github/agents/` y `.opencode/agents/` para auditorías con subagentes propias del flujo

Las superficies de flujo de trabajo instaladas son el entorno de ejecución:

- Truth Structure crea o repara el enrutamiento de áreas y documentos de verdad iniciales.
- Truth Document crea o repara documentos de verdad para comportamiento ya implementado.
- Truth Sync mantiene alineados los documentos de verdad asignados con los cambios funcionales.
- Truth Realize actualiza el código para que coincida con los documentos de verdad.
- Truth Check audita la salud de la verdad del repositorio.

Los `README.md` de funciones son índices. Se espera que Truth Sync lea y actualice documentos hoja acotados para el comportamiento actual. Las superficies de flujo generadas preservan la autoridad de las reglas del repositorio mientras tratan el código de implementación y los documentos canónicos de verdad como evidencia del comportamiento actual.

Las superficies generadas son administradas por Truthmark, incluyen un marcador de versión y pueden refrescarse con `truthmark init`.

## Comandos

Truthmark V1 mantiene la CLI pequeña a propósito porque el flujo continuo debe vivir en las superficies instaladas del agente, no en una lista larga de comandos manuales de uso diario. En repositorios derivados, `truthmark config` crea el contrato de jerarquía confirmado en Git, `truthmark init` instala y refresca superficies de flujo de trabajo a partir de esa configuración revisada, `truthmark check` valida los artefactos de verdad para auditorías manuales, CI o depuración, y los comandos de inteligencia del repositorio generan artefactos derivados de revisión cuando hay herramientas locales disponibles.

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

`config` solo escribe `.truthmark/config.yml`, salvo que se use `--stdout`.

`init` requiere `.truthmark/config.yml` y luego instala o refresca los archivos locales de flujo de trabajo.

`check` valida configuración, autoridad, enrutamiento, documentos que contienen decisiones, frontmatter, enlaces internos, alcance de rama y diagnósticos de cobertura.

`index` construye JSON de RepoIndex y RouteMap para el checkout activo.

`impact --base <ref>` mapea los archivos cambiados a los truth docs enrutados, rutas propietarias, pruebas cercanas y símbolos públicos.

`context --workflow <workflow> [--base <ref>]` genera un ContextPack acotado para Truth Sync, Truth Document o Truth Realize. `--format markdown` lo renderiza en un formato legible para personas.

Truth Structure, Truth Document, Truth Sync, Truth Realize y Truth Check son flujos de trabajo instalados para agentes, no comandos CLI principales de uso diario.

Se ejecutan a través de las superficies configuradas del host agente, por ejemplo Codex/Claude/Copilot `/truthmark-*`, OpenCode `/skill truthmark-*` o Gemini `/truthmark:*`.

```text
/truthmark-check audita el enrutamiento y la cobertura de verdad antes de la revisión
```

## Por qué existe

La mayoría de los flujos de programación con IA optimizan la siguiente respuesta. Truthmark optimiza el siguiente traspaso.
Asume que los equipos serios necesitan:

- verdad de producto específica de cada rama
- decisiones duraderas de arquitectura y API
- propiedad explícita entre documentación y código
- límites seguros de escritura para agentes
- diffs normales de Git que humanos puedan revisar
- Markdown legible que el equipo pueda inspeccionar sin herramientas especiales
- verdad que viaje con la rama en lugar de vivir en estado oculto de sesión
- flujos que sigan funcionando aunque el paquete no esté instalado globalmente

## Estado del proyecto

Truthmark no es un servidor de memoria ni un servidor MCP. Es una práctica de repositorio empaquetada como un pequeño instalador CLI más superficies de flujo de trabajo nativas para agentes que convierten las reglas del flujo de IA en infraestructura del repositorio.

V1 actualmente ofrece:

- `truthmark config`
- `truthmark init`
- `truthmark check`
- `truthmark index`
- `truthmark impact`
- `truthmark context`
- instrucciones de flujo de trabajo administradas en `AGENTS.md`
- superficies de skill generadas para Truth Structure, Truth Document, Truth Sync, Truth Realize y Truth Check en los anfitriones de agentes configurados
- metadatos de alcance de rama
- diagnósticos de configuración, autoridad, enrutamiento, estructura de decisiones, frontmatter, enlaces y cobertura políglota
- artefactos derivados de RepoIndex, RouteMap, ImpactSet y ContextPack para una revisión local más rápida cuando la CLI está disponible

## Documentación

El README raíz es para personas que evalúan y prueban el paquete. Las especificaciones funcionales y de negocio detalladas viven en `docs/`:

- [Índice de documentación](docs/README.md)
- [Resumen de arquitectura](docs/architecture/overview.md)
- [Contratos de API y CLI](docs/truth/contracts.md)
- [Comportamiento de init y scaffold](docs/truth/init-and-scaffold.md)
- [Diagnósticos de check](docs/truth/check-diagnostics.md)
- [Flujos de trabajo instalados](docs/truth/workflows/overview.md)
- [Guía para mantener la verdad del repositorio](docs/standards/maintaining-repository-truth.md)

El comportamiento actual pertenece al árbol canónico de documentación anterior.

## No objetivos

Truthmark V1 no es:

- un servicio alojado
- un servidor MCP
- una base de datos vectorial
- un generador de sitios de documentación
- un producto de enforcement para CI o PR
- un sustituto de pruebas, revisión de código o liderazgo técnico
- un motor autónomo de reescritura de código

Es una forma ligera de hacer que los agentes locales de programación con IA respeten la verdad que tu equipo guarda en Git.

## Licencia

MIT. Consulta [LICENSE](LICENSE).
