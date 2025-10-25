# 🏥 CENATE – Centro Nacional de Telemedicina
### **API REST MBAC / Usuarios / Auditoría**
        **Versión:** 2025.10 | **Autor:** Styp Canto Rondón
**Entidad:** EsSalud – Oficina de Gestión de Tecnologías de la Información
**Afiliado HL7 Perú 🇵🇪**

        ---

        ## 🔰 1. Introducción
Esta guía documenta los principales endpoints del backend **CENATE API** en entorno local (`http://localhost:8080`), con ejemplos reales de llamadas `curl` y sus respuestas esperadas en formato JSON.

        Los tokens JWT deben obtenerse previamente con las credenciales de un usuario válido (por ejemplo `scantor`).

        ---

        ## 🔐 2. Autenticación

### Login de usuario
```bash
curl -X POST http://localhost:8080/api/auth/login   -H "Content-Type: application/json"   -d '{
        "username": "scantor",
        "password": "admin123"
        }' | jq
        ```

        **Respuesta esperada:**
        ```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "username": "scantor",
        "roles": ["SUPERADMIN"],
    "expiresIn": 3600000
}
```

        ---

        ## 🧩 3. Módulo MBAC – Permisos

### 3.1 Verificar salud del módulo
```bash
curl -X GET "http://localhost:8080/api/permisos/health"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```
        **Respuesta esperada:**
        ```json
{"status": "OK", "module": "Permisos", "timestamp": "2025-10-25T12:00:00Z"}
```

        ### 3.2 Obtener permisos por rol
```bash
curl -X GET "http://localhost:8080/api/permisos/rol/1"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ### 3.3 Obtener permisos por usuario
```bash
curl -X GET "http://localhost:8080/api/mbac/permisos/usuario/1"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ### 3.4 Listar módulos accesibles
```bash
curl -X GET "http://localhost:8080/api/mbac/permisos/usuario/1/modulos"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        **Respuesta esperada:**
        ```json
[
        {"idModulo": 1, "nombreModulo": "Gestión de Citas", "activo": true},
        {"idModulo": 7, "nombreModulo": "Gestión de Usuarios", "activo": true}
        ]
        ```

        ### 3.5 Verificar acción específica
```bash
curl -X POST "http://localhost:8080/api/mbac/permisos/verificar"   -H "Authorization: Bearer $JWT_TOKEN"   -H "Content-Type: application/json"   -d '{
        "idUser": 1,
        "rutaPagina": "/roles/admin/usuarios",
        "accion": "crear"
        }' | jq
        ```
        **Respuesta esperada:**
        ```json
{"idUser":1,"rutaPagina":"/roles/admin/usuarios","accion":"crear","permitido":false}
```

        ---

        ## 👥 4. Usuarios

### Listar todos los usuarios
```bash
curl -X GET "http://localhost:8080/api/usuarios"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ---

        ## 🧱 5. Roles

### Listar roles
```bash
curl -X GET "http://localhost:8080/api/admin/roles"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ### Obtener rol por ID
```bash
curl -X GET "http://localhost:8080/api/admin/roles/1"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ### Crear nuevo rol
```bash
curl -X POST "http://localhost:8080/api/admin/roles"   -H "Authorization: Bearer $JWT_TOKEN"   -H "Content-Type: application/json"   -d '{"descRol": "COORDINADOR_REGIONAL"}' | jq
```

        ### Actualizar rol
```bash
curl -X PUT "http://localhost:8080/api/admin/roles/1"   -H "Authorization: Bearer $JWT_TOKEN"   -H "Content-Type: application/json"   -d '{"descRol": "COORDINADOR_ACTUALIZADO"}' | jq
```

        ### Eliminar rol
```bash
curl -X DELETE "http://localhost:8080/api/admin/roles/23"   -H "Authorization: Bearer $JWT_TOKEN"
        ```

        ---

        ## 🔒 6. Permisos (Administración)

### Listar permisos por rol
```bash
curl -X GET "http://localhost:8080/api/admin/permisos/rol/2"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ### Crear permiso
```bash
curl -X POST "http://localhost:8080/api/admin/permisos"   -H "Authorization: Bearer $JWT_TOKEN"   -H "Content-Type: application/json"   -d '{
        "descPermiso": "GESTIONAR_HORARIOS",
        "idRol": 2,
        "puede_ver": true,
        "puede_crear": true
        }' | jq
        ```

        ### Actualizar permiso
```bash
curl -X PUT "http://localhost:8080/api/admin/permisos/5"   -H "Authorization: Bearer $JWT_TOKEN"   -H "Content-Type: application/json"   -d '{"puede_actualizar": true, "puede_eliminar": false}' | jq
```

        ---

        ## 🏢 7. Áreas
```bash
curl -X GET "http://localhost:8080/api/admin/areas"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        **Respuesta esperada:**
        ```json
[{"idArea":1,"descArea":"CONSULTA EXTERNA","statArea":"A"}]
        ```

        ---

        ## 🎓 8. Profesiones
```bash
curl -X GET "http://localhost:8080/api/profesiones"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```
        ```bash
curl -X GET "http://localhost:8080/api/profesiones/activas"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ---

        ## 💼 9. Regímenes laborales
```bash
curl -X GET "http://localhost:8080/api/regimenes"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ---

        ## 🧾 10. Auditoría
```bash
curl -X GET "http://localhost:8080/api/admin/audit/logs"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        **Registrar evento:**
        ```bash
curl -X POST "http://localhost:8080/api/auditoria"   -H "Authorization: Bearer $JWT_TOKEN"   -H "Content-Type: application/json"   -d '{
        "usuario": "scantor",
        "modulo": "dim_personal_externo",
        "accion": "UPDATE",
        "estado": "SUCCESS"
        }' | jq
        ```

        ---

        ## 🧑‍⚕️ 11. Personal y Asegurados

```bash
curl -X GET "http://localhost:8080/api/personal/total"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ```bash
curl -X GET "http://localhost:8080/api/personal/detalle/1"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ```bash
curl -X GET "http://localhost:8080/api/asegurados"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ---

        ## 📊 12. Dashboard
```bash
curl -X GET "http://localhost:8080/api/dashboard/resumen"   -H "Authorization: Bearer $JWT_TOKEN" | jq
```

        ---

        ## 📍 13. Endpoints globales
```bash
curl -X GET "http://localhost:8080/api" | jq
```

        ---

        ## ✅ Observaciones finales
- Todos los endpoints requieren token JWT activo.
- Para entornos Docker, reemplazar `localhost` por el hostname del contenedor backend (`cenate-backend`).
        - Todos los `POST` y `PUT` deben enviarse con `Content-Type: application/json`.
