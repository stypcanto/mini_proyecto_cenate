#!/bin/bash
echo "🧹 Corrigiendo inserciones incorrectas de @Slf4j en servicios..."

# Eliminar líneas duplicadas o mal ubicadas
find backend/src/main/java/com/styp/cenate/service -type f -name "*.java" | while read file; do
  # Quitar @Slf4j duplicado
  sed -i '' '/^@Slf4j$/d' "$file"

  # Quitar imports duplicados o fuera de lugar
  sed -i '' '/import lombok.extern.slf4j.Slf4j;/d' "$file"

  # Insertar correctamente el import y anotación si hay "log." en el archivo
  if grep -q "log\." "$file" && grep -q "public class" "$file"; then
    echo "🩵 Reinsertando @Slf4j en: $file"
    awk '
      /^package / { print; print "import lombok.extern.slf4j.Slf4j;"; next }
      /^public class / { print "@Slf4j"; print; next }
      { print }
    ' "$file" > tmp && mv tmp "$file"
  fi
done

echo "✅ Limpieza y reinserción completada correctamente."
