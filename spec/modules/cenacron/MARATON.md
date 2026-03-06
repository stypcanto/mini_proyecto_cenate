# Estrategia MARATÓN (EST-008) — Documentación Técnica

> **Estado:** ✅ Módulo propio en Sidebar + Embudo de citación + Modal pacientes por categoría + Fix barra progreso campaña (v1.85.10)
> **Versión:** v1.85.10 (2026-03-06)
> **Responsable carga:** Jesús Morales Carlos (DBA) — id_user = 53, login: 70076049

---

## Descripción

Estrategia de seguimiento para pacientes del programa MARATÓN pertenecientes a la
Red R.A. SABOGAL y redes adicionales. Cargada en **2 fases** entre el 2026-03-04 y 2026-03-05.

| Campo | Valor |
|-------|-------|
| `id_estrategia` | 8 |
| `sigla` | MARATON |
| `desc_estrategia` | PACIENTES MARATON |
| `id_bolsa` | 17 (`dim_tipos_bolsas.cod_tipo_bolsa = BOLSA_MARATON`) |
| Red principal | R.A. SABOGAL |
| **Universo total** | **13,400 pacientes únicos** (verificado 2026-03-05) |
| MARATÓN + CENACRON | 6,020 (1ra carga — `paciente_cronico = true`) |
| MARATÓN Especialidades | 7,380 (2da carga — `paciente_cronico = false`) |
| Estado registros | ACTIVO |

---

## Cargas masivas — Dos fases

```
┌──────────────────┬──────────────────┬──────────────────┐
│                  │    1ra Carga     │    2da Carga     │
├──────────────────┼──────────────────┼──────────────────┤
│ Fecha            │ 2026-03-04       │ 2026-03-05       │
├──────────────────┼──────────────────┼──────────────────┤
│ Usuario          │ 70076049 (id=53) │ 70076049 (id=53) │
├──────────────────┼──────────────────┼──────────────────┤
│ Pacientes        │ 6,020            │ 7,380            │
├──────────────────┼──────────────────┼──────────────────┤
│ IPRESS distintas │ 54               │ 62               │
├──────────────────┼──────────────────┼──────────────────┤
│ Total acumulado  │ 6,020            │ 13,400           │
└──────────────────┴──────────────────┴──────────────────┘
```

Ambas cargas ejecutadas directamente en BD por el DBA (sin Flyway).

### Segmentación interna del universo

```
MARATÓN TOTAL: 13,400
├── 6,020 → MARATÓN + CENACRON        (1ra carga, 2026-03-04)
│           paciente_cronico = true
│           Badge: 🟣 CENACRON + 🟠 MARATÓN
│           IPRESS: 54 distintas (principal: H.I OCTAVIO MONGRUT 412)
│
└── 7,380 → MARATÓN ESPECIALIDADES    (2da carga, 2026-03-05)
            paciente_cronico = false
            Badge: solo 🟠 MARATÓN
            IPRESS: 62 distintas
```

> **Regla:** El badge CENACRON en Lista de Asegurados se basa en `asegurados.paciente_cronico = true`.
> Solo los 6,020 de la 1ra carga deben tener este campo en `true`.

### 1ra Carga — 2026-03-04 (Migración V6_29_0)

**Script:** `backend/src/main/resources/db/migration/V6_29_0__inscribir_maraton_mongrut_en_paciente_estrategia.sql`

**Fuente:** `stg_cronicos_cenate` — carga 2026-03-03
**Filtro fuente:** `cod_centro = '412'` (H.I O. MONGRUT)
**Ejecutado por:** Jesús Morales Carlos (DBA), id_user = 53
**Fecha ejecución:** 2026-03-04
**Protección duplicados:** `ON CONFLICT DO NOTHING` (índice `idx_pac_est_activo_unico`)

```sql
INSERT INTO paciente_estrategia (pk_asegurado, id_estrategia, id_usuario_asigno,
                                  fecha_asignacion, estado, created_at, updated_at)
SELECT a.pk_asegurado, 8, 53, '2026-03-04 00:00:00'::timestamp, 'ACTIVO', NOW(), NOW()
FROM stg_cronicos_cenate sc
JOIN asegurados a ON a.doc_paciente = sc.num_doc_px_norm
WHERE sc.cod_centro = '412'
ON CONFLICT DO NOTHING;
```

### 2da Carga — 2026-03-05 (manual en BD)

**Fuente:** `stg_cronicos_cenate` — ampliación a múltiples IPRESS de Red Sabogal y otras redes
**Ejecutado por:** Jesús Morales Carlos (DBA), id_user = 53
**Fecha ejecución:** 2026-03-05
**Nota:** Sin script Flyway — ejecutado directamente en BD. Sin query documentado.

---

## Filtros en Lista de Asegurados

**Ruta:** `/asegurados/buscar`

### Botones de filtro (3 niveles)

```
[Solo MARATÓN]  →  muestra 13,400 (todos)
   ├── [MARATÓN - CENACRON]       →  6,020  (paciente_cronico = true)
   └── [MARATÓN - ESPECIALIDADES] →  7,380  (paciente_cronico = false)
```

Los sub-botones "MARATÓN - CENACRON" y "MARATÓN - ESPECIALIDADES" solo aparecen
cuando "Solo MARATÓN" está activo. Son mutuamente excluyentes (toggle individual).

### Comportamiento especial del filtro

- **Ignora `vigencia`:** Muestra el universo completo cargado (incluye pacientes con `vigencia = false`).
  Los 6,020 de Jesús Morales son el universo fuente; `vigencia = true` los reduciría a ~2,622.
- **Fallback IPRESS:** Pacientes cuyos `cas_adscripcion` no tienen match en `dim_ipress`
  muestran automáticamente "H.I OCTAVIO MONGRUT MUÑOZ / 412" (regla de negocio confirmada
  por Jesús Morales: todos los MARATÓN son de esa IPRESS).

### Parámetros API

```
GET /api/asegurados?maraton=true                                    → 13,400
GET /api/asegurados?maraton=true&cenacron=true                      →  6,020
GET /api/asegurados?maraton=true&maratonEspecialidades=true         →  7,380
GET /api/asegurados/buscar?q=NOMBRE&maraton=true
GET /api/asegurados/buscar?q=NOMBRE&maraton=true&maratonEspecialidades=true
```

### Lógica backend (AseguradoController.java)

```java
// Cuando maraton=true: WHERE reemplaza vigencia por EXISTS en paciente_estrategia
StringBuilder whereClause = Boolean.TRUE.equals(maraton)
    ? new StringBuilder(" WHERE EXISTS (SELECT 1 FROM paciente_estrategia pe"
                      + " WHERE pe.pk_asegurado = a.pk_asegurado"
                      + " AND pe.id_estrategia = 8 AND pe.estado = 'ACTIVO')")
    : new StringBuilder(" WHERE a.vigencia = true");

// Sub-filtro CENACRON: solo los de la 1ra carga (paciente_cronico = true)
if (Boolean.TRUE.equals(cenacron)) {
    whereClause.append(" AND a.paciente_cronico = true");
}

// Sub-filtro MARATÓN Especialidades: solo los de la 2da carga (paciente_cronico = false)
if (Boolean.TRUE.equals(maratonEspecialidades)) {
    whereClause.append(" AND (a.paciente_cronico = false OR a.paciente_cronico IS NULL)");
}

// Fallback IPRESS en mapeo de resultados
// ⚠️ NOTA: este fallback aplica solo a pacientes sin match en dim_ipress.
// Con la 2da carga (62 IPRESS distintas) la mayoría ya tiene cas_adscripcion correcto.
if (esMaraton && nombreIpress == null) {
    asegurado.put("nombreIpress", "H.I OCTAVIO MONGRUT MUÑOZ");
    asegurado.put("casAdscripcion", "412");
}
```

### Estado verificado (2026-03-06)

| Filtro | Resultado esperado | Resultado API | Estado |
|--------|-------------------|---------------|--------|
| `maraton=true` | 13,400 | 13,400 | ✅ |
| `maraton=true&cenacron=true` | 6,020 | 6,020 | ✅ |
| `maraton=true&maratonEspecialidades=true` | 7,380 | 7,380 | ✅ |

---

## Badge en tabla

Los pacientes MARATÓN muestran badge naranja `🏃 MARATÓN` en la columna NOMBRE
(componente `BuscarAsegurado.jsx`, campo `asegurado.esMaraton`).

El campo `esMaraton` se calcula en tiempo real vía EXISTS subquery en el SELECT:
```sql
EXISTS (SELECT 1 FROM paciente_estrategia pe
        JOIN dim_estrategia_institucional dei ON dei.id_estrategia = pe.id_estrategia
        WHERE pe.pk_asegurado = a.pk_asegurado
          AND dei.sigla = 'MARATON' AND pe.estado = 'ACTIVO') AS es_maraton
```

---

## Módulo Maratón 2026 en Sidebar (v1.86.0)

**Migración:** `V6_32_0__modulo_maraton_2026.sql`

Nuevo módulo de primer nivel en el sidebar, accesible a:
- Todos los roles `COORDINADOR*`
- `SUPERADMIN`
- `SUBDIRECCION_DE_TELESALUD`
- `GESTOR DE CITAS`

### Páginas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/maraton2026/avances-citacion` | `MaratonAvancesCitacion.jsx` | Embudo de citación por segmento |
| `/maraton2026/resumen-atencion` | `MaratonResumenAtencion.jsx` | Resumen de atenciones (placeholder) |

### Embudo de Citación — `MaratonAvancesCitacion.jsx`

Visualización tipo funnel/sankey con datos en tiempo real:

```
TOTAL PACIENTES (13,400)
├── MARATÓN - CRÓNICOS (6,086)  ──→  CITADOS     698  (11.5%)
│                                ──→  OBSERVADOS  794  (13.1%)
│                                ──→  PENDIENTES 4,594 (75.5%)
│
└── MARATÓN - ESPECIALIDADES (7,476) ──→  CITADOS     21  (0.3%)
                                     ──→  OBSERVADOS   51  (0.7%)
                                     ──→  PENDIENTES 7,404 (99.0%)
```

**Endpoints consumidos:**
```
GET /api/asegurados?maraton=true&page=0&size=1         → universoTotal (totalElements)
GET /api/bolsas/estadisticas/maraton-desglose          → [{segmento, estado, cantidad}]
```

**Clasificación de estados:**
| Categoría UI | Estados BD |
|---|---|
| CITADOS | `CITADO` |
| PENDIENTES | `PENDIENTE_CITA`, `SIN_ESTADO` |
| OBSERVADOS | Todo lo demás (NO_CONTESTA, APAGADO, NO_DESEA, RECHAZADO, etc.) |

**Conector SVG:** líneas bezier entre los 2 segmentos izquierdos y las 6 filas derechas, con `preserveAspectRatio="none"` para adaptarse dinámicamente al alto del contenedor.

### Endpoints backend disponibles

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/bolsas/estadisticas/maraton-segmentos` | `{cenacronCitados, especialidadesCitados}` |
| `GET /api/bolsas/estadisticas/maraton-kpi` | KPI por paciente único con DISTINCT ON — suma exacta 13,400 |
| `GET /api/bolsas/estadisticas/maraton-desglose` | `[{segmento, estado, cantidad}]` completo |
| `GET /api/bolsas/estadisticas/maraton-pacientes` | Lista paginada de pacientes por categoría del embudo |

#### `/maraton-pacientes` — Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `categoria` | String | Ver tabla de categorías abajo |
| `busqueda` | String (opcional) | Filtra por nombre o DNI (LIKE) |
| `page` | int (default 0) | Página actual (0-indexed) |
| `size` | int (default 50) | Registros por página |

#### Categorías disponibles

| Categoría | Filtro SQL | Pacientes (~) |
|-----------|-----------|---------------|
| `POR_ASIGNAR` | `responsable_gestora_id IS NULL` | 10,213 |
| `EN_CONTACTO` | Con gestora, sin cita ni observado | 1,624 |
| `CITAS_LOGRADAS` | estado IN ('CITADO','ATENDIDO') | 719 |
| `OBSERVADOS` | estado IN (NO_CONTESTA, APAGADO, NO_DESEA, …) | 844 |
| `CITADOS_CENACRON` | CITAS_LOGRADAS + `paciente_cronico = true` | 698 |
| `CITADOS_ESPECIALIDADES` | CITAS_LOGRADAS + `paciente_cronico = false` | 21 |

> Usa DISTINCT ON para garantizar un único registro por paciente (prioridad CITADO > ATENDIDO > OBSERVADO > … > PENDIENTE).

#### Respuesta

```json
{
  "content": [
    { "tipo_doc": "DNI", "num_doc": "12345678", "nombre_completo": "APELLIDOS NOMBRES",
      "sexo": "M", "edad": 65, "ipress": "H.I OCTAVIO MONGRUT MUÑOZ",
      "red": "RED ASISTENCIAL SABOGAL", "macrorred": "LIMA ORIENTE" }
  ],
  "totalElements": 10213,
  "page": 0,
  "size": 50,
  "totalPages": 205
}
```

### Permisos registrados

Tablas actualizadas por `V6_32_0`:
- `dim_modulos_sistema` → id_modulo = 52 (orden = 50)
- `dim_paginas_modulo` → id_pagina 171 (Avances) y 172 (Resumen)
- `segu_permisos_rol_pagina` → 9 roles con `puede_ver = true, puede_exportar = true`
- `segu_permisos_rol_modulo` → idem (requerido por `fn_seguridad_obtener_menu_usuario_vf`)
- `permisos_modulares` → inserción manual por usuario según necesidad

---

## Archivos modificados

| Archivo | Cambio | Versión |
|---------|--------|---------|
| `AseguradoController.java` | Param `maraton`, WHERE sin vigencia, fallback IPRESS | v1.84.14 |
| `AseguradoController.java` | Params `maratonEspecialidades` en GET / y GET /buscar | v1.85.7 |
| `BuscarAsegurado.jsx` | Estado `soloMaraton`, botón UI, params API | v1.84.14 |
| `BuscarAsegurado.jsx` | Estado `maratonSubfiltro`, sub-botones CENACRON / ESPECIALIDADES | v1.85.7 |
| `V6_29_0__inscribir_maraton_mongrut_en_paciente_estrategia.sql` | 1ra carga masiva 6,020 pacientes | v1.84.14 |
| `V6_32_0__modulo_maraton_2026.sql` | Módulo sidebar + páginas + permisos rol | v1.86.0 |
| `MaratonAvancesCitacion.jsx` | Embudo visual SVG por segmento con datos reales | v1.86.0 |
| `MaratonResumenAtencion.jsx` | Placeholder KPI cards listo para endpoint | v1.86.0 |
| `SolicitudBolsaEstadisticasController.java` | maraton-kpi, maraton-desglose, maraton-pacientes endpoints | v1.85.9 |
| `bolsasService.js` | obtenerKpiMaraton, obtenerDesgloseMaratonSegmentos, obtenerPacientesMaratonCategoria | v1.85.9 |
| `Solicitudes.jsx` | Cards M2–M5 clickeables + MetaCard clickeables + modal pacientes con buscador y paginación | v1.85.9 |
| `Solicitudes.jsx` | Fix barra de progreso campaña: denominador correcto + incluir ATENDIDO_IPRESS en completados | v1.85.10 |

---

## Correcciones aplicadas (2026-03-05)

Diagnóstico y fix ejecutado directamente en BD:

| Acción | Detalle |
|--------|---------|
| Fix `paciente_id = NULL` | UPDATE 70 registros en `dim_solicitud_bolsa` (id_bolsa=17) con `paciente_id` null — resuelto vía JOIN por DNI |
| Fix tipo documento CE | UPDATE `id_tip_doc = 2 (C.E./PAS)` para FORERO DIAZ HELMER y MUÑOZ CABRERA MYRIAM (extranjeros mal tipificados como DNI) |
| Limpieza duplicados `paciente_estrategia` | DELETE 2 entradas con `pk_asegurado` numérico erróneo (ceros adelante en CE) — dejando solo los `CRON-...` correctos |
| Universo final verificado | **13,400 pacientes únicos** — `paciente_estrategia` y `dim_solicitud_bolsa` id_bolsa=17 consensuados al 100% |
| Fix badge CENACRON | UPDATE `paciente_cronico = false` para 71 de 2da carga (MARATÓN Especialidades incorrectamente marcados) |
| Fix badge CENACRON faltante | UPDATE `paciente_cronico = true` para 3 de 1ra carga que no tenían el badge |
| Resultado badge | 6,020 con CENACRON + MARATÓN ✅ — 7,380 solo MARATÓN Especialidades ✅ |

---

## Modal de Pacientes por Categoría (v1.85.9)

Al hacer clic en cualquier card del embudo o en los termómetros de meta se abre un modal con:

- **Header:** título de la categoría con su color
- **Buscador:** filtra en tiempo real por nombre o DNI
- **Tabla 8 columnas:** Tipo Doc · N° Documento · Nombres y Apellidos · Sexo · Edad · IPRESS · Red · Macrorred
- **Paginación:** 50 registros por página, navegación Anterior / Siguiente

### Cards clickeables

| Card | Categoría API | Color |
|------|--------------|-------|
| ② Por Asignar | `POR_ASIGNAR` | Rojo |
| ③ En Contacto | `EN_CONTACTO` | Naranja |
| ④ Citas Logradas | `CITAS_LOGRADAS` | Verde |
| ⑤ Observados | `OBSERVADOS` | Ámbar |
| Termómetro MARATÓN CENACRON | `CITADOS_CENACRON` | Violeta |
| Termómetro MARATÓN Especialidades | `CITADOS_ESPECIALIDADES` | Azul |

---

---

## Barra de Progreso de Campaña (v1.85.10)

Sección "Progreso de la campaña" en `/bolsas/solicitudespendientes/maraton`.

### Bug corregido

**Síntoma:** Mostraba "91.8% gestionado" cuando el progreso real era ~10%.

**Causa raíz en `Solicitudes.jsx`:**
1. Denominador = `estadisticas.total` (suma de TODOS los estados del KPI, incluyendo `SIN_GESTORA`, `CON_GESTORA`, y otros estados no mapeados que distorsionaban el total).
2. `ATENDIDO_IPRESS` estaba excluido del numerador (no sumaba en `atendidos` ni en `totalObservados`) pero SÍ estaba en el denominador → numerador < denominador de forma incorrecta.

**Fix aplicado:**
```javascript
// ANTES (bug):
const total = estadisticas.total || 1;  // incluye estados no mapeados
const atendidos = estadisticas.atendidos || 0;  // solo ATENDIDO puro

// DESPUÉS (correcto):
const atendidosIpress = estadisticasGlobales.find(s => s.estado?.toUpperCase() === 'ATENDIDO_IPRESS')?.cantidad || 0;
const atendidosTotal = atendidos + atendidosIpress;
const total = Math.max(pendientes + atendidosTotal + citados + totalObservados, 1);
```

**Resultado:** Con Pendientes=11,837 · Citados=719 · Observados=598 → avancePct ≈ 10.0% ✅

### Lógica de colores en la barra

| Color | Estado | Significado |
|-------|--------|-------------|
| 🟢 Esmeralda | `ATENDIDO` + `ATENDIDO_IPRESS` | Completados |
| 🔵 Azul | `CITADO` | Cita agendada |
| 🟡 Ámbar | Todo lo demás (NO_CONTESTA, APAGADO, NO_DESEA…) | Observados |
| ⬜ Gris | `PENDIENTE_CITA` | Sin gestión |

---

*Última actualización: 2026-03-06 v1.85.10 | Autor: Styp Canto Rondón / Claude Code*
