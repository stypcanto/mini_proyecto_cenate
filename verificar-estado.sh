#!/bin/bash

# ========================================================================
# 🔍 VERIFICAR ESTADO DE SERVICIOS CENATE
# ========================================================================

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "   🔍 ESTADO DE SERVICIOS CENATE"
echo "=========================================="
echo ""

# Verificar Docker
echo -n "Docker Desktop: "
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Corriendo${NC}"
else
    echo -e "${RED}✗ No está corriendo${NC}"
    exit 1
fi

# Verificar contenedores
echo ""
echo "📦 Contenedores:"
docker-compose ps

echo ""
echo "🌐 Verificando endpoints..."

# Backend Health
echo -n "Backend (8080): "
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Respondiendo${NC}"
    HEALTH=$(curl -s http://localhost:8080/actuator/health | jq -r .status 2>/dev/null || echo "N/A")
    echo "   Status: $HEALTH"
else
    echo -e "${RED}✗ No responde${NC}"
fi

# Frontend
echo -n "Frontend (80): "
if curl -s http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Respondiendo${NC}"
else
    echo -e "${RED}✗ No responde${NC}"
fi

# Base de datos
echo -n "Base de Datos (10.0.89.13:5432): "
if nc -zv 10.0.89.13 5432 2>&1 | grep -q "succeeded"; then
    echo -e "${GREEN}✓ Accesible${NC}"
else
    echo -e "${YELLOW}⚠ No se pudo conectar${NC}"
fi

echo ""
echo "📊 URLs de acceso:"
echo "   Frontend:  http://localhost"
echo "   Backend:   http://localhost:8080"
echo "   Swagger:   http://localhost:8080/swagger-ui.html"
echo ""
