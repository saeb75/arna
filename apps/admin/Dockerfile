# GlotMate Admin — Coolify imajı.
# BUILD BAĞLAMI = REPO KÖKÜ (npm workspace + @glotmate/contracts kökte çözülür):
#   docker build -f apps/admin/Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=... \
#     --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
#     --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... .
# Bağlamı daraltan dosya: apps/admin/Dockerfile.dockerignore

FROM node:22-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1

# --- Bağımlılıklar: yalnız admin + contracts (backend/mobil kurulmaz) -------
FROM base AS deps
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
RUN npm ci --workspace @glotmate/admin --workspace @glotmate/contracts

# --- Derleme ---------------------------------------------------------------
FROM deps AS build
# NEXT_PUBLIC_* derleme anında istemci paketine GÖMÜLÜR; çalışma anında verilen
# değer hiçbir şeyi değiştirmez. Coolify'da "Build Variable" olarak işaretlenir.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN test -n "$NEXT_PUBLIC_API_URL" \
 && test -n "$NEXT_PUBLIC_SUPABASE_URL" \
 && test -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
 || (echo "HATA: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY build argümanı olarak verilmeli" >&2; exit 1)
COPY apps/admin apps/admin
# `public/` repoda boş (git boş klasör taşımaz) — son aşamadaki COPY düşmesin.
RUN mkdir -p apps/admin/public \
 && npm run build --workspace packages/contracts \
 && npm run build --workspace apps/admin

# --- Çalışma imajı: yalnız standalone çıktı --------------------------------
FROM base AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Docker HOSTNAME'i konteyner kimliğine kurar; Next ona bağlanırsa dışarıdan erişilmez.
ENV HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /repo/apps/admin/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build --chown=node:node /repo/apps/admin/public ./apps/admin/public
USER node
EXPOSE 3000
CMD ["node", "apps/admin/server.js"]
