# Plan de Implementación: Módulo de Trazabilidad Clínica de Asegurados

**Proyecto:** CENATE - Sistema de Telemedicina EsSalud
**Versión:** 2.0.0
**Fecha:** 2026-01-03
**Estado:** 📋 Planificación

---

## 📊 RESUMEN EJECUTIVO

### Objetivo
Implementar un sistema completo de trazabilidad clínica que permita registrar, consultar y gestionar el historial de atenciones médicas de los 4.6M asegurados de EsSalud.

### Alcance del Módulo
- ✅ Modal "Detalles del Asegurado" transformado en **3 pestañas**
- ✅ Médicos registran atenciones con signos vitales, diagnósticos e interconsultas
- ✅ Coordinadores generan reportes de trazabilidad
- ✅ Enfermería agrega observaciones de seguimiento
- ✅ 2 catálogos CRUD administrables (Estrategias + Tipos de Atención)

### Componentes a Desarrollar

| Capa | Componentes | Archivos |
|------|-------------|----------|
| **Base de Datos** | 3 tablas nuevas + índices + triggers | 1 script SQL |
| **Backend** | 9 modelos + 9 DTOs + 3 repos + 3 services + 3 controllers | ~25 archivos Java |
| **Frontend** | 1 modificación + 8 componentes nuevos + 3 servicios API | ~12 archivos JSX/JS |
| **Permisos MBAC** | 3 páginas nuevas con permisos por rol | Script SQL incluido |

### Estimación de Tiempo
**Total:** 24-31 horas (~3-4 días de desarrollo)

---

## 🗄️ FASE 1: BASE DE DATOS Y CATÁLOGOS (2-3 horas)

### 1.1 Script SQL de Creación

**Archivo:** `/spec/04_BaseDatos/06_scripts/025_crear_modulo_trazabilidad_clinica.sql`

#### Tareas:
- [ ] Crear tabla `dim_estrategia_institucional`
  - [ ] 7 datos iniciales (CENATE, CENACRON, CENAPSI, etc.)
  - [ ] 2 índices (estado, sigla)
- [ ] Crear tabla `dim_tipo_atencion_telemedicina`
  - [ ] 6 datos iniciales (Teleconsulta, Telemonitoreo, etc.)
  - [ ] 2 índices (estado, sigla)
- [ ] Crear tabla `atencion_clinica` (tabla principal)
  - [ ] 37 columnas (datos atención + signos vitales + trazabilidad)
  - [ ] 7 foreign keys
  - [ ] 3 CHECK constraints
- [ ] Crear 9 índices para performance
  - [ ] `idx_atencion_asegurado` (más importante)
  - [ ] `idx_atencion_personal_creador`
  - [ ] `idx_atencion_fecha`
  - [ ] 6 índices adicionales
- [ ] Crear 2 triggers
  - [ ] `trg_calcular_imc_atencion` (calcula IMC automáticamente)
  - [ ] `trg_actualizar_timestamp_atencion` (actualiza `updated_at`)
- [ ] Configurar permisos MBAC
  - [ ] Página `/atenciones-clinicas` (MEDICO, COORDINADOR, ADMIN, SUPERADMIN, ENFERMERIA)
  - [ ] Página `/admin/estrategias-institucionales` (ADMIN, SUPERADMIN)
  - [ ] Página `/admin/tipos-atencion-telemedicina` (ADMIN, SUPERADMIN)

#### Comando de Ejecución:
```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/04_BaseDatos/06_scripts/025_crear_modulo_trazabilidad_clinica.sql
```

#### Verificación:
- [ ] Ejecutar queries de verificación incluidas en el script
- [ ] Confirmar 3 tablas creadas
- [ ] Confirmar 13+ índices creados
- [ ] Confirmar 7 estrategias + 6 tipos de atención insertados
- [ ] Confirmar 3 páginas MBAC creadas

---

## 🔧 FASE 2: BACKEND - CATÁLOGOS (3-4 horas)

### 2.1 Modelos JPA

**Ubicación:** `/backend/src/main/java/com/styp/cenate/model/`

#### Tareas:
- [ ] `EstrategiaInstitucional.java` (85 líneas)
  - [ ] Campos: id, código, descripción, sigla, estado
  - [ ] Anotaciones JPA: `@Entity`, `@Table`, `@Id`
  - [ ] Método `isActiva()`
- [ ] `TipoAtencionTelemedicina.java` (95 líneas)
  - [ ] Campos: id, código, descripción, sigla, requiere_profesional, estado
  - [ ] Anotaciones JPA completas
  - [ ] Método `isActivo()`

### 2.2 DTOs

**Ubicación:** `/backend/src/main/java/com/styp/cenate/dto/`

#### Tareas:
- [ ] `EstrategiaInstitucionalDTO.java`
  - [ ] Validaciones con `@NotBlank`, `@Size`, `@Pattern`
- [ ] `TipoAtencionTelemedicinaDTO.java`
  - [ ] Validaciones completas

### 2.3 Repositories

**Ubicación:** `/backend/src/main/java/com/styp/cenate/repository/`

#### Tareas:
- [ ] `EstrategiaInstitucionalRepository.java`
  - [ ] `findByEstado(String estado)`
  - [ ] `findByCodEstrategia(String)`
  - [ ] `findBySigla(String)`
  - [ ] `existsByCodEstrategia(String)`
  - [ ] `existsBySigla(String)`
- [ ] `TipoAtencionTelemedicinaRepository.java`
  - [ ] Mismos métodos que EstrategiaInstitucionalRepository

### 2.4 Services

**Ubicación:** `/backend/src/main/java/com/styp/cenate/service/`

#### Tareas:
- [ ] Interface `IEstrategiaInstitucionalService.java`
  - [ ] Métodos CRUD: obtenerTodos, obtenerActivos, obtenerPorId, crear, actualizar, eliminar
- [ ] Implementación `EstrategiaInstitucionalServiceImpl.java`
  - [ ] Validaciones de negocio
  - [ ] Manejo de excepciones (`ResourceNotFoundException`)
- [ ] Interface `ITipoAtencionTelemedicinaService.java`
  - [ ] Métodos CRUD completos
- [ ] Implementación `TipoAtencionTelemedicinaServiceImpl.java`
  - [ ] Validaciones completas

### 2.5 Controllers REST

**Ubicación:** `/backend/src/main/java/com/styp/cenate/api/admin/`

#### Tareas:
- [ ] `EstrategiaInstitucionalController.java`
  - [ ] Base URL: `/api/admin/estrategias-institucionales`
  - [ ] 6 endpoints: GET todos, GET activos, GET por ID, POST, PUT, DELETE
  - [ ] `@CheckMBACPermission` en cada endpoint
  - [ ] Logs con emojis (📋, ➕, ✏️, 🗑️)
- [ ] `TipoAtencionTelemedicinaController.java`
  - [ ] Base URL: `/api/admin/tipos-atencion-telemedicina`
  - [ ] 6 endpoints completos
  - [ ] MBAC + Logs

### 2.6 Testing Backend - Catálogos

#### Tareas:
- [ ] Probar endpoint: `GET /api/admin/estrategias-institucionales`
  - [ ] Debe retornar 7 estrategias
- [ ] Probar endpoint: `GET /api/admin/estrategias-institucionales/activas`
  - [ ] Debe retornar solo estrategias con `estado = 'A'`
- [ ] Probar endpoint: `POST /api/admin/estrategias-institucionales`
  - [ ] Crear nueva estrategia
  - [ ] Validar que no permite duplicados
- [ ] Probar endpoint: `PUT /api/admin/estrategias-institucionales/{id}`
  - [ ] Actualizar descripción y estado
- [ ] Probar endpoint: `DELETE /api/admin/estrategias-institucionales/{id}`
  - [ ] Eliminar estrategia
- [ ] Repetir testing para `TipoAtencionTelemedicinaController`

---

## 🩺 FASE 3: BACKEND - ATENCIONES CLÍNICAS (5-6 horas)

### 3.1 Modelo JPA Principal

**Archivo:** `/backend/src/main/java/com/styp/cenate/model/AtencionClinica.java` (250 líneas)

#### Tareas:
- [ ] Campos básicos (37 campos)
  - [ ] Identificador: `idAtencion`
  - [ ] Relaciones: `asegurado`, `ipress`, `especialidad`, `estrategia`, `tipoAtencion`, `personalCreador`, `personalModificador`
  - [ ] Datos clínicos: `motivo_consulta`, `antecedentes`, `diagnostico`, `resultados_clinicos`, `observaciones`, `datos_seguimiento`
  - [ ] Signos vitales: `presion_arterial`, `temperatura`, `peso_kg`, `talla_cm`, `imc`, `saturacion_o2`, `frecuencia_cardiaca`, `frecuencia_respiratoria`
  - [ ] Interconsulta: `tiene_orden_interconsulta`, `id_especialidad_interconsulta`, `modalidad_interconsulta`
  - [ ] Telemonitoreo: `requiere_telemonitoreo`
  - [ ] Auditoría: `created_at`, `updated_at`
- [ ] Relaciones JPA
  - [ ] `@ManyToOne(fetch = LAZY)` para todas las FKs
  - [ ] `@JoinColumn` con nombres exactos de columnas BD
- [ ] Métodos utilitarios
  - [ ] `getNombrePaciente()`
  - [ ] `getDniPaciente()`
  - [ ] `getNombreIpress()`
  - [ ] `tieneSignosVitales()`
  - [ ] `tieneInterconsultaCompleta()`

### 3.2 DTOs de Atenciones

**Ubicación:** `/backend/src/main/java/com/styp/cenate/dto/`

#### Tareas:
- [ ] `AtencionClinicaDTO.java` (50+ campos)
  - [ ] Todos los campos de la entidad + datos calculados
  - [ ] Nombres de IPRESS, especialidades, estrategias, personal
  - [ ] Edad del paciente (calculada)
  - [ ] Flags: `tieneSignosVitales`, `tieneInterconsultaCompleta`
- [ ] `AtencionClinicaCreateDTO.java` (35+ campos + validaciones)
  - [ ] `@NotBlank` para campos obligatorios
  - [ ] `@NotNull` para `pkAsegurado`, `fechaAtencion`, `idIpress`, `idTipoAtencion`
  - [ ] `@Positive` para IDs
  - [ ] `@DecimalMin/@DecimalMax` para signos vitales
  - [ ] `@Pattern` para presión arterial ("120/80")
  - [ ] `@Size` para campos TEXT (max 5000)
- [ ] `AtencionClinicaUpdateDTO.java`
  - [ ] Similar a CreateDTO pero campos opcionales
  - [ ] Permite actualizaciones parciales
- [ ] `ObservacionEnfermeriaDTO.java`
  - [ ] `observacion` (obligatorio, 10-5000 caracteres)
  - [ ] `datosSeguimiento` (opcional)

### 3.3 Repository de Atenciones

**Archivo:** `/backend/src/main/java/com/styp/cenate/repository/AtencionClinicaRepository.java`

#### Tareas:
- [ ] Query: `findByPkAseguradoOrderByFechaAtencionDesc(String, Pageable)`
  - [ ] Query JPQL con JOIN a asegurado
- [ ] Query: `findByIdPersonalCreador(Long, Pageable)`
  - [ ] Para médicos que ven solo sus atenciones
- [ ] Query: `findByFechaAtencionBetween(OffsetDateTime, OffsetDateTime, Pageable)`
- [ ] Query: `findByIdIpress(Long, Pageable)`
- [ ] Query: `findByIdEstrategia(Long, Pageable)`
- [ ] Query: `findByIdTipoAtencion(Long, Pageable)`
- [ ] Query: `findConInterconsulta(Pageable)`
  - [ ] Filtro: `tiene_orden_interconsulta = TRUE`
- [ ] Query: `findConTelemonitoreo(Pageable)`
  - [ ] Filtro: `requiere_telemonitoreo = TRUE`
- [ ] Query: `busquedaAvanzada(...)` con 6 parámetros opcionales
- [ ] Método: `countByAsegurado_PkAsegurado(String)`
- [ ] Query: `findUltimaAtencionPorAsegurado(String)`

### 3.4 Service de Atenciones

**Archivos:**
- `/backend/src/main/java/com/styp/cenate/service/atencion/IAtencionClinicaService.java` (interface)
- `/backend/src/main/java/com/styp/cenate/service/atencion/AtencionClinicaServiceImpl.java` (implementación, 300+ líneas)

#### Tareas:
- [ ] Método `obtenerAtencionesPorAsegurado(String pkAsegurado, Pageable)`
  - [ ] Retorna `Page<AtencionClinicaDTO>`
  - [ ] Convierte entidades a DTOs
- [ ] Método `obtenerAtencionDetalle(Long idAtencion)`
  - [ ] Lanza `ResourceNotFoundException` si no existe
- [ ] Método `crearAtencion(AtencionClinicaCreateDTO, Long idPersonalCreador)`
  - [ ] Validar que asegurado existe
  - [ ] Validar que IPRESS existe
  - [ ] Validar que tipo de atención existe
  - [ ] Validar que profesional creador existe
  - [ ] Crear entidad con Builder
  - [ ] Guardar en BD
  - [ ] Retornar DTO
- [ ] Método `actualizarAtencion(Long, AtencionClinicaUpdateDTO, Long idPersonalModificador, String rolUsuario)`
  - [ ] Validar permisos: MEDICO solo puede editar sus atenciones
  - [ ] Lanzar `UnauthorizedException` si no tiene permiso
  - [ ] Actualizar campos solo si vienen en el DTO
  - [ ] Actualizar `personalModificador`
- [ ] Método `agregarObservacionEnfermeria(Long, ObservacionEnfermeriaDTO, Long idPersonal)`
  - [ ] Concatenar observación con timestamp
  - [ ] Formato: `[ENFERMERÍA - 2026-01-03T10:30:00Z] Observación...`
- [ ] Método `eliminarAtencion(Long idAtencion)`
  - [ ] Solo ADMIN/SUPERADMIN
- [ ] Método auxiliar `convertirADTO(AtencionClinica)`
  - [ ] Mapear todos los campos
  - [ ] Calcular edad del paciente
  - [ ] Obtener nombres de entidades relacionadas
- [ ] Método auxiliar `calcularEdad(LocalDate fechaNacimiento)`
  - [ ] Usar `Period.between()`

### 3.5 Controller de Atenciones

**Archivo:** `/backend/src/main/java/com/styp/cenate/api/atencion/AtencionClinicaController.java` (180 líneas)

#### Tareas:
- [ ] Endpoint: `GET /api/atenciones-clinicas/asegurado/{pkAsegurado}`
  - [ ] Parámetros: `page`, `size`
  - [ ] `@CheckMBACPermission(pagina = "/atenciones-clinicas", accion = "ver")`
  - [ ] Retorna `Page<AtencionClinicaDTO>`
- [ ] Endpoint: `GET /api/atenciones-clinicas/{id}`
  - [ ] Permiso: `ver`
  - [ ] Retorna `AtencionClinicaDTO`
- [ ] Endpoint: `POST /api/atenciones-clinicas`
  - [ ] Permiso: `crear`
  - [ ] Body: `@Valid AtencionClinicaCreateDTO`
  - [ ] Obtener `idPersonalCreador` desde `Authentication`
  - [ ] Auditoría con `AuditLogService` (evento `CREATE`)
- [ ] Endpoint: `PUT /api/atenciones-clinicas/{id}`
  - [ ] Permiso: `editar`
  - [ ] Body: `@Valid AtencionClinicaUpdateDTO`
  - [ ] Obtener rol del usuario para validar permisos
  - [ ] Auditoría (evento `UPDATE`)
- [ ] Endpoint: `PUT /api/atenciones-clinicas/{id}/observacion-enfermeria`
  - [ ] Permiso: `editar`
  - [ ] Validar que usuario tiene rol `ENFERMERIA`
  - [ ] Body: `@Valid ObservacionEnfermeriaDTO`
  - [ ] Auditoría (evento `UPDATE_ENFERMERIA`)
- [ ] Endpoint: `DELETE /api/atenciones-clinicas/{id}`
  - [ ] Permiso: `eliminar`
  - [ ] Solo ADMIN/SUPERADMIN
  - [ ] Auditoría (evento `DELETE`)

### 3.6 Testing Backend - Atenciones

#### Tareas:
- [ ] **MEDICO** - Crear atención propia
  - [ ] POST con token de MEDICO
  - [ ] Debe crear atención con `id_personal_creador = id del médico`
- [ ] **MEDICO** - Editar atención propia
  - [ ] PUT con token de MEDICO
  - [ ] Debe permitir actualizar
- [ ] **MEDICO** - Intentar editar atención de otro médico
  - [ ] PUT con token de MEDICO A editando atención de MEDICO B
  - [ ] Debe retornar 403 Forbidden
- [ ] **COORDINADOR** - Ver todas las atenciones
  - [ ] GET con token de COORDINADOR
  - [ ] Debe retornar todas las atenciones sin filtro
- [ ] **COORDINADOR** - Intentar crear atención
  - [ ] POST con token de COORDINADOR
  - [ ] Debe retornar 403 Forbidden (no tiene permiso `crear`)
- [ ] **ENFERMERIA** - Agregar observación
  - [ ] PUT `/observacion-enfermeria` con token de ENFERMERIA
  - [ ] Debe agregar observación
- [ ] **ENFERMERIA** - Intentar crear atención
  - [ ] POST con token de ENFERMERIA
  - [ ] Debe retornar 403 Forbidden
- [ ] **ADMIN** - CRUD completo
  - [ ] POST, PUT, DELETE con token de ADMIN
  - [ ] Todas las operaciones deben funcionar
- [ ] Verificar auditoría en `audit_logs`
  - [ ] Query: `SELECT * FROM audit_logs WHERE entidad = 'ATENCION_CLINICA' ORDER BY created_at DESC LIMIT 10`
  - [ ] Debe mostrar eventos `CREATE`, `UPDATE`, `DELETE`, `UPDATE_ENFERMERIA`

---

## 🎨 FASE 4: FRONTEND - SERVICIOS Y CATÁLOGOS (3-4 horas)

### 4.1 Servicios API

**Ubicación:** `/frontend/src/services/`

#### Tareas:
- [ ] `estrategiasService.js`
  - [ ] `obtenerTodas()`
  - [ ] `obtenerActivas()`
  - [ ] `obtenerPorId(id)`
  - [ ] `crear(data)`
  - [ ] `actualizar(id, data)`
  - [ ] `eliminar(id)`
- [ ] `tiposAtencionService.js`
  - [ ] Mismos métodos que estrategiasService
- [ ] `atencionesClinicasService.js`
  - [ ] `obtenerPorAsegurado(pkAsegurado, page, size)`
  - [ ] `obtenerDetalle(idAtencion)`
  - [ ] `crear(atencionData)`
  - [ ] `actualizar(idAtencion, atencionData)`
  - [ ] `agregarObservacionEnfermeria(idAtencion, observacionData)`
  - [ ] `eliminar(idAtencion)`

### 4.2 Componentes CRUD de Catálogos

**Patrón de referencia:** `/frontend/src/pages/admin/components/TipoProfesionalCRUD.jsx`

**Ubicación:** `/frontend/src/pages/admin/catalogs/`

#### Tareas - EstrategiasInstitucionales.jsx:
- [ ] Copiar estructura de `TipoProfesionalCRUD.jsx`
- [ ] Cambiar servicio a `estrategiasService`
- [ ] Cambiar campos del formulario:
  - [ ] `codEstrategia` (código)
  - [ ] `descEstrategia` (descripción)
  - [ ] `sigla` (sigla)
  - [ ] `estado` (A/I)
- [ ] Modal de crear/editar con 2 columnas
- [ ] Tabla con columnas: Código, Descripción, Sigla, Estado, Acciones
- [ ] Botón toggle estado (A ↔ I)
- [ ] Buscador en tiempo real
- [ ] Botón "Actualizar" para recargar datos
- [ ] Validaciones:
  - [ ] No permitir código duplicado
  - [ ] No permitir sigla duplicada
  - [ ] Convertir descripción y sigla a mayúsculas

#### Tareas - TiposAtencionTelemedicina.jsx:
- [ ] Similar a EstrategiasInstitucionales.jsx
- [ ] Campos adicionales:
  - [ ] `requiereProfesional` (checkbox)
- [ ] Tabla con columna extra: "Requiere Profesional"
- [ ] Badge visual para `requiereProfesional` (Sí/No)

#### Integración en Admin:
- [ ] Agregar tabs en `/frontend/src/pages/admin/UsersManagement.jsx`
  - [ ] Tab existente: "Tipo de Profesional"
  - [ ] **NUEVO** Tab: "Estrategias Institucionales"
  - [ ] **NUEVO** Tab: "Tipos de Atención Telemedicina"
- [ ] Importar componentes:
  ```jsx
  import EstrategiasInstitucionales from './catalogs/EstrategiasInstitucionales';
  import TiposAtencionTelemedicina from './catalogs/TiposAtencionTelemedicina';
  ```

### 4.3 Testing Frontend - Catálogos

#### Tareas:
- [ ] Probar CRUD completo de Estrategias:
  - [ ] Crear nueva estrategia "EST-008 - Programa Oncológico - PROCON"
  - [ ] Editar estrategia existente
  - [ ] Cambiar estado de A a I
  - [ ] Intentar crear estrategia con código duplicado (debe mostrar error)
  - [ ] Eliminar estrategia
- [ ] Probar CRUD completo de Tipos de Atención:
  - [ ] Crear nuevo tipo "TAT-007 - Consulta Virtual - VIRTUAL"
  - [ ] Editar tipo existente
  - [ ] Toggle checkbox "Requiere Profesional"
  - [ ] Eliminar tipo
- [ ] Verificar permisos:
  - [ ] Solo ADMIN y SUPERADMIN pueden acceder a los tabs
  - [ ] MEDICO/COORDINADOR/ENFERMERIA no ven los tabs

---

## 📱 FASE 5: FRONTEND - MODAL CON PESTAÑAS (4-5 horas)

### 5.1 Modificar BuscarAsegurado.jsx

**Archivo:** `/frontend/src/pages/asegurados/BuscarAsegurado.jsx` (líneas 759-946)

#### Tareas:
- [ ] Instalar librería de Tabs (si no existe)
  - [ ] Opción 1: Usar `@headlessui/react` → `<Tab.Group>`
  - [ ] Opción 2: Crear tabs manual con `useState('paciente')`
- [ ] Importar iconos:
  ```jsx
  import { User, Building2, FileText } from 'lucide-react';
  ```
- [ ] Agregar state para tab activa (si manual):
  ```jsx
  const [tabActiva, setTabActiva] = useState('paciente');
  ```
- [ ] Modificar modal (líneas 759-946):
  - [ ] Mantener header sin cambios
  - [ ] Reemplazar contenido del body con estructura de tabs
  - [ ] Mantener footer sin cambios
- [ ] **Pestaña 1: "Información del Paciente"**
  - [ ] Mover contenido actual (líneas 778-876)
  - [ ] Sin cambios en el contenido
- [ ] **Pestaña 2: "Centro de Adscripción"**
  - [ ] Mover contenido actual (líneas 878-931)
  - [ ] Sin cambios en el contenido
- [ ] **Pestaña 3: "Antecedentes Clínicos"** (NUEVO)
  - [ ] Importar componente `HistorialAtencionesTab`
  - [ ] Pasar prop: `pkAsegurado={detalleAsegurado.asegurado.pkAsegurado}`
- [ ] Estilo de tabs:
  - [ ] Grid de 3 columnas
  - [ ] Tab activa: fondo azul, texto blanco
  - [ ] Tab inactiva: fondo gris claro, texto gris oscuro
  - [ ] Transición suave entre tabs

### 5.2 Testing Modal con Pestañas

#### Tareas:
- [ ] Probar navegación entre pestañas
  - [ ] Click en "Información del Paciente" → debe mostrar datos del paciente
  - [ ] Click en "Centro de Adscripción" → debe mostrar datos de IPRESS
  - [ ] Click en "Antecedentes Clínicos" → debe cargar componente de historial
- [ ] Verificar que los datos se mantienen al cambiar de pestaña
- [ ] Verificar diseño responsive (mobile, tablet, desktop)
- [ ] Probar con asegurado que tiene atenciones registradas
- [ ] Probar con asegurado que NO tiene atenciones (debe mostrar mensaje vacío)

---

## 🩺 FASE 6: FRONTEND - HISTORIAL DE ATENCIONES (5-6 horas)

### 6.1 Componente Principal del Historial

**Archivo:** `/frontend/src/components/trazabilidad/HistorialAtencionesTab.jsx` (180 líneas)

#### Tareas:
- [ ] Estados:
  - [ ] `atenciones` (array)
  - [ ] `loading` (boolean)
  - [ ] `error` (string | null)
  - [ ] `selectedAtencion` (object | null)
  - [ ] `showDetalleModal` (boolean)
  - [ ] `showFormModal` (boolean)
- [ ] Hooks:
  - [ ] `useAuth()` → obtener usuario actual
  - [ ] `usePermisos()` → verificar permisos
- [ ] `useEffect` para cargar atenciones al montar
  - [ ] Llamar `atencionesClinicasService.obtenerPorAsegurado(pkAsegurado, 0, 50)`
- [ ] Función `cargarAtenciones()`
  - [ ] Setear `loading = true`
  - [ ] Llamar API
  - [ ] Setear `atenciones = data.content`
  - [ ] Setear `loading = false`
  - [ ] Manejar errores
- [ ] Función `handleVerDetalle(idAtencion)`
  - [ ] Llamar `atencionesClinicasService.obtenerDetalle(idAtencion)`
  - [ ] Setear `selectedAtencion`
  - [ ] Abrir modal de detalle
- [ ] Función `handleNuevaAtencion()`
  - [ ] Abrir modal de formulario
- [ ] Renderizado condicional:
  - [ ] Si `loading`: mostrar spinner
  - [ ] Si `error`: mostrar mensaje de error
  - [ ] Si `atenciones.length === 0`: mostrar mensaje "No hay atenciones"
  - [ ] Si `atenciones.length > 0`: mostrar timeline
- [ ] Timeline de atenciones:
  - [ ] Mapear `atenciones.map(atencion => ...)`
  - [ ] Cada item: tarjeta clickeable con:
    - [ ] Badges de tipo de atención (colores según sigla)
    - [ ] Badge de estrategia (si existe)
    - [ ] Diagnóstico (truncado si es muy largo)
    - [ ] Fecha + IPRESS + Especialidad (iconos)
    - [ ] Nombre del profesional que atendió
- [ ] Botón "Nueva Atención":
  - [ ] Visible solo si usuario tiene permiso `crear`
  - [ ] Icono `Plus`
  - [ ] Color azul (#0A5BA9)
- [ ] Integrar modales:
  - [ ] `<DetalleAtencionModal />` (si `showDetalleModal`)
  - [ ] `<FormularioAtencionModal />` (si `showFormModal`)

### 6.2 Modal de Detalle de Atención

**Archivo:** `/frontend/src/components/trazabilidad/DetalleAtencionModal.jsx` (350 líneas)

#### Tareas:
- [ ] Props:
  - [ ] `atencion` (object)
  - [ ] `onClose` (function)
  - [ ] `onActualizar` (function)
- [ ] Header del modal:
  - [ ] Título: "Detalle de Atención Clínica"
  - [ ] Badge con tipo de atención
  - [ ] Badge con estrategia (si existe)
  - [ ] Botón cerrar
- [ ] **Sección 1: Datos Generales**
  - [ ] Fecha de atención (formato largo)
  - [ ] IPRESS
  - [ ] Especialidad
  - [ ] Profesional que atendió
- [ ] **Sección 2: Datos Clínicos**
  - [ ] Motivo de consulta (textarea solo lectura)
  - [ ] Antecedentes (textarea solo lectura)
  - [ ] Diagnóstico (textarea solo lectura, destacado)
  - [ ] Resultados clínicos (textarea solo lectura)
  - [ ] Observaciones generales (textarea solo lectura)
  - [ ] Datos de seguimiento (textarea solo lectura)
- [ ] **Sección 3: Signos Vitales** (componente `SignosVitalesCard`)
  - [ ] Presión arterial (icono corazón)
  - [ ] Temperatura (icono termómetro)
  - [ ] Peso / Talla / IMC (icono balanza)
  - [ ] Saturación O2 (icono pulmón)
  - [ ] Frecuencia cardíaca (icono corazón latiendo)
  - [ ] Frecuencia respiratoria (icono pulmones)
  - [ ] Mostrar "N/A" si no hay datos
- [ ] **Sección 4: Interconsulta** (componente `InterconsultaCard`)
  - [ ] Solo mostrar si `tieneOrdenInterconsulta === true`
  - [ ] Especialidad destino
  - [ ] Modalidad (PRESENCIAL/VIRTUAL con badge)
- [ ] **Sección 5: Telemonitoreo**
  - [ ] Solo mostrar si `requiereTelemonitoreo === true`
  - [ ] Badge "Requiere Telemonitoreo"
- [ ] Footer con botones:
  - [ ] Botón "Editar" (solo si usuario tiene permiso + es creador o es ADMIN)
  - [ ] Botón "Agregar Observación" (solo si usuario es ENFERMERIA)
  - [ ] Botón "Cerrar"

### 6.3 Modal de Formulario de Atención

**Archivo:** `/frontend/src/components/trazabilidad/FormularioAtencionModal.jsx` (450 líneas)

#### Tareas:
- [ ] Props:
  - [ ] `pkAsegurado` (string)
  - [ ] `atencionInicial` (object | null) → para editar
  - [ ] `onClose` (function)
  - [ ] `onGuardar` (function)
- [ ] Estados:
  - [ ] `formData` (object con todos los campos)
  - [ ] `loading` (boolean)
  - [ ] `errors` (object)
  - [ ] `ipress` (array)
  - [ ] `especialidades` (array)
  - [ ] `estrategias` (array)
  - [ ] `tiposAtencion` (array)
- [ ] `useEffect` para cargar catálogos:
  - [ ] Cargar IPRESS desde API
  - [ ] Cargar especialidades desde API
  - [ ] Cargar estrategias desde `estrategiasService.obtenerActivas()`
  - [ ] Cargar tipos de atención desde `tiposAtencionService.obtenerActivos()`
- [ ] `useEffect` para llenar formulario al editar:
  - [ ] Si `atencionInicial` existe, llenar `formData`
- [ ] Función `handleChange(field, value)`
  - [ ] Actualizar `formData[field] = value`
  - [ ] Limpiar error de ese campo
- [ ] Función `handleSubmit()`
  - [ ] Validar campos obligatorios
  - [ ] Si es crear: `atencionesClinicasService.crear(formData)`
  - [ ] Si es editar: `atencionesClinicasService.actualizar(idAtencion, formData)`
  - [ ] Llamar `onGuardar()` si success
  - [ ] Mostrar mensaje de error si falla
- [ ] **Sección 1: Datos de Atención**
  - [ ] Fecha de atención (input date-time)
  - [ ] IPRESS (select)
  - [ ] Especialidad (select, opcional)
  - [ ] Tipo de atención (select, obligatorio)
  - [ ] Estrategia (select, opcional)
- [ ] **Sección 2: Datos Clínicos**
  - [ ] Motivo de consulta (textarea)
  - [ ] Antecedentes (textarea)
  - [ ] Diagnóstico (textarea)
  - [ ] Resultados clínicos (textarea)
  - [ ] Observaciones generales (textarea)
  - [ ] Datos de seguimiento (textarea)
- [ ] **Sección 3: Signos Vitales**
  - [ ] Presión arterial (input text, pattern "120/80")
  - [ ] Temperatura (input number, 30-45)
  - [ ] Peso (input number, 0-300)
  - [ ] Talla (input number, 0-250)
  - [ ] IMC (calculado automáticamente, solo lectura)
  - [ ] Saturación O2 (input number, 0-100)
  - [ ] Frecuencia cardíaca (input number, 30-250)
  - [ ] Frecuencia respiratoria (input number, 8-60)
- [ ] **Sección 4: Interconsulta**
  - [ ] Checkbox "Tiene orden de interconsulta"
  - [ ] Si checked:
    - [ ] Especialidad destino (select, obligatorio)
    - [ ] Modalidad (radio: PRESENCIAL / VIRTUAL, obligatorio)
- [ ] **Sección 5: Telemonitoreo**
  - [ ] Checkbox "Requiere telemonitoreo"
- [ ] Footer:
  - [ ] Botón "Cancelar"
  - [ ] Botón "Guardar" (con spinner si `loading`)

### 6.4 Componentes Auxiliares

#### `SignosVitalesCard.jsx` (80 líneas)
- [ ] Props: `atencion`
- [ ] Grid 2x4 con signos vitales
- [ ] Iconos de lucide-react
- [ ] Valores con unidades (°C, kg, cm, %, lpm, rpm)
- [ ] Color azul para valores normales
- [ ] Color rojo si fuera de rango (opcional)

#### `InterconsultaCard.jsx` (60 líneas)
- [ ] Props: `atencion`
- [ ] Solo renderizar si `tieneOrdenInterconsulta === true`
- [ ] Badge de modalidad (PRESENCIAL verde, VIRTUAL azul)
- [ ] Especialidad destino con icono

### 6.5 Testing Frontend - Historial de Atenciones

#### Tareas:
- [ ] **Usuario MEDICO** - Crear nueva atención
  - [ ] Login como MEDICO
  - [ ] Buscar asegurado
  - [ ] Abrir modal "Detalles del Asegurado"
  - [ ] Click en pestaña "Antecedentes Clínicos"
  - [ ] Click en "Nueva Atención"
  - [ ] Llenar formulario completo
  - [ ] Guardar
  - [ ] Verificar que aparece en timeline
- [ ] **Usuario MEDICO** - Ver detalle de atención
  - [ ] Click en atención del timeline
  - [ ] Debe abrir modal de detalle
  - [ ] Verificar que muestra todos los datos
- [ ] **Usuario MEDICO** - Editar su propia atención
  - [ ] Click en "Editar" en modal de detalle
  - [ ] Modificar diagnóstico
  - [ ] Guardar
  - [ ] Verificar cambios reflejados
- [ ] **Usuario MEDICO** - Intentar editar atención de otro médico
  - [ ] Buscar atención creada por otro médico
  - [ ] Botón "Editar" NO debe aparecer (o debe dar error 403)
- [ ] **Usuario COORDINADOR** - Ver todas las atenciones
  - [ ] Login como COORDINADOR
  - [ ] Buscar asegurado con atenciones
  - [ ] Debe ver todas las atenciones sin filtro
  - [ ] Botón "Nueva Atención" NO debe aparecer
  - [ ] Botón "Editar" NO debe aparecer
- [ ] **Usuario ENFERMERIA** - Agregar observación
  - [ ] Login como ENFERMERIA
  - [ ] Abrir detalle de atención
  - [ ] Click en "Agregar Observación"
  - [ ] Escribir observación
  - [ ] Guardar
  - [ ] Verificar que se agregó a observaciones generales
- [ ] **Validaciones del formulario**
  - [ ] Intentar guardar sin llenar campos obligatorios → debe mostrar errores
  - [ ] Intentar guardar con temperatura fuera de rango (50°C) → debe rechazar
  - [ ] Marcar "Tiene orden de interconsulta" sin llenar especialidad destino → debe rechazar
  - [ ] Presión arterial con formato incorrecto ("120") → debe rechazar (debe ser "120/80")
- [ ] **Cálculo de IMC**
  - [ ] Llenar peso: 75 kg
  - [ ] Llenar talla: 170 cm
  - [ ] IMC debe calcularse automáticamente: 25.95 (aprox)

---

## 📝 FASE 7: TESTING INTEGRAL Y DOCUMENTACIÓN (2-3 horas)

### 7.1 Testing Integral por Rol

#### Tareas - Rol MEDICO:
- [ ] Login con usuario MEDICO
- [ ] Crear 3 atenciones para diferentes asegurados
- [ ] Editar una de sus atenciones
- [ ] Intentar editar atención de otro médico → debe fallar
- [ ] Ver listado de sus propias atenciones
- [ ] Verificar que NO ve atenciones de otros médicos (solo las propias)

#### Tareas - Rol COORDINADOR:
- [ ] Login con usuario COORDINADOR
- [ ] Ver listado de TODAS las atenciones (sin filtro de creador)
- [ ] Intentar crear atención → debe fallar (no tiene permiso `crear`)
- [ ] Intentar editar atención → debe fallar (no tiene permiso `editar`)
- [ ] Exportar reporte de atenciones (si se implementa)

#### Tareas - Rol ENFERMERIA:
- [ ] Login con usuario ENFERMERIA
- [ ] Ver atención de cualquier asegurado
- [ ] Agregar observación de seguimiento
- [ ] Verificar que observación se guardó con timestamp
- [ ] Intentar crear atención → debe fallar
- [ ] Intentar editar diagnóstico → debe fallar (solo puede agregar observaciones)

#### Tareas - Rol ADMIN:
- [ ] Login con usuario ADMIN
- [ ] Crear atención para asegurado
- [ ] Editar atención de cualquier médico
- [ ] Eliminar atención
- [ ] Crear nueva estrategia institucional
- [ ] Crear nuevo tipo de atención

#### Tareas - Rol SUPERADMIN:
- [ ] Todas las operaciones de ADMIN deben funcionar
- [ ] CRUD completo de catálogos

### 7.2 Verificación de Auditoría

#### Tareas:
- [ ] Conectar a PostgreSQL
- [ ] Query: `SELECT * FROM audit_logs WHERE entidad IN ('ATENCION_CLINICA', 'ESTRATEGIA_INSTITUCIONAL', 'TIPO_ATENCION_TELEMEDICINA') ORDER BY created_at DESC LIMIT 50`
- [ ] Verificar eventos:
  - [ ] `CREATE` - Creación de atención (debe tener `id_usuario`, `entidad_id`, `detalles`)
  - [ ] `UPDATE` - Actualización de atención
  - [ ] `UPDATE_ENFERMERIA` - Observación de enfermería
  - [ ] `DELETE` - Eliminación de atención
  - [ ] `CREATE` - Creación de estrategia
  - [ ] `UPDATE` - Actualización de estrategia
  - [ ] `DELETE` - Eliminación de estrategia
- [ ] Verificar que todos los eventos tienen:
  - [ ] `usuario_id` correcto
  - [ ] `timestamp` correcto
  - [ ] `accion` correcta
  - [ ] `detalles` descriptivos

### 7.3 Verificación de Performance

#### Tareas:
- [ ] Query: Listar atenciones de asegurado con 100+ atenciones
  - [ ] Verificar que usa índice `idx_atencion_asegurado`
  - [ ] Tiempo de respuesta < 500ms
- [ ] Query: Listar atenciones por profesional creador
  - [ ] Verificar que usa índice `idx_atencion_personal_creador`
  - [ ] Tiempo de respuesta < 500ms
- [ ] Query: Búsqueda avanzada con múltiples filtros
  - [ ] Verificar plan de ejecución con `EXPLAIN ANALYZE`
  - [ ] Tiempo de respuesta < 1 segundo

### 7.4 Actualización de Documentación

#### Tareas:
- [ ] **Changelog (`checklist/01_Historial/01_changelog.md`)**
  - [ ] Agregar sección `## v2.0.0 (2026-01-03)`
  - [ ] Subsección: `### Nuevas Funcionalidades`
    - [ ] Módulo de Trazabilidad Clínica de Asegurados
    - [ ] Modal "Detalles del Asegurado" con 3 pestañas
    - [ ] CRUD de Estrategias Institucionales
    - [ ] CRUD de Tipos de Atención Telemedicina
  - [ ] Subsección: `### Backend`
    - [ ] 3 tablas nuevas: `atencion_clinica`, `dim_estrategia_institucional`, `dim_tipo_atencion_telemedicina`
    - [ ] 9 modelos JPA, 9 DTOs, 3 repositories, 3 services, 3 controllers
    - [ ] 9 índices de performance
    - [ ] 2 triggers (cálculo IMC, timestamp)
  - [ ] Subsección: `### Frontend`
    - [ ] 8 componentes nuevos
    - [ ] 3 servicios API
    - [ ] Modal con pestañas (React Tabs)
  - [ ] Subsección: `### Permisos MBAC`
    - [ ] Página `/atenciones-clinicas` (5 roles)
    - [ ] Página `/admin/estrategias-institucionales` (2 roles)
    - [ ] Página `/admin/tipos-atencion-telemedicina` (2 roles)
  - [ ] Subsección: `### Testing`
    - [ ] Testing completo por roles
    - [ ] Verificación de auditoría
    - [ ] Verificación de performance

- [ ] **Nueva documentación (`spec/02_Modulos_Medicos/03_trazabilidad_clinica.md`)**
  - [ ] Sección: Introducción
    - [ ] Propósito del módulo
    - [ ] Alcance
  - [ ] Sección: Arquitectura
    - [ ] Diagrama de base de datos
    - [ ] Diagrama de componentes
  - [ ] Sección: Endpoints REST
    - [ ] Listar todos los endpoints con ejemplos de request/response
  - [ ] Sección: Permisos por Rol
    - [ ] Matriz de permisos
  - [ ] Sección: Flujos de Trabajo
    - [ ] Flujo: Médico crea atención
    - [ ] Flujo: Enfermería agrega observación
    - [ ] Flujo: Coordinador genera reporte
  - [ ] Sección: Modelo de Datos
    - [ ] Descripción de tablas
    - [ ] Descripción de índices
    - [ ] Descripción de triggers
  - [ ] Sección: Ejemplos de Uso
    - [ ] cURL examples
    - [ ] Postman collection (exportar)

- [ ] **Script SQL en documentación (`spec/04_BaseDatos/06_scripts/025_crear_modulo_trazabilidad_clinica.sql`)**
  - [ ] Ya creado en Fase 1
  - [ ] Verificar que está completo y comentado

### 7.5 Commit Final

#### Tareas:
- [ ] Git status para ver cambios
- [ ] Git add de todos los archivos nuevos:
  ```bash
  git add spec/04_BaseDatos/06_scripts/025_crear_modulo_trazabilidad_clinica.sql
  git add backend/src/main/java/com/styp/cenate/model/AtencionClinica.java
  # ... todos los demás archivos
  git add checklist/01_Historial/01_changelog.md
  git add spec/02_Modulos_Medicos/03_trazabilidad_clinica.md
  ```
- [ ] Git commit con mensaje detallado:
  ```bash
  git commit -m "$(cat <<'EOF'
  feat(Trazabilidad): Implementar módulo completo de Trazabilidad Clínica (v2.0.0)

  **Nuevas Funcionalidades:**
  - Módulo de Trazabilidad Clínica de Asegurados con historial completo
  - Modal "Detalles del Asegurado" transformado en 3 pestañas (Paciente, IPRESS, Antecedentes)
  - CRUD de Estrategias Institucionales (CENATE, CENACRON, etc.)
  - CRUD de Tipos de Atención Telemedicina (Teleconsulta, Telemonitoreo, etc.)

  **Backend:**
  - 3 tablas nuevas: atencion_clinica, dim_estrategia_institucional, dim_tipo_atencion_telemedicina
  - 9 modelos JPA, 9 DTOs, 3 repositories, 3 services, 3 controllers
  - 9 índices de performance optimizados
  - 2 triggers (cálculo automático IMC, actualización de timestamp)
  - Integración completa con AuditLogService

  **Frontend:**
  - 8 componentes nuevos de trazabilidad
  - 3 servicios API (atenciones, estrategias, tipos)
  - Modal con React Tabs (3 pestañas)
  - Timeline de atenciones con diseño institucional

  **Permisos MBAC:**
  - MEDICO: crear/editar solo sus atenciones
  - COORDINADOR: ver todas + reportes
  - ENFERMERIA: ver + agregar observaciones
  - ADMIN/SUPERADMIN: CRUD completo

  **Archivos modificados:**
  - Backend: 25+ archivos nuevos
  - Frontend: 12+ archivos nuevos
  - Base de datos: 1 script SQL completo
  - Documentación: changelog + nueva especificación

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
  EOF
  )"
  ```

---

## 📊 RESUMEN DE ENTREGABLES

### Base de Datos
- ✅ 3 tablas nuevas
- ✅ 13+ índices
- ✅ 2 triggers
- ✅ 3 páginas MBAC
- ✅ 7 estrategias + 6 tipos de atención (datos iniciales)

### Backend (Java/Spring Boot)
- ✅ 3 modelos JPA
- ✅ 6 DTOs
- ✅ 3 repositories
- ✅ 3 services (interfaces + implementaciones)
- ✅ 3 controllers REST
- ✅ ~25 archivos nuevos

### Frontend (React)
- ✅ 1 modificación (BuscarAsegurado.jsx)
- ✅ 8 componentes nuevos
- ✅ 3 servicios API
- ✅ ~12 archivos nuevos

### Documentación
- ✅ Changelog actualizado (v2.0.0)
- ✅ Nueva especificación (`03_trazabilidad_clinica.md`)
- ✅ Script SQL comentado

### Testing
- ✅ Testing por rol (5 roles)
- ✅ Verificación de auditoría
- ✅ Verificación de performance

---

**Estado del Plan:** 📋 Planificación
**Próximo paso:** Iniciar Fase 1 - Base de Datos y Catálogos

---

*Plan creado con Claude Code*
*EsSalud Perú - CENATE | Ing. Styp Canto Rondón*
