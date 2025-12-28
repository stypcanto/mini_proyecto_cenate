#!/bin/bash

export DB_URL="jdbc:postgresql://10.0.89.13:5432/maestro_cenate"
export DB_USERNAME="postgres"
export DB_PASSWORD="Essalud2025"
export JWT_SECRET="cenate-jwt-secret-key-2025-minimum-32-characters-required"
export MAIL_USERNAME="cenateinformatica@gmail.com"
export MAIL_PASSWORD="nolq uisr fwdw zdly"
export FRONTEND_URL="http://localhost:3000"

echo "Starting backend with environment variables..."
./gradlew bootRun
