#!/bin/bash

# ============================================================
# Script: init-teleekgs-storage.sh
# Proposito: Inicializar estructura de directorios para TeleEKG
# Fecha: 2026-01-13
# Uso: sudo ./init-teleekgs-storage.sh
# ============================================================

set -e  # Exit on error

BASE_PATH="/opt/cenate/teleekgs"
CENATE_USER="cenate"
CENATE_GROUP="cenate"

echo ""
echo "=========================================================="
echo "🔧 Inicializando estructura de almacenamiento TeleEKG"
echo "=========================================================="
echo ""

# PASO 1: Crear directorios principal
echo "1️⃣  Creando directorios principales..."
mkdir -p "$BASE_PATH"
mkdir -p "$BASE_PATH/archive"
mkdir -p "$BASE_PATH/logs"

echo "   ✅ Directorios creados:"
echo "      - $BASE_PATH"
echo "      - $BASE_PATH/archive"
echo "      - $BASE_PATH/logs"
echo ""

# PASO 2: Configurar ownership
echo "2️⃣  Configurando ownership..."

# Verificar si el usuario cenate existe
if id "$CENATE_USER" &>/dev/null; then
    echo "   ✅ Usuario '$CENATE_USER' encontrado"
    chown -R "$CENATE_USER:$CENATE_GROUP" "$BASE_PATH"
    echo "   ✅ Ownership configurado: $CENATE_USER:$CENATE_GROUP"
else
    echo "   ⚠️  Usuario '$CENATE_USER' no existe."
    echo "   ℹ️  Los archivos pertenecerán a: $(whoami)"
    echo "   💡  Ejecuta estos comandos después si es necesario:"
    echo "       sudo useradd -m -s /bin/bash $CENATE_USER"
    echo "       sudo chown -R $CENATE_USER:$CENATE_GROUP $BASE_PATH"
fi

echo ""

# PASO 3: Configurar permisos
echo "3️⃣  Configurando permisos de directorios..."
chmod 750 "$BASE_PATH"
chmod 750 "$BASE_PATH/archive"
chmod 750 "$BASE_PATH/logs"

echo "   ✅ Permisos configurados:"
echo "      - Base path: 750 (rwxr-x---)"
echo "      - Archive: 750 (rwxr-x---)"
echo "      - Logs: 750 (rwxr-x---)"
echo ""

# PASO 4: Crear estructura inicial de directorios por mes
echo "4️⃣  Creando estructura inicial de directorios (próximos 3 meses)..."

CURRENT_YEAR=$(date +%Y)
CURRENT_MONTH=$(date +%m)
CURRENT_DAY=$(date +%d)

for month_offset in 0 1 2; do
    MONTH=$((10#$CURRENT_MONTH + month_offset))
    YEAR=$CURRENT_YEAR

    if [ $MONTH -gt 12 ]; then
        MONTH=$((MONTH - 12))
        YEAR=$((YEAR + 1))
    fi

    # Formatear con ceros a la izquierda
    MONTH_STR=$(printf "%02d" $MONTH)
    DIR_PATH="$BASE_PATH/$YEAR/$MONTH_STR"

    mkdir -p "$DIR_PATH"
    chown -R "$CENATE_USER:$CENATE_GROUP" "$DIR_PATH" 2>/dev/null || true
    chmod 750 "$DIR_PATH" 2>/dev/null || true

    echo "   ✅ Creado: $DIR_PATH"
done

echo ""

# PASO 5: Crear .gitkeep en directorios
echo "5️⃣  Creando archivos .gitkeep..."
touch "$BASE_PATH/.gitkeep"
touch "$BASE_PATH/archive/.gitkeep"
touch "$BASE_PATH/logs/.gitkeep"

echo "   ✅ Archivos .gitkeep creados"
echo ""

# PASO 6: Mostrar estado del almacenamiento
echo "6️⃣  Estado del almacenamiento:"
echo ""

echo "   Estructura de directorios:"
ls -la "$BASE_PATH" | grep "^d" | awk '{print "      " $9 " (permisos: " $1 ")"}'

echo ""
echo "   Espacio disponible:"
df -h "$BASE_PATH" | tail -1 | awk '{print "      Filesystem: " $1}'
df -h "$BASE_PATH" | tail -1 | awk '{print "      Tamaño: " $2}'
df -h "$BASE_PATH" | tail -1 | awk '{print "      Disponible: " $4 " (" $5 " usado)"}'

echo ""

# PASO 7: Mostrar resumen final
echo ""
echo "=========================================================="
echo "✅ INICIALIZACIÓN COMPLETADA"
echo "=========================================================="
echo ""
echo "Ubicación base: $BASE_PATH"
echo "Owner: $CENATE_USER:$CENATE_GROUP"
echo "Permisos: 750 (rwxr-x---)"
echo ""
echo "Próximos pasos:"
echo "1. Verificar que la aplicación puede escribir en el directorio:"
echo "   sudo -u $CENATE_USER touch $BASE_PATH/test-write.txt"
echo "   sudo -u $CENATE_USER rm $BASE_PATH/test-write.txt"
echo ""
echo "2. En el archivo application.properties, configurar:"
echo "   app.teleekgs.storage.base-path=$BASE_PATH"
echo ""
echo "3. Reiniciar la aplicación:"
echo "   sudo systemctl restart cenate-backend"
echo ""
echo "=========================================================="
echo ""
