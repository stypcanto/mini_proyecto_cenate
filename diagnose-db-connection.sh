#!/bin/bash

# ========================================================================
# 🔍 DIAGNÓSTICO DE CONECTIVIDAD - CENATE BACKEND
# ========================================================================

echo "========================================================"
echo "🔍 DIAGNÓSTICO DE CONECTIVIDAD A POSTGRESQL"
echo "========================================================"
echo ""

DB_HOST="10.0.89.13"
DB_PORT="5432"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📡 Objetivo: PostgreSQL en ${DB_HOST}:${DB_PORT}"
echo ""

# ========================================================================
# 1. Verificar conectividad desde el HOST (tu Mac)
# ========================================================================
echo "1️⃣ Verificando conectividad desde el HOST (tu Mac)..."
echo "--------------------------------------------------------"

if command -v nc &> /dev/null; then
    if nc -z -w5 ${DB_HOST} ${DB_PORT} 2>/dev/null; then
        echo -e "${GREEN}✅ ÉXITO: El host PUEDE conectarse a ${DB_HOST}:${DB_PORT}${NC}"
        HOST_CAN_CONNECT=true
    else
        echo -e "${RED}❌ FALLO: El host NO puede conectarse a ${DB_HOST}:${DB_PORT}${NC}"
        HOST_CAN_CONNECT=false
    fi
else
    echo -e "${YELLOW}⚠️  nc no está disponible. Intentando con curl...${NC}"
    if curl -s --connect-timeout 5 telnet://${DB_HOST}:${DB_PORT} &>/dev/null; then
        echo -e "${GREEN}✅ ÉXITO: El host PUEDE conectarse a ${DB_HOST}:${DB_PORT}${NC}"
        HOST_CAN_CONNECT=true
    else
        echo -e "${RED}❌ FALLO: El host NO puede conectarse a ${DB_HOST}:${DB_PORT}${NC}"
        HOST_CAN_CONNECT=false
    fi
fi
echo ""

# ========================================================================
# 2. Verificar si el contenedor backend está corriendo
# ========================================================================
echo "2️⃣ Verificando estado del contenedor backend..."
echo "--------------------------------------------------------"

BACKEND_CONTAINER=$(docker ps -q -f name=cenate-backend)

if [ -z "$BACKEND_CONTAINER" ]; then
    echo -e "${RED}❌ El contenedor cenate-backend NO está corriendo${NC}"
    echo ""
    echo "💡 Inicia los contenedores con:"
    echo "   docker-compose up -d"
    exit 1
else
    echo -e "${GREEN}✅ Contenedor encontrado: ${BACKEND_CONTAINER}${NC}"
    
    # Ver estado de salud
    HEALTH_STATUS=$(docker inspect ${BACKEND_CONTAINER} --format='{{.State.Health.Status}}' 2>/dev/null)
    if [ "$HEALTH_STATUS" = "healthy" ]; then
        echo -e "${GREEN}✅ Estado de salud: HEALTHY${NC}"
    elif [ "$HEALTH_STATUS" = "unhealthy" ]; then
        echo -e "${RED}❌ Estado de salud: UNHEALTHY${NC}"
    else
        echo -e "${YELLOW}⚠️  Estado de salud: ${HEALTH_STATUS}${NC}"
    fi
fi
echo ""

# ========================================================================
# 3. Verificar conectividad DESDE el contenedor
# ========================================================================
echo "3️⃣ Verificando conectividad DESDE el contenedor..."
echo "--------------------------------------------------------"

if docker exec ${BACKEND_CONTAINER} bash -c "command -v curl" &>/dev/null; then
    if docker exec ${BACKEND_CONTAINER} curl -s --connect-timeout 5 telnet://${DB_HOST}:${DB_PORT} &>/dev/null; then
        echo -e "${GREEN}✅ ÉXITO: El contenedor PUEDE conectarse a ${DB_HOST}:${DB_PORT}${NC}"
        CONTAINER_CAN_CONNECT=true
    else
        echo -e "${RED}❌ FALLO: El contenedor NO puede conectarse a ${DB_HOST}:${DB_PORT}${NC}"
        CONTAINER_CAN_CONNECT=false
    fi
else
    echo -e "${YELLOW}⚠️  curl no disponible en el contenedor${NC}"
    CONTAINER_CAN_CONNECT=false
fi
echo ""

# ========================================================================
# 4. Ver últimos errores del backend
# ========================================================================
echo "4️⃣ Últimos errores del backend..."
echo "--------------------------------------------------------"
docker logs ${BACKEND_CONTAINER} --tail 20 2>&1 | grep -i "error\|exception\|failed" | tail -5
echo ""

# ========================================================================
# DIAGNÓSTICO FINAL Y RECOMENDACIONES
# ========================================================================
echo "========================================================"
echo "📊 DIAGNÓSTICO FINAL"
echo "========================================================"
echo ""

if [ "$HOST_CAN_CONNECT" = true ] && [ "$CONTAINER_CAN_CONNECT" = false ]; then
    echo -e "${YELLOW}⚠️  PROBLEMA IDENTIFICADO:${NC}"
    echo "   - Tu Mac SÍ puede conectarse a PostgreSQL"
    echo "   - El contenedor Docker NO puede conectarse"
    echo ""
    echo -e "${GREEN}💡 SOLUCIÓN:${NC}"
    echo "   El contenedor está aislado en una red Docker bridge."
    echo "   Necesitas usar 'network_mode: host' para que use la red del host."
    echo ""
    echo "   Ejecuta estos comandos:"
    echo "   ${GREEN}docker-compose down${NC}"
    echo "   ${GREEN}docker-compose -f docker-compose-host-network.yml up -d${NC}"
    echo ""
    
elif [ "$HOST_CAN_CONNECT" = false ]; then
    echo -e "${RED}⚠️  PROBLEMA DE RED:${NC}"
    echo "   Ni tu Mac ni el contenedor pueden conectarse a PostgreSQL."
    echo ""
    echo -e "${YELLOW}💡 POSIBLES CAUSAS:${NC}"
    echo "   1. PostgreSQL no está corriendo en ${DB_HOST}"
    echo "   2. El puerto ${DB_PORT} está bloqueado por firewall"
    echo "   3. PostgreSQL no acepta conexiones remotas"
    echo "   4. Problema de red entre tu Mac y ${DB_HOST}"
    echo ""
    echo "   Verifica:"
    echo "   - ¿PostgreSQL está corriendo en ${DB_HOST}?"
    echo "   - ¿El firewall permite conexiones al puerto ${DB_PORT}?"
    echo "   - ¿El pg_hba.conf permite tu IP?"
    echo ""
    
elif [ "$HOST_CAN_CONNECT" = true ] && [ "$CONTAINER_CAN_CONNECT" = true ]; then
    echo -e "${GREEN}✅ CONECTIVIDAD OK${NC}"
    echo "   Tanto el host como el contenedor pueden conectarse."
    echo ""
    echo "   Si el backend sigue fallando, el problema podría ser:"
    echo "   - Credenciales incorrectas (usuario/contraseña)"
    echo "   - Base de datos 'maestro_cenate' no existe"
    echo "   - PostgreSQL no acepta la autenticación"
    echo ""
    echo "   Verifica las credenciales en docker-compose.yml"
fi

echo "========================================================"
echo ""
echo "📝 Para ver los logs completos del backend:"
echo "   ${GREEN}docker logs -f ${BACKEND_CONTAINER}${NC}"
echo ""
