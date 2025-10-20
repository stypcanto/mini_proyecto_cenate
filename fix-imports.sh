#!/bin/bash

# ========================================================================
# 🔧 SCRIPT PARA CORREGIR TODOS LOS IMPORTS
# ========================================================================
# Convierte todos los imports de @/ a rutas relativas
# ========================================================================

cd "$(dirname "$0")/frontend/src" || exit 1

echo "🔧 Corrigiendo imports en todos los archivos..."

# Función para reemplazar imports
fix_imports() {
    local file=$1
    
    # Contar niveles de profundidad desde src/
    local depth=$(echo "$file" | grep -o "/" | wc -l)
    local relative_path=""
    
    # Construir path relativo basado en profundidad
    for ((i=0; i<depth; i++)); do
        relative_path="../$relative_path"
    done
    
    # Si está en src/, no necesita ../
    if [ $depth -eq 0 ]; then
        relative_path="./"
    fi
    
    # Reemplazar imports
    sed -i '' \
        -e "s|from ['\"]@/context/AuthContext['\"]|from \"${relative_path}context/AuthContext\"|g" \
        -e "s|from ['\"]@/hooks/useAuth['\"]|from \"${relative_path}hooks/useAuth\"|g" \
        -e "s|from ['\"]@/components/security/ProtectedRoute['\"]|from \"${relative_path}components/security/ProtectedRoute\"|g" \
        -e "s|from ['\"]@/api/auth['\"]|from \"${relative_path}api/auth\"|g" \
        -e "s|from ['\"]@/lib/apiClient['\"]|from \"${relative_path}lib/apiClient\"|g" \
        "$file"
}

# Buscar todos los archivos .js y .jsx
find . -type f \( -name "*.js" -o -name "*.jsx" \) | while read file; do
    if grep -q "@/" "$file" 2>/dev/null; then
        echo "  Corrigiendo: $file"
        fix_imports "$file"
    fi
done

echo "✅ Imports corregidos"
