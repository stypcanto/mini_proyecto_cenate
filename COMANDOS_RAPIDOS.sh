#!/bin/bash
# =============================================================================
# COMANDOS RÁPIDOS - Copia y pega estos comandos en tu terminal
# =============================================================================

# 1. HACER EL SCRIPT EJECUTABLE
chmod +x /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/implementar.sh

# 2. EJECUTAR EL SCRIPT DE IMPLEMENTACIÓN AUTOMÁTICA
/Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/implementar.sh

# =============================================================================
# O SI PREFIERES HACERLO MANUALMENTE:
# =============================================================================

# PASO 1: Ejecutar SQL
psql -U postgres -d maestro_cenate -f /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/backend/sql/verificacion_y_datos_prueba.sql

# PASO 2: Compilar Backend
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/backend
./gradlew clean build

# PASO 3: Iniciar Backend (en una terminal nueva)
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/backend
./gradlew bootRun

# PASO 4: Iniciar Frontend (en otra terminal nueva)
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend
npm install  # solo si es necesario
npm start

# =============================================================================
# VERIFICAR QUE TODO FUNCIONA
# =============================================================================

# 1. Verificar Backend está corriendo
curl http://localhost:8080/actuator/health

# 2. Obtener token JWT (reemplaza con tu usuario y contraseña)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"tu_password"}'

# 3. Probar API de personal (reemplaza YOUR_TOKEN con el token obtenido)
curl -X GET "http://localhost:8080/api/personal" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Probar API de áreas
curl -X GET "http://localhost:8080/api/areas" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Abrir en navegador
open http://localhost:3000/admin/users

# =============================================================================
# VERIFICAR DATOS EN POSTGRESQL
# =============================================================================

# Conectarse a la base de datos
psql -U postgres -d maestro_cenate

# Dentro de psql, ejecutar:
# SELECT COUNT(*) FROM dim_personal_cnt;
# SELECT COUNT(*) FROM dim_tipo_documento;
# SELECT COUNT(*) FROM dim_area;
# SELECT COUNT(*) FROM dim_regimen_laboral;

# Ver todo el personal con relaciones:
# SELECT 
#     p.id_pers,
#     p.per_pers,
#     td.desc_tip_doc,
#     p.num_doc_pers,
#     a.desc_area,
#     rl.desc_reg_lab,
#     p.stat_pers
# FROM dim_personal_cnt p
# LEFT JOIN dim_tipo_documento td ON p.id_tip_doc = td.id_tip_doc
# LEFT JOIN dim_area a ON p.id_area = a.id_area
# LEFT JOIN dim_regimen_laboral rl ON p.id_reg_lab = rl.id_reg_lab;

# =============================================================================
# SOLUCIÓN DE PROBLEMAS COMUNES
# =============================================================================

# Si el puerto 8080 está en uso:
lsof -i :8080
kill -9 <PID>

# Si hay errores de compilación:
cd backend
./gradlew clean
./gradlew build --refresh-dependencies

# Si el frontend no inicia:
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start

# Si no puedes acceder al panel admin, verifica tu rol:
psql -U postgres -d maestro_cenate -c "SELECT u.name_user, r.desc_rol FROM dim_usuarios u JOIN usuarios_roles ur ON u.id_user = ur.id_user JOIN dim_roles r ON ur.id_rol = r.id_rol WHERE u.name_user = 'scantor';"

# Si necesitas agregar rol ADMIN:
psql -U postgres -d maestro_cenate -c "INSERT INTO usuarios_roles (id_user, id_rol) VALUES ((SELECT id_user FROM dim_usuarios WHERE name_user = 'scantor'), (SELECT id_rol FROM dim_roles WHERE desc_rol = 'ADMIN'));"
