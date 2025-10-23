#!/bin/bash
echo "🔍 Buscando clases sin @Slf4j..."
grep -Rl "log\." backend/src/main/java/com/styp/cenate/service | grep -v "@Slf4j" | while read file; do
  if grep -q "public class" "$file"; then
    echo "🩵 Corrigiendo: $file"
    sed -i '' '/package/a\
import lombok.extern.slf4j.Slf4j;\
@Slf4j\
' "$file"
  fi
done
echo "✅ Inserción automática de @Slf4j completada."
