#!/bin/sh
# ========================================================================
# ✅ Generador de env.js seguro – versión final CENATE 2025
# ------------------------------------------------------------------------
# Reescribe /usr/share/nginx/html/env.js con valores JSON válidos.
# Evita errores "Unexpected string" o "Unexpected token" por comillas.
# ========================================================================

set -e

ENV_JS="/usr/share/nginx/html/env.js"

# Variables por defecto (si no están definidas)
: "${REACT_APP_API_URL:=/api}"
: "${REACT_APP_ENV:=production}"
: "${REACT_APP_DEBUG:=false}"

echo "🔧 Generando nuevo ${ENV_JS}..."

# Reescribimos el archivo completamente con formato limpio
cat > "$ENV_JS" <<EOF
// Runtime env vars (generado por env.sh)
window.__ENV__ = {
  REACT_APP_API_URL: "${REACT_APP_API_URL}",
  REACT_APP_ENV: "${REACT_APP_ENV}",
  REACT_APP_DEBUG: "${REACT_APP_DEBUG}"
};
EOF

echo "✅ Archivo generado correctamente con:"
echo "   • REACT_APP_API_URL=${REACT_APP_API_URL}"
echo "   • REACT_APP_ENV=${REACT_APP_ENV}"
echo "   • REACT_APP_DEBUG=${REACT_APP_DEBUG}"
