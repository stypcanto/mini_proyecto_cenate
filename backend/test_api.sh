#!/bin/bash

# ============================================
# Script de Testing - Sistema de Login CENATE
# ============================================

echo "🧪 Iniciando Tests del Sistema de Login"
echo "========================================"
echo ""

# Configuración
API_URL="http://localhost:8080"
SUCCESS_COUNT=0
FAIL_COUNT=0

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para test exitoso
test_success() {
    echo -e "${GREEN}✅ PASS${NC} - $1"
    ((SUCCESS_COUNT++))
}

# Función para test fallido
test_fail() {
    echo -e "${RED}❌ FAIL${NC} - $1"
    ((FAIL_COUNT++))
}

# Función para info
test_info() {
    echo -e "${YELLOW}ℹ️  INFO${NC} - $1"
}

echo "📡 Verificando conectividad con el backend..."
if curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/auth/health" | grep -q "200"; then
    test_success "Backend está disponible"
else
    test_fail "Backend no está disponible. Asegúrate de que esté corriendo en $API_URL"
    exit 1
fi

echo ""
echo "🔐 TEST 1: Login con credenciales correctas"
echo "-------------------------------------------"

RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"SuperAdmin2024!"}')

if echo "$RESPONSE" | grep -q "token"; then
    test_success "Login exitoso con SUPERADMIN"
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    test_info "Token obtenido: ${TOKEN:0:20}..."
    
    # Verificar que contiene roles y permisos
    if echo "$RESPONSE" | grep -q "SUPERADMIN"; then
        test_success "Rol SUPERADMIN presente en respuesta"
    else
        test_fail "Rol SUPERADMIN no presente en respuesta"
    fi
    
    if echo "$RESPONSE" | grep -q "GESTIONAR_USUARIOS"; then
        test_success "Permisos presentes en respuesta"
    else
        test_fail "Permisos no presentes en respuesta"
    fi
else
    test_fail "Login fallido con credenciales correctas"
    echo "Respuesta: $RESPONSE"
fi

echo ""
echo "🔐 TEST 2: Login con credenciales incorrectas"
echo "--------------------------------------------"

RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"contraseña_incorrecta"}')

if echo "$RESPONSE" | grep -q "message"; then
    test_success "Login rechazado con credenciales incorrectas"
else
    test_fail "El sistema aceptó credenciales incorrectas"
fi

echo ""
echo "🔐 TEST 3: Login con usuario inexistente"
echo "----------------------------------------"

RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario_inexistente","password":"password"}')

if echo "$RESPONSE" | grep -q "message"; then
    test_success "Login rechazado con usuario inexistente"
else
    test_fail "El sistema aceptó usuario inexistente"
fi

echo ""
echo "👤 TEST 4: Obtener usuario actual (autenticado)"
echo "-----------------------------------------------"

if [ -z "$TOKEN" ]; then
    test_fail "No hay token disponible. Saltando test."
else
    RESPONSE=$(curl -s -X GET "$API_URL/api/usuarios/me" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$RESPONSE" | grep -q "username"; then
        test_success "Usuario actual obtenido correctamente"
    else
        test_fail "No se pudo obtener usuario actual"
    fi
fi

echo ""
echo "👤 TEST 5: Obtener usuario sin token (no autenticado)"
echo "-----------------------------------------------------"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/api/usuarios/me")

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    test_success "Acceso denegado sin token (código: $HTTP_CODE)"
else
    test_fail "El sistema permitió acceso sin token (código: $HTTP_CODE)"
fi

echo ""
echo "👥 TEST 6: Listar todos los usuarios (SUPERADMIN)"
echo "-------------------------------------------------"

if [ -z "$TOKEN" ]; then
    test_fail "No hay token disponible. Saltando test."
else
    RESPONSE=$(curl -s -X GET "$API_URL/api/usuarios" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$RESPONSE" | grep -q "username"; then
        test_success "Lista de usuarios obtenida correctamente"
        USER_COUNT=$(echo "$RESPONSE" | grep -o "username" | wc -l)
        test_info "Usuarios encontrados: $USER_COUNT"
    else
        test_fail "No se pudo obtener lista de usuarios"
    fi
fi

echo ""
echo "🔒 TEST 7: Verificar que token inválido es rechazado"
echo "----------------------------------------------------"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/api/usuarios/me" \
  -H "Authorization: Bearer token_invalido_12345")

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    test_success "Token inválido rechazado correctamente (código: $HTTP_CODE)"
else
    test_fail "El sistema aceptó un token inválido (código: $HTTP_CODE)"
fi

echo ""
echo "📊 TEST 8: Health check del sistema"
echo "-----------------------------------"

RESPONSE=$(curl -s -X GET "$API_URL/api/auth/health")

if echo "$RESPONSE" | grep -q "OK"; then
    test_success "Health check exitoso"
else
    test_fail "Health check falló"
fi

echo ""
echo "🔐 TEST 9: Validación de campos requeridos"
echo "-----------------------------------------"

# Login sin username
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"password":"password"}')

if echo "$RESPONSE" | grep -q "message\|error"; then
    test_success "Login sin username rechazado"
else
    test_fail "Login sin username aceptado"
fi

# Login sin password
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin"}')

if echo "$RESPONSE" | grep -q "message\|error"; then
    test_success "Login sin password rechazado"
else
    test_fail "Login sin password aceptado"
fi

echo ""
echo "========================================"
echo "📊 RESUMEN DE TESTS"
echo "========================================"
echo -e "${GREEN}✅ Tests exitosos: $SUCCESS_COUNT${NC}"
echo -e "${RED}❌ Tests fallidos: $FAIL_COUNT${NC}"
TOTAL=$((SUCCESS_COUNT + FAIL_COUNT))
PERCENTAGE=$((SUCCESS_COUNT * 100 / TOTAL))
echo "📈 Porcentaje de éxito: $PERCENTAGE%"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todos los tests pasaron!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Algunos tests fallaron. Revisa los logs.${NC}"
    exit 1
fi
