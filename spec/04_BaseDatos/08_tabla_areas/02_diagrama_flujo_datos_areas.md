# 🔄 Flujo de Datos: Tabla DIM_AREA (Backend ↔ Frontend)

**Versión:** 1.0
**Fecha:** 2026-01-07
**Contexto:** CENATE - Integración Base de Datos ↔ Frontend
**Autor:** Styp Canto Rondón

---

## 🎯 Propósito

Este documento visualiza cómo fluyen los datos desde la base de datos PostgreSQL, a través del backend Spring Boot, hasta el componente React en el frontend, específicamente para la tabla de AREAS.

---

## 📊 Arquitectura General: Capas de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO (Browser)                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────▼──────────────────┐
                │   React Component: AreasCRUD     │
                │   (frontend/src/pages/.../...)   │
                │                                  │
                │  • Tabla visual                  │
                │  • Modal de formulario           │
                │  • Funciones de utilidad         │
                └───────────────┬──────────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  API HTTP REST JSON     │
                    │  (Axios/Fetch)          │
                    │  localhost:8080/api/... │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────▼──────────────────────────┐
        │     Spring Boot Backend (Java)                   │
        │     API Controllers → Service Layer              │
        │     Business Logic, Validation, Auditing         │
        │     (backend/src/main/java/...)                  │
        └───────────────────────┬──────────────────────────┘
                                │
                ┌───────────────▼──────────────────┐
                │  JPA/Hibernate ORM Mapping       │
                │  (Entity: Area.java)             │
                │  (Repository: AreaRepository)    │
                └───────────────┬──────────────────┘
                                │
        ┌───────────────────────▼──────────────────────────┐
        │  PostgreSQL Database (Port 5432)                 │
        │  Server: 10.0.89.13                              │
        │  Database: maestro_cenate                         │
        │  Table: dim_area                                 │
        │  (id_area, desc_area, stat_area, created_at...)  │
        └──────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida Completo: CREAR ÁREA

### 1. Usuario Completa Formulario en Frontend

```
┌─────────────────────────────────────────┐
│      AreasCRUD.jsx - Modal Form         │
├─────────────────────────────────────────┤
│ [Dependencia     ] DD                   │
│ [Nombre del Area ] DIRECCIÓN DE DESPACHO│
│ [Estado        ] Activo ✓               │
│                                         │
│           [GUARDAR]  [CANCELAR]         │
└─────────────────────────────────────────┘
```

**Estado en React:**
```javascript
formData = {
  dependencia: "DD",
  nombreArea: "DIRECCIÓN DE DESPACHO",
  statArea: "1"  // '1' = A (Activo)
}
```

---

### 2. Usuario Hace Click en "Guardar"

**Función:** `handleSave()`

```javascript
// 1. Validar campos
if (!formData.dependencia.trim() || !formData.nombreArea.trim()) {
  alert('La dependencia y nombre son requeridos');
  return;
}

// 2. Combinar campos
descAreaCombinada = combinareAreaDescripcion(
  "DD",
  "DIRECCIÓN DE DESPACHO"
)
// Resultado: "DD - DIRECCIÓN DE DESPACHO"

// 3. Preparar payload
dataToSave = {
  descArea: "DD - DIRECCIÓN DE DESPACHO",
  statArea: "1"
}
```

---

### 3. Envío HTTP Request (Frontend → Backend)

```
┌────────────────────────────────────────────────┐
│         FRONTEND (React - Axios)               │
├────────────────────────────────────────────────┤
│  POST /api/areas/crear                         │
│                                                │
│  Headers:                                      │
│    Content-Type: application/json              │
│    Authorization: Bearer {JWT_TOKEN}           │
│                                                │
│  Body (JSON):                                  │
│  {                                             │
│    "descArea": "DD - DIRECCIÓN DE DESPACHO",   │
│    "statArea": "1"                             │
│  }                                             │
└──────────────────┬───────────────────────────┘
                   │
                   │ HTTP POST Request
                   │ (Línea de red)
                   │
                   ▼
┌────────────────────────────────────────────────┐
│      BACKEND (Spring Boot - Controller)        │
├────────────────────────────────────────────────┤
│  AreaController.crearArea()                    │
│                                                │
│  @PostMapping("/crear")                        │
│  public ResponseEntity<?> crearArea(           │
│    @RequestBody AreaDTO areaDTO               │
│  ) { ... }                                     │
└────────────────────────────────────────────────┘
```

---

### 4. Procesamiento en Backend (Java)

```
┌─────────────────────────────────────────┐
│     AreaController (API Layer)          │
│  ✓ Recibe JSON                          │
│  ✓ Valida JWT/Autenticación             │
│  ✓ Deserializa a AreaDTO                │
│  ✓ Verifica permisos MBAC               │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│     AreaService (Business Logic)        │
│  ✓ Valida datos de negocio              │
│  ✓ Verifica duplicados (UNIQUE)         │
│  ✓ Crea entidad Area                    │
│  ✓ Registra en AuditLog                 │
│  ✓ Llama a AreaRepository.save()        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│     AreaRepository (JPA Layer)          │
│  ✓ Mapea Area entity a SQL              │
│  ✓ Prepara INSERT statement             │
│  ✓ Ejecuta en PostgreSQL                │
└──────────────────┬──────────────────────┘
```

---

### 5. Inserción en Base de Datos

```sql
-- SQL Generado por Hibernate
INSERT INTO dim_area (
  desc_area,
  stat_area,
  created_at,
  updated_at
) VALUES (
  'DD - DIRECCIÓN DE DESPACHO',  -- ← descArea (combinado)
  'A',                            -- ← statArea ('1' → 'A')
  NOW(),                          -- ← Timestamp automático
  NOW()                           -- ← Timestamp automático
)
RETURNING id_area;

-- Resultado:
-- id_area = 1 (asignado por BIGSERIAL)

-- Fila guardada en BD:
-- 1 | DD - DIRECCIÓN DE DESPACHO | A | 2026-01-07 14:30:00+00:00 | 2026-01-07 14:30:00+00:00
```

---

### 6. Respuesta del Backend

```json
{
  "status": 200,
  "message": "Área creada exitosamente",
  "data": {
    "idArea": 1,
    "descArea": "DD - DIRECCIÓN DE DESPACHO",
    "statArea": "A",
    "createdAt": "2026-01-07T14:30:00Z",
    "updatedAt": "2026-01-07T14:30:00Z"
  }
}
```

---

### 7. Actualización de Frontend

```javascript
// El backend retorna el área creada
// handleSave() ejecuta:

handleCloseModal();  // Cierra el modal
loadAreas();         // Recarga la lista

// loadAreas() hace:
// GET /api/areas/listar → Obtiene todas las áreas
```

---

## 🔄 Ciclo de Vida: LEER/LISTAR ÁREAS

### 1. Frontend Solicita Listado

```
┌──────────────────────────────────────┐
│  useEffect(() => {                   │
│    loadAreas();  ← Al montar component│
│  }, []);                             │
└──────────────────────────────────────┘
                   │
                   ▼
        GET /api/areas/listar
```

---

### 2. Backend Consulta Base de Datos

```sql
SELECT
  id_area,
  desc_area,
  stat_area,
  created_at,
  updated_at
FROM dim_area
WHERE stat_area = 'A'  -- Solo activas
ORDER BY desc_area ASC;
```

---

### 3. Respuesta JSON

```json
{
  "status": 200,
  "data": [
    {
      "idArea": 1,
      "descArea": "DD - DIRECCIÓN DE DESPACHO",
      "statArea": "A",
      "createdAt": "2026-01-07T10:00:00Z"
    },
    {
      "idArea": 2,
      "descArea": "DD - LOGISTICA",
      "statArea": "A",
      "createdAt": "2026-01-07T10:05:00Z"
    },
    {
      "idArea": 3,
      "descArea": "DG - AUDITORÍA MÉDICA",
      "statArea": "A",
      "createdAt": "2026-01-07T11:30:00Z"
    }
  ]
}
```

---

### 4. Frontend Renderiza Tabla

```javascript
// Datos recibidos se almacenan en estado
const [areas, setAreas] = useState([]);
setAreas(response.data.data);

// Se renderizan en tabla (AreasCRUD.jsx)
// La tabla extrae campos usando regex:

{areas.map((area) => (
  <tr key={area.idArea}>
    {/* Columna 1: Dependencia */}
    <td>
      {extractDependencia(area.descArea)}  {/* "DD" */}
    </td>

    {/* Columna 2: Nombre del Área */}
    <td>
      {extractNombreArea(area.descArea)}   {/* "DIRECCIÓN DE DESPACHO" */}
    </td>

    {/* Resto de columnas... */}
  </tr>
))}
```

---

## 🔄 Ciclo de Vida: EDITAR ÁREA

### 1. Usuario Hace Click en Botón "Editar"

```
Tabla → Botón [Editar] en fila del área
```

---

### 2. Modal Se Abre con Datos Separados

```javascript
const handleOpenModal = (area) => {
  setSelectedArea(area);

  // Extrae campos del formato combinado
  setFormData({
    dependencia: extractDependencia(area.descArea),     // "DD"
    nombreArea: extractNombreArea(area.descArea),       // "DIRECCIÓN DE DESPACHO"
    statArea: area.statArea === 'A' ? '1' : '0'        // '1' si está Activo
  });

  setShowModal(true);
};

// Modal muestra:
// Dependencia: DD
// Nombre del Área: DIRECCIÓN DE DESPACHO
```

---

### 3. Usuario Modifica y Guarda

```
Original: "DD - DIRECCIÓN DE DESPACHO"
Usuario cambia a: "DD - DESPACHO CENTRAL"

formData = {
  dependencia: "DD",
  nombreArea: "DESPACHO CENTRAL",
  statArea: "1"
}
```

---

### 4. Backend Actualiza

```java
// AreaService.actualizar()
PUT /api/areas/{id}
{
  "descArea": "DD - DESPACHO CENTRAL",  // ← Combinado
  "statArea": "A"
}

// SQL:
UPDATE dim_area
SET desc_area = 'DD - DESPACHO CENTRAL',
    updated_at = NOW()
WHERE id_area = 1;
```

---

## 📋 Mapeo de Conversión: React ↔ Backend ↔ PostgreSQL

### Conversión CREAR (Frontend → Backend → BD)

```
┌─────────────────────────────────┐
│  Frontend (React)               │
├─────────────────────────────────┤
│ dependencia: "DD"               │
│ nombreArea: "DIRECCIÓN..."      │
│ statArea: "1"                   │
└────────────────┬────────────────┘
                 │
                 │ combinareAreaDescripcion()
                 ▼
┌─────────────────────────────────┐
│  Backend (AreaDTO)              │
├─────────────────────────────────┤
│ descArea: "DD - DIRECCIÓN..."   │
│ statArea: "1"                   │
└────────────────┬────────────────┘
                 │
                 │ Service validation
                 │ statArea: "1" → "A"
                 ▼
┌─────────────────────────────────┐
│  Entity (Area.java)             │
├─────────────────────────────────┤
│ descArea: "DD - DIRECCIÓN..."   │
│ statArea: "A"                   │
│ createdAt: NOW()                │
│ updatedAt: NOW()                │
└────────────────┬────────────────┘
                 │
                 │ Hibernate mapping
                 ▼
┌─────────────────────────────────┐
│  PostgreSQL (dim_area)          │
├─────────────────────────────────┤
│ id_area: 1 (BIGSERIAL)          │
│ desc_area: "DD - DIRECCIÓN..."  │
│ stat_area: "A" (VARCHAR)        │
│ created_at: timestamp           │
│ updated_at: timestamp           │
└─────────────────────────────────┘
```

---

### Conversión LECTURA (PostgreSQL → Backend → Frontend)

```
┌─────────────────────────────────┐
│  PostgreSQL (dim_area)          │
├─────────────────────────────────┤
│ id_area: 1                      │
│ desc_area: "DD - DIRECCIÓN..."  │
│ stat_area: "A"                  │
│ created_at: timestamp           │
│ updated_at: timestamp           │
└────────────────┬────────────────┘
                 │
                 │ Hibernate mapping
                 ▼
┌─────────────────────────────────┐
│  Entity (Area.java)             │
├─────────────────────────────────┤
│ idArea: 1                       │
│ descArea: "DD - DIRECCIÓN..."   │
│ statArea: "A"                   │
│ createdAt: LocalDateTime        │
│ updatedAt: LocalDateTime        │
└────────────────┬────────────────┘
                 │
                 │ JSON Serialization
                 ▼
┌─────────────────────────────────┐
│  Backend (AreaDTO - JSON)       │
├─────────────────────────────────┤
│ {                               │
│   "idArea": 1,                  │
│   "descArea": "DD - DIR...",    │
│   "statArea": "A",              │
│   "createdAt": "2026-01-07..."  │
│ }                               │
└────────────────┬────────────────┘
                 │
                 │ Axios/React parsing
                 │ extractDependencia()
                 │ extractNombreArea()
                 ▼
┌─────────────────────────────────┐
│  Frontend (React State)         │
├─────────────────────────────────┤
│ areas = [{                      │
│   idArea: 1,                    │
│   descArea: "DD - DIR...",      │
│   statArea: "A",                │
│   dependencia: "DD"    ← Extract │
│   nombreArea: "DIR..." ← Extract │
│ }]                              │
└────────────────┬────────────────┘
                 │
                 │ Rendering
                 ▼
┌─────────────────────────────────┐
│  Visual Table (HTML/CSS)        │
├─────────────────────────────────┤
│ DEPENDENCIA │ NOMBRE DEL ÁREA   │
│ DD          │ DIRECCIÓN...      │
└─────────────────────────────────┘
```

---

## 🔐 Transformaciones de Estado

### Transformación: `statArea` = "1" ↔ "A"

```
Frontend → Backend:
  "1" = Activo (checkbox marcado) → "A"
  "0" = Inactivo (checkbox no marcado) → "I"

Backend → Frontend:
  "A" = Activo → "1" (mostrar checkbox marcado)
  "I" = Inactivo → "0" (mostrar checkbox no marcado)
```

**Código:**
```javascript
// Frontend → Backend
statArea: formData.statArea === '1' ? 'A' : 'I'

// Backend → Frontend (load)
statArea: area.statArea === 'A' ? '1' : '0'
```

---

## 🎨 Estructura de Componentes React

```
AreasCRUD.jsx (Componente Principal)
│
├── State Management
│   ├── areas[] ← Lista de áreas de BD
│   ├── formData{} ← Datos del formulario
│   ├── selectedArea ← Área siendo editada
│   └── showModal ← Control de modal
│
├── Utility Functions (Reutilizables)
│   ├── extractDependencia(descArea)
│   ├── extractNombreArea(descArea)
│   └── combinareAreaDescripcion(dep, nombre)
│
├── Event Handlers
│   ├── loadAreas() → GET /api/areas
│   ├── handleOpenModal(area) → Abre modal
│   ├── handleSave() → POST/PUT /api/areas
│   ├── handleDelete() → DELETE /api/areas
│   └── handleToggleEstado() → Cambia estado
│
├── Visual Sections
│   ├── Search bar
│   ├── Tabla (thead + tbody)
│   │   ├── Columna: Dependencia
│   │   ├── Columna: Nombre del Área
│   │   ├── Columna: Fecha Creación
│   │   ├── Columna: Estado
│   │   └── Columna: Acciones
│   │
│   └── Modal (formulario)
│       ├── Input: Dependencia
│       ├── Input: Nombre del Área
│       ├── Toggle: Estado
│       └── Botones: Guardar/Cancelar
```

---

## 📊 Tabla: Campos y Tipos en Cada Capa

| Concepto | Frontend (React) | Backend (Java) | PostgreSQL |
|----------|-----------------|----------------|------------|
| ID | `idArea: number` | `Long idArea` | `BIGSERIAL` |
| Descripción | `descArea: string` | `String descArea` | `VARCHAR(255)` |
| Estado | `statArea: "1"\|"0"` | `String statArea` | `VARCHAR(1)` |
| Timestamp 1 | `createdAt: string` | `LocalDateTime createdAt` | `TIMESTAMP TZ` |
| Timestamp 2 | `updatedAt: string` | `LocalDateTime updatedAt` | `TIMESTAMP TZ` |
| Dependencia* | `dependencia: string` | - | (Extraído de descArea) |
| Nombre del Área* | `nombreArea: string` | - | (Extraído de descArea) |

*Solo en frontend, extraídos del campo combinado `descArea`

---

## 🎯 Validaciones en 3 Capas

```
┌─────────────────────────────────────────┐
│  Frontend (UX Validation - React)       │
│  • Campo requerido                      │
│  • Máximo 255 caracteres                │
│  • Formato: CODIGO - DESCRIPCION        │
│  • Feedback inmediato                   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Backend DTO Validation (Java)          │
│  • @NotNull @NotBlank                   │
│  • @Size(max=255)                       │
│  • @UniqueConstraint check               │
│  • Mensaje de error estructurado        │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Database Constraints (PostgreSQL)      │
│  • NOT NULL                             │
│  • UNIQUE (desc_area)                   │
│  • VARCHAR(255) type enforcement        │
│  • PRIMARY KEY, BIGSERIAL               │
└─────────────────────────────────────────┘
```

---

## 🔗 Relaciones Visuales

### Diagrama ER Completo

```
                    dim_area
                   (Tabla Principal)
                    [id_area PK]
                         │
        ┌────────────────┼────────────────┐
        │ 1:N            │ 1:N            │ 1:N
        ▼                ▼                ▼
  dim_personal_cnt   dim_roles      dim_area_hosp
  (Personal)         (Roles)        (Áreas Hospitalarias)
  [id_personal]      [id_rol]       [id_area_hosp]
  [id_area FK] ←─    [id_area FK] ← (Tabla separada)
```

---

## 📈 Operaciones CRUD Completas

| Operación | Método | Endpoint | Tabla |
|-----------|--------|----------|-------|
| **C**reate | POST | `/api/areas/crear` | INSERT |
| **R**ead | GET | `/api/areas/listar` | SELECT * |
| **U**pdate | PUT | `/api/areas/{id}` | UPDATE |
| **D**elete | DELETE | `/api/areas/{id}` | DELETE (soft) |

---

**Fin de Documentación - Flujo de Datos**

*Integración completa entre base de datos, backend y frontend*
