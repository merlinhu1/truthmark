# Truthmark es la capa de verdad para el desarrollo de software con IA.

[English](README.md) | [Deutsch](README.de.md) | [中文](README.zh.md) | Español | [Русский](README.ru.md)

Los agentes de programación con IA ya escriben código bastante bien. Lo que todavía hacen mal es reconstruir de forma fiable la intención del producto, los límites de arquitectura y la responsabilidad sobre cada parte del repositorio a partir de documentación obsoleta, conversaciones dispersas y memoria temporal de herramientas.

## Qué resuelve Truthmark

Truthmark lo resuelve convirtiendo la verdad local de cada rama en una superficie de ejecución de primera clase para los agentes. Instala una capa de verdad nativa de Git, acotada a la rama, directamente dentro del repositorio; da a los agentes rutas y límites de flujo de trabajo explícitos; y hace que esa verdad viaje con el código que realmente se entrega.
Esto no es mejor ingeniería de prompts. Es una forma más gobernable de usar IA en una base de código real: menos decisiones repetidas, menos documentación obsoleta, traspasos más limpios y sesiones de programación con IA que dejan registros de ingeniería revisables en lugar de desaparecer en el historial de prompts o en estados opacos de herramientas.
Está pensado para equipos que ya saben que los agentes pueden generar código y ahora necesitan que el repositorio siga siendo legible, revisable y gobernable.
Empezar a programar con IA ya es fácil; gobernarlo es lo costoso. Cuando los agentes pueden escribir código rápido, la verdad del repositorio se convierte en la superficie de control.
Ese fallo aparece de forma predecible: los requisitos se quedan en chats, las decisiones de arquitectura se repiten, los agentes tocan las zonas equivocadas y las ramas heredan contexto que los revisores no pueden inspeccionar con confianza. El código puede avanzar rápido, pero el repositorio se vuelve más difícil de confiar.
Truthmark cambia el modelo de trabajo:

- La verdad local de la rama viaja con la rama, en lugar de vivir en un almacén privado de herramientas.
- Git hace que esa verdad sea revisable, comparable y compartible con el equipo.
- La documentación sigue al código en lugar de derivar silenciosamente hacia la ficción.
- El enrutamiento permanece explícito en `docs/truthmark/areas.md` y en archivos de rutas secundarias delegadas, para que los agentes sepan qué documentación gobierna qué código.
- Las decisiones activas de producto y arquitectura viven en los documentos canónicos que gobiernan, no en registros de planificación con marca de tiempo.
- Los flujos de trabajo locales evitan depender de un demonio, una base de datos, un servicio remoto o MCP.
- El modelo funciona en bases de código JavaScript, TypeScript, Go, Python, C# y Java.

Para responsables técnicos, el valor es gobernanza sin teatro: las pruebas, la revisión de código y la propiedad siguen haciendo el trabajo real; Truthmark vuelve el contexto del agente duradero, inspeccionable y acotado a la rama.

## Dónde encaja Truthmark

Truthmark no intenta reemplazar todas las demás herramientas de flujo de trabajo con IA. Ocupa una capa concreta de la pila:

| Si necesitas                                                                   | Mejor opción                                 |
| ------------------------------------------------------------------------------ | -------------------------------------------- |
| Mejores resultados en una sola sesión de programación                          | Mejores prompts y una tarea mejor delimitada |
| Continuidad cómoda entre sesiones para un agente o una persona                 | Herramientas de memoria                      |
| Planificación spec-first para nuevas funciones                                 | Herramientas de especificación como Spec Kit |
| Verdad del repositorio, revisable y acotada a la rama, que viaja con el código | Truthmark                                    |

La idea no es que los prompts, la memoria o las especificaciones no sirvan. La idea es que ninguno de ellos, por sí solo, convierte la verdad del repositorio en un activo confirmado en Git, inspeccionable y capaz de sobrevivir a traspasos, revisiones y divergencias entre ramas.

## Contenido

- [Qué resuelve Truthmark](#qué-resuelve-truthmark)
- [Dónde encaja Truthmark](#dónde-encaja-truthmark)
- [Superficie de flujo](#superficie-de-flujo)
- [Primeros pasos](#primeros-pasos)
- [Cómo se ejecuta](#cómo-se-ejecuta)
- [Qué instala](#qué-instala)
- [Comandos](#comandos)
- [Por qué existe](#por-qué-existe)
- [Estado del proyecto](#estado-del-proyecto)
- [Documentación](#documentación)
- [No objetivos](#no-objetivos)
- [Licencia](#licencia)

## Superficie de flujo

Truthmark convierte la verdad del repositorio en una superficie explícita de flujo de trabajo para agentes:

- `TRUTHMARK.md` define el contrato de flujo de trabajo local a la rama.
- `docs/truthmark/areas.md` y los archivos de rutas secundarias delegadas asignan áreas de código a los documentos que las gobiernan.
- Truth Sync mantiene alineados los documentos de verdad asignados cuando hay cambios funcionales.
- Truth Realize ofrece a los cambios que empiezan en documentación una ruta acotada para actualizar código.
- `truthmark check` valida los artefactos de verdad resultantes.
- Todo el modelo se mantiene local-first y nativo de Git.

Esta es la promesa central: el contexto del agente pasa a ser estado confirmado del repositorio, no un artefacto privado de una sesión.

## Primeros pasos

Instala Truthmark en el repositorio que quieras inicializar:

```bash
cd /path/to/your-repo
npm install -D truthmark
npx truthmark config
npx truthmark init
npx truthmark check
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
TRUTHMARK.md
docs/truthmark/areas.md
docs/truthmark/areas/repository.md
docs/features/README.md
docs/features/repository/README.md
docs/features/repository/overview.md
AGENTS.md
CLAUDE.md
skills/truthmark-structure/SKILL.md
skills/truthmark-sync/SKILL.md
skills/truthmark-realize/SKILL.md
skills/truthmark-check/SKILL.md
```

Si habilitas plataformas adicionales en `.truthmark/config.yml`, Truthmark actualizará las superficies administradas correspondientes en el siguiente `init`.
La estructura generada por defecto usa los `README.md` de funciones como índices y empieza la verdad sobre el comportamiento actual en documentos hoja acotados, como `docs/features/repository/overview.md`.

## Cómo se ejecuta

Truthmark no especifica qué subagente debe ejecutar Truth Sync. El agente que actúa y el entorno anfitrión deciden si delegan o ejecutan el flujo en línea.
La mayoría de los usuarios no debería invocar Truth Sync directamente. El flujo normal es:

```text
el agente cambia código funcional
se ejecutan las pruebas relevantes
Truth Sync se dispara antes de que el agente termine
se revisa el diff de documentos de verdad si se produjo uno
se confirma o se entrega el trabajo
```

Truth Sync es code-first: el código lidera, los documentos de verdad siguen, y Truth Sync no debe reescribir código funcional. Su tarea principal es actuar como salvaguarda automática al cierre cuando cambió código funcional. La invocación directa se usa sobre todo para depurar, forzar una sincronización temprana antes de entregar el trabajo o ejecutar el flujo de forma intencional.
Los usuarios de Codex pueden invocarlo con `/truthmark-sync` o `$truthmark-sync`. Los hosts de estilo OpenCode pueden usar `/skill truthmark-sync`.
Usa este flujo cuando una decisión de producto o arquitectura empieza en la documentación:

```text
el usuario edita los documentos de verdad
el usuario invoca explícitamente Truth Realize
el agente lee los documentos de verdad y el código relevante
el agente actualiza solo el código
se ejecutan las pruebas relevantes
se confirma o se entrega el trabajo
```

Truth Realize es manual y doc-first: los documentos de verdad lideran, el código sigue, y el agente no debe editar los documentos de verdad que está realizando.
Los usuarios de Codex pueden invocarlo con `/truthmark-realize` o `$truthmark-realize`. Los hosts de estilo OpenCode pueden usar `/skill truthmark-realize`.

## Qué instala

Truthmark mantiene pequeña la superficie duradera de flujo de trabajo:

- `.truthmark/config.yml` para configuración legible por máquina
- `TRUTHMARK.md` para el contrato de flujo de trabajo local a la rama
- `docs/truthmark/areas.md` para el índice raíz de rutas
- `docs/truthmark/areas/**/*.md` para archivos de rutas secundarias delegadas
- bloques de instrucciones administrados para plataformas configuradas como `AGENTS.md`, `CLAUDE.md`, reglas de Cursor, instrucciones de Copilot y `GEMINI.md`
- skills locales del repositorio y de Codex para Truth Structure, Truth Sync, Truth Realize y Truth Check

Las superficies de flujo de trabajo instaladas son el entorno de ejecución:

- Truth Structure crea o repara el enrutamiento de áreas y documentos de verdad iniciales.
- Truth Sync mantiene alineados los documentos de verdad asignados con los cambios funcionales.
- Truth Realize actualiza el código para que coincida con los documentos de verdad.
- Truth Check audita la salud de la verdad del repositorio.

Los `README.md` de funciones son índices. Se espera que Truth Sync lea y actualice documentos hoja acotados para el comportamiento actual.

Las superficies generadas son administradas por Truthmark, incluyen un marcador de versión y pueden refrescarse con `truthmark init`.

## Comandos

Truthmark V1 mantiene la CLI pequeña a propósito. En repositorios derivados, `truthmark config` crea el contrato de jerarquía confirmado en Git, `truthmark init` instala y refresca superficies de flujo de trabajo a partir de esa configuración revisada, y `truthmark check` valida los artefactos de verdad para auditorías manuales, CI o depuración.

```bash
truthmark config
truthmark init
truthmark check
truthmark config --json
truthmark check --json
```

`config` solo escribe `.truthmark/config.yml`, salvo que se use `--stdout`.
`init` requiere `.truthmark/config.yml` y luego instala o refresca los archivos locales de flujo de trabajo.
`check` valida configuración, autoridad, enrutamiento, documentos que contienen decisiones, frontmatter, enlaces internos, alcance de rama y diagnósticos de cobertura.
Truth Structure, Truth Sync, Truth Realize y Truth Check son flujos de trabajo instalados para agentes, no comandos CLI principales de uso diario.

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

Truthmark no es un servidor de memoria ni un servidor MCP. Es una práctica de repositorio empaquetada como un pequeño instalador CLI más superficies de flujo de trabajo nativas para agentes.
V1 actualmente ofrece:

- `truthmark config`
- `truthmark init`
- `truthmark check`
- instrucciones de flujo de trabajo administradas en `AGENTS.md`
- superficies de skill generadas para Truth Structure, Truth Sync, Truth Realize y Truth Check en los anfitriones de agentes configurados
- metadatos de alcance de rama
- diagnósticos de configuración, autoridad, enrutamiento, estructura de decisiones, frontmatter, enlaces y cobertura políglota

## Documentación

El README raíz es para personas que evalúan y prueban el paquete. Las especificaciones funcionales y de negocio detalladas viven en `docs/`:

- [Índice de documentación](docs/README.md)
- [Resumen de arquitectura](docs/architecture/overview.md)
- [Contratos de API y CLI](docs/features/contracts.md)
- [Comportamiento de init y scaffold](docs/features/init-and-scaffold.md)
- [Diagnósticos de check](docs/features/check-diagnostics.md)
- [Flujos de trabajo instalados](docs/features/installed-workflows.md)
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
