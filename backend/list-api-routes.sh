 #!/bin/bash
 # ============================================================
 # 🧠 Script: list-api-routes.sh
 # Objetivo: Listar todas las rutas REST expuestas por el backend CENATE
 # Compatible con Spring Boot 3.4+ (estructura actual de Actuator)
 # ============================================================

 CONTAINER_NAME="cenate-backend"
 PORT=8080

 # 🔍 Verificar si el contenedor está corriendo
 if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
   echo "❌ El contenedor $CONTAINER_NAME no está corriendo."
   echo "🔹 Usa: docker compose up -d backend"
   exit 1
 fi

 echo "🚀 Consultando rutas disponibles en $CONTAINER_NAME ..."
 echo "-------------------------------------------"

 # 📡 Instalar dependencias si faltan y ejecutar curl dentro del contenedor
 docker exec -it $CONTAINER_NAME sh -c "
   apk add --no-cache curl jq >/dev/null 2>&1 || true
   echo '📡 Llamando a http://localhost:$PORT/actuator/mappings...'
   echo

   RESPONSE=\$(curl -s http://localhost:$PORT/actuator/mappings)

   if [ -z \"\$RESPONSE\" ]; then
     echo '❌ No se recibió respuesta del Actuator. Verifica que mappings esté habilitado.'
     exit 1
   fi

   echo \"🔎 Extrayendo rutas...\\n\"

   echo \"\$RESPONSE\" | jq -r '
     .contexts[]?.mappings?.dispatcherServlets?.dispatcherServlet[]? |
     .details | select(.requestMappingConditions != null) |
     [.requestMappingConditions.methods[]? // \"ANY\", (.requestMappingConditions.patterns[] // \"\")] |
     @tsv
   ' | sort | column -t
 "