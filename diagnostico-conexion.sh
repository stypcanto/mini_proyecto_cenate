#!/bin/bash

echo "🔍 DIAGNÓSTICO DE CONEXIÓN CENATE"
echo "=================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Verificar backend en localhost
echo "1️⃣ Verificando backend en localhost:8080..."
if curl -s --connect-timeout 5 http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}' | grep -q "token"; then
    echo -e "${GREEN}✅ Backend responde en localhost${NC}"
else
    echo -e "${RED}❌ Backend NO responde en localhost${NC}"
    echo "   Ejecuta: cd backend && ./gradlew bootRun"
fi
echo ""

# 2. Verificar backend en IP de red
echo "2️⃣ Verificando backend en IP de red (10.0.89.13:8080)..."
if curl -s --connect-timeout 5 http://10.0.89.13:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}' | grep -q "token"; then
    echo -e "${GREEN}✅ Backend responde en 10.0.89.13${NC}"
else
    echo -e "${RED}❌ Backend NO responde en 10.0.89.13${NC}"
    echo "   El backend está escuchando solo en localhost"
    echo "   Verifica application.properties: server.address=0.0.0.0"
fi
echo ""

# 3. Verificar frontend
echo "3️⃣ Verificando frontend..."
if curl -s --connect-timeout 5 http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend está activo en puerto 5173${NC}"
elif curl -s --connect-timeout 5 http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend está activo en puerto 3000${NC}"
else
    echo -e "${RED}❌ Frontend NO está activo${NC}"
    echo "   Ejecuta: cd frontend && npm run dev"
fi
echo ""

# 4. Verificar configuración .env.development
echo "4️⃣ Verificando configuración .env..."
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
    echo "   Contenido:"
    cat frontend/.env.development | grep API_URL
else
    echo -e "${RED}❌ Archivo .env NO encontrado${NC}"
    echo "   Crea el archivo frontend/.env con:"
    echo "   REACT_APP_API_URL=http://localhost:8080/api"
fi
echo ""

# 5. Verificar puertos en uso
echo "5️⃣ Verificando puertos..."
echo -e "${BLUE}Puerto 8080 (Backend):${NC}"
if lsof -i :8080 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Puerto 8080 en uso${NC}"
    lsof -i :8080 | grep LISTEN
else
    echo -e "${RED}   ❌ Puerto 8080 libre (backend no está corriendo)${NC}"
fi
echo ""

echo -e "${BLUE}Puerto 5173 (Frontend):${NC}"
if lsof -i :5173 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Puerto 5173 en uso${NC}"
else
    echo -e "${RED}   ❌ Puerto 5173 libre (frontend no está corriendo)${NC}"
fi
echo ""

# 6. Test de CORS
echo "6️⃣ Para probar CORS, abre la consola del navegador (F12) y ejecuta:"
echo ""
echo -e "${YELLOW}fetch('http://localhost:8080/api/auth/login', {"
echo "  method: 'POST',"
echo "  headers: { 'Content-Type': 'application/json' },"
echo "  body: JSON.stringify({username:'scantor',password:'admin123'})"
echo "})"
echo ".then(r => r.json())"
echo ".then(d => console.log('✅ Respuesta:', d))"
echo -e ".catch(e => console.error('❌ Error:', e))${NC}"
echo ""

# 7. Resumen
echo "=================================="
echo "📊 RESUMEN:"
echo ""
if curl -s --connect-timeout 5 http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}' | grep -q "token"; then
    
    if [ -f "frontend/.env" ]; then
        echo -e "${GREEN}✅ Todo parece estar bien configurado${NC}"
        echo "   Si aún tienes problemas:"
        echo "   1. Verifica la consola del navegador (F12)"
        echo "   2. Revisa la pestaña Network en DevTools"
        echo "   3. Asegúrate de que la IP en .env sea correcta"
    else
        echo -e "${YELLOW}⚠️  Backend OK, pero falta configurar .env${NC}"
    fi
else
    echo -e "${RED}❌ El backend no está respondiendo${NC}"
    echo "   Ejecuta: cd backend && ./gradlew bootRun"
fi
echo "=================================="
