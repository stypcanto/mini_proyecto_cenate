# Arquitectura IPRESS — Refactor FK Unificado

> **Fecha:** 2026-03-03
> **Autor:** Styp Canto Rondón / Claude Code
> **Versión:** v1.82.x
> **Estado:** ✅ Backend refactorizado — Columnas texto pendientes de drop (Fase B)

---

## 🔴 Problema Original

`dim_solicitud_bolsa` tenía **3 columnas** para representar la misma IPRESS de adscripción:

| Columna | Tipo | Problema |
|---------|------|----------|
| `codigo_adscripcion` | TEXT | Sin leading zeros ("21" en vez de "021"), inconsistente |
| `codigo_ipress` | TEXT | Duplicado exacto de `codigo_adscripcion`, sin valor propio |
| `id_ipress` | BIGINT FK | Fuente de verdad correcta — pero muchos NULL |

### Síntomas
- Queries JOIN con `codigo_ipress = di.cod_ipress` fallaban silenciosamente (mismatch "21" vs "021")
- `id_ipress` NULL en 736+ registros que sí tenían `codigo_adscripcion` válido
- Pantalla mostraba `407/NULL` — código visible pero FK sin resolver
- PADOMI (sin `paciente_id` en `asegurados`) nunca se resolvía vía backfill anterior

---

## ✅ Solución en 3 Fases

### Fase A.1 — Backfill (V6_22_0)

**Archivo:** `db/migration/V6_22_0__fix_id_ipress_y_codigo_adscripcion_normalizacion.sql`

1. **PASO 1:** Normaliza `codigo_adscripcion` a 3 dígitos con LPAD (`"21"` → `"021"`)
2. **PASO 2:** Backfill `id_ipress` directo desde `codigo_adscripcion` normalizado (cubre PADOMI sin `paciente_id`)
3. **PASO 3:** Segundo intento vía `asegurados` JOIN para pacientes que aún faltan

**Resultado:** 736 registros resueltos. 2,001 quedan NULL legítimamente (CENACRON, recitas, sin adscripción).

---

### Fase A.2 — Trigger Bidireccional (V6_24_0)

**Archivo:** `db/migration/V6_24_0__trigger_bidireccional_ipress.sql`
*(V6_23_0 fue versión unidireccional intermedia, reemplazada por V6_24_0)*

**Función:** `fn_sync_ipress_bidireccional()`
**Trigger:** `trg_sync_ipress_bidireccional` — BEFORE INSERT OR UPDATE OF `id_ipress`, `codigo_adscripcion`

```
Dirección A: id_ipress SET → auto-deriva codigo_adscripcion + codigo_ipress desde dim_ipress.cod_ipress
Dirección B: codigo_adscripcion SET (id_ipress=NULL) → normaliza LPAD + resuelve id_ipress
```

**Garantía:** Siempre quedan consistentes sin importar qué columna establezca el código Java.

---

### Fase A.3 — Refactor Backend

Toda la lógica Java apunta ahora exclusivamente a FKs:

#### Repository (`SolicitudBolsaRepository.java`)

| Antes | Después |
|-------|---------|
| `LEFT JOIN dim_ipress di ON sb.codigo_ipress = di.cod_ipress` | `LEFT JOIN dim_ipress di ON sb.id_ipress = di.id_ipress` |
| `sb.codigo_ipress as codigo_ipress` | `di.cod_ipress as codigo_ipress` |
| `COALESCE(sb.codigo_adscripcion, di.cod_ipress) as codigo_adscripcion` | `di.cod_ipress as codigo_adscripcion` |
| `estadisticasPorIpress: GROUP BY sb.codigo_ipress` | `GROUP BY di.cod_ipress` |
| `buscarModulo107Casos: s.codigoAdscripcion = :codigoIpress` | Subquery: `s.idIpress IN (SELECT di.idIpress FROM Ipress di WHERE di.codIpress = :codigoIpress)` |

**Queries afectadas (13 cambios):**
- `findAllWithBolsaDescription`
- `findAllWithBolsaDescriptionPaginado`
- `findAllWithFiltersAndPagination`
- `findAllGestionadosList`
- `estadisticasPorIpress`
- `estadisticasModulo107PorIpress`
- `estadisticasPorMacrorregion`
- `estadisticasPorRed`
- `buscarModulo107Casos`

#### Service (`SolicitudBolsaServiceImpl.java`)

| Método | Antes | Después |
|--------|-------|---------|
| `buildSolicitudDTO()` | Leía `solicitud.getCodigoAdscripcion()` | Deriva de `ipressMap.get(solicitud.getIdIpress()).getCodIpress()` |
| `mapSolicitudBolsaToDTO()` | Leía columna texto | Deriva de `ipressRepository.findById(idIpress).getCodIpress()` |

---

## 🏗️ Arquitectura Actual (Fuente de Verdad)

```
dim_solicitud_bolsa
├── id_ipress          BIGINT FK → dim_ipress  ← ADSCRIPCIÓN (fuente de verdad)
├── id_ipress_atencion BIGINT FK → dim_ipress  ← ATENCIÓN (fuente de verdad)
│
│   [DEPRECATED — mantener para backup hasta autorización de drop]
├── codigo_adscripcion TEXT  ← sync automático vía trigger
└── codigo_ipress      TEXT  ← sync automático vía trigger (duplicado)
```

### Ejemplo de JOIN correcto

```sql
-- IPRESS de adscripción (origen del paciente)
LEFT JOIN dim_ipress di_ads ON sb.id_ipress = di_ads.id_ipress

-- IPRESS de atención (donde se atiende)
LEFT JOIN dim_ipress di_ate ON sb.id_ipress_atencion = di_ate.id_ipress

SELECT
    di_ads.cod_ipress   AS codigo_adscripcion,
    di_ads.desc_ipress  AS nombre_ipress_adscripcion,
    di_ate.cod_ipress   AS codigo_ipress_atencion,
    di_ate.desc_ipress  AS nombre_ipress_atencion
```

---

## 📋 Casos NULL Legítimos (no son errores)

| Origen | Cantidad aprox. | Motivo |
|--------|-----------------|--------|
| CENACRON (Bolsa 11) | ~1,699 | Pacientes crónicos sin IPRESS adscripción específica |
| Módulo 107 (Bolsa 1) | ~198 | Registros sin datos de adscripción |
| Recitas/Interconsultas | ~53 | Derivadas de bolsa original, no tienen IPRESS propia |
| PADOMI inactivos | ~20 | Dados de baja sin resolución |
| **Total legítimo** | **~2,001** | Ambas columnas NULL (sin info disponible) |

---

## 🚀 Fase B (Futura) — Drop Columnas Obsoletas

Una vez que el equipo de infraestructura confirme backup:

```sql
-- Solo ejecutar tras backup validado
ALTER TABLE dim_solicitud_bolsa DROP COLUMN codigo_adscripcion;
ALTER TABLE dim_solicitud_bolsa DROP COLUMN codigo_ipress;

-- Y limpiar funciones/triggers del backfill (ya no necesarios)
DROP TRIGGER IF EXISTS trg_sync_ipress_bidireccional ON dim_solicitud_bolsa;
DROP FUNCTION IF EXISTS fn_sync_ipress_bidireccional();
DROP FUNCTION IF EXISTS fn_sync_codigo_adscripcion();
```

---

## 🔍 Verificación Rápida

```sql
-- Verificar consistencia (debe retornar 0)
SELECT COUNT(*)
FROM dim_solicitud_bolsa sb
JOIN dim_ipress di ON sb.id_ipress = di.id_ipress
WHERE sb.codigo_adscripcion IS DISTINCT FROM di.cod_ipress;

-- Ver distribución de NULLs por bolsa
SELECT db.descripcion_bolsa, COUNT(*) FILTER (WHERE sb.id_ipress IS NULL) AS sin_ipress
FROM dim_solicitud_bolsa sb
JOIN dim_bolsa db ON sb.id_bolsa = db.id_bolsa
GROUP BY db.descripcion_bolsa
ORDER BY sin_ipress DESC;
```
