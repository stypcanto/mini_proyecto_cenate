#!/bin/bash

# ========================================================================
# 🧪 SCRIPT DE PRUEBA - SISTEMA DE LOGIN MEJORADO
# ========================================================================
# Este script verifica que el sistema de login esté funcionando correctamente
# ========================================================================

echo "=========================================================================="
echo "🔍 VERIFICACIÓN DEL SISTEMA DE LOGIN - CENATE"
echo "=========================================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar que el backend esté corriendo
echo -e "${BLUE}[1/5]${NC} Verificando backend..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health 2>/dev/null || echo "000")

if [ "$BACKEND_HEALTH" == "200" ] || [ "$BACKEND_HEALTH" == "404" ]; then
    echo -e "${GREEN}✅ Backend está corriendo en http://localhost:8080${NC}"
else
    echo -e "${RED}❌ Backend NO está corriendo. Inicia el servidor Spring Boot primero.${NC}"
    echo -e "${YELLOW}   Ejecuta: cd backend && ./mvnw spring-boot:run${NC}"
    exit 1
fi
echo ""

# 2. Verificar archivos modificados
echo -e "${BLUE}[2/5]${NC} Verificando archivos modificados..."

if [ -f "frontend/src/pages/auth/Login.jsx" ]; then
    echo -e "${GREEN}✅ Login.jsx encontrado${NC}"
else
    echo -e "${RED}❌ Login.jsx NO encontrado${NC}"
    exit 1
fi

if [ -f "frontend/src/pages/Dashboard.jsx" ]; then
    echo -e "${GREEN}✅ Dashboard.jsx encontrado${NC}"
else
    echo -e "${RED}❌ Dashboard.jsx NO encontrado${NC}"
    exit 1
fi
echo ""

# 3. Verificar dependencias del frontend
echo -e "${BLUE}[3/5]${NC} Verificando dependencias..."
cd frontend

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${YELLOW}⚠️  Instalando dependencias...${NC}"
    npm install
fi
echo ""

# 4. Probar el endpoint de login
echo -e "${BLUE}[4/5]${NC} Probando endpoint de autenticación..."

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}' 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Endpoint de login funciona correctamente${NC}"
    echo -e "${GREEN}   Token recibido exitosamente${NC}"
else
    echo -e "${RED}❌ Error en endpoint de login${NC}"
    echo -e "${YELLOW}   Respuesta: $LOGIN_RESPONSE${NC}"
    echo -e "${YELLOW}   Verifica las credenciales en la base de datos${NC}"
fi
echo ""

# 5. Instrucciones finales
echo -e "${BLUE}[5/5]${NC} Instrucciones de uso..."
echo ""
echo -e "${GREEN}=========================================================================="
echo -e "✅ VERIFICACIÓN COMPLETADA"
echo -e "==========================================================================${NC}"
echo ""
echo -e "${YELLOW}📋 Siguiente paso:${NC}"
echo ""
echo -e "1. ${BLUE}Inicia el frontend:${NC}"
echo "   cd frontend"
echo "   npm start"
echo ""
echo -e "2. ${BLUE}Accede a:${NC}"
echo "   http://localhost:3000/auth/login"
echo ""
echo -e "3. ${BLUE}Credenciales de prueba:${NC}"
echo "   Usuario: scantor"
echo "   Contraseña: admin123"
echo ""
echo -e "${YELLOW}🎯 Funcionalidades a probar:${NC}"
echo ""
echo "✅ Validación de campos vacíos"
echo "✅ Validación de longitud mínima"
echo "✅ Mostrar/ocultar contraseña"
echo "✅ Recordar usuario"
echo "✅ Mensajes de error específicos"
echo "✅ Animación de carga"
echo "✅ Dashboard con información del usuario"
echo "✅ Redirección según rol"
echo ""
echo -e "${GREEN}=========================================================================="
echo -e "📚 Documentación completa: LOGIN_MEJORADO_README.md"
echo -e "==========================================================================${NC}"
echo ""
