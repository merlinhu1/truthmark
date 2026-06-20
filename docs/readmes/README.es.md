# Truthmark

**Tus agentes escriben código. Truthmark mantiene documentación orientada a humanos y revisable en Git.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

![Banner de Truthmark](../assets/truthmark-banner.png)

## 🚀 Inicio rápido: ejecutarlo localmente en cinco minutos

Ejecuta esto dentro del repositorio Git que quieres que Truthmark gestione:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

Activa el host de IA que realmente usas. Las configuraciones nuevas son neutrales respecto al host, así que añade una lista `platforms` de nivel superior a `.truthmark/config.yml` antes de la inicialización:

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

Después instala los documentos de verdad locales del repositorio, el enrutamiento y las superficies de workflow para agentes:

```bash
truthmark init
truthmark check
git diff
```

Ahora prueba la ruta de adopción más común: documentar un comportamiento existente a partir del código y las pruebas. En tu host de codificación con IA, pídele al workflow instalado:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

Después de eso, normalmente los usuarios no deberían invocar Truth Sync directamente. Sigue programando mediante tu host de IA; las instrucciones instaladas en el repositorio le dicen al agente que ejecute las pruebas pertinentes y realice la revisión de Truth Sync antes de la entrega cuando haya cambios de código funcional. Tú revisas el diff de código resultante junto con el diff de los documentos de verdad.

Si solo quieres validación por CLI y todavía no quieres workflows de IA específicos de un host, deja `platforms` omitido y ejecuta `truthmark init && truthmark check`; puedes añadir una plataforma más tarde y volver a ejecutar `truthmark init`.

## 💡 El problema: la brecha de documentación de la IA

Los agentes de codificación con IA son increíbles escribiendo código rápidamente. Pero esa velocidad crea un nuevo modo de fallo peligroso: **la historia del repositorio se desvía de la realidad.**

* El comportamiento se pierde en historiales de chat efímeros.
* Los documentos de arquitectura se quedan atrás rápidamente.
* Las decisiones de producto desaparecen después de la entrega.
* Los revisores de código acaban examinando diffs de código sin procesar, sin entender el «por qué».
* Cada nueva sesión de IA se ve obligada a redescubrir desde cero la verdad de tu repositorio.

## 🎯 La solución: Truthmark

**Truthmark** instala en tu repositorio una capa de workflow nativa de Git. Arregla la parte del desarrollo con IA que normalmente se rompe: ayudar a que la documentación permanezca alineada con el código.

En lugar de esperar que humanos y agentes de IA recuerden actualizar la documentación, Truthmark convierte la documentación en un hábito sistemático y revisable dentro de tu propio repositorio.

### ✨ Por qué Truthmark es único

Truthmark no es simplemente otra herramienta de documentación. Está profundamente integrado en el workflow de IA:

* **🚫 Sin dependencia de proveedor:** no hay servicios alojados, bases de datos ocultas ni servidores adicionales que operar.
* **🌳 100 % nativo de Git:** todo vive en tu repositorio. La verdad se mueve con tu rama.
* **🤝 Arquitectura de dos superficies:** separa limpiamente las herramientas que las personas usan para gestionar el repositorio de los workflows que los agentes de IA usan para escribir código.
* **✅ Confianza mediante verificación:** el trabajo de la IA resulta más fácil de confiar porque el trabajo que cambia comportamiento incluye una decisión o un diff de documento de verdad revisable por humanos.

## 🔄 Cómo funciona

Cuando un agente de IA modifica tu código, el trabajo no ha terminado. Truthmark instala una protección de workflow al final de la tarea que los agentes siguen antes de la entrega:

1. 💻 **Código:** el agente modifica código funcional.
2. 🧪 **Prueba:** se ejecutan las pruebas pertinentes.
3. 🔍 **Comprobación:** `Truth Sync` comprueba la documentación mapeada cuando se ejecuta el workflow instalado.
4. 📝 **Documentación:** el agente actualiza los docs cuando la verdad del repositorio ha cambiado.
5. 👀 **Revisión:** una persona revisa el *diff de código* + el *diff de verdad*.

## 🛠 Dos superficies, un sistema de verdad

Truthmark se divide intencionadamente en dos superficies distintas para servir tanto a mantenedores humanos como a agentes de IA.

### 1. 🧑‍💻 La CLI humana (mantenedores y CI)
La usan los desarrolladores para preparar, configurar y validar el repositorio.
* `truthmark config` - crea tu configuración inicial.
* `truthmark init` - instala el enrutamiento, los andamios y las instrucciones necesarios.
* `truthmark check` - valida artefactos de verdad desde la terminal.

### 2. 🤖 Los workflows orientados a la IA (agentes)
Truthmark instala skills, prompts y comandos nativos que entienden los hosts de IA compatibles (como Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity y Cursor). Estos *no* son comandos de shell; son puntos de entrada de workflow para la IA.
* `/truthmark-sync` - el workflow de cierre que siguen los agentes después de cambios de código funcional; no es un comando normal iniciado por el usuario.
* `/truthmark-document` - genera docs para código existente no documentado.
* `/truthmark-structure` - organiza áreas amplias del repositorio en dominios específicos.
* `/truthmark-realize` - **Desarrollo doc-first:** lee docs de arquitectura y genera código que coincida.
* `/truthmark-check` - auditoría de la verdad del repositorio dirigida por el agente.

## Lo que obtienes

| Capacidad | Qué hace |
| --- | --- |
| Verdad nativa de Git | Mantiene la verdad del repositorio en Markdown y configuración versionados. |
| Documentación con alcance de rama | La verdad se mueve con la rama en lugar de vivir en una sesión privada. |
| CLI humana | Da a los mantenedores comandos de configuración, actualización, validación e inspección. |
| Workflows orientados a la IA | Da a los agentes workflows nativos del host para sincronización, documentación, estructura, realización y auditoría. |
| Enrutamiento explícito | Mapea áreas de código a documentos de verdad canónicos. |
| Entregas revisables | Produce diffs Git ordinarios tanto para el código como para los documentos de verdad. |
| Operación local-first | No requiere servicio alojado, demonio, base de datos ni servidor MCP. |
| Límites de escritura más seguros | Separa workflows code-first, doc-first, read-only y doc-only. |
| Validación | Informa problemas de enrutamiento, autoridad, frontmatter, enlaces, superficies generadas, alcance de rama, frescura y cobertura. |
| Portal opcional | Genera, cuando se activa y solicita explícitamente, un sitio estático HTML versionado a partir de documentos de verdad Markdown. |

## Panorama visual

![Funciones de Truthmark](../assets/truthmark-features.png)

**Funciones:** lo que instala Truthmark y cómo se divide la superficie de workflow.

![Posición de Truthmark](../assets/truthmark-position.png)

**Posición:** dónde encaja Truthmark en relación con prompts, memoria y workflows de especificación.

![Flujo de sincronización de Truthmark](../assets/truthmark-syncflow.png)

**Flujo de sincronización:** cómo Truth Sync cierra los cambios de código normales antes de la entrega.

## Por qué los equipos lo adoptan

Truthmark es para equipos que ya saben que los agentes de IA pueden generar código.

El siguiente problema es la gobernanza.

No la gobernanza como ceremonia. Gobernanza como una pregunta sencilla:

> Después de este cambio asistido por IA, ¿el repositorio sigue diciendo la verdad?

Truthmark ayuda a los equipos a responder con archivos versionados, enrutamiento explícito y diffs revisables.

Es útil cuando necesitas:

- menos deriva de documentación
- mejores entregas
- verdad de producto específica de la rama
- documentación duradera de arquitectura y API
- propiedad explícita entre docs y código
- límites de escritura de agentes más seguros
- documentación revisable en lugar de memoria oculta
- workflows de IA que siguen funcionando desde archivos versionados del repositorio

## Dónde encaja Truthmark

Truthmark no reemplaza prompts, memoria, especificaciones, pruebas ni revisión de código.

Les da a esos workflows un lugar duradero donde aterrizar en Git.

| Necesidad | Mejor opción |
| --- | --- |
| Mejor salida de una sesión de agente | Mejor prompt |
| Continuidad personal o a nivel de sesión | Herramienta de memoria |
| Trabajo de funcionalidad con plan primero | Workflow de especificación |
| Verdad con alcance de rama que viaja con el código | Truthmark |
| Validar la corrección del comportamiento | Pruebas y revisión |
| Revisar cambios de documentación asistidos por IA | Truthmark más revisión Git |

El carril de Truthmark es estrecho por diseño:

```text
make repository truth explicit
route it to code
install agent workflows around it
keep the result reviewable in Git
```

## Profundizar

El README es el escaparate: contexto rápido, inicio rápido y el modelo mental central.

Para uso comando por comando, comparaciones de superficies, detalles de plataformas compatibles, configuración, enrutamiento, Portal y ejemplos, lee la [guía de usuario de Truthmark](../user-guide.md).

## Estado del proyecto

La versión actual proporciona:

- comandos CLI locales para config, init, check, index, impact y estado de workflows
- superficies de workflow de IA generadas para Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity y Cursor
- diagnósticos de enrutamiento, autoridad, frontmatter, enlaces, frescura, superficies generadas, alcance de rama y cobertura
- documentos de verdad con alcance de rama y artefactos derivados de inteligencia del repositorio

## Documentación

- [Guía de usuario](../user-guide.md)
- [Índice de docs](../README.md)
- [Vista general de arquitectura](../truthmark/engineering/architecture/overview.md)
- [Contratos de API y CLI](../truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Guía de mantenimiento de la verdad del repositorio](../standards/maintaining-repository-truth.md)

Para comandos de desarrollo local y contribución, consulta [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Límites de diseño

Truthmark es intencionadamente pequeño: local, versionado, con alcance de rama y revisable.

No es un servicio alojado, servidor MCP, base de datos vectorial, capa de memoria oculta, producto de aplicación de CI ni motor autónomo de reescritura de código. Ayuda a que la verdad del repositorio permanezca visible; no reemplaza pruebas, revisión de código ni juicio humano.

## Licencia

MIT. Consulta [LICENSE](../../LICENSE).
