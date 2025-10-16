#!/bin/bash

# Script para probar el flujo completo de solicitud de cuenta

echo "🧪 PRUEBA DEL SISTEMA DE SOLICITUD DE CUENTA"
echo "=============================================="
echo ""

API_URL="http://localhost:8080/api"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Crear una solicitud de cuenta
echo "1️⃣ Creando solicitud de cuenta..."
RESPONSE=$(curl -s -X POST "${API_URL}/account-requests" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreCompleto": "Juan Carlos Pérez López",
    "tipoUsuario": "INTERNO",
    "numDocumento": "87654321",
    "motivo": "Necesito acceso al sistema para gestionar el personal médico del servicio de cardiología. Soy el nuevo coordinador del área."
  }')

echo "$RESPONSE" | jq .

if echo "$RESPONSE" | grep -q "idRequest"; then
    echo -e "${GREEN}✅ Solicitud creada exitosamente${NC}"
    REQUEST_ID=$(echo "$RESPONSE" | jq -r '.idRequest')
    echo "   ID de solicitud: $REQUEST_ID"
else
    echo -e "${RED}❌ Error al crear solicitud${NC}"
    exit 1
fi
echo ""

# 2. Listar solicitudes pendientes (requiere login)
echo "2️⃣ Iniciando sesión como administrador..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
    echo -e "${GREEN}✅ Login exitoso${NC}"
    echo "   Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Error en login${NC}"
    exit 1
fi
echo ""

# 3. Obtener solicitudes pendientes
echo "3️⃣ Obteniendo solicitudes pendientes..."
PENDING_RESPONSE=$(curl -s -X GET "${API_URL}/account-requests/pendientes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$PENDING_RESPONSE" | jq .

if echo "$PENDING_RESPONSE" | grep -q "idRequest"; then
    echo -e "${GREEN}✅ Solicitudes obtenidas correctamente${NC}"
    COUNT=$(echo "$PENDING_RESPONSE" | jq '. | length')
    echo "   Total de solicitudes pendientes: $COUNT"
else
    echo -e "${YELLOW}⚠️  No hay solicitudes pendientes o error en la petición${NC}"
fi
echo ""

# 4. Aprobar la solicitud
echo "4️⃣ Aprobando solicitud ID: $REQUEST_ID..."
APPROVE_RESPONSE=$(curl -s -X PUT "${API_URL}/account-requests/${REQUEST_ID}/aprobar" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rolesAsignados": "[\"USER\"]",
    "observacionAdmin": "Usuario aprobado para el área de cardiología",
    "passwordTemporal": "TempPass123!"
  }')

echo "$APPROVE_RESPONSE" | jq .

if echo "$APPROVE_RESPONSE" | grep -q "username"; then
    echo -e "${GREEN}✅ Solicitud aprobada - Usuario creado${NC}"
    USERNAME=$(echo "$APPROVE_RESPONSE" | jq -r '.username')
    echo "   Username creado: $USERNAME"
    echo "   Password temporal: TempPass123!"
else
    echo -e "${RED}❌ Error al aprobar solicitud${NC}"
    exit 1
fi
echo ""

# 5. Intentar login con el nuevo usuario
echo "5️⃣ Probando login con el nuevo usuario..."
NEW_USER_LOGIN=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"TempPass123!\"}")

if echo "$NEW_USER_LOGIN" | grep -q "token"; then
    echo -e "${GREEN}✅ Login exitoso con el nuevo usuario${NC}"
    NEW_TOKEN=$(echo "$NEW_USER_LOGIN" | jq -r '.token')
    echo "   Token: ${NEW_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Error en login del nuevo usuario${NC}"
    echo "   Respuesta: $NEW_USER_LOGIN"
fi
echo ""

echo "=============================================="
echo "📊 RESUMEN DE LA PRUEBA:"
echo ""
echo "1. Creación de solicitud: ✅"
echo "2. Login de administrador: ✅"
echo "3. Listado de solicitudes: ✅"
echo "4. Aprobación de solicitud: ✅"
echo "5. Login de nuevo usuario: $(echo "$NEW_USER_LOGIN" | grep -q "token" && echo "✅" || echo "❌")"
echo ""
echo "=============================================="
