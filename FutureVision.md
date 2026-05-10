  Directions for V2
  
  1. Evidence Layer
      - Strengthen truthmark check into the primary confidence surface.
      - Make truthVisibility more actionable: route precision, unmapped surfaces, stale
        generated surfaces, topology pressure.
      - Add CI examples that report truth health without pretending Truthmark is a merge
        gate by default.
      - Build before/after demos showing: code change → tests → Truth Sync → reviewable
        truth diff.
  2. Adoption Layer
      - Create high-quality example repos: Node API, Go service, frontend app, monorepo,
        infra repo.
      - Add migration guides for teams already using AGENTS.md, CLAUDE.md, Copilot
        instructions, or Gemini commands.
      - Sharpen messaging: “Your agents write code. Truthmark makes their context
        reviewable in Git.”
      - Reduce vocabulary friction. “Truth” is powerful internally, but new users need
        concrete outcomes: fewer repeated decisions, better handoffs, less doc drift.
  3. Conformance Layer
      - Treat generated host surfaces as adapters with contract tests.
      - Keep Codex, Claude Code, Copilot, Cursor, OpenCode, and Gemini support current as
        those hosts evolve.
      - External signal supports this direction: Codex reads repo instructions and skills,
        Copilot supports repo/path/agent instructions, Claude Code has project skills, and
        Gemini CLI supports project commands. Sources: OpenAI Codex loop
        (https://openai.com/index/unrolling-the-codex-agent-loop/), GitHub Copilot custom
        instructions

  > The repo should tell every AI agent what is true, what owns what, and what must be
  > updated before work is complete.