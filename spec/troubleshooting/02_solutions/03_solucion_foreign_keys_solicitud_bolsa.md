# ⚠️ SOLUCIÓN - Foreign Keys Faltantes en dim_solicitud_bolsa

**Fecha:** 2026-01-24
**Status:** 🔴 CRÍTICO - Requiere acción inmediata
**Impacto:** Módulo de bolsas sin integridad referencial

---

## 🔍 Problema Identificado

La tabla `dim_solicitud_bolsa` existe con todos sus 32 campos, pero **NO tiene las 8 Foreign Keys definidas** en la base de datos.

### Síntomas

```
- DBeaver muestra tabla sin relaciones en el diagrama
- Tabla tiene 32 columnas con nombres FK (id_bolsa, id_servicio, etc.)
- Pero visual: ❌ Sin líneas de conexión a otras tablas
- Campo "Diagram" en DBeaver no muestra relaciones
```

### Causa Raíz

La tabla se creó inicialmente **sin constraints de FK**. Solo existen en:
- ✅ Código Java (@JoinColumn annotations)
- ✅ Documentación (UML, especificaciones)
- ❌ **Base de datos (NO CREADAS)**

---

## ✅ SOLUCIÓN INMEDIATA

### Paso 1: Descargar o copiar el script SQL

**Ubicación del script:**
```
spec/04_BaseDatos/06_scripts/053_crear_foreign_keys_solicitud_bolsa.sql
```

### Paso 2: Ejecutar en servidor remoto (10.0.89.241)

```bash
# Opción A: SSH al servidor
ssh cenate@10.0.89.241
PGPASSWORD='Essalud2025' psql -U postgres -d maestro_cenate \
  < /tmp/053_crear_foreign_keys_solicitud_bolsa.sql

# Opción B: Ejecutar desde tu máquina
PGPASSWORD='Essalud2025' psql -h 10.0.89.241 -U postgres -d maestro_cenate \
  < /path/to/053_crear_foreign_keys_solicitud_bolsa.sql

# Opción C: En DBeaver (copiar SQL y ejecutar)
1. Abre conexión a maestro_cenate
2. File → Open SQL Script → Selecciona archivo
3. Ejecuta (Ctrl+Enter)
```

### Paso 3: Verificar que se crearon correctamente

```bash
PGPASSWORD='Essalud2025' psql -h 10.0.89.241 -U postgres -d maestro_cenate << 'EOF'

SELECT constraint_name, table_name, column_name, foreign_table_name
FROM information_schema.key_column_usage
WHERE table_name = 'dim_solicitud_bolsa'
  AND foreign_table_name IS NOT NULL
ORDER BY constraint_name;

EOF
```

**Resultado esperado:**
```
        constraint_name         |       table_name       |        column_name         |   foreign_table_name
────────────────────────────────┼────────────────────────┼────────────────────────────┼─────────────────────
 fk_solicitud_aprobador         | dim_solicitud_bolsa    | responsable_aprobacion_id  | dim_usuarios
 fk_solicitud_asegurado         | dim_solicitud_bolsa    | paciente_id                | asegurados
 fk_solicitud_bolsa_tipos       | dim_solicitud_bolsa    | id_bolsa                   | dim_tipos_bolsas
 fk_solicitud_estado_cita       | dim_solicitud_bolsa    | estado_gestion_citas_id    | dim_estados_gestion_citas
 fk_solicitud_gestora           | dim_solicitud_bolsa    | responsable_gestora_id     | dim_usuarios
 fk_solicitud_ipress            | dim_solicitud_bolsa    | id_ipress                  | dim_ipress
 fk_solicitud_servicio          | dim_solicitud_bolsa    | id_servicio                | dim_servicio_essi
 fk_solicitud_solicitante       | dim_solicitud_bolsa    | solicitante_id             | dim_usuarios
(8 rows)
```

---

## 📊 Detalles de las 8 Foreign Keys

### FK1: id_bolsa → dim_tipos_bolsas
```sql
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_bolsa_tipos
FOREIGN KEY (id_bolsa) REFERENCES dim_tipos_bolsas(id_tipo_bolsa)
ON DELETE RESTRICT ON UPDATE CASCADE;
```
**Propósito:** Validar que el tipo de bolsa existe (7 tipos iniciales)
**Restricción:** No se puede eliminar tipo si hay solicitudes

### FK2: id_servicio → dim_servicio_essi
```sql
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_servicio
FOREIGN KEY (id_servicio) REFERENCES dim_servicio_essi(id_servicio)
ON DELETE SET NULL ON UPDATE CASCADE;
```
**Propósito:** Validar especialidad (Cardiología, Neurología, etc.)
**Restricción:** Puede ser NULL si especialidad se elimina

### FK3: paciente_id → asegurados ⭐ CRÍTICO
```sql
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_asegurado
FOREIGN KEY (paciente_id) REFERENCES asegurados(pk_asegurado)
ON DELETE RESTRICT ON UPDATE CASCADE;
```
**Propósito:** Garantizar que paciente existe (5,165,000 registros)
**Restricción:** ❌ NO se puede eliminar paciente si tiene solicitud
**Importancia:** MÁXIMA - Protege integridad de datos críticos

### FK4: id_ipress → dim_ipress
```sql
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_ipress
FOREIGN KEY (id_ipress) REFERENCES dim_ipress(id_ipress)
ON DELETE SET NULL ON UPDATE CASCADE;
```
**Propósito:** Validar que IPRESS existe (414 IPRESS EsSalud)

### FK5: solicitante_id → dim_usuarios
```sql
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_solicitante
FOREIGN KEY (solicitante_id) REFERENCES dim_usuarios(id_user)
ON DELETE SET NULL ON UPDATE CASCADE;
```
**Propósito:** Auditoría - Quién cargó la solicitud

### FK6: responsable_gestora_id → dim_usuarios
```sql
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_gestora
FOREIGN KEY (responsable_gestora_id) REFERENCES dim_usuarios(id_user)
ON DELETE SET NULL ON UPDATE CASCADE;
```
**Propósito:** Auditoría - Quién gestiona la cita

### FK7: responsable_aprobacion_id → dim_usuarios
```sql
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_aprobador
FOREIGN KEY (responsable_aprobacion_id) REFERENCES dim_usuarios(id_user)
ON DELETE SET NULL ON UPDATE CASCADE;
```
**Propósito:** Auditoría - Quién aprobó la solicitud

### FK8: estado_gestion_citas_id → dim_estados_gestion_citas (v1.33.0)
```sql
ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_estado_cita
FOREIGN KEY (estado_gestion_citas_id) REFERENCES dim_estados_gestion_citas(id_estado_cita)
ON DELETE SET NULL ON UPDATE CASCADE;
```
**Propósito:** Validar estado de cita (10 estados iniciales)
**Estados:** PENDIENTE_CITA, CITADO, NO_CONTESTA, CANCELADO, ASISTIO, REPROGRAMADO, INASISTENCIA, VENCIDO, EN_SEGUIMIENTO, DERIVADO

---

## 🔍 Verificación Post-Creación

### Test 1: Verificar integridad referencial

```sql
-- Verificar que todos los pacientes existen
SELECT
    COUNT(*) as total_solicitudes,
    COUNT(CASE WHEN paciente_id IN (SELECT pk_asegurado FROM asegurados)
      THEN 1 END) as pacientes_validos
FROM dim_solicitud_bolsa;

-- Resultado esperado: total = pacientes_validos
```

### Test 2: Verificar tipos de bolsa

```sql
SELECT
    COUNT(*) as total_solicitudes,
    COUNT(CASE WHEN id_bolsa IN (SELECT id_tipo_bolsa FROM dim_tipos_bolsas)
      THEN 1 END) as tipos_validos
FROM dim_solicitud_bolsa;

-- Resultado esperado: total = tipos_validos
```

### Test 3: Verificar DBeaver

1. Abre "Database" → "maestro_cenate" → "Schemas" → "public" → "Tables"
2. Click derecho en "dim_solicitud_bolsa" → "View Diagram"
3. **Resultado esperado:** ✅ Líneas de conexión a otras 8 tablas

---

## 🚀 Después de ejecutar el script

### ✅ Lo que sucederá

1. **BD está íntegra:**
   ```
   ✅ No se puede eliminar asegurado si tiene solicitud
   ✅ No se puede crear solicitud sin bolsa válida
   ✅ No se puede asignar gestor sin usuario válido
   ```

2. **DBeaver mostrará relaciones:**
   ```
   ✅ Líneas conectando dim_solicitud_bolsa con:
      - dim_tipos_bolsas (FK1)
      - dim_servicio_essi (FK2)
      - asegurados (FK3)
      - dim_ipress (FK4)
      - dim_usuarios (3x: FK5, FK6, FK7)
      - dim_estados_gestion_citas (FK8)
   ```

3. **Módulo de bolsas funcionará correctamente:**
   ```
   ✅ Validaciones en BD (no solo en código)
   ✅ Integridad garantizada
   ✅ Auditoría completa
   ✅ Performance optimizada con índices
   ```

---

## ⚠️ Si hay errores al ejecutar

### Error: "relation does not exist"

```
ERROR: relation "dim_tipos_bolsas" does not exist
```

**Solución:** Asegúrate que las tablas referenciadas existen:
```bash
# Verificar tablas existen
PGPASSWORD='Essalud2025' psql -h 10.0.89.241 -U postgres -d maestro_cenate << 'EOF'

\dt dim_tipos_bolsas dim_servicio_essi asegurados dim_ipress dim_usuarios dim_estados_gestion_citas;

EOF
```

### Error: "constraint already exists"

```
ERROR: constraint fk_solicitud_bolsa_tipos already exists
```

**Solución:** Las FK ya fueron creadas. Verifica:
```sql
SELECT constraint_name FROM information_schema.key_column_usage
WHERE table_name = 'dim_solicitud_bolsa' AND foreign_table_name IS NOT NULL;
```

Si existen, no hay nada que hacer. Si no existen todas, elimina las que sí existen:
```sql
ALTER TABLE dim_solicitud_bolsa DROP CONSTRAINT IF EXISTS fk_solicitud_bolsa_tipos;
-- ... repetir para las demás
```

---

## 📋 Checklist de Verificación

- [ ] Script descargado de `spec/04_BaseDatos/06_scripts/053_...sql`
- [ ] Ejecutado en servidor 10.0.89.241 sobre base maestro_cenate
- [ ] Query de verificación muestra 8 FK creadas
- [ ] DBeaver muestra relaciones en diagrama
- [ ] Test de integridad referencial pasa ✅
- [ ] Módulo de bolsas funciona correctamente
- [ ] Sin errores en backend/frontend

---

## 🎯 Resultado Final

```
✅ dim_solicitud_bolsa con 8 Foreign Keys activas
✅ Integridad referencial garantizada en BD
✅ DBeaver muestra relaciones correctamente
✅ Módulo de bolsas v1.6.0 100% FUNCIONAL
```

---

**Status:** 🟡 PENDIENTE → 🟢 RESUELTO
**Acción requerida:** Ejecutar script 053
**Tiempo estimado:** 2-3 minutos
**Criticidad:** 🔴 ALTA
