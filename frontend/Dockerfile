# ========================================================================
# 🧩 FRONTEND - CENATE (React CRA + Nginx)
# ------------------------------------------------------------------------
# Etapas:
#   1️⃣ Build de React (Node 18)
#   2️⃣ Servidor Nginx (ligero y seguro)
# ------------------------------------------------------------------------
# Compatible con Apple Silicon (ARM64) y Linux AMD64
# ========================================================================

# ================================
# ⚙️ Etapa 1 - Build React App
# ================================
FROM node:18-alpine AS build

WORKDIR /app

# 🧠 Copiar solo dependencias primero (mejor caché)
COPY package*.json ./

# ⚡ Instalar dependencias principales
RUN npm install --legacy-peer-deps

# ⚙️ Instalar versiones compatibles de ajv y ajv-keywords
RUN npm install ajv@6 ajv-keywords@3 --save-dev --legacy-peer-deps

# 📁 Copiar el resto del código fuente
COPY . .

# 🏗️ Compilar el frontend para producción
RUN npm run build

# ================================
# ⚙️ Etapa 2 - Servir con Nginx
# ================================
FROM nginx:alpine

# 🧹 Eliminar configuración por defecto
RUN rm -rf /etc/nginx/conf.d/*

# 📦 Copiar los archivos del build de React
COPY --from=build /app/build /usr/share/nginx/html

# ⚙️ Copiar configuración personalizada del proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 🌍 Variables opcionales
ENV TZ=America/Lima

EXPOSE 80

# 🚀 Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]