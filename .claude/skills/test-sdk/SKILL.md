---
name: test-sdk
description: Run a full end-to-end test of the scrapegraph-js SDK against the live API using an API key the user provides at invocation. Exercises every public method on the ScrapeGraphAI client. Use when the user asks to "test the SDK", "run SDK tests", or "/test-sdk".
---

# Test the scrapegraph-js SDK

## Hard rules

1. **Never push directly to `main`.** Do not run `git push`, `git push origin main`, or any force-push against `main`. Do not commit to `main` on the user's behalf. If changes are needed, create a branch and open a PR — never bypass review on the SDK's main branch.
2. **Never skip git hooks.** No `--no-verify`, no `--no-gpg-sign`.
3. **Use the API key the user provides in this turn.** Do not read `SGAI_API_KEY` from the shell environment or from `.env`. Do not hardcode it into any file. Do not commit it. Do not echo it into long-lived logs.
4. **If the user did not include an API key**, stop and ask for one before doing anything else.

## How to use the key

Pass it inline for the duration of each command:

```bash
SGAI_API_KEY="<key-from-user>" bun run <script>
```

Do not `export` it into the shell. Do not write it to `.env`, a test fixture, or any file that could be committed.

## What to test

Exercise every public method on the `ScrapeGraphAI()` client. The list (from `CLAUDE.md`):

- `sgai.scrape()` — AI extraction from URL
- `sgai.extract()` — extraction from raw HTML/text
- `sgai.search()` — web search + extraction
- `sgai.crawl.start()` → `sgai.crawl.get()` — start a crawl and poll until it terminates
- `sgai.monitor.create()` → `sgai.monitor.get()` → `sgai.monitor.update()` → `sgai.monitor.delete()` — full monitor lifecycle; always delete what you create
- `sgai.credits()` — check credits before and after the run
- `sgai.healthy()` — health check
- `sgai.history.list()` → `sgai.history.get()` — list, then fetch one entry by id

For each method: capture `status`, the presence/shape of `data`, and any error. Treat a non-`success` status as a failure for that method, not for the whole run — keep going and report everything at the end.

## Procedure

1. Confirm the API key was provided in the user's message. If not, ask.
2. Run `sgai.credits()` first so you know the starting balance and that auth works. If this 401s, stop and tell the user the key is invalid.
3. Before touching the SDK, run the project's standard checks from `CLAUDE.md`:
   ```bash
   bun run format && bun run lint && bunx tsc --noEmit && bun run build && bun test
   ```
   If any fail, report and stop — don't run live API tests against a broken build.
4. Write a single throwaway script under `scripts/` (e.g. `scripts/smoke-sdk.ts`) that imports the built client and runs each method. Do not add it to the committed test suite.
5. Execute it with the key passed inline. Use small inputs (short URLs, short prompts, `limit: 1` where available) to keep credit usage low.
6. Clean up: delete any monitor you created, and delete the throwaway script when done.
7. Report a table of `method → status → notes`, plus credits delta.

## What a good report looks like

```
Method              Status    Notes
-----------------------------------
healthy()           ok        -
credits() [start]   ok        balance: 1234
scrape()            ok        got result for https://example.com
extract()           ok        -
search()            ok        3 results
crawl.start/get     ok        job <id> finished in 12s
monitor lifecycle   ok        created/got/updated/deleted <id>
history.list/get    ok        latest entry <id>
credits() [end]     ok        balance: 1229 (Δ -5)
```

If something fails, include the HTTP status and the first line of the error body — not the full stack, not the key.
