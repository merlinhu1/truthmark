# Security Policy

## Supported Versions

Security fixes are handled on the current maintained release line of Truthmark. If you are using an older version, upgrade to the latest published version before reporting unless the issue only exists in the current release.

## Reporting a Vulnerability

Please do not post exploitable vulnerability details in a public issue.

Preferred reporting path:

1. Use GitHub's private vulnerability reporting or security advisory flow for this repository when available.
2. If private reporting is unavailable, open a GitHub issue with a minimal description and no exploit details, then coordinate details with the maintainer through the channel they provide.

Useful report details:

- affected Truthmark version or commit
- operating system and Node.js version
- whether the issue affects the CLI, generated workflow surfaces, validation commands, or repository file handling
- impact and reproduction steps, with secrets and private repository content removed

## Scope

Security-sensitive areas include command execution boundaries, generated workflow guidance, path handling, repository write boundaries, package publishing, and handling of untrusted repository Markdown/configuration.

Truthmark is local-first and Git-native. It should not require a daemon, database, hosted service, or hidden memory layer for normal operation.
