#!/bin/bash

# 🚀 Script de Instalación Automática del Sistema RBAC
# Autor: Claude AI
# Descripción: Configura automáticamente el sistema RBAC en tu proyecto

set -e

echo "🔐 =========================================="
echo "   INSTALACIÓN SISTEMA RBAC - CENATE"
echo "==========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$BASE_DIR/src"

echo -e "${BLUE}📂 Directorio del proyecto:${NC} $BASE_DIR"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "$BASE_DIR/package.json" ]; then
    echo -e "${RED}❌ Error: package.json no encontrado${NC}"
    echo "   Por favor ejecuta este script desde el directorio frontend/"
    exit 1
fi

echo -e "${GREEN}✅ Proyecto React encontrado${NC}"
echo ""

# 1. Verificar estructura de carpetas
echo -e "${BLUE}📁 Verificando estructura de carpetas...${NC}"

REQUIRED_DIRS=(
    "$SRC_DIR/hooks"
    "$SRC_DIR/components/ProtectedRoute"
    "$SRC_DIR/utils"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅${NC} $dir"
    else
        echo -e "${YELLOW}📁 Creando${NC} $dir"
        mkdir -p "$dir"
    fi
done

echo ""

# 2. Verificar archivos creados
echo -e "${BLUE}📄 Verificando archivos del sistema RBAC...${NC}"

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 ${YELLOW}(faltante)${NC}"
        return 1
    fi
}

REQUIRED_FILES=(
    "$SRC_DIR/hooks/usePermissions.js"
    "$SRC_DIR/components/ProtectedRoute/ProtectedRoute.js"
    "$SRC_DIR/components/DynamicSidebar.js"
    "$SRC_DIR/components/AppLayout.js"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if ! check_file "$file"; then
        ((MISSING_FILES++))
    fi
done

echo ""

if [ $MISSING_FILES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Advertencia: ${MISSING_FILES} archivo(s) faltante(s)${NC}"
    echo -e "${YELLOW}   Por favor copia los archivos desde los artifacts de Claude${NC}"
    echo ""
fi

# 3. Verificar dependencias
echo -e "${BLUE}📦 Verificando dependencias npm...${NC}"

REQUIRED_PACKAGES=(
    "react-router-dom"
    "react-hot-toast"
    "lucide-react"
)

for pkg in "${REQUIRED_PACKAGES[@]}"; do
    if grep -q "\"$pkg\"" "$BASE_DIR/package.json"; then
        echo -e "${GREEN}✅${NC} $pkg"
    else
        echo -e "${RED}❌${NC} $pkg ${YELLOW}(no instalado)${NC}"
    fi
done

echo ""

# 4. Crear archivo de utilidades si no existe
UTILS_FILE="$SRC_DIR/utils/rbacUtils.js"
if [ ! -f "$UTILS_FILE" ]; then
    echo -e "${YELLOW}📝 Creando archivo de utilidades...${NC}"
    cat > "$UTILS_FILE" << 'EOF'
/**
 * Utilidades RBAC - Generado automáticamente
 * Por favor reemplaza con el contenido del artifact 'utils_rbac'
 */

export const ACCIONES = {
  VER: 'ver',
  CREAR: 'crear',
  EDITAR: 'editar',
  ELIMINAR: 'eliminar',
  EXPORTAR: 'exportar',
  APROBAR: 'aprobar'
};

export const MODULOS = {
  CITAS: 'Gestión de Citas',
  COORDINADORES: 'Gestión de Coordinadores',
  EXTERNO: 'Gestión de Personal Externo',
  LINEAMIENTOS: 'Lineamientos IPRESS',
  MEDICO: 'Panel Médico'
};

export default { ACCIONES, MODULOS };
EOF
    echo -e "${GREEN}✅ Archivo de utilidades creado${NC}"
else
    echo -e "${GREEN}✅ Archivo de utilidades ya existe${NC}"
fi

echo ""

# 5. Crear páginas de ejemplo si no existen
echo -e "${BLUE}📄 Verificando páginas...${NC}"

PAGES_DIR="$SRC_DIR/pages"
mkdir -p "$PAGES_DIR"

EXAMPLE_PAGES=(
    "CitasMedico.js"
    "PacientesMedico.js"
    "IndicadoresMedico.js"
    "DashboardCitas.js"
    "AgendaMedica.js"
    "DashboardCoordinador.js"
    "AgendaCoordinador.js"
    "DashboardExterno.js"
    "ReportesExterno.js"
    "DashboardLineamientos.js"
    "RegistroLineamientos.js"
)

PAGES_CREATED=0
for page in "${EXAMPLE_PAGES[@]}"; do
    PAGE_FILE="$PAGES_DIR/$page"
    if [ ! -f "$PAGE_FILE" ]; then
        echo -e "${YELLOW}📝 Creando${NC} $page"
        PAGE_NAME="${page%.js}"
        
        cat > "$PAGE_FILE" << EOF
import React from 'react';
import AppLayout, { ActionToolbar } from '../components/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';

// TODO: Actualizar esta ruta según tu backend
const CURRENT_PATH = '/roles/pendiente/$PAGE_NAME';

const $PAGE_NAME = () => {
  return (
    <AppLayout currentPath={CURRENT_PATH} title="$PAGE_NAME">
      <ActionToolbar
        currentPath={CURRENT_PATH}
        onCrear={() => console.log('Crear')}
        onExportar={() => console.log('Exportar')}
      />

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">$PAGE_NAME</h2>
        <p className="text-slate-600">
          Esta es una página de ejemplo. Por favor implementa tu lógica aquí.
        </p>
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ <strong>TODO:</strong> Actualiza CURRENT_PATH con la ruta correcta de tu API
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default () => (
  <ProtectedRoute requiredPath={CURRENT_PATH} requiredAction="ver">
    <$PAGE_NAME />
  </ProtectedRoute>
);
EOF
        ((PAGES_CREATED++))
    else
        echo -e "${GREEN}✅${NC} $page"
    fi
done

if [ $PAGES_CREATED -gt 0 ]; then
    echo -e "${GREEN}✅ Creadas $PAGES_CREATED páginas de ejemplo${NC}"
fi

echo ""

# 6. Crear script de test
TEST_SCRIPT="$BASE_DIR/test_rbac_api.sh"
echo -e "${BLUE}🧪 Creando script de test...${NC}"

cat > "$TEST_SCRIPT" << 'EOF'
#!/bin/bash

# Script de test para API RBAC
# Asegúrate de tener un token válido

BASE_URL="${BASE_URL:-http://localhost:8080}"
JWT_TOKEN="${JWT_TOKEN:-}"

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ Error: Define la variable JWT_TOKEN"
    echo "   Ejemplo: export JWT_TOKEN='tu_token_aqui'"
    exit 1
fi

echo "🧪 Testing RBAC API..."
echo "Base URL: $BASE_URL"
echo ""

# Health Check
echo "1️⃣ Health Check"
curl -s -X GET "$BASE_URL/api/permisos/health" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .

echo ""
echo "2️⃣ Permisos de Usuario 1"
curl -s -X GET "$BASE_URL/api/permisos/usuario/1" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '. | length'

echo ""
echo "3️⃣ Módulos de Usuario 1"
curl -s -X GET "$BASE_URL/api/permisos/usuario/1/modulos" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .

echo ""
echo "✅ Tests completados"
EOF

chmod +x "$TEST_SCRIPT"
echo -e "${GREEN}✅ Script de test creado: test_rbac_api.sh${NC}"

echo ""

# 7. Resumen final
echo -e "${BLUE}=========================================="
echo "   RESUMEN DE INSTALACIÓN"
echo "==========================================${NC}"
echo ""

if [ $MISSING_FILES -eq 0 ]; then
    echo -e "${GREEN}✅ Todos los archivos principales están presentes${NC}"
else
    echo -e "${YELLOW}⚠️  ${MISSING_FILES} archivo(s) principal(es) faltante(s)${NC}"
fi

if [ $PAGES_CREATED -gt 0 ]; then
    echo -e "${GREEN}✅ ${PAGES_CREATED} página(s) de ejemplo creadas${NC}"
fi

echo -e "${GREEN}✅ Script de test creado${NC}"
echo ""

# 8. Próximos pasos
echo -e "${BLUE}📋 PRÓXIMOS PASOS:${NC}"
echo ""
echo "1. Verifica que todos los archivos estén presentes:"
echo -e "   ${YELLOW}npm start${NC}"
echo ""
echo "2. Si hay archivos faltantes, cópialos desde los artifacts de Claude:"
echo "   - usePermissions.js"
echo "   - ProtectedRoute.js"
echo "   - DynamicSidebar.js"
echo "   - AppLayout.js"
echo ""
echo "3. Actualiza App.js con las nuevas rutas"
echo ""
echo "4. Prueba el sistema:"
echo -e "   ${YELLOW}export JWT_TOKEN='tu_token'${NC}"
echo -e "   ${YELLOW}./test_rbac_api.sh${NC}"
echo ""
echo -e "${GREEN}🎉 Instalación completada!${NC}"
echo ""
echo "Documentación completa en: IMPLEMENTACION_RBAC_COMPLETA.md"
echo ""
