#!/bin/bash

echo "==================================="
echo "TEST API - OBTENER USUARIOS"
echo "==================================="
echo ""

# Primero hacer login para obtener el token
echo "1. Obteniendo token de autenticación..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "scantor",
    "password": "123"
  }')

echo "Respuesta del login:"
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Extraer el token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ ERROR: No se pudo obtener el token"
    echo "Verifica que el usuario 'scantor' con contraseña '123' existe en la base de datos"
    exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."
echo ""

# Hacer la petición a /api/usuarios
echo "2. Consultando lista de usuarios..."
USUARIOS_RESPONSE=$(curl -s -X GET http://localhost:8080/api/usuarios \
  -H "Authorization: Bearer $TOKEN")

echo "Respuesta de /api/usuarios:"
echo "$USUARIOS_RESPONSE" | jq '.'
echo ""

echo "==================================="
echo "TEST COMPLETADO"
echo "==================================="
