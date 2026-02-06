# 📦 Tipos de Bolsas - Referencia Completa

> **Arquitectura de Gestión de Bolsas en CENATE v1.48.8**
> **Última Actualización:** 2026-02-06
> **Versión:** v1.0.0

---

## 🎯 ¿Qué son las Bolsas?

Las **Bolsas** son categorías o grupos de pacientes que requieren atención telemédica especializada. Cada bolsa representa un tipo específico de solicitud médica, registro epidemiológico o especialidad.

---

## 📊 Tipos de Bolsas Disponibles

| Código | Descripción | Propósito | Estado |
|--------|-------------|----------|--------|
| `BOLSA_107` | Bolsa 107 - Importación de pacientes masiva | Importar pacientes en lote desde bases de datos | ✅ Activo |
| `BOLSA_DENGUE` | Bolsa Dengue - Control epidemiológico | Seguimiento de casos de dengue | ✅ Activo |
| `BOLSAS_ENFERMERIA` | Bolsas Enfermería - Atenciones de enfermería | Servicios de enfermería | ✅ Activo |
| `BOLSAS_EXPLOTADATOS` | Bolsas Explotación de Datos - Análisis y reportes | Análisis epidemiológico y reportes | ✅ Activo |
| `BOLSAS_IVR` | Bolsas IVR - Sistema interactivo de respuesta de voz | Llamadas telefónicas automáticas | ✅ Activo |
| `BOLSAS_REPROGRAMACION` | Bolsas Reprogramación - Citas reprogramadas | Gestión de citas reprogramadas | ✅ Activo |
| `BOLSA_GESTORES_TERRITORIAL` | Bolsa Gestores Territorial - Gestión territorial | Coordinación territorial | ✅ Activo |

---

## 🏗️ Arquitectura de Datos

### Tablas Involucradas

```
dim_tipos_bolsas (CATÁLOGO - Tipos predefinidos)
    ↓ (FALTA USAR EN ACTUALIDAD)
    id_tipo_bolsa, cod_tipo_bolsa, desc_tipo_bolsa

dim_solicitud_bolsa (DATOS REALES - Solicitudes importadas)
    ↓ (ES LO QUE USA EL SISTEMA)
    id_solicitud, desc_tipo_bolsa (puede diferir del catálogo)

SolicitudBolsaDTO (API Response)
    ↓
    descTipoBolsa (el que ve el frontend)
```

### Flujo de Datos en Frontend

```
GET /api/bolsas/solicitudes
    ↓
SolicitudBolsaController.listarTodas()
    ↓
SolicitudBolsaService.listarTodasPaginado()
    ↓
SELECT * FROM dim_solicitud_bolsa (con JOINs)
    ↓
SolicitudBolsaDTO { desc_tipo_bolsa: "Bolsa 107" }
    ↓
Frontend: Solicitudes.jsx mapea descBolsa
    ↓
FilaSolicitud.jsx renderiza en tabla
```

---

## 🔄 Diferencia: Catálogo vs Datos Reales

### dim_tipos_bolsas (CATÁLOGO)
- **Tabla:** Predefinida con tipos estándar
- **Propósito:** Referencia de tipos disponibles
- **Datos:** Controlados, limitados
- **Uso Actual:** Mínimo (legacy)

```sql
SELECT * FROM dim_tipos_bolsas;
-- id_tipo_bolsa | cod_tipo_bolsa | desc_tipo_bolsa
-- 1             | BOLSA_107      | Bolsa 107 - Importación de pacientes masiva
-- 2             | BOLSA_DENGUE   | Bolsa Dengue - Control epidemiológico
-- ...
```

### dim_solicitud_bolsa (DATOS REALES)
- **Tabla:** Contiene solicitudes importadas
- **Propósito:** Datos operacionales de pacientes
- **Datos:** Variados, según imports
- **Uso Actual:** PRIMARIO ✅

```sql
SELECT DISTINCT desc_tipo_bolsa FROM dim_solicitud_bolsa;
-- desc_tipo_bolsa
-- Bolsa 107
-- Bolsa generada por el [usuario]
-- Bolsa Dengue
-- (valores pueden ser diferentes a catálogo)
```

---

## 📥 Flujo de Importación (v1.46.0+)

### Paso 1: Usuario Selecciona Tipo de Bolsa
```
Dropdown en Frontend
    ↓
GET /api/bolsas/tipos (lista de dim_tipos_bolsas)
    ↓
Muestra: "Bolsa 107", "Bolsa Dengue", etc.
```

### Paso 2: Usuario Sube Excel
```
POST /api/bolsas/solicitudes/importar
    ↓
Backend procesa archivo
    ↓
INSERT INTO dim_solicitud_bolsa (desc_tipo_bolsa = ?)
    ↓
desc_tipo_bolsa = nombre del tipo seleccionado
```

### Paso 3: Frontend Lista Solicitudes
```
GET /api/bolsas/solicitudes
    ↓
Devuelve SolicitudBolsaDTO[]
    ↓
desc_tipo_bolsa proviene de dim_solicitud_bolsa.desc_tipo_bolsa
    ↓
Frontend renderiza en tabla
```

---

## 🔐 Tabla de Equivalencia: Código ↔ Descripción

```
BOLSA_107
├── BD (catálogo): "Bolsa 107 - Importación de pacientes masiva"
└── Frontend: "Bolsa 107" (alias generado)

BOLSA_DENGUE
├── BD (catálogo): "Bolsa Dengue - Control epidemiológico"
└── Frontend: "Bolsa Dengue"

BOLSA_GESTORES_TERRITORIAL
├── BD (catálogo): "Bolsa Gestores Territorial - Gestión territorial"
└── Frontend: "Bolsa Gestores Territorial"
```

---

## 💾 Modelos Backend

### Entity: SolicitudBolsa
```java
@Entity
@Table(name = "dim_solicitud_bolsa")
public class SolicitudBolsa {
    @Column(name = "desc_tipo_bolsa")
    private String descTipoBolsa;  // ← Campo que se muestra en tabla

    @Column(name = "id_bolsa")
    private Long idBolsa;          // ← FK a dim_tipos_bolsas (legacy)
}
```

### DTO: SolicitudBolsaDTO
```java
@Data
public class SolicitudBolsaDTO {
    @JsonProperty("desc_tipo_bolsa")
    private String descTipoBolsa;  // ← Lo que devuelve API

    @JsonProperty("id_bolsa")
    private Long idBolsa;
}
```

---

## 🖥️ Representación Frontend

### Tabla: `/bolsas/solicitudes`

**Columna:** "Origen de la Bolsa"

```
Solicitud 1: "Bolsa 107"
Solicitud 2: "Bolsa generada por el sistema"
Solicitud 3: "Bolsa Dengue"
Solicitud 4: "Bolsa 107"
```

**Proceso en Frontend:**
```javascript
// Solicitudes.jsx línea 514
descBolsa: solicitud.desc_tipo_bolsa || 'Sin clasificar'

// FilaSolicitud.jsx línea 41
<span>{solicitud.descBolsa}</span>
// Renderiza: "Bolsa 107", "Bolsa generada...", etc.
```

---

## 🔧 Cómo Cambiar/Agregar Tipos de Bolsa

### Opción 1: Agregar al Catálogo (dim_tipos_bolsas)
```sql
INSERT INTO dim_tipos_bolsas (cod_tipo_bolsa, desc_tipo_bolsa, stat_tipo_bolsa)
VALUES ('BOLSA_NUEVA', 'Bolsa Nueva - Descripción', 'A');
```

### Opción 2: Cambiar Descripción de Solicitudes Existentes
```sql
UPDATE dim_solicitud_bolsa
SET desc_tipo_bolsa = 'Nuevo nombre'
WHERE desc_tipo_bolsa = 'Viejo nombre';
```

---

## 📋 Relación con Otros Módulos

| Módulo | Relación |
|--------|----------|
| **Gestion Pacientes** | Cada solicitud de bolsa corresponde a un paciente |
| **Gestion Citas** | Las bolsas pueden tener citas asociadas |
| **Telemedicina** | Pacientes de bolsas pueden atenderse por telemedicina |
| **Importación Excel** | Las bolsas se crean/usan durante importación |

---

## 🎓 Conceptos Clave

### ¿Por qué dos tablas de bolsas?

1. **dim_tipos_bolsas:** Referencia estática, control de catálogo
2. **dim_solicitud_bolsa:** Datos operacionales, flexible

Permite que cada solicitud tenga un nombre descriptivo, sin estar limitado al catálogo.

### ¿Qué es desc_tipo_bolsa?

Es el **nombre/descripción de la bolsa tal como aparece en los datos operacionales**. Puede ser igual al catálogo o diferente, según cómo se importó.

---

## 🐛 Troubleshooting

**Q: ¿Por qué veo "Bolsa generada por el..." en la tabla?**
A: Ese nombre proviene de `dim_solicitud_bolsa.desc_tipo_bolsa`, insertado durante importación.

**Q: ¿Dónde están los tipos de bolsa predefinidos?**
A: En `dim_tipos_bolsas` (tabla catálogo), pero no se usan actualmente en operaciones.

**Q: ¿Cómo cambio el nombre de una bolsa?**
A: Actualiza el campo `desc_tipo_bolsa` en `dim_solicitud_bolsa` o reimporta con el nuevo nombre.

---

## 📚 Referencias Relacionadas

- [`spec/INDEX.md`](../INDEX.md) - Índice maestro del proyecto
- [`CLAUDE.md`](../../CLAUDE.md) - Instrucciones para Claude
- [`spec/backend/README.md`](./README.md) - Backend general
- [`spec/database/README.md`](../database/README.md) - Esquema BD

---

**Documento creado en:** 2026-02-06
**Versión:** v1.0.0
**Estado:** ✅ Completo
