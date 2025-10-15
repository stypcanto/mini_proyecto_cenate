# 🧪 COMANDOS CURL - PRUEBAS API MBAC CENATE

## 📝 CONFIGURACIÓN INICIAL

```bash
# Variables de entorno
export BASE_URL="http://localhost:8080"
export JWT_TOKEN="tu_token_jwt_aqui"
```

---

## 🔐 1. AUTENTICACIÓN

### Login
```bash
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "tu_password"
  }'
```

**Copiar el token JWT de la respuesta y exportarlo:**
```bash
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔑 2. API DE PERMISOS

### 2.1 Health Check
```bash
curl -X GET "$BASE_URL/api/permisos/health" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 2.2 Obtener permisos de usuario por ID
```bash
curl -X GET "$BASE_URL/api/permisos/usuario/1" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2.3 Obtener permisos por username
```bash
curl -X GET "$BASE_URL/api/permisos/usuario/username/superadmin" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2.4 Obtener permisos de usuario en módulo específico
```bash
curl -X GET "$BASE_URL/api/permisos/usuario/1/modulo/1" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2.5 Verificar permiso específico (permitido)
```bash
curl -X POST "$BASE_URL/api/permisos/check" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "rutaPagina": "/roles/medico/pacientes",
    "accion": "ver"
  }'
```

### 2.6 Verificar permiso denegado
```bash
curl -X POST "$BASE_URL/api/permisos/check" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 3,
    "rutaPagina": "/roles/superadmin/permisos",
    "accion": "eliminar"
  }'
```

### 2.7 Obtener módulos accesibles
```bash
curl -X GET "$BASE_URL/api/permisos/usuario/1/modulos" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2.8 Obtener páginas accesibles de un módulo
```bash
curl -X GET "$BASE_URL/api/permisos/usuario/1/modulo/1/paginas" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📊 3. API DE AUDITORÍA

### 3.1 Health Check Auditoría
```bash
curl -X GET "$BASE_URL/api/auditoria/health" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 3.2 Obtener auditoría modular (paginada)
```bash
curl -X GET "$BASE_URL/api/auditoria/modulos?page=0&size=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3.3 Auditoría de usuario específico
```bash
curl -X GET "$BASE_URL/api/auditoria/usuario/1?page=0&size=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3.4 Auditoría por username
```bash
curl -X GET "$BASE_URL/api/auditoria/username/superadmin?page=0&size=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3.5 Auditoría por módulo
```bash
curl -X GET "$BASE_URL/api/auditoria/modulo/dim_permisos_modulares?page=0&size=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3.6 Auditoría por acción (INSERT/UPDATE/DELETE)
```bash
# INSERT
curl -X GET "$BASE_URL/api/auditoria/accion/INSERT?page=0&size=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"

# UPDATE
curl -X GET "$BASE_URL/api/auditoria/accion/UPDATE?page=0&size=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"

# DELETE
curl -X GET "$BASE_URL/api/auditoria/accion/DELETE?page=0&size=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3.7 Auditoría por rango de fechas
```bash
curl -X GET "$BASE_URL/api/auditoria/rango?fechaInicio=2025-10-01T00:00:00&fechaFin=2025-10-31T23:59:59&page=0&size=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3.8 Auditoría de usuario por fechas
```bash
curl -X GET "$BASE_URL/api/auditoria/usuario/1/rango?fechaInicio=2025-10-01T00:00:00&fechaFin=2025-10-31T23:59:59&page=0&size=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3.9 Resumen estadístico
```bash
curl -X GET "$BASE_URL/api/auditoria/resumen" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3.10 Últimos N eventos
```bash
curl -X GET "$BASE_URL/api/auditoria/ultimos?limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3.11 Búsqueda por texto
```bash
curl -X GET "$BASE_URL/api/auditoria/buscar?texto=puede_ver&page=0&size=10" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🔒 4. PRUEBAS DE SEGURIDAD

### 4.1 Sin token (debe fallar - 401)
```bash
curl -X GET "$BASE_URL/api/permisos/usuario/1" \
  -H "Content-Type: application/json"
```

### 4.2 Token inválido (debe fallar - 401)
```bash
curl -X GET "$BASE_URL/api/permisos/usuario/1" \
  -H "Authorization: Bearer token_invalido_123" \
  -H "Content-Type: application/json"
```

### 4.3 Usuario inexistente (debe fallar - 404)
```bash
curl -X GET "$BASE_URL/api/permisos/usuario/99999" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📈 5. PRUEBAS CON jq (Formateo JSON)

Si tienes `jq` instalado, puedes formatear las respuestas:

```bash
# Ejemplo con formato bonito
curl -s -X GET "$BASE_URL/api/permisos/usuario/1" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Extraer solo los nombres de módulos
curl -s -X GET "$BASE_URL/api/permisos/usuario/1/modulos" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.modulos[]'

# Contar total de permisos
curl -s -X GET "$BASE_URL/api/permisos/usuario/1" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq 'length'
```

---

## 🧪 6. PRUEBAS AVANZADAS

### 6.1 Verificar múltiples acciones para un usuario
```bash
for action in ver crear editar eliminar exportar aprobar; do
  echo "Testing action: $action"
  curl -s -X POST "$BASE_URL/api/permisos/check" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": 1,
      \"rutaPagina\": \"/roles/medico/pacientes\",
      \"accion\": \"$action\"
    }" | jq '.permitido'
done
```

### 6.2 Obtener permisos de todos los módulos
```bash
for modulo in {1..7}; do
  echo "Módulo $modulo:"
  curl -s -X GET "$BASE_URL/api/permisos/usuario/1/modulo/$modulo" \
    -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
done
```

### 6.3 Estadísticas de auditoría
```bash
# Resumen
curl -s -X GET "$BASE_URL/api/auditoria/resumen" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.resumenPorTipoEvento'

# Total de eventos
curl -s -X GET "$BASE_URL/api/auditoria/resumen" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.totalEventos'
```

---

## 📊 7. PRUEBA DE CARGA (Con Apache Bench)

```bash
# Instalar Apache Bench (si no lo tienes)
# Ubuntu/Debian: sudo apt-get install apache2-utils
# macOS: ya viene instalado

# 100 requests, 10 concurrentes
ab -n 100 -c 10 \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/api/permisos/usuario/1"
```

---

## 🎯 8. CASOS DE PRUEBA ESPECÍFICOS

### 8.1 Caso: SUPERADMIN accede a todo
```bash
# Debería tener acceso completo
curl -X POST "$BASE_URL/api/permisos/check" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "rutaPagina": "/roles/superadmin/permisos",
    "accion": "eliminar"
  }' | jq '.'
```

### 8.2 Caso: MEDICO NO puede acceder a admin
```bash
# Debería estar denegado
curl -X POST "$BASE_URL/api/permisos/check" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 3,
    "rutaPagina": "/roles/superadmin/permisos",
    "accion": "ver"
  }' | jq '.'
```

### 8.3 Caso: ADMIN puede ver reportes pero no eliminar
```bash
# Ver - debería estar permitido
curl -X POST "$BASE_URL/api/permisos/check" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "rutaPagina": "/roles/admin/reportes/citas",
    "accion": "ver"
  }' | jq '.'

# Eliminar - debería estar denegado
curl -X POST "$BASE_URL/api/permisos/check" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "rutaPagina": "/roles/admin/reportes/citas",
    "accion": "eliminar"
  }' | jq '.'
```

---

## 📝 NOTAS IMPORTANTES

1. **Reemplazar variables**:
   - `$JWT_TOKEN`: Tu token JWT real
   - `$BASE_URL`: URL del servidor (por defecto: http://localhost:8080)

2. **IDs de usuarios** (según tu base de datos):
   - 1 = SUPERADMIN
   - 2 = ADMIN
   - 3 = MEDICO

3. **Códigos HTTP esperados**:
   - 200: Éxito
   - 401: No autorizado (sin token o token inválido)
   - 403: Forbidden (sin permisos)
   - 404: No encontrado

4. **Formatos de fecha**: ISO 8601
   - Ejemplo: `2025-10-15T14:30:00`

---

## 🔗 RECURSOS ADICIONALES

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/v3/api-docs
- **Actuator Health**: http://localhost:8080/actuator/health

---

**Generado por**: CENATE Development Team  
**Fecha**: 2025-10-15  
**Versión**: 1.0
