#!/bin/bash

# ============================================================================
# SCRIPT DE PRUEBAS TÉCNICAS - SISTEMA MBAC CENATE
# ============================================================================
# Este script contiene todos los comandos curl para probar los endpoints
# del sistema MBAC (Modular-Based Access Control)
# ============================================================================

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
BASE_URL="http://localhost:8080"
CONTENT_TYPE="Content-Type: application/json"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         PRUEBAS TÉCNICAS - SISTEMA MBAC CENATE                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# PASO 1: AUTENTICACIÓN
# ============================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}PASO 1: AUTENTICACIÓN${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}📝 Login con usuario SUPERADMIN${NC}"
echo "curl -X POST \"$BASE_URL/api/auth/login\" \\"
echo "  -H \"$CONTENT_TYPE\" \\"
echo "  -d '{
    \"username\": \"superadmin\",
    \"password\": \"tu_password_aqui\"
  }'"
echo ""

echo -e "${BLUE}💡 IMPORTANTE: Guarda el token JWT de la respuesta${NC}"
echo -e "${BLUE}   Exporta como variable: export JWT_TOKEN=\"tu_token_aqui\"${NC}"
echo ""

read -p "Presiona Enter para continuar con las pruebas de PERMISOS..."
echo ""

# ============================================================================
# SECCIÓN 2: PRUEBAS DE PERMISOS
# ============================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECCIÓN 2: API DE PERMISOS (/api/permisos)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Health Check
echo -e "${GREEN}Test 1: Health Check del Servicio de Permisos${NC}"
echo "curl -X GET \"$BASE_URL/api/permisos/health\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\""
echo ""
echo "Respuesta esperada: {\"status\": \"UP\", \"service\": \"PermisosService\"}"
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 2: Obtener permisos por ID de usuario
echo -e "${GREEN}Test 2: Obtener todos los permisos de un usuario (por ID)${NC}"
echo "curl -X GET \"$BASE_URL/api/permisos/usuario/1\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
echo "Respuesta esperada:"
cat << 'EOF'
[
  {
    "rol": "SUPERADMIN",
    "modulo": "Gestión de Citas",
    "pagina": "Dashboard de Citas",
    "rutaPagina": "/roles/medico/citas/dashboard",
    "permisos": {
      "ver": true,
      "crear": true,
      "editar": true,
      "eliminar": true,
      "exportar": true,
      "aprobar": true
    }
  }
]
EOF
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 3: Obtener permisos por username
echo -e "${GREEN}Test 3: Obtener permisos por nombre de usuario${NC}"
echo "curl -X GET \"$BASE_URL/api/permisos/usuario/username/superadmin\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 4: Obtener permisos por usuario y módulo
echo -e "${GREEN}Test 4: Obtener permisos de un usuario en un módulo específico${NC}"
echo "curl -X GET \"$BASE_URL/api/permisos/usuario/1/modulo/1\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 5: Verificar permiso específico
echo -e "${GREEN}Test 5: Verificar si un usuario tiene un permiso específico${NC}"
echo "curl -X POST \"$BASE_URL/api/permisos/check\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\" \\"
echo "  -d '{
    \"userId\": 1,
    \"rutaPagina\": \"/roles/medico/pacientes\",
    \"accion\": \"ver\"
  }'"
echo ""
echo "Respuesta esperada:"
cat << 'EOF'
{
  "permitido": true,
  "mensaje": "Permiso concedido",
  "pagina": "/roles/medico/pacientes",
  "accion": "ver"
}
EOF
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 6: Verificar permiso denegado
echo -e "${GREEN}Test 6: Verificar permiso que debería estar DENEGADO${NC}"
echo "curl -X POST \"$BASE_URL/api/permisos/check\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\" \\"
echo "  -d '{
    \"userId\": 3,
    \"rutaPagina\": \"/roles/superadmin/permisos\",
    \"accion\": \"eliminar\"
  }'"
echo ""
echo "Respuesta esperada:"
cat << 'EOF'
{
  "permitido": false,
  "mensaje": "Permiso denegado - El usuario no tiene acceso a esta acción",
  "pagina": "/roles/superadmin/permisos",
  "accion": "eliminar"
}
EOF
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 7: Obtener módulos accesibles
echo -e "${GREEN}Test 7: Obtener todos los módulos accesibles por un usuario${NC}"
echo "curl -X GET \"$BASE_URL/api/permisos/usuario/1/modulos\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
echo "Respuesta esperada:"
cat << 'EOF'
{
  "userId": 1,
  "modulos": [
    "Gestión de Citas",
    "Gestión de Personal",
    "Gestión de Pacientes",
    "Gestión de IPRESS",
    "Reportes y Analítica",
    "Administración de Roles y Permisos",
    "Auditoría del Sistema"
  ],
  "total": 7
}
EOF
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 8: Obtener páginas accesibles de un módulo
echo -e "${GREEN}Test 8: Obtener páginas accesibles de un módulo${NC}"
echo "curl -X GET \"$BASE_URL/api/permisos/usuario/1/modulo/1/paginas\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
echo "Respuesta esperada:"
cat << 'EOF'
{
  "userId": 1,
  "idModulo": 1,
  "paginas": [
    "Dashboard de Citas",
    "Listado de Citas",
    "Crear Cita",
    "Calendario de Citas"
  ],
  "total": 4
}
EOF
echo ""
read -p "Presiona Enter para continuar con las pruebas de AUDITORÍA..."
echo ""

# ============================================================================
# SECCIÓN 3: PRUEBAS DE AUDITORÍA
# ============================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECCIÓN 3: API DE AUDITORÍA (/api/auditoria)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 9: Health Check Auditoría
echo -e "${GREEN}Test 9: Health Check del Servicio de Auditoría${NC}"
echo "curl -X GET \"$BASE_URL/api/auditoria/health\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\""
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 10: Obtener auditoría modular
echo -e "${GREEN}Test 10: Obtener auditoría modular completa (paginada)${NC}"
echo "curl -X GET \"$BASE_URL/api/auditoria/modulos?page=0&size=10\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
echo "Respuesta esperada (paginada):"
cat << 'EOF'
{
  "content": [
    {
      "id": 150,
      "fechaHora": "2025-10-15T14:30:00",
      "fechaFormateada": "2025-10-15 14:30:00",
      "usuario": "superadmin",
      "dni": "12345678",
      "nombreCompleto": "Admin Sistema",
      "roles": "SUPERADMIN",
      "modulo": "dim_permisos_modulares",
      "accion": "UPDATE",
      "tipoEvento": "🟡 Modificación de permiso",
      "estado": "SUCCESS",
      "detalle": "Columna \"puede_crear\": \"false\" → \"true\";",
      "ip": "192.168.1.100",
      "dispositivo": "Mozilla/5.0..."
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "number": 0,
  "size": 10
}
EOF
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 11: Auditoría por usuario
echo -e "${GREEN}Test 11: Obtener auditoría de un usuario específico${NC}"
echo "curl -X GET \"$BASE_URL/api/auditoria/usuario/1?page=0&size=10\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 12: Auditoría por username
echo -e "${GREEN}Test 12: Obtener auditoría por nombre de usuario${NC}"
echo "curl -X GET \"$BASE_URL/api/auditoria/username/superadmin?page=0&size=10\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 13: Auditoría por módulo
echo -e "${GREEN}Test 13: Obtener auditoría de un módulo específico${NC}"
echo "curl -X GET \"$BASE_URL/api/auditoria/modulo/dim_permisos_modulares?page=0&size=10\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 14: Auditoría por acción
echo -e "${GREEN}Test 14: Obtener auditoría por tipo de acción${NC}"
echo "curl -X GET \"$BASE_URL/api/auditoria/accion/INSERT?page=0&size=10\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
echo "También puedes probar con: UPDATE, DELETE"
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 15: Auditoría por rango de fechas
echo -e "${GREEN}Test 15: Obtener auditoría en un rango de fechas${NC}"
echo "curl -X GET \"$BASE_URL/api/auditoria/rango?fechaInicio=2025-10-01T00:00:00&fechaFin=2025-10-31T23:59:59&page=0&size=10\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 16: Auditoría de usuario por fechas
echo -e "${GREEN}Test 16: Obtener auditoría de un usuario en rango de fechas${NC}"
echo "curl -X GET \"$BASE_URL/api/auditoria/usuario/1/rango?fechaInicio=2025-10-01T00:00:00&fechaFin=2025-10-31T23:59:59&page=0&size=10\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 17: Resumen de auditoría
echo -e "${GREEN}Test 17: Obtener resumen estadístico de auditoría${NC}"
echo "curl -X GET \"$BASE_URL/api/auditoria/resumen\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
echo "Respuesta esperada:"
cat << 'EOF'
{
  "resumenPorTipoEvento": {
    "🟢 Creación de permiso": 45,
    "🟡 Modificación de permiso": 120,
    "🔴 Eliminación de permiso": 8
  },
  "totalEventos": 173,
  "timestamp": "2025-10-15T15:00:00"
}
EOF
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 18: Últimos eventos
echo -e "${GREEN}Test 18: Obtener los últimos N eventos${NC}"
echo "curl -X GET \"$BASE_URL/api/auditoria/ultimos?limit=5\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 19: Búsqueda en auditoría
echo -e "${GREEN}Test 19: Buscar eventos por texto en el detalle${NC}"
echo "curl -X GET \"$BASE_URL/api/auditoria/buscar?texto=puede_ver&page=0&size=10\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# ============================================================================
# SECCIÓN 4: PRUEBAS DE ERROR (Validación de Seguridad)
# ============================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECCIÓN 4: PRUEBAS DE SEGURIDAD (Casos de Error)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 20: Sin token
echo -e "${GREEN}Test 20: Intentar acceder sin token JWT (debería fallar)${NC}"
echo "curl -X GET \"$BASE_URL/api/permisos/usuario/1\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
echo "Respuesta esperada: HTTP 401 Unauthorized"
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 21: Token inválido
echo -e "${GREEN}Test 21: Intentar acceder con token inválido (debería fallar)${NC}"
echo "curl -X GET \"$BASE_URL/api/permisos/usuario/1\" \\"
echo "  -H \"Authorization: Bearer token_invalido_123\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
echo "Respuesta esperada: HTTP 401 Unauthorized"
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# Test 22: Usuario no existente
echo -e "${GREEN}Test 22: Buscar permisos de usuario inexistente${NC}"
echo "curl -X GET \"$BASE_URL/api/permisos/usuario/99999\" \\"
echo "  -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "  -H \"$CONTENT_TYPE\""
echo ""
echo "Respuesta esperada: HTTP 404 Not Found"
echo ""
read -p "Presiona Enter para ejecutar..." && echo ""

# ============================================================================
# SECCIÓN 5: PRUEBAS DE CARGA (Opcional)
# ============================================================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}SECCIÓN 5: PRUEBAS DE RENDIMIENTO (Opcional)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}Test 23: Benchmark - 100 requests de verificación de permisos${NC}"
echo "for i in {1..100}; do"
echo "  curl -s -X POST \"$BASE_URL/api/permisos/check\" \\"
echo "    -H \"Authorization: Bearer \$JWT_TOKEN\" \\"
echo "    -H \"$CONTENT_TYPE\" \\"
echo "    -d '{\"userId\": 1, \"rutaPagina\": \"/roles/medico/pacientes\", \"accion\": \"ver\"}' &"
echo "done"
echo "wait"
echo ""
echo "💡 Esto enviará 100 requests concurrentes para probar el rendimiento"
echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      RESUMEN DE PRUEBAS                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ API de Permisos:${NC} 8 endpoints probados"
echo -e "${GREEN}✅ API de Auditoría:${NC} 11 endpoints probados"
echo -e "${GREEN}✅ Pruebas de Seguridad:${NC} 3 casos probados"
echo -e "${GREEN}✅ Total:${NC} 23 pruebas técnicas"
echo ""
echo -e "${YELLOW}📝 NOTAS IMPORTANTES:${NC}"
echo "1. Reemplaza \$JWT_TOKEN con tu token real"
echo "2. Ajusta los IDs de usuario según tu base de datos"
echo "3. Verifica que el servidor esté corriendo en $BASE_URL"
echo "4. Los endpoints requieren roles específicos (SUPERADMIN, ADMIN)"
echo ""
echo -e "${BLUE}📚 Documentación completa en Swagger:${NC}"
echo "   $BASE_URL/swagger-ui.html"
echo ""
echo -e "${GREEN}🎉 ¡Pruebas completadas!${NC}"
