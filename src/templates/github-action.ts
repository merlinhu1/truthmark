export const renderGitHubActionExample = (): string => `name: Truthmark Impact

on:
  pull_request:

permissions:
  contents: read
  pull-requests: write

jobs:
  truthmark-impact:
    runs-on: ubuntu-latest
    env:
      TRUTHMARK_BLOCKING: "false"
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Generate ImpactSet
        run: |
          npx truthmark impact --base origin/\${{ github.base_ref }} --json > impactset.json
          npx truthmark check --base origin/\${{ github.base_ref }} --json > truthmark-check.json
      - name: Upload Truthmark reports
        uses: actions/upload-artifact@v4
        with:
          name: truthmark-impact
          path: |
            impactset.json
            truthmark-check.json
      - name: Comment on PR
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require("node:fs");
            const impact = JSON.parse(fs.readFileSync("impactset.json", "utf8"));
            const check = JSON.parse(fs.readFileSync("truthmark-check.json", "utf8"));
            const docs = impact.data.impactSet.affectedTruthDocs;
            const body = [
              "## Truthmark Impact",
              "",
              impact.summary,
              check.summary,
              "",
              "Affected truth docs:",
              ...(docs.length === 0 ? ["- none"] : docs.map((path) => \`- \${path}\`)),
            ].join("\\n");
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body,
            });
      - name: Enforce blocking mode
        if: env.TRUTHMARK_BLOCKING == 'true'
        run: |
          node -e "const check=require('./truthmark-check.json'); const bad=check.diagnostics.filter((d)=>d.severity==='error'||d.category==='freshness'); if (bad.length) { console.error(JSON.stringify(bad, null, 2)); process.exit(1); }"
`;
