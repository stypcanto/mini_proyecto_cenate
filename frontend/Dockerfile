# ================================
# ⚡ Multi-stage Dockerfile para React (CRA) + Nginx
# Compatible con ARM64 (Mac M1/M2) y AMD64
# ================================

# ---------------------------
# 🧩 Etapa 1: Construcción del proyecto React
# ---------------------------
FROM node:18-alpine AS build
WORKDIR /app

# Copiar dependencias primero para aprovechar caché
COPY package*.json ./

# ✅ Instalar dependencias (más flexible que npm ci)
# Usamos --legacy-peer-deps para evitar conflictos de versiones
RUN npm install --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Variable para React App (usada por CRA)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# 🚀 Compilar la build de producción
RUN npm run build

# ---------------------------
# 🌐 Etapa 2: Servidor Nginx
# ---------------------------
FROM nginx:alpine

# Limpiar configuración por defecto y usar la personalizada
RUN rm -rf /etc/nginx/conf.d/*
COPY default.conf /etc/nginx/conf.d/default.conf

# Copiar build generado desde la etapa anterior
COPY --from=build /app/build /usr/share/nginx/html

# Exponer puerto 80 para el frontend
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]