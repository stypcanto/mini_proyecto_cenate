# Mapeo de Carga Excel Dengue - Análisis y Decisiones

**Fecha:** 2026-01-29
**Archivo:** `Atendidos Dengue CENATE 2026-01-27.xlsx`
**Total registros:** 6548 casos

---

## 📊 Estructura del Excel

| Col | Nombre Excel | Tipo | Significado | Ejemplo |
|-----|--------------|------|-------------|---------|
| 1 | dni | string | DNI Paciente | 370941 |
| 2 | sexo | string | Sexo | M |
| 3 | edad | integer | Edad | 54 |
| 4 | fec_aten | datetime | Fecha de Atención | 2025-06-16 |
| 5 | cenasicod | integer | CAS Adscripción (código numérico) | 292 |
| 6 | dx_main | string | Código CIE-10 | A97.0, A97.1, A97.2 |
| 7 | servicio | string | **ACTIVIDAD** (Consulta externa, Emergencia) | Consulta externa |
| 8 | ipress | string | Nombre IPRESS | H.I CARLOS ALBERTO CORTEZ JIMENEZ |
| 9 | red | string | Red de Salud | Red Tumbes |
| 10 | nombre | string | Nombre Paciente | PARDO SANDOVAL CESAR |
| 11 | telef_fijo | string | Teléfono Fijo | NULL |
| 12 | telef_movil | string | Teléfono Móvil | NULL |
| 13 | fec_st | string | Fecha de Síntomas | "No hay información" o fecha |
| 14 | semana | string | Semana Epidemiológica | 2025SE25 |

---

## 🎯 Mapeo a dim_solicitud_bolsa

### ✅ CAMPOS A CARGAR

| Col Excel | Nombre | Campo DB | Nota |
|-----------|--------|----------|------|
| 1 | dni | paciente_id, paciente_dni | Normalizar a 8 dígitos |
| 2 | sexo | paciente_sexo | M/F |
| 4 | fec_aten | fecha_solicitud | Usar como fecha de solicitud |
| 5 | cenasicod | codigo_adscripcion | CAS Adscripción (PK para búsqueda) |
| 6 | dx_main | dx_main | CIE-10: A97.0, A97.1, A97.2 |
| 10 | nombre | paciente_nombre | Convertir a UPPERCASE, max 50 chars |
| 11 | telef_fijo | paciente_telefono | Puede ser NULL |
| 12 | telef_movil | paciente_telefono_alterno | Puede ser NULL |
| 13 | fec_st | fecha_sintomas | Si es válida; si no, NULL |
| 14 | semana | semana_epidem | Ej: "2025SE25" |

### ❌ CAMPOS A DESCARTAR

| Col Excel | Razón |
|-----------|-------|
| 3 - edad | Descartada: calcular por fecha_nacimiento |
| 8 - ipress | Descartada: datos cargados vía CAS Adscripción (Col 5) |
| 9 - red | Descartada: datos cargados vía CAS Adscripción (Col 5) |

### ❓ CAMPOS PENDIENTES DE CLARIFICACIÓN

| Col Excel | Nombre | Estado | Notas |
|-----------|--------|--------|-------|
| 7 | servicio | **PENDIENTE** | Son ACTIVIDADES, no especialidades. Necesita mapeo claro. Valores: "Consulta externa", "Emergencia" |

---

## 📋 Actividades Encontradas en Excel

- **Consulta externa** → ¿id_servicio = ?
- **Emergencia** → ¿id_servicio = ?

**Nota:** dim_servicio_essi contiene especialidades médicas (ALERGIA, CARDIOLOGIA, etc.), no actividades. Se requiere clarificación sobre mapeo.

---

## 🔗 Referencias a otras tablas

- **asegurados:** FK en paciente_id (DNI) - ✅ YA CARGADOS 6548 registros
- **dim_solicitud_bolsa:** Tabla destino
  - id_bolsa = 2 (BOLSA_DENGUE)
  - id_servicio = ? (PENDIENTE)
  - estado = "PENDIENTE"
  - activo = true
  - estado_gestion_citas_id = 1

---

## 📝 Validaciones a Aplicar

1. **DNI:**
   - No puede ser NULL
   - Normalizar a 8 dígitos
   - Debe existir en asegurados ✅

2. **DX_Main (CIE-10):**
   - Validar formato: A97.[012]
   - Solo acepta: A97.0, A97.1, A97.2

3. **Fecha Síntomas (fec_st):**
   - Si es "No hay información" o vacío → NULL
   - Si es válida → guardar como DATE

4. **CENASICOD:**
   - Código CAS Adscripción (numérico)
   - Identificar registros por este código

---

## 🚀 Plan de Carga (PENDIENTE)

1. ✅ **Fase 1:** Cargar 6548 asegurados a tabla `asegurados`
2. ⏳ **Fase 2:** Definir mapeo de ACTIVIDADES (Col 7) → id_servicio
3. ⏳ **Fase 3:** Generar CSV con datos normalized
4. ⏳ **Fase 4:** COPY a dim_solicitud_bolsa
5. ⏳ **Fase 5:** Validar integridad y cantidad de registros

---

## 📌 Decisiones Pendientes

- [ ] ¿Cómo mapear "Consulta externa" a id_servicio?
- [ ] ¿Cómo mapear "Emergencia" a id_servicio?
- [ ] ¿Usar valor default si no hay mapeo claro?

---

**Status:** Análisis completado. Aguardando clarificación de mapeo de ACTIVIDADES.
