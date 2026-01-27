# 📦 Módulo Tipos de Bolsas - Documentación Completa

**Versión:** v1.37.0
**Fecha:** 2026-01-26
**Status:** ✅ Production Ready

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Endpoints REST](#endpoints-rest)
4. [Modelos de Datos](#modelos-de-datos)
5. [Servicios](#servicios)
6. [Repositorio](#repositorio)
7. [Casos de Uso](#casos-de-uso)
8. [Problemas Resueltos](#problemas-resueltos)
9. [Testing](#testing)
10. [Frontend Integration](#frontend-integration)

---

## 🎯 Descripción General

El módulo **Tipos de Bolsas** gestiona el catálogo de categorías/clasificaciones de **Bolsas de Pacientes** en el sistema CENATE.

### ¿Qué es una Bolsa de Pacientes?

Una **Bolsa** es un conjunto de pacientes agrupados por criterios específicos (diagnóstico, especialidad, urgencia, etc.) que requieren atención coordinada a través de CENATE.

### Ejemplos de Tipos de Bolsas

```
BOLSA_107           → Importación de pacientes masiva
BOLSA_DENGUE        → Control epidemiológico (Dengue)
BOLSAS_ENFERMERIA   → Atenciones de enfermería
BOLSA_PADOMI        → Pacientes derivados de PADOMI
BOLSAS_REPROGRAMACION → Citas reprogramadas
```

---

## 🏗️ Arquitectura

### Capas del Módulo

```
┌─────────────────────────────────────────────────┐
│         Frontend (React)                         │
│  - TiposBolsas.jsx                              │
│  - tiposBolsasService.js                        │
└────────────────────┬────────────────────────────┘
                     │ API REST
                     ▼
┌─────────────────────────────────────────────────┐
│    Controller (REST API)                        │
│  - GestionTiposBolsasController                 │
│  - 7 endpoints CRUD + búsqueda + estadísticas   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│    Service Layer (Lógica de Negocio)           │
│  - TipoBolsaService (Interface)                │
│  - TipoBolsaServiceImpl (Implementación)        │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│    Repository Layer (Acceso a Datos)           │
│  - TipoBolsaRepository (JpaRepository)         │
│  - Queries @Query personalizadas                │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│          PostgreSQL Database                    │
│  - Tabla: dim_tipos_bolsas (8 registros)       │
│  - UNIQUE Index: (id_ipress, anio) por estado  │
└─────────────────────────────────────────────────┘
```

### Patrón Arquitectónico

```
Clean Architecture (Separación de Responsabilidades)
├── Controller → Maneja requests HTTP
├── Service → Lógica de negocio
├── Repository → Acceso a datos
└── DTO → Transferencia de datos
```

---

## 🔗 Endpoints REST

**Base URL:** `/api/admin/tipos-bolsas`

### 1. Obtener Todos (sin paginación)

```
GET /api/admin/tipos-bolsas/todos
```

**Descripción:** Obtiene todos los tipos de bolsas ACTIVOS

**Response (200):**
```json
[
  {
    "idTipoBolsa": 1,
    "codTipoBolsa": "BOLSA_107",
    "descTipoBolsa": "Bolsa 107 - Importación de pacientes masiva",
    "statTipoBolsa": "A",
    "createdAt": "2026-01-22T15:40:46.552396-05:00",
    "updatedAt": "2026-01-22T15:40:46.552396-05:00"
  },
  ...
]
```

**Casos de Uso:**
- Llenar dropdowns/selects
- Listados simples sin paginación
- Caché en frontend

---

### 2. Buscar con Paginación y Filtros

```
GET /api/admin/tipos-bolsas/buscar?page=0&size=30&busqueda=BOLSA&estado=A
```

**Parámetros:**
- `page` (int, default=0) - Número de página (0-indexed)
- `size` (int, default=30) - Registros por página
- `busqueda` (String, opcional) - Búsqueda en código O descripción (case-insensitive)
- `estado` (String, opcional) - Filtro por estado: 'A' (Activo) o 'I' (Inactivo)

**Response (200):**
```json
{
  "content": [
    {
      "idTipoBolsa": 1,
      "codTipoBolsa": "BOLSA_107",
      "descTipoBolsa": "Bolsa 107 - Importación de pacientes masiva",
      "statTipoBolsa": "A",
      "createdAt": "2026-01-22T15:40:46.552396-05:00",
      "updatedAt": "2026-01-22T15:40:46.552396-05:00"
    }
  ],
  "totalElements": 8,
  "totalPages": 1,
  "size": 30,
  "number": 0,
  "numberOfElements": 8,
  "first": true,
  "last": true,
  "empty": false
}
```

**Implementación Backend:** `TipoBolsaRepository.buscarTiposBolsas()`

---

### 3. Obtener por ID

```
GET /api/admin/tipos-bolsas/{id}
```

**Parámetros:**
- `id` (Long, requerido) - ID del tipo de bolsa

**Response (200):**
```json
{
  "idTipoBolsa": 1,
  "codTipoBolsa": "BOLSA_107",
  "descTipoBolsa": "Bolsa 107 - Importación de pacientes masiva",
  "statTipoBolsa": "A",
  "createdAt": "2026-01-22T15:40:46.552396-05:00",
  "updatedAt": "2026-01-22T15:40:46.552396-05:00"
}
```

**Response (404):**
```json
{
  "error": "Tipo de bolsa no encontrado",
  "message": "No existe tipo de bolsa con ID: 999"
}
```

---

### 4. Crear Nuevo Tipo de Bolsa

```
POST /api/admin/tipos-bolsas
Content-Type: application/json
```

**Request Body:**
```json
{
  "codTipoBolsa": "BOLSA_PADOMI",
  "descTipoBolsa": "Pacientes derivados de PADOMI"
}
```

**Response (200):**
```json
{
  "idTipoBolsa": 8,
  "codTipoBolsa": "BOLSA_PADOMI",
  "descTipoBolsa": "Pacientes derivados de PADOMI",
  "statTipoBolsa": "A",
  "createdAt": "2026-01-26T17:00:00.000000-05:00",
  "updatedAt": "2026-01-26T17:00:00.000000-05:00"
}
```

**Validaciones:**
- ❌ `codTipoBolsa` vacío → Error 400
- ❌ `descTipoBolsa` vacío → Error 400
- ❌ `codTipoBolsa` duplicado (case-insensitive) → Error 409 Conflict
- ✅ Estado inicial siempre = 'A' (Activo)

**Response (409 - Duplicado):**
```json
{
  "error": "Conflicto",
  "message": "Ya existe un tipo de bolsa con el código: BOLSA_PADOMI"
}
```

---

### 5. Actualizar Tipo de Bolsa

```
PUT /api/admin/tipos-bolsas/{id}
Content-Type: application/json
```

**Request Body:**
```json
{
  "codTipoBolsa": "BOLSA_PADOMI",
  "descTipoBolsa": "Pacientes derivados de PADOMI - Updated"
}
```

**Response (200):**
```json
{
  "idTipoBolsa": 8,
  "codTipoBolsa": "BOLSA_PADOMI",
  "descTipoBolsa": "Pacientes derivados de PADOMI - Updated",
  "statTipoBolsa": "A",
  "createdAt": "2026-01-26T17:00:00.000000-05:00",
  "updatedAt": "2026-01-26T17:10:00.000000-05:00"
}
```

---

### 6. Cambiar Estado

```
PATCH /api/admin/tipos-bolsas/{id}/estado?nuevoEstado=I
```

**Parámetros:**
- `id` (Long, requerido) - ID del tipo de bolsa
- `nuevoEstado` (String, requerido) - 'A' (Activo) o 'I' (Inactivo)

**Response (200):**
```json
{
  "idTipoBolsa": 8,
  "codTipoBolsa": "BOLSA_PADOMI",
  "descTipoBolsa": "Pacientes derivados de PADOMI",
  "statTipoBolsa": "I",
  "createdAt": "2026-01-26T17:00:00.000000-05:00",
  "updatedAt": "2026-01-26T17:12:00.000000-05:00"
}
```

---

### 7. Eliminar (Inactivar)

```
DELETE /api/admin/tipos-bolsas/{id}
```

**Descripción:** Inactiva el tipo de bolsa (soft delete - cambia estado a 'I')

**Response (204):** No Content

**Implementación:**
```java
// No elimina físicamente, solo inactiva
tipoBolsa.setStatTipoBolsa("I");
tipoBolsaRepository.save(tipoBolsa);
```

---

### 8. Obtener Estadísticas

```
GET /api/admin/tipos-bolsas/estadisticas
```

**Response (200):**
```json
{
  "totalTipos": 8,
  "tiposActivos": 7,
  "tiposInactivos": 1
}
```

---

## 📊 Modelos de Datos

### Entidad: TipoBolsa

**Tabla BD:** `dim_tipos_bolsas`

```java
@Entity
@Table(name = "dim_tipos_bolsas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TipoBolsa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_bolsa")
    private Long idTipoBolsa;

    @Column(name = "cod_tipo_bolsa", nullable = false, unique = true)
    private String codTipoBolsa;

    @Column(name = "desc_tipo_bolsa", nullable = false)
    private String descTipoBolsa;

    @Column(name = "stat_tipo_bolsa", nullable = false)
    private String statTipoBolsa; // 'A' = Activo, 'I' = Inactivo

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

**Campos:**

| Campo | Tipo | Nullable | Único | Descripción |
|-------|------|----------|-------|-------------|
| `id_tipo_bolsa` | BIGINT | ❌ | ✅ | PK - Identificador único |
| `cod_tipo_bolsa` | VARCHAR(50) | ❌ | ✅ | Código único (ej: BOLSA_107) |
| `desc_tipo_bolsa` | VARCHAR(255) | ❌ | ❌ | Descripción completa |
| `stat_tipo_bolsa` | CHAR(1) | ❌ | ❌ | Estado: A=Activo, I=Inactivo |
| `created_at` | TIMESTAMP | ❌ | ❌ | Fecha creación (auto) |
| `updated_at` | TIMESTAMP | ❌ | ❌ | Fecha actualización (auto) |

---

### DTO: TipoBolsaResponse

```java
@Data
@Builder
public class TipoBolsaResponse {
    private Long idTipoBolsa;
    private String codTipoBolsa;
    private String descTipoBolsa;
    private String statTipoBolsa;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

### DTO: TipoBolsaRequest

```java
public record TipoBolsaRequest(
    String codTipoBolsa,
    String descTipoBolsa
) {}
```

---

### DTO: EstadisticasTiposBolsasDTO

```java
public record EstadisticasTiposBolsasDTO(
    Long totalTipos,
    Long tiposActivos,
    Long tiposInactivos
) {}
```

---

## 🔧 Servicios

### Interface: TipoBolsaService

```java
public interface TipoBolsaService {

    /**
     * Obtiene todos los tipos de bolsas activos
     */
    List<TipoBolsaResponse> obtenerTodosTiposBolsasActivos();

    /**
     * Obtiene un tipo de bolsa por ID
     */
    TipoBolsaResponse obtenerTipoBolsaPorId(Long idTipoBolsa);

    /**
     * Obtiene un tipo de bolsa por código
     */
    TipoBolsaResponse obtenerTipoBolsaPorCodigo(String codigo);

    /**
     * Búsqueda paginada con filtros
     */
    Page<TipoBolsaResponse> buscarTiposBolsas(
        String busqueda,
        String estado,
        Pageable pageable
    );

    /**
     * Crea un nuevo tipo de bolsa
     */
    TipoBolsaResponse crearTipoBolsa(TipoBolsaRequest request);

    /**
     * Actualiza un tipo de bolsa existente
     */
    TipoBolsaResponse actualizarTipoBolsa(Long idTipoBolsa, TipoBolsaRequest request);

    /**
     * Cambia el estado de un tipo de bolsa (A <-> I)
     */
    TipoBolsaResponse cambiarEstadoTipoBolsa(Long idTipoBolsa, String nuevoEstado);

    /**
     * Elimina (inactiva) un tipo de bolsa
     */
    void eliminarTipoBolsa(Long idTipoBolsa);

    /**
     * Obtiene estadísticas
     */
    EstadisticasTiposBolsasDTO obtenerEstadisticas();
}
```

### Implementación: TipoBolsaServiceImpl

**Ubicación:** `backend/src/main/java/com/styp/cenate/service/tipos_bolsas/impl/TipoBolsaServiceImpl.java`

**Características:**
- ✅ Validaciones de duplicados (case-insensitive)
- ✅ Búsqueda case-insensitive con ILIKE + CAST
- ✅ Mapeo automático Entity → DTO
- ✅ Logging detallado
- ✅ Transacciones (`@Transactional`)

---

## 💾 Repositorio

### TipoBolsaRepository

```java
@Repository
public interface TipoBolsaRepository extends JpaRepository<TipoBolsa, Long> {

    /**
     * Busca tipo de bolsa por código exacto
     */
    Optional<TipoBolsa> findByCodTipoBolsa(String codTipoBolsa);

    /**
     * Obtiene todos los tipos de bolsas por estado
     */
    @Query("SELECT t FROM TipoBolsa t WHERE t.statTipoBolsa = :stat ORDER BY t.descTipoBolsa ASC")
    List<TipoBolsa> findByStatTipoBolsaOrderByDescTipoBolsaAsc(@Param("stat") String stat);

    /**
     * Búsqueda paginada case-insensitive con ILIKE + CAST
     */
    @Query("SELECT t FROM TipoBolsa t WHERE " +
           "(:busqueda IS NULL OR CAST(t.codTipoBolsa AS text) ILIKE CONCAT('%', CAST(:busqueda AS text), '%') " +
           "OR CAST(t.descTipoBolsa AS text) ILIKE CONCAT('%', CAST(:busqueda AS text), '%')) AND " +
           "(:estado IS NULL OR t.statTipoBolsa = :estado) " +
           "ORDER BY t.descTipoBolsa ASC")
    Page<TipoBolsa> buscarTiposBolsas(
        @Param("busqueda") String busqueda,
        @Param("estado") String estado,
        Pageable pageable
    );

    /**
     * Verifica duplicados case-insensitive
     */
    Optional<TipoBolsa> findByCodTipoBolsaIgnoreCase(String codTipoBolsa);

    /**
     * Cuenta por estado
     */
    Long countByStatTipoBolsa(String stat);
}
```

### Query Personalizada: buscarTiposBolsas()

**JPQL Query:**
```sql
SELECT t FROM TipoBolsa t WHERE
  (:busqueda IS NULL
   OR CAST(t.codTipoBolsa AS text) ILIKE CONCAT('%', CAST(:busqueda AS text), '%')
   OR CAST(t.descTipoBolsa AS text) ILIKE CONCAT('%', CAST(:busqueda AS text), '%'))
  AND (:estado IS NULL OR t.statTipoBolsa = :estado)
ORDER BY t.descTipoBolsa ASC
```

**Traducción a SQL (PostgreSQL):**
```sql
SELECT t.* FROM dim_tipos_bolsas t
WHERE
  (? IS NULL
   OR CAST(t.cod_tipo_bolsa AS text) ILIKE CONCAT('%', CAST(? AS text), '%')
   OR CAST(t.desc_tipo_bolsa AS text) ILIKE CONCAT('%', CAST(? AS text), '%'))
  AND (? IS NULL OR t.stat_tipo_bolsa = ?)
ORDER BY t.desc_tipo_bolsa ASC
```

**Características:**
- ✅ Búsqueda case-insensitive (`ILIKE`)
- ✅ Busca en código O descripción
- ✅ Filtro por estado (`A`/`I`)
- ✅ Type casting a TEXT (previene error bytea)
- ✅ Parámetros opcionales (IS NULL checks)
- ✅ Paginación automática

---

## 📚 Casos de Uso

### Caso 1: Listar todos los tipos de bolsas activos

**Flujo:**
```
1. Frontend llama: GET /api/admin/tipos-bolsas/todos
2. Backend: TipoBolsaServiceImpl.obtenerTodosTiposBolsasActivos()
3. Repository: findByStatTipoBolsaOrderByDescTipoBolsaAsc("A")
4. Retorna: List<TipoBolsaResponse> ordenado por descripción
```

**Use Case:**
- Llenar dropdown en formularios
- Listados sin paginación
- Caché en sesión del usuario

---

### Caso 2: Crear un nuevo tipo de bolsa

**Flujo:**
```
1. Usuario completa formulario (código + descripción)
2. Frontend: POST /api/admin/tipos-bolsas { codTipoBolsa, descTipoBolsa }
3. Backend validaciones:
   ✅ Código no vacío
   ✅ Descripción no vacía
   ❌ Si código ya existe (case-insensitive) → Error 409
4. Crear TipoBolsa con estado = 'A'
5. Guardar en BD
6. Retornar: TipoBolsaResponse creada
7. Frontend: Mostrar notificación verde + actualizar tabla
```

**Validaciones:**
```java
// En TipoBolsaServiceImpl.crearTipoBolsa()
if (tipoBolsaRepository.findByCodTipoBolsaIgnoreCase(request.codTipoBolsa()).isPresent()) {
    throw new RuntimeException("Ya existe un tipo de bolsa con el código: " + request.codTipoBolsa());
}
```

---

### Caso 3: Buscar tipos de bolsas con filtros

**Flujo:**
```
1. Usuario ingresa búsqueda: "PADOMI"
2. Frontend: GET /api/admin/tipos-bolsas/buscar?busqueda=PADOMI&page=0&size=30
3. Backend: Repository.buscarTiposBolsas("PADOMI", null, Pageable)
4. Query genera:
   CAST(cod_tipo_bolsa AS text) ILIKE '%PADOMI%'
   OR
   CAST(desc_tipo_bolsa AS text) ILIKE '%PADOMI%'
5. Retorna: Page<TipoBolsaResponse> con coincidencias
6. Frontend: Muestra resultados paginados
```

**Ejemplo Búsqueda:**
- Entrada: `"padomi"` (minúscula)
- Busca: `BOLSA_PADOMI` (mayúscula)
- Resultado: ✅ Encontrado (case-insensitive)

---

### Caso 4: Cambiar estado (Activo → Inactivo)

**Flujo:**
```
1. Usuario clica toggle en tabla
2. Frontend: PATCH /api/admin/tipos-bolsas/8/estado?nuevoEstado=I
3. Backend:
   ✅ Validar: nuevoEstado ∈ {'A', 'I'}
   ✅ Obtener registro
   ✅ Cambiar estado
   ✅ Guardar (updatedAt se actualiza automáticamente)
4. Retorna: TipoBolsaResponse con estado actualizado
5. Frontend: Actualiza tabla sin recargar
```

---

## 🐛 Problemas Resueltos

### Problema 1: Datos Hardcodeados Ocultaban Registros Nuevos

**Síntoma:**
- Creaba BOLSA_PADOMI en BD
- No aparecía en frontend
- Frontend mostraba lista vieja

**Causa Raíz:**
- Componente TiposBolsas.jsx tenía array `TIPOS_BOLSAS_INICIALES` hardcodeado
- Cuando API fallaba, usaba fallback con datos viejos
- BOLSA_PADOMI nunca fue agregada a ese array

**Solución:**
```javascript
// ❌ ANTES
const TIPOS_BOLSAS_INICIALES = [
  { codTipoBolsa: 'BOLSA_107', ... },
  // BOLSA_PADOMI no estaba aquí
];

// ✅ DESPUÉS
// Array eliminado completamente
// Siempre carga desde API
```

**Commit:** `368009e`

---

### Problema 2: Error PostgreSQL "function upper(bytea)"

**Síntoma:**
```
ERROR: function upper(bytea) does not exist
Position: 216
```

**Causa Raíz:**
- Query usaba `UPPER(t.codTipoBolsa)`
- PostgreSQL interpretaba el campo como `bytea` (binary data)
- `UPPER()` no existe para bytea

**Solución:**
Cambiar a `ILIKE` que es operador case-insensitive nativo de PostgreSQL:
```java
// ❌ ANTES
UPPER(t.codTipoBolsa) LIKE UPPER(CONCAT('%', :busqueda, '%'))

// ✅ DESPUÉS
t.codTipoBolsa ILIKE CONCAT('%', :busqueda, '%')
```

**Commit:** `3bce26d`

---

### Problema 3: Error PostgreSQL "operator text ~~* bytea"

**Síntoma:**
```
ERROR: operator does not exist: text ~~* bytea
  Hint: No operator matches the given name and argument types.
  Position: 204
```

**Causa Raíz:**
- Aunque usamos `ILIKE`, el tipo de dato seguía siendo `bytea`
- Operador `~~*` (ILIKE) esperaba TEXT, no bytea
- Necesitaba type casting explícito

**Solución:**
Agregar `CAST(field AS text)` en la query:
```java
// ❌ ANTES
t.codTipoBolsa ILIKE CONCAT('%', :busqueda, '%')

// ✅ DESPUÉS
CAST(t.codTipoBolsa AS text) ILIKE CONCAT('%', CAST(:busqueda AS text), '%')
```

**Commit:** `336eeda`

---

## 🧪 Testing

### Test 1: Listar Tipos de Bolsas

```bash
curl -X GET "http://localhost:8080/api/admin/tipos-bolsas/todos" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resultado Esperado:**
- ✅ Status 200
- ✅ Array con 8 tipos de bolsas
- ✅ Todos con estado "A"

---

### Test 2: Buscar con Filtro

```bash
curl -X GET "http://localhost:8080/api/admin/tipos-bolsas/buscar?busqueda=padomi&page=0&size=30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resultado Esperado:**
- ✅ Status 200
- ✅ Encuentra "BOLSA_PADOMI" (case-insensitive)
- ✅ totalElements = 1

---

### Test 3: Crear Tipo de Bolsa

```bash
curl -X POST "http://localhost:8080/api/admin/tipos-bolsas" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codTipoBolsa": "BOLSA_TEST",
    "descTipoBolsa": "Bolsa de Prueba"
  }'
```

**Resultado Esperado:**
- ✅ Status 200
- ✅ Retorna objeto creado con ID
- ✅ Estado = 'A'
- ✅ createdAt y updatedAt están presentes

---

### Test 4: Validar Duplicado

```bash
curl -X POST "http://localhost:8080/api/admin/tipos-bolsas" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codTipoBolsa": "BOLSA_107",
    "descTipoBolsa": "Duplicado"
  }'
```

**Resultado Esperado:**
- ❌ Status 409 Conflict
- ❌ Mensaje: "Ya existe un tipo de bolsa con el código: BOLSA_107"

---

## 🎨 Frontend Integration

### Componente: TiposBolsas.jsx

**Ubicación:** `frontend/src/pages/admin/catalogs/TiposBolsas.jsx`

**Características:**
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Búsqueda en tiempo real (debounced 500ms)
- ✅ Filtro por estado
- ✅ Paginación (30 items por página)
- ✅ Toast notifications (verde/rojo, auto-dismiss 4s)
- ✅ Modal para crear/editar
- ✅ Toggle de estado
- ✅ Eliminación soft (inactivación)

**Estados del Componente:**
```javascript
const [tiposBolsas, setTiposBolsas] = useState([]); // Datos
const [loading, setLoading] = useState(true); // Cargando
const [error, setError] = useState(null); // Errores
const [currentPage, setCurrentPage] = useState(0); // Paginación
const [notification, setNotification] = useState(null); // Toast
const [showModal, setShowModal] = useState(false); // Modal crear/editar
const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
const [formData, setFormData] = useState({ codTipoBolsa: '', descTipoBolsa: '' }); // Formulario
```

**Efectos principales:**
```javascript
// Carga inicial
useEffect(() => {
    loadData();
}, [currentPage, pageSize, debouncedCodigo, debouncedDescripcion, loadData]);

// Auto-dismiss notificaciones
useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 4000);
        return () => clearTimeout(timer);
    }
}, [notification]);
```

---

### Servicio: tiposBolsasService.js

**Ubicación:** `frontend/src/services/tiposBolsasService.js`

**Métodos:**

| Método | HTTP | Descripción |
|--------|------|-------------|
| `obtenerTodos()` | GET /todos | Obtiene todos (sin paginación) |
| `buscar(busqueda, estado, page, size)` | GET /buscar | Búsqueda con filtros y paginación |
| `obtenerPorId(id)` | GET /{id} | Obtiene uno por ID |
| `crear(data)` | POST / | Crea nuevo |
| `actualizar(id, data)` | PUT /{id} | Actualiza existente |
| `cambiarEstado(id, estado)` | PATCH /{id}/estado | Cambia estado A/I |
| `eliminar(id)` | DELETE /{id} | Inactiva |
| `obtenerEstadisticas()` | GET /estadisticas | Obtiene stats |

---

## 📊 Estadísticas Actuales (2026-01-26)

```
Total Tipos de Bolsas:     8
Activos:                   7
Inactivos:                 1

Registros en BD:
- BOLSA_107                (Activo)
- BOLSA_DENGUE             (Activo)
- BOLSAS_ENFERMERIA        (Activo)
- BOLSAS_EXPLOTADATOS      (Activo)
- BOLSAS_IVR               (Activo)
- BOLSAS_REPROGRAMACION    (Activo)
- BOLSA_GESTORES_TERRITORIAL (Activo)
- BOLSA_PADOMI             (Activo) ← Creado v1.37.0
```

---

## 🚀 Próximos Pasos

1. **Validaciones adicionales** (v1.38.0)
   - Longitud mínima/máxima de códigos
   - Validación de caracteres (solo alfanuméricos + guión)
   - Descripción mínimo 10 caracteres

2. **Auditoría** (v1.39.0)
   - Registrar cambios en tabla de auditoría
   - Quién creó/actualizó/eliminó
   - Timestamps detallados

3. **Integraciones** (v1.40.0)
   - Relacionar con `dim_solicitud_bolsa` (FK)
   - Prevenir eliminación si hay solicitudes asociadas
   - Cascada de actualizaciones

4. **Reportes** (v1.41.0)
   - Exportar a Excel
   - Gráficas de distribución
   - Historial de cambios

---

## 📖 Archivos Relacionados

```
backend/
├── src/main/java/com/styp/cenate/
│   ├── api/admin/
│   │   └── GestionTiposBolsasController.java
│   ├── service/tipos_bolsas/
│   │   ├── TipoBolsaService.java (Interface)
│   │   └── impl/TipoBolsaServiceImpl.java
│   ├── repository/
│   │   └── TipoBolsaRepository.java
│   └── model/
│       └── TipoBolsa.java

frontend/
├── src/pages/admin/catalogs/
│   └── TiposBolsas.jsx
├── src/services/
│   └── tiposBolsasService.js

database/
├── 06_scripts/
│   ├── 01_create_dim_tipos_bolsas.sql
│   └── 02_insert_initial_tipos_bolsas.sql
```

---

## ✅ Checklist de Implementación

- [x] Modelo JPA Entity (TipoBolsa)
- [x] DTOs (Request, Response, Statistics)
- [x] Repository con queries personalizadas
- [x] Service Interface y Implementación
- [x] Controller REST (7 endpoints)
- [x] Validaciones de duplicados
- [x] Búsqueda case-insensitive (ILIKE + CAST)
- [x] Paginación
- [x] Frontend React (CRUD completo)
- [x] Toast notifications
- [x] Documentación técnica
- [x] Testing manual
- [x] Fix problemas SQL (UPPER → ILIKE → CAST)
- [x] Integración backend-frontend

---

## 📞 Contacto y Soporte

**Módulo Desarrollado por:** Styp Canto Rondón
**Versión Actual:** v1.37.0 (2026-01-26)
**Última Actualización:** 26 de Enero, 2026
**Estado:** ✅ Production Ready

Para problemas o consultas, consultar la sección [Problemas Resueltos](#problemas-resueltos) o contactar al equipo técnico.

---

**FIN DE DOCUMENTACIÓN**
