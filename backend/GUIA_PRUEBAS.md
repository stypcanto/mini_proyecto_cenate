# 🧪 GUÍA RÁPIDA DE PRUEBAS - MBAC API

## 📁 Archivos Creados

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| `test_mbac_api.sh` | Script interactivo de pruebas | Ejecutar paso a paso |
| `CURL_COMMANDS.md` | Comandos curl listos | Copiar y pegar |
| `CENATE_MBAC_API.postman_collection.json` | Colección Postman | Importar en Postman |

---

## 🚀 OPCIÓN 1: Script Interactivo

### Dar permisos y ejecutar:
```bash
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/backend

chmod +x test_mbac_api.sh
./test_mbac_api.sh
```

### Características:
- ✅ Pruebas paso a paso
- ✅ Explicaciones de cada endpoint
- ✅ Respuestas esperadas
- ✅ 23 casos de prueba
- ✅ Formato amigable con colores

---

## 🚀 OPCIÓN 2: Comandos CURL Directos

### 🧩 1. Autenticarse y obtener token
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}' | jq .
```
Esto muestra el token, los roles, permisos, etc.


🧩 Validación de endpoints activos
```bash
curl -s http://localhost:8080/actuator/mappings | grep "api/"

```

### 🔐 2. Guardar el token automáticamente
```bash

export JWT_TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"scantor","password":"admin123"}' | jq -r '.token')
```

Puedes comprobarlo con:
```
echo $JWT_TOKEN
```

###  🌐 3. Definir la URL base del backend
```bash
export BASE_URL="http://localhost:8080"
```
###  🚀 4. Probar endpoints

```bash
# ================================
# 🔹 1. Health check del módulo
# ================================
curl -X GET "$BASE_URL/api/permisos/health" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .

Este endpoint /api/permisos/health actúa como un “ping de salud” o health check interno.
Su función es confirmar que el microservicio o módulo de “Permisos”:
	•	está levantado correctamente dentro del contenedor Spring Boot,
	•	tiene su contexto inicializado,
	•	puede procesar peticiones,
	•	y está accesible a través de tu autenticación JWT.

# ================================
# 🔹 2. Obtener permisos de usuario
# ================================
curl -X GET "http://localhost:8080/api/permisos/usuario/1" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq .

# ================================
# 🔹 3. Verificar un permiso específico
# ================================

curl -X POST "http://localhost:8080/api/permisos/check" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "rutaPagina": "/roles/medico/pacientes",
    "accion": "ver"
  }' | jq .

# ================================
# 🔹 4. Para saber qué módulos tiene habilitados el usuario:
# ================================
curl -X GET "$BASE_URL/api/permisos/usuario/1/modulos" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
  
# ================================
# 🔹 5. Obtener páginas accesibles de un módulo
# ================================
 curl -X GET "$BASE_URL/api/permisos/usuario/1/modulo/1/paginas" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
 
 
 # ================================
# 🔹 6. (Si quieres probar la nueva API /api/admin/permisos)
# ================================
curl -X GET "$BASE_URL/api/admin/permisos/rol/1" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
  
  
```


### 5. Verificar que el backend responde desde fuera del contenedor
```bash
curl -X GET "http://localhost:8080/api/auth/me" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq .
```

### 6. Probar si NGINX (frontend) está reenviando bien el tráfico
```bash
curl -X GET "http://localhost/api/auth/me" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq .
```

### 7. Para verificar que el backend devuelve permisos correctamente:
```bash
curl -X GET "http://localhost:8080/api/usuarios" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq .
```

### 8. Permisos
```bash
curl -X GET "http://localhost:8080/api/admin/permisos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .

curl -X GET "http://localhost:8080/api/admin/permisos/rol/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .


```


### 9. Usuarios
```bash
curl -X GET "http://localhost:8080/api/usuarios" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

### 10. Roles

✅ Listar todos los roles
```bash
curl -X GET "http://localhost:8080/api/admin/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
```
🔎 Esto debería retornar un JSON con todos los roles de la tabla dim_roles.


✅ Obtener un rol por ID
```bash
curl -X GET "http://localhost:8080/api/admin/roles/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
```
Reemplaza 1 con el ID real que quieras consultar (id_rol).


✅ Crear un nuevo rol
```bash
curl -X POST "http://localhost:8080/api/admin/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "descRol": "COORDINADOR_REGIONAL"
  }' | jq .
```
Esto debería crear un nuevo registro en dim_roles.

✅ Actualizar un rol existente
```bash
curl -X PUT "http://localhost:8080/api/admin/roles/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "descRol": "COORDINADOR_ACTUALIZADO"
  }' | jq .
```
Modifica el campo desc_rol del rol con ID 1.

✅ Eliminar un rol
```bash
curl -X DELETE "http://localhost:8080/api/admin/roles/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
```

✅ Listar permisos de un rol específico (por ejemplo, ADMIN)

```bash
curl -X GET "http://localhost:8080/api/admin/permisos/rol/2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
```
Esto mostrará los permisos asignados al id_rol = 2 (ADMIN).

✅ Actualizar un permiso específico (por ejemplo, habilitar puede_actualizar)
```bash
curl -X PUT "http://localhost:8080/api/admin/permisos/5" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "puede_actualizar": true,
    "puede_eliminar": false
  }' | jq .
```
👉 Reemplaza 5 con el id_permiso real que veas en tu base.

✅ Crear un nuevo permiso para un rol
```bash
curl -X POST "http://localhost:8080/api/admin/permisos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "descPermiso": "GESTIONAR_HORARIOS",
    "idRol": 2,
    "puede_ver": true,
    "puede_crear": true,
    "puede_actualizar": false,
    "puede_eliminar": false
  }' | jq .
```

✅ Eliminar un permiso
```bash
curl -X DELETE "http://localhost:8080/api/admin/permisos/10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```




### 11. Áreas
```bash
curl -X GET "http://localhost:8080/api/area" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```
Elimina el rol con ID 1 (si tu controlador lo permite).



### 12. Profesiones
```bash
curl -X GET "http://localhost:8080/api/profesiones" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

### 13. Regímenes laborales
```bash
curl -X GET "http://localhost:8080/api/regimenes" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

### 14. Logs de auditoría
```bash
curl -X GET "http://localhost:8080/api/audit/logs" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

### 15. Personal CNT
```bash
curl -X GET "http://localhost:8080/api/personal" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

### 16. Asegurados (pacientes)
```bash
curl -X GET "http://localhost:8080/api/asegurados" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

### 17. Total de Usuarios
```bash
curl -X GET "http://localhost:8080/api/personal/total" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

### 18. Usuarios Internos
```bash
curl -X GET "http://localhost:8080/api/personal/detalle/1" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

### 19. Usuarios Externos
```bash
curl -X GET "http://localhost:8080/api/personal/detalle/4" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

### 20. Mes de cumpleanos
```bash
curl -X GET "http://localhost:8080/api/personal/cumpleaneros/mes/10" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

### 21. Dia de cumpleanos
```bash
curl -X GET "http://localhost:8080/api/personal/total" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq .
```

### 22. listar rápidamente todos los endpoints disponibles
```bash
curl -s -X GET "http://localhost:8080/api" | jq .
```


### 23. GET básico auditoria
```bash
curl -X GET "http://localhost:8080/api/auditoria" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 24. GET básico auditoria con parametro
```bash
curl -X GET "http://localhost:8080/api/auditoria?usuario=scantor" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### 25. POST de auditoría:
```bash
curl -X POST "http://localhost:8080/api/auditoria" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "usuario": "scantor",
    "modulo": "dim_personal_externo",
    "accion": "UPDATE",
    "estado": "SUCCESS",
    "detalle": "Cambio en correo y teléfono",
    "ip": "192.168.1.77",
    "dispositivo": "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_5)"
  }'
```




---

## 🚀 OPCIÓN 3: Postman Collection

### 1. Abrir Postman

### 2. Importar colección:
- File → Import
- Seleccionar: `CENATE_MBAC_API.postman_collection.json`

### 3. Configurar variables:
En la colección, editar variables:
- `baseUrl`: http://localhost:8080
- `jwtToken`: (se llenará automáticamente al hacer login)

### 4. Ejecutar pruebas:
1. Ejecutar "01 - Autenticación → Login" (guarda el token automáticamente)
2. Ejecutar cualquier otro endpoint

### 5. Runner de Postman:
- Collection Runner → Seleccionar "CENATE - MBAC API Tests"
- Run → Ejecuta todos los tests automáticamente

---

## 📊 ESTRUCTURA DE PRUEBAS

### API de Permisos (8 endpoints):
```
✅ GET  /api/permisos/health
✅ GET  /api/permisos/usuario/{id}
✅ GET  /api/permisos/usuario/username/{username}
✅ GET  /api/permisos/usuario/{userId}/modulo/{idModulo}
✅ POST /api/permisos/check
✅ GET  /api/permisos/usuario/{userId}/modulos
✅ GET  /api/permisos/usuario/{userId}/modulo/{idModulo}/paginas
```

### API de Auditoría (11 endpoints):
```
✅ GET  /api/auditoria/health
✅ GET  /api/auditoria/modulos
✅ GET  /api/auditoria/usuario/{userId}
✅ GET  /api/auditoria/username/{username}
✅ GET  /api/auditoria/modulo/{modulo}
✅ GET  /api/auditoria/accion/{accion}
✅ GET  /api/auditoria/rango
✅ GET  /api/auditoria/usuario/{userId}/rango
✅ GET  /api/auditoria/resumen
✅ GET  /api/auditoria/ultimos
✅ GET  /api/auditoria/buscar
```

### Pruebas de Seguridad (3 casos):
```
❌ Sin token (401)
❌ Token inválido (401)
❌ Usuario inexistente (404)
```

---

## 🎯 QUICK TEST (Prueba Rápida)

```bash
# 1. Login y guardar token
TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"tu_password"}' | jq -r '.token')

# 2. Health check
curl -X GET "http://localhost:8080/api/permisos/health" \
  -H "Authorization: Bearer $TOKEN"

# 3. Obtener permisos
curl -X GET "http://localhost:8080/api/permisos/usuario/1" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 4. Verificar un permiso
curl -X POST "http://localhost:8080/api/permisos/check" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"rutaPagina":"/roles/medico/pacientes","accion":"ver"}' | jq '.'

# 5. Ver últimos eventos de auditoría
curl -X GET "http://localhost:8080/api/auditoria/ultimos?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

## 🔧 TROUBLESHOOTING

### Error: "Connection refused"
```bash
# Verificar que el servidor esté corriendo
curl http://localhost:8080/actuator/health
```

### Error: 401 Unauthorized
```bash
# Verificar el token
echo $JWT_TOKEN

# Re-autenticar si es necesario
curl -X POST "http://localhost:8080/api/auth/login" ...
```

### Error: 404 Not Found
```bash
# Verificar la URL
echo $BASE_URL

# Listar endpoints disponibles
curl http://localhost:8080/actuator/mappings
```

### Ver logs del servidor
```bash
# Si usas Gradle
./gradlew bootRun

# Si usas Docker
docker logs cenate-backend
```

---

## 📈 PRUEBAS DE CARGA

### Con Apache Bench (ab):
```bash
# 1000 requests, 50 concurrentes
ab -n 1000 -c 50 \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:8080/api/permisos/usuario/1"
```

### Con wrk:
```bash
# 30 segundos, 10 threads, 100 conexiones
wrk -t10 -c100 -d30s \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:8080/api/permisos/usuario/1"
```

---

## 📚 DOCUMENTACIÓN SWAGGER

Una vez el servidor esté corriendo:

```
http://localhost:8080/swagger-ui.html
```

Buscar las secciones:
- **Permisos MBAC**
- **Auditoría MBAC**

---

## ✅ CHECKLIST DE PRUEBAS

- [ ] Servidor corriendo (`./gradlew bootRun`)
- [ ] Base de datos inicializada (`psql ... -f sql/mbac_init_data.sql`)
- [ ] Login exitoso y token obtenido
- [ ] Health checks respondiendo (permisos y auditoría)
- [ ] Permisos de SUPERADMIN funcionando (acceso completo)
- [ ] Permisos de ADMIN funcionando (limitado)
- [ ] Permisos de MEDICO funcionando (más limitado)
- [ ] Auditoría registrando eventos
- [ ] Pruebas de seguridad (401, 403, 404)
- [ ] Swagger UI accesible

---

## 🎉 SIGUIENTE PASO

Una vez completadas las pruebas:

1. ✅ Integrar con el frontend React
2. ✅ Configurar administración de permisos
3. ✅ Monitorear auditoría regularmente
4. ✅ Configurar alertas para cambios críticos

---

**¿Necesitas ayuda?**

Consulta los archivos:
- `MBAC_README.md` - Documentación técnica completa
- `INSTRUCCIONES_COMPILACION.md` - Guía de compilación
- `ERRORES_CORREGIDOS.md` - Solución de problemas

---

**Autor**: CENATE Development Team  
**Fecha**: 2025-10-15  
**Versión**: 1.0
