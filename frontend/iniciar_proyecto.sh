#!/bin/bash

# ========================================================================
# 🚀 Script de Inicio Rápido - Sistema RBAC CENATE
# ========================================================================

echo "🎯 Sistema RBAC CENATE - Inicio Rápido"
echo "========================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar directorio
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la carpeta frontend"
    exit 1
fi

echo -e "${BLUE}📦 Verificando dependencias...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules no encontrado. Instalando...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencias OK${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Verificando archivos del sistema RBAC...${NC}"

# Verificar archivos clave
archivos=(
    "src/hooks/usePermissions.js"
    "src/components/security/ProtectedRoute.jsx"
    "src/components/security/PermissionGate.jsx"
    "src/components/DynamicSidebar.jsx"
    "src/components/AppLayout.jsx"
    "src/utils/rbacUtils.js"
    "src/App.js"
)

todos_ok=true
for archivo in "${archivos[@]}"; do
    if [ -f "$archivo" ]; then
        echo -e "${GREEN}✅ $archivo${NC}"
    else
        echo -e "${RED}❌ $archivo no encontrado${NC}"
        todos_ok=false
    fi
done

echo ""

if [ "$todos_ok" = true ]; then
    echo -e "${GREEN}✅ Todos los archivos del sistema RBAC están presentes${NC}"
else
    echo -e "${YELLOW}⚠️  Algunos archivos faltan${NC}"
fi

echo ""
echo -e "${BLUE}📝 Información del Sistema:${NC}"
echo -e "  • Frontend: React con RBAC"
echo -e "  • Backend esperado: http://localhost:8080"
echo -e "  • Documentación: SISTEMA_RBAC_RESTAURADO.md"

echo ""
echo -e "${GREEN}🚀 ¿Quieres iniciar el servidor de desarrollo? (y/n)${NC}"
read -r respuesta

if [ "$respuesta" = "y" ] || [ "$respuesta" = "Y" ] || [ "$respuesta" = "yes" ]; then
    echo ""
    echo -e "${BLUE}🌐 Iniciando servidor en http://localhost:3000${NC}"
    echo -e "${YELLOW}⚠️  Asegúrate de que el backend esté corriendo en http://localhost:8080${NC}"
    echo ""
    npm start
else
    echo ""
    echo -e "${BLUE}👋 Para iniciar manualmente, ejecuta: ${YELLOW}npm start${NC}"
fi
