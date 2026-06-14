# Support

Use GitHub issues for support requests, bug reports, documentation problems, and workflow questions.

Before opening an issue:

1. Check the [README](README.md) for the normal install and validation flow.
2. Check the [docs index](docs/README.md) for detailed behavior and architecture references.
3. Run the narrowest relevant command and include its output when possible:

```bash
truthmark check --json
truthmark index --json
```

For source-checkout development, also see [CONTRIBUTING.md](CONTRIBUTING.md).

## What To Include

- Truthmark version or commit
- Node.js and npm versions
- operating system
- the command or workflow you ran
- relevant snippets from `.truthmark/config.yml`, routes, truth docs, or generated surfaces
- expected behavior and actual behavior

Do not include secrets, private repository content, tokens, or exploitable security details in public issues. Use [SECURITY.md](SECURITY.md) for vulnerability reports.
