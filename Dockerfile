# ── Builder ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Dev (hot-reload) ─────────────────────────────────────────────────────────
FROM node:22-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm ci

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

# ── Production ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/main"]
