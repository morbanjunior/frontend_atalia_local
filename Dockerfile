# --- deps ---
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- build ---
FROM node:18-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# No copiamos .env a la imagen; injéctalo en runtime con --env-file si hace falta
RUN npm run build

# --- runtime ---
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Instala solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Artefactos necesarios para next start
COPY --from=builder /app/.next ./.next
# Si NO tienes carpeta public/, comenta la siguiente línea
COPY --from=builder /app/public ./public
# Si realmente tienes next.config.js y lo necesitas en runtime, descomenta:
# COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["npx","next","start","-p","3000"]
