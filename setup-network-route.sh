#!/bin/bash
# Script para agregar ruta a la red de base de datos
# Ejecutar al inicio del sistema o después de reiniciar

echo "🌐 Agregando ruta a red 10.0.89.0/24..."
sudo route add -net 10.0.89.0/24 10.0.89.225

echo "✅ Ruta agregada. Verificando..."
netstat -rn | grep "10.0.89"
