# ---------------------------
# 🧩 Etapa 1: Build React (CRA) con Node 18
# ---------------------------
FROM node:18-alpine AS build
WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY . .

# Establecer variable de entorno (CRA usa REACT_APP_API_URL)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# 🚀 Build para producción (CRA genera /build)
RUN npm run build

# ---------------------------
# 🌐 Etapa 2: Servidor Nginx
# ---------------------------
FROM nginx:alpine

# Copiar el build generado
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración de Nginx personalizada
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]