#!/bin/bash

# 🚀 COMANDOS RÁPIDOS - SISTEMA RBAC CENATE
# Script de comandos útiles para desarrollo

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

show_menu() {
    clear
    echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   COMANDOS RÁPIDOS - SISTEMA RBAC    ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
    echo ""
    echo "Selecciona una opción:"
    echo ""
    echo "  1) 🔍 Verificar estructura de archivos"
    echo "  2) 🧪 Probar endpoints del backend"
    echo "  3) 🚀 Iniciar desarrollo (frontend)"
    echo "  4) 🏗️  Build para producción"
    echo "  5) 📊 Ver estado de permisos en localStorage"
    echo "  6) 🧹 Limpiar node_modules y reinstalar"
    echo "  7) 📝 Ver logs recientes"
    echo "  8) 🔧 Ejecutar install_rbac.sh"
    echo "  9) 📚 Abrir documentación"
    echo "  0) ❌ Salir"
    echo ""
    echo -n "Opción: "
}

verify_structure() {
    echo -e "\n${BLUE}🔍 Verificando estructura de archivos...${NC}\n"
    
    FILES=(
        "src/hooks/usePermissions.js"
        "src/components/ProtectedRoute/ProtectedRoute.js"
        "src/components/DynamicSidebar.js"
        "src/components/AppLayout.js"
        "src/utils/rbacUtils.js"
    )
    
    for file in "${FILES[@]}"; do
        if [ -f "$file" ]; then
            echo -e "${GREEN}✅${NC} $file"
        else
            echo -e "${RED}❌${NC} $file ${YELLOW}(faltante)${NC}"
        fi
    done
    
    echo ""
    read -p "Presiona Enter para continuar..."
}

test_backend() {
    echo -e "\n${BLUE}🧪 Probando endpoints del backend...${NC}\n"
    
    read -p "Ingresa tu JWT_TOKEN: " token
    
    if [ -z "$token" ]; then
        echo -e "${RED}❌ Token vacío${NC}"
        read -p "Presiona Enter para continuar..."
        return
    fi
    
    BASE_URL="${BASE_URL:-http://localhost:8080}"
    
    echo -e "\n${YELLOW}1. Health Check${NC}"
    curl -s -X GET "$BASE_URL/api/permisos/health" \
        -H "Authorization: Bearer $token" | jq . || echo "Error"
    
    echo -e "\n${YELLOW}2. Permisos de Usuario 1${NC}"
    curl -s -X GET "$BASE_URL/api/permisos/usuario/1" \
        -H "Authorization: Bearer $token" | jq '. | length' || echo "Error"
    
    echo -e "\n${YELLOW}3. Módulos${NC}"
    curl -s -X GET "$BASE_URL/api/permisos/usuario/1/modulos" \
        -H "Authorization: Bearer $token" | jq . || echo "Error"
    
    echo ""
    read -p "Presiona Enter para continuar..."
}

start_dev() {
    echo -e "\n${GREEN}🚀 Iniciando servidor de desarrollo...${NC}\n"
    npm start
}

build_prod() {
    echo -e "\n${BLUE}🏗️  Compilando para producción...${NC}\n"
    npm run build
    echo -e "\n${GREEN}✅ Build completado${NC}"
    echo "Archivos en: build/"
    read -p "Presiona Enter para continuar..."
}

check_localstorage() {
    echo -e "\n${BLUE}📊 Instrucciones para ver localStorage${NC}\n"
    echo "1. Abre tu navegador en http://localhost:3000"
    echo "2. Presiona F12 para abrir DevTools"
    echo "3. Ve a la pestaña 'Console'"
    echo "4. Ejecuta estos comandos:"
    echo ""
    echo -e "${YELLOW}   localStorage.getItem('token')${NC}"
    echo -e "${YELLOW}   JSON.parse(localStorage.getItem('user'))${NC}"
    echo ""
    read -p "Presiona Enter para continuar..."
}

clean_install() {
    echo -e "\n${YELLOW}🧹 Limpiando node_modules...${NC}\n"
    rm -rf node_modules package-lock.json
    echo -e "${GREEN}✅ Limpieza completada${NC}\n"
    echo -e "${BLUE}📦 Instalando dependencias...${NC}\n"
    npm install
    echo -e "\n${GREEN}✅ Instalación completada${NC}"
    read -p "Presiona Enter para continuar..."
}

show_logs() {
    echo -e "\n${BLUE}📝 Ver logs${NC}\n"
    echo "1) Ver últimas 50 líneas de npm-debug.log"
    echo "2) Ver logs del navegador (abrir DevTools manualmente)"
    echo "3) Volver"
    echo ""
    read -p "Opción: " log_option
    
    case $log_option in
        1)
            if [ -f "npm-debug.log" ]; then
                tail -n 50 npm-debug.log
            else
                echo "No hay npm-debug.log"
            fi
            ;;
        2)
            echo "Abre DevTools (F12) en tu navegador y ve a la pestaña Console"
            ;;
    esac
    read -p "Presiona Enter para continuar..."
}

run_install_script() {
    echo -e "\n${BLUE}🔧 Ejecutando install_rbac.sh...${NC}\n"
    if [ -f "install_rbac.sh" ]; then
        chmod +x install_rbac.sh
        ./install_rbac.sh
    else
        echo -e "${RED}❌ install_rbac.sh no encontrado${NC}"
    fi
    read -p "Presiona Enter para continuar..."
}

open_docs() {
    echo -e "\n${BLUE}📚 Documentación disponible${NC}\n"
    echo "1) IMPLEMENTACION_RBAC_COMPLETA.md - Guía completa"
    echo "2) RESUMEN_FINAL.md - Resumen ejecutivo"
    echo ""
    
    if command -v open &> /dev/null; then
        read -p "¿Abrir RESUMEN_FINAL.md? (s/n): " answer
        if [ "$answer" = "s" ]; then
            open RESUMEN_FINAL.md 2>/dev/null || cat RESUMEN_FINAL.md
        fi
    else
        echo "Para ver la documentación, abre los archivos .md con tu editor"
    fi
    read -p "Presiona Enter para continuar..."
}

# Menú principal
while true; do
    show_menu
    read option
    
    case $option in
        1) verify_structure ;;
        2) test_backend ;;
        3) start_dev ;;
        4) build_prod ;;
        5) check_localstorage ;;
        6) clean_install ;;
        7) show_logs ;;
        8) run_install_script ;;
        9) open_docs ;;
        0) 
            echo -e "\n${GREEN}¡Hasta luego! 👋${NC}\n"
            exit 0
            ;;
        *)
            echo -e "${RED}Opción inválida${NC}"
            sleep 1
            ;;
    esac
done
