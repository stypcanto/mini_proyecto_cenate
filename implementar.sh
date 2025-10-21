#!/bin/bash
# =============================================================================
# SCRIPT DE IMPLEMENTACIÓN AUTOMÁTICA
# Sistema de Gestión de Personal - CENATE
# =============================================================================

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║  🚀 IMPLEMENTACIÓN AUTOMÁTICA - GESTIÓN DE PERSONAL                 ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorios
PROJECT_ROOT="/Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# =============================================================================
# PASO 1: VERIFICAR ARCHIVOS CREADOS
# =============================================================================

echo -e "${BLUE}[PASO 1/5]${NC} Verificando archivos creados..."
echo ""

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
    else
        echo -e "${RED}❌${NC} $2 - NO ENCONTRADO"
        return 1
    fi
}

echo "📁 Backend - Models:"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/model/PersonalCnt.java" "PersonalCnt.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/model/TipoDocumento.java" "TipoDocumento.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/model/Area.java" "Area.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/model/RegimenLaboral.java" "RegimenLaboral.java"

echo ""
echo "📁 Backend - Repositories:"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/repository/PersonalCntRepository.java" "PersonalCntRepository.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/repository/TipoDocumentoRepository.java" "TipoDocumentoRepository.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/repository/AreaRepository.java" "AreaRepository.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/repository/RegimenLaboralRepository.java" "RegimenLaboralRepository.java"

echo ""
echo "📁 Backend - Services:"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/service/PersonalCntService.java" "PersonalCntService.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/service/TipoDocumentoService.java" "TipoDocumentoService.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/service/AreaService.java" "AreaService.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/service/RegimenLaboralService.java" "RegimenLaboralService.java"

echo ""
echo "📁 Backend - Controllers:"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/api/PersonalCntController.java" "PersonalCntController.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/api/TipoDocumentoController.java" "TipoDocumentoController.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/api/AreaController.java" "AreaController.java"
check_file "$BACKEND_DIR/src/main/java/styp/com/cenate/api/RegimenLaboralController.java" "RegimenLaboralController.java"

echo ""
echo "📁 Frontend:"
check_file "$FRONTEND_DIR/src/pages/admin/AdminUsersManagement.jsx" "AdminUsersManagement.jsx"

echo ""
echo "📁 Documentación:"
check_file "$PROJECT_ROOT/GUIA_IMPLEMENTACION_GESTION_PERSONAL.md" "GUIA_IMPLEMENTACION_GESTION_PERSONAL.md"
check_file "$PROJECT_ROOT/IMPLEMENTACION_RAPIDA.md" "IMPLEMENTACION_RAPIDA.md"
check_file "$BACKEND_DIR/sql/verificacion_y_datos_prueba.sql" "verificacion_y_datos_prueba.sql"

echo ""
echo -e "${GREEN}✅ Verificación de archivos completada${NC}"
echo ""
read -p "Presiona Enter para continuar..."

# =============================================================================
# PASO 2: EJECUTAR SCRIPT SQL
# =============================================================================

echo ""
echo -e "${BLUE}[PASO 2/5]${NC} Ejecutando script SQL..."
echo ""
echo "Este paso insertará datos de prueba en la base de datos."
echo ""
read -p "¿Deseas ejecutar el script SQL? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Ejecutando script SQL...${NC}"
    psql -U postgres -d maestro_cenate -f "$BACKEND_DIR/sql/verificacion_y_datos_prueba.sql"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Script SQL ejecutado exitosamente${NC}"
    else
        echo -e "${RED}❌ Error al ejecutar script SQL${NC}"
        echo "Por favor ejecuta manualmente:"
        echo "psql -U postgres -d maestro_cenate -f backend/sql/verificacion_y_datos_prueba.sql"
    fi
else
    echo -e "${YELLOW}⏭️  Paso SQL omitido${NC}"
fi

echo ""
read -p "Presiona Enter para continuar..."

# =============================================================================
# PASO 3: COMPILAR BACKEND
# =============================================================================

echo ""
echo -e "${BLUE}[PASO 3/5]${NC} Compilando Backend..."
echo ""

cd "$BACKEND_DIR"

echo -e "${YELLOW}Limpiando y compilando con Gradle...${NC}"
./gradlew clean build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend compilado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al compilar backend${NC}"
    exit 1
fi

echo ""
read -p "Presiona Enter para continuar..."

# =============================================================================
# PASO 4: INICIAR BACKEND
# =============================================================================

echo ""
echo -e "${BLUE}[PASO 4/5]${NC} Iniciando Backend..."
echo ""
echo -e "${YELLOW}⚠️  Abriendo una nueva terminal para el backend...${NC}"
echo ""

# Detectar el sistema operativo
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript <<EOF
tell application "Terminal"
    do script "cd '$BACKEND_DIR' && echo '🚀 Iniciando Backend...' && ./gradlew bootRun"
    activate
end tell
EOF
    echo -e "${GREEN}✅ Backend iniciándose en nueva terminal${NC}"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd '$BACKEND_DIR' && echo '🚀 Iniciando Backend...' && ./gradlew bootRun; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd '$BACKEND_DIR' && echo '🚀 Iniciando Backend...' && ./gradlew bootRun; bash" &
    else
        echo -e "${YELLOW}⚠️  No se pudo abrir una nueva terminal automáticamente${NC}"
        echo "Por favor abre una nueva terminal y ejecuta:"
        echo "cd $BACKEND_DIR && ./gradlew bootRun"
    fi
fi

sleep 2
echo ""
echo -e "${YELLOW}Esperando 10 segundos para que el backend inicie...${NC}"
sleep 10

echo ""
read -p "Presiona Enter cuando el backend esté corriendo..."

# =============================================================================
# PASO 5: INICIAR FRONTEND
# =============================================================================

echo ""
echo -e "${BLUE}[PASO 5/5]${NC} Iniciando Frontend..."
echo ""

cd "$FRONTEND_DIR"

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Instalando dependencias de npm...${NC}"
    npm install
fi

echo -e "${YELLOW}⚠️  Abriendo una nueva terminal para el frontend...${NC}"
echo ""

# Detectar el sistema operativo
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript <<EOF
tell application "Terminal"
    do script "cd '$FRONTEND_DIR' && echo '🚀 Iniciando Frontend...' && npm start"
    activate
end tell
EOF
    echo -e "${GREEN}✅ Frontend iniciándose en nueva terminal${NC}"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd '$FRONTEND_DIR' && echo '🚀 Iniciando Frontend...' && npm start; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd '$FRONTEND_DIR' && echo '🚀 Iniciando Frontend...' && npm start; bash" &
    else
        echo -e "${YELLOW}⚠️  No se pudo abrir una nueva terminal automáticamente${NC}"
        echo "Por favor abre una nueva terminal y ejecuta:"
        echo "cd $FRONTEND_DIR && npm start"
    fi
fi

sleep 3

# =============================================================================
# FINALIZACIÓN
# =============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║  🎉 IMPLEMENTACIÓN COMPLETADA                                        ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Backend:${NC} http://localhost:8080"
echo -e "${GREEN}✅ Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}✅ Panel Admin:${NC} http://localhost:3000/admin/users"
echo ""
echo "📚 Documentación disponible:"
echo "   • GUIA_IMPLEMENTACION_GESTION_PERSONAL.md - Guía completa"
echo "   • IMPLEMENTACION_RAPIDA.md - Comandos rápidos"
echo ""
echo -e "${YELLOW}⚠️  Importante:${NC}"
echo "   • Asegúrate de tener un usuario con rol ADMIN o SUPERADMIN"
echo "   • El backend debe estar corriendo antes de usar el frontend"
echo "   • PostgreSQL debe estar activo"
echo ""
echo -e "${BLUE}🧪 Para probar:${NC}"
echo "   1. Abre http://localhost:3000/admin/users"
echo "   2. Inicia sesión con tu usuario ADMIN"
echo "   3. Verás 5 pestañas: Usuarios, Personal, Tipos Doc, Áreas, Regímenes"
echo "   4. Prueba crear, editar y eliminar registros"
echo ""
echo -e "${GREEN}¡Disfruta de tu nuevo sistema de gestión de personal!${NC} 🚀"
echo ""
