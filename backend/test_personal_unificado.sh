#!/bin/bash

# ============================================================================
# SCRIPT DE PRUEBA: Endpoints del Sistema Unificado de Personal
# ============================================================================
# Descripción: Prueba todos los endpoints del sistema unificado
# Uso: ./test_personal_unificado.sh [TOKEN]
# ============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
API_URL="${API_URL:-http://localhost:8080/api}"
TOKEN="${1:-}"

# Si no se proporciona token, pedirlo
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}⚠️  No se proporcionó token. Ingrese el token JWT:${NC}"
    read -r TOKEN
fi

# Función para hacer peticiones
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📋 $description${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Endpoint: ${method} ${endpoint}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            "${API_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${API_URL}${endpoint}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ ERROR (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
}

# ============================================================================
# PRUEBAS DE ENDPOINTS
# ============================================================================

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   PRUEBAS DEL SISTEMA UNIFICADO DE PERSONAL - CENATE          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================================
# 1. ESTADÍSTICAS
# ============================================================================

api_call "GET" "/personal-unificado/estadisticas" "" \
    "Obtener estadísticas generales del personal"

# ============================================================================
# 2. LISTAR TODO EL PERSONAL
# ============================================================================

api_call "GET" "/personal-unificado" "" \
    "Obtener TODO el personal (CENATE + Externos)"

# ============================================================================
# 3. FILTRAR POR TIPO DE PERSONAL
# ============================================================================

api_call "GET" "/personal-unificado/filtrar?tipoPersonal=CENATE" "" \
    "Filtrar solo personal CENATE"

api_call "GET" "/personal-unificado/filtrar?tipoPersonal=EXTERNO" "" \
    "Filtrar solo personal EXTERNO"

# ============================================================================
# 4. ATAJOS CONVENIENTES
# ============================================================================

api_call "GET" "/personal-unificado/cenate" "" \
    "Atajo: Solo personal CENATE"

api_call "GET" "/personal-unificado/externos" "" \
    "Atajo: Solo personal externo"

# ============================================================================
# 5. FILTRAR POR MES DE CUMPLEAÑOS
# ============================================================================

# Mes actual
current_month=$(date +%-m)
api_call "GET" "/personal-unificado/cumpleanos/${current_month}" "" \
    "Personal que cumple años este mes (${current_month})"

api_call "GET" "/personal-unificado/filtrar?mesCumpleanos=6" "" \
    "Personal que cumple años en junio"

# ============================================================================
# 6. FILTRAR POR ESTADO
# ============================================================================

api_call "GET" "/personal-unificado/filtrar?estado=ACTIVO" "" \
    "Filtrar personal ACTIVO"

api_call "GET" "/personal-unificado/filtrar?estado=INACTIVO" "" \
    "Filtrar personal INACTIVO"

api_call "GET" "/personal-unificado/filtrar?tipoPersonal=CENATE&estado=A" "" \
    "Personal CENATE activo (estado=A)"

# ============================================================================
# 7. FILTRAR POR ÁREA (solo CENATE)
# ============================================================================

api_call "GET" "/personal-unificado/filtrar?tipoPersonal=CENATE&idArea=1" "" \
    "Personal CENATE del área 1"

# ============================================================================
# 8. BÚSQUEDA LIBRE
# ============================================================================

api_call "GET" "/personal-unificado/buscar?q=garcia" "" \
    "Buscar personal con término 'garcia'"

api_call "GET" "/personal-unificado/filtrar?searchTerm=75" "" \
    "Buscar personal con documento que contenga '75'"

# ============================================================================
# 9. FILTROS COMBINADOS
# ============================================================================

api_call "GET" "/personal-unificado/filtrar?tipoPersonal=CENATE&estado=A&idArea=1" "" \
    "Combinado: CENATE activos del área 1"

api_call "GET" "/personal-unificado/filtrar?tipoPersonal=EXTERNO&mesCumpleanos=12" "" \
    "Combinado: Externos que cumplen años en diciembre"

api_call "GET" "/personal-unificado/filtrar?estado=ACTIVO&searchTerm=maria" "" \
    "Combinado: Personal activo con nombre 'maria'"

# ============================================================================
# 10. ENDPOINTS DE IPRESS
# ============================================================================

api_call "GET" "/ipress" "" \
    "Listar todas las IPRESS"

api_call "GET" "/ipress/activas" "" \
    "Listar solo IPRESS activas"

api_call "GET" "/ipress/buscar?q=hospital" "" \
    "Buscar IPRESS con término 'hospital'"

# ============================================================================
# 11. ENDPOINTS DE PERSONAL EXTERNO (con IPRESS)
# ============================================================================

api_call "GET" "/personal-externo" "" \
    "Listar todo el personal externo"

# Si tienes un ID específico de personal externo, pruébalo aquí
# api_call "GET" "/personal-externo/1" "" \
#     "Obtener personal externo por ID"

# ============================================================================
# 12. ENDPOINTS DE PERSONAL CENATE
# ============================================================================

api_call "GET" "/personal" "" \
    "Listar todo el personal CENATE"

# ============================================================================
# RESUMEN
# ============================================================================

echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                   PRUEBAS COMPLETADAS                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}📊 Endpoints probados:${NC}"
echo "  ✓ Estadísticas"
echo "  ✓ Listado completo"
echo "  ✓ Filtros por tipo"
echo "  ✓ Filtros por mes de cumpleaños"
echo "  ✓ Filtros por estado"
echo "  ✓ Filtros por área"
echo "  ✓ Búsqueda libre"
echo "  ✓ Filtros combinados"
echo "  ✓ IPRESS"
echo "  ✓ Personal externo"
echo "  ✓ Personal CENATE"

echo -e "\n${BLUE}💡 Sugerencias:${NC}"
echo "  - Revisa los resultados arriba para verificar que los datos sean correctos"
echo "  - Si hay errores, verifica que:"
echo "    • El servidor esté corriendo en $API_URL"
echo "    • El token JWT sea válido"
echo "    • Las migraciones SQL se hayan ejecutado"
echo "    • Existan datos de prueba en la base de datos"

echo -e "\n${GREEN}✅ Para pruebas adicionales, usa Postman o cURL directamente${NC}"
