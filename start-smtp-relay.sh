#!/bin/bash
# ============================================================
# SMTP Relay para Docker → Servidor Corporativo EsSalud
# Permite que Docker se conecte al SMTP corporativo 172.20.0.227
# ============================================================

RELAY_PORT=2525
SMTP_HOST=172.20.0.227
SMTP_PORT=25

# Verificar si ya está corriendo
if pgrep -f "socat.*$RELAY_PORT" > /dev/null; then
    echo "✅ Relay SMTP ya está activo en puerto $RELAY_PORT"
    exit 0
fi

# Iniciar relay
echo "🚀 Iniciando relay SMTP: localhost:$RELAY_PORT → $SMTP_HOST:$SMTP_PORT"
nohup socat TCP-LISTEN:$RELAY_PORT,fork,reuseaddr TCP:$SMTP_HOST:$SMTP_PORT > /tmp/socat-smtp.log 2>&1 &

sleep 2

if pgrep -f "socat.*$RELAY_PORT" > /dev/null; then
    echo "✅ Relay SMTP activo"
else
    echo "❌ Error al iniciar relay. Ver /tmp/socat-smtp.log"
    exit 1
fi
