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
FROM node:18-alpine AS build

WORKDIR /app

# Copiar dependencias primero (mejor caché)
COPY package*.json ./

# Instalar dependencias principales
RUN npm install --legacy-peer-deps

# Instalar versiones compatibles de ajv y ajv-keywords (por CRA)
RUN npm install ajv@6 ajv-keywords@3 --save-dev --legacy-peer-deps

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación React para producción
RUN npm run build


# ================================
# 🚀 Etapa 2 - Servidor Nginx
# ================================
FROM nginx:alpine

# Eliminar configuración por defecto
RUN rm -rf /etc/nginx/conf.d/*

# Copiar build generado por React
COPY --from=build /app/build /usr/share/nginx/html

# 🖼️ Copiar las imágenes del directorio public/images manualmente
RUN mkdir -p /usr/share/nginx/html/images
COPY ./public/images/. /usr/share/nginx/html/images/

# ✅ Dar permisos de lectura a las imágenes (necesario para evitar 403 Forbidden)
RUN chmod -R 755 /usr/share/nginx/html/images

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Variables de entorno opcionales
ENV TZ=America/Lima

# Exponer puerto
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]