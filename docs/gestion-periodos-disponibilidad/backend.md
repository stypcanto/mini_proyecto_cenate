# 📋 Documentación Backend - Gestión de Períodos Médicos de Disponibilidad

## 📍 Ubicación
**Paquete:** `com.styp.cenate.api.disponibilidad`  
**Controller:** `PeriodoMedicoDisponibilidadController.java`  
**Base URL:** `/api/periodos-medicos-disponibilidad`

---

## 🎯 Descripción
Controlador REST para la gestión de períodos globales de disponibilidad médica. Permite crear, consultar, actualizar y eliminar períodos que definen los rangos de tiempo en los que los médicos pueden declarar su disponibilidad.

---

## 🔐 Seguridad
- **Roles permitidos:** `SUPERADMIN`, `ADMIN`, `COORDINADOR`
- **Autenticación:** Requerida (Bearer Token)
- **CORS:** Configurado para los siguientes orígenes:
  - `http://localhost:5173`
  - `http://localhost:3000`
  - `http://127.0.0.1:5173`
  - `http://10.0.89.241:5173`
  - `http://10.0.89.239:5173`

---

## 📡 Endpoints

### 1. Listar Todos los Períodos
**GET** `/api/periodos-medicos-disponibilidad`

**Descripción:** Obtiene todos los períodos médicos de disponibilidad registrados.

**Autorización:** `SUPERADMIN`, `ADMIN`, `COORDINADOR`

**Respuesta:**
```json
[
  {
    "idPeriodoRegDisp": 1,
    "anio": 2026,
    "periodo": "202601",
    "descripcion": "Enero 2026",
    "fechaInicio": "2026-01-01T00:00:00",
    "fechaFin": "2026-01-31T23:59:59",
    "estado": "ACTIVO",
    "createdBy": "admin",
    "updatedBy": "admin",
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z"
  }
]
```

**Código de estado:** `200 OK`

---

### 2. Listar Períodos Activos
**GET** `/api/periodos-medicos-disponibilidad/activos`

**Descripción:** Obtiene solo los períodos que están en estado `ACTIVO`.

**Autorización:** `SUPERADMIN`, `ADMIN`, `COORDINADOR`

**Respuesta:** Igual que el endpoint anterior, pero filtrado por estado `ACTIVO`.

**Código de estado:** `200 OK`

---

### 3. Listar Períodos Vigentes
**GET** `/api/periodos-medicos-disponibilidad/vigentes`

**Descripción:** Obtiene los períodos que están vigentes (fecha actual dentro del rango del período).

**Autorización:** `SUPERADMIN`, `ADMIN`, `COORDINADOR`

**Respuesta:** Igual que el endpoint anterior, pero filtrado por vigencia.

**Código de estado:** `200 OK`

---

### 4. Listar Años Disponibles
**GET** `/api/periodos-medicos-disponibilidad/anios`

**Descripción:** Obtiene la lista de años únicos que tienen períodos registrados.

**Autorización:** `SUPERADMIN`, `ADMIN`, `COORDINADOR`

**Respuesta:**
```json
[2024, 2025, 2026]
```

**Código de estado:** `200 OK`

---

### 5. Obtener Período por ID
**GET** `/api/periodos-medicos-disponibilidad/{id}`

**Descripción:** Obtiene un período específico por su ID.

**Autorización:** `SUPERADMIN`, `ADMIN`, `COORDINADOR`

**Parámetros:**
- `id` (Path Variable, Long): ID del período a consultar

**Respuesta:**
```json
{
  "idPeriodoRegDisp": 1,
  "anio": 2026,
  "periodo": "202601",
  "descripcion": "Enero 2026",
  "fechaInicio": "2026-01-01T00:00:00",
  "fechaFin": "2026-01-31T23:59:59",
  "estado": "ACTIVO",
  "createdBy": "admin",
  "updatedBy": "admin",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T10:30:00Z"
}
```

**Código de estado:** `200 OK`

**Errores:**
- `404 Not Found`: Si el período no existe

---

### 6. Crear Período
**POST** `/api/periodos-medicos-disponibilidad`

**Descripción:** Crea un nuevo período médico de disponibilidad.

**Autorización:** `SUPERADMIN`, `ADMIN`, `COORDINADOR`

**Body (JSON):**
```json
{
  "anio": 2026,
  "periodo": "202601",
  "descripcion": "Enero 2026",
  "fechaInicio": "2026-01-01",
  "fechaFin": "2026-01-31"
}
```

**Validaciones:**
- `anio`: Obligatorio, entre 2020 y 2100
- `periodo`: Obligatorio, formato YYYYMM (6 caracteres)
- `descripcion`: Obligatorio, no vacío
- `fechaInicio`: Obligatorio, formato YYYY-MM-DD
- `fechaFin`: Obligatorio, formato YYYY-MM-DD

**Respuesta:**
```json
{
  "idPeriodoRegDisp": 1,
  "anio": 2026,
  "periodo": "202601",
  "descripcion": "Enero 2026",
  "fechaInicio": "2026-01-01T00:00:00",
  "fechaFin": "2026-01-31T23:59:59",
  "estado": "ACTIVO",
  "createdBy": "admin",
  "updatedBy": null,
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": null
}
```

**Código de estado:** `201 Created`

**Errores:**
- `400 Bad Request`: Si los datos no son válidos
- `409 Conflict`: Si ya existe un período con el mismo código

---

### 7. Actualizar Período
**PUT** `/api/periodos-medicos-disponibilidad/{id}`

**Descripción:** Actualiza un período existente.

**Autorización:** `SUPERADMIN`, `ADMIN`, `COORDINADOR`

**Parámetros:**
- `id` (Path Variable, Long): ID del período a actualizar

**Body (JSON):**
```json
{
  "anio": 2026,
  "periodo": "202601",
  "descripcion": "Enero 2026 - Actualizado",
  "fechaInicio": "2026-01-01",
  "fechaFin": "2026-01-31"
}
```

**Validaciones:** Igual que crear

**Respuesta:**
```json
{
  "idPeriodoRegDisp": 1,
  "anio": 2026,
  "periodo": "202601",
  "descripcion": "Enero 2026 - Actualizado",
  "fechaInicio": "2026-01-01T00:00:00",
  "fechaFin": "2026-01-31T23:59:59",
  "estado": "ACTIVO",
  "createdBy": "admin",
  "updatedBy": "admin",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T11:00:00Z"
}
```

**Código de estado:** `200 OK`

**Errores:**
- `400 Bad Request`: Si los datos no son válidos
- `404 Not Found`: Si el período no existe

---

### 8. Cambiar Estado del Período
**PUT** `/api/periodos-medicos-disponibilidad/{id}/estado`

**Descripción:** Cambia el estado de un período (ACTIVO, CERRADO, BORRADOR, ANULADO).

**Autorización:** `SUPERADMIN`, `ADMIN`, `COORDINADOR`

**Parámetros:**
- `id` (Path Variable, Long): ID del período

**Body (JSON):**
```json
{
  "estado": "CERRADO"
}
```

**Estados válidos:**
- `ACTIVO`: Período activo y disponible para captura
- `CERRADO`: Período cerrado, no se pueden hacer más capturas
- `BORRADOR`: Período en borrador
- `ANULADO`: Período anulado

**Respuesta:**
```json
{
  "idPeriodoRegDisp": 1,
  "anio": 2026,
  "periodo": "202601",
  "descripcion": "Enero 2026",
  "fechaInicio": "2026-01-01T00:00:00",
  "fechaFin": "2026-01-31T23:59:59",
  "estado": "CERRADO",
  "createdBy": "admin",
  "updatedBy": "admin",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-01-15T12:00:00Z"
}
```

**Código de estado:** `200 OK`

**Errores:**
- `400 Bad Request`: Si el estado no es válido
- `404 Not Found`: Si el período no existe

---

### 9. Eliminar Período
**DELETE** `/api/periodos-medicos-disponibilidad/{id}`

**Descripción:** Elimina un período médico de disponibilidad.

**Autorización:** `SUPERADMIN`, `ADMIN`, `COORDINADOR`

**Parámetros:**
- `id` (Path Variable, Long): ID del período a eliminar

**Respuesta:** Sin contenido

**Código de estado:** `204 No Content`

**Errores:**
- `404 Not Found`: Si el período no existe
- `409 Conflict`: Si el período tiene disponibilidades asociadas

---

## 📦 DTOs

### PeriodoMedicoDisponibilidadRequest
```java
{
  "anio": Integer,           // 2020-2100, obligatorio
  "periodo": String,         // YYYYMM (6 caracteres), obligatorio
  "descripcion": String,     // No vacío, obligatorio
  "fechaInicio": LocalDate,  // YYYY-MM-DD, obligatorio
  "fechaFin": LocalDate      // YYYY-MM-DD, obligatorio
}
```

### PeriodoMedicoDisponibilidadResponse
```java
{
  "idPeriodoRegDisp": Long,
  "anio": Integer,
  "periodo": String,
  "descripcion": String,
  "fechaInicio": LocalDateTime,
  "fechaFin": LocalDateTime,
  "estado": String,          // ACTIVO, CERRADO, BORRADOR, ANULADO
  "createdBy": String,
  "updatedBy": String,
  "createdAt": OffsetDateTime,
  "updatedAt": OffsetDateTime
}
```

**Métodos helper del Response:**
- `isActivo()`: Retorna `true` si el estado es `ACTIVO`
- `isCerrado()`: Retorna `true` si el estado es `CERRADO`
- `isBorrador()`: Retorna `true` si el estado es `BORRADOR`
- `isAnulado()`: Retorna `true` si el estado es `ANULADO`

---

## 🔗 Dependencias

### Service
- `PeriodoMedicoDisponibilidadService`: Servicio que contiene la lógica de negocio

### DTOs
- `PeriodoMedicoDisponibilidadRequest`: DTO para crear/actualizar
- `PeriodoMedicoDisponibilidadResponse`: DTO para respuestas

---

## 📝 Notas de Implementación

1. **Auditoría:** El sistema registra automáticamente el usuario que crea o modifica un período mediante `Authentication`.

2. **Validación:** Todos los endpoints de creación y actualización usan `@Valid` para validar los DTOs según las anotaciones de Jakarta Validation.

3. **Logging:** Todos los endpoints registran sus operaciones usando SLF4J.

4. **Estados:** Los períodos pueden estar en diferentes estados que controlan su disponibilidad para captura.

5. **Formato de Período:** El campo `periodo` debe seguir el formato `YYYYMM` (ej: `202601` para enero de 2026).

---

## 🧪 Ejemplos de Uso

### Crear un período con cURL
```bash
curl -X POST http://localhost:8080/api/periodos-medicos-disponibilidad \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "anio": 2026,
    "periodo": "202601",
    "descripcion": "Enero 2026",
    "fechaInicio": "2026-01-01",
    "fechaFin": "2026-01-31"
  }'
```

### Cambiar estado con cURL
```bash
curl -X PUT http://localhost:8080/api/periodos-medicos-disponibilidad/1/estado \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "estado": "CERRADO"
  }'
```

---

## 📚 Archivos Relacionados

- **Controller:** `backend/src/main/java/com/styp/cenate/api/disponibilidad/PeriodoMedicoDisponibilidadController.java`
- **Service Interface:** `backend/src/main/java/com/styp/cenate/service/disponibilidad/PeriodoMedicoDisponibilidadService.java`
- **Service Implementation:** `backend/src/main/java/com/styp/cenate/service/disponibilidad/PeriodoMedicoDisponibilidadServiceImpl.java`
- **Request DTO:** `backend/src/main/java/com/styp/cenate/dto/disponibilidad/PeriodoMedicoDisponibilidadRequest.java`
- **Response DTO:** `backend/src/main/java/com/styp/cenate/dto/disponibilidad/PeriodoMedicoDisponibilidadResponse.java`
- **Model:** `backend/src/main/java/com/styp/cenate/model/PeriodoMedicoDisponibilidad.java`

---

**Última actualización:** 2026-01-27
