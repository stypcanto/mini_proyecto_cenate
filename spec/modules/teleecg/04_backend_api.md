# 🔌 Backend API - TeleEKG

**Versión:** v1.51.0
**Base URL:** `http://localhost:8080/api/teleekgs`
**Authentication:** JWT Token (Authorization header)

---

## 📡 Endpoints REST

### 1. Subir Imágenes (Upload)

```http
POST /api/teleekgs/upload-multiple
```

**Rol requerido:** EXTERNO (IPRESS)

**Request:**
```
Content-Type: multipart/form-data

Headers:
  Authorization: Bearer <JWT_TOKEN>

Body:
  archivos: File[]                    // 4-10 imágenes JPEG/PNG
  numDocPaciente: "12345678"          // DNI del paciente
  nombresPaciente: "Juan"              // Nombres
  apellidosPaciente: "Pérez"           // Apellidos
  telefonoPrincipalPaciente: "999..." // Teléfono (opcional)
  edadPaciente: 45                     // Edad (opcional)
  generoPaciente: "M"                  // M/F (opcional)
  ipressNombre: "CAP II LURÍN"        // Nombre IPRESS
```

**Response (200):**
```json
{
  "success": true,
  "message": "6 imágenes cargadas exitosamente",
  "code": "UPLOAD_SUCCESS",
  "data": [
    {
      "idImagen": 1001,
      "numDocPaciente": "12345678",
      "nombreArchivo": "ekg_20260206_001.jpg",
      "estado": "ENVIADA",
      "fechaEnvio": "2026-02-06T10:30:45Z",
      "ipressNombre": "CAP II LURÍN"
    }
    // ... más imágenes
  ]
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Mínimo 4 imágenes requeridas",
  "code": "MIN_IMAGES_REQUIRED"
}
```

---

### 2. Listar Imágenes (IPRESS)

```http
GET /api/teleekgs/listar?page=0&size=10&estado=TODOS&searchTerm=
```

**Rol requerido:** EXTERNO (IPRESS)

**Query Parameters:**
```
page: 0              // Número de página (0-indexed)
size: 10             // Registros por página
estado: "TODOS"      // TODOS, ENVIADA, OBSERVADA, ATENDIDA
searchTerm: ""       // Búsqueda por DNI o nombre
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "idImagen": 1001,
        "numDocPaciente": "12345678",
        "nombresPaciente": "Juan",
        "apellidosPaciente": "Pérez",
        "estado": "ENVIADA",
        "estadoTransformado": "ENVIADA ✈️",
        "nombreArchivo": "ekg_001.jpg",
        "ipressNombre": "CAP II LURÍN",
        "fechaEnvio": "2026-02-06T10:30:45Z"
      }
      // ... más imágenes
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "totalElements": 42,
      "totalPages": 5
    }
  }
}
```

---

### 3. Agrupar por Asegurado (CENATE)

```http
GET /api/teleekgs/agrupar-por-asegurado?page=0&size=10&estado=TODOS
```

**Rol requerido:** COORDINADOR_RED, ADMIN

**Query Parameters:**
```
page: 0              // Número de página
size: 10             // Registros por página
estado: "TODOS"      // TODOS, PENDIENTE, OBSERVADA, ATENDIDA
ipresses: ""         // Filtrar por IPRESS (opcional)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "numDocPaciente": "12345678",
        "nombresPaciente": "Juan",
        "apellidosPaciente": "Pérez",
        "edadPaciente": 45,
        "generoPaciente": "M",
        "telefonoPrincipalPaciente": "999123456",
        "estado": "PENDIENTE",
        "estadoTransformado": "PENDIENTE ⏳",
        "fechaPrimera": "2026-02-06T10:30:45Z",
        "imagenes": [
          {
            "idImagen": 1001,
            "nombreArchivo": "ekg_001.jpg",
            "estado": "ENVIADA",
            "estadoTransformado": "PENDIENTE ⏳",
            "fechaEnvio": "2026-02-06T10:30:45Z"
          }
          // ... más imágenes
        ]
      }
      // ... más pacientes
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10,
      "totalElements": 25,
      "totalPages": 3
    }
  }
}
```

---

### 4. Obtener Estadísticas

```http
GET /api/teleekgs/estadisticas
```

**Rol requerido:** Público (sin autenticación)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalImagenesCargadas": 156,
    "totalImagenesPendientes": 98,
    "totalImagenesRechazadas": 12,
    "totalImagenesProcesadas": 46
  }
}
```

---

### 5. Evaluar Imagen (CENATE)

```http
PUT /api/teleekgs/{idImagen}/evaluar
```

**Rol requerido:** ADMIN

**Path Parameters:**
```
idImagen: 1001  // ID de la imagen
```

**Request Body:**
```json
{
  "resultado": "NORMAL",           // NORMAL o ANORMAL (requerido)
  "descripcion": "EKG normal"      // Notas (opcional)
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Imagen evaluada como NORMAL",
  "code": "EVALUATION_SUCCESS",
  "data": {
    "idImagen": 1001,
    "estado": "ATENDIDA",
    "estadoTransformado": "ATENDIDA ✅",
    "resultado": "NORMAL",
    "descripcion": "EKG normal",
    "fechaEvaluacion": "2026-02-06T11:00:00Z"
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Imagen no encontrada",
  "code": "IMAGE_NOT_FOUND"
}
```

---

### 6. Obtener Preview

```http
GET /api/teleekgs/preview/{idImagen}
```

**Rol requerido:** Público

**Response (200):**
```
Content-Type: image/jpeg
Body: Base64-encoded image data
```

---

## 🔐 Autenticación y Autorización

### Headers Requeridos

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-User-Role: EXTERNO
```

### MBAC Permissions

```
EXTERNO
├─ POST   /api/teleekgs/upload-multiple        ✅
├─ GET    /api/teleekgs/listar                 ✅
├─ GET    /api/teleekgs/preview/{id}           ✅
└─ PUT    /api/teleekgs/{id}/evaluar           ❌

COORDINADOR_RED / ADMIN
├─ POST   /api/teleekgs/upload-multiple        ❌
├─ GET    /api/teleekgs/agrupar-por-asegurado  ✅
├─ GET    /api/teleekgs/estadisticas           ✅
└─ PUT    /api/teleekgs/{id}/evaluar           ✅
```

---

## 🗂️ Modelos de Respuesta

### Success Response
```json
{
  "success": true,
  "message": "Operación exitosa",
  "code": "SUCCESS",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Descripción del error",
  "code": "ERROR_CODE",
  "timestamp": "2026-02-06T10:30:45Z",
  "path": "/api/teleekgs/upload-multiple"
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado |
|--------|------------|
| 200 | OK - Operación exitosa |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Sin autenticación |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no existe |
| 500 | Internal Server Error - Error del servidor |

---

## 🔍 Filtros Disponibles

### Por Estado
```
TODOS / ENVIADA / OBSERVADA / ATENDIDA (IPRESS)
TODOS / PENDIENTE / OBSERVADA / ATENDIDA (CENATE)
```

### Por IPRESS
```
Multiselect de IPRESS activas
```

### Por Fecha
```
- Hoy
- Ayer
- Últimos 7 días
- Rango personalizado
```

### Por Búsqueda
```
DNI del paciente
Nombre del paciente
```

---

## ⚡ Rate Limiting

```
100 requests per minute por usuario
1000 requests per hour por IPRESS
```

---

## 📝 Ejemplo cURL

### Upload
```bash
curl -X POST http://localhost:8080/api/teleekgs/upload-multiple \
  -H "Authorization: Bearer $TOKEN" \
  -F "archivos=@ekg1.jpg" \
  -F "archivos=@ekg2.jpg" \
  -F "numDocPaciente=12345678" \
  -F "nombresPaciente=Juan" \
  -F "apellidosPaciente=Pérez"
```

### Listar
```bash
curl http://localhost:8080/api/teleekgs/listar?page=0&size=10 \
  -H "Authorization: Bearer $TOKEN"
```

### Evaluar
```bash
curl -X PUT http://localhost:8080/api/teleekgs/1001/evaluar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resultado":"NORMAL","descripcion":"Sin observaciones"}'
```

---

**Backend API - TeleEKG Completa** ✅
