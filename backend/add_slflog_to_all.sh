#!/bin/bash
# ================================================================
# 🧩 Script CENATE - Inserta @Slf4j automáticamente donde falte
# ---------------------------------------------------------------
# Escanea controladores, filtros y servicios para agregar la
# anotación Lombok @Slf4j y su import si no existen.
# ================================================================

BASE_DIR="src/main/java/com/styp/cenate"
echo "🔍 Escaneando clases Java en $BASE_DIR ..."

# Buscar los archivos relevantes
FILES=$(grep -rl "public class" $BASE_DIR | grep -E "Controller|Filter|ServiceImpl|Aspect|Evaluator|Area\.java")

for FILE in $FILES; do
  if ! grep -q "@Slf4j" "$FILE"; then
    echo "🛠️  Agregando @Slf4j en: $FILE"
    cp "$FILE" "$FILE.bak"

    # Insertar import y anotación antes de la declaración de clase
    sed -i '' '/public class/ i\
import lombok.extern.slf4j.Slf4j;\
@Slf4j\
' "$FILE"
  else
    echo "✅ Ya tiene @Slf4j: $FILE"
  fi
done

echo "✨ Proceso completado. Respaldos .bak generados donde se aplicó el cambio."
