#!/bin/bash
# ================================================================
# 🧩 CENATE - Inserta correctamente @Slf4j (macOS compatible)
# ================================================================
BASE_DIR="src/main/java/com/styp/cenate"
echo "🔍 Escaneando archivos Java en $BASE_DIR ..."

FILES=$(grep -rl "public class" $BASE_DIR | grep -E "Controller|Filter|ServiceImpl|Aspect|Evaluator|Area\.java")

for FILE in $FILES; do
  if ! grep -q "@Slf4j" "$FILE"; then
    echo "🛠️  Corrigiendo e insertando @Slf4j en: $FILE"
    cp "$FILE" "$FILE.bak"

    # Insertar import después de package
    awk '
      /^package / {
        print;
        print "import lombok.extern.slf4j.Slf4j;";
        next
      }
      /^public class/ {
        print "@Slf4j";
      }
      { print }
    ' "$FILE" > tmp && mv tmp "$FILE"
  else
    echo "✅ Ya contiene @Slf4j: $FILE"
  fi
done

echo "✨ Proceso completado sin errores de import."
