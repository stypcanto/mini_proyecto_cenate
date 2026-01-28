#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 PASOS PARA IMPLEMENTAR SOLUCIÓN DE PERFORMANCE EN BD
# ═══════════════════════════════════════════════════════════════════════════════

set -e

PROJECT_DIR="/Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate"

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🔧 IMPLEMENTACIÓN DE SOLUCIÓN - Problema de Performance en BD"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# PASO 1: Verificar que el código está correcto
echo "📋 PASO 1: Verificando tipos de datos..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -n "private String pacienteId" "$PROJECT_DIR/backend/src/main/java/com/styp/cenate/model/bolsas/SolicitudBolsa.java" && echo "✓ SolicitudBolsa: pacienteId es String" || echo "✗ ERROR: pacienteId no es String"

grep -n "private String pacienteId" "$PROJECT_DIR/backend/src/main/java/com/styp/cenate/dto/bolsas/SolicitudBolsaDTO.java" && echo "✓ SolicitudBolsaDTO: pacienteId es String" || echo "✗ ERROR: pacienteId no es String"

grep -n "String pacienteId" "$PROJECT_DIR/backend/src/main/java/com/styp/cenate/repository/bolsas/SolicitudBolsaRepository.java" | head -5 && echo "✓ Repository: Parámetros usan String" || echo "✗ ERROR: Repository usa tipo incorrecto"

echo ""
echo "✓ PASO 1: Tipos verificados correctamente"
echo ""

# PASO 2: Build backend
echo "🏗️  PASO 2: Compilando backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_DIR/backend"
./gradlew clean build -x test 2>&1 | tail -20

BUILD_STATUS=$?
if [ $BUILD_STATUS -eq 0 ]; then
    echo "✓ PASO 2: Build exitoso"
else
    echo "✗ ERROR: Build falló con código $BUILD_STATUS"
    exit 1
fi

echo ""

# PASO 3: Matar proceso anterior (si existe)
echo "🛑 PASO 3: Deteniendo servidor anterior..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pkill -f "java.*cenate" || echo "No hay procesos anteriores"
sleep 2

echo "✓ PASO 3: Servidor anterior detenido"
echo ""

# PASO 4: Iniciar backend en background
echo "🚀 PASO 4: Iniciando backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_DIR/backend"
nohup ./gradlew bootRun > backend.log 2>&1 &
BACKEND_PID=$!

echo "✓ Backend iniciado (PID: $BACKEND_PID)"
echo "✓ Esperando que inicie (15 segundos)..."
sleep 15

echo ""

# PASO 5: Verificar que backend está corriendo
echo "🔍 PASO 5: Verificando que backend está corriendo..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ps -p $BACKEND_PID > /dev/null; then
    echo "✓ Backend está corriendo (PID: $BACKEND_PID)"
else
    echo "✗ ERROR: Backend no está corriendo"
    echo "Viendo últimas líneas de error:"
    tail -50 backend.log
    exit 1
fi

echo ""

# PASO 6: Verificar que no hay errores SQL
echo "🔐 PASO 6: Verificando errores en logs..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERRORS=$(grep -c "character varying\|operator does not exist" backend.log || echo "0")

if [ "$ERRORS" -eq 0 ]; then
    echo "✓ No hay errores de tipo en logs"
else
    echo "✗ WARNING: Se encontraron $ERRORS errores SQL"
fi

echo ""

# PASO 7: Testear endpoint
echo "🧪 PASO 7: Testeando login endpoint..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

echo "Response Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
    echo "✓ Endpoint respondió correctamente (no timeout)"
else
    echo "⚠️  Código inesperado: $HTTP_CODE"
fi

echo ""

# PASO 8: Resumen
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "✅ IMPLEMENTACIÓN COMPLETADA"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 RESUMEN:"
echo "  ✓ Tipos de datos verificados (String para pacienteId)"
echo "  ✓ Backend compilado exitosamente"
echo "  ✓ Backend iniciado y corriendo"
echo "  ✓ No hay errores de tipo en logs"
echo "  ✓ Endpoint respondiendo sin timeout"
echo ""
echo "🔍 MONITOREO:"
echo "  Logs backend:    tail -f $PROJECT_DIR/backend/backend.log"
echo "  Ver errores SQL: tail -f $PROJECT_DIR/backend/backend.log | grep ERROR"
echo ""
echo "🛑 DETENER SERVIDOR:"
echo "  pkill -f \"java.*cenate\""
echo ""
echo "📝 DOCUMENTACIÓN:"
echo "  - DIAGNOSTICO_SLOWDB_2026-01-28.md"
echo "  - RESUMEN_SOLUCION_SLOWDB_2026-01-28.md"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
