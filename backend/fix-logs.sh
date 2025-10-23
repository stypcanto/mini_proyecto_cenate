#!/bin/bash
# ======================================================================
# 🧩 Script: fix-logs.sh
# ----------------------------------------------------------------------
# 🔍 Detecta y corrige automáticamente clases Java que usan 'log'
# pero no tienen la anotación @Slf4j ni el import correspondiente.
# Compatible con proyectos Spring Boot (CENATE, MBAC, etc.)
# ======================================================================

BASE_DIR="src/main/java"

echo "🔎 Buscando clases que usan 'log' pero no tienen @Slf4j..."
echo "-----------------------------------------------------------"

# Buscar todos los archivos que usan log y no tienen @Slf4j
grep -rl "log\." "$BASE_DIR" | while read -r FILE; do
  if ! grep -q "@Slf4j" "$FILE"; then
    echo "⚙️  Corrigiendo: $FILE"

    # Asegurar que el import esté presente antes de la definición de clase
    if ! grep -q "import lombok.extern.slf4j.Slf4j;" "$FILE"; then
      sed -i '' '/package /a\
import lombok.extern.slf4j.Slf4j;\
' "$FILE"
    fi

    # Insertar la anotación justo antes de la definición de clase
    sed -i '' '/public class /i\
@Slf4j
' "$FILE"
  fi
done

echo "-----------------------------------------------------------"
echo "✅ Proceso completado. Revisa los archivos actualizados."
echo "💡 Si no aparece ningún mensaje, todo ya estaba correcto."
