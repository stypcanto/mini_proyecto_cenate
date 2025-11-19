#!/bin/bash

# ============================================================
# 🚀 CENATE - INICIO CON CAPTURA DE LOGS
# ============================================================

LOGFILE="backend-$(date +%Y%m%d-%H%M%S).log"

echo "🚀 Iniciando CENATE Backend con captura de logs..."
echo "📝 Logs se guardarán en: $LOGFILE"
echo "✅ DevTools activado"
echo "📡 Puerto: 8080"
echo ""
echo "⚡ Ctrl+C para detener"
echo "============================================================"
echo ""

# Limpiar build anterior
./gradlew clean

# Iniciar con captura de logs
./gradlew bootRun 2>&1 | tee "$LOGFILE"
