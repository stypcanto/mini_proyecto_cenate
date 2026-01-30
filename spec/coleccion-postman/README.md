# 📫 Colección Postman - CENATE Bolsas de Pacientes + Módulo 107

**Versión:** v3.0.0
**Fecha:** 2026-01-29
**Incluye:** Autenticación + Módulo 107 (NUEVO) + Bolsas de Pacientes (Existentes)

---

## 📋 Contenido

Esta colección contiene todos los endpoints para:

### ✅ Módulo 107 v3.0.0 (NUEVO)
- **GET** `/api/bolsas/modulo107/pacientes` - Listar pacientes
- **GET** `/api/bolsas/modulo107/pacientes/buscar` - Búsqueda con filtros
- **GET** `/api/bolsas/modulo107/estadisticas` - Obtener KPIs

### ✅ Bolsas de Pacientes (Existentes)
- **GET** `/api/bolsas` - Listar bolsas
- **GET** `/api/bolsas/{id}` - Detalles de bolsa
- **GET** `/api/bolsas/solicitudes` - Solicitudes de bolsa

### ✅ Autenticación
- **POST** `/api/auth/login` - Obtener JWT token

---

## 🚀 Cómo Usar

### 1. Importar en Postman

**Opción A: Importar directamente desde Postman**
```
1. Abre Postman
2. Click en "Import"
3. Selecciona archivo: CENATE-Bolsas-Modulo107.postman_collection.json
4. Click en "Import"
```

**Opción B: Importar desde URL**
```
1. Click en "Import"
2. Pega esta URL: file:///Users/styp/Documents/CENATE/...
3. Click en "Import"
```

### 2. Configurar Entorno

**Opción A: Con archivo de entorno**
```
1. Click en el ícono de engranaje (Manage Environments)
2. Click en "Import"
3. Selecciona archivo: CENATE-Entorno.postman_environment.json
4. Click en "Import"
5. Selecciona el entorno "CENATE - Desarrollo"
```

**Opción B: Variables manuales**

Si importas solo la colección sin el entorno, configura estas variables:

| Variable | Valor |
|----------|-------|
| `base_url` | `http://localhost:8080` |
| `username` | `44914706` |
| `password` | `@Styp654321` |
| `jwt_token` | Vacío (se llena automáticamente al hacer login) |

### 3. Obtener Token JWT

**Primer paso: Hacer Login**

1. Abre la carpeta **"🔐 AUTENTICACIÓN"**
2. Haz clic en **"Login"**
3. Click en **"Send"**
4. El token se guardará automáticamente en la variable `jwt_token`

**Verificar que el token se guardó:**
- Click en el ícono de ojo (Environment)
- Verifica que `jwt_token` tenga un valor

### 4. Probar Endpoints

Una vez que tengas el token, puedes probar cualquier endpoint:

**Ejemplo: Listar pacientes**
1. Abre carpeta **"📦 MÓDULO 107 - NUEVO v3.0"**
2. Haz clic en **"1️⃣ Listar Pacientes"**
3. Click en **"Send"**
4. Ver respuesta JSON

---

## 📊 Estructura de Carpetas

```
🔐 AUTENTICACIÓN
├── Login                          (POST /api/auth/login)

📦 MÓDULO 107 - NUEVO v3.0
├── 1️⃣  Listar Pacientes           (GET /api/bolsas/modulo107/pacientes)
├── 2️⃣  Buscar Pacientes (Sin Filtros)  (GET /api/bolsas/modulo107/pacientes/buscar)
├── 2️⃣  Buscar por DNI             (GET /api/bolsas/modulo107/pacientes/buscar?dni=...)
├── 2️⃣  Buscar por Nombre          (GET /api/bolsas/modulo107/pacientes/buscar?nombre=...)
├── 2️⃣  Buscar por IPRESS          (GET /api/bolsas/modulo107/pacientes/buscar?codigoIpress=...)
├── 2️⃣  Buscar por Estado          (GET /api/bolsas/modulo107/pacientes/buscar?estadoId=...)
├── 2️⃣  Buscar por Rango de Fechas (GET /api/bolsas/modulo107/pacientes/buscar?fechaDesde=...&fechaHasta=...)
└── 3️⃣  Obtener Estadísticas       (GET /api/bolsas/modulo107/estadisticas)

📊 BOLSAS DE PACIENTES (Existentes)
├── Listar Todas las Bolsas        (GET /api/bolsas)
├── Obtener Detalles de Bolsa      (GET /api/bolsas/{id})
├── Listar Solicitudes de Bolsa    (GET /api/bolsas/solicitudes)
└── Health Check                   (GET /api/health)
```

---

## 🔍 Ejemplos de Uso

### Ejemplo 1: Listar todos los pacientes

```
GET http://localhost:8080/api/bolsas/modulo107/pacientes?page=0&size=10&sortBy=fechaSolicitud&sortDirection=DESC

Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json

Response:
{
  "total": 150,
  "page": 0,
  "size": 10,
  "totalPages": 15,
  "pacientes": [...]
}
```

### Ejemplo 2: Buscar por DNI

```
GET http://localhost:8080/api/bolsas/modulo107/pacientes/buscar?dni=12345678&page=0&size=10

Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json

Response:
{
  "total": 5,
  "page": 0,
  "size": 10,
  "totalPages": 1,
  "pacientes": [...]
}
```

### Ejemplo 3: Obtener Estadísticas

```
GET http://localhost:8080/api/bolsas/modulo107/estadisticas

Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json

Response:
{
  "kpis": {
    "total_pacientes": 150,
    "atendidos": 90,
    "pendientes": 45,
    "cancelados": 15,
    "tasa_completacion": 60.0,
    "horas_promedio": 24
  },
  "distribucion_estado": [...],
  "distribucion_especialidad": [...],
  "top_10_ipress": [...],
  "evolucion_temporal": [...]
}
```

---

## 🧪 Tests Automatizados

Los endpoints contienen tests Postman que se ejecutan automáticamente:

✅ **Login:** Valida que reciba token válido
✅ **Listar Pacientes:** Valida estructura de respuesta
✅ **Estadísticas:** Valida que contenga KPIs

**Ver resultados de tests:**
1. Click en **"Send"**
2. Abre la pestaña **"Tests"** en la respuesta
3. Ver resultado de cada test

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:** Las credenciales están en el archivo de entorno:

```json
{
  "key": "username",
  "value": "44914706"
},
{
  "key": "password",
  "value": "@Styp654321"
}
```

**NO COMMITS ESTOS ARCHIVOS CON CREDENCIALES REALES EN PRODUCCIÓN**

Para producción, crea un archivo `.env.example`:
```
base_url=http://api.produccion.com
username=tu_usuario
password=tu_password
```

---

## 🐛 Troubleshooting

### ❌ "401 Unauthorized"
- El token expiró
- Solución: Hacer login nuevamente

### ❌ "403 Forbidden"
- Usuario sin permisos
- Solución: Usar usuario con rol SUPERADMIN, ADMIN o COORDINADOR

### ❌ "Connection refused"
- Backend no está corriendo
- Solución: Ejecutar `./gradlew bootRun` en el directorio backend

### ❌ "Invalid JSON"
- Error en el servidor
- Solución: Revisar logs del backend con `tail -f /tmp/server.log`

---

## 📞 Contacto

**Documentación completa:** `IMPLEMENTACION_MODULO_107_COMPLETADA.md`
**Guía de pruebas:** `PRUEBAS_ENDPOINTS_MODULO_107.md`
**Versión:** v3.0.0
**Fecha:** 2026-01-29

---

## ✅ Checklist de Pruebas

- [ ] Importar colección en Postman
- [ ] Importar entorno
- [ ] Hacer Login
- [ ] Verificar que `jwt_token` está lleno
- [ ] Probar "Listar Pacientes"
- [ ] Probar "Buscar por DNI"
- [ ] Probar "Obtener Estadísticas"
- [ ] Probar "Health Check"
- [ ] Revisar resultados de tests

---

**¡Todo listo para probar los endpoints! 🚀**
