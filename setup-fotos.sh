#!/bin/bash

# ========================================================================
# 🚀 Script para solucionar el problema de fotos de perfil
# ========================================================================

echo "========================================================================="
echo "📸 CONFIGURACIÓN DE FOTOS DE PERFIL - CENATE"
echo "========================================================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

# Función para verificar si Docker está corriendo
check_docker() {
    if ! docker ps > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker no está corriendo. Inicia Docker Desktop primero.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker está corriendo${NC}"
}

# Función para verificar el directorio de fotos
check_foto_directory() {
    if [ -d "./uploads/fotos" ]; then
        echo -e "${GREEN}✅ Directorio de fotos existe${NC}"
        echo "   Ruta: $(pwd)/uploads/fotos"
        echo "   Archivos: $(ls -1 ./uploads/fotos 2>/dev/null | wc -l)"
    else
        echo -e "${YELLOW}⚠️  Creando directorio de fotos...${NC}"
        mkdir -p ./uploads/fotos
        chmod 755 ./uploads/fotos
        echo -e "${GREEN}✅ Directorio creado${NC}"
    fi
}

# Función para reconstruir Docker
rebuild_docker() {
    echo ""
    echo "========================================================================="
    echo "🔨 RECONSTRUYENDO DOCKER"
    echo "========================================================================="
    echo ""
    
    echo "1. Deteniendo contenedores..."
    docker compose down
    
    echo ""
    echo "2. Reconstruyendo backend..."
    docker compose build backend --no-cache
    
    echo ""
    echo "3. Levantando servicios..."
    docker compose up -d
    
    echo ""
    echo -e "${GREEN}✅ Docker reconstruido exitosamente${NC}"
}

# Función para verificar el endpoint
check_endpoint() {
    echo ""
    echo "========================================================================="
    echo "🔍 VERIFICANDO ENDPOINT DE FOTOS"
    echo "========================================================================="
    echo ""
    
    sleep 5  # Esperar a que el backend inicie
    
    echo "Probando: http://localhost:8080/api/personal/foto/default-profile.png"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/personal/foto/default-profile.png)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Endpoint funcionando correctamente (HTTP 200)${NC}"
    elif [ "$response" = "404" ]; then
        echo -e "${YELLOW}⚠️  Endpoint responde pero imagen no encontrada (HTTP 404)${NC}"
        echo "   Esto es normal si no has agregado fotos aún"
    else
        echo -e "${RED}❌ Endpoint no responde correctamente (HTTP $response)${NC}"
        echo "   Revisa los logs con: docker compose logs backend"
    fi
}

# Función para mostrar instrucciones finales
show_instructions() {
    echo ""
    echo "========================================================================="
    echo "📋 PRÓXIMOS PASOS"
    echo "========================================================================="
    echo ""
    echo "Para que las fotos funcionen completamente:"
    echo ""
    echo "1. 📸 Agrega fotos al directorio:"
    echo "   cp /ruta/tus/fotos/* uploads/fotos/"
    echo ""
    echo "2. 🗄️  Actualiza la base de datos para que foto_pers contenga solo el nombre:"
    echo "   UPDATE dim_personal_cnt SET foto_pers = 'usuario.jpg' WHERE ..."
    echo ""
    echo "3. 🌐 Las fotos estarán disponibles en:"
    echo "   http://localhost:8080/api/personal/foto/[nombre-archivo]"
    echo ""
    echo "4. 📚 Lee la documentación completa en:"
    echo "   SOLUCION_FOTOS_PERFIL.md"
    echo ""
    echo "========================================================================="
    echo -e "${GREEN}✨ Configuración completada!${NC}"
    echo "========================================================================="
    echo ""
}

# MAIN
main() {
    echo "Iniciando configuración..."
    echo ""
    
    # Verificaciones
    check_docker
    check_foto_directory
    
    # Preguntar si desea reconstruir Docker
    echo ""
    read -p "¿Deseas reconstruir Docker ahora? (s/n): " choice
    
    if [ "$choice" = "s" ] || [ "$choice" = "S" ]; then
        rebuild_docker
        check_endpoint
    else
        echo ""
        echo -e "${YELLOW}⚠️  Recuerda reconstruir Docker manualmente con:${NC}"
        echo "   docker compose down"
        echo "   docker compose build backend --no-cache"
        echo "   docker compose up -d"
    fi
    
    # Mostrar instrucciones finales
    show_instructions
}

# Ejecutar
main
