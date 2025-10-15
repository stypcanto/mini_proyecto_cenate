#!/bin/bash

# ============================================================================
# SCRIPT DE VERIFICACIÓN POST-IMPLEMENTACIÓN MBAC
# Sistema: CENATE - Centro Nacional de Telemedicina del Perú
# ============================================================================

echo "🔍 VERIFICANDO IMPLEMENTACIÓN DEL SISTEMA MBAC..."
echo "=================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de verificaciones
PASSED=0
FAILED=0

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2 - FALTA: $1"
        ((FAILED++))
    fi
}

# Función para verificar directorio
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2 - FALTA: $1"
        ((FAILED++))
    fi
}

echo "📁 VERIFICANDO ESTRUCTURA DE DIRECTORIOS..."
echo "-------------------------------------------"
check_dir "src/main/java/styp/com/cenate/model/view" "Directorio model/view"
check_dir "src/main/java/styp/com/cenate/repository/mbac" "Directorio repository/mbac"
check_dir "src/main/java/styp/com/cenate/dto/mbac" "Directorio dto/mbac"
check_dir "src/main/java/styp/com/cenate/service/mbac" "Directorio service/mbac"
check_dir "src/main/java/styp/com/cenate/service/mbac/impl" "Directorio service/mbac/impl"
check_dir "src/main/java/styp/com/cenate/api/mbac" "Directorio api/mbac"
check_dir "src/main/java/styp/com/cenate/security/mbac" "Directorio security/mbac"
echo ""

echo "📄 VERIFICANDO ENTIDADES JPA..."
echo "-------------------------------"
check_file "src/main/java/styp/com/cenate/model/ModuloSistema.java" "ModuloSistema.java"
check_file "src/main/java/styp/com/cenate/model/PaginaModulo.java" "PaginaModulo.java"
check_file "src/main/java/styp/com/cenate/model/PermisoModular.java" "PermisoModular.java"
check_file "src/main/java/styp/com/cenate/model/ContextoModulo.java" "ContextoModulo.java"
check_file "src/main/java/styp/com/cenate/model/view/PermisoActivoView.java" "PermisoActivoView.java"
check_file "src/main/java/styp/com/cenate/model/view/AuditoriaModularView.java" "AuditoriaModularView.java"
echo ""

echo "🗄️ VERIFICANDO REPOSITORIOS..."
echo "------------------------------"
check_file "src/main/java/styp/com/cenate/repository/mbac/ModuloSistemaRepository.java" "ModuloSistemaRepository.java"
check_file "src/main/java/styp/com/cenate/repository/mbac/PaginaModuloRepository.java" "PaginaModuloRepository.java"
check_file "src/main/java/styp/com/cenate/repository/mbac/PermisoModularRepository.java" "PermisoModularRepository.java"
check_file "src/main/java/styp/com/cenate/repository/mbac/ContextoModuloRepository.java" "ContextoModuloRepository.java"
check_file "src/main/java/styp/com/cenate/repository/mbac/PermisoActivoViewRepository.java" "PermisoActivoViewRepository.java"
check_file "src/main/java/styp/com/cenate/repository/mbac/AuditoriaModularViewRepository.java" "AuditoriaModularViewRepository.java"
echo ""

echo "📦 VERIFICANDO DTOs..."
echo "---------------------"
check_file "src/main/java/styp/com/cenate/dto/mbac/PermisosDTO.java" "PermisosDTO.java"
check_file "src/main/java/styp/com/cenate/dto/mbac/PermisoUsuarioResponseDTO.java" "PermisoUsuarioResponseDTO.java"
check_file "src/main/java/styp/com/cenate/dto/mbac/AuditoriaModularResponseDTO.java" "AuditoriaModularResponseDTO.java"
check_file "src/main/java/styp/com/cenate/dto/mbac/CheckPermisoRequestDTO.java" "CheckPermisoRequestDTO.java"
check_file "src/main/java/styp/com/cenate/dto/mbac/CheckPermisoResponseDTO.java" "CheckPermisoResponseDTO.java"
echo ""

echo "⚙️ VERIFICANDO SERVICIOS..."
echo "--------------------------"
check_file "src/main/java/styp/com/cenate/service/mbac/PermisosService.java" "PermisosService.java"
check_file "src/main/java/styp/com/cenate/service/mbac/AuditoriaService.java" "AuditoriaService.java"
check_file "src/main/java/styp/com/cenate/service/mbac/impl/PermisosServiceImpl.java" "PermisosServiceImpl.java"
check_file "src/main/java/styp/com/cenate/service/mbac/impl/AuditoriaServiceImpl.java" "AuditoriaServiceImpl.java"
echo ""

echo "🌐 VERIFICANDO CONTROLADORES REST..."
echo "------------------------------------"
check_file "src/main/java/styp/com/cenate/api/mbac/PermisosController.java" "PermisosController.java"
check_file "src/main/java/styp/com/cenate/api/mbac/AuditoriaController.java" "AuditoriaController.java"
echo ""

echo "🔒 VERIFICANDO COMPONENTES DE SEGURIDAD..."
echo "-----------------------------------------"
check_file "src/main/java/styp/com/cenate/security/mbac/MBACPermissionEvaluator.java" "MBACPermissionEvaluator.java"
check_file "src/main/java/styp/com/cenate/security/mbac/CheckMBACPermission.java" "CheckMBACPermission.java"
check_file "src/main/java/styp/com/cenate/security/mbac/MBACPermissionAspect.java" "MBACPermissionAspect.java"
check_file "src/main/java/styp/com/cenate/config/MBACSecurityConfig.java" "MBACSecurityConfig.java"
echo ""

echo "📚 VERIFICANDO DOCUMENTACIÓN..."
echo "-------------------------------"
check_file "MBAC_README.md" "MBAC_README.md"
check_file "INSTRUCCIONES_COMPILACION.md" "INSTRUCCIONES_COMPILACION.md"
echo ""

echo "🗃️ VERIFICANDO SCRIPTS SQL..."
echo "-----------------------------"
check_file "sql/mbac_init_data.sql" "mbac_init_data.sql"
echo ""

echo "🔧 VERIFICANDO CONFIGURACIÓN..."
echo "-------------------------------"
check_file "build.gradle" "build.gradle"

# Verificar dependencia de AOP en build.gradle
if grep -q "spring-boot-starter-aop" build.gradle; then
    echo -e "${GREEN}✓${NC} Dependencia de AOP configurada"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Dependencia de AOP NO configurada en build.gradle"
    ((FAILED++))
fi
echo ""

echo "=================================================="
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "=================================================="
echo -e "Total de verificaciones: $((PASSED + FAILED))"
echo -e "${GREEN}Exitosas: ${PASSED}${NC}"
echo -e "${RED}Fallidas: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ¡IMPLEMENTACIÓN COMPLETA!${NC}"
    echo ""
    echo "📋 PRÓXIMOS PASOS:"
    echo "1. Ejecutar script SQL: psql -U postgres -d maestro_cenate -f sql/mbac_init_data.sql"
    echo "2. Compilar proyecto: ./gradlew cleanBuild"
    echo "3. Ejecutar aplicación: ./gradlew bootRun"
    echo "4. Verificar endpoints en: http://localhost:8080/swagger-ui.html"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  FALTAN COMPONENTES${NC}"
    echo "Por favor, revisa los archivos faltantes listados arriba."
    echo ""
    exit 1
fi
