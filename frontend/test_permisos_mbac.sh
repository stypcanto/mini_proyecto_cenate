#!/bin/bash

# ========================================================================
# 🧪 Script de Prueba - Sistema de Permisos MBAC
# ========================================================================

echo "🔐 Probando Sistema de Permisos MBAC"
echo "======================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8080"

# 1. Login
echo -e "${BLUE}📝 Paso 1: Autenticación...${NC}"
JWT_TOKEN=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}' | jq -r '.token')

if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" == "null" ]; then
  echo -e "${RED}❌ Error: No se pudo obtener el token JWT${NC}"
  echo "Verifica que el backend esté corriendo y las credenciales sean correctas"
  exit 1
fi

echo -e "${GREEN}✅ Token obtenido exitosamente${NC}"
echo ""

# 2. Health Check
echo -e "${BLUE}📝 Paso 2: Verificando servicio de permisos...${NC}"
HEALTH=$(curl -s -X GET "${BASE_URL}/api/permisos/health" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq -r '.status')

if [ "$HEALTH" == "UP" ]; then
  echo -e "${GREEN}✅ Servicio de permisos: OPERATIVO${NC}"
else
  echo -e "${RED}❌ Error: Servicio de permisos no disponible${NC}"
  exit 1
fi
echo ""

# 3. Obtener permisos del usuario
echo -e "${BLUE}📝 Paso 3: Obteniendo permisos del usuario...${NC}"
PERMISOS=$(curl -s -X GET "${BASE_URL}/api/permisos/usuario/1" \
  -H "Authorization: Bearer $JWT_TOKEN")

if [ -z "$PERMISOS" ]; then
  echo -e "${RED}❌ Error: No se pudieron obtener permisos${NC}"
  exit 1
fi

# Contar permisos
TOTAL=$(echo "$PERMISOS" | jq '. | length')
echo -e "${GREEN}✅ Permisos obtenidos: ${TOTAL} páginas${NC}"
echo ""

# 4. Analizar permisos
echo -e "${BLUE}📝 Paso 4: Analizando estructura de permisos...${NC}"

# Módulos únicos
MODULOS=$(echo "$PERMISOS" | jq -r '.[].modulo' | sort -u)
NUM_MODULOS=$(echo "$MODULOS" | wc -l | tr -d ' ')
echo -e "${GREEN}✅ Módulos encontrados: ${NUM_MODULOS}${NC}"
echo "$MODULOS" | while read modulo; do
  echo "   • $modulo"
done
echo ""

# Roles únicos
ROLES=$(echo "$PERMISOS" | jq -r '.[].rol' | sort -u)
NUM_ROLES=$(echo "$ROLES" | wc -l | tr -d ' ')
echo -e "${GREEN}✅ Roles encontrados: ${NUM_ROLES}${NC}"
echo "$ROLES" | while read rol; do
  echo "   • $rol"
done
echo ""

# 5. Probar endpoint de módulos
echo -e "${BLUE}📝 Paso 5: Obteniendo módulos del usuario...${NC}"
MODULOS_RESP=$(curl -s -X GET "${BASE_URL}/api/permisos/usuario/1/modulos" \
  -H "Authorization: Bearer $JWT_TOKEN")

TOTAL_MODULOS=$(echo "$MODULOS_RESP" | jq -r '.total')
echo -e "${GREEN}✅ Total de módulos: ${TOTAL_MODULOS}${NC}"
echo ""

# 6. Probar check de permiso
echo -e "${BLUE}📝 Paso 6: Verificando permiso específico...${NC}"
CHECK=$(curl -s -X POST "${BASE_URL}/api/permisos/check" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "rutaPagina": "/roles/medico/pacientes",
    "accion": "ver"
  }')

PERMITIDO=$(echo "$CHECK" | jq -r '.permitido')
if [ "$PERMITIDO" == "true" ]; then
  echo -e "${GREEN}✅ Permiso verificado correctamente${NC}"
else
  echo -e "${RED}❌ Error: Permiso denegado${NC}"
fi
echo ""

# 7. Resumen final
echo "========================================="
echo -e "${GREEN}🎉 Pruebas completadas exitosamente${NC}"
echo "========================================="
echo ""
echo "📊 Resumen:"
echo "   • Total de permisos: ${TOTAL}"
echo "   • Módulos únicos: ${NUM_MODULOS}"
echo "   • Roles únicos: ${NUM_ROLES}"
echo ""
echo "🚀 Siguiente paso:"
echo "   1. Abre el navegador en http://localhost:3000/admin/permisos"
echo "   2. Inicia sesión con:"
echo "      Usuario: scantor"
echo "      Contraseña: admin123"
echo "   3. Navega a 'Roles y Permisos' → 'Permisos MBAC'"
echo ""
echo -e "${YELLOW}💡 Consejo: Si ves errores en el frontend, verifica que:${NC}"
echo "   • El frontend esté corriendo (npm start)"
echo "   • El backend esté corriendo en el puerto 8080"
echo "   • No hay errores en la consola del navegador (F12)"
echo ""
