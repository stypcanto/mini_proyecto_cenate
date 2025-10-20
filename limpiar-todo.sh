#!/bin/bash

# ========================================================================
# 🔥 LIMPIEZA TOTAL - ELIMINAR TODO LO INNECESARIO
# ========================================================================

echo "========================================================================"
echo "🔥 LIMPIEZA COMPLETA DEL PROYECTO"
echo "========================================================================"
echo ""

cd "$(dirname "$0")/frontend" || exit 1

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🗑️  Eliminando carpeta 'ejemplos'...${NC}"
if [ -d "ejemplos" ]; then
    rm -rf ejemplos
    echo -e "${GREEN}✅ Eliminada: ejemplos/${NC}"
else
    echo -e "${YELLOW}⚠️  No existe: ejemplos/${NC}"
fi

echo ""
echo -e "${YELLOW}🗑️  Eliminando carpetas duplicadas en src/components...${NC}"

cd src/components || exit 1

if [ -d "layout 2" ]; then
    rm -rf "layout 2"
    echo -e "${GREEN}✅ Eliminada: layout 2${NC}"
fi

if [ -d "modals 2" ]; then
    rm -rf "modals 2"
    echo -e "${GREEN}✅ Eliminada: modals 2${NC}"
fi

cd ../..

echo ""
echo -e "${YELLOW}🗑️  Eliminando archivos innecesarios...${NC}"

if [ -f "src/diagnostico-login.js" ]; then
    rm -f "src/diagnostico-login.js"
    echo -e "${GREEN}✅ Eliminado: diagnostico-login.js${NC}"
fi

echo ""
echo -e "${GREEN}========================================================================${NC}"
echo -e "${GREEN}✅ LIMPIEZA COMPLETADA${NC}"
echo -e "${GREEN}========================================================================${NC}"
echo ""

echo -e "${YELLOW}📋 Ahora ejecuta:${NC}"
echo ""
echo "  npm start"
echo ""
echo -e "${GREEN}Y accede a: http://localhost:3000/auth/login${NC}"
echo ""
