#!/bin/bash

# ============================================================
# 🚀 CENATE - INICIO RÁPIDO EN MODO DESARROLLO
# ============================================================
# Este script inicia el backend con Spring Boot DevTools
# activado para recarga automática de cambios
# ============================================================

echo "🚀 Iniciando CENATE Backend en modo DESARROLLO..."
echo "✅ DevTools activado: recarga automática de cambios"
echo "📡 Puerto: 8080"
echo "🌐 URL: http://localhost:8080"
echo ""
echo "⚡ Ctrl+C para detener"
echo "============================================================"
echo ""

# Limpiar build anterior
./gradlew clean

# Iniciar con DevTools
./gradlew bootRun
