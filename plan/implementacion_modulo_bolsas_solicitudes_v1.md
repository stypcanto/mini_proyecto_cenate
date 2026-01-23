# Análisis Técnico: Integración Frontend-Backend Módulo Solicitudes Bolsas

**Documento:** Feature Analysis - Integración de Solicitudes.jsx con Backend
**Versión:** v1.0.0
**Fecha:** 2026-01-22
**Agente:** Architect (Sistema de Análisis Técnico)
**Status:** PLAN DE IMPLEMENTACIÓN

---

## 📋 Índice

1. [Problema](#problema)
2. [Análisis de Impacto Arquitectural](#análisis-de-impacto-arquitectural)
3. [Estado Actual (As-Is)](#estado-actual-as-is)
4. [Estado Deseado (To-Be)](#estado-deseado-to-be)
5. [Propuesta de Solución](#propuesta-de-solución)
6. [Plan de Implementación](#plan-de-implementación)
7. [Consideraciones de Seguridad](#consideraciones-de-seguridad)
8. [Riesgos y Mitigación](#riesgos-y-mitigación)
9. [Checklist de Implementación](#checklist-de-implementación)

---

## Problema

### Descripción del Requerimiento

Conectar la interfaz de usuario `Solicitudes.jsx` (URL: `http://localhost:3000/bolsas/solicitudes`) con el backend del sistema CENATE para que:

1. **Carga de datos en tiempo real** desde la tabla `dim_solicitud_bolsa` (PostgreSQL)
2. **Visualización de múltiples fuentes** de pacientes (6 tipos de bolsas)
3. **Búsqueda avanzada** por DNI, nombre, teléfono, IPRESS, red
4. **Filtrado dinámico** por Bolsa, Red, Especialidad, Estado
5. **Acciones CRUD** completas (ver, editar, asignar, cambiar teléfono, descargar CSV)
6. **Auditoría completa** de cada acción
7. **Rendimiento optimizado** con paginación y caché

### Restricciones

- La UI/UX está **terminada y NO se modifica** (cliente lo requiere así)
- Debe soportar 150+ pacientes en la tabla sin demoras
- Debe integrarse con sistema de permisos MBAC existente
- Debe mantener auditoría de cada acción de usuario

---

## Análisis de Impacto Arquitectural

### Backend Impact

#### Controladores REST Afectados
```
✅ EXISTE: BolsasController.java
├─ GET /api/bolsas/solicitudes → obtenerTodasSolicitudes()
├─ GET /api/bolsas/solicitudes/buscar → buscarSolicitudes()
├─ GET /api/bolsas/solicitudes/estadisticas → obtenerEstadisticas()
├─ PATCH /api/bolsas/solicitudes/{id}/asignar → asignarAGestora() [IMPLEMENTAR]
├─ PUT /api/bolsas/solicitudes/{id}/cambiar-telefono → cambiarTelefono() [IMPLEMENTAR]
├─ GET /api/bolsas/solicitudes/exportar → exportarCSV() [IMPLEMENTAR]
└─ POST /api/bolsas/solicitudes/{id}/recordatorio → enviarRecordatorio() [IMPLEMENTAR]

⚠️ NOTA: Controller existe pero algunos endpoints no están implementados
```

#### Servicios (Application Layer)
```
✅ EXISTE: SolicitudBolsasService.java + Impl
├─ obtenerTodasLasSolicitudes()
├─ obtenerSolicitudPorId()
├─ buscarSolicitudes()
├─ obtenerEstadisticas()
├─ crearSolicitud()
├─ actualizarSolicitud()
├─ aprobarSolicitud()
├─ rechazarSolicitud()
└─ [FALTA] asignarAGestora()
└─ [FALTA] cambiarTelefono()
└─ [FALTA] enviarRecordatorio()

⚠️ NOTA: Métodos principales existen, faltan los de acción específica
```

#### Entidades JPA
```
✅ EXISTE: SolicitudBolsa.java
├─ Tabla: dim_solicitud_bolsa (31 campos)
├─ Relaciones: DimBolsa, DimEstadosGestionCitas, Usuarios
└─ Timestamps: fechaSolicitud, fechaActualizacion, fechaAsignacion

✅ EXISTE: DimBolsa.java
└─ Tabla: dim_bolsa (catálogo de bolsas)

✅ EXISTE: DimEstadosGestionCitas.java
└─ Tabla: dim_estados_gestion_citas (10 estados)
```

#### Repositories
```
✅ EXISTE: SolicitudBolsaRepository.java
├─ findAll()
├─ findById()
├─ save()
├─ delete()
├─ findByPacienteDni()
├─ findByEstado()
└─ Métodos personalizados de búsqueda
```

#### DTOs
```
✅ EXISTE: SolicitudBolsaDTO.java
└─ Contiene: id, numero, paciente, teléfono, especialidad, bolsa, estado, etc.

⚠️ VERIFICAR: DTO coincide con estructura esperada en frontend
```

### Frontend Impact

#### Componentes React Afectados
```
✅ EXISTE: Solicitudes.jsx
├─ Estado local: solicitudes, searchTerm, filtros, selectedRows
├─ Efectos: useEffect con cargarSolicitudes()
├─ Actualmente: USA MOCK DATA
└─ NECESITA: Conectar a bolsasService.obtenerSolicitudes()

✅ EXISTE: PageHeader.jsx (reutilizable)
✅ EXISTE: StatCard.jsx (reutilizable)
✅ EXISTE: ListHeader.jsx (reutilizable)
└─ Todos funcionan correctamente
```

#### Gestión de Estado
```
ACTUAL (Mock):
├─ useState([solicitudes]) con datos estáticos
├─ useState(searchTerm)
├─ useState(filtroBolsa, filtroRed, filtroEspecialidad, filtroEstado)
├─ useState(selectedRows)

NECESARIO:
├─ Mismo estructura pero conectada a backend
├─ useEffect para sincronizar cambios
├─ Error handling
├─ Loading states
```

#### Rutas Protegidas
```
VERIFICAR: ProtectedRoute para /bolsas/solicitudes
├─ Rol requerido: COORDINADOR_GESTION_CITAS
├─ Acción: "ver" (permiso de lectura)
└─ MBAC: Validar contra endpoint en backend
```

#### Servicios Frontend
```
✅ EXISTE: bolsasService.js
├─ obtenerSolicitudes() → GET /api/bolsas/solicitudes
├─ buscarSolicitudes() → GET /api/bolsas/solicitudes/buscar
├─ obtenerEstadisticas() → GET /api/bolsas/solicitudes/estadisticas
├─ actualizarSolicitud() → PUT /api/bolsas/solicitudes/{id}
├─ obtenerSolicitudPorId() → GET /api/bolsas/solicitudes/{id}
├─ aprobarSolicitud() → PUT /api/bolsas/solicitudes/{id}/aprobar
├─ rechazarSolicitud() → PUT /api/bolsas/solicitudes/{id}/rechazar
└─ eliminarSolicitud() → DELETE /api/bolsas/solicitudes/{id}

⚠️ FALTA EN SERVICE:
├─ asignarAGestora() → PATCH /api/bolsas/solicitudes/{id}/asignar
├─ cambiarTelefono() → PUT /api/bolsas/solicitudes/{id}/cambiar-telefono
├─ descargarCSV() → GET /api/bolsas/solicitudes/exportar
└─ enviarRecordatorio() → POST /api/bolsas/solicitudes/{id}/recordatorio
```

### Base de Datos Impact

#### Tablas Existentes
```
✅ dim_solicitud_bolsa
├─ 31 campos (bien documentados)
├─ 8 índices para optimización
├─ Relaciones: bolsa, estado_gestion, paciente, red, ipress
└─ Auditoría: timestamps automáticos

✅ dim_bolsa
└─ 7 tipos de bolsas iniciales

✅ dim_estados_gestion_citas
└─ 10 estados de gestión
```

#### Nuevas Tablas Necesarias
```
❌ FALTA: dim_asignacion_bolsa_gestora (Auditoría de distribuciones)
├─ id_asignacion (PK)
├─ id_solicitud (FK)
├─ gestora_id (FK → usuarios)
├─ coordinador_id (FK → usuarios)
├─ fecha_asignacion (timestamp)
├─ fecha_cambio_telefono (timestamp)
├─ telefono_anterior
├─ telefono_nuevo
└─ notas_auditoria

❌ FALTA: dim_cambios_telefono (Historial de cambios de teléfono)
├─ id (PK)
├─ id_solicitud (FK)
├─ usuario_id (FK)
├─ telefono_anterior
├─ telefono_nuevo
├─ razon_cambio
└─ fecha_cambio (timestamp)
```

#### Índices Nuevos
```
RECOMENDADOS:
├─ idx_solicitud_gestora_asignacion (responsable_gestora_id)
├─ idx_solicitud_fecha_asignacion (fecha_asignacion)
├─ idx_solicitud_estado_gestion_id (estado_gestion_citas_id)
└─ idx_solicitud_bolsa_estado (id_bolsa, estado) [Compound]
```

---

## Estado Actual (As-Is)

### Frontend
```
✅ Solicitudes.jsx completamente construido
├─ UI/UX profesional con todas las características
├─ Usa MOCK DATA (8 pacientes hardcodeados)
├─ TODO comentado: "Llamar a API para obtener solicitudes"
├─ Componentes reutilizables integrados correctamente
└─ Filtros, búsqueda, selección múltiple funcionan con datos estáticos

PROBLEMAS:
└─ No conectado al backend
└─ No hay carga desde base de datos
└─ No hay acceso a datos reales
```

### Backend
```
✅ BolsasController.java existe
├─ Endpoints para GET solicitudes implementados
├─ Búsqueda implementada
├─ Estadísticas implementadas
└─ Algunos endpoints de acción falta

✅ SolicitudBolsasService.java existe
├─ Lógica de lectura implementada
└─ Lógica de CRUD básica existe

❌ FALTAN ENDPOINTS:
├─ PATCH /api/bolsas/solicitudes/{id}/asignar (distribuir a gestora)
├─ PUT /api/bolsas/solicitudes/{id}/cambiar-telefono
├─ GET /api/bolsas/solicitudes/exportar (descargar CSV)
└─ POST /api/bolsas/solicitudes/{id}/recordatorio (enviar WA/Email)

❌ FALTAN SERVICIOS:
├─ Lógica de asignación a gestora
├─ Lógica de cambio de teléfono
├─ Lógica de exportación CSV
└─ Lógica de envío de recordatorios
```

### Base de Datos
```
✅ Tablas principales existen
├─ dim_solicitud_bolsa (31 campos)
├─ dim_bolsa (catálogo)
└─ dim_estados_gestion_citas (10 estados)

❌ TABLAS DE AUDITORÍA falta
├─ Historial de asignaciones
├─ Historial de cambios de teléfono
└─ Auditoría de recordatorios
```

---

## Estado Deseado (To-Be)

### Frontend
```
✅ Solicitudes.jsx conectado al backend
├─ Carga datos reales de dim_solicitud_bolsa
├─ Búsqueda funcional en tiempo real
├─ Filtros dinámicos (bolsa, red, especialidad, estado)
├─ Selección múltiple con descarga CSV
├─ Cambio de teléfono con validación
├─ Asignación a gestoras de citas
├─ Indicadores visuales (diferimiento, semáforo)
├─ Paginación para 150+ registros
├─ Error handling y loading states
└─ Auditoría automática de cada acción

USUARIOS:
└─ Coordinador de Gestión de Citas ve todas las bolsas y distribuye
```

### Backend
```
✅ BolsasController completamente implementado
├─ Todos los endpoints GET funcionan
├─ Endpoints POST/PUT/PATCH implementados
└─ Validaciones y manejo de errores

✅ SolicitudBolsasService completamente implementado
├─ CRUD completo
├─ Búsqueda avanzada
├─ Asignación a gestoras
├─ Cambio de teléfono con auditoría
├─ Envío de recordatorios
└─ Exportación CSV

✅ Security integrado
├─ MBAC para cada endpoint
├─ Auditoría obligatoria
└─ Validación de permisos
```

### Base de Datos
```
✅ Todas las tablas necesarias
├─ dim_solicitud_bolsa con 31 campos
├─ dim_bolsa (7 tipos)
├─ dim_estados_gestion_citas (10 estados)
├─ Auditoría de asignaciones
└─ Historial de cambios de teléfono

✅ Índices optimizados (8+ índices)
└─ Búsqueda rápida en 150+ registros
```

---

## Propuesta de Solución

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                               │
├─────────────────────────────────────────────────────────────────────┤
│                     Solicitudes.jsx                                  │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ Estado:                                                      │   │
│ │ • solicitudes (Array from DB)                               │   │
│ │ • searchTerm, filtros, selectedRows, loading, error         │   │
│ │                                                              │   │
│ │ Effects:                                                     │   │
│ │ • useEffect: cargarDatos() on mount                         │   │
│ │ • useEffect: buscar() on searchTerm change (debounce 300ms) │   │
│ │ • useEffect: filtrar() on filter changes                    │   │
│ │                                                              │   │
│ │ Handlers:                                                    │   │
│ │ • cambiarTelefono() → API PUT                               │   │
│ │ • asignarGestora() → API PATCH                              │   │
│ │ • descargarCSV() → API GET con responseType blob            │   │
│ │ • verDetalles() → API GET /{id}                             │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ Componentes Reutilizables:                                          │
│ ├─ PageHeader (título + botón agregar)                             │
│ ├─ StatCard (5 tarjetas: Total, Pendientes, Citados, etc.)        │
│ └─ ListHeader (búsqueda + 4 filtros dinámicos)                     │
│                                                                      │
│ Tabla Principal:                                                     │
│ ├─ 15 columnas (DNI, Nombre, Teléfono, Especialidad, etc.)        │
│ ├─ Checkbox selección múltiple                                      │
│ ├─ Dropdown estado (PENDIENTE, CITADO, ATENDIDO, OBSERVADO)       │
│ ├─ Indicador Diferimiento (días)                                    │
│ ├─ Semáforo (Verde/Rojo)                                            │
│ └─ Acciones (Cambiar, Ver, Agregar Usuario, Compartir)            │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ HTTP
         │ JSON
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Spring Boot)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ BolsasController (/api/bolsas)                                      │
│ ├─ GET /solicitudes → obtenerTodasSolicitudes()                    │
│ ├─ GET /solicitudes/buscar → buscarSolicitudes()                  │
│ ├─ GET /solicitudes/estadisticas → obtenerEstadisticas()          │
│ ├─ GET /solicitudes/{id} → obtenerSolicitudPorId()                │
│ ├─ PUT /solicitudes/{id}/cambiar-telefono → cambiarTelefono()    │
│ ├─ PATCH /solicitudes/{id}/asignar → asignarAGestora()           │
│ ├─ GET /solicitudes/exportar → exportarCSV()                      │
│ └─ POST /solicitudes/{id}/recordatorio → enviarRecordatorio()    │
│                                                                      │
│ SolicitudBolsasService                                              │
│ ├─ obtenerTodasLasSolicitudes()                                    │
│ ├─ buscarSolicitudes(dni, nombre, estado, bolsa)                 │
│ ├─ obtenerEstadisticas()                                           │
│ ├─ cambiarTelefono(id, nuevoTelefono)                             │
│ ├─ asignarAGestora(id, gestorId, gestoraNombre)                   │
│ ├─ exportarCSV(List<SolicitudBolsa>)                              │
│ └─ enviarRecordatorio(id, tipo: WA | EMAIL)                       │
│                                                                      │
│ SolicitudBolsaRepository                                            │
│ ├─ findAll()                                                        │
│ ├─ findByPacienteDniContaining()                                   │
│ ├─ findByPacienteNombreContainingIgnoreCase()                     │
│ ├─ findByEstadoOrdenadoPorFecha()                                 │
│ └─ Queries JPA/SQL para búsqueda avanzada                         │
│                                                                      │
│ Security (MBAC)                                                     │
│ ├─ @PreAuthorize("hasRole('COORDINADOR_GESTION_CITAS')")         │
│ ├─ @CheckMBACPermission(pagina = "/bolsas/solicitudes", ...)     │
│ └─ AuditLogService registra cada acción                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ JPA/Hibernate
         │
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ dim_solicitud_bolsa (31 campos)                                     │
│ ├─ Clave primaria: id_solicitud                                     │
│ ├─ FK: id_bolsa, estado_gestion_citas_id, paciente_id, red_id     │
│ ├─ Datos paciente: DNI, nombre, teléfono, sexo, especialidad      │
│ ├─ Gestión: responsable_gestora_id, fecha_asignacion              │
│ ├─ Indicadores: diferimiento, semaforo                             │
│ ├─ Auditoría: created_at, updated_at, created_by, updated_by      │
│ └─ Índices: 8+ índices para búsqueda rápida                        │
│                                                                      │
│ dim_bolsa (7 registros)                                             │
│ └─ Catálogo: BOLSA_107, BOLSA_DENGUE, ENFERMERIA, IVR, etc.      │
│                                                                      │
│ dim_estados_gestion_citas (10 registros)                           │
│ └─ Estados: CITADO, NO_CONTESTA, ATENDIDO_IPRESS, etc.           │
│                                                                      │
│ dim_asignacion_bolsa_gestora (NEW - Auditoría)                     │
│ └─ Registro de quién distribuyó a quién y cuándo                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Patrones de Diseño Utilizados

1. **MVC + Service Layer**
   - Controller → Service → Repository → Database
   - Separación clara de responsabilidades

2. **DTO Pattern**
   - SolicitudBolsaDTO encapsula datos para frontend
   - Validación en capas (frontend + backend)

3. **Repository Pattern**
   - JpaRepository para operaciones CRUD
   - Queries personalizadas para búsqueda

4. **Service Locator**
   - bolsasService.js centraliza acceso a API

5. **RBAC/MBAC**
   - @PreAuthorize para roles
   - @CheckMBACPermission para permisos granulares

6. **Auditoría**
   - AuditLogService registra cada acción
   - Timestamps automáticos en entidades

---

## Plan de Implementación

### Fase 1: Backend - Completar Servicios (3-4 commits)

#### Tarea 1.1: Implementar método asignarAGestora()
```
Archivo: SolicitudBolsasServiceImpl.java
Método nuevo: asignarAGestora(Long id, Long gestorId, String gestoraNombre)

Lógica:
1. Validar que solicitud existe
2. Validar que gestora existe y tiene rol GESTORA_CITAS
3. Actualizar:
   ├─ responsable_gestora_id = gestorId
   ├─ responsable_gestora_nombre = gestoraNombre
   ├─ fecha_asignacion = ahora
   ├─ estado = APROBADA (si estaba PENDIENTE)
   └─ estado_gestion_citas_id = NULL (reiniciar)
4. Registrar en auditoría
5. Retornar SolicitudBolsaDTO actualizada

Endpoint:
└─ PATCH /api/bolsas/solicitudes/{id}/asignar
   RequestParam: gestorId, gestoraNombre
```

#### Tarea 1.2: Implementar método cambiarTelefono()
```
Archivo: SolicitudBolsasServiceImpl.java
Método nuevo: cambiarTelefono(Long id, String nuevoTelefono)

Lógica:
1. Validar que solicitud existe
2. Validar formato teléfono (regex: +51\d{9})
3. Guardar historial:
   ├─ telefonoAnterior = solicitud.pacienteTelefono
   ├─ telefonoNuevo = nuevoTelefono
   ├─ usuarioId = usuario actual
   └─ fecha_cambio = ahora
4. Actualizar solicitud.pacienteTelefono = nuevoTelefono
5. Registrar en auditoría
6. Retornar SolicitudBolsaDTO actualizada

Endpoint:
└─ PUT /api/bolsas/solicitudes/{id}/cambiar-telefono
   RequestParam: nuevoTelefono
```

#### Tarea 1.3: Implementar método exportarCSV()
```
Archivo: SolicitudBolsasServiceImpl.java
Método nuevo: exportarCSV(List<Long> ids)

Lógica:
1. Obtener solicitudes por IDs
2. Generar CSV con columnas:
   ├─ DNI, Nombre, Teléfono, Especialidad, Sexo, Red, IPRESS
   ├─ Bolsa, Estado, Diferimiento, Semáforo
   ├─ Fecha Cita, Fecha Asignación, Gestora
   └─ Vigencia
3. Generar bytes CSV
4. Retornar con headers: Content-Type: text/csv

Endpoint:
└─ GET /api/bolsas/solicitudes/exportar
   RequestParams: ids[] (array of Long)
   ResponseType: application/octet-stream
```

#### Tarea 1.4: Implementar método enviarRecordatorio()
```
Archivo: SolicitudBolsasServiceImpl.java
Método nuevo: enviarRecordatorio(Long id, String tipo)

Lógica:
1. Validar que solicitud existe
2. Validar que estado = CITADO
3. Obtener datos paciente:
   ├─ Teléfono (para WhatsApp)
   ├─ Email (si existe)
   └─ Fecha cita
4. Enviar según tipo:
   ├─ Si "WHATSAPP": notificationService.enviarWhatsApp()
   └─ Si "EMAIL": notificationService.enviarEmail()
5. Registrar en auditoría
6. Actualizar recordatorio_enviado = true

Endpoint:
└─ POST /api/bolsas/solicitudes/{id}/recordatorio
   RequestParam: tipo (WHATSAPP | EMAIL)
```

### Fase 2: Backend - Completar Controller (2 commits)

#### Tarea 2.1: Agregar endpoints faltantes a BolsasController
```
Métodos nuevos:
1. @PatchMapping("/{id}/asignar") → asignarAGestora()
2. @PutMapping("/{id}/cambiar-telefono") → cambiarTelefono()
3. @GetMapping("/exportar") → exportarCSV()
4. @PostMapping("/{id}/recordatorio") → enviarRecordatorio()

Validaciones en Controller:
├─ @PreAuthorize("hasRole('COORDINADOR_GESTION_CITAS')")
├─ @CheckMBACPermission(pagina = "/bolsas/solicitudes", accion = "editar")
└─ Manejo de excepciones con ResponseEntity
```

#### Tarea 2.2: Actualizar DTOs si es necesario
```
Verificar: SolicitudBolsaDTO vs Solicitudes.jsx
├─ Campos mostrados en tabla
├─ Tipos de datos (String, Long, Date, Boolean)
├─ Nullability
└─ Agregar campos si faltan (ej: diferimiento, semaforo)
```

### Fase 3: Frontend - Conectar API (3-4 commits)

#### Tarea 3.1: Actualizar bolsasService.js
```
Agregar métodos faltantes:

export const asignarAGestora = async (id, gestorId, gestoraNombre) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/solicitudes/${id}/asignar`,
    {}, // body vacío
    { params: { gestorId, gestoraNombre } }
  );
  return response.data;
};

export const cambiarTelefono = async (id, nuevoTelefono) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/solicitudes/${id}/cambiar-telefono`,
    {},
    { params: { nuevoTelefono } }
  );
  return response.data;
};

export const descargarCSV = async (ids) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/solicitudes/exportar`,
    {
      params: { ids: ids.join(',') },
      responseType: 'blob'
    }
  );
  return response.data;
};

export const enviarRecordatorio = async (id, tipo) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/solicitudes/${id}/recordatorio`,
    {},
    { params: { tipo } }
  );
  return response.data;
};
```

#### Tarea 3.2: Reemplazar mock data en Solicitudes.jsx
```
Cambios:

// ANTES
const cargarSolicitudes = async () => {
  // TODO: Llamar a API
  setSolicitudes([{ mock data... }]);
};

// DESPUÉS
const cargarSolicitudes = async () => {
  try {
    setIsLoading(true);
    const response = await bolsasService.obtenerSolicitudes();
    setSolicitudes(response.data || []);
    setError(null);
  } catch (error) {
    setError(error.message);
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
  }
};

// Agregar useEffect para cargar al montar
useEffect(() => {
  cargarSolicitudes();
}, []);

// Agregar efecto para búsqueda con debounce
useEffect(() => {
  const timer = setTimeout(() => {
    buscarSolicitudes();
  }, 300);
  return () => clearTimeout(timer);
}, [searchTerm, filtroBolsa, filtroRed, filtroEspecialidad, filtroEstado]);
```

#### Tarea 3.3: Implementar funciones de búsqueda y filtrado
```
Función búsquedaFiltrada():
1. Si hay searchTerm: llamar a bolsasService.obtenerSolicitudes()
   con params: { nombre, dni, especialidad }
2. Si hay filtros: filtrar localmente o en servidor
3. Actualizar estado con resultados

Función cambiarTelefono():
1. Mostrar modal con input para nuevo teléfono
2. Validar teléfono (regex)
3. Llamar a bolsasService.cambiarTelefono(id, nuevoTelefono)
4. Actualizar tabla con nuevo valor
5. Mostrar toast de éxito/error

Función asignarGestora():
1. Mostrar modal con dropdown de gestoras
2. Seleccionar gestora
3. Llamar a bolsasService.asignarAGestora(id, gestorId, gestoraNombre)
4. Actualizar tabla
5. Mostrar toast de éxito

Función descargarCSV():
1. Si hay selección: pasar IDs a descargarCSV()
2. Si no hay selección: usar todos los filtrados
3. Llamar a bolsasService.descargarCSV(ids)
4. Guardar blob como archivo .csv
```

#### Tarea 3.4: Agregar error handling y loading states
```
Estados:
├─ isLoading: boolean para mostrar spinner
├─ error: string para mostrar mensajes de error
├─ isLoadingAccion: boolean para acciones específicas
└─ successMessage: string para confirmaciones

Componentes visuales:
├─ Spinner durante cargarSolicitudes()
├─ Alert rojo si error
├─ Toast verde para éxito
├─ Deshabilitar botones durante carga
└─ Modal de confirmación para cambios críticos
```

### Fase 4: Base de Datos - Auditoría (1-2 commits)

#### Tarea 4.1: Crear tablas de auditoría
```
SQL Script:

CREATE TABLE dim_asignacion_bolsa_gestora (
  id_asignacion BIGSERIAL PRIMARY KEY,
  id_solicitud BIGINT NOT NULL,
  gestora_id BIGINT NOT NULL,
  coordinador_id BIGINT NOT NULL,
  fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notas_auditoria TEXT,
  FOREIGN KEY (id_solicitud) REFERENCES dim_solicitud_bolsa(id_solicitud),
  FOREIGN KEY (gestora_id) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (coordinador_id) REFERENCES usuarios(id_usuario)
);

CREATE TABLE dim_cambios_telefono (
  id BIGSERIAL PRIMARY KEY,
  id_solicitud BIGINT NOT NULL,
  usuario_id BIGINT NOT NULL,
  telefono_anterior VARCHAR(20),
  telefono_nuevo VARCHAR(20) NOT NULL,
  razon_cambio VARCHAR(255),
  fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_solicitud) REFERENCES dim_solicitud_bolsa(id_solicitud),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
);

-- Índices
CREATE INDEX idx_asignacion_solicitud ON dim_asignacion_bolsa_gestora(id_solicitud);
CREATE INDEX idx_asignacion_gestora ON dim_asignacion_bolsa_gestora(gestora_id);
CREATE INDEX idx_asignacion_fecha ON dim_asignacion_bolsa_gestora(fecha_asignacion);

CREATE INDEX idx_cambios_telefono_solicitud ON dim_cambios_telefono(id_solicitud);
CREATE INDEX idx_cambios_telefono_fecha ON dim_cambios_telefono(fecha_cambio);
```

#### Tarea 4.2: Ejecutar migración Flyway
```
Crear archivo: db/migration/V3_0_4__crear_auditorias_bolsas.sql
Contenido: Scripts de creación de tablas e índices
```

### Fase 5: Testing (2-3 commits)

#### Tarea 5.1: Tests Unitarios Backend
```
Test clases:
├─ SolicitudBolsasServiceTest
│  ├─ testAsignarAGestora_exitoso()
│  ├─ testCambiarTelefono_telefonoInvalido()
│  ├─ testExportarCSV_generaArchivoValido()
│  └─ testEnviarRecordatorio_validaEstado()
│
└─ BolsasControllerTest
   ├─ testObtenerSolicitudes_retorna200()
   ├─ testAsignarAGestora_requierePermiso()
   └─ testCambiarTelefono_valida_entrada()
```

#### Tarea 5.2: Tests Frontend
```
Test componentes:
├─ Solicitudes.test.jsx
│  ├─ Renderiza tabla correctamente
│  ├─ Carga datos de API
│  ├─ Filtros funcionan
│  ├─ Búsqueda funciona
│  ├─ Descarga CSV
│  └─ Asignación a gestora
```

#### Tarea 5.3: Tests Integración (E2E)
```
Flujo completo:
1. Cargar página /bolsas/solicitudes
2. Buscar paciente por DNI
3. Cambiar teléfono
4. Asignar a gestora
5. Descargar CSV
6. Verificar auditoría en BD
```

### Fase 6: Documentación (1 commit)

#### Tarea 6.1: Actualizar documentación
```
Archivos a actualizar:
├─ spec/01_Backend/08_modulo_bolsas_pacientes_completo.md
│  └─ Agregar sección de endpoints implementados
├─ CLAUDE.md
│  └─ Actualizar status a "Implementación Completada"
└─ checklist/01_Historial/01_changelog.md
   └─ Agregar versión v1.33.0 con cambios
```

---

## Consideraciones de Seguridad

### 1. Autenticación y Autorización

```
✅ IMPLEMENTAR:
├─ @PreAuthorize("hasRole('COORDINADOR_GESTION_CITAS')")
│  └─ Solo coordinadores pueden ver y distribuir
│
├─ @PreAuthorize("hasRole('GESTORA_CITAS')")
│  └─ Solo gestoras ven sus pacientes asignados
│
└─ MBAC en endpoints sensibles:
   ├─ cambiar-telefono (requiere permiso "editar")
   ├─ asignar (requiere permiso "editar" + "distribuir")
   └─ exportar (requiere permiso "exportar" si aplica)
```

### 2. Validación de Entrada

```
✅ VALIDAR:
├─ Teléfono: regex +51\d{9}, longitud 12
├─ DNI: numérico, sin guiones, 8 dígitos
├─ Nombre: no vacío, < 255 caracteres
├─ ID Solicitud: debe existir en BD
├─ ID Gestora: debe existir y tener rol GESTORA_CITAS
└─ Parámetros paginación: page >= 0, size <= 100
```

### 3. Auditoría Completa

```
✅ REGISTRAR en AuditLogService:
├─ Quién: usuario actual (JWT)
├─ Cuándo: timestamp actual
├─ Qué: acción realizada (cambiar_telefono, asignar, exportar)
├─ Dónde: /api/bolsas/solicitudes/{id}
└─ Valores anteriores y nuevos (cambios)

TABLAS:
├─ dim_asignacion_bolsa_gestora (para asignaciones)
└─ dim_cambios_telefono (para cambios de teléfono)
```

### 4. Protección de Datos Sensibles

```
✅ NO EXPONER:
├─ Contraseñas de usuarios
├─ Seguro social completo (sanitizar)
├─ Direcciones de pacientes (si aplica)
└─ Teléfono secundario del paciente

✅ ENCRIPTACIÓN:
├─ Datos sensibles en tránsito (HTTPS)
├─ Datos sensibles en reposo (si es requerido por compliance)
└─ Tokens JWT con expiración corta (1 hora)
```

### 5. Rate Limiting

```
✅ CONSIDERAR:
├─ Limitar exportaciones CSV (máx 100 registros/min)
├─ Limitar cambios de teléfono (máx 5/min por usuario)
├─ Limitar búsquedas (máx 10/seg)
└─ Usar interceptor en Axios para tokens expirados
```

---

## Riesgos y Mitigación

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|-----------|
| **Datos no sincronizados** | Alto | Media | WebSockets para actualización en tiempo real (Fase 2) |
| **Query N+1 en búsquedas** | Medio | Alta | Eager loading con @Query + @EntityGraph |
| **CSV con datos inconsistentes** | Medio | Baja | Transacciones READ_COMMITTED en exportación |
| **Teléfono duplicado** | Bajo | Baja | Validación regex + trimming en backend |
| **Permisos no aplicados** | Alto | Baja | Tests de autorización en cada endpoint |
| **Auditoría incompleta** | Medio | Baja | Triggering automático en BD + AuditLogService |
| **Performance con 150+ registros** | Medio | Baja | Paginación (30 items/página) + índices |
| **Frontend sin manejo de errores** | Medio | Alta | Try-catch + error states en componentes |

---

## Checklist de Implementación

### ✅ Pre-Implementación

- [ ] Revisar documentación actual (✅ COMPLETADA)
- [ ] Validar estructura frontend (✅ SOLICITUDES.JSX LISTO)
- [ ] Validar estructura backend (✅ CONTROLLER Y SERVICE EXISTEN)
- [ ] Validar BD (✅ TABLAS EXISTEN)
- [ ] Reunión de alineamiento con equipo
- [ ] Configurar branch para desarrollo (feature/bolsas-integration-v1)

### Fase 1: Backend Servicios

- [ ] Implementar asignarAGestora()
- [ ] Implementar cambiarTelefono()
- [ ] Implementar exportarCSV()
- [ ] Implementar enviarRecordatorio()
- [ ] Tests unitarios para nuevos métodos
- [ ] Verificar auditoría en logs

### Fase 2: Backend Controller

- [ ] Agregar endpoints @PatchMapping /asignar
- [ ] Agregar endpoints @PutMapping /cambiar-telefono
- [ ] Agregar endpoints @GetMapping /exportar
- [ ] Agregar endpoints @PostMapping /recordatorio
- [ ] Validar @PreAuthorize en cada endpoint
- [ ] Validar @CheckMBACPermission
- [ ] Tests de controller

### Fase 3: Frontend Service

- [ ] Agregar asignarAGestora() a bolsasService.js
- [ ] Agregar cambiarTelefono() a bolsasService.js
- [ ] Agregar descargarCSV() a bolsasService.js
- [ ] Agregar enviarRecordatorio() a bolsasService.js
- [ ] Verificar headers y tipos de respuesta

### Fase 3: Frontend Componente

- [ ] Reemplazar mock data con API real
- [ ] Implementar búsqueda con debounce
- [ ] Implementar filtros dinámicos
- [ ] Implementar cambiarTelefono() handler
- [ ] Implementar asignarGestora() handler
- [ ] Implementar descargarCSV() handler
- [ ] Agregar error handling
- [ ] Agregar loading states
- [ ] Agregar confirmación modales

### Fase 4: Base de Datos

- [ ] Crear tabla dim_asignacion_bolsa_gestora
- [ ] Crear tabla dim_cambios_telefono
- [ ] Crear índices de auditoría
- [ ] Crear migración Flyway
- [ ] Verificar relaciones FK

### Fase 5: Testing

- [ ] Tests unitarios backend (métodos nuevos)
- [ ] Tests controller (endpoints nuevos)
- [ ] Tests integración (flujo completo)
- [ ] Tests frontend (componente)
- [ ] Tests E2E (usuario final)

### Fase 6: Documentación

- [ ] Actualizar documentación técnica
- [ ] Actualizar CLAUDE.md
- [ ] Actualizar changelog
- [ ] Crear ejemplos cURL de endpoints
- [ ] Documentar cambios en BD

### Post-Implementación

- [ ] Code review
- [ ] QA testing
- [ ] Performance testing (150+ registros)
- [ ] Security audit
- [ ] Merge a main
- [ ] Deploy a staging
- [ ] Deploy a producción

---

## Resumen Ejecutivo

### Problema
Conectar frontend `Solicitudes.jsx` (UI/UX completamente terminada) con backend para cargar datos reales de pacientes en bolsas desde PostgreSQL.

### Solución
Implementar endpoints REST faltantes en backend + conectar frontend con API + crear auditoría en BD.

### Esfuerzo Estimado
- **Backend:** 4-5 commits (14-16 horas)
- **Frontend:** 3-4 commits (8-10 horas)
- **Base de Datos:** 1-2 commits (2-3 horas)
- **Testing:** 2-3 commits (6-8 horas)
- **Documentación:** 1 commit (2 horas)
- **Total:** 32-39 horas = 4-5 días de desarrollo

### Riesgos Críticos
1. Permisos MBAC no aplicados correctamente
2. Performance con 150+ registros
3. Auditoría incompleta

### Próximos Pasos
1. ✅ **Aprobación de plan** por el equipo
2. ✅ **Crear rama** feature/bolsas-integration-v1
3. ✅ **Iniciar Fase 1** (Backend servicios)
4. ✅ **Testing continuo** en cada fase

---

**Documento preparado por:** Claude Code - Agent Architect
**Fecha:** 2026-01-22
**Versión:** v1.0.0
**Status:** READY FOR IMPLEMENTATION
