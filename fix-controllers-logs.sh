#!/bin/bash
echo "🧩 Insertando @Slf4j en controladores y filtros con log.info..."

find backend/src/main/java/com/styp/cenate/api backend/src/main/java/com/styp/cenate/security -type f -name "*.java" | while read file; do
  if grep -q "log\." "$file" && ! grep -q "@Slf4j" "$file"; then
    echo "🩵 Corrigiendo: $file"
    awk '
      /^package / { print; print "import lombok.extern.slf4j.Slf4j;"; next }
      /^public class / { print "@Slf4j"; print; next }
      { print }
    ' "$file" > tmp && mv tmp "$file"
  fi
done

echo "✅ Controladores y filtros listos con @Slf4j."
