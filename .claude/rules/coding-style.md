# Coding Style Guide

Universal TypeScript patterns. Framework-specific rules live in `api.md` and `web.md`.

---

## 1. File Organization

Every piece of code has exactly one home. No exceptions. Framework-specific layouts in `api.md` and `web.md`.

### Placement Rules (Non-Negotiable)

| What | Where | Rule |
|---|---|---|
| Hand-written types, interfaces, type aliases | `types/index.ts` | Types NEVER live in `lib/`, `app/`, hooks, components (error classes in `lib/errors.ts` are code, not types) |
| ORM-inferred types (`$inferSelect`, `$inferInsert`) | Co-located with schema in `db/schema.ts` | The ONE exception — generated from schema, not hand-written |
| Constants (maps, sets, numbers, config) | `lib/constants.ts` (frontend) or on the module namespace (backend, e.g. `redis.KEYS`). Cross-cutting backend constants with no domain home → `lib/constants.ts` | No functions in constants files |
| Utility functions | `lib/utils.ts` | Pure helpers only — no DB, no API calls, no side effects |
| Zod schemas | `lib/schemas.ts` (frontend) or `routes/*/schemas.ts` (backend) | Never inline schemas in route handlers or components |
| DB queries | `db/*.ts` | Drizzle typed builders, no raw SQL for WHERE/ORDER |

**The moment a second file needs a type, constant, or schema — move it to its canonical home.**

**All hand-written types go in `types/index.ts`.** Three exceptions:

1. **ORM-inferred types** (`$inferSelect`, `$inferInsert`) stay in `db/schema.ts`
2. **Schema-inferred types** (`z.infer<typeof schema>`) can stay co-located when used by a single file. When a second file needs it, move to `types/index.ts`
3. **Component-local props interfaces** can stay in a component file if used only within that component

**Scaling**: Start with `types/index.ts`. Past ~50 types, split by domain (`types/api.ts`, `types/dashboard.ts`) with barrel re-exports.

### Monorepo (shared package)

When both apps need the same types, schemas, or DB definitions, extract into a shared package with subpath imports (`@myapp/shared/db`, `@myapp/shared/types`, etc.). Never barrel-import from the package root.

---

## 2. Module Export & Import Patterns

### Multi-Function Modules

Two patterns — both result in `module.verb()` at the call site:

**Pattern A: Default namespace object** (domain modules with shared constants)

```ts
// lib/redis.ts
function get(key: string) { ... }
function set(key: string, value: unknown, ttl?: number) { ... }
const KEYS = { html: (hash: string) => `cache:html:${hash}` }

export default { get, set, KEYS }

// consumer
import redis from "@/lib/redis"
redis.get(redis.KEYS.html(hash))
```

**Pattern B: Named exports with star import** (when you need to export types alongside functions)

```ts
// lib/email.ts
export function sendVerification(to: string, url: string) { ... }
export function sendPasswordReset(to: string, url: string) { ... }

// consumer
import * as email from "@/lib/email"
email.sendVerification(to, url)
```

Pick one per module, don't mix default + named exports. **Namespace is mandatory for domain modules** — bare function names are ambiguous:

```ts
// BANNED
import { sendVerification } from "@/lib/email"
sendVerification(to, url)

// REQUIRED
import * as email from "@/lib/email"
email.sendVerification(to, url)
```

**When named imports are OK** (no namespace needed):

- Error classes: `import { HttpError } from "@/lib/errors"`
- Singletons/instances: `import { stripe } from "@/lib/stripe"`
- Grab-bag utility modules (`utils.ts`): functions are already unambiguous — `slugify()`, `cn()`, `formatDate()` don't need a `utils.` prefix
- Server actions consumed by Next.js `action={fn}` prop (needs bare reference)
- Co-located same-directory imports (`import { createTaskSchema } from "./schemas"`) — no namespace stuttering
- Re-exports from barrel files (`types/index.ts`)

### Single-Function Modules

Default export. Import alias matches the module domain or the function name. Don't repeat file context — `send` in `email.ts`, not `sendEmail`.

```ts
// lib/email.ts
export default async function send(to: string, subject: string) { ... }

// consumer
import send from "@/lib/email"
send(to, "Welcome")
```

### Nested Namespace Objects

When a module has multiple related sub-domains, group them as nested objects. The call site reads like `module.subdomain.verb()`.

```ts
// lib/payment.ts
const customer = {
  async create(email: string): Promise<Customer> { ... },
  async get(id: string): Promise<Customer> { ... },
}

const charge = {
  async create(input: ChargeInput): Promise<Charge> { ... },
  async refund(chargeId: string): Promise<Refund> { ... },
}

const webhook = {
  verify(payload: string, signature: string): boolean { ... },
  async process(event: WebhookEvent): Promise<void> { ... },
}

export default { customer, charge, webhook }

// consumer
import payment from "@/lib/payment"
payment.customer.create(email)
payment.charge.refund(chargeId)
payment.webhook.verify(payload, sig)
```

**When to nest**: the module covers a single domain but has distinct sub-concerns (customers, charges, webhooks). Without nesting you'd get flat functions like `createCustomer`, `getCustomer`, `createCharge`, `refundCharge`, `verifyWebhook` — zero structure, zero discoverability.

```ts
// BANNED — flat loose functions with prefixes to disambiguate
export function createCustomer(email: string) { ... }
export function getCustomer(id: string) { ... }
export function createCharge(input: ChargeInput) { ... }
export function refundCharge(chargeId: string) { ... }
export function verifyWebhook(payload: string, sig: string) { ... }

// REQUIRED — nested namespaces
export default { customer, charge, webhook }
```

**Rule of thumb**: if you're prefixing function names to disambiguate (`create*`, `get*`, `verify*`) — you need sub-objects instead.

### Decision Matrix

| Module exports | Export style | Import style | Call site |
|---|---|---|---|
| Multiple functions | `export default { fn1, fn2 }` or named exports | `import mod from` or `import * as mod from` | `mod.fn1()` |
| Single function (lib) | `export default function name()` | `import name from` | `name()` |
| React component | `export function Component()` | `import { Component } from` | `<Component />` |
| Single instance | `export const thing = ...` | `import { thing } from` | `thing.method()` |
| Types only | `export type / export interface` | `import type { T } from` | — |
| Error classes | `export class FooError` | `import { FooError } from` | `instanceof FooError` |
| Library integration | Semantic export (`*` or full object) | `import * as name from` | `name.method()` |

---

## 3. Naming

### API Fields (camelCase — Non-Negotiable)

All JSON over the wire — request schemas, response bodies, SSE event payloads, webhook payloads — uses **camelCase**. Matches Drizzle ORM convention so `c.json(row)` works with no mapping. No snake_case anywhere in the API contract.

### Files

| Type | Convention | Examples |
|---|---|---|
| Modules | `kebab-case.ts` | `rate-limit.ts`, `auth-client.ts` |
| Components | `kebab-case.tsx` | `nav-bar.tsx`, `pricing-card.tsx` |
| Hooks | `use-*.ts` | `use-oauth.ts`, `use-debounce.ts` |
| Types | `index.ts` in `types/` | One file, all types |
| Tests | `*.test.ts` | `credits.test.ts` |

### Functions

**Never repeat the module name in the function name.** `module.verb()`.

```ts
// BANNED                    // REQUIRED
tokens.countTokens()         tokens.count()
email.sendVerificationEmail() email.sendVerification()
cache.getCacheEntry()        cache.get()
```

### Types

Every type name must make sense in isolation.

| Layer | Pattern | Examples |
|---|---|---|
| DB rows (read) | `*Select` | `UserSelect`, `OrderSelect` |
| DB rows (write) | `*Insert` | `UserInsert`, `OrderInsert` |
| API requests | `Api*Request` | `ApiCreateOrderRequest` |
| API responses | `Api*Response` | `ApiOrderResponse` |
| Discriminated entries | `Api*Entry` | `ApiHistoryEntry` |
| Paginated wrappers | `ApiPageResponse<T>` | `ApiPageResponse<ApiHistoryEntry>` aliased as `ApiHistoryPage` |
| UI/domain types | Domain prefix | `DashboardProps`, `StripeInvoice` |
| Config objects | `*Config` / `*Options` | `FetchConfig`, `RetryOptions` |
| Generic utilities | No prefix | `ActionResponse<T>`, `ApiPageResponse<T>` |

**DB types come from ORM schema inference** — never hand-roll interfaces. Use `Pick<>` / `Omit<>` to derive subsets.

```ts
// BANNED
interface User { id: string; email: string; name: string }

// REQUIRED
import type { UserSelect } from "@sgai/shared/db"
type UserSummary = Pick<UserSelect, "id" | "email" | "name">
```

---

## 4. Code Patterns

### Early Returns

Flip the condition, return early, keep the happy path flat.

```ts
// BANNED                          // REQUIRED
if (user) {                        if (!user) return null
  if (user.isActive) {             if (!user.isActive) return null
    if (user.hasPermission) {      if (!user.hasPermission) return null
      return doThing(user)         return doThing(user)
    }
  }
}
return null
```

### Resolve Pattern (Kill Duplicate Paths)

### Helper Bloat (Banned)

Do not stack tiny helpers that only rename, normalize, or forward data once.

```ts
// BANNED
function normalizeMonitorDiffs(diffs?: Partial<ApiMonitorDiffs>): ApiMonitorDiffs {
  return {
    markdown: diffs?.markdown ?? [],
    json: diffs?.json ?? [],
  }
}

function countMonitorDiffs(diffs?: Partial<ApiMonitorDiffs>): number {
  const normalized = normalizeMonitorDiffs(diffs)
  return normalized.markdown.length + normalized.json.length
}

// REQUIRED
function countMonitorDiffs(diffs?: Partial<ApiMonitorDiffs>): number {
  return (diffs?.markdown?.length ?? 0) + (diffs?.json?.length ?? 0)
}
```

Rules:

- If a helper is called once, inline it unless it removes real complexity
- If a helper only adds defaults, rename indirection, or one property shuffle, inline it
- Do not create `normalize*`, `build*`, `create*`, `to*` wrappers unless they hide real branching or repeated logic
- A helper must pay rent: repeated use, meaningful branching, or domain logic worth naming

When branching logic feeds into the same response, extract a `resolve` function returning a unified shape.

```ts
async function resolve(url: string) {
  const cached = await cache.get(url)
  if (cached) return { content: cached, provider: "cache", cached: true }
  const result = await fetcher.fetch(url)
  await cache.set(url, result.content)
  return { content: result.content, provider: result.provider, cached: false }
}
```

### No Wrapper Abstractions

Keep modules generic. Call sites are explicit about keys.

```ts
// BANNED: redis.getHtml(hash)
// REQUIRED: redis.get(redis.KEYS.html(hash))
```

---

## 5. Functions

Small functions, small names, one thing. But don't abstract two obvious lines.

Refactor into a function when:
1. **Readability** — the function name explains a non-obvious implementation
2. **Redundancy** — the same logic appears in 3+ places

Three similar lines in one file is better than a premature abstraction.

**No over-engineering**: No factory-of-factories, no abstractions used < 3 times, no config objects for things that could be arguments, no feature flags for hypothetical futures.

**Component-local state/event logic stays inline**: If a reducer/helper exists only to support one component or one `useEvent(...)` handler, keep it inside the handler or component body. Do not extract tiny `isXEvent`, `applyXEvent`, `upsertX`, or `countX` helpers unless the exact logic is reused in 3+ places or the extracted name removes real complexity.

**Use clear verbs for mutations**: If a function changes state, name it like an action: `complete`, `pause`, `resume`, `flush`, `setStatus`. Do not hide writes behind vague names like `done`, `handle`, `process`, `finalize`, or enterprise sludge like `finishPendingJob` when a plain verb says the same thing.

**Reads and writes must be obvious from the name**: Read-only functions use `get*`/`list*`/`find*`. Mutating functions use a verb. Never make a name sound like a read when it writes, and never split one simple state transition across multiple vaguely named helpers.

**Do not re-declare existing shared shapes**: If an event, API payload, or domain object already has a shared type, import it and narrow it with `Extract<>`, indexed access, or helpers from the shared type. Do not hand-write local duplicates of existing contracts.

Do:
```ts
let event: Extract<ApiCrawlEvent, { type: "crawl.page.failed" | "crawl.page.skipped" }>
```

Don't:
```ts
let event:
	| { type: "crawl.page.failed"; crawlId: string; page: ApiCrawlPage; error: string }
	| { type: "crawl.page.skipped"; crawlId: string; page: ApiCrawlPage; reason: string }
```

---

## 6. Comments

Code says "what" — comments say "why". Plain `//` with tag and `@Claude` annotation.

**Tag format**: `// [TAG] @Claude <explanation>`

| Tag | When to use |
|---|---|
| `[NOTE]` | Non-obvious logic — race conditions, ordering dependencies, cache invalidation |
| `[TODO]` | Known improvement or missing piece |
| `[BUG]` | Known bug or workaround for upstream issue |
| `[REFACTOR]` | Tech debt — works but should be restructured |

```ts
// [NOTE] @Claude invalidate cache before DB write — stale reads on concurrent requests otherwise
await redis.del(redis.KEYS.task(taskId))
await db.update(tasks).set({ status: "completed" }).where(eq(tasks.id, taskId))

// [BUG] @Claude Readability returns empty string for SPAs — fall back to raw HTML
if (!extracted.length) return raw
```

**`@Claude` is mandatory** — team standard for AI context attribution and auditability.

### Strictly Forbidden

- Comments restating what the code does
- Comments without a tag (`[NOTE]`, `[TODO]`, `[BUG]`, `[REFACTOR]`)
- Tagged comments without `@Claude`
- JSDoc on internal functions (types ARE the docs)
- Commented-out code (git has history)
- `@param` / `@returns` except on shared package public API

---

## 7. Error Handling

### Backend

Define a base error class, extend per domain. Routes throw, middleware catches — no try/catch in route handlers. See `api.md` for error classes and framework wiring.

### Frontend

Server actions catch errors internally and return `{ data: null, error: "message" }`. Opposite of backend where you throw and let middleware catch.

### ActionResponse (frontend only)

Define once in `types/index.ts`. Used by **server actions and frontend code only** — API endpoints use HTTP status codes.

```ts
export type ActionResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string }
```

- **Server Actions** (`"use server"`): Always return `ActionResponse<T>`.
- **API Endpoints**: HTTP status codes + JSON body. Frontend callers wrap fetch results in `ActionResponse<T>`.
- **Pure backend projects**: You don't need `ActionResponse` — it's a frontend contract.

---

## 8. Types & Schemas

### Discriminated Unions

Use discriminated unions for polymorphic data. Pick a discriminator field and be consistent.

```ts
interface OrderBase { id: string; createdAt: string; status: OrderStatus }

interface PhysicalOrder extends OrderBase {
  type: "physical"
  shippingAddress: string
}

interface DigitalOrder extends OrderBase {
  type: "digital"
  downloadUrl: string
}

type Order = PhysicalOrder | DigitalOrder
```

### Event Types

Discriminate by `type` field with **dotted namespace**: `{domain}.{resource}.{verb}`.

**Standard verbs** (use these, nothing else):

| Verb | Meaning |
|---|---|
| `started` | Operation began |
| `completed` | Operation finished successfully |
| `failed` | Operation errored |
| `detected` | Something was observed (e.g. change detected) |
| `paused` | Resource was paused/suspended |

**Type naming**: `Api{Domain}Event` — no `Streaming` suffix. The transport (SSE, Redis pub/sub, webhook) is irrelevant to the type name.

```ts
type ApiOrderEvent =
  | { type: "order.payment.started" }
  | { type: "order.payment.completed"; transactionId: string }
  | { type: "order.result"; data: OrderResponse }
  | { type: "order.failed"; error: string; code: string }
```

**Webhook payloads** use the same `type` strings as events but wrap richer data in a `data` field. Defined as a separate discriminated union (`ApiWebhookPayload`).

```ts
type ApiWebhookPayload =
  | { type: "order.change.detected"; data: { ... } }
  | { type: "order.test"; data: { ... } }
```

### Provider Interfaces (Swappable Implementations)

When multiple things do the same job, define an interface contract. Each implementation satisfies the interface — swap them without touching consumers.

```ts
// types/index.ts
interface StorageProvider {
  name: string
  async upload(key: string, data: Buffer): Promise<string>
  async download(key: string): Promise<Buffer>
  async delete(key: string): Promise<void>
}

// lib/storage/s3.ts
const s3: StorageProvider = {
  name: "s3",
  async upload(key, data) { ... },
  async download(key) { ... },
  async delete(key) { ... },
}

// lib/storage/local.ts
const local: StorageProvider = {
  name: "local",
  async upload(key, data) { ... },
  async download(key) { ... },
  async delete(key) { ... },
}

// consumer — doesn't care which provider
async function saveReport(storage: StorageProvider, report: Buffer) {
  const url = await storage.upload("reports/latest.pdf", report)
  ...
}
```

**When to use**: 2+ implementations with the same shape. Classic examples:
- Storage backends (S3 vs local filesystem vs GCS)
- Notification channels (email vs Slack vs Discord)
- Cache layers (Redis vs in-memory vs SQLite)
- Queue drivers (SQS vs RabbitMQ vs in-process)

**When NOT to use**: one implementation with a hypothetical future second. YAGNI — inline it. Extract the interface when the second implementation actually exists.

**Type the constant, not just the function signatures.** Annotating `const x: MyInterface = { ... }` catches mismatches at definition, not at the call site 3 files away.

```ts
// BANNED — no contract, errors surface at call site
const s3 = {
  name: "s3",
  async upload(key: string, data: Buffer) { ... },
}

// REQUIRED — interface enforced at definition
const s3: StorageProvider = {
  name: "s3",
  async upload(key, data) { ... },
}
```

### Zod Schemas

Compose from small reusable sub-schemas. Infer types alongside.

```ts
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

const orderFilterSchema = paginationSchema.extend({
  status: z.enum(["pending", "completed", "failed"]).optional(),
})

type OrderFilter = z.infer<typeof orderFilterSchema>
```

Schema-inferred types (`z.infer<...>`) can stay co-located when used by a single file. When a second file needs it, move to `types/index.ts`.

---

## 9. Database (Drizzle ORM)

### Typed Query Builders

Always use Drizzle's typed methods. Raw `sql` only for Postgres functions Drizzle doesn't wrap.

```ts
// BANNED
db.select().from(schema.orders).where(sql`${schema.orders.userId} = ${userId}`)

// REQUIRED
import { and, desc, eq, gte } from "drizzle-orm"
db.select().from(schema.orders)
  .where(and(eq(schema.orders.userId, userId), gte(schema.orders.createdAt, since)))
  .orderBy(desc(schema.orders.createdAt))
```

**Raw `sql` OK for**: `date_trunc`, `COALESCE`, `CASE WHEN`, `NULLIF`, window functions, custom aggregates. Always check Drizzle docs first.

### Schema as Source of Truth

```ts
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id),
  status: text("status", { enum: ["pending", "completed", "failed"] }).notNull(),
  total: integer("total").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type OrderSelect = typeof orders.$inferSelect
export type OrderInsert = typeof orders.$inferInsert
```

### Table Imports (Namespace Required)

Always import table definitions via `import * as schema from "@sgai/shared/db"`. Access tables as `schema.tableName`. This avoids name clashes with domain modules (e.g. `cron` module vs `cron` table) and makes it instantly clear what's a table reference vs a function call.

```ts
// BANNED — bare table imports clash with domain modules
import { cron, subscriptions, apiKeys } from "@sgai/shared/db"

// REQUIRED — schema namespace
import * as schema from "@sgai/shared/db"

schema.cron.userId
schema.subscriptions.remainingCredits
schema.apiKeys.apiKey
```

Types and factory functions stay as named imports — only table constants use the namespace:

```ts
import * as schema from "@sgai/shared/db"
import type { ApiKeySelect, CronSelect } from "@sgai/shared/db"
import { createDb, type Database } from "@sgai/shared/db"
```

### Migrations

Always generate + migrate. Never `db:push` in production.

---

## 10. Logging (Pino)

Structured logging with pino. One `lib/logger.ts`, child loggers per module.

### Event Naming

The pino message string (second argument) is a namespaced event name using **dot-separated** segments: `{domain}.{action}.{status}` — same convention as streaming/event types (Section 8). One delimiter everywhere, no cognitive overhead. Data goes in the first argument object.

```ts
// BANNED — free-form prose messages
log.info({ count: 5 }, "finished processing batch")
log.error({ error: err.message }, "failed to save record")

// REQUIRED — namespaced event as message, data in object
log.info({ count: 5 }, "job.batch.completed")
log.error({ error: err.message }, "job.record.save.failed")

// No data? Message-only is fine
log.debug("job.parse.fallback")
```

### Naming Convention

`{domain}.{resource}.{action}` — always lowercase, dot-separated.

| Pattern | Examples |
|---|---|
| `{domain}.started` | `job.started`, `sync.started` |
| `{domain}.completed` | `job.completed`, `job.batch.completed` |
| `{domain}.failed` | `job.fetch.failed`, `job.record.save.failed` |
| `{domain}.{resource}.{action}` | `cron.schedule.created`, `queue.task.enqueued` |
| `{domain}.{action}.{status}` | `email.send.started`, `email.send.failed`, `cache.lookup.miss` |

### Rules

- **Event name is the pino message** (second arg) — `log.info({ data }, "domain.action.status")`
- **Child loggers** per module: `logger.child({ module: "email", recipient })`
- **No `console.log`** — use pino everywhere
- **Log level**: `debug` for internal flow details, `info` for operations completing, `warn` for recoverable issues, `error` for failures
- **pino-pretty** in dev, structured JSON in production

---

## 11. Environment Variables

Validate at startup with Zod. Crash on bad config — fail loud, fail early.

```ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export const env = envSchema.parse(process.env)
```

No `process.env.THING` scattered across files. One `env.ts`, one import. **Monorepos**: each app has its own `env.ts` — shared package does NOT validate env vars.

---

## 12. TypeScript Rules

- `strict: true` always
- Never `any` — use `unknown` + narrowing, generics, or proper types
- `as const` for literal objects/arrays (not for objects with function values)
- `satisfies` for type-checked literals that keep narrow type. Combine both when you need narrowing + type checking: `const X = { ... } as const satisfies Record<K, V>`
- Path aliases: `@/*` maps to source root
- `interface` for object shapes, `type` for unions/intersections

---

## 13. Linting, Formatting & Validation Flow

Biome replaces ESLint + Prettier. Single `biome.json` at project root:

- **Tabs** for indentation, **100 char line width**
- **Recommended rules** enabled
- **Import organization** enabled
- **Ignores**: `node_modules`, `dist`, `.next`, `drizzle`, `components/ui`

### Before Every Commit (MANDATORY)

```bash
bun run format      # Auto-fix formatting + imports
bun run lint        # Check for remaining errors
bunx tsc --noEmit   # TypeScript type checking
bun test            # Tests (if applicable)
```

No exceptions. Web also runs `bun run build` for production validation.

---

## 14. Testing Strategy

Tests live alongside source: `email.ts` → `email.test.ts`. Use Bun test (API) or Vitest (Next.js).

**Test**: Pure functions, API calls (mocked), business logic, edge cases.
**Don't test**: UI rendering, DB queries directly, third-party library behavior.

Mock at the boundary (API calls, external services). Use factories for complex test objects:

```ts
function makeUser(overrides?: Partial<UserSelect>): UserSelect {
  return { id: "test-id", email: "test@example.com", name: "Test User", ...overrides }
}
```

---

## 15. What NOT to Do

- **No `any`** — `unknown`, generics, or proper types
- **No raw `sql`** for WHERE/ORDER — use ORM typed builders
- **No hand-written types outside `types/index.ts`** — exceptions: ORM-inferred, schema-inferred (single consumer), component-local props
- **No functions in constants files**
- **No manual DB type definitions** — derive from ORM schema
- **No JSDoc on internal functions** — types are the docs
- **No commented-out code** — git has history
- **No module name in function name** — `tokens.count()` not `tokens.countTokens()`
- **No wrapper abstractions** — generic modules, explicit call sites
- **No premature abstractions** — not used 3+ times → inline it
- **No extracted one-off UI event reducers/helpers** — keep tiny component-only event/state updates inline
- **No scattered `process.env`** — one `env.ts`
- **No `db:push` in production** — generate + migrate
