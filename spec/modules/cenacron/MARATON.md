# Estrategia MARATÓN (EST-008) — Documentación Técnica

> **Estado:** ✅ Cargado masivamente + Filtro operativo en Lista Asegurados
> **Versión:** v1.84.14 (2026-03-04)
> **Responsable carga:** Jesús Morales Carlos (DBA) — id_user = 53

---

## Descripción

Estrategia de seguimiento para pacientes del programa MARATÓN pertenecientes a la
**H.I OCTAVIO MONGRUT MUÑOZ** (Red R.A. SABOGAL, cod_ipress = 412).

| Campo | Valor |
|-------|-------|
| `id_estrategia` | 8 |
| `sigla` | MARATON |
| `desc_estrategia` | PACIENTES MARATON |
| IPRESS origen | H.I OCTAVIO MONGRUT MUÑOZ (Cód: 412) |
| Red | R.A. SABOGAL |
| Pacientes cargados | 6,020 (carga 2026-03-04) |
| Estado registros | ACTIVO |

---

## Carga masiva — Migración V6_29_0

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

---

## Filtro en Lista de Asegurados

**Ruta:** `/asegurados/buscar`
**Botón:** "Solo MARATÓN" (naranja, ícono ⚡)

### Comportamiento especial del filtro

- **Ignora `vigencia`:** Muestra el universo completo cargado (incluye pacientes con `vigencia = false`).
  Los 6,020 de Jesús Morales son el universo fuente; `vigencia = true` los reduciría a ~2,622.
- **Fallback IPRESS:** Pacientes cuyos `cas_adscripcion` no tienen match en `dim_ipress`
  muestran automáticamente "H.I OCTAVIO MONGRUT MUÑOZ / 412" (regla de negocio confirmada
  por Jesús Morales: todos los MARATÓN son de esa IPRESS).

### Parámetro API

```
GET /api/asegurados?maraton=true
GET /api/asegurados/buscar?q=NOMBRE&maraton=true
```

### Lógica backend (AseguradoController.java)

```java
// Cuando maraton=true: WHERE reemplaza vigencia por EXISTS en paciente_estrategia
StringBuilder whereClause = Boolean.TRUE.equals(maraton)
    ? new StringBuilder(" WHERE EXISTS (SELECT 1 FROM paciente_estrategia pe
                          WHERE pe.pk_asegurado = a.pk_asegurado
                          AND pe.id_estrategia = 8 AND pe.estado = 'ACTIVO')")
    : new StringBuilder(" WHERE a.vigencia = true");

// Fallback IPRESS en mapeo de resultados
if (esMaraton && nombreIpress == null) {
    asegurado.put("nombreIpress", "H.I OCTAVIO MONGRUT MUÑOZ");
    asegurado.put("casAdscripcion", "412");
}
```

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

## Archivos modificados (v1.84.14)

| Archivo | Cambio |
|---------|--------|
| `AseguradoController.java` | Param `maraton`, WHERE sin vigencia, fallback IPRESS |
| `BuscarAsegurado.jsx` | Estado `soloMaraton`, botón UI, params API |
| `V6_29_0__inscribir_maraton_mongrut_en_paciente_estrategia.sql` | Carga masiva 6,020 pacientes |

---

*Última actualización: 2026-03-04 | Autor: Styp Canto Rondón / Claude Code*
