#!/bin/bash

# ========================================================================
# 🔍 Script de Verificación Pre-Build - Frontend CENATE
# ========================================================================
# Verifica que todos los imports y dependencias estén correctos
# antes de hacer el build de producción
# ========================================================================

echo "🔍 Verificando proyecto frontend..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo "Ejecuta este script desde el directorio frontend/"
    exit 1
fi

echo "✅ Directorio correcto"

# Verificar node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules no encontrado. Ejecutando npm install...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al instalar dependencias${NC}"
        exit 1
    fi
fi

echo "✅ Dependencias instaladas"

# Verificar archivos críticos
echo ""
echo "📁 Verificando archivos críticos..."

FILES=(
    "src/api/personal.js"
    "src/api/permisosApi.js"
    "src/pages/admin/AdminPersonalPanel.jsx"
    "src/components/ui/PersonalDetailCard.jsx"
    "src/hooks/useAuth.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file - NO ENCONTRADO"
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Se encontraron $ERRORS archivos faltantes${NC}"
    exit 1
fi

# Verificar imports problemáticos
echo ""
echo "🔎 Buscando imports problemáticos..."

# Buscar getPermisosByRol
if grep -r "getPermisosByRol" src/ --include="*.jsx" --include="*.js" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} getPermisosByRol encontrado (debe estar exportado en permisosApi.js)"
    
    # Verificar que esté exportado
    if grep "export.*getPermisosByRol" src/api/permisosApi.js > /dev/null 2>&1; then
        echo -e "    ${GREEN}✓${NC} Función exportada correctamente"
    else
        echo -e "    ${RED}✗${NC} Función NO exportada en permisosApi.js"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Buscar updatePermiso
if grep -r "updatePermiso" src/ --include="*.jsx" --include="*.js" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} updatePermiso encontrado (debe estar exportado en permisosApi.js)"
    
    # Verificar que esté exportado
    if grep "export.*updatePermiso" src/api/permisosApi.js > /dev/null 2>&1; then
        echo -e "    ${GREEN}✓${NC} Función exportada correctamente"
    else
        echo -e "    ${RED}✗${NC} Función NO exportada en permisosApi.js"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Buscar getDetallePersonal
if grep "getDetallePersonal" src/pages/admin/AdminPersonalPanel.jsx > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} getDetallePersonal encontrado en AdminPersonalPanel.jsx"
    
    # Verificar que esté exportado en personal.js
    if grep "export.*getDetallePersonal" src/api/personal.js > /dev/null 2>&1; then
        echo -e "    ${GREEN}✓${NC} Función exportada correctamente en personal.js"
    else
        echo -e "    ${RED}✗${NC} Función NO exportada en personal.js"
        ERRORS=$((ERRORS + 1))
    fi
fi

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Se encontraron $ERRORS problemas de imports${NC}"
    exit 1
fi

# Verificar sintaxis con ESLint (si está instalado)
echo ""
echo "🔧 Verificando sintaxis..."

if command -v eslint &> /dev/null; then
    echo "Ejecutando ESLint..."
    npx eslint src/ --ext .js,.jsx --max-warnings 0 2>&1 | head -20
else
    echo -e "${YELLOW}⚠️  ESLint no instalado, saltando verificación de sintaxis${NC}"
fi

# Intentar compilar
echo ""
echo "🏗️  Intentando compilar..."
echo ""

npm run build 2>&1 | tee build-output.log

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ ¡BUILD EXITOSO!${NC}"
    echo ""
    echo "El build de producción se generó correctamente en:"
    echo "  📦 ./build/"
    echo ""
    echo "Ahora puedes:"
    echo "  • Ejecutar: docker-compose up --build"
    echo "  • O servir localmente: npx serve -s build"
    exit 0
else
    echo ""
    echo -e "${RED}❌ BUILD FALLÓ${NC}"
    echo ""
    echo "Revisa los errores anteriores o el archivo:"
    echo "  📄 build-output.log"
    echo ""
    echo "Errores comunes:"
    echo "  • Imports faltantes"
    echo "  • Funciones no exportadas"
    echo "  • Sintaxis JSX incorrecta"
    exit 1
fi
