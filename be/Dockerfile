# ---------- Build stage ----------
FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---------- Runtime stage ----------
FROM node:22-slim AS runtime
ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app

RUN groupadd -r nodejs && useradd -r -g nodejs nest

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

RUN mkdir -p /app/uploads && chown -R nest:nodejs /app

USER nest
EXPOSE 3001

# Apply migrations, then start the API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
