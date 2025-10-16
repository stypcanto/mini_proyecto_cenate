#!/bin/bash

# ========================================================================
# 🔍 Diagnóstico de Conexión Frontend-Backend
# ========================================================================

echo "🔍 Diagnóstico de Conexión Frontend-Backend CENATE"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar Backend
echo -e "${BLUE}1. Verificando Backend...${NC}"
if curl -s http://localhost:8080/api/health > /dev/null 2>&1 || curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Backend está corriendo en puerto 8080"
else
    echo -e "  ${RED}✗${NC} Backend NO está corriendo"
    echo "     Inicia el backend con: cd backend && ./mvnw spring-boot:run"
fi

# 2. Verificar PostgreSQL
echo ""
echo -e "${BLUE}2. Verificando PostgreSQL...${NC}"
if nc -z localhost 5432 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} PostgreSQL está corriendo en puerto 5432"
else
    echo -e "  ${RED}✗${NC} PostgreSQL NO está corriendo"
fi

# 3. Test de Login
echo ""
echo -e "${BLUE}3. Probando Login desde CLI...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "  ${GREEN}✓${NC} Login exitoso (HTTP 200)"
    echo "  Token obtenido: $(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4 | cut -c1-20)..."
else
    echo -e "  ${RED}✗${NC} Login falló (HTTP $HTTP_CODE)"
    echo "  Respuesta: $BODY"
fi

# 4. Verificar CORS
echo ""
echo -e "${BLUE}4. Verificando CORS...${NC}"
CORS_TEST=$(curl -s -I -X OPTIONS "http://localhost:8080/api/auth/login" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" 2>&1)

if echo "$CORS_TEST" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "  ${GREEN}✓${NC} CORS configurado correctamente"
    echo "$CORS_TEST" | grep "Access-Control-Allow"
else
    echo -e "  ${RED}✗${NC} CORS NO está configurado o está bloqueando"
    echo ""
    echo -e "  ${YELLOW}Solución:${NC}"
    echo "  Verifica que tu backend tenga configuración CORS para http://localhost:3000"
fi

# 5. Verificar .env.development del frontend
echo ""
echo -e "${BLUE}5. Verificando .env del frontend...${NC}"
if [ -f "frontend/.env" ]; then
    API_URL=$(grep "REACT_APP_API_URL" frontend/.env.development | cut -d'=' -f2)
    echo -e "  ${GREEN}✓${NC} Archivo .env encontrado"
    echo "  API_URL configurada: $API_URL"
    
    if [ "$API_URL" = "http://localhost:8080/api" ]; then
        echo -e "  ${GREEN}✓${NC} URL correcta"
    else
        echo -e "  ${YELLOW}⚠${NC}  URL parece diferente a la esperada"
    fi
else
    echo -e "  ${RED}✗${NC} No se encontró frontend/.env"
fi

# 6. Verificar Frontend
echo ""
echo -e "${BLUE}6. Verificando Frontend...${NC}"
if lsof -i:3000 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Frontend está corriendo en puerto 3000"
else
    echo -e "  ${YELLOW}⚠${NC}  Frontend NO está corriendo"
    echo "     Inicia con: cd frontend && npm start"
fi

# 7. Test desde el navegador (simulado)
echo ""
echo -e "${BLUE}7. Comando para probar en el navegador...${NC}"
echo "  Abre la consola del navegador (F12) y ejecuta:"
echo ""
echo -e "${YELLOW}fetch('http://localhost:8080/api/auth/login', {"
echo "  method: 'POST',"
echo "  headers: {'Content-Type': 'application/json'},"
echo "  body: JSON.stringify({username:'scantor', password:'admin123'})"
echo "}).then(r => r.json()).then(console.log).catch(console.error)${NC}"

# Resumen
echo ""
echo "========================================"
echo -e "${BLUE}📊 RESUMEN${NC}"
echo "========================================"

if [ "$HTTP_CODE" = "200" ] && echo "$CORS_TEST" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ Todo parece estar configurado correctamente${NC}"
    echo ""
    echo "Si el frontend aún falla:"
    echo "  1. Limpia cache del navegador (Ctrl+Shift+R)"
    echo "  2. Revisa la consola del navegador (F12)"
    echo "  3. Verifica que el frontend esté usando la URL correcta"
else
    echo -e "${RED}⚠️  Hay problemas de configuración${NC}"
    echo ""
    echo "Pasos sugeridos:"
    echo "  1. Verifica que el backend esté corriendo"
    echo "  2. Configura CORS en el backend"
    echo "  3. Reinicia ambos servicios"
fi

echo ""
