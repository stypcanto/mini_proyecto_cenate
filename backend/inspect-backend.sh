#!/bin/bash
# ============================================================
# 🧠 Script: inspect-backend.sh
# Objetivo: Entrar al contenedor backend y listar las rutas de API
# ============================================================

CONTAINER_NAME="cenate-backend"

# 🧩 Verificar si el contenedor está corriendo
if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
  echo "❌ El contenedor $CONTAINER_NAME no está corriendo."
  echo "🔹 Usa: docker compose up -d backend"
  exit 1
fi

echo "✅ Entrando al contenedor $CONTAINER_NAME..."
docker exec -it $CONTAINER_NAME sh -c "
  echo '📂 Explorando clases compiladas dentro del contenedor...';
  echo '-------------------------------------------';
  ls /app | grep app.jar && echo '✅ app.jar encontrado';
  echo '-------------------------------------------';
  echo '🔍 Buscando controladores (API)...';
  find /app -type f -name '*.class' | grep '/api/' | sed 's|/app/||g'
  echo '-------------------------------------------';
  echo '✅ Inspección completada';
"