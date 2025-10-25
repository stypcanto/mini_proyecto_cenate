#!/bin/bash

# 🔧 Script completo para corregir error de webpack/react-refresh
# ==============================================================

set -e  # Salir si hay error

echo "🧹 PASO 1: Limpiando completamente el proyecto..."
rm -rf node_modules
rm -rf build
rm -rf .cache
rm -f package-lock.json
rm -f yarn.lock

echo ""
echo "🗑️ PASO 2: Limpiando cache de npm..."
npm cache clean --force

echo ""
echo "🗑️ PASO 3: Limpiando cache de yarn (por si acaso)..."
yarn cache clean 2>/dev/null || true

echo ""
echo "📦 PASO 4: Verificando versión de Node.js..."
node --version
echo "   ✅ Node.js detectado"

echo ""
echo "📦 PASO 5: Instalando dependencias (esto puede tardar unos minutos)..."
npm install --legacy-peer-deps

echo ""
echo "✅ ¡Instalación completada!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 LISTO PARA USAR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Para iniciar la aplicación, ejecuta:"
echo "   npm start"
echo ""
