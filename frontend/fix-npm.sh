#!/bin/bash
# ==========================================================
# 🧰 Script automático para reparar npm (CENATE frontend)
# Autor: Styp Canto ✨
# Descripción:
#   - Elimina node_modules y caché corrupta
#   - Limpia y reinstala dependencias
#   - Instala librerías necesarias
#   - Ejecuta build final de React
# ==========================================================

echo "🚀 Iniciando reparación de entorno npm para CENATE frontend..."
sleep 1

# --- Paso 1: Borrar carpetas previas con método rápido ---
echo "🧹 Eliminando node_modules y lock..."
sudo rm -rf node_modules package-lock.json 2>/dev/null
find node_modules -type f -delete 2>/dev/null
find node_modules -type d -empty -delete 2>/dev/null

# --- Paso 2: Limpiar caché npm ---
echo "🧽 Limpiando caché npm..."
npm cache clean --force

# --- Paso 3: Configurar mirror rápido (más veloz en LATAM) ---
echo "⚡ Configurando registry rápido..."
npm config set registry https://registry.npmmirror.com

# --- Paso 4: Reinstalar dependencias base ---
echo "📦 Instalando dependencias base..."
npm install --legacy-peer-deps

# --- Paso 5: Instalar librerías requeridas del proyecto ---
echo "🧩 Instalando librerías adicionales..."
npm install react-router-dom react-hot-toast clsx lucide-react --save

# --- Paso 6: Compilación del proyecto ---
echo "🏗️ Compilando proyecto React..."
npm run build

# --- Paso 7: Resultado final ---
if [ $? -eq 0 ]; then
  echo "✅ Build completado con éxito."
  echo "🌙 Ya puedes irte a dormir tranquilo, Styp 😴"
else
  echo "❌ Algo falló en la compilación. Revisa los logs arriba."
fi

echo "🧩 Script finalizado."

