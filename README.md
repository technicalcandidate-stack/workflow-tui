# @tatch-ai/workflow-tui

A simple terminal (TUI) client for testing and playing with [@tatch-ai/workflow-engine](https://github.com/your-org/workflow-engine). In production you'd use React clients or AI voice clients; this package keeps CLI-only deps (e.g. chalk) out of the engine so they're not transitive for all engine users.

> **Note:** This client was rapidly prototyped for exploration and is not production-ready. Review and cleanup recommended before production use.

## Run

A workflow JSON file is always required:

```bash
workflow-tui <file.json>
# or
node dist/run.js <file.json>
```

**Use the test fixture (workflow.json):**

```bash
npm run dev
# or after build:
npm start
```

Both scripts pass `workflow.json` by default — the commercial GL workflow included in the repo.

**Use your own workflow:**

```bash
npm run dev -- path/to/your-workflow.json
# or
node dist/run.js path/to/your-workflow.json
```

- Answer prompts (text, number, y/n, select by number or value).
- Type **`back`** at any prompt to return to the previous step.
- On completion, the TUI prints the collected data.

## Scripts

| Script       | Description                |
|-------------|----------------------------|
| `npm run dev` | Run with workflow.json (no build) |
| `npm run dev -- <file.json>` | Run with your workflow file |
| `npm run build` | Compile to `dist/`      |
| `npm start`  | Run with workflow.json (built)   |
| `npm start -- <file.json>` | Run with your workflow file |
| `npm run typecheck` | Type check only       |

## License

UNLICENSED — Internal use only.
