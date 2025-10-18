#!/bin/bash
# ============================================================
# 📘 Script: export-api-routes.sh
# Objetivo: Exportar todas las rutas REST expuestas por CENATE
# Compatible con Spring Boot 3.4+ y Docker backend
# ============================================================

CONTAINER_NAME="cenate-backend"
OUTPUT_FILE="./docs/api_routes.txt"
PORT=8080

# Crear carpeta docs si no existe
mkdir -p ./docs

echo "🚀 Extrayendo rutas de API desde el contenedor: $CONTAINER_NAME"
echo "============================================================"
echo

# Verificar contenedor
if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
  echo "❌ El contenedor $CONTAINER_NAME no está corriendo."
  echo "🔹 Usa: docker compose up -d backend"
  exit 1
fi

# Ejecutar dentro del contenedor
docker exec -i $CONTAINER_NAME sh -c "
  apt-get update >/dev/null 2>&1 && apt-get install -y jq >/dev/null 2>&1 || true
  curl -s http://localhost:$PORT/actuator/mappings
" > ./docs/mappings_raw.json

# Validar salida
if [ ! -s ./docs/mappings_raw.json ]; then
  echo "❌ No se obtuvo respuesta del endpoint /actuator/mappings."
  echo "Verifica que el Actuator esté habilitado en application.properties:"
  echo "management.endpoints.web.exposure.include=health,info,mappings"
  exit 1
fi

# Procesar JSON
echo "🧠 Procesando rutas y agrupando por módulo..."
echo "============================================================"
jq -r '
  .contexts[]?.mappings?.dispatcherServlets?.dispatcherServlet[]? |
  .details | select(.requestMappingConditions != null) |
  [.requestMappingConditions.patterns[], (.requestMappingConditions.methods[]? // "ANY")] |
  @tsv
' ./docs/mappings_raw.json | sort > ./docs/routes_temp.tsv

# Formatear salida final agrupada por módulo
{
  echo "============================================================"
  echo "📘 CENATE API ROUTES - Generado el $(date '+%Y-%m-%d %H:%M:%S')"
  echo "============================================================"
  echo

  awk -F'\t' '
  {
    split($1, parts, "/");
    module = (length(parts) >= 3) ? parts[3] : "root";
    routes[module] = routes[module] sprintf("%-8s %s\n", $2, $1);
  }
  END {
    PROCINFO["sorted_in"] = "@ind_str_asc";
    for (m in routes) {
      print "🧩 Módulo:", m;
      print "------------------------------------------------------------";
      print routes[m];
      print "";
    }
  }' ./docs/routes_temp.tsv

} > "$OUTPUT_FILE"

# Limpiar
rm -f ./docs/routes_temp.tsv

echo "✅ Archivo generado: $OUTPUT_FILE"
echo "============================================================"
echo "Ejemplo de vista previa:"
echo "------------------------------------------------------------"
head -n 20 "$OUTPUT_FILE"
echo "------------------------------------------------------------"