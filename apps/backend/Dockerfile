# GlotMate Backend (Fastify API) — Coolify imajı.
# BUILD BAĞLAMI = REPO KÖKÜ (npm workspace + @glotmate/contracts kökte çözülür):
#   docker build -f apps/backend/Dockerfile .
# Bağlamı daraltan dosya: apps/backend/Dockerfile.dockerignore
#
# Ortam değişkenleri ÇALIŞMA anında okunur (Coolify'da build variable GEREKMEZ);
# eksik/geçersizse süreç açılmaz (src/config/env.ts).
# Migration ve seed imajda KOŞMAZ — bugünkü gibi elle, doğrudan bağlantıdan (5432).

FROM node:22-slim AS base

# --- Derleme: dev bağımlılıklarıyla (tsc) -----------------------------------
FROM base AS build
WORKDIR /repo
# Lockfile bütün workspace'leri tanır; manifestleri yerinde olmayan workspace
# `npm ci`'yi "lock senkron değil" diye düşürür — hepsinin package.json'ı gelir.
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/admin/package.json apps/admin/
COPY apps/web/package.json apps/web/
COPY apps/backend/package.json apps/backend/
COPY apps/mobile/package.json apps/mobile/
# Kök `postinstall` contracts'ı derler → kaynağı kurulumdan ÖNCE burada olmalı.
COPY packages/contracts packages/contracts
RUN npm ci --workspace @glotmate/backend --workspace @glotmate/contracts
COPY apps/backend/tsconfig.json apps/backend/
COPY apps/backend/src apps/backend/src
RUN npm run build --workspace packages/contracts \
 && npm run build --workspace apps/backend

# --- Çalışma bağımlılıkları: dev'siz ----------------------------------------
FROM base AS prod-deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/admin/package.json apps/admin/
COPY apps/web/package.json apps/web/
COPY apps/backend/package.json apps/backend/
COPY apps/mobile/package.json apps/mobile/
COPY packages/contracts/package.json packages/contracts/
# --ignore-scripts: kök `postinstall` tsc ister, tsc dev bağımlılığıdır.
# contracts'ın derlenmiş hâli aşağıda build aşamasından gelir.
RUN npm ci --omit=dev --ignore-scripts --workspace @glotmate/backend --workspace @glotmate/contracts

# --- Çalışma imajı ----------------------------------------------------------
FROM base AS run
ENV NODE_ENV=production
ENV PORT=6560
# Coolify'da süreç Traefik'in arkasındadır (1 vekil). Önünde Cloudflare vekili de
# varsa Coolify'da TRUST_PROXY=2 ver — bkz. src/config/env.ts.
ENV TRUST_PROXY=1
WORKDIR /app
# Manifestler + node_modules (workspace bağı node_modules/@glotmate/contracts → packages/contracts)
COPY --from=prod-deps --chown=node:node /repo ./
COPY --from=build --chown=node:node /repo/packages/contracts/dist packages/contracts/dist
COPY --from=build --chown=node:node /repo/apps/backend/dist apps/backend/dist
# /docs (Swagger UI) bunu dist'in bir üstünde arar.
COPY --chown=node:node apps/backend/openapi.yaml apps/backend/
WORKDIR /app/apps/backend
USER node
EXPOSE 6560
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "dist/server.js"]
