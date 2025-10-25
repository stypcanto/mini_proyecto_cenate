#!/bin/bash
# ========================================================================
# 🔍 Script de diagnóstico completo del sistema CENATE
# ========================================================================

echo "🔍 DIAGNÓSTICO DEL SISTEMA CENATE"
echo "======================================"
echo ""

# Base URL
BASE_URL="http://localhost:8080"

# 1. Generar token
echo "1️⃣  Generando token de autenticación..."
JWT_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}' | jq -r '.token')

if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" == "null" ]; then
  echo "❌ Error: No se pudo obtener el token"
  exit 1
fi

echo "✅ Token generado exitosamente"
echo ""

# 2. Verificar permisos del usuario
echo "2️⃣  Consultando permisos del usuario 'scantor'..."
PERMISOS=$(curl -s -X GET "$BASE_URL/api/permisos/usuario/scantor" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json")

echo "$PERMISOS" | jq .
echo ""

# 3. Verificar respuesta
if echo "$PERMISOS" | jq -e 'type == "array"' > /dev/null 2>&1; then
  CANTIDAD=$(echo "$PERMISOS" | jq 'length')
  echo "✅ Usuario tiene $CANTIDAD permisos asignados"
else
  echo "⚠️  Respuesta inesperada del servidor:"
  echo "$PERMISOS" | jq .
fi

echo ""
echo "======================================"
echo "🏁 Diagnóstico completado"
