#!/bin/bash
# ============================================================
# CENATE - SMTP Relay para EsSalud (Docker)
# ============================================================
# Este script inicia un relay SMTP que permite enviar correos
# desde Docker al servidor corporativo de EsSalud
# ============================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración EsSalud
SMTP_RELAY_HOST="172.20.0.227"
SMTP_RELAY_PORT="25"
LOCAL_PORT="2525"
CONTAINER_NAME="smtp-relay-cenate"

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}   CENATE - SMTP Relay para EsSalud${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# 1. Verificar conectividad al servidor EsSalud
echo -e "${YELLOW}[1/4] Verificando conectividad a ${SMTP_RELAY_HOST}:${SMTP_RELAY_PORT}...${NC}"
if nc -zv ${SMTP_RELAY_HOST} ${SMTP_RELAY_PORT} 2>&1 | grep -q "succeeded"; then
    echo -e "${GREEN}   ✅ Servidor EsSalud SMTP accesible${NC}"
else
    echo -e "${RED}   ❌ No se puede conectar al servidor EsSalud${NC}"
    echo -e "${RED}   Verifica la VPN o conexión de red${NC}"
    exit 1
fi
echo ""

# 2. Detener contenedor existente si existe
echo -e "${YELLOW}[2/4] Verificando contenedor existente...${NC}"
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}   Deteniendo contenedor existente...${NC}"
    docker stop ${CONTAINER_NAME} 2>/dev/null
    docker rm ${CONTAINER_NAME} 2>/dev/null
    echo -e "${GREEN}   ✅ Contenedor anterior eliminado${NC}"
else
    echo -e "${GREEN}   ✅ No hay contenedor previo${NC}"
fi
echo ""

# 3. Iniciar el relay SMTP
echo -e "${YELLOW}[3/4] Iniciando SMTP Relay en puerto ${LOCAL_PORT}...${NC}"
docker run -d \
    --name ${CONTAINER_NAME} \
    --restart unless-stopped \
    -p ${LOCAL_PORT}:25 \
    -e RELAY_HOST=${SMTP_RELAY_HOST} \
    -e RELAY_PORT=${SMTP_RELAY_PORT} \
    -e ALLOWED_SENDER_DOMAINS="essalud.gob.pe" \
    boky/postfix 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ SMTP Relay iniciado correctamente${NC}"
else
    echo -e "${RED}   ❌ Error al iniciar el relay${NC}"
    exit 1
fi
echo ""

# 4. Verificar que el relay está funcionando
echo -e "${YELLOW}[4/4] Verificando relay...${NC}"
sleep 3
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${GREEN}   ✅ Relay corriendo en localhost:${LOCAL_PORT}${NC}"
else
    echo -e "${RED}   ❌ El relay no está corriendo${NC}"
    echo -e "${YELLOW}   Logs del contenedor:${NC}"
    docker logs ${CONTAINER_NAME}
    exit 1
fi

echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}SMTP Relay configurado exitosamente!${NC}"
echo ""
echo -e "Configuración:"
echo -e "   Relay Local:    localhost:${LOCAL_PORT}"
echo -e "   Servidor Final: ${SMTP_RELAY_HOST}:${SMTP_RELAY_PORT}"
echo -e "   Remitente:      cenate.contacto@essalud.gob.pe"
echo ""
echo -e "Docker usa:        host.docker.internal:${LOCAL_PORT}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "${YELLOW}Para probar:${NC}"
echo -e "   curl \"http://localhost:8080/api/health/smtp-test?email=tu@email.com\""
