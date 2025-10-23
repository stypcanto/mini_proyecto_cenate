#!/bin/bash

# ========================================================================
# 🚀 Script de Instalación Automática - Sistema MBAC CENATE
# ------------------------------------------------------------------------
# Este script automatiza la instalación de todos los componentes MBAC
# ========================================================================

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Banner
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         🏥  Sistema MBAC CENATE - Instalación             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Variables
PROJECT_DIR="/Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend"
DOWNLOADS_DIR="$HOME/Downloads"

# Función para imprimir mensajes
print_step() {
    echo -e "${BLUE}[PASO $1]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar que estamos en el directorio correcto
print_step "1" "Verificando directorio del proyecto..."
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "No se encuentra el directorio del proyecto: $PROJECT_DIR"
    exit 1
fi
print_success "Directorio encontrado"

# Cambiar al directorio del proyecto
cd "$PROJECT_DIR" || exit 1

# Crear estructura de carpetas
print_step "2" "Creando estructura de carpetas..."
mkdir -p src/components/layout
mkdir -p src/pages/admin
print_success "Carpetas creadas"

# Instalar dependencias
print_step "3" "Instalando dependencias..."
if command -v npm &> /dev/null; then
    npm install react-icons
    print_success "react-icons instalado"
    
    # Verificar react-router-dom
    if grep -q "react-router-dom" package.json; then
        print_success "react-router-dom ya instalado"
    else
        npm install react-router-dom
        print_success "react-router-dom instalado"
    fi
else
    print_error "npm no está instalado"
    exit 1
fi

# Mensaje de instrucciones
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅  Preparación Completada                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📁 Estructura creada:${NC}"
echo "  ✓ src/components/layout/"
echo "  ✓ src/pages/admin/"
echo ""
echo -e "${BLUE}📦 Dependencias instaladas:${NC}"
echo "  ✓ react-icons"
echo "  ✓ react-router-dom"
echo ""
echo -e "${YELLOW}🛣️  Próximos pasos MANUALES:${NC}"
echo ""
echo "1. Descarga los 5 archivos que creé:"
echo "   • MBACSidebar_v2.jsx"
echo "   • UsersManagement.jsx"
echo "   • RolesManagement.jsx"
echo "   • MBACControl.jsx"
echo "   • AuditLog.jsx"
echo ""
echo "2. Copia los archivos a sus ubicaciones:"
echo "   cp ~/Downloads/MBACSidebar_v2.jsx src/components/layout/MBACSidebar.jsx"
echo "   cp ~/Downloads/UsersManagement.jsx src/pages/admin/"
echo "   cp ~/Downloads/RolesManagement.jsx src/pages/admin/"
echo "   cp ~/Downloads/MBACControl.jsx src/pages/admin/"
echo "   cp ~/Downloads/AuditLog.jsx src/pages/admin/"
echo ""
echo "3. Agrega las rutas en tu archivo de rutas (App.jsx):"
echo "   <Route path=\"/admin/usuarios\" element={<UsersManagement />} />"
echo "   <Route path=\"/admin/roles\" element={<RolesManagement />} />"
echo "   <Route path=\"/admin/permisos\" element={<MBACControl />} />"
echo "   <Route path=\"/admin/auditoria\" element={<AuditLog />} />"
echo ""
echo "4. Inicia el servidor:"
echo "   npm start"
echo ""
echo -e "${GREEN}🚀 ¡Listo para continuar!${NC}"
echo ""
