# Lament API — Backend Build Plan

**Stack:** NestJS · TypeScript · PostgreSQL · Prisma ORM · Docker  
**Port:** 3001  
**Auth:** None — fully anonymous system  

---

## Data Models

```
Organization  id, name, logo, industry, createdAt
Review        id, orgId, username, avatar, avatarColor, rating, heading, body,
              emoji?, voiceUrl?, likes, dislikes, createdAt
Reaction      id, reviewId, type (LIKE|DISLIKE), fingerprint, createdAt
```

**Fingerprint** — anonymous device token (hashed IP + user-agent) used only to
prevent double-voting. Never exposed in API responses.

---

## Phase 1 — Database & ORM Setup ✅

- [x] **1.1** Add PostgreSQL + Prisma
  - Installed `@prisma/client`, `prisma`, `@prisma/adapter-pg`, `pg`
  - `DATABASE_URL` configured in `.env` (template in `.env.example`)
  - `PrismaService` + `PrismaModule` (`@Global`) in `src/prisma/`
  - **Prisma 7 note:** `url` removed from schema datasource; `prisma.config.ts` handles CLI URL; `PrismaService` uses `PrismaPg` adapter with `pg.Pool`

- [x] **1.2** Write Prisma schema (`prisma/schema.prisma`)
  - `Organization` model (id, name, logo?, industry, createdAt)
  - `Review` model with `@relation` to Organization
  - `Reaction` model (LIKE / DISLIKE enum, fingerprint field, unique on `[reviewId, fingerprint]`)
  - `Industry` enum: TECH, FINANCE, HEALTHCARE, EDUCATION, RETAIL, MEDIA, GOVERNMENT, ENERGY, MANUFACTURING, OTHER
  - `ReactionType` enum: LIKE, DISLIKE

- [x] **1.3** Seed database
  - 12 organizations + 30 reviews in `prisma/seed.ts`
  - Run with `npm run db:seed`

- [x] **1.4** Add `docker-compose.yml` dev service for Postgres
  - `db` service: `postgres:17-alpine`, healthcheck via `pg_isready`
  - `api` service: `depends_on db`, `DATABASE_URL` injected
  - Named volume `postgres_data` for persistence

---

## Phase 2 — Organizations Module

Endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/organizations` | List all orgs (search, industry filter, pagination) |
| GET | `/organizations/:id` | Single org detail |
| POST | `/organizations` | Create a new org (called from review flow "Add New Org") |
| GET | `/organizations/top` | Top 5 orgs by avg rating (right panel feed) |

- [x] **2.1** `OrganizationsModule` — controller, service, DTOs
  - `CreateOrganizationDto` — name (required), industry (enum), logo (optional URL)
  - `ListOrganizationsQuery` — search (string?), industry (enum?), page, limit
- [x] **2.2** Query logic in service
  - `findAll` — `WHERE name ILIKE %search%` + optional industry filter, order by name
  - `findTop` — `ORDER BY averageRating DESC LIMIT 5`
  - `averageRating` and `reviewCount` are computed columns via Prisma aggregations
- [x] **2.3** Validation — `class-validator` + `ValidationPipe` globally

---

## Phase 3 — Reviews Module

Endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/reviews` | Latest feed (all orgs, paginated) |
| GET | `/reviews/org/:orgId` | Reviews for one org (sort: latest/top/lowest) |
| POST | `/reviews` | Submit a new anonymous review |

- [x] **3.1** `ReviewsModule` — controller, service, DTOs
  - `CreateReviewDto` — orgId, rating (1–5), heading (max 80), body (max 500), emoji?, voiceUrl?
  - Server generates: username, avatar, avatarColor (port logic from `lib/avatar.ts`)
- [x] **3.2** Anonymous identity generation
  - `lib/anonymous-identity.ts` — same 20-name pool + color hash as frontend
  - Called at submission time; result stored on the Review row
- [x] **3.3** Sort logic
  - `latest` → `ORDER BY createdAt DESC`
  - `top` → `ORDER BY rating DESC, createdAt DESC`
  - `lowest` → `ORDER BY rating ASC, createdAt DESC`
- [x] **3.4** Pagination — cursor-based (use `createdAt` as cursor) for infinite scroll

---

## Phase 4 — Reactions Module

Endpoints:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/reviews/:id/react` | Like or dislike a review |
| DELETE | `/reviews/:id/react` | Undo a reaction |

- [x] **4.1** `ReactionsModule` — controller + service
  - `CreateReactionDto` — type: `LIKE | DISLIKE`
  - Fingerprint derived server-side from `req.ip + req.headers['user-agent']` → SHA-256 hash
- [x] **4.2** Idempotency — upsert by `(reviewId, fingerprint)`, toggle logic
  - Same fingerprint + same type → undo (delete reaction, decrement count)
  - Same fingerprint + different type → switch (update type, swap counts)
  - New fingerprint → create (increment count)
- [x] **4.3** `likes` / `dislikes` on the `Review` row kept in sync via Prisma transactions

---

## Phase 5 — Voice Notes Module

Endpoint:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/voice` | Upload voice note, returns public URL |

- [x] **5.1** Multer integration — `@nestjs/platform-express`, in-memory storage (max 5 MB, audio/* only)
- [x] **5.2** Storage — save to disk (`/uploads/voice/`) in dev; swap to object storage (S3/R2/Minio) in prod via a `StorageService` abstraction
- [x] **5.3** Return `{ url }` — frontend POSTs this before submitting the review, then passes the URL in `CreateReviewDto.voiceUrl`

---

## Phase 6 — Cross-Cutting Concerns ✅

- [x] **6.1** Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`
- [x] **6.2** CORS — allow origin `http://localhost:3000` (dev) and the production frontend domain (env var)
- [x] **6.3** Helmet — basic HTTP security headers
- [x] **6.4** Rate limiting — `@nestjs/throttler`, 60 req/min per IP globally; 5 req/min on POST `/reviews`
- [x] **6.5** Swagger / OpenAPI — `@nestjs/swagger`, mounted at `/docs` in non-production environments
- [x] **6.6** Health check — `GET /health` returns `{ status: 'ok' }` (used by Docker health check)
- [x] **6.7** Environment config — `@nestjs/config` with a typed `ConfigService`, `.env.example` committed

---

## Phase 7 — Production Docker Hardening ✅

- [x] **7.1** Multi-stage Dockerfile already in place (builder + production stages)
- [x] **7.2** Add `HEALTHCHECK` instruction to Dockerfile using `GET /health`
- [x] **7.3** `docker-compose.yml` dev profile (with hot-reload volume mount + Postgres service)
- [x] **7.4** `docker-compose.prod.yml` override (no volume mount, env from `.env.production`)
- [x] **7.5** Document VPS deploy steps in `README.md` (pull image → `docker compose up -d`)

---

## API Base URL Convention

```
Development:  http://localhost:3001
Production:   https://api.lament.now  (or your VPS domain/subdomain)
```

Frontend environment variable: `NEXT_PUBLIC_API_URL`

---

## File Structure (target)

```
src/
  organizations/
    organizations.controller.ts
    organizations.service.ts
    dto/
      create-organization.dto.ts
      list-organizations.dto.ts
    organizations.module.ts
  reviews/
    reviews.controller.ts
    reviews.service.ts
    dto/
      create-review.dto.ts
      list-reviews.dto.ts
    reviews.module.ts
  reactions/
    reactions.controller.ts
    reactions.service.ts
    dto/
      create-reaction.dto.ts
    reactions.module.ts
  voice/
    voice.controller.ts
    voice.service.ts
    voice.module.ts
  prisma/
    prisma.service.ts
    prisma.module.ts
  lib/
    anonymous-identity.ts
  config/
    config.module.ts
  app.module.ts
  main.ts

prisma/
  schema.prisma
  seed.ts

docker-compose.yml         ← dev (api + postgres)
docker-compose.prod.yml    ← prod override
Dockerfile
.env.example
```
