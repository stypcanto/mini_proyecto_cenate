# 🏗️ Arquitectura del Módulo TeleEKG

**Versión:** v1.51.0
**Estado:** ✅ Production Ready
**Última actualización:** 2026-02-06

---

## 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React 19)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ruta: /teleekgs/upload          → UploadImagenECG.jsx     │
│  Ruta: /teleekgs/listar          → RegistroPacientes.jsx   │
│  Ruta: /teleecg/recibidas        → TeleECGRecibidas.jsx    │
│  Componente: TeleEKGBreadcrumb.jsx (en las 3 vistas)       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Servicios Frontend                                         │
│  ├─ teleecgService.js (Upload, Listar, Recibidas)         │
│  └─ teleekgService.js (Upload, Listar)                    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP REST (JWT + MBAC)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Spring Boot 3.5.6)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  API Endpoints:                                             │
│  ├─ POST   /api/teleekgs/upload-multiple                   │
│  ├─ GET    /api/teleekgs/listar                            │
│  ├─ GET    /api/teleekgs/agrupar-por-asegurado             │
│  ├─ GET    /api/teleekgs/estadisticas                      │
│  ├─ PUT    /api/teleekgs/{id}/evaluar                      │
│  └─ GET    /api/teleekgs/preview/{id}                      │
│                                                             │
│  Controllers:                                               │
│  └─ TeleECGController.java                                 │
│                                                             │
│  Services:                                                  │
│  ├─ TeleECGService.java                                    │
│  ├─ TeleECGEstadoTransformer.java (transformación)         │
│  └─ TeleECGImagenRepository.java (datos)                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Seguridad                                                  │
│  ├─ JWT Tokens (@JwtTokenProvider)                         │
│  └─ MBAC Roles (@CheckMBACPermission)                      │
│     ├─ EXTERNO (IPRESS)                                    │
│     ├─ COORDINADOR                                         │
│     ├─ COORDINADOR_RED                                     │
│     ├─ ADMIN                                               │
│     └─ SUPERADMIN                                          │
└────────────────────┬────────────────────────────────────────┘
                     │ JDBC + JPA
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL 14+ (Base de Datos)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tabla: teleecg_imagen                                      │
│  ├─ id_imagen (PK)                                          │
│  ├─ num_doc_paciente (FK)                                   │
│  ├─ nombres_paciente                                        │
│  ├─ apellidos_paciente                                      │
│  ├─ telefono_paciente                                       │
│  ├─ estado (ENVIADA, OBSERVADA, ATENDIDA)                  │
│  ├─ nombre_archivo                                          │
│  ├─ url_imagen (base64)                                     │
│  ├─ fecha_envio                                             │
│  ├─ observaciones                                           │
│  ├─ id_imagen_anterior (FK - referencia anterior)          │
│  ├─ fue_subsanado (boolean)                                │
│  └─ ipress_nombre                                           │
│                                                             │
│  Índices:                                                   │
│  ├─ idx_teleecg_estado                                     │
│  ├─ idx_teleecg_paciente                                   │
│  └─ idx_teleecg_fecha                                      │
│                                                             │
│  Tabla: teleecg_evaluacion (opcional)                      │
│  ├─ id_evaluacion (PK)                                      │
│  ├─ id_imagen (FK)                                          │
│  ├─ resultado (NORMAL, ANORMAL)                             │
│  ├─ descripcion                                             │
│  ├─ evaluador_id (FK)                                       │
│  └─ fecha_evaluacion                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Flujo de Datos

### 1️⃣ Upload (IPRESS)

```
UploadImagenECG.jsx
    ↓
formData: {
  archivos: [imagen1, imagen2, ...]  // 4-10 imágenes
  numDocPaciente: "12345678"
  nombresPaciente: "Juan"
  apellidosPaciente: "Pérez"
}
    ↓
POST /api/teleekgs/upload-multiple
    ↓
TeleECGController.subirMultiples()
    ↓
TeleECGService.guardarImagenes()
    ↓
teleecg_imagen INSERT (estado: ENVIADA)
    ↓
Response: { success: true, data: [imagenesGuardadas] }
    ↓
Frontend: Toast + Redirect a /teleekgs/listar
```

### 2️⃣ Listar (IPRESS)

```
RegistroPacientes.jsx (useLocation detects state)
    ↓
GET /api/teleekgs/listar?filtros...
    ↓
TeleECGController.listar()
    ↓
TeleECGService.buscarImagenes()
    ↓
SELECT * FROM teleecg_imagen
    ↓
Response: { data: [imágenes], pagination: {...} }
    ↓
Frontend: Tabla con filtro DNI auto-aplicado
```

### 3️⃣ Recibidas (CENATE)

```
TeleECGRecibidas.jsx (auto-refresh cada 30s)
    ↓
GET /api/teleekgs/agrupar-por-asegurado
    ↓
TeleECGController.agruparPorAsegurado()
    ↓
TeleECGService.agruparPorPaciente()
    ↓
SELECT * FROM teleecg_imagen (grouped by num_doc_paciente)
    ↓
Estados transformados: ENVIADA → PENDIENTE
    ↓
Response: { data: [pacientesAgrupados], stats: {...} }
    ↓
Frontend: Tabla consolidada con auto-refresh
```

### 4️⃣ Evaluación (CENATE)

```
ModalEvaluacionECG.jsx
    ↓
PUT /api/teleekgs/{id}/evaluar
  Body: { resultado: "NORMAL", descripcion: "Sin observaciones" }
    ↓
TeleECGController.evaluarImagen()
    ↓
TeleECGService.evaluarImagen()
    ↓
UPDATE teleecg_imagen SET estado='ATENDIDA'
INSERT INTO teleecg_evaluacion (...)
    ↓
Response: { success: true }
    ↓
Frontend: Toast + Actualiza tabla automáticamente
```

---

## 📦 Componentes y Responsabilidades

### Frontend Components

| Componente | Archivo | Responsabilidad |
|-----------|---------|-----------------|
| **UploadImagenECG** | `UploadImagenECG.jsx` | Subir imágenes (4-10) con validación |
| **RegistroPacientes** | `RegistroPacientes.jsx` | Listar imágenes de IPRESS |
| **TeleECGRecibidas** | `TeleECGRecibidas.jsx` | Vista consolidada CENATE |
| **TeleEKGBreadcrumb** | `TeleEKGBreadcrumb.jsx` | Navegación visual 3 pasos |
| **VisorECGModal** | `VisorECGModal.jsx` | Preview de imagen |
| **CarrouselECGModal** | `CarrouselECGModal.jsx` | Carrusel de imágenes |
| **ModalEvaluacionECG** | `ModalEvaluacionECG.jsx` | Evaluar imagen (NORMAL/ANORMAL) |

### Backend Services

| Servicio | Archivo | Responsabilidad |
|---------|---------|-----------------|
| **TeleECGService** | `TeleECGService.java` | Lógica principal |
| **TeleECGController** | `TeleECGController.java` | Endpoints REST |
| **TeleECGEstadoTransformer** | `TeleECGEstadoTransformer.java` | Transformar estados por rol |
| **TeleECGRepository** | `TeleECGImagenRepository.java` | Acceso a datos |

---

## 🎨 Estados y Transformación

### Estados en BD (Internal)

```
ENVIADA     ← Imagen subida por IPRESS (inicial)
OBSERVADA   ← CENATE tiene observaciones/rechaza
ATENDIDA    ← CENATE completó evaluación
```

### Transformación por Rol

```java
// En TeleECGEstadoTransformer.java

public String transformarEstado(String estadoBD, boolean esExterno) {
  if (esExterno) {  // Usuario IPRESS
    switch (estadoBD) {
      case "ENVIADA": return "ENVIADA ✈️";
      case "OBSERVADA": return "RECHAZADA ❌";
      case "ATENDIDA": return "ATENDIDA ✅";
    }
  } else {  // Usuario CENATE
    switch (estadoBD) {
      case "ENVIADA": return "PENDIENTE ⏳";
      case "OBSERVADA": return "OBSERVADA 👁️";
      case "ATENDIDA": return "ATENDIDA ✅";
    }
  }
}
```

### Vista del Usuario

| Estado BD | Usuario IPRESS | Usuario CENATE |
|-----------|----------------|----------------|
| ENVIADA | ENVIADA ✈️ | PENDIENTE ⏳ |
| OBSERVADA | RECHAZADA ❌ | OBSERVADA 👁️ |
| ATENDIDA | ATENDIDA ✅ | ATENDIDA ✅ |

---

## 🔐 Seguridad y Permisos

### JWT Tokens
- Emitidos en `/auth/login`
- Validados en cada request (Authorization header)
- Contienen: `userId`, `roles`, `permissions`

### MBAC (Role-Based Access Control)
```java
// En cada endpoint
@CheckMBACPermission(roles = {"EXTERNO", "ADMIN"})
public ResponseEntity<?> subirImagenes(...) {
  // Solo EXTERNO o ADMIN puede subir
}
```

### Permisos por Rol

```
EXTERNO (IPRESS)
├─ POST /api/teleekgs/upload-multiple       ✅
├─ GET  /api/teleekgs/listar                ✅
├─ GET  /api/teleekgs/{id}/preview          ✅
└─ PUT  /api/teleekgs/{id}/evaluar          ❌

COORDINADOR / COORDINADOR_RED
├─ POST /api/teleekgs/upload-multiple       ❌
├─ GET  /api/teleekgs/listar                ❌
├─ GET  /api/teleekgs/agrupar-por-asegurado ✅
└─ PUT  /api/teleekgs/{id}/evaluar          ❌

ADMIN / SUPERADMIN
├─ POST /api/teleekgs/upload-multiple       ✅
├─ GET  /api/teleekgs/listar                ✅
├─ GET  /api/teleekgs/agrupar-por-asegurado ✅
└─ PUT  /api/teleekgs/{id}/evaluar          ✅
```

---

## ⚡ Performance y Optimización

### Índices de Base de Datos
```sql
CREATE INDEX idx_teleecg_estado
  ON teleecg_imagen(estado);

CREATE INDEX idx_teleecg_paciente
  ON teleecg_imagen(num_doc_paciente);

CREATE INDEX idx_teleecg_fecha
  ON teleecg_imagen(fecha_envio DESC);

CREATE INDEX idx_teleecg_ipress
  ON teleecg_imagen(ipress_nombre);
```

### Pagination
```javascript
// Frontend
const [pagination, setPagination] = useState({
  page: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0
});

// API
GET /api/teleekgs/listar?page=0&size=10
```

### Caching
```javascript
// TeleECGRecibidas.jsx
// Auto-refresh cada 30 segundos
// Sin mostrar loading (silencioso)
```

---

## 🔄 Ciclo de Vida de una Imagen

```
1. Upload (IPRESS)
   └─ Estado: ENVIADA ✈️ / PENDIENTE ⏳

2. Espera Revisión
   └─ Estado: ENVIADA ✈️ / PENDIENTE ⏳

3. CENATE Revisa
   └─ Dos opciones:
      a) NORMAL/ANORMAL: ATENDIDA ✅
      b) Con Observaciones: OBSERVADA 👁️ / RECHAZADA ❌

4. Evaluación Completa
   └─ Estado: ATENDIDA ✅

5. [Opcional] Re-envío (si fue rechazada)
   └─ Nueva imagen: ENVIADA ✈️ / PENDIENTE ⏳
   └─ Anterior: fue_subsanado = true
```

---

## 📊 Configuración de Límites

### Validaciones en Frontend

```javascript
const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB por imagen
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MIN_IMAGENES = 4;   // Mínimo PADOMI
const MAX_IMAGENES = 10;  // Máximo PADOMI
```

### Validaciones en Backend

```java
// application.yml
spring:
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 50MB
```

---

## 🛠️ Configuración de Auto-Refresh

### Intervalo Configurable

```javascript
// En TeleECGRecibidas.jsx (línea 72)
const REFRESH_INTERVAL = 30000;  // ms = 30 segundos

// Cambiar a:
const REFRESH_INTERVAL = 60000;  // 60 segundos
// o
const REFRESH_INTERVAL = 15000;  // 15 segundos
```

---

## 📈 Métricas y Monitoreo

### Endpoints Importantes
```
GET /api/teleekgs/estadisticas
├─ total_imagenes_cargadas
├─ total_imagenes_pendientes
├─ total_imagenes_rechazadas
└─ total_imagenes_procesadas
```

### Logs Recomendados
```
INFO:  Upload exitoso
WARN:  Imagen rechazada
ERROR: Error al subir imagen
DEBUG: Auto-refresh ejecutado
```

---

**Arquitectura del Módulo TeleEKG - Completa y Optimizada** ✅
