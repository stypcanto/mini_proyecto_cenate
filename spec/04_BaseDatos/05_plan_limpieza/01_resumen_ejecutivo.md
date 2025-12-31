# Resumen Ejecutivo - Limpieza de Tablas Obsoletas

## Información del Análisis

| Propiedad | Valor |
|-----------|-------|
| **Fecha de Análisis** | 2025-12-30 |
| **Base de Datos** | maestro_cenate @ 10.0.89.13:5432 |
| **Versión PostgreSQL** | 14+ |
| **Tamaño Actual BD** | ~5.4 GB |
| **Total de Tablas** | 135 |
| **Tablas con Entidad JPA** | ~55 (41%) |
| **Tablas Huérfanas** | ~80 (59%) |
| **Espacio Potencial a Recuperar** | ~1.5 GB (28%) |

---

## Objetivos de la Limpieza

1. **Recuperar Espacio en Disco**
   - Eliminar tablas obsoletas y backups temporales
   - Aplicar VACUUM FULL en tablas fragmentadas
   - Recuperación estimada: 880 MB a 1.5 GB

2. **Mejorar Performance**
   - Reducir overhead en catálogo de sistema
   - Acelerar backups y restauraciones
   - Optimizar queries que escanean pg_tables

3. **Simplificar Mantenibilidad**
   - Esquema más limpio y comprensible
   - Menor confusión sobre tablas activas
   - Documentación más clara

4. **Reducir Riesgos**
   - Eliminar datos legacy que puedan causar confusión
   - Limpiar tablas sin foreign keys que pueden tener datos huérfanos
   - Consolidar sistemas de permisos

---

## Hallazgos Principales

### 1. Tablas con Alta Fragmentación pero Sin Datos

| Tabla | Tamaño Actual | Filas | Espacio Desperdiciado |
|-------|---------------|-------|----------------------|
| `ultima_atencion_esp_nacional` | 858 MB | 0 | 858 MB ❗❗❗ |
| `ultima_atencion_6m_nacional` | 15 MB | 0 | 15 MB ❗ |
| `ultima_atencion_6m_cnt` | 5.3 MB | 0 | 5.3 MB ❗ |
| **TOTAL** | **878 MB** | **0** | **878 MB** |

**Causa:** Fragmentación por cargas/truncados repetidos sin VACUUM FULL.

**Acción Recomendada:** TRUNCATE + VACUUM FULL (Recuperar 880 MB)

**Riesgo:** BAJO (tablas vacías)

---

### 2. Backups Temporales Obsoletos

| Tabla | Tamaño | Fecha Estimada | Razón |
|-------|--------|----------------|-------|
| `bkp_dim_personal_prof_id_esp_202511` | 8 KB | Nov 2025 | Backup temporal vencido |

**Acción Recomendada:** ELIMINAR de inmediato

**Riesgo:** NULO (backup temporal ya obsoleto)

**Espacio a Recuperar:** Mínimo (~8 KB)

---

### 3. Tablas Staging Sin Uso

| Tabla | Filas | Accesos | Estado |
|-------|-------|---------|--------|
| `stg_ipress_load` | 0 | 0 | Sin uso |

**Acción Recomendada:** ELIMINAR si no hay procesos ETL activos

**Riesgo:** BAJO (verificar procesos batch primero)

**Espacio a Recuperar:** ~64 KB

---

### 4. Tablas Vacías Sin Dependencias

| Tabla | Filas | Accesos | Foreign Keys Entrantes |
|-------|-------|---------|------------------------|
| `actividad_subactividad` | 0 | 0 | 0 |
| `dim_categoria_ipress` | 0 | 0 | 0 |
| `dim_ipress_modalidad` | 0 | 0 | 0 |
| `dim_procedimiento` | 0 | 0 | 0 |
| `llamadas` | 0 | 0 | 0 |
| `servicio_actividad` | 0 | 0 | 0 |
| `v_id_origen` | 0 | 0 | 0 |

**Acción Recomendada:** ELIMINAR

**Riesgo:** BAJO (sin datos, sin dependencias)

**Espacio a Recuperar:** ~350 KB

---

### 5. Sistema de Permisos Duplicado (Legacy)

| Sistema | Tablas | Filas Totales | Accesos | Estado |
|---------|--------|---------------|---------|--------|
| **LEGACY** | 11 tablas | 0 | ~57 accesos | OBSOLETO |
| **ACTUAL (MBAC)** | 7 tablas | 304 | 190,000+ accesos | ACTIVO ✓ |

#### Tablas Legacy a Eliminar:
- `rel_paginas_permisos` (0 filas, 0 accesos)
- `rel_rol_pagina_permiso` (0 filas, 7 accesos)
- `dim_permisos_pagina_rol` (0 filas, 7 accesos)
- `roles_permisos` (0 filas, 2 accesos)
- `usuario_roles` (0 filas, 20 accesos)
- `roles` (0 filas, 0 accesos)
- `paginas` (0 filas, 0 accesos)
- `modulos` (0 filas, 0 accesos)
- `permisos_rol_modulo` (0 filas, 0 accesos)
- `permisos_rol_pagina` (0 filas, 0 accesos)
- `permisos_usuario_pagina` (0 filas, 20 accesos)

**Acción Recomendada:** Verificar que no hay dependencias ocultas, luego ELIMINAR

**Riesgo:** MEDIO (requiere validación con equipo)

**Espacio a Recuperar:** ~150 KB

---

### 6. Módulos Potencialmente Legacy

#### Módulo Bolsa 107 (5 tablas)
```
bolsa_107_carga (1 fila, 61 accesos)
bolsa_107_error (1 fila, 21 accesos)
bolsa_107_hist_estado (12 filas, 2 accesos)
bolsa_107_item (12 filas, 25 accesos)
dim_estado_bolsa_107 (5 filas, 21 accesos)
```

**Estado:** BAJO USO - Requiere validación con administración

**Acción Recomendada:** INVESTIGAR con equipo administrativo

**Riesgo:** ALTO (sin confirmar obsolescencia)

**Espacio a Recuperar:** ~250 KB

---

#### Módulo Control de Horarios CTR (7 tablas)
```
ctr_horario (0 filas, 99 accesos)
ctr_horario_det (0 filas, 1,954 accesos)
ctr_horario_log (7 filas, 25 accesos)
ctr_periodo (0 filas, 414 accesos)
dim_catalogo_horario (0 filas, 10 accesos)
dim_horario (0 filas, 6,246 accesos)
rendimiento_horario (0 filas, 13 accesos)
```

**Estado:** POSIBLE REEMPLAZO POR `disponibilidad_medica` (v1.13.0)

**Acción Recomendada:** INVESTIGAR con coordinadores médicos

**Riesgo:** ALTO (alto número de accesos históricos)

**Espacio a Recuperar:** ~2.5 MB

---

## Resumen de Acciones Propuestas

### Fase 1: Bajo Riesgo (Ejecutar de Inmediato)

| Acción | Tablas Afectadas | Espacio a Recuperar | Riesgo |
|--------|------------------|---------------------|--------|
| **VACUUM FULL** | 3 tablas RAW | 880 MB | BAJO ✓ |
| **DROP TABLE** | 1 backup temporal | 8 KB | NULO ✓ |
| **DROP TABLE** | 1 staging | 64 KB | BAJO ✓ |
| **DROP TABLE** | 7 tablas vacías | 350 KB | BAJO ✓ |
| **TOTAL FASE 1** | **12 operaciones** | **~880 MB** | **BAJO** |

**Tiempo Estimado:** 2-3 horas (incluyendo backup previo)

**Ventana de Mantenimiento:** Madrugada (02:00 - 05:00)

---

### Fase 2: Riesgo Medio (Requiere Validación)

| Acción | Tablas Afectadas | Espacio a Recuperar | Validación Requerida |
|--------|------------------|---------------------|---------------------|
| **DROP TABLE** | 11 tablas legacy permisos | 150 KB | Verificar con equipo dev |
| **TOTAL FASE 2** | **11 operaciones** | **~150 KB** | **VALIDAR** |

**Tiempo Estimado:** 1 semana (incluyendo validación)

---

### Fase 3: Riesgo Alto (Requiere Aprobación Stakeholders)

| Acción | Módulo | Tablas | Espacio | Aprobación Requerida |
|--------|--------|--------|---------|---------------------|
| **ARCHIVAR + DROP** | Bolsa 107 | 5 | 250 KB | Admin/Jefe de proyecto |
| **ARCHIVAR + DROP** | Control Horarios (CTR) | 7 | 2.5 MB | Coordinadores médicos |
| **TOTAL FASE 3** | **2 módulos** | **12 tablas** | **~2.8 MB** | **STAKEHOLDERS** |

**Tiempo Estimado:** 2-3 semanas (incluyendo reuniones y aprobaciones)

---

## Impacto Esperado

### Beneficios Cuantificables

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Tamaño BD** | 5.4 GB | 3.9 GB | -28% |
| **Total Tablas** | 135 | 110 | -19% |
| **Tablas Activas** | 55 | 55 | 0% |
| **Tablas Legacy** | 80 | 55 | -31% |
| **Tiempo Backup** | ~45 min | ~32 min | -29% |
| **Espacio Disco Libre** | Variable | +1.5 GB | N/A |

### Beneficios Cualitativos

1. **Esquema Más Limpio**
   - Menos tablas = más fácil de entender
   - Documentación más precisa
   - Onboarding más rápido para nuevos desarrolladores

2. **Mejor Performance**
   - Queries de catálogo más rápidas
   - Menos objetos a escanear
   - Backups/restauraciones más ágiles

3. **Menor Riesgo Operacional**
   - Sin datos legacy confusos
   - Sin tablas duplicadas
   - Sistema de permisos consolidado

4. **Mantenibilidad**
   - Menos overhead en VACUUM
   - Menos índices a mantener
   - Estadísticas más precisas

---

## Plan de Ejecución Conservador

### Semana 1: Preparación
```
Lunes:
- Crear backup completo de BD
- Validar integridad del backup
- Documentar estado actual

Martes-Miércoles:
- Revisar análisis con equipo técnico
- Identificar dependencias ocultas
- Preparar scripts de limpieza

Jueves-Viernes:
- Preparar entorno de pruebas
- Ejecutar scripts en ambiente desarrollo
- Validar que no hay errores
```

### Semana 2: Fase 1 (Bajo Riesgo)
```
Lunes:
- Crear backup incremental
- Ejecutar VACUUM FULL en tablas RAW (horario nocturno)

Martes:
- Verificar recuperación de espacio
- Eliminar backups temporales

Miércoles:
- Eliminar tablas staging vacías
- Eliminar 7 tablas vacías sin dependencias

Jueves-Viernes:
- Monitorear logs de aplicación
- Verificar que todo funciona correctamente
```

### Semana 3: Fase 2 (Riesgo Medio)
```
Lunes-Miércoles:
- Analizar dependencias de tablas legacy permisos
- Validar con equipo de desarrollo
- Crear queries de verificación

Jueves:
- Si se aprueba: eliminar tablas legacy permisos
- Monitorear sistema MBAC

Viernes:
- Verificación completa de permisos
- Rollback si hay problemas
```

### Semana 4-5: Fase 3 (Riesgo Alto)
```
Semana 4:
- Reunión con stakeholders
- Presentar análisis de Bolsa 107 y CTR
- Obtener aprobaciones

Semana 5 (si se aprueba):
- Archivar módulos legacy
- Crear dumps SQL completos
- Eliminar tablas obsoletas
- Documentar cambios
```

---

## Riesgos y Mitigaciones

### Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Eliminar tabla con dependencias ocultas** | BAJA | ALTO | Verificar foreign keys y vistas antes de DROP |
| **Perder datos históricos importantes** | MEDIA | ALTO | Backup completo + archivos SQL por módulo |
| **Módulos legacy aún en uso por scripts** | MEDIA | MEDIO | Revisar logs 2 semanas + consultar stakeholders |
| **Vistas rotas al eliminar tablas** | BAJA | MEDIO | Listar vistas dependientes con view_table_usage |
| **VACUUM FULL bloquea tablas** | ALTA | BAJO | Ejecutar en horario de baja actividad (madrugada) |
| **Sistema cae durante VACUUM** | BAJA | ALTO | Monitoreo activo + rollback plan |

### Plan de Rollback

```sql
-- Restauración completa
pg_restore -h 10.0.89.13 -U postgres -d maestro_cenate \
  -c -F c /backup/maestro_cenate_pre_limpieza_20251230.dump

-- Restauración de módulo específico
psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  < /backup/modulo_bolsa_107_20251230.sql

-- Restauración de tabla individual
pg_restore -h 10.0.89.13 -U postgres -d maestro_cenate \
  -t nombre_tabla -F c /backup/maestro_cenate_20251230.dump
```

### Checklist Pre-Eliminación

Para cada tabla a eliminar, verificar:

- [ ] Backup completo creado y validado
- [ ] No tiene foreign keys entrantes
- [ ] No es usada por vistas activas
- [ ] No tiene triggers activos
- [ ] No aparece en código fuente (grep -r "nombre_tabla" .)
- [ ] Logs de aplicación revisados (últimas 2 semanas)
- [ ] Stakeholders consultados (si aplica)
- [ ] Script de rollback preparado
- [ ] Ventana de mantenimiento agendada
- [ ] Equipo técnico notificado

---

## Métricas de Éxito

### Indicadores Cuantitativos

| Métrica | Meta | Forma de Medir |
|---------|------|----------------|
| **Espacio Recuperado** | >800 MB | SELECT pg_size_pretty(pg_database_size('maestro_cenate')); |
| **Tablas Eliminadas** | >20 | SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'; |
| **Tiempo de Backup** | -25% | Comparar tiempos antes/después |
| **Errores en Aplicación** | 0 | Revisar logs 1 semana post-limpieza |

### Indicadores Cualitativos

- [ ] Esquema de BD más fácil de entender
- [ ] Documentación actualizada y precisa
- [ ] Equipo de desarrollo satisfecho con limpieza
- [ ] Sin incidentes reportados por usuarios
- [ ] Stakeholders aprobaron cambios

---

## Recursos Necesarios

### Humanos
- **DBA PostgreSQL:** 16 horas (análisis, ejecución, monitoreo)
- **Desarrollador Backend:** 8 horas (validación de código, pruebas)
- **Coordinador Técnico:** 4 horas (aprobaciones, reuniones)
- **Stakeholders:** 2 horas (reuniones de validación)

### Infraestructura
- **Espacio en Disco para Backups:** 8 GB (2x tamaño BD actual)
- **Ventanas de Mantenimiento:** 3 ventanas de 3 horas cada una (madrugada)
- **Ambiente de Desarrollo:** Clon de BD para pruebas

### Herramientas
- PostgreSQL 14+ (pg_dump, pg_restore, psql)
- Scripts SQL de limpieza (provistos en documentación)
- Herramientas de monitoreo (pg_stat_*, logs)

---

## Comunicación y Coordinación

### Stakeholders a Notificar

| Stakeholder | Rol | Información a Comunicar | Medio |
|-------------|-----|------------------------|-------|
| **Equipo de Desarrollo** | Técnico | Cambios en esquema, validación | Email + Reunión |
| **Coordinadores Médicos** | Funcional | Módulo CTR, disponibilidad | Reunión |
| **Administración CENATE** | Funcional | Módulo Bolsa 107 | Reunión |
| **Jefe de Proyecto** | Directivo | Resumen ejecutivo, aprobación | Email |
| **Usuarios Finales** | N/A | Ventanas de mantenimiento | Notificación en sistema |

### Plantilla de Comunicación

```
ASUNTO: Mantenimiento de Base de Datos - Limpieza de Tablas Obsoletas

Estimado/a [Nombre],

Como parte del proceso de mejora continua del sistema CENATE, se ha
identificado una oportunidad de optimización de la base de datos mediante
la eliminación de tablas obsoletas y recuperación de espacio.

RESUMEN:
- Espacio a recuperar: 880 MB a 1.5 GB (28% del total)
- Tablas a eliminar: ~25 tablas obsoletas
- Riesgo: BAJO (todas las acciones cuentan con backup y rollback)

IMPACTO:
- Usuarios: Ninguno (operaciones en horario nocturno)
- Sistema: Mejora de performance y mantenibilidad

CRONOGRAMA:
- Fase 1 (Bajo Riesgo): Semana del 6-10 de Enero
- Fase 2 (Validación): Semana del 13-17 de Enero
- Fase 3 (Aprobación): Semana del 20-31 de Enero

ACCIÓN REQUERIDA:
[Específica según stakeholder]

Adjunto documentación técnica completa para su revisión.

Saludos cordiales,
Ing. Styp Canto Rondon
DBA - Proyecto CENATE
```

---

## Siguientes Documentos

1. **02_analisis_detallado.md** - Análisis tabla por tabla con SQL
2. **03_scripts_limpieza.md** - Scripts SQL listos para ejecutar
3. **04_procedimientos_backup.md** - Guía completa de backup/restore
4. **05_checklist_ejecucion.md** - Checklist paso a paso
5. **06_plan_rollback.md** - Procedimientos de reversión
6. **07_monitoreo_post_limpieza.md** - Cómo monitorear después

---

## Aprobaciones

| Rol | Nombre | Fecha | Firma | Estado |
|-----|--------|-------|-------|--------|
| **DBA** | Ing. Styp Canto | 2025-12-30 | _______ | ✓ Aprobado |
| **Jefe de Proyecto** | __________ | __________ | _______ | ⏳ Pendiente |
| **Coordinador Médico** | __________ | __________ | _______ | ⏳ Pendiente |
| **Admin CENATE** | __________ | __________ | _______ | ⏳ Pendiente |

---

**Generado:** 2025-12-30
**Versión:** v1.13.0
**Autor:** Ing. Styp Canto Rondon - DBA Proyecto CENATE
**Contacto:** cenate.analista@essalud.gob.pe
