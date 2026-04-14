# Claude Code Instructions

## Before completing any task

Always run these commands before committing or saying a task is done:

```bash
bun run format
bun run lint
bunx tsc --noEmit
bun run build
bun test
```

No exceptions.
