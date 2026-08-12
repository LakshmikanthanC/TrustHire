# ---------- Dependencies stage ----------
FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- Build stage ----------
FROM node:22-slim AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:22-slim AS runner
ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

CMD ["npm", "run", "start"]
