#!/bin/bash
# ======================================================
# 🧩 CENATE – Reparador automático de Lombok (@Data)
# ------------------------------------------------------
# Este script agrega @Data a todas las clases que
# usan campos privados pero no tienen anotaciones Lombok
# ======================================================

BASE_DIR="src/main/java"

echo "🔍 Buscando clases sin @Data, @Getter ni @Setter..."

# Buscar archivos .java que tengan 'private' pero sin @Data/@Getter/@Setter
grep -rl "private " "$BASE_DIR" | while read file; do
  if ! grep -q "@Data" "$file" && ! grep -q "@Getter" "$file" && ! grep -q "@Setter" "$file"; then
    echo "🩹 Corrigiendo: $file"
    cp "$file" "$file.bak"  # Copia de seguridad
    # Insertar import lombok.Data si no existe
    if ! grep -q "import lombok.Data" "$file"; then
      sed -i '' '/package /a\
import lombok.Data;\
' "$file"
    fi
    # Insertar @Data encima de la clase
    sed -i '' '/public class /i\
@Data
' "$file"
  fi
done

echo "✅ Proceso completado. Archivos corregidos arriba ↑"
echo "💾 Se crearon copias de seguridad con extensión .bak"
