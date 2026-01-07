# 📊 Esquema de Tabla: DIM_AREA

**Versión:** 1.0
**Fecha:** 2026-01-07
**Contexto:** CENATE - Tabla de Áreas/Departamentos
**Autor:** Styp Canto Rondón

---

## 🎯 Descripción General

La tabla `dim_area` es una **tabla maestra (dimensión)** que almacena todas las áreas organizacionales del sistema CENATE. Representa departamentos, especialidades, o unidades funcionales dentro de la institución.

**Ejemplos de Áreas:**
- DD - DIRECCIÓN DE DESPACHO
- DG - AUDITORÍA MÉDICA
- AD - ADMINISTRACIÓN
- TL - TECNOLOGÍA
- CARDIOLOGÍA
- ONCOLOGÍA
- etc.

---

## 📋 Diagrama ER (Entity-Relationship)

```
┌────────────────────────────────────────┐
│          DIM_AREA (Tabla Maestra)      │
├────────────────────────────────────────┤
│ PK │ id_area (BIGSERIAL)              │
├────────────────────────────────────────┤
│    │ desc_area (VARCHAR 255) [UNIQUE]  │
│    │ stat_area (VARCHAR 1) [DEFAULT='A']│
│    │ created_at (TIMESTAMP WITH TZ)    │
│    │ updated_at (TIMESTAMP WITH TZ)    │
└────────────────────────────────────────┘
        ▲                      ▲
        │ 1:N                  │ 1:N
        │                      │
        │                      │
┌───────┴──────────────────┐  ┌─────────┴──────────────────┐
│ DIM_PERSONAL_CNT         │  │ DIM_ROLES                  │
│ (Personal asignado)      │  │ (Roles por área)           │
└──────────────────────────┘  └────────────────────────────┘
```

---

## 📐 Estructura Detallada de Campos

### 1️⃣ Columna: `id_area` (PRIMARY KEY)

| Propiedad | Valor |
|-----------|-------|
| **Nombre en DB** | `id_area` |
| **Tipo de Dato** | `BIGSERIAL` |
| **Constraints** | PRIMARY KEY, AUTO INCREMENT |
| **Nulable** | NO |
| **Valores Permitidos** | 1, 2, 3, 4, ... (generado automáticamente) |
| **Descripción** | Identificador único de cada área en el sistema |
| **Ejemplo** | `1`, `2`, `3`, etc. |

```sql
-- DDL
id_area BIGSERIAL PRIMARY KEY
```

**Nota:** BIGSERIAL genera automáticamente valores secuenciales usando una secuencia de PostgreSQL.

---

### 2️⃣ Columna: `desc_area` (Descripción del Área)

| Propiedad | Valor |
|-----------|-------|
| **Nombre en DB** | `desc_area` |
| **Tipo de Dato** | `VARCHAR(255)` |
| **Constraints** | NOT NULL, UNIQUE |
| **Nulable** | NO |
| **Valores Permitidos** | Cualquier texto hasta 255 caracteres |
| **Descripción** | Nombre/descripción del área (código + nombre) |
| **Formato** | `CODIGO - DESCRIPCION` |
| **Ejemplo** | "DD - DIRECCIÓN DE DESPACHO" |

```sql
-- DDL
desc_area VARCHAR(255) NOT NULL UNIQUE
```

**Consideraciones:**
- **UNIQUE**: No puede haber dos áreas con la misma descripción
- **NOT NULL**: Obligatorio ingresar una descripción
- **Formato estandarizado**: Usa el patrón `CODIGO - DESCRIPCION`

**Valores Actuales en Base de Datos:**
```
DD - DIRECCIÓN DE DESPACHO
DD - LOGISTICA
DG - AUDITORÍA MÉDICA
AD - ADMINISTRACIÓN
```

---

### 3️⃣ Columna: `stat_area` (Estado del Área)

| Propiedad | Valor |
|-----------|-------|
| **Nombre en DB** | `stat_area` |
| **Tipo de Dato** | `VARCHAR(1)` |
| **Constraints** | NOT NULL, DEFAULT='A' |
| **Nulable** | NO |
| **Valores Permitidos** | `'A'` (Activo) o `'I'` (Inactivo) |
| **Valor por Defecto** | `'A'` (Activo) |
| **Descripción** | Estado operativo del área |
| **Ejemplo** | "A", "I" |

```sql
-- DDL
stat_area VARCHAR(1) NOT NULL DEFAULT 'A'
```

**Significado de valores:**
| Valor | Significado | Descripción |
|-------|-------------|-------------|
| `'A'` | ACTIVE | Área operativa, disponible para usar |
| `'I'` | INACTIVE | Área desactivada, no se utiliza |

---

### 4️⃣ Columna: `created_at` (Fecha de Creación)

| Propiedad | Valor |
|-----------|-------|
| **Nombre en DB** | `created_at` |
| **Tipo de Dato** | `TIMESTAMP WITH TIME ZONE` |
| **Constraints** | NOT NULL, IMMUTABLE (auto-managed) |
| **Nulable** | NO |
| **Valores Permitidos** | Fecha y hora con zona horaria |
| **Descripción** | Momento en que el registro fue creado |
| **Ejemplo** | "2026-01-07 14:30:45.123456+00:00" |

```sql
-- DDL
created_at TIMESTAMP WITH TIME ZONE NOT NULL
```

**Características:**
- Asignada automáticamente por la aplicación (no por trigger DB)
- Se establece una sola vez al crear el registro
- Incluye zona horaria para precisión global
- Utilizada para auditoría y ordenamiento temporal

---

### 5️⃣ Columna: `updated_at` (Fecha de Última Actualización)

| Propiedad | Valor |
|-----------|-------|
| **Nombre en DB** | `updated_at` |
| **Tipo de Dato** | `TIMESTAMP WITH TIME ZONE` |
| **Constraints** | NOT NULL (auto-managed) |
| **Nulable** | NO |
| **Valores Permitidos** | Fecha y hora con zona horaria |
| **Descripción** | Momento de la última modificación del registro |
| **Ejemplo** | "2026-01-07 16:45:23.654321+00:00" |

```sql
-- DDL
updated_at TIMESTAMP WITH TIME ZONE NOT NULL
```

**Características:**
- Actualizada automáticamente cada vez que se modifica el registro
- Se establece con la fecha/hora actual en cada UPDATE
- Incluye zona horaria
- Utilizada para rastrear cambios y ordenamiento

---

## 🔑 Índices y Constraints

### Índice Primary Key
```sql
PRIMARY KEY (id_area)
-- Tipo: B-tree
-- Acceso: Muy rápido
-- Uso: Búsquedas por ID
```

### Índice Unique
```sql
UNIQUE (desc_area)
-- Tipo: B-tree
-- Acceso: Muy rápido
-- Uso: Evita duplicados, búsqueda por descripción
```

### Índices Implícitos (por Foreign Keys)
```sql
-- Estos índices existen automáticamente en tablas que referencian dim_area:
INDEX dim_personal_cnt(id_area)
INDEX dim_roles(id_area)
```

---

## 🔗 Relaciones (Foreign Keys)

### Relación 1: Area → PersonalCnt (Personal del Área)

**Desde:** `dim_area`
**Hacia:** `dim_personal_cnt`
**Cardinalidad:** `1:N` (Una área tiene muchos personal)
**Foreign Key en:** `dim_personal_cnt.id_area`

```sql
ALTER TABLE dim_personal_cnt
ADD CONSTRAINT fk_personal_area
FOREIGN KEY (id_area)
REFERENCES dim_area(id_area)
ON DELETE RESTRICT
ON UPDATE CASCADE;
```

**Significado:**
- Cada persona (`dim_personal_cnt`) pertenece a exactamente UNA área
- Una área puede tener múltiples personas asignadas
- `ON DELETE RESTRICT`: No permite eliminar un área que tiene personal asignado
- `ON UPDATE CASCADE`: Si se actualiza `id_area` en `dim_area`, se actualiza automáticamente en `dim_personal_cnt`

**Ejemplo de datos:**
```
dim_area:
  id_area=1, desc_area="DD - DIRECCIÓN DE DESPACHO"

dim_personal_cnt:
  id_personal=100, id_area=1, nombre="Juan Pérez"
  id_personal=101, id_area=1, nombre="María García"
```

---

### Relación 2: Area → Rol (Roles por Área)

**Desde:** `dim_area`
**Hacia:** `dim_roles`
**Cardinalidad:** `1:N` (Una área tiene muchos roles)
**Foreign Key en:** `dim_roles.id_area`

```sql
ALTER TABLE dim_roles
ADD CONSTRAINT fk_roles_area
FOREIGN KEY (id_area)
REFERENCES dim_area(id_area)
ON DELETE RESTRICT
ON UPDATE CASCADE;
```

**Significado:**
- Cada rol (`dim_roles`) está asociado a exactamente UNA área
- Una área puede tener múltiples roles definidos
- Ejemplo: El área "Cardiología" puede tener roles: Médico, Enfermero, Administrativo

**Ejemplo de datos:**
```
dim_area:
  id_area=5, desc_area="CARDIOLOGÍA"

dim_roles:
  id_rol=50, id_area=5, nombre_rol="Médico Cardiólogo"
  id_rol=51, id_area=5, nombre_rol="Enfermero Cardíaco"
```

---

## 📊 SQL DDL Completo (Create Table)

```sql
CREATE TABLE dim_area (
    id_area BIGSERIAL PRIMARY KEY,
    desc_area VARCHAR(255) NOT NULL UNIQUE,
    stat_area VARCHAR(1) NOT NULL DEFAULT 'A',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Crear índices explícitos (aunque algunos se crean automáticamente)
CREATE INDEX idx_dim_area_stat_area ON dim_area(stat_area);
CREATE INDEX idx_dim_area_desc_area ON dim_area(desc_area);

-- Foreign Keys (en otras tablas que referencian dim_area)
ALTER TABLE dim_personal_cnt
ADD CONSTRAINT fk_personal_area
FOREIGN KEY (id_area)
REFERENCES dim_area(id_area)
ON DELETE RESTRICT;

ALTER TABLE dim_roles
ADD CONSTRAINT fk_roles_area
FOREIGN KEY (id_area)
REFERENCES dim_area(id_area)
ON DELETE RESTRICT;
```

---

## 🔍 Queries Útiles

### 1. Ver todas las áreas (activas)
```sql
SELECT
    id_area,
    desc_area,
    stat_area,
    created_at,
    updated_at
FROM dim_area
WHERE stat_area = 'A'
ORDER BY desc_area ASC;
```

**Resultado esperado:**
```
id_area | desc_area                    | stat_area | created_at            | updated_at
--------|------------------------------|-----------|-----------------------|--------------------
1       | DD - DIRECCIÓN DE DESPACHO   | A         | 2025-06-01 10:00:00   | 2026-01-07 14:30:00
2       | DD - LOGISTICA               | A         | 2025-06-01 10:05:00   | 2025-06-01 10:05:00
3       | DG - AUDITORÍA MÉDICA        | A         | 2025-06-02 09:00:00   | 2025-06-02 09:00:00
```

---

### 2. Ver áreas con su personal asignado
```sql
SELECT
    a.id_area,
    a.desc_area,
    COUNT(p.id_personal) as cantidad_personal
FROM dim_area a
LEFT JOIN dim_personal_cnt p ON a.id_area = p.id_area
GROUP BY a.id_area, a.desc_area
ORDER BY cantidad_personal DESC;
```

**Resultado esperado:**
```
id_area | desc_area                    | cantidad_personal
--------|------------------------------|-------------------
1       | DD - DIRECCIÓN DE DESPACHO   | 5
5       | CARDIOLOGÍA                  | 3
2       | DD - LOGISTICA               | 2
3       | DG - AUDITORÍA MÉDICA        | 0
```

---

### 3. Buscar área por código (para el nuevo patrón)
```sql
SELECT *
FROM dim_area
WHERE desc_area LIKE 'DD - %'
ORDER BY desc_area;
```

**Resultado esperado:**
```
Todas las áreas que empiezan con "DD -"
```

---

### 4. Insertar nueva área
```sql
INSERT INTO dim_area (desc_area, stat_area, created_at, updated_at)
VALUES ('AD - ADMINISTRACIÓN', 'A', NOW(), NOW())
RETURNING id_area, desc_area;
```

---

### 5. Actualizar estado de un área
```sql
UPDATE dim_area
SET stat_area = 'I', updated_at = NOW()
WHERE id_area = 3;
```

---

## 📈 Estadísticas de Uso

| Métrica | Valor |
|---------|-------|
| **Accesos Totales** | 15,772 |
| **Criticidad** | ALTA |
| **Filas Actuales** | ~30-50 (estimado) |
| **Tamaño Aproximado** | 50 KB |
| **Frecuencia de Lectura** | MUY ALTA (cada operación consulta áreas) |
| **Frecuencia de Escritura** | BAJA (solo al crear/editar áreas) |

---

## 🔐 Consideraciones de Seguridad

1. **Auditoría**: Los campos `created_at` y `updated_at` registran cuándo se hicieron cambios
2. **Integridad Referencial**: Los foreign keys previenen que se elimine un área si aún tiene personal o roles
3. **Uniqueness**: El constraint UNIQUE en `desc_area` previene duplicados
4. **Status Control**: El campo `stat_area` permite desactivar áreas sin eliminarlas (soft delete)

---

## 💾 Integración con ORM (Hibernate/JPA)

La tabla se mapea en Java mediante la entidad `Area.java`:

```java
@Entity
@Table(name = "dim_area")
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_area")
    private Long idArea;

    @Column(name = "desc_area", nullable = false, unique = true, length = 255)
    private String descArea;

    @Column(name = "stat_area", nullable = false, length = 1)
    private String statArea;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "area", fetch = FetchType.LAZY)
    private Set<PersonalCnt> personal = new HashSet<>();

    @OneToMany(mappedBy = "area", fetch = FetchType.LAZY)
    private Set<Rol> roles = new HashSet<>();
}
```

---

## 📝 Notas de Implementación

1. **Patrón de Formato**: El campo `desc_area` sigue el patrón `CODIGO - DESCRIPCION`
   - Se puede separar en la capa de presentación (ver `spec/02_Frontend/01_patron_separacion_campos_compuestos.md`)
   - El backend mantiene el formato combinado para compatibilidad

2. **Timestamps**: PostgreSQL usa `TIMESTAMP WITH TIME ZONE` para precisión global
   - Recomendado para aplicaciones distribuidas
   - Siempre se almacena en UTC internamente

3. **Status Activo/Inactivo**: Se prefiere marcar como inactivo (`'I'`) en lugar de eliminar
   - Mantiene integridad referencial
   - Preserva histórico de auditoría
   - Permite reactivar si es necesario

4. **Índices**: Los índices en `stat_area` y `desc_area` optimizan consultas frecuentes
   - El índice UNIQUE en `desc_area` es automático

---

## 🚀 Tabla Relacionada: DIM_AREA_HOSP

Existe una tabla similar `dim_area_hosp` para áreas hospitalarias (estructura ligeramente diferente):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_area_hosp` | BIGINT PK | Identificador único |
| `cod_area_hosp` | VARCHAR | Código del área hospitalaria |
| `desc_area_hosp` | VARCHAR | Descripción del área |
| `abr_area_hosp` | VARCHAR | Abreviatura |
| `stat_area_hosp` | VARCHAR | Estado (A/I) |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de actualización |

---

**Fin de Documentación - Esquema Tabla DIM_AREA**

*Para integración en frontend, ver: `spec/02_Frontend/01_patron_separacion_campos_compuestos.md`*
*Para auditoría, ver: `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`*
