#!/bin/bash

# ========================================================================
# 🧹 SCRIPT DE LIMPIEZA - SISTEMA CENATE
# ========================================================================
# Este script elimina archivos duplicados y conflictivos
# ========================================================================

echo "========================================================================"
echo "🧹 LIMPIEZA DEL PROYECTO - SISTEMA CENATE"
echo "========================================================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Ir al directorio del proyecto
cd "$(dirname "$0")/frontend/src" || exit 1

echo -e "${YELLOW}📂 Eliminando carpetas duplicadas...${NC}"

# Eliminar carpetas duplicadas
if [ -d "components/layout 2" ]; then
    rm -rf "components/layout 2"
    echo -e "${GREEN}✅ Eliminado: components/layout 2${NC}"
fi

if [ -d "components/modals 2" ]; then
    rm -rf "components/modals 2"
    echo -e "${GREEN}✅ Eliminado: components/modals 2${NC}"
fi

# Eliminar archivo de diagnóstico
if [ -f "diagnostico-login.js" ]; then
    rm -f "diagnostico-login.js"
    echo -e "${GREEN}✅ Eliminado: diagnostico-login.js${NC}"
fi

echo ""
echo -e "${GREEN}========================================================================${NC}"
echo -e "${GREEN}✅ LIMPIEZA COMPLETADA${NC}"
echo -e "${GREEN}========================================================================${NC}"
echo ""

echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo ""
echo "1. Reinicia el servidor de desarrollo:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "2. Accede al login:"
echo "   http://localhost:3000/auth/login"
echo ""
echo "3. Usa las credenciales:"
echo "   Usuario: scantor"
echo "   Contraseña: admin123"
echo ""
echo -e "${GREEN}========================================================================${NC}"
