#!/bin/bash
# ======================================================================
# 🚀 verify-build.sh - Reconstrucción limpia del entorno CENATE
# ======================================================================
# Este script automatiza:
#   ✅ Limpieza completa de contenedores, volúmenes y cachés
#   ✅ Reconstrucción de imágenes (backend y frontend)
#   ✅ Verificación del estado final de los contenedores
# ----------------------------------------------------------------------
# 🧠 Uso:
#   chmod +x verify-build.sh
#   ./verify-build.sh
# ======================================================================

set -e  # Si algo falla, el script se detiene inmediatamente

echo ""
echo "🧹 1️⃣ Eliminando contenedores, volúmenes y cachés anteriores..."
docker compose down -v --remove-orphans || true
docker system prune -f
docker builder prune -f
echo "✅ Limpieza completada."
echo ""

echo "🏗️ 2️⃣ Reconstruyendo imágenes sin usar caché..."
docker compose build --no-cache
echo "✅ Imágenes reconstruidas correctamente."
echo ""

echo "🚀 3️⃣ Iniciando contenedores en modo detached..."
docker compose up -d
echo ""

echo "🩺 4️⃣ Verificando estado actual:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "📦 5️⃣ Logs iniciales del backend:"
docker logs $(docker ps --filter "name=backend" --format "{{.Names}}") --tail=15
echo ""

echo "🌐 6️⃣ Logs iniciales del frontend:"
docker logs $(docker ps --filter "name=frontend" --format "{{.Names}}") --tail=15
echo ""

echo "✅ Build y despliegue completados con éxito 🎯"
echo "👉 Accede al sistema en: http://localhost"
echo ""