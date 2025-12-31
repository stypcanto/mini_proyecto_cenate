# Documentación de Base de Datos - Proyecto CENATE

## Índice General

Esta carpeta contiene documentación técnica completa sobre la base de datos PostgreSQL del sistema CENATE, organizada en dos secciones principales:

1. **Estructura de Base de Datos** - Análisis y documentación del esquema actual
2. **Limpieza de Tablas Obsoletas** - Proceso de optimización y eliminación de tablas no utilizadas

---

## 1. Estructura de Base de Datos

📁 **Ubicación:** `1_Estructura_BD/`

### Documentos Disponibles

| Documento | Descripción | Páginas |
|-----------|-------------|---------|
| **01_resumen_general.md** | Visión completa de la BD: estadísticas, categorización de tablas, índices, vistas | ~100 |

### Próximos Documentos (En Desarrollo)

- `02_tablas_autenticacion.md` - Detalle completo del sistema de autenticación
- `03_tablas_personal.md` - Gestión de personal médico y administrativo
- `04_tablas_ipress.md` - Instituciones y geografía
- `05_tablas_permisos_mbac.md` - Sistema de control de acceso modular
- `06_tablas_disponibilidad.md` - Módulo de disponibilidad médica
- `07_vistas_principales.md` - Documentación de vistas SQL
- `08_indices_performance.md` - Estrategias de indexación
- `09_funciones_triggers.md` - Funciones PL/pgSQL y triggers
- `10_mantenimiento.md` - Guía de mantenimiento rutinario

### Contenido de 01_resumen_general.md

- ✅ Información general de la base de datos
- ✅ Estadísticas globales (135 tablas, 42 vistas, ~5.4 GB)
- ✅ Distribución de espacio por categoría
- ✅ Categorización de las 135 tablas en 13 grupos:
  1. Autenticación y Seguridad (12 tablas)
  2. Personal y RRHH (10 tablas)
  3. Instituciones y Geografía (12 tablas)
  4. Roles, Permisos y MBAC (15 tablas)
  5. Pacientes y Asegurados (5 tablas)
  6. Disponibilidad Médica (8 tablas)
  7. Servicios y Actividades ESSI (5 tablas)
  8. Procedimientos Médicos (3 tablas)
  9. Formulario de Diagnóstico (22 tablas)
  10. Módulo Bolsa 107 (5 tablas)
  11. Módulo Control de Horarios CTR (7 tablas)
  12. Tablas Staging y Temporales (10+ tablas)
  13. Misceláneas (10 tablas)
- ✅ Listado de 42 vistas principales
- ✅ Índices críticos y estrategias
- ✅ Triggers y funciones PL/pgSQL
- ✅ Secuencias
- ✅ Consideraciones de performance
- ✅ Seguridad y privilegios
- ✅ Estrategias de backup/restore
- ✅ Queries de monitoreo recomendadas

---

## 2. Limpieza de Tablas Obsoletas

📁 **Ubicación:** `2_Limpieza_Tablas_Obsoletas/`

### Documentos Disponibles

| Documento | Descripción | Tipo | Páginas |
|-----------|-------------|------|---------|
| **01_resumen_ejecutivo.md** | Plan completo de limpieza en 3 fases, análisis de riesgo, beneficios | Ejecutivo | ~60 |
| **02_scripts_limpieza_fase1.sql** | Scripts SQL listos para ejecutar Fase 1 (bajo riesgo) | Técnico | ~400 líneas |
| **03_guia_ejecucion_paso_a_paso.md** | Guía detallada paso a paso para ejecutar Fase 1 | Operativo | ~70 |

### Próximos Documentos (En Desarrollo)

- `04_scripts_limpieza_fase2.sql` - Scripts para eliminación de sistema legacy permisos
- `05_scripts_limpieza_fase3.sql` - Scripts para archivado de módulos legacy
- `06_analisis_tablas_detallado.md` - Análisis tabla por tabla con SQL
- `07_procedimientos_backup.md` - Guía completa de backup/restore
- `08_plan_rollback.md` - Procedimientos de reversión
- `09_monitoreo_post_limpieza.md` - Cómo monitorear después de limpieza

### Contenido de 01_resumen_ejecutivo.md

- ✅ Información del análisis (fecha, BD, versión)
- ✅ Objetivos de la limpieza (4 objetivos principales)
- ✅ Hallazgos principales:
  1. Tablas fragmentadas (880 MB a recuperar) ❗❗❗
  2. Backups temporales obsoletos
  3. Tablas staging sin uso
  4. Tablas vacías sin dependencias (7 tablas)
  5. Sistema de permisos duplicado (11 tablas legacy)
  6. Módulos potencialmente legacy (Bolsa 107, CTR)
- ✅ Resumen de acciones en 3 fases:
  - **Fase 1:** Bajo riesgo (12 operaciones, 880 MB, ejecutar inmediato)
  - **Fase 2:** Riesgo medio (11 tablas legacy, requiere validación)
  - **Fase 3:** Riesgo alto (2 módulos, requiere aprobación stakeholders)
- ✅ Impacto esperado (beneficios cuantificables y cualitativos)
- ✅ Plan de ejecución conservador (5 semanas)
- ✅ Riesgos y mitigaciones (6 riesgos identificados)
- ✅ Métricas de éxito
- ✅ Recursos necesarios
- ✅ Comunicación y coordinación
- ✅ Plantillas de correos
- ✅ Tabla de aprobaciones

### Contenido de 02_scripts_limpieza_fase1.sql

- ✅ Checklist pre-ejecución
- ✅ Comandos de backup completo
- ✅ Análisis previo (verificación de tablas vacías, FK, vistas, triggers)
- ✅ Análisis de tablas RAW (fragmentación)
- ✅ Scripts de eliminación de 9 tablas (con transacción)
- ✅ Scripts de VACUUM FULL (3 tablas, 880 MB)
- ✅ Verificaciones post-limpieza
- ✅ Actualización de estadísticas
- ✅ Registro en auditoría
- ✅ Resumen final

### Contenido de 03_guia_ejecucion_paso_a_paso.md

- ✅ Información general (duración, ventana, riesgo)
- ✅ Pre-requisitos (verificaciones técnicas y operacionales)
- ✅ Paso 1: Preparación (backup completo, backup tablas específicas)
- ✅ Paso 2: Análisis previo (conexión, verificación estado)
- ✅ Paso 3: Eliminación de tablas vacías (transacción, verificación)
- ✅ Paso 4: VACUUM FULL (truncate, vacuum, monitoreo)
- ✅ Paso 5: Verificación post-limpieza (tamaño, estadísticas)
- ✅ Paso 6: Pruebas de funcionalidad (web, logs)
- ✅ Paso 7: Registro final y documentación
- ✅ Paso 8: Monitoreo post-ejecución (48 horas)
- ✅ Checklist final
- ✅ Procedimiento de rollback
- ✅ Contactos de soporte

---

## Resumen de Hallazgos Clave

### Base de Datos Actual (2025-12-30)

| Métrica | Valor |
|---------|-------|
| **Motor** | PostgreSQL 14+ |
| **Servidor** | 10.0.89.13:5432 |
| **Tamaño Total** | ~5.4 GB |
| **Tablas** | 135 |
| **Vistas** | 42 |
| **Entidades JPA** | ~55 (41%) |
| **Tablas Huérfanas** | ~80 (59%) |

### Oportunidades de Optimización

| Categoría | Tablas | Espacio | Prioridad |
|-----------|--------|---------|-----------|
| **Tablas Fragmentadas** | 3 | 880 MB | ALTA ✓ |
| **Backups Temporales** | 1 | 8 KB | ALTA ✓ |
| **Staging Sin Uso** | 1 | 64 KB | MEDIA ✓ |
| **Tablas Vacías** | 7 | 350 KB | MEDIA ✓ |
| **Sistema Legacy Permisos** | 11 | 150 KB | MEDIA |
| **Módulo Bolsa 107** | 5 | 250 KB | BAJA (requiere validación) |
| **Módulo CTR** | 7 | 2.5 MB | BAJA (requiere validación) |
| **TOTAL POTENCIAL** | **35** | **~1.5 GB** | **28% de BD** |

### Impacto de Fase 1 (Bajo Riesgo)

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Tamaño BD** | 5.4 GB | 4.5 GB | -16% |
| **Tablas** | 135 | 126 | -7% |
| **Espacio Recuperado** | - | 880 MB | N/A |
| **Tiempo Backup** | ~45 min | ~38 min | -15% |

---

## Cómo Usar Esta Documentación

### Para DBAs

1. **Análisis Inicial**
   - Leer `1_Estructura_BD/01_resumen_general.md` para entender el esquema completo
   - Revisar categorización de tablas y su criticidad
   - Familiarizarse con índices y vistas principales

2. **Planificación de Limpieza**
   - Leer `2_Limpieza_Tablas_Obsoletas/01_resumen_ejecutivo.md`
   - Revisar hallazgos y recomendaciones
   - Evaluar plan de 3 fases

3. **Ejecución de Fase 1**
   - Leer `03_guia_ejecucion_paso_a_paso.md` completamente
   - Ejecutar `02_scripts_limpieza_fase1.sql` siguiendo la guía
   - Monitorear resultados durante 48 horas

### Para Desarrolladores

1. **Entender Modelo de Datos**
   - Revisar categorías de tablas en `01_resumen_general.md`
   - Identificar tablas relevantes a su módulo
   - Revisar entidades JPA asociadas

2. **Validación Pre-Limpieza**
   - Verificar que el código NO usa tablas marcadas para eliminación
   - Buscar en codebase: `grep -r "nombre_tabla" .`
   - Revisar queries y repositorios JPA

3. **Testing Post-Limpieza**
   - Ejecutar tests unitarios y de integración
   - Verificar que no hay errores de "relation does not exist"
   - Reportar cualquier anomalía

### Para Jefes de Proyecto

1. **Entender Beneficios**
   - Leer sección "Impacto Esperado" en `01_resumen_ejecutivo.md`
   - Revisar métricas de éxito (cuantitativas y cualitativas)
   - Evaluar costo-beneficio del plan

2. **Aprobar Plan**
   - Revisar plan de 5 semanas
   - Verificar riesgos y mitigaciones
   - Firmar tabla de aprobaciones

3. **Monitorear Progreso**
   - Recibir reportes semanales de avance
   - Revisar incidentes si los hay
   - Aprobar fases 2 y 3 según corresponda

---

## Estructura de Archivos

```
Documentaciones/BD/
│
├── README.md (este archivo)
│
├── 1_Estructura_BD/
│   ├── 01_resumen_general.md ✓ DISPONIBLE
│   ├── 02_tablas_autenticacion.md (próximamente)
│   ├── 03_tablas_personal.md (próximamente)
│   ├── 04_tablas_ipress.md (próximamente)
│   ├── 05_tablas_permisos_mbac.md (próximamente)
│   ├── 06_tablas_disponibilidad.md (próximamente)
│   ├── 07_vistas_principales.md (próximamente)
│   ├── 08_indices_performance.md (próximamente)
│   ├── 09_funciones_triggers.md (próximamente)
│   └── 10_mantenimiento.md (próximamente)
│
└── 2_Limpieza_Tablas_Obsoletas/
    ├── 01_resumen_ejecutivo.md ✓ DISPONIBLE
    ├── 02_scripts_limpieza_fase1.sql ✓ DISPONIBLE
    ├── 03_guia_ejecucion_paso_a_paso.md ✓ DISPONIBLE
    ├── 04_scripts_limpieza_fase2.sql (próximamente)
    ├── 05_scripts_limpieza_fase3.sql (próximamente)
    ├── 06_analisis_tablas_detallado.md (próximamente)
    ├── 07_procedimientos_backup.md (próximamente)
    ├── 08_plan_rollback.md (próximamente)
    └── 09_monitoreo_post_limpieza.md (próximamente)
```

---

## Glosario

| Término | Definición |
|---------|------------|
| **BD** | Base de Datos |
| **DBA** | Database Administrator (Administrador de Base de Datos) |
| **JPA** | Java Persistence API (API de Persistencia Java) |
| **MBAC** | Module-Based Access Control (Control de Acceso Basado en Módulos) |
| **VACUUM FULL** | Operación de PostgreSQL para recuperar espacio fragmentado |
| **Foreign Key (FK)** | Llave foránea, relación entre tablas |
| **Lookup Table** | Tabla de catálogo con valores predefinidos |
| **Staging Table** | Tabla temporal para procesos ETL |
| **Legacy** | Sistema o componente antiguo/obsoleto |
| **Fragmentación** | Espacio desperdiciado en disco por operaciones repetidas |
| **IPRESS** | Institución Prestadora de Servicios de Salud |
| **ESSI** | Sistema de Información de EsSalud |
| **CTR** | Control (referido al módulo de control de horarios) |

---

## Convenciones de Documentación

### Iconos Usados

| Icono | Significado |
|-------|-------------|
| ✓ | Completado / Correcto / Aprobado |
| ❗ | Atención / Importante |
| ❗❗❗ | Crítico / Urgente |
| ⏳ | Pendiente / En Proceso |
| 🔴 | Alta Prioridad |
| 🟡 | Media Prioridad |
| 🟢 | Baja Prioridad |

### Niveles de Riesgo

| Nivel | Descripción | Acción Requerida |
|-------|-------------|------------------|
| **NULO** | Sin riesgo | Ejecutar directamente |
| **BAJO** | Riesgo mínimo, operación reversible | Backup + Ejecutar |
| **MEDIO** | Riesgo moderado, requiere validación | Backup + Validación + Ejecutar |
| **ALTO** | Riesgo significativo, requiere aprobación | Backup + Validación + Aprobación + Ejecutar |

### Formato de Comandos

```sql
-- SQL Query
SELECT * FROM tabla;
```

```bash
# Bash Command
pg_dump -h servidor -U usuario -d base
```

```javascript
// Código JavaScript/Java
const resultado = await fetch('/api/endpoint');
```

---

## Contactos

| Rol | Nombre | Email | Disponibilidad |
|-----|--------|-------|----------------|
| **DBA Principal** | Ing. Styp Canto Rondon | cenate.analista@essalud.gob.pe | Lun-Vie 8am-6pm |
| **Jefe de Proyecto** | - | - | - |
| **Soporte Técnico** | - | - | Lun-Vie 9am-5pm |

---

## Control de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| **1.0** | 2025-12-30 | Ing. Styp Canto | Creación inicial de documentación |
| | | | - Resumen general de estructura BD |
| | | | - Plan completo de limpieza (3 fases) |
| | | | - Scripts SQL Fase 1 |
| | | | - Guía ejecución Fase 1 |

---

## Licencia

Esta documentación es propiedad del Proyecto CENATE - EsSalud Perú.
Uso interno exclusivo. Prohibida su reproducción sin autorización.

---

**Generado:** 2025-12-30
**Versión Sistema:** v1.13.0
**Última Actualización:** 2025-12-30
**Autor:** Ing. Styp Canto Rondon
**Contacto:** cenate.analista@essalud.gob.pe
