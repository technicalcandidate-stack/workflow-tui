# @tatch-ai/workflow-tui

A simple terminal (TUI) client for testing and playing with [@tatch-ai/workflow-engine](https://github.com/your-org/workflow-engine). In production you’d use React clients or AI voice clients; this package keeps CLI-only deps (e.g. chalk) out of the engine so they’re not transitive for all engine users.

## Setup

From the repo root (or wherever `workflow-engine` lives):

```bash
cd workflow-tui
npm install
```

The package depends on `@tatch-ai/workflow-engine` via `file:../workflow-engine`. Build the engine first:

```bash
cd ../workflow-engine && npm run build && cd ../workflow-tui
```

## Run

```bash
npm run dev    # tsx src/run.ts (no build)
# or
npm run build && npm start
```

- Walk through the commercial GL workflow step-by-step.
- Answer prompts (text, number, y/n, select by number or value).
- Type **`back`** at any prompt to return to the previous step.
- On completion, the TUI prints the collected data.

## Scripts

| Script       | Description                |
|-------------|----------------------------|
| `npm run dev` | Run with tsx (no build)   |
| `npm run build` | Compile to `dist/`      |
| `npm start`  | Run built `dist/run.js`   |
| `npm run typecheck` | Type check only       |

## License

UNLICENSED — Internal use only.
