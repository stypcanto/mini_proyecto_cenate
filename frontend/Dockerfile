# ========================================================================
# 🧩 FRONTEND - CENATE (React CRA + Nginx)
# ------------------------------------------------------------------------
# • Build de React con Node 18
# • Servidor Nginx optimizado para producción
# • Soluciona:
#    - Imágenes que no se mostraban (alias + permisos)
#    - Proxy correcto al backend
#    - Compatibilidad ARM64 (Mac M1/M2)
# ========================================================================

# ================================
# ⚙️ Etapa 1 - Build de React App
# ================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar dependencias primero (mejor caché)
COPY package*.json ./

# Limpiar cache de npm
RUN npm cache clean --force

# Instalar dependencias principales (incluyendo react-is)
RUN npm install --legacy-peer-deps

# Instalar versiones compatibles de ajv y ajv-keywords (por CRA)
RUN npm install ajv@6 ajv-keywords@3 --save-dev --legacy-peer-deps

# Asegurar que react-is esté instalado (requerido por recharts)
RUN npm install react-is --legacy-peer-deps || true

# Copiar el resto del código fuente
COPY . .

# ✅ Asegurar entorno de producción para build
ENV NODE_ENV=production

# 🔑 CRITICAL: Configurar variable de entorno para el build
# Esto hace que React use /api (proxy de nginx) en lugar de http://localhost:8080/api
ENV REACT_APP_API_URL=/api
ENV REACT_APP_ENV=production

# 🔨 Compilar la aplicación React para producción
RUN npm run build

# ================================
# 🚀 Etapa 2 - Servidor Nginx
# ================================
FROM nginx:alpine

# 🧹 Eliminar configuración por defecto
RUN rm -rf /etc/nginx/conf.d/*

# 📦 Copiar build generado por React
COPY --from=build /app/build /usr/share/nginx/html

# 🖼️ Copiar las imágenes del directorio public/images manualmente
RUN mkdir -p /usr/share/nginx/html/images
COPY ./public/images/. /usr/share/nginx/html/images/

# ✅ Dar permisos de lectura a las imágenes (evita errores 403)
RUN chmod -R 755 /usr/share/nginx/html/images

# ⚙️ Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 🌎 Variables de entorno
ENV TZ=America/Lima
ENV NODE_ENV=production

# 🔥 Limpieza y diagnóstico opcional
RUN rm -rf /var/cache/apk/* /tmp/*

# Exponer puerto
EXPOSE 80

# 🚀 Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]