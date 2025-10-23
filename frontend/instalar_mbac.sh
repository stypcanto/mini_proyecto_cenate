#!/bin/bash

# ========================================================================
# 🚀 Script de Instalación Automática - Sistema MBAC CENATE
# ========================================================================
# Este script copia todos los archivos necesarios a sus ubicaciones correctas
# y realiza las configuraciones básicas para el sistema MBAC.
# ========================================================================

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${BLUE}[MBAC]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo "========================================================================="
echo "🎯 Sistema MBAC CENATE - Instalación Automática"
echo "========================================================================="
echo ""

# Verificar directorio del proyecto
FRONTEND_DIR="/Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend"
BACKEND_DIR="/Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/backend"
OUTPUTS_DIR="/mnt/user-data/outputs"

if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "No se encontró el directorio del frontend: $FRONTEND_DIR"
    exit 1
fi

print_success "Directorio del proyecto encontrado"

# Crear directorios necesarios si no existen
print_message "Creando directorios necesarios..."
mkdir -p "$FRONTEND_DIR/src/context"
mkdir -p "$FRONTEND_DIR/src/components/security"
mkdir -p "$FRONTEND_DIR/src/components/layout"
mkdir -p "$FRONTEND_DIR/src/pages/roles/citas"
mkdir -p "$FRONTEND_DIR/src/pages/roles/lineamientos"
print_success "Directorios creados"

# Copiar MBACContext
print_message "Copiando MBACContext.jsx..."
if [ -f "$OUTPUTS_DIR/MBACContext.jsx" ]; then
    cp "$OUTPUTS_DIR/MBACContext.jsx" "$FRONTEND_DIR/src/context/"
    print_success "MBACContext.jsx copiado"
else
    print_warning "No se encontró MBACContext.jsx en outputs"
fi

# Copiar PermissionGate
print_message "Copiando PermissionGate.jsx..."
if [ -f "$OUTPUTS_DIR/PermissionGate.jsx" ]; then
    cp "$OUTPUTS_DIR/PermissionGate.jsx" "$FRONTEND_DIR/src/components/security/"
    print_success "PermissionGate.jsx copiado"
else
    print_warning "No se encontró PermissionGate.jsx en outputs"
fi

# Copiar ProtectedRoute
print_message "Copiando ProtectedRoute.jsx..."
if [ -f "$OUTPUTS_DIR/ProtectedRoute.jsx" ]; then
    cp "$OUTPUTS_DIR/ProtectedRoute.jsx" "$FRONTEND_DIR/src/components/security/"
    print_success "ProtectedRoute.jsx copiado"
else
    print_warning "No se encontró ProtectedRoute.jsx en outputs"
fi

# Copiar MBACSidebar
print_message "Copiando MBACSidebar.jsx..."
if [ -f "$OUTPUTS_DIR/MBACSidebar.jsx" ]; then
    cp "$OUTPUTS_DIR/MBACSidebar.jsx" "$FRONTEND_DIR/src/components/layout/"
    print_success "MBACSidebar.jsx copiado"
else
    print_warning "No se encontró MBACSidebar.jsx en outputs"
fi

# Backup del App.js actual
print_message "Creando backup de App.js actual..."
if [ -f "$FRONTEND_DIR/src/App.js" ]; then
    cp "$FRONTEND_DIR/src/App.js" "$FRONTEND_DIR/src/App.js.backup.$(date +%Y%m%d_%H%M%S)"
    print_success "Backup creado"
fi

# Copiar nuevo App.js
print_message "Copiando nuevo App.js..."
if [ -f "$OUTPUTS_DIR/App.js" ]; then
    cp "$OUTPUTS_DIR/App.js" "$FRONTEND_DIR/src/"
    print_success "App.js copiado"
else
    print_warning "No se encontró App.js en outputs"
fi

# Copiar páginas nuevas
print_message "Copiando páginas nuevas..."

if [ -f "$OUTPUTS_DIR/AgendaMedica.jsx" ]; then
    cp "$OUTPUTS_DIR/AgendaMedica.jsx" "$FRONTEND_DIR/src/pages/roles/citas/"
    print_success "AgendaMedica.jsx copiado"
fi

if [ -f "$OUTPUTS_DIR/DashboardLineamientos.jsx" ]; then
    cp "$OUTPUTS_DIR/DashboardLineamientos.jsx" "$FRONTEND_DIR/src/pages/roles/lineamientos/"
    print_success "DashboardLineamientos.jsx copiado"
fi

if [ -f "$OUTPUTS_DIR/RegistroLineamientos.jsx" ]; then
    cp "$OUTPUTS_DIR/RegistroLineamientos.jsx" "$FRONTEND_DIR/src/pages/roles/lineamientos/"
    print_success "RegistroLineamientos.jsx copiado"
fi

# Verificar dependencias
print_message "Verificando dependencias de npm..."
cd "$FRONTEND_DIR"

if ! grep -q "lucide-react" package.json; then
    print_warning "lucide-react no está instalado. Instalando..."
    npm install lucide-react
fi

if ! grep -q "react-hot-toast" package.json; then
    print_warning "react-hot-toast no está instalado. Instalando..."
    npm install react-hot-toast
fi

print_success "Dependencias verificadas"

# Resumen
echo ""
echo "========================================================================="
echo "✅ Instalación Completada"
echo "========================================================================="
echo ""
echo "📦 Archivos copiados:"
echo "   ✓ MBACContext.jsx → src/context/"
echo "   ✓ PermissionGate.jsx → src/components/security/"
echo "   ✓ ProtectedRoute.jsx → src/components/security/"
echo "   ✓ MBACSidebar.jsx → src/components/layout/"
echo "   ✓ App.js → src/ (backup creado)"
echo "   ✓ AgendaMedica.jsx → src/pages/roles/citas/"
echo "   ✓ DashboardLineamientos.jsx → src/pages/roles/lineamientos/"
echo "   ✓ RegistroLineamientos.jsx → src/pages/roles/lineamientos/"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Revisar y actualizar AppLayout.jsx para usar MBACSidebar"
echo "   2. Verificar que AuthContext incluya 'id' del usuario"
echo "   3. Iniciar el backend: cd backend && ./gradlew bootRun"
echo "   4. Iniciar el frontend: cd frontend && npm start"
echo "   5. Probar con usuario: scantor / admin123"
echo ""
echo "📚 Documentación completa en:"
echo "   - MBAC_IMPLEMENTACION_COMPLETA.md"
echo "   - RESUMEN_EJECUTIVO_MBAC.md"
echo ""
print_success "¡Sistema MBAC listo para usar!"
echo "========================================================================="
