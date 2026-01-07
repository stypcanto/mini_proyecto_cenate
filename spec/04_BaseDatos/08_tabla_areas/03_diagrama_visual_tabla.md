# 📐 Diagrama Visual Detallado: Tabla DIM_AREA

**Versión:** 1.0
**Fecha:** 2026-01-07
**Contexto:** CENATE - Visualización de Estructura de Tabla
**Autor:** Styp Canto Rondón

---

## 🎨 Representación Visual ASCII de la Tabla

### Vista Física (Como se almacena en PostgreSQL)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                            TABLE: dim_area                                     │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────┬──────────────────────────────────────┬───────┬──────────────────────┤
│  │ id   │ desc_area                            │ state │ timestamps           │
│  │ area │                                      │ area  │                      │
│  ├──────┼──────────────────────────────────────┼───────┼──────────────────────┤
│  │ 1    │ DD - DIRECCIÓN DE DESPACHO           │ A     │ 2026-01-07 10:00:00 │
│  │ 2    │ DD - LOGISTICA                       │ A     │ 2026-01-07 10:05:00 │
│  │ 3    │ DG - AUDITORÍA MÉDICA                │ A     │ 2026-01-07 11:30:00 │
│  │ 4    │ AD - ADMINISTRACIÓN                  │ A     │ 2026-01-08 09:00:00 │
│  │ 5    │ CARDIOLOGÍA                          │ A     │ 2026-01-08 13:45:00 │
│  │ 6    │ ONCOLOGÍA                            │ I     │ 2025-12-15 08:00:00 │
│  │      │                                      │       │                      │
│  └──────┴──────────────────────────────────────┴───────┴──────────────────────┘
│
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Estructura de Columnas Expandida

### Columna 1: `id_area` (PRIMARY KEY)

```
┌─────────────────────────────────┐
│ COLUMN: id_area                 │
├─────────────────────────────────┤
│ Type:        BIGSERIAL          │
│ Nullable:    NO                 │
│ Default:     (auto-increment)   │
│ Constraints: PRIMARY KEY        │
│             UNIQUE              │
│             NOT NULL            │
├─────────────────────────────────┤
│ Valores Típicos:                │
│  1                              │
│  2                              │
│  3                              │
│  ... (generado secuencialmente) │
└─────────────────────────────────┘

Secuencia asociada:
CREATE SEQUENCE dim_area_id_area_seq
  AS BIGINT
  START 1
  INCREMENT 1;
```

---

### Columna 2: `desc_area` (DESCRIPCIÓN)

```
┌─────────────────────────────────────────────┐
│ COLUMN: desc_area                           │
├─────────────────────────────────────────────┤
│ Type:        VARCHAR(255)                   │
│ Nullable:    NO                             │
│ Default:     (ninguno)                      │
│ Constraints: NOT NULL                       │
│             UNIQUE                          │
│             CHECK LENGTH <= 255             │
├─────────────────────────────────────────────┤
│ Formato Estándar: CODE - DESCRIPTION        │
│                                             │
│ Ejemplos Válidos:                           │
│  ✓ DD - DIRECCIÓN DE DESPACHO              │
│  ✓ DG - AUDITORÍA MÉDICA                   │
│  ✓ CARDIOLOGÍA (sin código)                │
│  ✓ TL - TECNOLOGÍA E INNOVACIÓN            │
│                                             │
│ Ejemplos Inválidos:                         │
│  ✗ (vacío)                                 │
│  ✗ Duplicado con existente                 │
│  ✗ Más de 255 caracteres                   │
└─────────────────────────────────────────────┘

Constraint UNIQUE Index:
CREATE UNIQUE INDEX idx_dim_area_desc_area
  ON dim_area(desc_area);
```

---

### Columna 3: `stat_area` (ESTADO)

```
┌──────────────────────────────────────┐
│ COLUMN: stat_area                    │
├──────────────────────────────────────┤
│ Type:        VARCHAR(1)              │
│ Nullable:    NO                      │
│ Default:     'A'                     │
│ Constraints: NOT NULL                │
│             CHECK IN ('A', 'I')      │
├──────────────────────────────────────┤
│ Valores Válidos:                     │
│                                      │
│  'A' → ACTIVE (Activo)              │
│  ├─ Área operativa                  │
│  ├─ Disponible para usar            │
│  └─ Personal puede ser asignado     │
│                                      │
│  'I' → INACTIVE (Inactivo)          │
│  ├─ Área desactivada                │
│  ├─ No se utiliza                   │
│  └─ Datos históricos preserved      │
├──────────────────────────────────────┤
│ Valor por Defecto: 'A'              │
│                                      │
│ Uso en Queries:                      │
│  WHERE stat_area = 'A'   (solo act) │
│  WHERE stat_area IN ('A','I') (todos)│
└──────────────────────────────────────┘

Check Constraint:
ALTER TABLE dim_area
ADD CONSTRAINT chk_stat_area
CHECK (stat_area IN ('A', 'I'));
```

---

### Columna 4: `created_at` (FECHA CREACIÓN)

```
┌──────────────────────────────────────────┐
│ COLUMN: created_at                       │
├──────────────────────────────────────────┤
│ Type:      TIMESTAMP WITH TIME ZONE      │
│ Nullable:  NO                            │
│ Default:   NOW() [en aplicación]         │
│ Updatable: NO (IMMUTABLE)                │
├──────────────────────────────────────────┤
│ Formato PostgreSQL:                      │
│  2026-01-07 14:30:45.123456+00:00       │
│                                          │
│ Componentes:                             │
│  Fecha: 2026-01-07                      │
│  Hora:  14:30:45                        │
│  Micro: .123456 (microsegundos)         │
│  TZ:    +00:00 (UTC)                    │
├──────────────────────────────────────────┤
│ Propiedades:                             │
│  ✓ Zona horaria incluida                │
│  ✓ Precisión: microsegundos             │
│  ✓ Se asigna UNA SOLA VEZ               │
│  ✓ Nunca se actualiza                   │
│  ✓ Útil para auditoría                  │
└──────────────────────────────────────────┘

Mapeo JPA:
@CreationTimestamp
@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;
```

---

### Columna 5: `updated_at` (FECHA ACTUALIZACIÓN)

```
┌──────────────────────────────────────────┐
│ COLUMN: updated_at                       │
├──────────────────────────────────────────┤
│ Type:      TIMESTAMP WITH TIME ZONE      │
│ Nullable:  NO                            │
│ Default:   NOW() [en aplicación]         │
│ Updatable: YES                           │
├──────────────────────────────────────────┤
│ Se actualiza cada vez que:               │
│  ✓ Se crea el registro (= created_at)   │
│  ✓ Se modifica cualquier campo           │
│  ✓ Se cambia el estado (A→I o viceversa)│
├──────────────────────────────────────────┤
│ Ejemplo de evolución:                    │
│                                          │
│  Acción          created_at     updated_at
│  ─────────────────────────────────────────
│  Crear           10:00:00        10:00:00
│  Editar nombre   10:00:00        15:30:45
│  Cambiar estado  10:00:00        16:45:20
│                                          │
└──────────────────────────────────────────┘

Mapeo JPA:
@UpdateTimestamp
@Column(name = "updated_at", nullable = false)
private LocalDateTime updatedAt;
```

---

## 🔑 Índices de la Tabla

### 1. Primary Key Index (Automático)

```
┌─────────────────────────────────────────┐
│ Nombre:  dim_area_pkey                  │
├─────────────────────────────────────────┤
│ Tipo:    B-tree (default)               │
│ Columnas: id_area                       │
│ Único:   Sí                             │
│                                         │
│ Operaciones Rápidas:                    │
│  WHERE id_area = 1        ✓ RÁPIDO      │
│  WHERE id_area IN (1,2,3) ✓ RÁPIDO      │
│  WHERE id_area > 100      ✓ RÁPIDO      │
│                                         │
│ DDL:                                    │
│ ALTER TABLE dim_area                    │
│ ADD PRIMARY KEY (id_area);              │
└─────────────────────────────────────────┘
```

---

### 2. Unique Index en desc_area

```
┌──────────────────────────────────────────┐
│ Nombre:  dim_area_desc_area_key         │
├──────────────────────────────────────────┤
│ Tipo:    B-tree (unique)                │
│ Columnas: desc_area                     │
│ Único:   Sí                             │
│                                         │
│ Operaciones Rápidas:                    │
│  WHERE desc_area = '...'  ✓ RÁPIDO      │
│  WHERE desc_area LIKE 'DD%' ✓ MODERADO  │
│                                         │
│ Beneficios:                             │
│  • Previene duplicados automáticamente  │
│  • Mejora búsquedas por descripción     │
│  • Refuerza integridad de datos         │
│                                         │
│ DDL:                                    │
│ ALTER TABLE dim_area                    │
│ ADD UNIQUE (desc_area);                 │
└──────────────────────────────────────────┘
```

---

### 3. Índice sobre stat_area (Recomendado)

```
┌──────────────────────────────────────────┐
│ Nombre:  idx_dim_area_stat_area         │
├──────────────────────────────────────────┤
│ Tipo:    B-tree                         │
│ Columnas: stat_area                     │
│ Único:   No                             │
│                                         │
│ Operaciones Rápidas:                    │
│  WHERE stat_area = 'A'    ✓ RÁPIDO      │
│  WHERE stat_area IN (..)  ✓ RÁPIDO      │
│                                         │
│ Caso de Uso:                            │
│  Lista de áreas activas (muy frecuente) │
│  SELECT * FROM dim_area WHERE stat = 'A'│
│                                         │
│ DDL (Crear):                            │
│ CREATE INDEX idx_dim_area_stat_area     │
│ ON dim_area(stat_area);                 │
└──────────────────────────────────────────┘
```

---

## 📊 Diagrama de Distribución de Datos

### Ejemplo con 6 filas

```
Row 1:  [1] ━━━ [DD - DIRECCIÓN DE DESPACHO] ━━━ [A] ━━━ [2026-01-07 10:00] ━━━ [2026-01-07 10:00]
Row 2:  [2] ━━━ [DD - LOGISTICA] ━━━ [A] ━━━ [2026-01-07 10:05] ━━━ [2026-01-07 10:05]
Row 3:  [3] ━━━ [DG - AUDITORÍA MÉDICA] ━━━ [A] ━━━ [2026-01-07 11:30] ━━━ [2026-01-07 11:30]
Row 4:  [4] ━━━ [AD - ADMINISTRACIÓN] ━━━ [A] ━━━ [2026-01-08 09:00] ━━━ [2026-01-08 09:00]
Row 5:  [5] ━━━ [CARDIOLOGÍA] ━━━ [A] ━━━ [2026-01-08 13:45] ━━━ [2026-01-08 13:45]
Row 6:  [6] ━━━ [ONCOLOGÍA] ━━━ [I] ━━━ [2025-12-15 08:00] ━━━ [2026-01-06 14:20]
```

---

## 🔄 Transformación de Datos en Visualización Frontend

### Datos Brutos de Base de Datos

```json
{
  "idArea": 1,
  "descArea": "DD - DIRECCIÓN DE DESPACHO",
  "statArea": "A",
  "createdAt": "2026-01-07T10:00:00Z",
  "updatedAt": "2026-01-07T10:00:00Z"
}
```

---

### Transformación en Frontend

```javascript
// Datos brutos → Datos transformados

const rawData = {
  idArea: 1,
  descArea: "DD - DIRECCIÓN DE DESPACHO",
  statArea: "A",
  createdAt: "2026-01-07T10:00:00Z"
};

// Aplicar funciones de extracción
const transformedData = {
  idArea: 1,
  descArea: "DD - DIRECCIÓN DE DESPACHO",   // Original
  statArea: "A",
  createdAt: "2026-01-07T10:00:00Z",

  // ← NUEVOS CAMPOS EXTRAÍDOS (Solo frontend)
  dependencia: extractDependencia("DD - DIRECCIÓN DE DESPACHO"),
  // Resultado: "DD"

  nombreArea: extractNombreArea("DD - DIRECCIÓN DE DESPACHO")
  // Resultado: "DIRECCIÓN DE DESPACHO"
};
```

---

### Tabla HTML Renderizada

```html
<table>
  <thead>
    <tr>
      <th>DEPENDENCIA</th>
      <th>NOMBRE DEL ÁREA</th>
      <th>FECHA CREACIÓN</th>
      <th>ESTADO</th>
      <th>ACCIÓN</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>DD</strong></td>
      <td>DIRECCIÓN DE DESPACHO</td>
      <td>2026-01-07 10:00</td>
      <td>✓ Activo</td>
      <td>[Editar] [Eliminar]</td>
    </tr>
    <tr>
      <td><strong>DD</strong></td>
      <td>LOGISTICA</td>
      <td>2026-01-07 10:05</td>
      <td>✓ Activo</td>
      <td>[Editar] [Eliminar]</td>
    </tr>
    <tr>
      <td><strong>DG</strong></td>
      <td>AUDITORÍA MÉDICA</td>
      <td>2026-01-07 11:30</td>
      <td>✓ Activo</td>
      <td>[Editar] [Eliminar]</td>
    </tr>
  </tbody>
</table>
```

---

## 📐 Tamaño Estimado de la Tabla

```
┌──────────────────────────────────────────┐
│ ESTIMACIÓN DE ESPACIO EN DISCO           │
├──────────────────────────────────────────┤
│ Columna        │ Tamaño/Fila             │
│ id_area        │ 8 bytes (BIGINT)        │
│ desc_area      │ ~100 bytes (avg 50 chr) │
│ stat_area      │ 1 byte (VARCHAR 1)      │
│ created_at     │ 8 bytes (TIMESTAMP TZ)  │
│ updated_at     │ 8 bytes (TIMESTAMP TZ)  │
│ Overhead       │ ~50 bytes (headers)     │
├──────────────────────────────────────────┤
│ TOTAL/FILA     │ ~175 bytes              │
│                                          │
│ Estimación con N filas:                 │
│  N = 50 áreas  → ~8.8 KB                │
│  N = 100 áreas → ~17.5 KB               │
│  N = 500 áreas → ~87.5 KB               │
│                                          │
│ Índices:                                │
│  Primary Key   → ~1 KB                  │
│  Unique Index  → ~5 KB                  │
│                                          │
│ TOTAL (50 áreas) → ~15 KB               │
└──────────────────────────────────────────┘
```

---

## 🔍 Operaciones SQL Típicas

### SELECT - Visualizar

```sql
-- 1. Obtener todas las áreas activas
SELECT id_area, desc_area, stat_area, created_at
FROM dim_area
WHERE stat_area = 'A'
ORDER BY desc_area ASC;

-- 2. Obtener por código
SELECT *
FROM dim_area
WHERE desc_area LIKE 'DD - %';

-- 3. Obtener por ID
SELECT *
FROM dim_area
WHERE id_area = 1;

-- 4. Búsqueda genérica
SELECT *
FROM dim_area
WHERE desc_area ILIKE '%DIRECCIÓN%'
  AND stat_area = 'A';
```

---

### INSERT - Crear

```sql
INSERT INTO dim_area (
  desc_area,
  stat_area,
  created_at,
  updated_at
) VALUES (
  'DD - DIRECCIÓN DE DESPACHO',
  'A',
  NOW(),
  NOW()
)
RETURNING id_area, desc_area;
```

---

### UPDATE - Modificar

```sql
-- Cambiar nombre
UPDATE dim_area
SET desc_area = 'DD - DESPACHO CENTRAL',
    updated_at = NOW()
WHERE id_area = 1;

-- Cambiar estado
UPDATE dim_area
SET stat_area = 'I',
    updated_at = NOW()
WHERE id_area = 3;
```

---

### DELETE - Eliminar (Soft Delete)

```sql
-- Soft delete (Recomendado)
UPDATE dim_area
SET stat_area = 'I',
    updated_at = NOW()
WHERE id_area = 5;

-- Hard delete (Solo si es necesario, poco común)
DELETE FROM dim_area
WHERE id_area = 5;
```

---

## 🎯 Reglas de Integridad

```
┌─────────────────────────────────────────────────────┐
│ REGLAS DE NEGOCIO (Business Rules)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 1. Descripción Única                               │
│    • No puede haber dos áreas con igual desc       │
│    • Validación: UNIQUE constraint                 │
│    • Beneficio: Evita duplicados                   │
│                                                     │
│ 2. Estado Controlado                               │
│    • Solo valores 'A' o 'I'                        │
│    • Validación: CHECK constraint                  │
│    • Beneficio: Datos consistentes                 │
│                                                     │
│ 3. Campos Obligatorios                             │
│    • desc_area y stat_area son NOT NULL            │
│    • Validación: Constraint en BD                  │
│    • Beneficio: No datos incompletos               │
│                                                     │
│ 4. Auditoría Automática                            │
│    • created_at nunca cambia                       │
│    • updated_at se actualiza siempre               │
│    • Validación: Timestamps autómaticos            │
│    • Beneficio: Trazabilidad completa              │
│                                                     │
│ 5. Soft Delete                                      │
│    • No eliminar, marcar como inactivo             │
│    • Validación: Lógica de aplicación              │
│    • Beneficio: Mantiene histórico                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Foreign Keys (Relaciones Salientes)

### Tabla: dim_personal_cnt (Personal Asignado)

```
dim_area (1) ─────────────── (N) dim_personal_cnt
  ↑                                      │
  └─ FK: id_area (en personal_cnt)       │

Restricción: ON DELETE RESTRICT
  └─ No permite eliminar un área que tiene personal

Ejemplo:
  dim_area.id_area = 1 [DD - DIRECCIÓN DE DESPACHO]
    ├─ dim_personal_cnt.id_personal = 100, id_area = 1 [Juan Pérez]
    ├─ dim_personal_cnt.id_personal = 101, id_area = 1 [María García]
    └─ dim_personal_cnt.id_personal = 102, id_area = 1 [Carlos López]
```

---

### Tabla: dim_roles (Roles por Área)

```
dim_area (1) ─────────────── (N) dim_roles
  ↑                                    │
  └─ FK: id_area (en dim_roles)        │

Restricción: ON DELETE RESTRICT
  └─ No permite eliminar un área que tiene roles

Ejemplo:
  dim_area.id_area = 5 [CARDIOLOGÍA]
    ├─ dim_roles.id_rol = 50, id_area = 5 [Médico Cardiólogo]
    └─ dim_roles.id_rol = 51, id_area = 5 [Enfermero Cardíaco]
```

---

## 📋 Metadatos de la Tabla

```
Nombre:           dim_area
Tipo:             TABLE
Esquema:          public
Propietario:      postgres
Espacio:          heap
Rows:             ~30-50 (estimado)
Tamaño:           ~50-100 KB
Índices:          3 (PRIMARY, UNIQUE, STAT)
Relaciones:       2 (Personal, Roles)
Criticidad:       ALTA
Frecuencia:       MUY ALTA (lectura)
Last Vacuum:      [fecha última limpieza]
Last Analyze:     [fecha último análisis]
```

---

## 🎓 Ejemplo Completo: Ciclo de Vida de 1 Fila

```
PASO 1: INSERCIÓN
└─ Usuario crea área "DD - DIRECCIÓN DE DESPACHO"
   INSERT ejecutado → id_area = 1 asignado

┌────────────────────────────────────┐
│ id_area = 1                        │
│ desc_area = "DD - DIR DE DESPACHO" │
│ stat_area = 'A'                    │
│ created_at = 2026-01-07 10:00:00   │
│ updated_at = 2026-01-07 10:00:00   │
└────────────────────────────────────┘

PASO 2: LECTURA (Múltiples veces)
└─ Frontend solicita lista cada vez que abre página
   SELECT * FROM dim_area WHERE stat_area = 'A'
   → Fila se retorna sin cambios

PASO 3: ACTUALIZACIÓN
└─ Usuario edita nombre a "DD - DESPACHO CENTRAL"
   UPDATE dim_area SET desc_area = '...', updated_at = NOW()

┌────────────────────────────────────────┐
│ id_area = 1           ← SIN CAMBIO     │
│ desc_area = "DD - DESPACHO CENTRAL"    │ ← ACTUALIZADO
│ stat_area = 'A'       ← SIN CAMBIO     │
│ created_at = 2026-01-07 10:00:00 ← NO CAMBIA │
│ updated_at = 2026-01-07 15:30:00 ← ACTUALIZADO │
└────────────────────────────────────────┘

PASO 4: SOFT DELETE (Desactivación)
└─ Usuario marca como inactivo
   UPDATE dim_area SET stat_area = 'I', updated_at = NOW()

┌────────────────────────────────────────┐
│ id_area = 1           ← SIN CAMBIO     │
│ desc_area = "DD - DESPACHO CENTRAL" ← SIN CAMBIO │
│ stat_area = 'I'       ← INACTIVO ✓     │
│ created_at = 2026-01-07 10:00:00 ← INVARIABLE │
│ updated_at = 2026-01-07 16:45:00 ← ACTUALIZADO │
└────────────────────────────────────────┘

PASO 5: REACTIVACIÓN (Si es necesario)
└─ Usuario vuelve a activar
   UPDATE dim_area SET stat_area = 'A', updated_at = NOW()

┌────────────────────────────────────────┐
│ id_area = 1           ← SIN CAMBIO     │
│ desc_area = "DD - DESPACHO CENTRAL" ← SIN CAMBIO │
│ stat_area = 'A'       ← ACTIVO DE NUEVO │
│ created_at = 2026-01-07 10:00:00 ← ORIGINAL PRESERVADO │
│ updated_at = 2026-01-07 17:20:00 ← ÚLTIMO CAMBIO │
└────────────────────────────────────────┘
```

---

## 📈 Plan de Mantenimiento

```
┌──────────────────────────────────────────┐
│ TAREAS DE MANTENIMIENTO PERIÓDICO        │
├──────────────────────────────────────────┤
│                                          │
│ Diario:                                  │
│  • Monitorear tamaño de tabla            │
│  • Revisar alertas de storage            │
│                                          │
│ Semanal:                                 │
│  • Ejecutar VACUUM                       │
│  • Ejecutar ANALYZE                      │
│  • Revisar índices fragmentados          │
│                                          │
│ Mensual:                                 │
│  • Revisar datos duplicados              │
│  • Validar integridad referencial        │
│  • Backup completo                       │
│                                          │
│ Trimestral:                              │
│  • Revisión de esquema                   │
│  • Optimización de índices               │
│  • Archivado de datos históricos         │
│                                          │
└──────────────────────────────────────────┘
```

---

**Fin de Documentación - Diagrama Visual Tabla**

*Para esquema completo: `01_esquema_tabla_areas.md`*
*Para flujo de datos: `02_diagrama_flujo_datos_areas.md`*
