# lament-api

NestJS backend for Lament — an anonymous organization review platform.

**Stack:** NestJS 11 · TypeScript · PostgreSQL · Prisma 7 · Docker  
**Port:** 3001  
**Auth:** None — fully anonymous system

---

## Key architectural notes

### Prisma 7 setup (breaking change from v5/v6)
- The `url = env(DATABASE_URL)` field is removed from `prisma/schema.prisma`
- `prisma.config.ts` at the project root holds the URL for CLI commands (migrate, studio, generate)
- `PrismaService` instantiates `PrismaClient` with a `PrismaPg` driver adapter (requires `pg.Pool`)
- Any new raw `PrismaClient` usage (e.g. scripts, tests) must also pass an adapter

### PrismaModule
- Declared `@Global()` — import `PrismaModule` once in `AppModule`, then inject `PrismaService` directly anywhere without re-importing the module

### Anonymous identity
- Reviews have no auth. `username`, `avatar` (first letter), and `avatarColor` are generated server-side at submission time from a 20-name pool (Phase 3: `src/lib/anonymous-identity.ts`)
- `fingerprint` on `Reaction` = SHA-256 of `ip + user-agent` — used only for dedup, never exposed in responses

---

## Dev workflow

```bash
# Start Postgres
docker compose up db -d

# First-time setup
npx prisma migrate dev --name init
npm run db:seed

# Run API
npm run start:dev
```

## Useful commands

| Command | What it does |
|---|---|
| `npm run db:seed` | Seed 12 orgs + 30 reviews |
| `npx prisma migrate dev` | Create and apply a new migration |
| `npx prisma studio` | Open Prisma Studio GUI |
| `npx prisma generate` | Regenerate client after schema changes |
| `npm run start:dev` | NestJS dev server with watch |
| `npm run build` | Compile TypeScript to `dist/` |

---

## Rules

- After completing any phase or sub-task, update `PLAN.md` to mark the relevant checkboxes (`[ ]` → `[x]`) and phase status.

---

## Build phases

| Phase | Status | Description |
|---|---|---|
| 1 — DB & ORM | ✅ Done | Prisma schema, PrismaService, seed, Docker Postgres |
| 2 — Organizations | ✅ Done | CRUD + top-5 aggregation endpoint |
| 3 — Reviews | ✅ Done | Anonymous reviews, sort, cursor pagination |
| 4 — Reactions | ⬜ | Like/dislike with fingerprint dedup |
| 5 — Voice Notes | ⬜ | Multer upload, StorageService abstraction |
| 6 — Cross-cutting | ⬜ | Validation, CORS, Helmet, throttle, Swagger, health |
| 7 — Docker hardening | ⬜ | Multi-stage prod build, HEALTHCHECK, deploy docs |

---

## File structure (current)

```
src/
  prisma/
    prisma.service.ts   ← PrismaClient with PrismaPg adapter
    prisma.module.ts    ← @Global() module
  app.module.ts
  main.ts

prisma/
  schema.prisma         ← Organization, Review, Reaction models
  seed.ts               ← 12 orgs + 30 reviews

prisma.config.ts        ← Prisma 7 CLI config (datasource URL)
docker-compose.yml      ← api + postgres:17-alpine
.env                    ← DATABASE_URL (not committed)
.env.example            ← template (committed)
```
