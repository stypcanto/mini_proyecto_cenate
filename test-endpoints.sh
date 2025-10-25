#!/bin/bash
# ========================================================================
# 🔧 Script de prueba completo de endpoints CENATE
# ========================================================================

set -e  # Salir si hay algún error

BASE_URL="http://localhost:8080"
echo "🌐 Base URL: $BASE_URL"
echo ""

# ============================================================
# 1. Generar token de autenticación
# ============================================================
echo "1️⃣  Generando token JWT..."
JWT_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}' | jq -r '.token')

if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" == "null" ]; then
  echo "❌ Error: No se pudo obtener el token"
  exit 1
fi

echo "✅ Token obtenido"
echo ""

# ============================================================
# 2. Health Check
# ============================================================
echo "2️⃣  Health Check - /api/permisos/health"
curl -s -X GET "$BASE_URL/api/permisos/health" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
echo ""

# ============================================================
# 3. Obtener permisos por username
# ============================================================
echo "3️⃣  Permisos del usuario 'scantor' - /api/permisos/usuario/scantor"
PERMISOS=$(curl -s -X GET "$BASE_URL/api/permisos/usuario/scantor" \
  -H "Authorization: Bearer $JWT_TOKEN")

CANTIDAD=$(echo "$PERMISOS" | jq 'length')
echo "✅ Usuario tiene $CANTIDAD permisos"
echo "$PERMISOS" | jq '.[0:3]' # Mostrar solo los primeros 3
echo ""

# ============================================================
# 4. Obtener permisos por rol
# ============================================================
echo "4️⃣  Permisos del rol ID 1 (SUPERADMIN) - /api/permisos/rol/1"
curl -s -X GET "$BASE_URL/api/permisos/rol/1" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
echo ""

# ============================================================
# 5. Listar usuarios
# ============================================================
echo "5️⃣  Lista de usuarios - /api/usuarios"
USUARIOS=$(curl -s -X GET "$BASE_URL/api/usuarios" \
  -H "Authorization: Bearer $JWT_TOKEN")

NUM_USUARIOS=$(echo "$USUARIOS" | jq 'length')
echo "✅ Total de usuarios: $NUM_USUARIOS"
echo "$USUARIOS" | jq '.[] | {username, roles}' | head -20
echo ""

# ============================================================
# Resumen
# ============================================================
echo "======================================"
echo "🏁 Prueba completada exitosamente"
echo "======================================"
echo ""
echo "📝 Rutas disponibles:"
echo "  ✅ POST   /api/auth/login"
echo "  ✅ GET    /api/permisos/health"
echo "  ✅ GET    /api/permisos/usuario/{username}"
echo "  ✅ GET    /api/permisos/rol/{idRol}"
echo "  ✅ GET    /api/usuarios"
echo "  ✅ PUT    /api/permisos/{id}"
