# ============================================================
# ⚡ Multi-stage Dockerfile para React (CRA / Vite) + Nginx
# Optimizado para builds rápidos, reproducibles y portables (Mac M1/M2 compatible)
# ============================================================

# ---------------------------
# 🧩 Etapa 1: Build del frontend
# ---------------------------
FROM --platform=linux/amd64 node:18-alpine AS build
WORKDIR /app

# ------------------------------------------------------------
# ✅ Copiar solo lo necesario para aprovechar la cache
# ------------------------------------------------------------
COPY package.json package-lock.json ./

# ------------------------------------------------------------
# ⚙️ Instalar dependencias con fallback inteligente
# Si npm ci falla (por lock desactualizado), ejecuta npm install
# ------------------------------------------------------------
RUN npm ci --prefer-offline --no-audit --progress=false || \
    (echo "⚠️ npm ci falló, usando npm install..." && \
     npm install --legacy-peer-deps --no-audit --progress=false)

# ------------------------------------------------------------
# 📦 Copiar el código fuente del proyecto
# ------------------------------------------------------------
COPY . .

# ------------------------------------------------------------
# 🔧 Configurar variables de entorno (React)
# ------------------------------------------------------------
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# ------------------------------------------------------------
# 🚀 Compilar el frontend para producción
# ------------------------------------------------------------
RUN npm run build

# ---------------------------
# 🌐 Etapa 2: Servidor Nginx
# ---------------------------
FROM --platform=linux/amd64 nginx:alpine

# ------------------------------------------------------------
# 🧹 Limpiar configuración por defecto y aplicar la nuestra
# ------------------------------------------------------------
RUN rm -rf /etc/nginx/conf.d/*
COPY default.conf /etc/nginx/conf.d/default.conf

# ------------------------------------------------------------
# 📁 Copiar build generado desde la etapa anterior
# ------------------------------------------------------------
COPY --from=build /app/build /usr/share/nginx/html

# ------------------------------------------------------------
# 🌎 Configuración final
# ------------------------------------------------------------
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]