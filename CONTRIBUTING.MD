# Contributing to scrapegraph-js

## Setup

```bash
bun install
```

## Development

```bash
bun run build        # build to dist/
bun run check        # tsc + biome lint
```

## Before committing

Run all checks:

```bash
bun run format       # auto-fix formatting
bun run lint         # check for errors
bunx tsc --noEmit    # type check
bun run build        # verify build
bun test             # unit tests
```

## Testing

```bash
bun test                  # unit tests only
bun run test:integration  # live API tests (requires SGAI_API_KEY)
```

For integration tests, set `SGAI_API_KEY` in your environment or `.env` file.

## Commit messages

Use conventional commits:

- `feat:` new feature
- `fix:` bug fix
- `refactor:` code change (no new feature, no bug fix)
- `chore:` maintenance (deps, config)
- `test:` add/update tests
- `docs:` documentation

## Pull requests

1. Fork and create a branch from `main`
2. Make changes
3. Run all checks (see above)
4. Submit PR to `main`

## License

MIT - contributions are licensed under the same license.
