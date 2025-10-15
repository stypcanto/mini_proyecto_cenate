#!/bin/bash
# ============================================================
# 🧪 CENATE API TEST COLLECTION (versión extendida)
# Autor: Styp Canto
# Fecha: $(date +"%Y-%m-%d")
# Descripción: Pruebas completas para módulos de CENATE Backend
# ============================================================

# =========================
# 1️⃣ Login y Token
# =========================
echo "=== 🔑 Autenticando usuario ==="
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "scantor", "password": "admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener el token. Revisa las credenciales."
  exit 1
fi

echo "✅ Token obtenido correctamente"
echo ""

# ============================================================
# 2️⃣ IPRESS Y ENTIDAD
# ============================================================
echo "=== 🏥 Listar todas las IPRESS ==="
curl -s -X GET http://localhost:8080/api/ipress \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 🏥 Listar IPRESS activas ==="
curl -s -X GET http://localhost:8080/api/ipress/activas \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 🏥 Buscar IPRESS: TARAPOTO ==="
curl -s -X GET "http://localhost:8080/api/ipress/buscar?q=TARAPOTO" \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 🏥 Obtener IPRESS por ID (ej. 2) ==="
curl -s -X GET http://localhost:8080/api/ipress/2 \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# ============================================================
# 3️⃣ CATÁLOGOS MAESTROS
# ============================================================
echo "=== 🧩 Tipos de IPRESS ==="
curl -s -X GET http://localhost:8080/api/tipo-ipress \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== ⚙️ Tipos de Procedimiento ==="
curl -s -X GET http://localhost:8080/api/tipo-procedimientos \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 🧱 Niveles de Atención ==="
curl -s -X GET http://localhost:8080/api/nivel-atencion \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 🏢 Áreas Hospitalarias ==="
curl -s -X GET http://localhost:8080/api/area-hospitalaria \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# ============================================================
# 4️⃣ PERSONAL CNT Y RELACIONES
# ============================================================
echo "=== 👨‍⚕️ Listar Personal CNT ==="
curl -s -X GET http://localhost:8080/api/personal-cnt \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 🔍 Buscar Personal CNT por DNI (ej. 12345678) ==="
curl -s -X GET "http://localhost:8080/api/personal-cnt/buscar?q=12345678" \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 👩‍⚕️ Listar Personal Externo ==="
curl -s -X GET http://localhost:8080/api/personal-externo \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 💼 Listar Tipos de Personal ==="
curl -s -X GET http://localhost:8080/api/personal-tipo \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 🎓 Listar Profesiones ==="
curl -s -X GET http://localhost:8080/api/profesiones \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 🧾 Listar Ocupaciones (OC) ==="
curl -s -X GET http://localhost:8080/api/personal-oc \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== ✍️ Listar Firmas Digitales ==="
curl -s -X GET http://localhost:8080/api/firmas \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# ============================================================
# 5️⃣ DOCUMENTOS Y USUARIOS
# ============================================================
echo "=== 🪪 Tipos de Documento ==="
curl -s -X GET http://localhost:8080/api/tipo-documento \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 🧰 Regímenes Laborales ==="
curl -s -X GET http://localhost:8080/api/regimen-laboral \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 👤 Usuarios del Sistema ==="
curl -s -X GET http://localhost:8080/api/usuarios \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# ============================================================
# 6️⃣ AUDITORÍA Y DASHBOARD
# ============================================================
echo "=== 📊 Dashboard principal ==="
curl -s -X GET http://localhost:8080/api/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "=== 🧾 Logs de Auditoría ==="
curl -s -X GET http://localhost:8080/api/admin/audit-logs \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# ============================================================
# 6️⃣ DETALLE PERSONAL
# ============================================================

echo "=== 👨‍⚕️ Consultar detalle completo del personal CNT ==="
curl -s -X GET http://localhost:8080/api/personal-cnt/detalle \
  -H "Authorization: Bearer $TOKEN" | jq


echo "✅ ✅ Pruebas API completadas correctamente."
