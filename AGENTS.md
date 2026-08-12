<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# meet-flight — Project Guardrails

> Working name (not final). Update `package.json`, `vercel.json`, and this file when the real name is chosen.

## Commands

| Task             | Command          |
| ---------------- | ---------------- |
| Dev server       | `pnpm dev`       |
| Build            | `pnpm build`     |
| Lint             | `pnpm lint`      |
| Typecheck        | `pnpm typecheck` |
| Run tests        | `pnpm test`      |
| DB push (schema) | `pnpm db:push`   |
| DB seed airports | `pnpm db:seed`   |
| Drizzle Studio   | `pnpm db:studio` |

## Tech Stack

- **Next.js** (App Router) + TypeScript (strict)
- **Tailwind CSS v4** + shadcn/ui pattern (components in `src/components/ui/`)
- **Drizzle ORM** + libSQL (local SQLite dev, Turso prod)
- **pnpm** package manager
- **Vitest** for unit tests
- Deploy to **Vercel** (serverless)

## Architecture Rules

1. **Import alias**: always use `@/*` (maps to `src/*`).
2. **No barrel files** except for provider or UI index files explicitly designed as such.
3. **Provider abstraction**: all flight API calls go through `FlightSearchProvider` interface (`src/lib/providers/types.ts`). Never call a provider directly outside `src/lib/providers/`.
4. **Config**: all env vars are read in `src/lib/config.ts` once. Other modules import from there — never access `process.env` directly elsewhere.
5. **DB access**: all queries go through Drizzle client (`src/lib/db/index.ts`). No raw SQL outside seed scripts.
6. **Time budget**: API route handlers that resolve flight pairs must respect a 7-second soft deadline (Vercel free-tier 10s timeout). Never block on all pairs in a single request.
7. **ID generation**: use `nanoid(12)` for all PKs except `airports.code` and `exchange_rates.currency` (natural keys).

## Code Conventions

- Use named exports for components and utilities.
- Use `cn()` helper (`src/lib/utils.ts`) for conditional class merging.
- Files in `src/components/ui/` follow shadcn/ui conventions (forwarded refs, variant props).
- API route handlers return `NextResponse.json()` with appropriate status codes.
- All prices stored as strings with currency code; conversion to EUR happens in `src/lib/search/currency.ts`.
- Tests live in `src/tests/` and mirror the `src/lib/` structure.

## Environment

- `.env.example` is committed (template). `.env.local` is gitignored (actual values).
- Required for dev: `TURSO_DATABASE_URL=file:local.db` (all others have defaults).
- `FLIGHT_PROVIDER=mock` by default. Real provider (`amadeus`) is future work.

## Testing

- Unit tests for pure logic: selector, overlap, currency, mock provider.
- Run `pnpm test` before committing.
- Use `pnpm typecheck` to verify TypeScript correctness.

## Suppression Policy

- **No** `eslint-disable` or `@ts-ignore` without a comment explaining why.
- **No** `any` type — use `unknown` and narrow.
