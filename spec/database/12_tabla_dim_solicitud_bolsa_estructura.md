# 📦 Tabla: dim_solicitud_bolsa - Estructura Completa

**Versión:** v1.8.0 (Excel Completo)
**Fecha:** 2026-01-26
**Status:** ✅ Production Ready

---

## 📋 Descripción General

La tabla **`dim_solicitud_bolsa`** almacena todas las **solicitudes de bolsas de pacientes** creadas a través de:

- 📱 Frontend: `http://localhost:3000/bolsas/solicitudes`
- 📝 Carga Excel: `http://localhost:3000/bolsas/cargar-excel`
- 🔧 API REST: `/api/solicitud-bolsa/*`

Una **solicitud de bolsa** es un registro de un paciente que requiere atención médica coordinada dentro de un tipo de bolsa específico.

---

## 🏛️ Información de la Tabla

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | `dim_solicitud_bolsa` |
| **Schema** | `public` |
| **Tipo** | Tabla de Hechos (Dimensión) |
| **Motor** | PostgreSQL 14+ |
| **Total Columnas** | **43 (verificado)** ✅ |
| **Clave Primaria** | `id_solicitud` (BIGINT, AUTO-INCREMENT) |
| **Clave Única** | `numero_solicitud` (VARCHAR) |
| **Índices** | 13 (búsqueda optimizada) |
| **Estado** | 0 registros (tabla vacía) |

---

## 🔑 Estructura de Columnas

### 🆔 Identificación (3 columnas)

| Columna | Tipo | Nullable | Única | Descripción |
|---------|------|----------|-------|-------------|
| `id_solicitud` | BIGINT | ❌ | ✅ | PK - ID único auto-incrementado |
| `numero_solicitud` | VARCHAR(50) | ❌ | ✅ | Número único de solicitud (ej: SOL-2026-00001) |
| `paciente_id` | BIGINT | ❌ | ❌ | FK - Referencia a paciente |

---

### 👤 Datos del Paciente (7 columnas)

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `paciente_nombre` | VARCHAR(255) | ❌ | Nombre completo del paciente |
| `paciente_dni` | VARCHAR(20) | ❌ | DNI/Documento de identidad |
| `paciente_sexo` | VARCHAR(10) | ✅ | 'M' o 'F' |
| `paciente_telefono` | VARCHAR(20) | ✅ | Número de contacto |
| `paciente_email` | VARCHAR(255) | ✅ | Email del paciente |
| `fecha_nacimiento` | DATE | ✅ | Fecha de nacimiento |
| `paciente_edad` | INTEGER | ✅ | **CALCULADO** - Se calcula automáticamente |

---

### 📋 Datos de Excel (10 columnas - v1.8.0)

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `tipo_documento` | VARCHAR(50) | ✅ | Tipo de documento (DNI, RUC, etc) |
| `fecha_preferida_no_atendida` | DATE | ✅ | Última fecha que NO fue atendido |
| `codigo_ipress` | VARCHAR(20) | ✅ | Código IPRESS de adscripción |
| `tipo_cita` | VARCHAR(50) | ✅ | Tipo de cita requerida |
| `especialidad` | VARCHAR(255) | ✅ | Especialidad médica |
| (5 más calculados automáticamente) | - | - | - |

---

### 📦 Referencia a Tipo de Bolsa (3 columnas)

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id_bolsa` | BIGINT | ❌ | FK - Referencia a `dim_tipos_bolsas(id_tipo_bolsa)` |
| `cod_tipo_bolsa` | VARCHAR(50) | ✅ | **DENORMALIZADO** - Código (ej: BOLSA_107) |
| `desc_tipo_bolsa` | VARCHAR(255) | ✅ | **DENORMALIZADO** - Descripción |

**Nota:** Las columnas `cod_tipo_bolsa` y `desc_tipo_bolsa` se copian de `dim_tipos_bolsas` por performance (denormalización).

---

### 🏥 Referencias a Servicio, IPRESS y Red (7 columnas)

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id_servicio` | BIGINT | ✅ | FK - Referencia a servicio |
| `cod_servicio` | VARCHAR(10) | ✅ | **DENORMALIZADO** - Código servicio |
| `id_ipress` | BIGINT | ✅ | FK - IPRESS solicitante |
| `codigo_adscripcion` | VARCHAR(20) | ✅ | Código adscripción IPRESS |
| `nombre_ipress` | VARCHAR(255) | ✅ | **DENORMALIZADO** - Nombre IPRESS |
| `red_asistencial` | VARCHAR(255) | ✅ | **DENORMALIZADO** - Red asistencial |
| `(obsoleto - estado anterior)` | - | - | - |

---

### 📊 Estado de Aprobación (3 columnas)

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `estado` | VARCHAR(20) | ❌ | Estado: 'PENDIENTE', 'APROBADO', 'RECHAZADO' |
| `razon_rechazo` | TEXT | ✅ | Motivo del rechazo (si aplica) |
| `notas_aprobacion` | TEXT | ✅ | Notas del aprobador |

**Estados posibles:**
- `PENDIENTE` - Esperando revisión
- `APROBADO` - Solicitud aceptada
- `RECHAZADO` - Solicitud rechazada

---

### 👥 Responsables y Auditoría (6 columnas)

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `solicitante_id` | BIGINT | ✅ | FK - Usuario que solicitó |
| `solicitante_nombre` | VARCHAR(255) | ✅ | **DENORMALIZADO** - Nombre solicitante |
| `responsable_aprobacion_id` | BIGINT | ✅ | FK - Usuario que aprobó |
| `responsable_aprobacion_nombre` | VARCHAR(255) | ✅ | **DENORMALIZADO** - Nombre aprobador |
| `responsable_gestora_id` | BIGINT | ✅ | FK - Gestor de citas |
| `activo` | BOOLEAN | ❌ | Bandera soft-delete (true=activo) |

---

### ⏰ Timestamps (4 columnas)

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `fecha_solicitud` | TIMESTAMP WITH ZONE | ❌ | Fecha/hora de creación (auto) |
| `fecha_aprobacion` | TIMESTAMP WITH ZONE | ✅ | Fecha/hora de aprobación |
| `fecha_actualizacion` | TIMESTAMP WITH ZONE | ❌ | Última actualización (auto) |
| `fecha_asignacion` | TIMESTAMP WITH ZONE | ✅ | Fecha asignación a gestor |

---

### 📋 Estado de Gestión de Citas (3 columnas)

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `estado_gestion_citas_id` | BIGINT | ✅ | FK - `dim_estados_gestion_citas(id_estado)` |
| `cod_estado_cita` | TEXT | ✅ | **DENORMALIZADO** - Código estado |
| `desc_estado_cita` | VARCHAR(255) | ✅ | **DENORMALIZADO** - Descripción estado |

---

### 🗓️ Fechas de Cita y Atención (3 columnas) ⭐ **NUEVO**

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `fecha_cita` | TIMESTAMP WITH TIME ZONE | ✅ | Fecha programada de la cita médica |
| `fecha_atencion` | TIMESTAMP WITH TIME ZONE | ✅ | Fecha/hora en que se realizó la atención |
| `recordatorio_enviado` | BOOLEAN | ✅ | Flag - ¿Se envió recordatorio al paciente? |

**Nota:** Estas 3 columnas estaban en BD pero NO en el modelo Java (bug v1.8.0). ✅ Será corregido ahora.

---

## 🔗 Relaciones y Foreign Keys

```
dim_solicitud_bolsa
├── id_bolsa → dim_tipos_bolsas(id_tipo_bolsa)
│   └─ Tabla de dimensión: Tipos de bolsas disponibles
│
├── paciente_id → dim_asegurados(id_asegurado)
│   └─ Tabla de dimensión: Pacientes/Asegurados
│
├── id_servicio → dim_servicio(id_servicio)
│   └─ Tabla de dimensión: Servicios médicos
│
├── id_ipress → dim_ipress(id_ipress)
│   └─ Tabla de dimensión: IPRESS
│
├── solicitante_id → dim_usuario(id_usuario)
│   └─ Usuario que creó la solicitud
│
├── responsable_aprobacion_id → dim_usuario(id_usuario)
│   └─ Usuario que aprobó
│
├── responsable_gestora_id → dim_usuario(id_usuario)
│   └─ Gestor de citas asignado
│
└── estado_gestion_citas_id → dim_estados_gestion_citas(id_estado)
    └─ Estado de gestión de citas
```

---

## 📊 Ejemplo de Registro

```json
{
  "idSolicitud": 12345,
  "numeroSolicitud": "SOL-2026-00012",
  "pacienteId": 5165001,
  "pacienteNombre": "Juan Pérez García",
  "pacienteDni": "12345678",
  "pacienteSexo": "M",
  "pacienteTelefono": "+51987654321",
  "pacienteEmail": "juan@example.com",
  "fechaNacimiento": "1980-06-15",
  "pacienteEdad": 45,
  "tipoDocumento": "DNI",
  "fechaPreferidaNoAtendida": "2026-01-20",
  "codigoIpress": "068",
  "tipoCita": "PRESENCIAL",
  "especialidad": "CARDIOLOGÍA",
  "idBolsa": 1,
  "codTipoBolsa": "BOLSA_107",
  "descTipoBolsa": "Bolsa 107 - Importación de pacientes masiva",
  "idServicio": 50,
  "codServicio": "CAR",
  "idIpress": 55,
  "codigoAdscripcion": "068",
  "nombreIpress": "HI ANDAHUAYLAS",
  "redAsistencial": "Red Asistencial Región",
  "estado": "PENDIENTE",
  "razonRechazo": null,
  "notasAprobacion": null,
  "solicitanteId": 44914706,
  "solicitanteNombre": "Styp Canto",
  "responsableAprobacionId": null,
  "responsableAprobacionNombre": null,
  "responsableGestoraId": null,
  "fechaSolicitud": "2026-01-26T15:30:00-05:00",
  "fechaAprobacion": null,
  "fechaActualizacion": "2026-01-26T15:30:00-05:00",
  "fechaAsignacion": null,
  "estadoGestionCitasId": null,
  "codEstadoCita": null,
  "descEstadoCita": null,
  "fechaCita": null,
  "fechaAtencion": null,
  "recordatorioEnviado": false,
  "activo": true
}
```

---

## 📈 Estadísticas Actuales

```sql
-- Cantidad total de solicitudes
SELECT COUNT(*) FROM dim_solicitud_bolsa;

-- Por estado
SELECT estado, COUNT(*) FROM dim_solicitud_bolsa GROUP BY estado;

-- Por tipo de bolsa
SELECT cod_tipo_bolsa, COUNT(*) FROM dim_solicitud_bolsa
GROUP BY cod_tipo_bolsa ORDER BY COUNT(*) DESC;

-- Por IPRESS
SELECT nombre_ipress, COUNT(*) FROM dim_solicitud_bolsa
WHERE nombre_ipress IS NOT NULL
GROUP BY nombre_ipress ORDER BY COUNT(*) DESC;

-- Últimas 24 horas
SELECT COUNT(*) FROM dim_solicitud_bolsa
WHERE fecha_solicitud >= NOW() - INTERVAL '24 hours';
```

---

## 🔍 Índices Principales

```sql
-- Índice de búsqueda rápida por paciente
CREATE INDEX idx_paciente_dni ON dim_solicitud_bolsa(paciente_dni);
CREATE INDEX idx_paciente_id ON dim_solicitud_bolsa(paciente_id);

-- Índice de búsqueda por bolsa
CREATE INDEX idx_id_bolsa ON dim_solicitud_bolsa(id_bolsa);

-- Índice de búsqueda por estado
CREATE INDEX idx_estado ON dim_solicitud_bolsa(estado);

-- Índice de búsqueda por IPRESS
CREATE INDEX idx_id_ipress ON dim_solicitud_bolsa(id_ipress);

-- Índice de búsqueda por fecha
CREATE INDEX idx_fecha_solicitud ON dim_solicitud_bolsa(fecha_solicitud);

-- UNIQUE para no duplicar pacientes por bolsa
CONSTRAINT solicitud_paciente_unique UNIQUE (id_bolsa, paciente_id)
```

---

## 🔄 Operaciones Comunes

### 1. Crear Nueva Solicitud

```java
// Backend: SolicitudBolsaController.crear()
SolicitudBolsa solicitud = SolicitudBolsa.builder()
    .numeroSolicitud("SOL-2026-00001")
    .pacienteId(5165001L)
    .pacienteNombre("Juan Pérez")
    .pacienteDni("12345678")
    .idBolsa(1L)
    .codTipoBolsa("BOLSA_107")
    .estado("PENDIENTE")
    .activo(true)
    .build();

solicitudBolsaRepository.save(solicitud);
```

### 2. Buscar Solicitudes

```java
// Por estado
List<SolicitudBolsa> pendientes = solicitudBolsaRepository
    .findByEstado("PENDIENTE");

// Por IPRESS
Page<SolicitudBolsa> porIpress = solicitudBolsaRepository
    .findByIdIpress(55L, pageable);

// Por paciente
Optional<SolicitudBolsa> porPaciente = solicitudBolsaRepository
    .findByPacienteDni("12345678");
```

### 3. Actualizar Estado

```java
SolicitudBolsa solicitud = solicitudBolsaRepository.findById(id).get();
solicitud.setEstado("APROBADO");
solicitud.setResponsableAprobacionId(userId);
solicitud.setFechaAprobacion(OffsetDateTime.now());
solicitudBolsaRepository.save(solicitud);
```

### 4. Soft Delete

```java
SolicitudBolsa solicitud = solicitudBolsaRepository.findById(id).get();
solicitud.setActivo(false); // No elimina, solo marca inactiva
solicitudBolsaRepository.save(solicitud);
```

---

## 📱 Frontend Mapping

### Ruta: `/bolsas/solicitudes`

**Componente:** `SolicitudBolsasPage.jsx`

```javascript
// Llama a API
const response = await solicitudBolsasService.buscar({
    page: 0,
    size: 30,
    estado: 'PENDIENTE',
    idIpress: 55
});

// Mapea a tabla
{
    solicitudes.map(sol => (
        <tr key={sol.idSolicitud}>
            <td>{sol.numeroSolicitud}</td>
            <td>{sol.pacienteNombre}</td>
            <td>{sol.codTipoBolsa}</td>
            <td>{sol.estado}</td>
            <td>{new Date(sol.fechaSolicitud).toLocaleDateString()}</td>
        </tr>
    ))
}
```

---

## 🔧 Entidades Java Mapadas

### 1. SolicitudBolsa (modelo/bolsas/)

```java
@Entity
@Table(name = "dim_solicitud_bolsa")
public class SolicitudBolsa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;
    // ... 31 campos más
}
```

### 2. DimBolsa (modelo/)

```java
@Entity
@Table(name = "dim_solicitud_bolsa")
public class DimBolsa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;
    // ... 31 campos más
}
```

**Nota:** Ambas entidades mapean a la misma tabla por cuestiones de legado y compatibilidad.

---

## 📊 Vistas Auxiliares (Views)

```sql
-- Vista: Solicitudes pendientes de aprobación
CREATE VIEW v_solicitudes_pendientes AS
SELECT id_solicitud, numero_solicitud, paciente_nombre,
       cod_tipo_bolsa, nombre_ipress, fecha_solicitud
FROM dim_solicitud_bolsa
WHERE estado = 'PENDIENTE' AND activo = true
ORDER BY fecha_solicitud DESC;

-- Vista: Solicitudes por IPRESS
CREATE VIEW v_solicitudes_por_ipress AS
SELECT id_ipress, nombre_ipress, estado, COUNT(*) as total
FROM dim_solicitud_bolsa
WHERE activo = true
GROUP BY id_ipress, nombre_ipress, estado;
```

---

## 🚀 Performance Tips

### ✅ Recomendado

```sql
-- ✅ Usar índices
SELECT * FROM dim_solicitud_bolsa
WHERE estado = 'PENDIENTE' AND id_ipress = 55;

-- ✅ Paginar resultados
SELECT * FROM dim_solicitud_bolsa
LIMIT 30 OFFSET 0;

-- ✅ Usar campos denormalizados
SELECT cod_tipo_bolsa, COUNT(*)
FROM dim_solicitud_bolsa
GROUP BY cod_tipo_bolsa;
```

### ❌ Evitar

```sql
-- ❌ FULL SCAN en tabla grande
SELECT * FROM dim_solicitud_bolsa;

-- ❌ JOIN con tablas sin índice
SELECT * FROM dim_solicitud_bolsa s
JOIN dim_asegurados a ON s.paciente_id = a.id_asegurado;

-- ❌ Funciones en WHERE clause
SELECT * FROM dim_solicitud_bolsa
WHERE UPPER(paciente_nombre) LIKE 'JUAN%';
```

---

## 📝 Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| v1.0.0 | 2026-01-01 | Creación inicial (16 columnas) |
| v1.5.0 | 2026-01-15 | Agregar estados de gestión de citas (20 columnas) |
| v1.6.0 | 2026-01-23 | Integración con Estados de Gestión (28 columnas) |
| v1.8.0 | 2026-01-26 | Excel completo (32+ columnas, auto-cálculos) |
| v1.9.0 | 2026-01-26 | **ACTUAL** - Verificación BD real: 43 columnas confirmadas ✅ |
| ↳ Cambio | ↳ Hoy | ↳ Agregar: `fecha_cita`, `fecha_atencion`, `recordatorio_enviado` al modelo Java |

---

## 🔒 Consideraciones de Seguridad

1. **Datos Sensibles:**
   - DNI, teléfono, email → Enmascarar en logs
   - Información médica → Acceso restringido

2. **Auditoría:**
   - Todos los cambios en `dim_solicitud_bolsa` se registran en `audit_log`
   - Campos `fecha_actualizacion` y `responsable_*` rastrean cambios

3. **Permisos:**
   - CREAR: `COORDINADOR_RED`, `ADMIN`
   - LEER: `COORDINADOR_RED`, `COORDINADOR_ESPECIALIDADES`
   - ACTUALIZAR: Solo aprobadores autorizados
   - ELIMINAR: Nunca - solo soft delete

---

## 📞 Contacto y Soporte

**Módulo:** Gestión de Solicitudes de Bolsa
**Tabla Principal:** `dim_solicitud_bolsa`
**Ruta Frontend:** `/bolsas/solicitudes`
**API Base:** `/api/solicitud-bolsa`
**Versión:** v1.8.0

Para consultas técnicas o problemas, consultar la sección de Troubleshooting en `spec/troubleshooting/`.

---

**FIN DE DOCUMENTACIÓN**
