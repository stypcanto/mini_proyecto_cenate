# 📦 MÓDULO DE BOLSAS COMPLETO v3.0.0

> **Sistema integral de importación, gestión, estadísticas y análisis de solicitudes de pacientes**
> **Incluye: Bolsas de Pacientes + Módulo 107 (Formulario 107)**
> **Versión:** v3.0.0 | **Status:** ✅ Production Ready
> **Última actualización:** 2026-01-29
> **Datos en BD:** 329 registros activos en Bolsas + Módulo 107

---

## 📋 TABLA DE CONTENIDOS

1. [Vista General](#vista-general)
2. [Arquitectura y Componentes](#arquitectura-y-componentes)
3. [Módulo 107 - Integración](#módulo-107---integración)
4. [API REST - Endpoints](#api-rest---endpoints)
5. [Flujos de Negocio](#flujos-de-negocio)
6. [Base de Datos](#base-de-datos)
7. [Frontend - Componentes](#frontend---componentes)
8. [Seguridad y Permisos](#seguridad-y-permisos)
9. [Ejemplos de Uso](#ejemplos-de-uso)
10. [Troubleshooting](#troubleshooting)

---

## VISTA GENERAL

El **Módulo de Bolsas** es un sistema integral para gestionar solicitudes de atención de pacientes en CENATE. Comprende 5 componentes que trabajan integrados:

```
┌────────────────────────────────────────────────────────────┐
│         MÓDULO DE BOLSAS v3.0.0                            │
│   (Importación, gestión, análisis y control)               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ✅ Solicitudes de Bolsa (v2.5.0+)                          │
│    ├─ Importación Excel con auto-detección                │
│    ├─ CRUD completo                                        │
│    ├─ Asignación a gestoras de citas                       │
│    ├─ Soft delete con auditoría                            │
│    └─ 9 endpoints REST                                     │
│                                                            │
│ ✅ Módulo 107 (v3.0.0 - NUEVO ⭐)                          │
│    ├─ Integrado en dim_solicitud_bolsa con id_bolsa=107   │
│    ├─ Búsqueda avanzada por DNI/Nombre/IPRESS/Estado      │
│    ├─ Estadísticas completas (KPIs, distribuciones)       │
│    ├─ 4 endpoints de búsqueda + estadísticas              │
│    └─ Postman collection lista para testing                │
│                                                            │
│ ✅ Tipos de Bolsa (v1.1.0)                                 │
│    ├─ CRUD completo                                        │
│    ├─ Catálogo predefinido (7+ tipos)                      │
│    ├─ Búsqueda avanzada                                    │
│    └─ 3 endpoints REST                                     │
│                                                            │
│ ✅ Estados Gestión de Citas (v1.33.0)                      │
│    ├─ 10 estados predefinidos                              │
│    ├─ CRUD completo                                        │
│    ├─ Auditoría centralizada                               │
│    └─ 4 endpoints REST                                     │
│                                                            │
│ ✅ Estadísticas Dashboard (v2.0.0)                         │
│    ├─ 10+ endpoints de análisis en tiempo real             │
│    ├─ 8 visualizaciones diferentes                         │
│    ├─ KPIs con indicadores de salud                        │
│    └─ Datos 100% reales (329+ registros)                   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## ARQUITECTURA Y COMPONENTES

### 1. SOLICITUDES DE BOLSA (v2.5.0)

**Propósito:** Importación, validación y gestión de solicitudes de atención.

**Características:**
- ✅ Auto-detección de tipo bolsa + servicio por nombre archivo
- ✅ Validación de 10 campos Excel obligatorios
- ✅ Enriquecimiento automático (IPRESS, RED, MACRORREGIÓN, asegurados)
- ✅ Deduplicación automática KEEP_FIRST
- ✅ Soft delete con auditoría completa
- ✅ Asignación a gestoras de citas
- ✅ Modal de confirmación para consolidación de duplicados
- ✅ 329+ solicitudes activas en BD

**Archivos Backend:**
```
src/main/java/com/styp/cenate/
├── api/bolsas/SolicitudBolsaController.java (v2.5.0)
├── service/bolsas/SolicitudBolsaServiceImpl.java (v2.5.0)
├── service/excel/ExcelImportService.java (v1.9.1)
├── repository/SolicitudBolsaRepository.java (v2.5.0)
└── dto/bolsas/
    ├── SolicitudBolsaDTO.java
    ├── ReporteDuplicadosDTO.java (v2.2.0)
    └── EstadisticasDTO.java
```

**Archivos Frontend:**
```
src/pages/roles/coordcitas/
├── CargarDesdeExcel.jsx (v1.12.0)
├── Solicitudes.jsx (v2.5.0)
├── MiBandeja.jsx (v2.5.0 - gestoras)
└── EstadisticasDashboard.jsx (v2.0.0)

src/components/
├── ModalDeduplicacionAutomatica.jsx (v2.2.0)
└── ListHeader.jsx (v2.0.0)
```

**Campos de Datos (dim_solicitud_bolsa):**
```
Identificación:
  - id_solicitud (PK)
  - numero_solicitud
  - id_bolsa (FK → dim_tipos_bolsas)

Paciente:
  - paciente_dni
  - paciente_nombre
  - paciente_sexo
  - paciente_fecha_nacimiento
  - paciente_telefono
  - paciente_correo

Localización:
  - codigo_adscripcion (IPRESS)
  - descripcion_ipress
  - red
  - macrorregion

Clínico:
  - especialidad
  - tipo_cita (VOLUNTARIA, RECITA, INTERCONSULTA)
  - servicio

Gestión:
  - estado_gestion_citas_id (10 opciones)
  - responsable_gestora_id (FK → dim_usuarios)
  - fecha_asignacion

Auditoría:
  - fecha_solicitud
  - fecha_actualizacion
  - usuario_creacion
  - activo (soft delete)
```

---

### 2. MÓDULO 107 (v3.0.0) - NUEVO ⭐

**Propósito:** Formulario 107 completamente integrado en Bolsas de Pacientes.

**Status:** ✅ Integrado en dim_solicitud_bolsa con `id_bolsa = 107`

**Características:**
- ✅ Búsqueda avanzada de pacientes (DNI, nombre, IPRESS, estado, fechas)
- ✅ Estadísticas completas (KPIs, distribución por estado/especialidad/IPRESS)
- ✅ Paginación y ordenamiento
- ✅ Protección MBAC (permisos por rol)
- ✅ Postman collection lista para testing
- ✅ Colección con 13 endpoints (1 auth + 8 módulo107 + 4 bolsas)

**Endpoints Módulo 107:**

```
# Listado Pacientes
GET /api/bolsas/modulo107/pacientes
  Params: page, size, sortBy, sortDirection
  Retorna: Page<Modulo107PacienteDTO> con 329+ registros

# Búsqueda Avanzada (6 variantes)
GET /api/bolsas/modulo107/pacientes/buscar
  Params: dni, nombre, codigoIpress, estadoId, fechaDesde, fechaHasta
  Retorna: Page<Modulo107PacienteDTO> filtrada

# Búsqueda específicas (ejemplos):
GET /api/bolsas/modulo107/pacientes/buscar?dni=12345678
GET /api/bolsas/modulo107/pacientes/buscar?nombre=Juan
GET /api/bolsas/modulo107/pacientes/buscar?codigoIpress=0001
GET /api/bolsas/modulo107/pacientes/buscar?estadoId=1
GET /api/bolsas/modulo107/pacientes/buscar?fechaDesde=2026-01-01T00:00:00Z&fechaHasta=2026-01-31T23:59:59Z

# Estadísticas
GET /api/bolsas/modulo107/estadisticas
  Retorna: {
    kpis: { total, atendidos, pendientes, cancelados, tasa_completacion },
    distribucion_estado: [...],
    distribucion_especialidad: [...],
    top_10_ipress: [...],
    evolucion_temporal: [...]
  }
```

**Archivos Backend:**
```
src/main/java/com/styp/cenate/
├── api/bolsas/Bolsa107Controller.java (modificado v3.0.0)
├── service/form107/Modulo107ServiceImpl.java (v3.0.0)
├── dto/form107/Modulo107PacienteDTO.java (v3.0.0)
└── repository/SolicitudBolsaRepository.java (nuevos métodos v3.0.0)
```

**Métodos Repository Nuevos:**
```java
// Listado paginado
Page<SolicitudBolsa> findAllModulo107Casos(Pageable pageable)

// Búsqueda avanzada
Page<SolicitudBolsa> buscarModulo107Casos(
  String dni, String nombre, String codigoIpress,
  Long estadoId, OffsetDateTime fechaDesde, OffsetDateTime fechaHasta,
  Pageable pageable)

// Estadísticas
Map<String, Object> kpisModulo107()
List<Object[]> estadisticasModulo107PorIpress()
List<Object[]> estadisticasModulo107PorEstado()
List<Object[]> evolucionTemporalModulo107()
```

**Variables Postman:**
```json
{
  "base_url": "http://localhost:8080",
  "username": "44914706",
  "password": "@Styp654321",
  "jwt_token": "(auto-filled)",
  "api_version": "v3.0.0",
  "modulo_107_id": "107"
}
```

---

### 3. TIPOS DE BOLSA (v1.1.0)

**Propósito:** Administración del catálogo de tipos de bolsa.

**Tipos Predefinidos:**
1. ORDINARIA - Bolsas regulares
2. EXTRAORDINARIA - Bolsas especiales
3. ESPECIAL - Bolsas de especialidades
4. URGENTE - Bolsas de urgencia
5. EMERGENCIA - Bolsas de emergencia
6. RESERVA - Bolsas de reserva
7. + tipos personalizados

**Endpoints:**
```
POST   /api/bolsas/tipos-bolsas          Crear tipo
GET    /api/bolsas/tipos-bolsas          Listar con paginación
GET    /api/bolsas/tipos-bolsas/{id}     Obtener uno
PUT    /api/bolsas/tipos-bolsas/{id}     Editar
DELETE /api/bolsas/tipos-bolsas/{id}     Eliminar
```

---

### 4. ESTADOS GESTIÓN DE CITAS (v1.33.0)

**Propósito:** Gestión centralizada de 10 estados predefinidos.

**Estados Disponibles:**
1. ⏳ PENDIENTE_CITA - Aguardando asignación
2. ✅ ATENDIDO - Atención completada
3. ❌ CANCELADO - Cita cancelada
4. 🔄 RECITADO - Solicitud recitada
5. 📋 CITADO - Cita asignada
6. 🚫 RECHAZADO - Solicitud rechazada
7. 👉 DERIVADO - Derivado a otra institución
8. 👁️ OBSERVADO - En observación
9. ⏸️ APLAZADO - Aplazado a otra fecha
10. ✔️ COMPLETADO - Proceso completado

**Endpoints:**
```
POST   /api/admin/estados-gestion-citas      Crear
GET    /api/admin/estados-gestion-citas      Listar
PUT    /api/admin/estados-gestion-citas/{id} Editar
DELETE /api/admin/estados-gestion-citas/{id} Eliminar
```

---

### 5. ESTADÍSTICAS DASHBOARD (v2.0.0)

**Propósito:** Análisis e inteligencia empresarial en tiempo real.

**Endpoints Estadísticas:**

```
GET /api/bolsas/estadisticas/resumen
  5 KPIs principales (total, atendidos, pendientes, cancelados, derivados)

GET /api/bolsas/estadisticas/del-dia
  Últimas 24 horas de actividad

GET /api/bolsas/estadisticas/por-estado
  Distribución por PENDIENTE/ATENDIDO/CANCELADO

GET /api/bolsas/estadisticas/por-especialidad
  Ranking de especialidades más solicitadas

GET /api/bolsas/estadisticas/por-ipress
  Ranking de instituciones por carga de trabajo

GET /api/bolsas/estadisticas/por-tipo-cita
  Pie chart: VOLUNTARIA/RECITA/INTERCONSULTA

GET /api/bolsas/estadisticas/por-tipo-bolsa
  Barras horizontales: 6 tipos de bolsa

GET /api/bolsas/estadisticas/evolucion-temporal
  Línea temporal: últimos 30 días

GET /api/bolsas/estadisticas/kpis
  Indicadores detallados + alertas

GET /api/bolsas/estadisticas/dashboard-completo
  Todos los datos en 1 llamada (optimización)
```

**Visualizaciones:**
- Cards: KPIs ejecutivos
- Pie charts: Tipo cita
- Barras horizontales: Tipo bolsa
- Línea temporal: Evolución 30 días
- Tablas: Especialidad e IPRESS
- Distribución estados

---

## MÓDULO 107 - INTEGRACIÓN

### ¿Por qué se integró en Bolsas?

El Módulo 107 (Formulario 107) es un tipo específico de solicitud de pacientes, no un módulo independiente. Por eso está integrado en `dim_solicitud_bolsa` con `id_bolsa = 107`, igual que cómo funcionan otros tipos de bolsas.

### Mapeo de Migración

**Antes (tablas legacy):**
- `bolsa_107_carga` - Historial de cargas (MANTIENE)
- `bolsa_107_item` - Pacientes (MIGRAR → `dim_solicitud_bolsa`)
- `bolsa_107_error` - Errores (MANTIENE)

**Después (estructura unificada v3.0.0):**
```
dim_solicitud_bolsa (todos los tipos de bolsa incluido 107)
├─ WHERE id_bolsa = 107 → Pacientes del Módulo 107
└─ Comparte: Estados, especialidades, IPRESS, estadísticas
```

### DTO Módulo 107 (v3.0.0)

```java
@Data
public class Modulo107PacienteDTO {
  private Long idSolicitud;
  private String numeroSolicitud;
  private String pacienteDni;
  private String pacienteNombre;
  private String pacienteSexo;
  private LocalDate pacienteFechaNacimiento;
  private String pacienteTelefono;
  private String especialidad;
  private String codigoAdscripcion;
  private String tipoCita;
  private Long estadoGestionCitasId;
  private LocalDateTime fechaSolicitud;
  private LocalDateTime fechaAsignacion;
  private Long responsableGestoraId;

  public static Modulo107PacienteDTO fromEntity(SolicitudBolsa entity) {
    // Conversión entity → DTO
  }
}
```

### Protección MBAC

```java
@GetMapping("/modulo107/pacientes")
@CheckMBACPermission(pagina = "/bolsas/modulo107/pacientes", accion = "ver")
public ResponseEntity<?> listarPacientesModulo107(...) { ... }
```

**Permisos requeridos:** SUPERADMIN, ADMIN, COORDINADOR

---

## API REST - ENDPOINTS

### Resumen Completo (42 endpoints)

#### Autenticación (1)
```
POST /api/auth/login
```

#### Solicitudes de Bolsa (9)
```
POST   /api/bolsas/solicitudes/importar                  Importar Excel
GET    /api/bolsas/solicitudes                           Listar todas
GET    /api/bolsas/solicitudes/{id}                      Obtener uno
PUT    /api/bolsas/solicitudes/{id}                      Editar
DELETE /api/bolsas/solicitudes/{id}                      Soft delete
PATCH  /api/bolsas/solicitudes/{id}/estado               Cambiar estado
POST   /api/bolsas/solicitudes/borrar                    Borrar en lote
GET    /api/bolsas/solicitudes/mi-bandeja                Mi bandeja (gestora)
POST   /api/bolsas/solicitudes/{id}/asignar              Asignar gestora
```

#### Módulo 107 (4)
```
GET /api/bolsas/modulo107/pacientes                      Listar todos
GET /api/bolsas/modulo107/pacientes/buscar               Búsqueda avanzada
GET /api/bolsas/modulo107/estadisticas                   Estadísticas completas
POST /api/bolsas/modulo107/pacientes/importar-excel      Importar Excel 107
```

#### Tipos de Bolsa (3)
```
POST   /api/bolsas/tipos-bolsas          Crear
GET    /api/bolsas/tipos-bolsas          Listar
PUT    /api/bolsas/tipos-bolsas/{id}     Editar
```

#### Estados Gestión (4)
```
POST   /api/admin/estados-gestion-citas      Crear
GET    /api/admin/estados-gestion-citas      Listar
PUT    /api/admin/estados-gestion-citas/{id} Editar
DELETE /api/admin/estados-gestion-citas/{id} Eliminar
```

#### Estadísticas (10)
```
GET /api/bolsas/estadisticas/resumen                    KPIs resumido
GET /api/bolsas/estadisticas/del-dia                    Últimas 24h
GET /api/bolsas/estadisticas/por-estado                 Distribución estado
GET /api/bolsas/estadisticas/por-especialidad           Ranking especialidades
GET /api/bolsas/estadisticas/por-ipress                 Ranking IPRESS
GET /api/bolsas/estadisticas/por-tipo-cita              Pie tipo cita
GET /api/bolsas/estadisticas/por-tipo-bolsa             Barras tipo bolsa
GET /api/bolsas/estadisticas/evolucion-temporal         Línea 30 días
GET /api/bolsas/estadisticas/kpis                       KPIs detallados
GET /api/bolsas/estadisticas/dashboard-completo         Todo en 1 llamada
```

#### Health Check (1)
```
GET /api/health                                          Estado servidor
```

---

## FLUJOS DE NEGOCIO

### Flujo 1: Importación de Bolsa

```
1. Usuario selecciona archivo Excel
   ↓
2. Backend detecta:
   - Tipo bolsa (por nombre archivo)
   - Servicio (por nombre archivo)
   ↓
3. Validación:
   - 10 campos obligatorios
   - Formatos de teléfono/DNI
   - Enriquecimiento (IPRESS, RED, asegurados)
   ↓
4. Pre-análisis duplicados:
   - Detecta DNI repetidos
   - Aplica KEEP_FIRST automático
   ↓
5. Frontend muestra Modal:
   - Total: 449 filas
   - Cargadas: 400
   - Consolidadas: 49 duplicados
   ↓
6. Usuario confirma (1 click)
   ↓
7. Resultado: ✅ 400 registros en BD, CERO errores
```

### Flujo 2: Búsqueda Módulo 107

```
1. Usuario accede a: Bolsas > Módulo 107 > Búsqueda
   ↓
2. Ingresa filtros (opcionales):
   - DNI
   - Nombre
   - IPRESS
   - Estado
   - Fecha desde/hasta
   ↓
3. Sistema envía:
   GET /api/bolsas/modulo107/pacientes/buscar?dni=...&nombre=...
   ↓
4. Backend:
   - Query WHERE (id_bolsa=107) AND (filtros)
   - Retorna Page<Modulo107PacienteDTO>
   ↓
5. Frontend muestra tabla paginada:
   - 6 columnas: DNI, Nombre, Sexo, Fecha, IPRESS, Estado
   - Controles paginación
   ↓
6. Usuario puede:
   - Cambiar estado
   - Editar datos
   - Descargar Excel
```

### Flujo 3: Estadísticas Módulo 107

```
1. Usuario accede a: Bolsas > Módulo 107 > Estadísticas
   ↓
2. Frontend llama en paralelo:
   Promise.all([
     GET /api/bolsas/modulo107/estadisticas
   ])
   ↓
3. Backend retorna:
   {
     kpis: { total: 329, atendidos: 218, pendientes: 76, ... },
     distribucion_estado: [...],
     distribucion_especialidad: [...],
     top_10_ipress: [...],
     evolucion_temporal: [...]
   }
   ↓
4. Frontend renderiza:
   - Cards KPIs
   - Tablas
   - Gráficos
   ↓
5. Usuario analiza y toma decisiones
```

### Flujo 4: Asignación a Gestora

```
1. Coordinador selecciona solicitud
   ↓
2. Haz click en "Asignar Gestora"
   ↓
3. Modal de selección:
   - Dropdown con gestoras disponibles
   - Mostrar solicitudes asignadas actualmente
   ↓
4. Asignación → PATCH /api/bolsas/solicitudes/{id}/asignar
   ↓
5. Gestora puede ver en "Mi Bandeja"
   - GET /api/bolsas/solicitudes/mi-bandeja
   - Solo SUS solicitudes asignadas
   ↓
6. Gestora marca como "Atendido"
   - PATCH /api/bolsas/solicitudes/{id}/estado
   ↓
7. Auditoría registra todo
```

---

## BASE DE DATOS

### Tabla Principal: dim_solicitud_bolsa

```sql
CREATE TABLE dim_solicitud_bolsa (
  -- Identificación
  id_solicitud BIGINT PRIMARY KEY,
  numero_solicitud VARCHAR(50) UNIQUE,
  id_bolsa BIGINT NOT NULL,  -- 107 para Módulo 107

  -- Paciente
  paciente_dni VARCHAR(20),
  paciente_nombre VARCHAR(200),
  paciente_sexo CHAR(1),
  paciente_fecha_nacimiento DATE,
  paciente_telefono VARCHAR(20),
  paciente_correo VARCHAR(100),

  -- Localización
  codigo_adscripcion VARCHAR(10),
  descripcion_ipress VARCHAR(200),
  red VARCHAR(100),
  macrorregion VARCHAR(100),

  -- Clínico
  especialidad VARCHAR(100),
  tipo_cita VARCHAR(50),
  servicio VARCHAR(100),

  -- Gestión
  estado_gestion_citas_id BIGINT,
  responsable_gestora_id BIGINT,  -- v2.5.0+
  fecha_asignacion TIMESTAMP,      -- v2.5.0+

  -- Auditoría
  fecha_solicitud TIMESTAMP,
  fecha_actualizacion TIMESTAMP,
  usuario_creacion VARCHAR(100),
  activo BOOLEAN DEFAULT TRUE,     -- Soft delete

  -- Índices optimizados
  INDEX (id_bolsa, activo)         -- Para búsquedas Módulo 107
);
```

### Tablas de Referencia

```
dim_tipos_bolsas (7+ tipos)
├─ id, nombre, descripcion, activo

dim_estados_gestion_citas (10 estados)
├─ id, nombre, descripcion, emoji, color

dim_usuarios (para gestoras)
├─ id, nombre, rol, email, activo

dim_asegurados (enriquecimiento)
├─ dni, nombre, sexo, fecha_nac, tel_celular

dim_ipress (instituciones)
├─ codigo, descripcion, red_id

dim_red (redes asistenciales)
├─ id, nombre, macrorregion_id

dim_servicios (especialidades)
├─ id, nombre, especialidad
```

### Índices Optimizados v3.0.0

```sql
-- Para búsquedas Módulo 107
CREATE INDEX idx_solicitud_bolsa_107
ON dim_solicitud_bolsa(id_bolsa, activo)
WHERE id_bolsa = 107;

-- Para búsquedas por DNI
CREATE INDEX idx_solicitud_dni
ON dim_solicitud_bolsa(paciente_dni);

-- Para paginación ordenada
CREATE INDEX idx_solicitud_fecha_desc
ON dim_solicitud_bolsa(fecha_solicitud DESC, activo);

-- Para asignación a gestoras
CREATE INDEX idx_solicitud_gestora
ON dim_solicitud_bolsa(responsable_gestora_id, estado_gestion_citas_id);
```

---

## FRONTEND - COMPONENTES

### 1. CargarDesdeExcel.jsx (v1.12.0)

**Propósito:** Importación con auto-detección y deduplicación automática.

**Elementos:**
- Drag & drop de archivos
- Auto-detección tipo bolsa
- Validación tiempo real
- Modal de deduplicación (v2.2.0)
- Resumen de carga

**Props:** N/A (page component)
**Estados:** `formData`, `mostrarModalDeduplicacion`, `reporteDeduplicacion`

---

### 2. Solicitudes.jsx (v2.5.0)

**Propósito:** Listado, gestión y filtrado de solicitudes.

**Elementos:**
- Tabla paginada (50 filas por página)
- ListHeader.jsx con 6 filtros
- Acciones por fila: cambiar estado, editar, eliminar
- Botón "Borrar Selección" (solo SUPERADMIN)
- Contador de registros

**Filtros:**
- Bolsa (dropdown)
- Macrorregión
- Red asistencial
- IPRESS
- Especialidad
- Tipo cita

**Props:** N/A (page component)

---

### 3. MiBandeja.jsx (v2.5.0) ⭐ NUEVO

**Propósito:** Dashboard personal para gestoras de citas.

**Elementos:**
- Tabla de solicitudes asignadas a la gestora actual
- Filtros limitados (estado, especialidad)
- Botón "Marcar como Atendido"
- Estadísticas rápidas (total, pendientes, atendidas, canceladas)
- Solo ve SUS solicitudes asignadas

**Endpoint:** GET /api/bolsas/solicitudes/mi-bandeja

**Props:** N/A (page component)

---

### 4. EstadisticasDashboard.jsx (v2.0.0)

**Propósito:** Análisis visual en tiempo real.

**Componentes Internos:**
- KpisResumen (5 cards)
- DistribucionEstado (tabla)
- RankingEspecialidades (tabla)
- RankingIpress (tabla)
- TipoCitaPie (pie chart)
- TipoBolsaBars (barras horizontales)
- EvolucionTemporal (línea 30 días)

**Props:** N/A (page component)

---

### 5. ModalDeduplicacionAutomatica.jsx (v2.2.0)

**Propósito:** Mostrar duplicados detectados y confirmar consolidación.

**Elementos:**
- Stats cards (Total, Cargadas, Consolidadas)
- Lista expandible por DNI
- Botones: Confirmar / Cancelar
- Animaciones fade/slide

**Props:**
```javascript
{
  isOpen,              // boolean
  reporteDeduplicacion: {
    total_filas,
    filas_cargadas,
    filas_consolidadas,
    duplicados_detectados: [
      { dni, nombre, cantidad_duplicados, registros: [...] }
    ]
  },
  onConfirm,          // función callback
  onCancel            // función callback
}
```

---

### 6. TiposBolsas.jsx (v1.1.0)

**Propósito:** CRUD de catálogo de tipos.

**Elementos:**
- Tabla con 7+ tipos
- Botones: Crear, Editar, Eliminar
- Modales profesionales
- Validación de duplicados

**Props:** N/A (page component)

---

### 7. EstadosGestion.jsx (v1.33.0)

**Propósito:** Administración de 10 estados.

**Elementos:**
- Tabla con 10 estados predefinidos
- CRUD completo
- Editor de emoji y color por estado
- Auditoría

**Props:** N/A (page component)

---

### 8. ListHeader.jsx (v2.0.0)

**Propósito:** Filtros reutilizables con contadores.

**Estructura (3 filas):**
```
Fila 1: Bolsa | Limpiar
Fila 2: Macrorregión | Red | IPRESS
Fila 3: Especialidad | Tipo Cita
```

**Props:**
```javascript
{
  filtros,                    // objeto con valores filtros
  onFiltroChange,            // callback cambio filtro
  opciones: {
    bolsas: [],
    macroregiones: [],
    redes: [],
    ipress: [],
    especialidades: [],
    tiposCita: []
  },
  contadores: {              // opcional
    bolsa_1: 50,
    macrorregion_norte: 120,
    // etc
  }
}
```

---

## SEGURIDAD Y PERMISOS

### RBAC por Endpoint

```
POST /api/bolsas/solicitudes/importar
  Requiere: COORDINADOR | ADMIN | SUPERADMIN

GET /api/bolsas/solicitudes
  Requiere: COORDINADOR | ADMIN | SUPERADMIN | GESTOR_DE_CITAS

PATCH /api/bolsas/solicitudes/{id}/estado
  Requiere: COORDINADOR | ADMIN | SUPERADMIN | GESTOR_DE_CITAS

DELETE /api/bolsas/solicitudes/{id}
  Requiere: SUPERADMIN (botón oculto para otros)

GET /api/bolsas/solicitudes/mi-bandeja
  Requiere: GESTOR_DE_CITAS
  Retorna: solo solicitudes asignadas al usuario actual

POST /api/bolsas/solicitudes/{id}/asignar
  Requiere: COORDINADOR | ADMIN | SUPERADMIN

GET /api/bolsas/estadisticas/**
  Requiere: ADMIN | SUPERADMIN | COORDINADOR

GET /api/bolsas/modulo107/pacientes
  Requiere: @CheckMBACPermission(pagina="/bolsas/modulo107/pacientes", accion="ver")
  Usuarios: SUPERADMIN, ADMIN, COORDINADOR
```

### DTOs - Protección de Datos

```java
// Nunca exponer JPA entity al frontend
// Siempre usar DTOs

@Data
public class SolicitudBolsaDTO {
  private Long id;
  private String numeroSolicitud;
  private String pacienteDni;
  // ... otros campos públicos
  // NO incluye: ids internos, contraseñas, datos sensibles
}

@Data
public class Modulo107PacienteDTO {
  // Solo campos necesarios para módulo 107
  // SIN exposición de entity internals
}
```

---

## EJEMPLOS DE USO

### Ejemplo 1: Importar Excel desde Postman

```bash
curl -X POST "http://localhost:8080/api/bolsas/solicitudes/importar" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "archivo=@bolsa_otorrino_2601.xlsx" \
  -F "idBolsa=1"

Respuesta:
{
  "mensaje": "Importación completada",
  "total_filas": 449,
  "filas_procesadas": 400,
  "filas_error": 49,
  "reporte_deduplicacion": {
    "total_filas": 449,
    "filas_cargadas": 400,
    "filas_consolidadas": 49
  }
}
```

### Ejemplo 2: Buscar en Módulo 107 por DNI

```bash
curl -X GET "http://localhost:8080/api/bolsas/modulo107/pacientes/buscar?dni=12345678&page=0&size=10" \
  -H "Authorization: Bearer $JWT_TOKEN"

Respuesta:
{
  "total": 5,
  "page": 0,
  "size": 10,
  "totalPages": 1,
  "pacientes": [
    {
      "idSolicitud": 123,
      "numeroSolicitud": "BOL107-001-001",
      "pacienteDni": "12345678",
      "pacienteNombre": "Juan Pérez García",
      "pacienteSexo": "M",
      "pacienteFechaNacimiento": "1980-05-15",
      "especialidad": "Cardiología",
      "codigoAdscripcion": "021",
      "tipoCita": "VOLUNTARIA",
      "estadoGestionCitasId": 1,
      "fechaSolicitud": "2026-01-29T10:30:00Z"
    }
  ]
}
```

### Ejemplo 3: Obtener Estadísticas Módulo 107

```bash
curl -X GET "http://localhost:8080/api/bolsas/modulo107/estadisticas" \
  -H "Authorization: Bearer $JWT_TOKEN"

Respuesta:
{
  "kpis": {
    "total_pacientes": 329,
    "atendidos": 218,
    "pendientes": 76,
    "cancelados": 35,
    "tasa_completacion": 66.26,
    "horas_promedio": 24
  },
  "distribucion_estado": [
    { "estado": "ATENDIDO", "cantidad": 218, "porcentaje": 66.26 },
    { "estado": "PENDIENTE", "cantidad": 76, "porcentaje": 23.10 },
    { "estado": "CANCELADO", "cantidad": 35, "porcentaje": 10.64 }
  ],
  "distribucion_especialidad": [
    { "especialidad": "Cardiología", "cantidad": 85 },
    { "especialidad": "Neurología", "cantidad": 62 },
    // ...
  ],
  "top_10_ipress": [
    { "codigo": "021", "nombre": "IPRESS Central", "cantidad": 120 },
    // ...
  ],
  "evolucion_temporal": [
    { "fecha": "2026-01-29", "total": 50, "atendidos": 33 },
    // ...
  ]
}
```

### Ejemplo 4: Asignar Solicitud a Gestora

```bash
curl -X POST "http://localhost:8080/api/bolsas/solicitudes/123/asignar" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idGestora": 456,
    "fecha_asignacion": "2026-01-29T14:30:00Z"
  }'

Respuesta:
{
  "id": 123,
  "numeroSolicitud": "BOL001-001-001",
  "responsableGestoraId": 456,
  "fechaAsignacion": "2026-01-29T14:30:00Z",
  "mensaje": "Solicitud asignada correctamente"
}
```

### Ejemplo 5: Ver Mi Bandeja (Gestora)

```bash
curl -X GET "http://localhost:8080/api/bolsas/solicitudes/mi-bandeja?page=0&size=20" \
  -H "Authorization: Bearer $JWT_TOKEN_GESTORA"

Respuesta:
{
  "total": 15,
  "page": 0,
  "size": 20,
  "totalPages": 1,
  "solicitudes": [
    {
      "idSolicitud": 123,
      "numeroSolicitud": "BOL001-001-001",
      "pacienteDni": "12345678",
      "pacienteNombre": "Juan Pérez",
      "estadoGestionCitasId": 1,
      "especialidad": "Cardiología",
      "fechaAsignacion": "2026-01-29T14:30:00Z"
    }
    // más solicitudes de esta gestora...
  ]
}
```

---

## TROUBLESHOOTING

### ❌ Error: "401 Unauthorized"

**Causa:** Token JWT expirado o inválido

**Solución:**
```bash
# Hacer login nuevamente
POST /api/auth/login
Body: {
  "username": "44914706",
  "password": "@Styp654321"
}
# Copiar nuevo token a variable $JWT_TOKEN
```

---

### ❌ Error: "403 Forbidden"

**Causa:** Usuario sin permisos para esta acción

**Solución:**
- Verificar rol del usuario
- Contactar administrador para asignar rol correcto
- Roles requeridos: SUPERADMIN, ADMIN, COORDINADOR

---

### ❌ Error: "404 Not Found"

**Causa:** Endpoint o recurso no existe

**Solución:**
- Verificar URL exacta
- Verificar método HTTP (GET/POST/PUT/DELETE)
- Ver lista completa de endpoints en sección API REST

---

### ❌ Error: "Módulo 107 no retorna resultados"

**Causa:** Base de datos vacía o id_bolsa no es 107

**Solución:**
```sql
-- Verificar datos en BD
SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE id_bolsa = 107;

-- Si 0 registros:
-- 1. Importar Excel desde interfaz CargarDesdeExcel.jsx
-- 2. Verificar id_bolsa fue mapeado correctamente
-- 3. Revisar logs de backend
```

---

### ❌ Error: "Deduplicación no detecta duplicados"

**Causa:** Implementación del análisis puede tener valores NULL

**Solución:**
```java
// Usar COALESCE en queries
String dni = coalesceNullToEmpty(pacienteDni);
// Agrupar por DNI normalizado
```

---

### ❌ Error: "Gestora no ve Mi Bandeja"

**Causa:** Usuario no tiene rol GESTOR_DE_CITAS

**Solución:**
```sql
-- Asignar rol a usuario
UPDATE dim_usuarios
SET id_rol = (SELECT id FROM dim_roles WHERE nombre = 'GESTOR_DE_CITAS')
WHERE id = <user_id>;

-- Luego refrescar token JWT
```

---

## POSTMAN COLLECTION

La colección Postman lista para testing está en:

```
/spec/coleccion-postman/
├── CENATE-Bolsas-Modulo107.postman_collection.json  ← Importar esto
├── CENATE-Entorno.postman_environment.json           ← Importar esto
├── README.md                                          ← Leer para detalles
└── QUICK-START.md                                     ← Guía rápida 3 pasos
```

**Pasos:**
1. Abrir Postman
2. Import → CENATE-Bolsas-Modulo107.postman_collection.json
3. Import → CENATE-Entorno.postman_environment.json
4. Select "CENATE - Desarrollo" en dropdown arriba
5. Click "Login" para obtener JWT token
6. Probar endpoints

---

## MATRIZ DE VERSIONES v3.0.0

| Componente | Versión | Features | Status |
|-----------|---------|----------|--------|
| Solicitudes | v2.5.0 | CRUD + Gestoras + Asignación | ✅ Production |
| Módulo 107 | v3.0.0 | Búsqueda + Estadísticas + MBAC | ✅ Production |
| Deduplicación | v2.2.0 | KEEP_FIRST + Modal | ✅ Production |
| Estadísticas | v2.0.0 | 10 endpoints + 8 visualizaciones | ✅ Production |
| Tipos Bolsa | v1.1.0 | CRUD + Catálogo | ✅ Production |
| Estados Citas | v1.33.0 | 10 estados + CRUD | ✅ Production |
| Seguridad | v3.0.0 | MBAC + JWT + Auditoría | ✅ Production |
| **TOTAL SISTEMA** | **v3.0.0** | **Integración Completa** | **✅ Production Ready** |

---

## INFORMACIÓN DE CONTACTO

**Desarrollador:** Ing. Styp Canto Rondón
**Email:** stypcanto@essalud.gob.pe
**Última actualización:** 2026-01-29
**Versión:** v3.0.0 (Módulo 107 integrado completamente)
**Status:** ✅ Production Ready

---

**Fin de Documentación v3.0.0**
