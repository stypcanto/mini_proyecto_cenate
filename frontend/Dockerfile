# ================================
# ⚡ Multi-stage Dockerfile para React + Nginx (CRA)
# Compatible con ARM y AMD64
# ================================

# ---------------------------
# 🧩 Etapa 1: Build React
# ---------------------------
FROM node:18-alpine AS build
WORKDIR /app

# Copiar dependencias (aprovecha caché)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Variable para React App
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# 🚀 Compilar build de producción
RUN npm run build

# ---------------------------
# 🌐 Etapa 2: Servidor Nginx
# ---------------------------
FROM nginx:alpine

# Eliminar configuración por defecto y usar la tuya
RUN rm -rf /etc/nginx/conf.d/*
COPY default.conf /etc/nginx/conf.d/default.conf

# Copiar build generado (CRA → /build)
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
