# 📚 Índice: Documentación Completa de Tabla DIM_AREA

**Versión:** 1.0
**Fecha:** 2026-01-07
**Contexto:** CENATE - Tabla de Áreas Organizacionales
**Autor:** Styp Canto Rondón

---

## 🎯 Propósito de este Índice

Este documento centraliza toda la documentación técnica sobre la tabla `dim_area` en PostgreSQL, facilitando la consulta desde diferentes perspectivas:
- Analistas de Base de Datos
- Desarrolladores Backend
- Desarrolladores Frontend
- DevOps/DBAs

---

## 📖 Documentación Disponible

### 1️⃣ **Esquema de Tabla: Estructura Completa**
📄 **Archivo:** `01_esquema_tabla_areas.md`

**Contiene:**
- Descripción general de la tabla
- Diagrama ER (Entity-Relationship)
- Estructura detallada de cada columna (5 campos)
- Información de Primary Key y Unique Index
- Relaciones One-to-Many (Personal, Roles)
- SQL DDL completo (CREATE TABLE)
- Queries útiles (SELECT, INSERT, UPDATE, DELETE)
- Estadísticas de uso
- Consideraciones de seguridad
- Integración con ORM (Hibernate/JPA)
- Notas de implementación

**Mejor para:**
- Entender la estructura física de la tabla
- Consultar tipos de datos
- Conocer constraints y validaciones
- Revisar SQL DDL
- Entender relaciones con otras tablas

**Secciones principales:**
```
├── Descripción General
├── Diagrama ER
├── 5 Columnas (id_area, desc_area, stat_area, created_at, updated_at)
├── Índices (Primary Key, Unique, Recomendado)
├── Relaciones (Personal, Roles)
├── SQL DDL Completo
├── Queries Útiles
├── Estadísticas
├── Seguridad
├── ORM Integration
└── Notas
```

---

### 2️⃣ **Flujo de Datos: Backend ↔ Frontend**
📄 **Archivo:** `02_diagrama_flujo_datos_areas.md`

**Contiene:**
- Arquitectura general (5 capas)
- Ciclo de vida CREAR (Create - 7 pasos)
- Ciclo de vida LEER (Read - 4 pasos)
- Ciclo de vida EDITAR (Update - 4 pasos)
- Mapeo de conversión (React ↔ Backend ↔ PostgreSQL)
- Transformación de estado (`statArea`: "1"↔"A")
- Estructura de componentes React
- Validaciones en 3 capas
- Operaciones CRUD completas
- Diagrama visual de relaciones
- Ejemplos prácticos con JSON

**Mejor para:**
- Entender cómo fluyen los datos
- Seguir una solicitud desde Frontend → Backend → BD
- Entender transformaciones de datos
- Validaciones en cada capa
- Debugging de problemas de integración

**Secciones principales:**
```
├── Arquitectura General (5 capas)
├── Ciclo CREAR (7 pasos detallados)
├── Ciclo LEER (4 pasos)
├── Ciclo EDITAR (4 pasos)
├── Mapeo de Conversión
├── Transformaciones de Estado
├── Estructura React
├── Validaciones (3 capas)
├── CRUD Completo
└── Ejemplos
```

---

### 3️⃣ **Diagrama Visual: Representación Física**
📄 **Archivo:** `03_diagrama_visual_tabla.md`

**Contiene:**
- Representación ASCII de la tabla
- Estructura expandida de cada columna
- Visualización de índices
- Diagrama de distribución de datos
- Transformación de datos (BD → Frontend)
- Tabla HTML renderizada en navegador
- Estimación de tamaño en disco
- Operaciones SQL típicas (SELECT, INSERT, UPDATE, DELETE)
- Reglas de integridad
- Foreign Keys visuales
- Metadatos de tabla
- Ciclo de vida completo de 1 fila
- Plan de mantenimiento

**Mejor para:**
- Ver visualmente cómo se almacenan los datos
- Entender índices y su impacto
- Estimar tamaño de tabla
- Consultar operaciones SQL comunes
- Entender reglas de integridad
- Seguir transformaciones de datos visualmente
- Planificar mantenimiento

**Secciones principales:**
```
├── Diagrama ASCII de tabla
├── 5 Columnas (expandidas visualmente)
├── Índices (3 tipos)
├── Diagrama de distribución
├── Transformación de datos
├── Tabla HTML renderizada
├── Tamaño estimado
├── SQL Típico
├── Reglas de Integridad
├── Foreign Keys
├── Metadatos
├── Ciclo de vida
└── Mantenimiento
```

---

## 🗺️ Mapa de Navegación

### Si necesitas saber...

| Pregunta | Documento | Sección |
|----------|-----------|---------|
| ¿Qué campos tiene la tabla? | `01_esquema_tabla_areas.md` | Estructura de Campos |
| ¿Cuál es el tipo de dato de cada campo? | `01_esquema_tabla_areas.md` | Cada columna |
| ¿Cómo se relaciona con otras tablas? | `01_esquema_tabla_areas.md` | Relaciones (Foreign Keys) |
| ¿Cuál es el SQL DDL? | `01_esquema_tabla_areas.md` | SQL DDL Completo |
| ¿Cómo fluyen los datos desde frontend? | `02_diagrama_flujo_datos_areas.md` | Ciclo de vida CREAR |
| ¿Cómo se validan los datos? | `02_diagrama_flujo_datos_areas.md` | Validaciones 3 capas |
| ¿Cómo se transforma el estado? | `02_diagrama_flujo_datos_areas.md` | Transformación de estado |
| ¿Visualmente cómo se ve la tabla? | `03_diagrama_visual_tabla.md` | Diagrama ASCII |
| ¿Qué índices tiene la tabla? | `03_diagrama_visual_tabla.md` | Índices |
| ¿Cuál es la estimación de tamaño? | `03_diagrama_visual_tabla.md` | Tamaño estimado |
| ¿Qué operaciones SQL son comunes? | `03_diagrama_visual_tabla.md` | Operaciones SQL típicas |
| ¿Cuál es el ciclo de vida de un registro? | `03_diagrama_visual_tabla.md` | Ciclo de vida |
| ¿Qué reglas de integridad hay? | `03_diagrama_visual_tabla.md` | Reglas de Integridad |

---

## 📊 Resumen Rápido: Tabla DIM_AREA

### Identificación
- **Nombre:** `dim_area`
- **Tipo:** Tabla Maestra (Dimensión)
- **Esquema:** `public`
- **Propósito:** Almacenar áreas organizacionales del sistema

### Estructura (5 Columnas)
```
┌────────────────────────────────────────────────────────┐
│ Columna        │ Tipo              │ Constraints       │
├────────────────────────────────────────────────────────┤
│ id_area        │ BIGSERIAL         │ PRIMARY KEY       │
│ desc_area      │ VARCHAR(255)      │ NOT NULL, UNIQUE  │
│ stat_area      │ VARCHAR(1)        │ NOT NULL, DEF='A' │
│ created_at     │ TIMESTAMP TZ      │ NOT NULL          │
│ updated_at     │ TIMESTAMP TZ      │ NOT NULL          │
└────────────────────────────────────────────────────────┘
```

### Relaciones
```
dim_area (1) ─┬─ (N) dim_personal_cnt  [Personal asignado]
              └─ (N) dim_roles         [Roles por área]
```

### Índices
- **Primary Key:** `dim_area_pkey` (id_area)
- **Unique:** `dim_area_desc_area_key` (desc_area)
- **Optional:** `idx_dim_area_stat_area` (stat_area)

### Datos Típicos
```
1 | DD - DIRECCIÓN DE DESPACHO | A | 2026-01-07 10:00 | 2026-01-07 10:00
2 | DD - LOGISTICA             | A | 2026-01-07 10:05 | 2026-01-07 10:05
3 | DG - AUDITORÍA MÉDICA      | A | 2026-01-07 11:30 | 2026-01-07 11:30
```

### Estado (stat_area)
- `'A'` = ACTIVE (Activo)
- `'I'` = INACTIVE (Inactivo)

---

## 🔄 Integración con Patrón de Frontend

La tabla se integra con el **Patrón de Separación de Campos Compuestos** documentado en:
📄 **Archivo:** `spec/02_Frontend/01_patron_separacion_campos_compuestos.md`

**Relación:**
```
Database: "DD - DIRECCIÓN DE DESPACHO"
            ↓
Frontend Extraction:
  ├─ dependencia: "DD"
  └─ nombreArea: "DIRECCIÓN DE DESPACHO"
            ↓
User Interface:
  ┌──────────────┬──────────────────────┐
  │ DEPENDENCIA  │ NOMBRE DEL ÁREA      │
  ├──────────────┼──────────────────────┤
  │ DD           │ DIRECCIÓN DE DESPACHO│
  └──────────────┴──────────────────────┘
```

---

## 🎓 Casos de Uso Documentados

### Caso 1: Consultar Áreas Activas
**Documento:** `01_esquema_tabla_areas.md` → Queries Útiles
**Query:**
```sql
SELECT id_area, desc_area, stat_area, created_at, updated_at
FROM dim_area
WHERE stat_area = 'A'
ORDER BY desc_area ASC;
```

---

### Caso 2: Crear Nueva Área
**Documento:** `02_diagrama_flujo_datos_areas.md` → Ciclo CREAR
**Pasos:**
1. Usuario completa formulario en modal (Frontend)
2. Combina campos separados → "CODIGO - DESCRIPCION"
3. Envía POST /api/areas/crear (JSON)
4. Backend valida y prepara entidad
5. Hibernate genera INSERT
6. PostgreSQL almacena

---

### Caso 3: Editar Área Existente
**Documento:** `02_diagrama_flujo_datos_areas.md` → Ciclo EDITAR
**Pasos:**
1. Usuario abre modal con datos precargados
2. Frontend extrae campos (regex)
3. Usuario modifica
4. Combina campos nuevamente
5. Envía PUT /api/areas/{id}
6. Backend ejecuta UPDATE

---

### Caso 4: Buscar Áreas por Código
**Documento:** `03_diagrama_visual_tabla.md` → Operaciones SQL
**Query:**
```sql
SELECT *
FROM dim_area
WHERE desc_area LIKE 'DD - %'
ORDER BY desc_area;
```

---

### Caso 5: Desactivar Área (Soft Delete)
**Documento:** `03_diagrama_visual_tabla.md` → Ciclo de Vida
**Query:**
```sql
UPDATE dim_area
SET stat_area = 'I', updated_at = NOW()
WHERE id_area = 5;
```

---

## 🔐 Seguridad y Auditoría

**Documen archivos:**
- `01_esquema_tabla_areas.md` → Consideraciones de Seguridad
- `03_diagrama_visual_tabla.md` → Reglas de Integridad

**Características:**
- ✓ UNIQUE constraint previene duplicados
- ✓ CHECK constraint valida estado
- ✓ NOT NULL ensures data completeness
- ✓ Timestamps (`created_at`, `updated_at`) para auditoría
- ✓ Foreign Keys previenen eliminación de áreas con dependencias
- ✓ Soft Delete mantiene histórico

---

## 🚀 Tabla Relacionada: dim_area_hosp

Existe una tabla similar para áreas hospitalarias:
```
dim_area_hosp
├── id_area_hosp (BIGINT PK)
├── cod_area_hosp (VARCHAR)
├── desc_area_hosp (VARCHAR)
├── abr_area_hosp (VARCHAR)
├── stat_area_hosp (VARCHAR)
├── created_at (TIMESTAMP TZ)
└── updated_at (TIMESTAMP TZ)
```

Ver documento: `01_esquema_tabla_areas.md` → Tabla Relacionada: DIM_AREA_HOSP

---

## 📈 Estadísticas

| Métrica | Valor |
|---------|-------|
| Accesos Totales | 15,772 |
| Criticidad | ALTA |
| Filas Estimadas | 30-50 |
| Tamaño Aproximado | 50-100 KB |
| Frecuencia Lectura | MUY ALTA |
| Frecuencia Escritura | BAJA |
| Índices | 3 (PK, UNIQUE, Stat) |
| Relaciones Salientes | 2 (Personal, Roles) |

---

## 💼 Tabla en Contexto CENATE

### Relación con Módulos

**Módulo: Gestión de Usuarios**
- Las áreas se asignan a personal (dim_personal_cnt)
- Las áreas definen roles disponibles (dim_roles)

**Módulo: Disponibilidad Médica**
- Médicos declaran disponibilidad por área
- Turnos se asignan por área

**Módulo: Auditoría**
- Se registran cambios en tabla de auditoría
- created_at/updated_at proporciona timeline

---

## 🔧 Mantenimiento Recomendado

**Diario:**
- Monitorear tamaño
- Revisar alertas

**Semanal:**
- VACUUM (limpieza)
- ANALYZE (estadísticas)

**Mensual:**
- Validar integridad referencial
- Backup

**Ver:** `03_diagrama_visual_tabla.md` → Plan de Mantenimiento

---

## 📚 Enlaces a Otros Documentos

- **Patrón Frontend:** `spec/02_Frontend/01_patron_separacion_campos_compuestos.md`
- **Auditoría:** `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`
- **Modelo de Usuarios:** `spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md`
- **Análisis Estructura:** `spec/04_BaseDatos/04_analisis_estructura/`

---

## 🎯 Guía Rápida por Rol

### 👨‍💻 Desarrollador Frontend
1. Lee: `02_diagrama_flujo_datos_areas.md` (entender flujo)
2. Lee: `spec/02_Frontend/01_patron_separacion_campos_compuestos.md` (patrón)
3. Consulta: `01_esquema_tabla_areas.md` (si necesita detalles BD)

### 🔧 Desarrollador Backend
1. Lee: `01_esquema_tabla_areas.md` (estructura completa)
2. Lee: `02_diagrama_flujo_datos_areas.md` (validaciones)
3. Consulta: `03_diagrama_visual_tabla.md` (SQL típico)

### 🗄️ DBA/DevOps
1. Lee: `03_diagrama_visual_tabla.md` (visual, índices, tamaño)
2. Lee: `01_esquema_tabla_areas.md` (DDL, constraints)
3. Consulta: Plan de Mantenimiento

### 📊 Analista de Datos
1. Lee: `01_esquema_tabla_areas.md` (campos, tipos)
2. Lee: `03_diagrama_visual_tabla.md` (distribución, ejemplos)
3. Consulta: Queries Útiles

---

## ✅ Checklist: Antes de Implementar

- [ ] Leí el esquema (01_esquema_tabla_areas.md)
- [ ] Entiendo el flujo de datos (02_diagrama_flujo_datos_areas.md)
- [ ] Conozco los índices (03_diagrama_visual_tabla.md)
- [ ] Revisé las validaciones en 3 capas
- [ ] Entiendo las restricciones (FK, UNIQUE, NOT NULL)
- [ ] Conozco el patrón de frontend (separación de campos)
- [ ] Revisé queries típicas
- [ ] Planifiqué mantenimiento si aplica

---

## 📝 Notas Importantes

1. **Formato de desc_area:** El patrón `CODIGO - DESCRIPCION` es estándar
   - Se puede personalizar con regex en frontend
   - Backend siempre combina antes de guardar

2. **Soft Delete:** Las áreas se desactivan (`stat_area = 'I'`), NO se eliminan
   - Mantiene integridad referencial
   - Preserva histórico de auditoría

3. **Timestamps:** Se manejan automáticamente
   - `created_at` nunca cambia después de inserción
   - `updated_at` se actualiza con cada cambio

4. **Integridad:** Foreign Keys previenen eliminación
   - No se puede eliminar área si tiene personal
   - No se puede eliminar área si tiene roles

---

## 🎓 Referencias Cruzadas

```
Documentación de Tabla (este archivo)
    ├─ 01_esquema_tabla_areas.md (Estructura)
    ├─ 02_diagrama_flujo_datos_areas.md (Integración)
    ├─ 03_diagrama_visual_tabla.md (Visualización)
    │
    └─ Relacionados:
        ├─ spec/02_Frontend/01_patron_separacion_campos_compuestos.md
        ├─ spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md
        ├─ spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md
        └─ backend/.../model/Area.java
```

---

**Fin de Índice - Documentación DIM_AREA**

*Última actualización: 2026-01-07*
*Versión: 1.0*

*Para contribuciones o mejoras, contactar al equipo de desarrollo CENATE*
