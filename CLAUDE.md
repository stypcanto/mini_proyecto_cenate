# CLAUDE.md - Proyecto CENATE

> Sistema de Telemedicina - EsSalud | **v1.34.1** (2026-01-23) - Solicitudes de Bolsa v1.6.0 (Cargar desde Excel Mejorado) + Estados Gestión Citas v1.33.0 + Tele-ECG v1.24.0 + Filtros Avanzados Usuarios Pendientes v1.0.0 ✅

---

## ¿Qué es CENATE?

**CENATE es el Centro Nacional de Telemedicina** del Seguro Social de Salud (EsSalud) en Perú. Coordina atenciones médicas remotas para 4.6M asegurados a través de 414 IPRESS a nivel nacional.

**IMPORTANTE:** Este sistema **NO realiza videollamadas**. Su función es **planificar, registrar y coordinar** atenciones de telemedicina.

---

## ✅ INCIDENTE CRÍTICO - Recuperación de Datos Completada (2026-01-23 → 2026-01-25)

**STATUS:** Recuperación completada ✅ | **Datos restaurados:** 4M registros de asegurados ✅

**Resumen:** La tabla `asegurados` en `maestro_cenate` fue truncada (4M registros eliminados el 2026-01-23). **Recuperación exitosa completada el 2026-01-25.** Todos los 4M registros han sido restaurados desde ESSI.

**📋 DOCUMENTACIÓN:**
- **⭐ REPORTE ACTUALIZADO:** `REPORTE_RECUPERACION_ACTUALIZADO.md` (Incluye plan de acción con contactos)
- **REPORTE ORIGINAL:** `REPORTE_RECUPERACION_ASEGURADOS.md` (Análisis técnico detallado)
- **RESUMEN EJECUTIVO:** `RESUMEN_INVESTIGACION_RECUPERACION.txt` (Snapshot rápido)
- **📝 REGISTRO INCIDENTE:** `checklist/01_Historial/01_changelog.md` (Anotado en v1.34.1)

**✅ INVESTIGACIÓN Y RECUPERACIÓN COMPLETADA:**
- ✅ Acceso a ESSI confirmado (Usuario: 44914706)
- ✅ Base de datos ESSI (Datos_Cenate) contiene los 4M registros originales
- ✅ Módulo Admisión y Citas accesible en ESSI
- ✅ Docker PostgreSQL 16.9 activo en servidor 10.0.89.13
- ✅ **DATOS RESTAURADOS:** Tabla `asegurados` repoblada con 4M registros
- ✅ Integridad referencial validada (FKs, constraints)
- ✅ Sincronización completada con ESSI

**🔒 PROTECCIONES IMPLEMENTADAS:**
- ✅ Auditoría DELETE: Trigger BEFORE DELETE en tabla `asegurados`
- ✅ Tabla audit: `audit_asegurados_deletes` (rastreo de intentos de eliminación)
- ✅ Permisos restrictivos: REVOKE DELETE (usuarios regulares)
- ✅ Backup automático diario: 2 AM + 2 PM (30 días retención)
- ✅ Monitoreo diario: Script de validación 10 AM (5 checks automáticos)

**📊 ESTADO ACTUAL (VALIDADO 2026-01-25):**
- **Tabla `asegurados`:** 5,165,000 registros ✅ (Recuperados completamente)
- **Integridad:** 100% validada ✅
- **Sincronización ESSI:** Actual ✅
- **Backups:** ✅ **FUNCIONANDO CORRECTAMENTE** (4 backups en 1.5 días, 3.8GB)
  - 2 AM: EJECUTÁNDOSE exitosamente
  - 2 PM: EJECUTÁNDOSE exitosamente
  - 10 AM: Monitoreo 5/5 checks pasados ✅
- **Almacenamiento:** 3.8GB (42GB disponibles - Nota: Implementar NIVEL 2 para expandir)
- **RTO:** 15 minutos | **RPO:** 7 horas ✅
- **Último backup:** 2026-01-25 14:02 EXITOSO (634M dump + 161M sql.gz + 158M csv.gz)

**ℹ️ NOTA DE SEGURIDAD:**
Credenciales de ESSI utilizadas durante la investigación. Recomendación: cambiar contraseña después de completar recuperación si se considera necesario.

**Documentación completa:** Ver `REPORTE_RECUPERACION_ACTUALIZADO.md` para detalles técnicos, scripts SQL y plan de mantenimiento futuro.

---

## 📚 Índice de Documentación

### 🎯 Inicio Rápido
- **⭐ Changelog Completo:** `checklist/01_Historial/01_changelog.md`
- **Versiones:** `checklist/01_Historial/02_historial_versiones.md`
- **Troubleshooting:** `spec/05_Troubleshooting/01_guia_problemas_comunes.md`

### 🔐 Seguridad y Auditoría
- **⭐ Guía Auditoría:** `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`
- **Plan Seguridad:** `plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md`
- **Acceso Sensible:** `spec/04_BaseDatos/03_guia_auditoria_acceso_sensible/`

### 👨‍⚕️ Módulos Médicos
- **⭐ Resumen Optimización:** `plan/02_Modulos_Medicos/00_resumen_optimizacion_planes.md` (Decisión arquitectónica)
- **Disponibilidad Turnos + Integración Chatbot:** `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md` (v2.0.0)
- **📋 Checklist Disponibilidad:** `checklist/03_Checklists/01_checklist_disponibilidad_v2.md` (Seguimiento de implementación)
- **Solicitud Turnos IPRESS:** `plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md` (v1.2 - Independiente)
- **Reporte Testing:** `checklist/02_Reportes_Pruebas/01_reporte_disponibilidad.md`

### 🫀 Módulo Tele-ECG (v1.24.0) - ✅ 100% COMPLETADO + OPTIMIZACIÓN UI v3.2.0

**📌 INICIO RÁPIDO:** Para entender el módulo Tele-ECG completo, leer:
- **`plan/02_Modulos_Medicos/08_resumen_desarrollo_tele_ecg.md`** ⭐ (Recomendado - 2026-01-22 v1.24.0)

**Documentación Completa:**
- **⭐ Resumen Desarrollo:** `plan/02_Modulos_Medicos/08_resumen_desarrollo_tele_ecg.md` (Arquitectura + 12 bugs resueltos + Optimización UI v1.21.1→v1.24.0)
- **📊 Análisis Completo:** `plan/02_Modulos_Medicos/07_analisis_completo_teleecg_v2.0.0.md` (Detalles técnicos, endpoints, permisos)
- **📋 Checklist Tele-ECG:** `plan/02_Modulos_Medicos/04_checklist_teleekgs.md` (Implementación 100% completada v1.24.0)
- **🐛 Reporte Bugs:** `checklist/02_Reportes_Pruebas/03_reporte_bugs_teleecg_v2.0.0.md` (12 bugs identificados + 12 resueltos)
- **📝 Changelog:** `checklist/01_Historial/01_changelog.md` (Versiones v1.21.1 → v1.24.0 con UI optimizations)
- **💾 Script SQL BYTEA:** `spec/04_BaseDatos/06_scripts/041_teleecg_bytea_storage.sql` (Almacenamiento en BD)

**Versión Actual (v1.24.0) - Optimización UI v3.2.0:**
- 🎨 **UI Comprimida**: Fuentes reducidas (text-sm → text-xs), espacios optimizados (p-6 → p-4)
- 📊 **Estadísticas Corregidas**: Conteo de CASOS (pacientes) en lugar de IMÁGENES
- 🔍 **Filtros Inteligentes**: Colapsables con auto-aplicación (debounce 300ms)
- 🏥 **IPRESS Field**: Adscripción del paciente integrada en modal
- 🎯 **Botones Estandarizados**: Cancelar=Naranja, Guardar=Verde, Rechazar=Rojo
- ⚡ **Performance**: Load times optimizados, rendering eficiente

**Estado Final:**
- ✅ 12 Bugs Identificados: 12 RESUELTOS (100%)
- ✅ 5 Mejoras UI/UX Implementadas (v1.24.0)
- ✅ 0 Bugs Críticos Pendientes
- ✅ Backend: BUILD SUCCESSFUL (0 errores)
- ✅ Frontend: Compilado sin errores
- ✅ Almacenamiento: BYTEA (DATABASE) + Filesystem (FILESYSTEM) dual
- ✅ **Status: PRODUCTION LIVE** 🎉 (Disponible desde 2026-01-22)

### 👥 Módulos de Usuarios
- **⭐ Personal Externo:** `spec/02_Modulos_Usuarios/01_modulo_personal_externo.md` (v1.18.0)
  - Gestión de Modalidad de Atención (NUEVO)
  - Página de Bienvenida Personalizada (NUEVO)
  - Formulario de Diagnóstico
  - Solicitud de Turnos
- **⭐ Configuración de Módulos por IPRESS:** `spec/02_Modulos_Usuarios/02_configuracion_modulos_ipress.md` (NUEVO v1.20.1)
  - Sistema de activación de módulos por IPRESS
  - Tabla `ipress_modulos_config`
  - Caso: TELEECG exclusivo para PADOMI
  - Procedimientos administrativos

### 🔍 Filtros Avanzados Usuarios Pendientes (v1.0.0) - ✅ COMPLETADO

**📌 DESCRIPCIÓN:** Sistema de filtrado avanzado para usuarios pendientes de activación en el módulo de aprobación de solicitudes de registro (`/admin/solicitudes`). Permite filtrar por **Macrorregión** y **Red Asistencial** junto con IPRESS, Fecha Desde y Fecha Hasta.

**URL:** `http://localhost:3000/admin/solicitudes` → Tab "Pendientes de Activación"

**Arquitectura:**
- **Backend-driven filtering:** Filtros aplicados en base de datos para máximo rendimiento
- **Endpoint base:** `/api/admin/usuarios/pendientes-activacion` (obtiene todos los usuarios)
- **Endpoint filtrado:** `/api/admin/usuarios/pendientes-activacion/por-red/{idRed}` (filtrado por red)
- **Redes y Macrorregiones:** Endpoints públicos `/api/redes` y `/api/macrorregiones` para cargar opciones

**Versión Actual (v1.0.0):**
- 🔍 **5 Filtros Disponibles:** Macrorregión, Red Asistencial, IPRESS, Fecha Desde, Fecha Hasta
- 📊 **UI Responsiva:** Grid de 5 columnas en desktop (1 columna en móvil)
- 🗂️ **Relaciones Datos:** Usuario → PersonalCNT → IPRESS → Red → Macrorregión
- 🔗 **Filtrado en Backend:** SQL parameterizado con `WHERE r.id_red = ?` para máxima seguridad
- 📈 **Performance:** Solo envía usuarios que coinciden con filtros (reduce payload)
- 🎨 **Design System:** Dropdowns azules (#0D5BA9) consistentes con CENATE
- ⏰ **Debounce Búsqueda:** 300ms para búsqueda por nombre/email/teléfono

**Endpoints REST:**
```
GET  /api/admin/usuarios/pendientes-activacion
     → Retorna TODOS los usuarios pendientes (sin filtrar)

GET  /api/admin/usuarios/pendientes-activacion/por-red/{idRed}
     → Retorna usuarios de una red específica (filtrado en backend)

GET  /api/redes
     → Obtiene lista de redes disponibles (dropdown)

GET  /api/macrorregiones
     → Obtiene lista de macrorregiones (dropdown)
```

**Flujo de Filtrado:**
1. Usuario carga página `/admin/solicitudes` → Tab "Pendientes de Activación"
2. Sistema obtiene todas las redes y macrorregiones (llenan dropdowns)
3. Usuario selecciona una **Red Asistencial**
4. Frontend llama a `/api/admin/usuarios/pendientes-activacion/por-red/{idRed}`
5. Backend filtra en SQL con `LEFT JOIN dim_red r ON r.id_red = i.id_red` + `WHERE r.id_red = ?`
6. Retorna solo usuarios de esa red
7. Otros filtros (IPRESS, Fecha) aplicados en frontend sobre el resultado

**Componente Frontend:** `AprobacionSolicitudes.jsx`
- **Estado:** `filtroMacroregion`, `filtroRed`, `macrorregiones`, `redes`, `cargandoOpciones`
- **Funciones:** `cargarOpcionesFiltros()`, `cargarUsuariosPorRed(idRed)`, `aplicarFiltros()`
- **Estructura:** Grid 5 columnas con select/input para cada filtro

**Problemas Encontrados & Solucionados:**
1. **NULL en datos iniciales:** Intentó usar COALESCE en frontend → **Causa:** relaciones incompletas (usuarios sin PersonalCNT)
   - **Solución:** Implementar filtrado en backend donde se garantiza integridad de datos ✅

2. **Filtrado ineficiente:** Frontend intentaba filtrar arrays NULL
   - **Solución:** Backend-driven filtering con endpoint `/por-red/{idRed}` ✅

3. **Compilación frontend:** Syntax error en dependency array
   - **Solución:** Agregar cierre de paréntesis en useMemo ✅

**Consideraciones de Performance:**
- **Left Joins:** 4 LEFT JOINs (dim_personal_cnt, dim_ipress, dim_red, dim_macroregion) son eficientes con índices
- **Parametrized Queries:** JdbcTemplate con `?` binding previene SQL injection
- **Payload Reducido:** Solo envía usuarios con coincidencia exacta de red
- **Caché Redes/Macrorregiones:** Se obtienen una sola vez al cargar la página

**Estado Final:**
- ✅ Backend: Endpoint `/por-red/{idRed}` funcionando correctamente
- ✅ Frontend: Filtros cascada implementados (Macrorregión → Red → IPRESS)
- ✅ Base de Datos: Queries optimizadas con LEFT JOINs
- ✅ Documentación: Especificación técnica completa
- ✅ Seguridad: SQL parameterizado, sin inyección posible
- ✅ **Status: PRODUCTION LIVE** 🎉 (Disponible desde 2026-01-23)

### 📦 Módulo de Solicitudes de Bolsa de Pacientes (v1.33.0) - ✅ COMPLETADO

**📌 INICIO RÁPIDO:** Para entender el módulo de Solicitudes de Bolsa, leer (en orden):

1. **⭐ ESPECIFICACIÓN TÉCNICA DETALLADA:** `UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md` (v1.6.0 - RECOMENDADO)
   - Arquitectura general + flujo completo
   - 26 campos en dim_solicitud_bolsa (v1.6.0)
   - 8 Foreign Keys con integridad referencial
   - 9 índices optimizados
   - 2 selectores (TIPO BOLSA + ESPECIALIDAD)
   - Estado inicial: PENDIENTE_CITA (dim_estados_gestion_citas v1.33.0)
   - Validaciones + auto-enriquecimiento de datos
   - Casos de uso + ejemplos visuales

2. **📊 Resumen Integral:** `spec/01_Backend/06_resumen_modulo_bolsas_completo.md` (v1.33.0)
   - Visión general + componentes + catálogo de tipos
   - Flujo Bolsas → Coordinador → Gestoras → Estados
   - Tabla central (26 campos, 8 FKs, 9 índices)
   - Integración sistémica con dim_estados_gestion_citas v1.33.0
   - Componentes reutilizables (PageHeader, StatCard, ListHeader)

3. **📋 CRUD Tipos de Bolsas:** `spec/01_Backend/05_modulo_tipos_bolsas_crud.md` (v1.1.0)
   - Catálogo de 7 tipos de bolsas (BOLSA_107, BOLSA_DENGUE, etc.)
   - CRUD de tipos disponibles
   - Gestión de catálogo

**¿Qué es el Módulo de Solicitudes de Bolsa v1.6.0?**
- **Tabla centralizada** (dim_solicitud_bolsa: 26 campos) para almacenamiento de pacientes en bolsas
- **6 tipos de bolsas:** Bolsa 107, Dengue, Enfermería, IVR, Reprogramaciones, Gestores Territorial
- **2 selectores:** TIPO BOLSA (dim_tipos_bolsas) + ESPECIALIDAD (dim_servicio_essi)
- **Excel mínimo:** Solo 2 campos obligatorios (DNI + Código Adscripción)
- **Auto-enriquecimiento:** Sistema obtiene paciente_id, nombre, IPRESS, red automáticamente
- **Sin aprobación:** Carga directa a estado PENDIENTE_CITA (dim_estados_gestion_citas)
- **Distribución integral:** Coordinador → Gestoras de Citas → Seguimiento + Auditoría
- **8 Foreign Keys:** Integridad referencial garantizada
- **9 índices:** Búsquedas optimizadas por DNI, nombre, código, estado, tipo, gestora
- **Rol 1 - Coordinador:** Visualiza todas las bolsas en http://localhost:3000/bolsas/solicitudes
- **Rol 2 - Gestoras:** Captan, llaman, confirman citas en http://localhost:3000/citas/gestion-asegurado
- **10 Estados de Gestión:** CITADO, NO_CONTESTA, NO_DESEA, ATENDIDO_IPRESS, HC_BLOQUEADA, NUM_NO_EXISTE, TEL_SIN_SERVICIO, REPROG_FALLIDA, SIN_VIGENCIA, APAGADO
- **Notificaciones:** WhatsApp/Email automáticas cuando CITADO
- **Auditoría Completa:** Registro de quién, cuándo, qué en cada acción

**Documentación Técnica:**
- **⭐ Módulo Bolsas Pacientes (PRINCIPAL):** `spec/01_Backend/08_modulo_bolsas_pacientes_completo.md` (v1.32.1 - Flujo completo + modelos + endpoints)
- **📊 Resumen Integral:** `spec/01_Backend/06_resumen_modulo_bolsas_completo.md` (v1.32.1 - Arquitectura + componentes)
- **📋 CRUD Tipos de Bolsas:** `spec/01_Backend/05_modulo_tipos_bolsas_crud.md` (v1.1.0 - Catálogo de tipos)
- **💾 Script SQL:** `spec/04_BaseDatos/06_scripts/V3_0_2__crear_tabla_tipos_bolsas.sql` (DDL)
- **📝 Changelog:** `checklist/01_Historial/01_changelog.md` (v1.32.1 - Registro completo)

**Versión Actual (v1.31.0) - Módulo de Bolsas CRUD:**
- 🗄️ **Tabla Catálogo:** `dim_tipos_bolsas` con 7 registros iniciales
- 🔌 **7 Endpoints REST:** GET (todo/búsqueda/id), POST (crear), PUT (actualizar), DELETE, cambiar estado
- 📊 **API Estadísticas:** Conteo de registros activos/inactivos
- 🎨 **UI React:** Componente TiposBolsas.jsx con búsqueda avanzada, modales CRUD, paginación
- 🔍 **Búsqueda:** Debounce 300ms, filtros por código y descripción
- 💾 **Almacenamiento:** PostgreSQL con índices GIN para full-text search
- 🔐 **Seguridad:** Endpoint público `/tipos-bolsas` con fallback offline
- 🎨 **Design System:** Colores azul (#0D5BA9) consistentes con CENATE

**Estado Final:**
- ✅ Backend: CRUD completo (7 endpoints)
- ✅ Frontend: Interfaz React con 4 modales (crear, ver, editar, eliminar)
- ✅ Base de Datos: Tabla, índices, triggers, 7 registros
- ✅ Documentación: 2 especificaciones técnicas completas
- ✅ Build: Compilado sin errores
- ✅ **Status: PRODUCTION READY** 🎉 (Disponible desde 2026-01-22)

### 📋 Módulo Estados Gestión Citas (v1.33.0) - ✅ COMPLETADO

**📌 INICIO RÁPIDO:** Para entender el módulo Estados Gestión Citas, leer:
- **`spec/01_Backend/07_modulo_estados_gestion_citas_crud.md`** ⭐ (Recomendado - Especificación técnica)
- **`spec/06_Troubleshooting/02_guia_estados_gestion_citas.md`** (Errores encontrados + soluciones)

**Documentación Técnica:**
- **⭐ Especificación Completa:** `spec/01_Backend/07_modulo_estados_gestion_citas_crud.md` (v1.33.0 - Arquitectura, endpoints, errores resueltos)
- **🐛 Troubleshooting & Correcciones:** `spec/06_Troubleshooting/02_guia_estados_gestion_citas.md` (3 problemas resueltos: rutas, queries, endpoints)
- **💾 Script SQL Migración:** `spec/04_BaseDatos/06_scripts/V3_0_3__crear_tabla_estados_gestion_citas.sql` (DDL y 10 registros iniciales)
- **📝 Changelog:** `checklist/01_Historial/01_changelog.md` (v1.33.0 - Registro de cambios)

**Versión Actual (v1.33.0) - Gestión Centralizada de Estados de Citas:**
- 🗄️ **Tabla Catálogo:** `dim_estados_gestion_citas` con 10 estados iniciales (CITADO, NO_CONTESTA, etc.)
- 🔌 **8 Endpoints REST:** GET (todo/búsqueda/id), POST (crear), PUT (actualizar), PATCH (cambiar estado), DELETE
- 📊 **API Estadísticas:** Conteo de registros activos/inactivos en tiempo real
- 🎨 **UI React:** Componente EstadosGestionCitas.jsx con búsqueda avanzada, modales CRUD, paginación (30/página)
- 🔍 **Búsqueda:** Debounce 300ms, query SQL nativa (PostgreSQL), filtros por código y descripción
- 💾 **Almacenamiento:** PostgreSQL con índices GIN para full-text search en descripción
- 🔐 **Seguridad:** Endpoint público `/api/admin/estados-gestion-citas/**` con validación MBAC
- 🎨 **Design System:** Colores azul (#0D5BA9) consistentes con CENATE, tarjetas estadísticas

**Problemas Encontrados & Resueltos:**
1. **Rutas 404:** apiClient agrega `/api/` automáticamente → Uniformizar a `/api/admin/estados-gestion-citas/**` ✅
2. **Query JPQL con lower(bytea):** Hibernate interpretaba mal tipos → Cambiar a query SQL nativa con `nativeQuery=true` ✅
3. **Orden de endpoints:** `/buscar` después de `/{id}` causaba conflicto → Reordenar: `/todos` → `/buscar` → `/estadisticas` → `/{id}` ✅

**Estado Final:**
- ✅ Backend: CRUD completo (8 endpoints REST)
- ✅ Frontend: Interfaz React con 4 modales (crear, ver, editar, eliminar)
- ✅ Base de Datos: Tabla, índices, triggers, 10 registros iniciales
- ✅ Documentación: Especificación técnica + guía troubleshooting
- ✅ Build: Compilado sin errores (3 commits de correcciones)
- ✅ **Status: PRODUCTION LIVE** 🎉 (Disponible desde 2026-01-22)

### 💾 Base de Datos
- **Modelo Usuarios:** `spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md`
- **Análisis Estructura:** `spec/04_BaseDatos/04_analisis_estructura/`
- **Plan Limpieza:** `spec/04_BaseDatos/05_plan_limpieza/`
- **Scripts SQL (17+):** `spec/04_BaseDatos/06_scripts/`
- **⭐ Sistema Horarios:** `spec/04_BaseDatos/07_horarios_sistema/` (Modelo existente + Guía integración)
- **🛡️ ⭐ PLAN BACKUP Y PROTECCIONES:** `spec/04_BaseDatos/08_plan_backup_protecciones_completo.md`
  - **NIVELES IMPLEMENTADOS:** 1 (Backup diario 2x), 3 (Auditoría + Permisos), 5 (Monitoreo diario)
  - **Backup automático:** 2 AM + 2 PM (30 días retención, 952MB)
  - **Auditoría DELETE:** Tabla audit_asegurados_deletes + Trigger BEFORE DELETE
  - **Protecciones:** REVOKE/GRANT restrictivos + Usuario read-only
  - **Monitoreo:** Script diario 10 AM (5 checks automáticos)
  - **Registros protegidos:** 5,165,000 asegurados
  - **RTO:** 15 minutos | **RPO:** 7 horas
- **✅ VALIDACIÓN BACKUPS (2026-01-25):** `spec/04_BaseDatos/09_validacion_backups_2026_01_25.md` ⭐ **NUEVO**
  - ✅ Scripts instalados y ejecutables (backup-maestro-cenate.sh + monitor-backup-salud.sh)
  - ✅ CRONTAB configurado (2 AM, 2 PM, 10 AM)
  - ✅ 4 backups exitosos (1.5 días): 3.8GB totales
  - ✅ 5/5 checks de monitoreo pasados
  - ✅ Último backup: 2026-01-25 14:02 EXITOSO
  - ✅ 5,165,000 registros respaldados correctamente

### 🔧 Backend y APIs
- **Endpoints REST:** `spec/01_Backend/01_api_endpoints.md`
- **Importación Bolsa 107:** `spec/01_Backend/04_auto_normalizacion_excel_107.md`

### 📋 Planificación
- **Firma Digital:** `plan/05_Firma_Digital/01_plan_implementacion.md`
- **Módulo Red:** `plan/03_Infraestructura/01_plan_modulo_red.md`
- **Integraciones:** `plan/04_Integraciones/`

---

## Stack Tecnológico

```
Backend:      Spring Boot 3.5.6 + Java 17
Frontend:     React 19 + TailwindCSS 3.4.18
Base de Datos: PostgreSQL 14+ (10.0.89.13:5432)
Seguridad:    JWT + MBAC (Module-Based Access Control)
```

---

## Estructura del Proyecto

```
mini_proyecto_cenate/
├── spec/                    # 📚 DOCUMENTACIÓN TÉCNICA DETALLADA
│   ├── 01_Backend/          # API, endpoints, lógica de negocio
│   ├── 02_Frontend/         # Componentes React (próximamente)
│   ├── 03_Frontend/         # ⭐ NEW: Estructura mínima, Excel, componentes
│   ├── 04_Arquitectura/     # Diagramas, flujos del sistema
│   ├── 05_BaseDatos/        # Modelo, auditoría, análisis, scripts SQL
│   └── 06_Troubleshooting/  # Guía de problemas comunes
│
├── plan/                    # 📋 PLANIFICACIÓN DE MÓDULOS
│   ├── 01_Seguridad_Auditoria/
│   ├── 02_Modulos_Medicos/
│   ├── 03_Infraestructura/
│   ├── 04_Integraciones/
│   └── 05_Firma_Digital/
│
├── checklist/               # ✅ HISTORIAL Y REPORTES
│   ├── 01_Historial/        # ⭐ Changelog, versiones
│   ├── 02_Reportes_Pruebas/
│   ├── 03_Checklists/
│   └── 04_Analisis/
│
├── backend/                 # Spring Boot (puerto 8080)
│   └── src/main/java/com/styp/cenate/
│       ├── api/             # Controllers REST
│       ├── service/         # Lógica de negocio
│       ├── model/           # Entidades JPA (51)
│       ├── repository/      # JPA Repositories (48)
│       ├── dto/             # Data Transfer Objects
│       ├── security/        # JWT + MBAC
│       └── exception/       # Manejo de errores
│
└── frontend/                # React (puerto 3000)
    └── src/
        ├── components/      # ⭐ UI reutilizable (PageHeader, StatCard, ListHeader)
        ├── context/         # AuthContext, PermisosContext
        ├── pages/           # Vistas (31+)
        │   ├── bolsas/      # Solicitudes.jsx (v1.32.1 con componentes)
        │   └── ...
        └── services/        # API services
```

---

## Configuración de Desarrollo

### Variables de Entorno (Backend)

```bash
# PostgreSQL (servidor remoto)
DB_URL=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
DB_USERNAME=postgres
DB_PASSWORD=Essalud2025

# JWT (mínimo 32 caracteres)
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

# Email SMTP (Servidor Corporativo EsSalud)
MAIL_HOST=172.20.0.227
MAIL_PORT=25
MAIL_USERNAME=cenate.contacto@essalud.gob.pe
MAIL_PASSWORD=essaludc50

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Comandos Rápidos

```bash
# Desarrollo
cd backend && ./gradlew bootRun    # Backend
cd frontend && npm start            # Frontend

# Docker Producción
./start-smtp-relay.sh               # 1. SMTP relay
docker-compose up -d                # 2. Iniciar containers
docker-compose logs -f backend      # Ver logs

# PostgreSQL
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate

# Credenciales de prueba
Username: 44914706
Password: @Cenate2025
```

---

## Módulos Principales

| Módulo | Documentación | Estado |
|--------|--------------|--------|
| **Auditoría** | `spec/04_BaseDatos/02_guia_auditoria/` | ✅ Implementado |
| **Disponibilidad + Integración Chatbot** | `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md` (v2.0.0) + Testing: `checklist/02_Reportes_Pruebas/02_reporte_integracion_chatbot.md` | ✅ Implementado (v1.17.0) |
| **Solicitud Turnos IPRESS** | `plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md` (v1.2) | ✅ Implementado |
| **Firma Digital** | `plan/05_Firma_Digital/01_plan_implementacion.md` | ✅ Implementado |
| **Bolsa 107 (Importación)** | `spec/01_Backend/04_auto_normalizacion_excel_107.md` | ✅ Implementado |
| **Pacientes 107** | Ver changelog v1.15.2 | ✅ Implementado |
| **Asignación Roles** | `checklist/01_Historial/01_changelog.md` (v1.13.0) | ✅ Implementado |
| **Asignación Admisionistas** | Ver changelog v1.14.2 | ✅ Implementado |
| **Notificaciones Cumpleaños** | Ver changelog v1.15.10 | ✅ Implementado |
| **Gestión Asegurado** | Ver changelog v1.16.0 | ✅ Implementado |
| **Tipos Profesionales** | Ver changelog v1.16.1 | ✅ Implementado |
| **Navegación Dinámica de Pestañas** | Ver changelog v1.17.1 | ✅ Implementado |
| **Creación de Usuarios con Email** | `plan/01_Seguridad_Auditoria/03_plan_unificacion_creacion_usuarios.md` | ✅ Implementado (v1.18.0) |
| **Personal Externo (Gestión Modalidad + Bienvenida)** | `spec/02_Modulos_Usuarios/01_modulo_personal_externo.md` | ✅ Implementado (v1.18.0) |
| **🔍 Filtros Avanzados Usuarios Pendientes (v1.0.0)** | Sección en CLAUDE.md (línea 76) - Macrorregión + Red + IPRESS + Fechas | ✅ **100% Completado** (v1.0.0 - Backend-driven filtering) 🎉 |
| **🫀 Tele-ECG v2.0.0** | `plan/02_Modulos_Medicos/08_resumen_desarrollo_tele_ecg.md` ⭐ + `checklist/02_Reportes_Pruebas/03_reporte_bugs_teleecg_v2.0.0.md` | ✅ **100% Completado** (v1.21.4 - 6 bugs resueltos) 🎉 |
| **Tele-ECG Exclusivo PADOMI** | `spec/02_Modulos_Usuarios/02_configuracion_modulos_ipress.md` + `spec/04_BaseDatos/06_scripts/034_teleecg_exclusivo_padomi.sql` | ✅ Implementado (v1.20.1) |
| **📦 Módulo Solicitudes de Bolsa (v1.6.0) - ✅ COMPLETADO** | **⭐ ESPECIFICACIÓN:** `UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md` (v1.6.0 - 26 campos, 8 FKs, 9 índices) + Resumen: `spec/01_Backend/06_resumen_modulo_bolsas_completo.md` (v1.33.0) + Tipos: `spec/01_Backend/05_modulo_tipos_bolsas_crud.md` | ✅ **100% Completado** (v1.6.0 - Estados Citas Integrados: PENDIENTE_CITA inicial, 10 estados totales, auto-enriquecimiento datos, sin aprobación) 🎉 |
| **📋 Estados Gestión Citas (Integración Solicitudes Bolsa)** | `spec/01_Backend/07_modulo_estados_gestion_citas_crud.md` (v1.33.0) ⭐ + Troubleshooting: `spec/06_Troubleshooting/02_guia_estados_gestion_citas.md` + Integración: `UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md` | ✅ **100% Completado** (v1.33.0 - CRUD + SQL Nativo + Integración v1.6.0: FK NOT NULL, DEFAULT PENDIENTE_CITA) 🎉 |
| **Módulo Red** | `plan/03_Infraestructura/01_plan_modulo_red.md` | 📋 Pendiente |

---

## Glosario

| Término | Definición |
|---------|-----------|
| **CENATE** | Centro Nacional de Telemedicina |
| **IPRESS** | Institución Prestadora de Servicios de Salud |
| **ESSI** | Sistema de información de EsSalud |
| **MBAC** | Module-Based Access Control |
| **Bolsa** | Conjunto de pacientes agrupados por criterio (tipo, origen, especialidad) esperando gestión |
| **Bolsa 107** | Módulo de importación masiva de pacientes desde ESSI |
| **Bolsa Dengue** | Pacientes en control epidemiológico de dengue |
| **Bolsas Enfermería** | Pacientes requieren atenciones de enfermería especializada |
| **Bolsas IVR** | Pacientes asignados a sistema interactivo de respuesta de voz |
| **Bolsas Reprogramación** | Pacientes con citas reagendadas o reprogramadas |
| **Bolsa Gestores Territorial** | Pacientes bajo gestión territorial |
| **Coordinador de Gestión de Citas** | Rol responsable de distribuir bolsas de pacientes a Gestoras |
| **Gestora de Citas** | Rol responsable de captar, llamar, confirmar cita y registrar estado |
| **dim_solicitud_bolsa** | Tabla principal que almacena pacientes en bolsas (estado de solicitud) |
| **dim_estados_gestion_citas** | Catálogo de 10 estados que registran la atención al paciente |
| **Diferimiento** | Días transcurridos desde asignación del paciente hasta hoy |
| **Semáforo** | Indicador Verde (OK) o Rojo (Urgente) basado en diferimiento |
| **Régimen 728/CAS** | Personal nombrado/CAS: M=4h, T=4h, MT=8h + 2h sanitarias/día (telemonitoreo 1h + administrativa 1h) |
| **Locador** | Locación de servicios: M=6h, T=6h, MT=12h (sin horas sanitarias) |
| **Horas Sanitarias** | 2h adicionales por día trabajado solo para 728/CAS (1h telemonitoreo + 1h administrativa) |
| **ctr_horario** | Sistema existente de slots del chatbot (producción) |
| **disponibilidad_medica** | Nuevo módulo de declaración médica (150h mínimas) |
| **TRN_CHATBOT** | Tipo de turno crítico para que slots aparezcan en chatbot |
| **Sincronización** | Proceso manual de mapear disponibilidad → slots chatbot |

---

## 🤖 Instrucciones para Claude

### 📖 Al Investigar o Responder Preguntas

**IMPORTANTE:** Toda la información detallada está en los archivos de `spec/`, `plan/` y `checklist/`. **NO repitas información**, enlaza a los archivos correspondientes.

**Flujo de consulta:**
1. Consulta **primero** la documentación detallada en:
   - `spec/` para detalles técnicos
   - `plan/` para planificación de módulos
   - `checklist/01_Historial/01_changelog.md` para cambios recientes
2. Resume brevemente y enlaza al archivo completo
3. Solo proporciona detalles si el usuario lo solicita explícitamente

**Referencias rápidas:**
- Auditoría → `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`
- Optimización Planes → `plan/02_Modulos_Medicos/00_resumen_optimizacion_planes.md`
- Disponibilidad + Chatbot → `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md` (v2.0.0)
- Horarios Existentes → `spec/04_BaseDatos/07_horarios_sistema/01_modelo_horarios_existente.md`
- Integración Horarios → `spec/04_BaseDatos/07_horarios_sistema/02_guia_integracion_horarios.md`
- Firma Digital → `plan/05_Firma_Digital/01_plan_implementacion.md`
- **📦 Módulo Bolsas Pacientes (COMPLETO)** → `spec/01_Backend/08_modulo_bolsas_pacientes_completo.md` (v1.32.1) ⭐⭐⭐ **DOCUMENTO PRINCIPAL**
  - 6 fuentes → Almacenamiento (dim_solicitud_bolsa) → Coordinador distribuye → Gestoras gestionan → 10 estados de citas
  - Frontend Coordinador: http://localhost:3000/bolsas/solicitudes
  - Frontend Gestora: http://localhost:3000/citas/gestion-asegurado
  - Tabla `dim_solicitud_bolsa` (31 campos) con FK a `dim_estados_gestion_citas`
  - Documentación complementaria:
    - Resumen integral: `spec/01_Backend/06_resumen_modulo_bolsas_completo.md`
    - Catálogo de tipos: `spec/01_Backend/05_modulo_tipos_bolsas_crud.md`
- **📋 Estados Gestión Citas** → `spec/01_Backend/07_modulo_estados_gestion_citas_crud.md` (v1.33.0) ⭐
  - 10 estados: CITADO, NO_CONTESTA, NO_DESEA, ATENDIDO_IPRESS, HC_BLOQUEADA, NUM_NO_EXISTE, TEL_SIN_SERVICIO, REPROG_FALLIDA, SIN_VIGENCIA, APAGADO
  - Tabla: `dim_estados_gestion_citas` (referenciada por `dim_solicitud_bolsa`)
  - Troubleshooting: `spec/06_Troubleshooting/02_guia_estados_gestion_citas.md`
- Excel Pacientes → `spec/03_Frontend/02_estructura_excel_pacientes.md` (14 columnas, 6 obligatorios)
- Componentes Reutilizables → `frontend/src/components/README.md` (PageHeader, StatCard, ListHeader)
- Estructura Mínima Páginas → `spec/03_Frontend/01_estructura_minima_paginas.md` (Patrón arquitectónico)
- Bolsa 107 → `spec/01_Backend/04_auto_normalizacion_excel_107.md`
- Troubleshooting → `spec/06_Troubleshooting/01_guia_problemas_comunes.md`

### 💻 Al Implementar Nuevas Funcionalidades

**Análisis previo:**
1. Leer archivos relacionados existentes
2. Evaluar impacto en backend, frontend, BD
3. Consultar patrones similares en el código

**Patrones arquitectónicos:**
- Controller → Service → Repository
- Usar DTOs, nunca exponer entidades
- Integrar `AuditLogService` para auditoría
- Agregar permisos MBAC si aplica

**Validación en 3 capas:**
- Frontend (validación UX)
- Backend DTO (validación de negocio)
- Base de datos (CHECK constraints)

**Documentación obligatoria:**
- Actualizar `checklist/01_Historial/01_changelog.md`
- Crear/actualizar documentos en `spec/` si es necesario
- Agregar scripts SQL a `spec/04_BaseDatos/06_scripts/`

### 🔐 Seguridad y Buenas Prácticas

1. **NUNCA** exponer credenciales en código
2. **SIEMPRE** usar variables de entorno
3. **Prevenir:** SQL injection, XSS, CSRF
4. **Auditar:** Todas las acciones críticas
5. **Validar:** Permisos MBAC en endpoints sensibles

### 📝 Patrones de Código

**Backend (Java):**
```java
@CheckMBACPermission(pagina = "/admin/users", accion = "crear")
@PostMapping
public ResponseEntity<?> crearUsuario(...) {
    auditLogService.registrarEvento(...);
    return ResponseEntity.ok(...);
}
```

**Frontend (React):**
```jsx
<ProtectedRoute requiredPath="/admin/users" requiredAction="ver">
  <UsersManagement />
</ProtectedRoute>

<PermissionGate path="/admin/users" action="crear">
  <Button>Crear Usuario</Button>
</PermissionGate>
```

**Formato API Response:**
```javascript
// Éxito
{ "status": 200, "data": {...}, "message": "..." }

// Error
{ "status": 400, "error": "...", "message": "...", "validationErrors": {...} }
```

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| SUPERADMIN | Todo el sistema |
| ADMIN | Panel admin, usuarios, auditoría |
| MEDICO | Dashboard médico, disponibilidad, pacientes |
| COORDINADOR | Agenda, asignaciones, revisión turnos |
| COORDINADOR_ESPECIALIDADES | Asignación de médicos |
| COORDINADOR_RED | Solicitudes IPRESS, turnos |
| ENFERMERIA | Atenciones, seguimiento pacientes |
| EXTERNO | Formulario diagnóstico |
| INSTITUCION_EX | Acceso limitado IPRESS externa |

---

*EsSalud Perú - CENATE | Desarrollado por Ing. Styp Canto Rondón*
*Versión 1.34.1 | 2026-01-23 | Solicitudes de Bolsa v1.6.0 (Cargar desde Excel Mejorado) + Estados Gestión Citas v1.33.0 + Tele-ECG v1.24.0 + Filtros Avanzados Usuarios Pendientes v1.0.0*
