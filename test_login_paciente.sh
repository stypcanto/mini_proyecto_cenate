#!/bin/bash

# Script de prueba de login para paciente DNI 22672403

echo "================================"
echo "🔐 TESTING LOGIN PACIENTE"
echo "================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
API_URL="http://localhost:8080/api/auth/login"
DNI="22672403"
PASSWORD="@Prueba654321"
TIMEOUT=10

echo -e "${BLUE}📋 Datos de Prueba:${NC}"
echo "   DNI: $DNI"
echo "   Password: $PASSWORD"
echo "   API: $API_URL"
echo ""

# Test 1: Health check del API
echo -e "${YELLOW}Test 1: Verificar si el API está disponible${NC}"
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" -m $TIMEOUT "http://localhost:8080/api/auth/health" 2>/dev/null)
if [ "$HEALTH" == "200" ] || [ "$HEALTH" == "404" ]; then
    echo -e "${GREEN}✅ API disponible (HTTP $HEALTH)${NC}"
else
    echo -e "${RED}❌ API no respondiendo (HTTP $HEALTH)${NC}"
fi
echo ""

# Test 2: Intentar login
echo -e "${YELLOW}Test 2: Intento de Login${NC}"
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$DNI\",\"password\":\"$PASSWORD\"}" \
  -m $TIMEOUT 2>&1)

echo "Respuesta del servidor:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 3: Analizar respuesta
echo -e "${YELLOW}Test 3: Análisis de Respuesta${NC}"
if echo "$RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Login exitoso - Token recibido${NC}"
    TOKEN=$(echo "$RESPONSE" | jq -r '.token' 2>/dev/null)
    echo "Token: ${TOKEN:0:20}..."
elif echo "$RESPONSE" | grep -q "error"; then
    ERROR=$(echo "$RESPONSE" | jq -r '.error' 2>/dev/null)
    echo -e "${RED}❌ Error de Login: $ERROR${NC}"
elif echo "$RESPONSE" | grep -q "Credenciales"; then
    echo -e "${RED}❌ Credenciales inválidas${NC}"
else
    echo -e "${YELLOW}⚠️  Respuesta desconocida${NC}"
    echo "$RESPONSE"
fi
echo ""

# Test 4: Intentar con username alternativo
echo -e "${YELLOW}Test 4: Intento con formato alternativo${NC}"
RESPONSE2=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"22672403\",\"password\":\"@Prueba654321\"}" \
  -m $TIMEOUT 2>&1)

if echo "$RESPONSE2" | grep -q "token"; then
    echo -e "${GREEN}✅ Login alternativo exitoso${NC}"
else
    echo -e "${RED}❌ Login alternativo también falló${NC}"
fi
echo ""

echo "================================"
echo "✅ PRUEBAS COMPLETADAS"
echo "================================"
