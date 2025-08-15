# frontend/Dockerfile
FROM node:18-alpine AS builder

# Crear y definir directorio
WORKDIR /app

# Copiar dependencias y lock
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar todo y hacer build
COPY . .

# 👇 Asegúrate de que el .env esté en el mismo contexto del COPY
COPY .env .env

RUN npm run build

# Imagen final
FROM node:18-alpine AS runner
WORKDIR /app

# Copiar los artefactos de build
COPY --from=builder /app ./

# Exponer puerto
EXPOSE 3000

# Ejecutar en producción
CMD ["npm", "run", "start"]
