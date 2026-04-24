# lament-api

NestJS REST API for Lament — an anonymous organisation review platform.

**Stack:** NestJS 11 · TypeScript · PostgreSQL 17 · Prisma 7 · Docker  
**Port:** 3001

---

## Local dev (no Docker for API)

```bash
# 1. Start Postgres
docker compose up db -d

# 2. Install deps
npm install

# 3. Copy env and fill in values
cp .env.example .env

# 4. Run migrations + seed
npx prisma migrate dev --name init
npm run db:seed

# 5. Start dev server (hot-reload)
npm run start:dev
```

API available at `http://localhost:3001`.  
Swagger docs at `http://localhost:3001/docs`.

---

## Docker dev (full stack in containers)

```bash
docker compose up --build
```

Source code is volume-mounted into the container — file changes trigger hot-reload via `nest start --watch`.

---

## Production deploy (VPS)

### Prerequisites
- Docker + Docker Compose v2 installed on the VPS
- A `.env.production` file (see `.env.example`) placed next to the compose files

### Steps

```bash
# 1. Clone the repo
git clone <repo-url> lament-api && cd lament-api

# 2. Create production env file
cp .env.example .env.production
# edit .env.production — set DATABASE_URL, FRONTEND_URL, PORT, etc.

# 3. Build and start
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 4. Run migrations (first deploy only)
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  exec api npx prisma migrate deploy
```

### Updating

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Useful commands

```bash
# View logs
docker compose logs -f api

# Run a migration after schema change
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  exec api npx prisma migrate deploy

# Health check
curl http://localhost:3001/health
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `FRONTEND_URL` | ✅ | Allowed CORS origin (e.g. `https://lament.example.com`) |
| `PORT` | ✅ | API port (default `3001`) |
| `NODE_ENV` | ✅ | `development` or `production` |
| `POSTGRES_USER` | prod only | Postgres superuser (used by db service) |
| `POSTGRES_PASSWORD` | prod only | Postgres password |
| `POSTGRES_DB` | prod only | Postgres database name |

---

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/organizations` | List orgs (search, industry, pagination) |
| GET | `/organizations/top` | Top 5 orgs by avg rating |
| GET | `/organizations/:id` | Single org |
| POST | `/organizations` | Create org |
| GET | `/reviews` | Latest review feed (all orgs) |
| GET | `/reviews/org/:orgId` | Reviews for one org |
| POST | `/reviews` | Submit anonymous review |
| POST | `/reviews/:id/react` | Like or dislike a review |
| DELETE | `/reviews/:id/react` | Undo a reaction |
| POST | `/voice` | Upload voice note, returns `{ url }` |
