#!/bin/bash

echo "🛑 Deteniendo el backend actual..."
# Cargar variables de entorno
if [ -f .env ]; then
    echo "📥 Cargando variables de entorno desde .env..."
    export $(grep -v '^#' .env | xargs)
fi
# Buscar y matar el proceso de Spring Boot
pkill -f "CenateApplication" || echo "No hay procesos de backend corriendo"

echo "🧹 Limpiando archivos compilados..."
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate/backend
./gradlew clean

echo "🔨 Compilando el proyecto..."
./gradlew build -x test

if [ $? -eq 0 ]; then
    echo "✅ Compilación exitosa"
    echo "🚀 Iniciando el backend con variables de entorno..."
    # Ejecutar bootRun con las variables de entorno cargadas
    env $(grep -v '^#' .env | xargs) ./gradlew bootRun &
    
    echo "⏳ Esperando a que el servidor inicie (30 segundos)..."
    sleep 30
    
    echo "✅ Backend reiniciado. Verifica los logs arriba."
    echo "📍 Prueba: http://10.0.89.239:8080/api/asegurados?page=0&size=5"
else
    echo "❌ Error en la compilación. Revisa los errores arriba."
fi
