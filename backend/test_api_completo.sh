#!/bin/bash

# ============================================
# GUÍA DE PRUEBAS - APIs CENATE
# ============================================
# Ejecuta estos comandos en tu terminal
# Base URL: http://localhost:8080

BASE_URL="http://localhost:8080"

# ============================================
# 1. AUTENTICACIÓN
# ============================================

echo "=== 1. LOGIN ==="
# Login y obtener token JWT
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }' | jq '.'

# Guarda el token para usarlo en los siguientes requests
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Reemplaza con el token real

# ============================================
# 2. PERSONAL EXTERNO - CRUD
# ============================================

echo -e "\n=== 2. CREAR PERSONAL EXTERNO ==="
curl -X POST "$BASE_URL/api/personal-externo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tipoPersonal": "EXTERNO",
    "idTipoDocumento": 1,
    "numeroDocumento": "75894621",
    "nombres": "MARIA ELENA",
    "apellidoPaterno": "GONZALES",
    "apellidoMaterno": "TORRES",
    "fechaNacimiento": "1985-03-15",
    "genero": "F",
    "telefono": "987654321",
    "emailPersonal": "mgonzales@sanjuanmiraflores.gob.pe",
    "idIpress": 356,
    "idUsuario": 4
  }' | jq '.'

echo -e "\n=== 3. LISTAR TODO EL PERSONAL EXTERNO ==="
curl -X GET "$BASE_URL/api/personal-externo" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 4. OBTENER PERSONAL EXTERNO POR ID ==="
curl -X GET "$BASE_URL/api/personal-externo/2" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 5. BUSCAR PERSONAL EXTERNO ==="
curl -X GET "$BASE_URL/api/personal-externo/search?query=GONZALES" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 6. PERSONAL EXTERNO POR IPRESS ==="
curl -X GET "$BASE_URL/api/personal-externo/ipress/356" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 7. PERSONAL EXTERNO POR USUARIO ==="
curl -X GET "$BASE_URL/api/personal-externo/usuario/4" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 8. ACTUALIZAR PERSONAL EXTERNO ==="
curl -X PUT "$BASE_URL/api/personal-externo/2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tipoPersonal": "EXTERNO",
    "idTipoDocumento": 1,
    "numeroDocumento": "75894621",
    "nombres": "MARIA ELENA",
    "apellidoPaterno": "GONZALES",
    "apellidoMaterno": "TORRES",
    "fechaNacimiento": "1985-03-15",
    "genero": "F",
    "telefono": "987654322",
    "emailPersonal": "mgonzales_updated@sanjuanmiraflores.gob.pe",
    "idIpress": 356,
    "idUsuario": 4
  }' | jq '.'

echo -e "\n=== 9. ELIMINAR PERSONAL EXTERNO ==="
# curl -X DELETE "$BASE_URL/api/personal-externo/999" \
#   -H "Authorization: Bearer $TOKEN"

# ============================================
# 10. PERSONAL CNT - CRUD
# ============================================

echo -e "\n=== 10. CREAR PERSONAL CNT ==="
curl -X POST "$BASE_URL/api/personal-cnt" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tipoPersonal": "CENATE",
    "idTipoDocumento": 1,
    "numeroDocumento": "12345678",
    "nombres": "JUAN CARLOS",
    "apellidoPaterno": "LOPEZ",
    "apellidoMaterno": "RAMIREZ",
    "fechaNacimiento": "1990-05-20",
    "genero": "M",
    "periodo": "202501",
    "estado": "A",
    "telefono": "999888777",
    "emailPersonal": "jlopez@cenate.gob.pe",
    "emailCorporativo": "juan.lopez@cenate.gob.pe",
    "numeroColegiatura": "CMP12345",
    "codigoPlanilla": "PLN-2025-001",
    "direccion": "Av. Principal 123, Lima",
    "idArea": 1,
    "idRegimenLaboral": 1,
    "idUsuario": 5
  }' | jq '.'

echo -e "\n=== 11. LISTAR TODO EL PERSONAL CNT ==="
curl -X GET "$BASE_URL/api/personal-cnt" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 12. OBTENER PERSONAL CNT POR ID ==="
curl -X GET "$BASE_URL/api/personal-cnt/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 13. BUSCAR PERSONAL CNT ==="
curl -X GET "$BASE_URL/api/personal-cnt/search?query=LOPEZ" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 14. PERSONAL CNT POR ÁREA ==="
curl -X GET "$BASE_URL/api/personal-cnt/area/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 15. PERSONAL CNT POR RÉGIMEN LABORAL ==="
curl -X GET "$BASE_URL/api/personal-cnt/regimen-laboral/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 16. PERSONAL CNT ACTIVO ==="
curl -X GET "$BASE_URL/api/personal-cnt/activo" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 17. PERSONAL CNT INACTIVO ==="
curl -X GET "$BASE_URL/api/personal-cnt/inactivo" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 18. PERSONAL CNT POR USUARIO ==="
curl -X GET "$BASE_URL/api/personal-cnt/usuario/5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 19. ACTUALIZAR PERSONAL CNT ==="
curl -X PUT "$BASE_URL/api/personal-cnt/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tipoPersonal": "CENATE",
    "idTipoDocumento": 1,
    "numeroDocumento": "12345678",
    "nombres": "JUAN CARLOS",
    "apellidoPaterno": "LOPEZ",
    "apellidoMaterno": "RAMIREZ",
    "fechaNacimiento": "1990-05-20",
    "genero": "M",
    "periodo": "202501",
    "estado": "A",
    "telefono": "999888999",
    "emailPersonal": "jlopez_updated@cenate.gob.pe",
    "emailCorporativo": "juan.lopez@cenate.gob.pe",
    "numeroColegiatura": "CMP12345",
    "codigoPlanilla": "PLN-2025-001",
    "direccion": "Av. Principal 456, Lima",
    "idArea": 1,
    "idRegimenLaboral": 1,
    "idUsuario": 5
  }' | jq '.'

# ============================================
# 20. GESTIÓN DE FOTOS (PERSONAL CNT)
# ============================================

echo -e "\n=== 20. SUBIR FOTO DE PERSONAL CNT ==="
# Crea una imagen de prueba primero
# curl -X POST "$BASE_URL/api/personal-cnt/1/foto" \
#   -H "Authorization: Bearer $TOKEN" \
#   -F "file=@/ruta/a/tu/foto.jpg"

echo -e "\n=== 21. OBTENER FOTO DE PERSONAL CNT ==="
# curl -X GET "$BASE_URL/api/personal-cnt/1/foto" \
#   -H "Authorization: Bearer $TOKEN" \
#   -o "foto_personal_1.jpg"

echo -e "\n=== 22. ELIMINAR FOTO DE PERSONAL CNT ==="
# curl -X DELETE "$BASE_URL/api/personal-cnt/1/foto" \
#   -H "Authorization: Bearer $TOKEN"

# ============================================
# 23. USUARIOS
# ============================================

echo -e "\n=== 23. LISTAR TODOS LOS USUARIOS ==="
curl -X GET "$BASE_URL/api/usuarios" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 24. OBTENER USUARIO POR ID ==="
curl -X GET "$BASE_URL/api/usuarios/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 25. CREAR NUEVO USUARIO ==="
curl -X POST "$BASE_URL/api/usuarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "nuevo_usuario",
    "password": "password123",
    "roleIds": [2],
    "estado": "ACTIVO"
  }' | jq '.'

echo -e "\n=== 26. ACTIVAR USUARIO ==="
curl -X PATCH "$BASE_URL/api/usuarios/1/activate" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 27. DESACTIVAR USUARIO ==="
curl -X PATCH "$BASE_URL/api/usuarios/1/deactivate" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 28. DESBLOQUEAR USUARIO ==="
curl -X PATCH "$BASE_URL/api/usuarios/1/unlock" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 29. CAMBIAR CONTRASEÑA ==="
curl -X POST "$BASE_URL/api/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newPassword456"
  }' | jq '.'

# ============================================
# 30. CATÁLOGOS Y MAESTROS
# ============================================

echo -e "\n=== 30. LISTAR TIPOS DE DOCUMENTO ==="
curl -X GET "$BASE_URL/api/tipos-documento" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 31. LISTAR ÁREAS ==="
curl -X GET "$BASE_URL/api/areas" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 32. LISTAR REGÍMENES LABORALES ==="
curl -X GET "$BASE_URL/api/regimenes-laborales" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 33. LISTAR IPRESS ==="
curl -X GET "$BASE_URL/api/ipress" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 34. BUSCAR IPRESS ==="
curl -X GET "$BASE_URL/api/ipress/search?query=MIRAFLORES" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 35. LISTAR ROLES ==="
curl -X GET "$BASE_URL/api/roles" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# ============================================
# 36. HEALTH CHECK
# ============================================

echo -e "\n=== 36. HEALTH CHECK ==="
curl -X GET "$BASE_URL/api/health" | jq '.'

echo -e "\n=== 37. HEALTH CHECK CON AUTENTICACIÓN ==="
curl -X GET "$BASE_URL/api/health/secure" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== PRUEBAS COMPLETADAS ==="
