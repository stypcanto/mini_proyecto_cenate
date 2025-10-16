#!/bin/bash

# Script para ejecutar el SQL de account_requests en la base de datos

echo "🗄️  CONFIGURACIÓN DE TABLA account_requests"
echo "==========================================="
echo ""

# Configuración de la base de datos
DB_HOST="10.0.89.13"
DB_PORT="5432"
DB_NAME="maestro_cenate"
DB_USER="postgres"
DB_PASSWORD="Essalud2025"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar si existe psql
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql no está instalado${NC}"
    echo "   En macOS: brew install postgresql"
    echo "   En Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

echo "1️⃣ Verificando conexión a la base de datos..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✅ Conexión exitosa${NC}"
else
    echo -e "${RED}❌ No se pudo conectar a la base de datos${NC}"
    echo "   Verifica las credenciales y que el servidor esté accesible"
    exit 1
fi
echo ""

echo "2️⃣ Ejecutando script SQL..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f backend/sql/account_requests.sql; then
    echo ""
    echo -e "${GREEN}✅ Script SQL ejecutado exitosamente${NC}"
else
    echo ""
    echo -e "${RED}❌ Error al ejecutar el script SQL${NC}"
    exit 1
fi
echo ""

echo "3️⃣ Verificando la tabla..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
SELECT 
    'account_requests' as tabla,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE estado = 'PENDIENTE') as pendientes,
    COUNT(*) FILTER (WHERE estado = 'APROBADO') as aprobadas,
    COUNT(*) FILTER (WHERE estado = 'RECHAZADO') as rechazadas
FROM account_requests;
EOF

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""
echo "Puedes verificar la tabla con:"
echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
echo "  \\d account_requests"
echo "==========================================="
