# 🧪 PRUEBAS DE ENDPOINTS - MÓDULO 107 v3.0.0

**Guía para probar los 3 endpoints nuevos del Módulo 107**

---

## 📋 PREREQUISITOS

1. **Servidor Backend corriendo:**
   ```bash
   cd backend
   ./gradlew bootRun
   # Esperar a que diga "Tomcat started on port 8080"
   ```

2. **Token JWT válido** (necesario para autenticación)

3. **Cliente HTTP:** curl, Postman, Insomnia, o navegador

---

## 🔐 PASO 1: OBTENER JWT TOKEN

### Opción A: Con curl

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456"
  }'
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "roles": ["SUPERADMIN"]
}
```

**Guardar el token en variable:**
```bash
TOKEN="tu_token_aqui"
```

### Opción B: Con Postman
- Method: POST
- URL: `http://localhost:8080/api/auth/login`
- Body (raw JSON):
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- Copiar el token de la respuesta

---

## 🧪 PRUEBA 1: LISTAR PACIENTES DEL MÓDULO 107

### Descripción
Obtener lista paginada de todos los pacientes del Módulo 107.

### URL
```
GET /api/bolsa107/pacientes?page=0&size=10
```

### Con curl
```bash
curl -X GET "http://localhost:8080/api/bolsa107/pacientes?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

### Parámetros
- `page` (default: 0) - Número de página (0-indexed)
- `size` (default: 30) - Registros por página
- `sortBy` (opcional, default: "fechaSolicitud") - Campo para ordenar
- `sortDirection` (opcional, default: "DESC") - ASC o DESC

### Respuesta esperada
```json
{
  "total": 150,
  "page": 0,
  "size": 10,
  "totalPages": 15,
  "pacientes": [
    {
      "idSolicitud": 1,
      "numeroSolicitud": "BOL107-000001-0001",
      "pacienteDni": "12345678",
      "pacienteNombre": "Juan Pérez",
      "pacienteSexo": "M",
      "pacienteTelefono": "987654321",
      "especialidad": "CARDIOLOGIA",
      "codigoAdscripcion": "0001",
      "tipoCita": "VOLUNTARIA",
      "estadoGestionCitasId": 1,
      "fechaSolicitud": "2026-01-29T10:30:00Z",
      "fechaAsignacion": null,
      "responsableGestoraId": null
    }
  ]
}
```

### Códigos HTTP esperados
- ✅ 200 OK - Funcionó correctamente
- ❌ 401 Unauthorized - Token inválido o expirado
- ❌ 403 Forbidden - Usuario sin permiso de ver pacientes
- ❌ 500 Internal Server Error - Error en servidor

---

## 🔍 PRUEBA 2: BÚSQUEDA AVANZADA CON FILTROS

### Descripción
Buscar pacientes con múltiples criterios (DNI, nombre, IPRESS, estado, fechas).

### URL
```
GET /api/bolsa107/pacientes/buscar?dni=12345678&page=0&size=10
```

### Con curl - Búsqueda por DNI

```bash
curl -X GET "http://localhost:8080/api/bolsa107/pacientes/buscar?dni=12345678" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

### Con curl - Búsqueda por Nombre

```bash
curl -X GET "http://localhost:8080/api/bolsa107/pacientes/buscar?nombre=Juan" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

### Con curl - Búsqueda por IPRESS y Estado

```bash
curl -X GET "http://localhost:8080/api/bolsa107/pacientes/buscar?codigoIpress=0001&estadoId=1&page=0&size=20" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

### Con curl - Búsqueda por Rango de Fechas

```bash
curl -X GET "http://localhost:8080/api/bolsa107/pacientes/buscar?fechaDesde=2026-01-01T00:00:00Z&fechaHasta=2026-01-31T23:59:59Z&page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

### Parámetros disponibles
- `dni` - DNI del paciente (búsqueda parcial, LIKE)
- `nombre` - Nombre del paciente (case-insensitive, LIKE)
- `codigoIpress` - Código IPRESS (búsqueda exacta)
- `estadoId` - ID del estado de gestión de citas (búsqueda exacta)
- `fechaDesde` - Fecha inicio en formato ISO (ej: 2026-01-29T00:00:00Z)
- `fechaHasta` - Fecha fin en formato ISO
- `page` - Número de página
- `size` - Registros por página

### Respuesta esperada
Misma estructura que Prueba 1, pero con resultados filtrados.

---

## 📊 PRUEBA 3: OBTENER ESTADÍSTICAS

### Descripción
Obtener KPIs completos, distribuciones y análisis del Módulo 107.

### URL
```
GET /api/bolsa107/estadisticas
```

### Con curl

```bash
curl -X GET "http://localhost:8080/api/bolsa107/estadisticas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

### Respuesta esperada

```json
{
  "kpis": {
    "total_pacientes": 150,
    "total_atendidas": 90,
    "total_pendientes": 45,
    "total_canceladas": 15,
    "total_derivadas": 0,
    "tasa_completacion": 60.0,
    "tasa_abandono": 10.0,
    "horas_promedio_general": 24,
    "pendientes_vencidas": 5
  },
  "distribucion_estado": [
    {
      "estado": "ATENDIDO",
      "cantidad": 90,
      "porcentaje": 60.0
    },
    {
      "estado": "PENDIENTE",
      "cantidad": 45,
      "porcentaje": 30.0
    },
    {
      "estado": "CANCELADO",
      "cantidad": 15,
      "porcentaje": 10.0
    }
  ],
  "distribucion_especialidad": [
    {
      "especialidad": "CARDIOLOGIA",
      "total": 50,
      "atendidos": 35,
      "cancelados": 5,
      "pendientes": 10,
      "tasa_completacion": 70.0,
      "tasa_cancelacion": 10.0,
      "horas_promedio": 20
    },
    {
      "especialidad": "NEUROLOGIA",
      "total": 40,
      "atendidos": 30,
      "cancelados": 5,
      "pendientes": 5,
      "tasa_completacion": 75.0,
      "tasa_cancelacion": 12.5,
      "horas_promedio": 18
    }
  ],
  "top_10_ipress": [
    {
      "codigo_ipress": "0001",
      "nombre_ipress": "IPRESS Lima Centro",
      "red_asistencial": "Red Lima Centro",
      "total": 50,
      "atendidos": 35,
      "pendientes": 10,
      "cancelados": 5,
      "tasa_completacion": 70.0,
      "ranking": 1
    }
  ],
  "evolucion_temporal": [
    {
      "fecha": "2026-01-29",
      "nuevas_solicitudes": 10,
      "completadas": 6,
      "pendientes": 4,
      "cumulativo_total": 150
    },
    {
      "fecha": "2026-01-28",
      "nuevas_solicitudes": 8,
      "completadas": 5,
      "pendientes": 3,
      "cumulativo_total": 140
    }
  ]
}
```

---

## 🧬 PRUEBAS COMBINADAS

### Prueba: Búsqueda compleja

```bash
# Buscar pacientes cardiólogos pendientes en los últimos 7 días
curl -X GET "http://localhost:8080/api/bolsa107/pacientes/buscar" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data-urlencode "nombre=Juan" \
  --data-urlencode "codigoIpress=0001" \
  --data-urlencode "estadoId=1" \
  --data-urlencode "page=0" \
  --data-urlencode "size=20"
```

---

## ✅ MATRIZ DE PRUEBAS

| # | Endpoint | Parámetros | Status | Notas |
|---|----------|-----------|--------|-------|
| 1 | GET /api/bolsa107/pacientes | page=0&size=10 | ⏳ | Debe retornar lista paginada |
| 2 | GET /api/bolsa107/pacientes/buscar | dni=12345678 | ⏳ | Búsqueda por DNI |
| 3 | GET /api/bolsa107/pacientes/buscar | nombre=Juan | ⏳ | Búsqueda por nombre (case-insensitive) |
| 4 | GET /api/bolsa107/pacientes/buscar | codigoIpress=0001 | ⏳ | Búsqueda por IPRESS |
| 5 | GET /api/bolsa107/pacientes/buscar | estadoId=1 | ⏳ | Filtro por estado |
| 6 | GET /api/bolsa107/pacientes/buscar | fechaDesde=2026-01-01T00:00:00Z&fechaHasta=2026-01-31T23:59:59Z | ⏳ | Rango de fechas |
| 7 | GET /api/bolsa107/estadisticas | - | ⏳ | KPIs y gráficos |
| 8 | GET /api/bolsa107/pacientes | page=1&size=30 | ⏳ | Paginación segunda página |
| 9 | GET /api/bolsa107/pacientes/buscar | dni=123&nombre=Juan&page=0&size=50 | ⏳ | Búsqueda múltiple |

**Leyenda:**
- ⏳ = Pendiente de probar
- ✅ = Pasó prueba
- ❌ = Falló prueba
- 🟨 = Advertencia

---

## 🔒 PRUEBAS DE SEGURIDAD - MBAC

### Prueba: Token inválido

```bash
curl -X GET "http://localhost:8080/api/bolsa107/pacientes" \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -H "Content-Type: application/json"
```

**Resultado esperado:** 401 Unauthorized

### Prueba: Sin Authorization header

```bash
curl -X GET "http://localhost:8080/api/bolsa107/pacientes" \
  -H "Content-Type: application/json"
```

**Resultado esperado:** 401 Unauthorized

### Prueba: Usuario sin permisos

```bash
# Si tienes usuario con rol MEDICO (sin acceso a Bolsas)
curl -X GET "http://localhost:8080/api/bolsa107/pacientes" \
  -H "Authorization: Bearer $TOKEN_MEDICO" \
  -H "Content-Type: application/json"
```

**Resultado esperado:** 403 Forbidden

---

## 🐛 TROUBLESHOOTING

### Problema: "Connection refused"
- **Causa:** Servidor no está corriendo
- **Solución:** Ejecutar `cd backend && ./gradlew bootRun`

### Problema: "401 Unauthorized"
- **Causa:** Token inválido o expirado
- **Solución:** Obtener nuevo token con POST /api/auth/login

### Problema: "403 Forbidden"
- **Causa:** Usuario sin permisos MBAC
- **Solución:** Usar usuario con rol SUPERADMIN, ADMIN o COORDINADOR

### Problema: "Empty result set"
- **Causa:** No hay datos en bolsa_107_item o dim_solicitud_bolsa
- **Solución:** Cargar archivo Excel desde UI para generar datos de prueba

### Problema: "jq: command not found"
- **Solución:** Instalar jq: `brew install jq` (macOS) o `apt install jq` (Linux)
- **Alternativa:** Omitir `| jq '.'` para ver respuesta cruda

---

## 📝 SCRIPT DE PRUEBA COMPLETO

Guarda este script como `test_modulo_107.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:8080"
USERNAME="admin"
PASSWORD="123456"

echo "========================================="
echo "PRUEBAS - MÓDULO 107 v3.0.0"
echo "========================================="

# Obtener token
echo "Obteniendo token..."
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener token"
  exit 1
fi

echo "✅ Token obtenido"
echo ""

# Prueba 1
echo "1️⃣  Listar pacientes..."
curl -s -X GET "$API_URL/api/bolsa107/pacientes?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.total,.page,.totalPages' || echo "❌ Error"

# Prueba 2
echo "2️⃣  Buscar con filtros..."
curl -s -X GET "$API_URL/api/bolsa107/pacientes/buscar?nombre=Juan" \
  -H "Authorization: Bearer $TOKEN" | jq '.total' || echo "❌ Error"

# Prueba 3
echo "3️⃣  Obtener estadísticas..."
curl -s -X GET "$API_URL/api/bolsa107/estadisticas" \
  -H "Authorization: Bearer $TOKEN" | jq '.kpis.total_pacientes' || echo "❌ Error"

echo ""
echo "✅ Pruebas completadas"
```

Ejecutar:
```bash
chmod +x test_modulo_107.sh
./test_modulo_107.sh
```

---

## 📞 CONTACTO Y SOPORTE

- **Documentación completa:** `IMPLEMENTACION_MODULO_107_COMPLETADA.md`
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **Logs:** `/tmp/spring_boot.log`
- **Health check:** http://localhost:8080/api/health

---

**Generado:** 2026-01-29
**Versión:** v3.0.0
**Desarrollador:** Styp Canto Rondón
