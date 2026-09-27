# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Kangan Finance — image de production pour apps/web.
# Construite depuis la racine du monorepo :
#   docker build -f apps/web/Dockerfile -t kangan-web .
# ---------------------------------------------------------------------------

FROM node:20-slim AS base
WORKDIR /repo
ENV NEXT_TELEMETRY_DISABLED=1

# --- Dépendances (toutes, y compris devDependencies pour le build) ---------
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/payments/package.json packages/payments/package.json
# `npm ci` refuse parfois de "sauter" un optionalDependency dont la
# plateforme ne correspond pas (ex. lightningcss-android-arm64, tiré par
# apps/mobile) et échoue tout le build. `npm install` reste fidèle au
# lockfile mais gère correctement ce cas — cf. section Docker de docs/DEPLOYMENT.md.
RUN npm install --workspace=@kangan/web --workspace=@kangan/shared --workspace=@kangan/ui --workspace=@kangan/payments --include-workspace-root

# --- Build ----------------------------------------------------------------
FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/web apps/web
COPY packages/shared packages/shared
COPY packages/ui packages/ui
COPY packages/payments packages/payments
ARG NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_PAYMENT_MODE=simulator
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_PAYMENT_MODE=$NEXT_PUBLIC_PAYMENT_MODE
RUN npm run build --workspace=@kangan/web

# --- Exécution --------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/packages ./packages
COPY --from=build /repo/apps/web ./apps/web

USER nextjs
WORKDIR /repo/apps/web
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start"]
