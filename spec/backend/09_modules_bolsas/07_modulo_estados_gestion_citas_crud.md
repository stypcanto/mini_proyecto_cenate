# Módulo CRUD Estados Gestión Citas v1.33.0

> Especificación técnica completa del módulo de gestión centralizada de estados de citas de pacientes
> **Integrado con v1.12.0** - Usado por el módulo de Solicitudes de Bolsa

**Versión:** v1.33.0
**Última Actualización:** 2026-01-27
**Autor:** Ing. Styp Canto Rondón
**Status:** ✅ PRODUCTION LIVE

---

## 📋 Resumen Ejecutivo

**Módulo:** Gestión Centralizada de Estados para Seguimiento de Citas de Pacientes

**Objetivo:** Proporcionar un catálogo centralizado y reutilizable de estados de citas para usar en otros módulos (Gestión de Citas, Coordinación Médica, Seguimiento Pacientes).

**Patrón Base:** Idéntico a "Tipos de Bolsas" (v1.32.1) - mismo patrón arquitectónico, mismos 7 endpoints, mismas validaciones.

**Estados Iniciales (10):**
1. CITADO - Paciente agendado para atención
2. ATENDIDO_IPRESS - Atendido por IPRESS
3. NO_CONTESTA - Paciente no responde a llamadas
4. SIN_VIGENCIA - Sin vigencia de Seguro
5. APAGADO - Teléfono del paciente apagado
6. NO_DESEA - Paciente rechaza atención
7. REPROG_FALLIDA - Reprogramación fallida
8. NUM_NO_EXISTE - Número no existe
9. HC_BLOQUEADA - Historia clínica bloqueada
10. TEL_SIN_SERVICIO - Teléfono sin servicio

---

## 🏗️ Arquitectura Técnica

### Base de Datos

**Tabla:** `public.dim_estados_gestion_citas`

```sql
CREATE TABLE public.dim_estados_gestion_citas (
    id_estado_cita BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    cod_estado_cita TEXT UNIQUE NOT NULL,
    desc_estado_cita TEXT NOT NULL,
    stat_estado_cita TEXT NOT NULL DEFAULT 'A',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Índices:**
- `idx_estados_gestion_citas_cod` - BTREE en `cod_estado_cita` (búsqueda por código)
- `idx_estados_gestion_citas_stat` - BTREE en `stat_estado_cita` (filtrar activos/inactivos)
- `idx_estados_gestion_citas_desc_tsvector` - GIN con full-text search en `desc_estado_cita`

**Constraints:**
- `stat_estado_cita` ONLY: 'A' (Activo) o 'I' (Inactivo)
- `cod_estado_cita` UNIQUE - No permite duplicados

**Trigger:** `trg_touch_estado_gestion_cita` - Auto-actualiza `updated_at` en cambios

---

### Backend (Java/Spring Boot)

#### 1. Entity: `EstadoGestionCita.java`

**Ubicación:** `backend/src/main/java/com/styp/cenate/model/`

```java
@Entity
@Table(name = "dim_estados_gestion_citas", schema = "public")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EstadoGestionCita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_cita")
    private Long idEstadoCita;

    @Column(name = "cod_estado_cita", nullable = false, unique = true)
    private String codEstadoCita;

    @Column(name = "desc_estado_cita", nullable = false)
    private String descEstadoCita;

    @Column(name = "stat_estado_cita", nullable = false)
    private String statEstadoCita;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

#### 2. Repository: `EstadoGestionCitaRepository.java`

**Ubicación:** `backend/src/main/java/com/styp/cenate/repository/`

**Métodos:**
- `findByCodEstadoCita(String)` - Búsqueda exacta por código
- `findByStatEstadoCitaOrderByDescEstadoCitaAsc(String)` - Lista activos ordenados
- `buscarEstadosGestionCitas(String, String, Pageable)` - **Query SQL NATIVA** (ver sección Errores)
- `findByCodEstadoCitaIgnoreCase(String)` - Validación duplicados (case-insensitive)
- `countByStatEstadoCita(String)` - Estadísticas

**Query SQL Nativa (IMPORTANTE):**
```sql
-- Usa nativeQuery=true para evitar error "lower(bytea)"
SELECT * FROM public.dim_estados_gestion_citas e WHERE
    (:busqueda IS NULL OR LOWER(e.cod_estado_cita) LIKE LOWER(CONCAT('%', :busqueda, '%'))
    OR LOWER(e.desc_estado_cita) LIKE LOWER(CONCAT('%', :busqueda, '%'))) AND
    (:estado IS NULL OR e.stat_estado_cita = :estado)
ORDER BY e.desc_estado_cita ASC
```

#### 3. DTO: `EstadoGestionCitaResponse.java`

**Ubicación:** `backend/src/main/java/com/styp/cenate/dto/`

Campos retornados en API:
- `idEstadoCita` - ID único
- `codEstadoCita` - Código (CITADO, NO_CONTESTA, etc.)
- `descEstadoCita` - Descripción completa
- `statEstadoCita` - Estado (A/I)
- `createdAt`, `updatedAt` - Timestamps

#### 4. Service: `EstadoGestionCitaService.java` + Impl

**Ubicación:** `backend/src/main/java/com/styp/cenate/service/estados_gestion_citas/`

**Métodos (9 totales):**

| Método | Descripción |
|--------|-------------|
| `obtenerTodosEstadosActivos()` | GET /todos - Lista sin paginación |
| `obtenerEstadoPorId(Long)` | GET /{id} - Obtener por ID |
| `obtenerEstadoPorCodigo(String)` | GET /codigo - Buscar por código exacto |
| `buscarEstados(String, String, Pageable)` | GET /buscar - Búsqueda paginada con filtros |
| `crearEstado(EstadoGestionCitaRequest)` | POST / - Crear nuevo estado |
| `actualizarEstado(Long, Request)` | PUT /{id} - Actualizar |
| `cambiarEstado(Long, String)` | PATCH /{id}/estado - Activar/Inactivar |
| `eliminarEstado(Long)` | DELETE /{id} - Eliminación lógica |
| `obtenerEstadisticas()` | GET /estadisticas - Conteos |

**Records de Request:**
```java
record EstadoGestionCitaRequest(
    @NotBlank String codEstadoCita,
    @NotBlank String descEstadoCita
) {}

record EstadisticasEstadosDTO(
    Long totalEstados,
    Long estadosActivos,
    Long estadosInactivos
) {}
```

#### 5. Controller: `GestionEstadosGestionCitasController.java`

**Ubicación:** `backend/src/main/java/com/styp/cenate/api/admin/`

**Ruta Base:** `/api/admin/estados-gestion-citas`

**8 Endpoints REST:**

```
GET    /api/admin/estados-gestion-citas/todos
GET    /api/admin/estados-gestion-citas/buscar?page=0&size=30&busqueda=...&estado=...
GET    /api/admin/estados-gestion-citas/estadisticas
GET    /api/admin/estados-gestion-citas/{id}
POST   /api/admin/estados-gestion-citas
PUT    /api/admin/estados-gestion-citas/{id}
PATCH  /api/admin/estados-gestion-citas/{id}/estado?nuevoEstado=A
DELETE /api/admin/estados-gestion-citas/{id}
```

---

### Frontend (React)

#### 1. API Service: `estadosGestionCitasService.js`

**Ubicación:** `frontend/src/services/`

**Base URL:** `/api/admin/estados-gestion-citas` (apiClient agrega `/api/`)

**Métodos:**
```javascript
- obtenerTodos()
- obtenerEstadoPorId(id)
- buscar(busqueda, estado, page, size)
- obtenerEstadisticas()
- crear(data)
- actualizar(id, data)
- cambiarEstado(id, nuevoEstado)
- eliminar(id)
```

**Fallback Offline:** Si backend falla, retorna 10 estados codeados

#### 2. Componente React: `EstadosGestionCitas.jsx`

**Ubicación:** `frontend/src/pages/admin/catalogs/`

**Características (~1,040 líneas):**

**UI Sections:**
- Header con ícono FileCheck2, badge, título, botón "Nuevo Estado"
- 3 Tarjetas estadísticas (Total, Activos, Inactivos)
- Búsqueda con debounce 300ms (2 campos: código + descripción)
- Tabla paginada (30/página) con 4 columnas:
  - Código (izq)
  - Descripción (centro)
  - Estado visual (indicador A/I)
  - Acciones (ver, editar, eliminar)
- 4 Modales CRUD (crear, ver, editar, eliminar)
- Paginación: primera/anterior/siguiente/última página

**Estados React:**
```javascript
const [estados, setEstados] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [page, setPage] = useState(0);
const [totalPages, setTotalPages] = useState(0);
const [busqueda, setBusqueda] = useState("");
const [filtroEstado, setFiltroEstado] = useState("");
const [modalNuevo, setModalNuevo] = useState(false);
const [modalEditar, setModalEditar] = useState(false);
const [modalVer, setModalVer] = useState(false);
const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
const [formData, setFormData] = useState({...});
const [estadisticas, setEstadisticas] = useState({...});
```

**Validaciones:**
- Código único (no permite duplicados)
- Descripción no vacía (mín 10 caracteres)
- Estado válido (A o I)

**Colores CENATE:**
- Header: `bg-blue-600` (#0D5BA9)
- Tabla header: Azul primario
- Botones: Verde (guardar), Naranja (cancelar), Rojo (eliminar)

---

## 🔍 Integración en Sistema

### En TabsNavigation
```jsx
import { FileCheck2 } from 'lucide-react';

{ id: 'estadosgestioncitas', icon: FileCheck2, label: 'Estados Gestión Citas', visible: esSuperAdmin }
```

### En UsersManagement
```jsx
import EstadosGestionCitas from './catalogs/EstadosGestionCitas';

case 'estadosgestioncitas':
    return <EstadosGestionCitas />;
```

---

## 🐛 Problemas Encontrados & Resueltos (v1.33.0)

### Problema 1: Rutas 404 "No endpoint"

**Síntoma:** Frontend llama `GET /api/estados-gestion-citas/buscar` → Retorna 500 "No endpoint GET /api/..."

**Causa Raíz:**
- Frontend apiClient agrega automáticamente `/api/` a rutas relativas
- Backend Controller usaba `@RequestMapping("/estados-gestion-citas")` (faltaba `/admin/`)
- Resultado: Mismatch entre `/api/estados-gestion-citas` (frontend) vs `/api/admin/...` esperado (backend)

**Solución:**
- Backend Controller: Cambiar `@RequestMapping("/api/admin/estados-gestion-citas")`
- SecurityConfig: Agregar `/api/admin/estados-gestion-citas/**` a `permitAll()`
- Frontend Service: `BASE_URL = '/api/admin/estados-gestion-citas'`
- Commits: `aa89d9c`

### Problema 2: Query JPQL con "lower(bytea)"

**Síntoma:** GET /buscar retorna 500 "ERROR: function lower(bytea) does not exist"

**Causa Raíz:**
- Query JPQL con `LOWER()` + `LIKE` causaba que Hibernate interpretara tipos de parámetros como BYTEA
- PostgreSQL no conoce función `lower(bytea)`

**Solución:**
- Cambiar Repository a usar `nativeQuery=true` con SQL PostgreSQL puro
- Query SQL nativa con `LOWER()` y `CONCAT()` directamente en PostgreSQL
- Agregar `countQuery` para paginación también en SQL nativo
- Commit: `e66fdc2`

### Problema 3: Conflicto de rutas en endpoints

**Síntoma:** `/buscar` después de `/{id}` causaba que Spring interpretara "buscar" como ID

**Causa Raíz:**
- Spring URL matching es greedy: `/{id}` coincide antes que `/buscar` si `/buscar` viene después
- Pattern matching: `/estados/{id}` match con `/estados/buscar` (intenta convertir "buscar" a Long)

**Solución:**
- Reordenar endpoints en Controller:
  1. `/todos` - Primero (exacta)
  2. `/buscar` - Segundo (antes de `/{id}`)
  3. `/estadisticas` - Tercero (antes de `/{id}`)
  4. `/{id}` - Cuarto (generic)
  5. `/{id}/estado` - Quinto (más específica que generic)

---

## 📊 Métricas & Performance

| Métrica | Valor |
|---------|-------|
| **Líneas Backend** | ~700 (Entity + Repo + Service + Controller) |
| **Líneas Frontend** | ~1,040 (React component) |
| **Documentación** | ~800 líneas (este documento + troubleshooting) |
| **Tabla BD** | 6 columnas, 5 índices, 1 trigger, 10 registros |
| **Endpoints REST** | 8 totales (GET=4, POST=1, PUT=1, PATCH=1, DELETE=1) |
| **Query Search** | SQL nativa (optimizada para PostgreSQL) |
| **Debounce UI** | 300ms en búsqueda |
| **Paginación** | 30 registros/página |
| **Build Time** | ~45s (gradle build) |

---

## ✅ Verificación Checklist

### Backend
- [x] Entity con mapeo correcto de tabla
- [x] Repository con métodos CRUD + búsqueda
- [x] Service con lógica de validación
- [x] Controller con 8 endpoints REST
- [x] SecurityConfig: permitAll para `/api/admin/estados-gestion-citas/**`
- [x] Compile sin errores: `./gradlew clean build -x test`
- [x] Tests pasan en endpoints

### Frontend
- [x] Service API con métodos CRUD
- [x] Componente React con UI completa
- [x] Integración en TabsNavigation
- [x] Integración en UsersManagement
- [x] Búsqueda con debounce 300ms
- [x] Paginación backend funcional
- [x] 4 Modales CRUD operativos
- [x] Compile sin errores: `npm run build`

### Base de Datos
- [x] Tabla creada con Flyway (V3_0_3)
- [x] 10 estados iniciales insertados
- [x] Índices creados (3 totales)
- [x] Trigger de actualización automática
- [x] Constraints CHECK en `stat_estado_cita`

### Documentación
- [x] Especificación técnica (este documento)
- [x] Guía troubleshooting de errores
- [x] CLAUDE.md actualizado con referencias
- [x] Scripts SQL documentados

---

## 🎓 Lecciones Aprendidas

✅ **Lo que funcionó:**
- Reutilizar patrón de "Tipos de Bolsas" = desarrollo rápido
- Query SQL nativa para búsqueda = evitar problemas de Hibernate
- Test temprano en endpoints = detectar errores antes

❌ **Lo que NO funcionó:**
- JPQL con LOWER() en parámetros de tipo texto = error bytea
- No reordenar endpoints en controller = conflictos path patterns

🛑 **A evitar:**
- Asumir apiClient NO agrega prefijos (siempre verificar)
- Mezclar JPQL con SQL nativo sin documentar
- Usar nombres de variable como "buscar" en rutas con parámetros path

---

## 📚 Referencias

- **Patrón Base:** `spec/01_Backend/06_resumen_modulo_bolsas_completo.md` (v1.32.1)
- **Troubleshooting:** `spec/06_Troubleshooting/02_guia_estados_gestion_citas.md`
- **Script SQL:** `spec/04_BaseDatos/06_scripts/V3_0_3__crear_tabla_estados_gestion_citas.sql`
- **Changelog:** `checklist/01_Historial/01_changelog.md` (v1.33.0)
- **PostgreSQL Docs:** nativeQuery en Spring Data JPA
- **Spring Security:** `permitAll()` vs authenticated endpoints

---

**Autor:** Ing. Styp Canto Rondón
**Fecha de Actualización:** 2026-01-22
**Status:** ✅ PRODUCTION LIVE v1.33.0
