#!/bin/bash

# ============================================================
# Script de Prueba SMTP para CENATE
# ============================================================
# Uso: ./test-smtp.sh [email-destino]
# Ejemplo: ./test-smtp.sh test@example.com
# ============================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🧪 PRUEBA DE CONEXIÓN SMTP - CENATE    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Validar email
if [ -z "$1" ]; then
    EMAIL="test@example.com"
    echo -e "${YELLOW}⚠️  No se especificó email, usando: $EMAIL${NC}"
else
    EMAIL="$1"
fi

echo -e "${BLUE}📧 Email de prueba: ${GREEN}$EMAIL${NC}"
echo -e "${BLUE}🖥️  Servidor API: ${GREEN}http://localhost:8080${NC}"
echo ""

# Paso 1: Verificar conectividad al backend
echo -e "${BLUE}📍 Paso 1: Verificando conectividad al backend...${NC}"
if curl -s http://localhost:8080/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend accesible${NC}"
else
    echo -e "${RED}❌ Backend NO accesible en http://localhost:8080${NC}"
    echo -e "   Verifica que el backend está corriendo: ./gradlew bootRun"
    exit 1
fi

echo ""

# Paso 2: Probar SMTP
echo -e "${BLUE}📍 Paso 2: Probando conexión SMTP...${NC}"
echo -e "   Realizando request a: /api/health/smtp-test?email=$EMAIL"
echo ""

RESPONSE=$(curl -s "http://localhost:8080/api/health/smtp-test?email=$EMAIL")

echo -e "${BLUE}📤 Respuesta del servidor:${NC}"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""

# Analizar respuesta
if echo "$RESPONSE" | grep -q '"exitoso":true'; then
    echo -e "${GREEN}✅ ÉXITO: Conexión SMTP funciona${NC}"
    echo -e "   Se envió un correo de prueba a: ${GREEN}$EMAIL${NC}"
    echo -e "   Revisa tu bandeja de entrada en unos segundos"
    exit 0
else
    echo -e "${RED}❌ ERROR: No se pudo enviar el correo${NC}"

    # Diagnosticar error específico
    if echo "$RESPONSE" | grep -q "bad greeting\|EOF"; then
        echo -e "${YELLOW}📍 Problema: Servidor SMTP no responde${NC}"
        echo -e "   Causa probable:"
        echo -e "   - Servidor corporativo (172.20.0.227) no disponible"
        echo -e "   - Firewall bloquea puerto 25"
        echo -e "   - Problema de conectividad de red"
        echo ""
        echo -e "   ${GREEN}Soluciones:${NC}"
        echo -e "   1. Contactar a TI EsSalud para verificar servidor SMTP"
        echo -e "   2. Verificar: ping 172.20.0.227"
        echo -e "   3. Para desarrollo: habilitar Gmail fallback"
        echo ""
    fi

    echo -e "${YELLOW}📋 Detalles del error:${NC}"
    echo "$RESPONSE" | jq '.error // .detalle' 2>/dev/null || echo "$RESPONSE"

    exit 1
fi
