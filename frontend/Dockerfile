# ---------------------------
# Etapa 1: Build React con Node 18 (LTS, estable con react-scripts)
# ---------------------------
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Necesario para algunas versiones de react-scripts + Webpack 5
ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm run build

# ---------------------------
# Etapa 2: Servir con Nginx
# ---------------------------
FROM nginx:alpine

# Copiamos el build de React
COPY --from=build /app/build /usr/share/nginx/html

# Copiamos config personalizada de Nginx
COPY ./default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
