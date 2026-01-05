#!/bin/bash
export DB_URL="jdbc:postgresql://10.0.89.13:5432/maestro_cenate"
export DB_USERNAME="postgres"
export DB_PASSWORD="Essalud2025"
export JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
export MAIL_HOST="172.20.0.227"
export MAIL_PORT="25"
export MAIL_USERNAME="cenate.contacto@essalud.gob.pe"
export MAIL_PASSWORD="essaludc50"
export FRONTEND_URL="http://localhost:3000"

./gradlew bootRun
