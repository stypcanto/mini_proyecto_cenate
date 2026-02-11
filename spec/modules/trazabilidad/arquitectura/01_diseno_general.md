# Diseño General - Trazabilidad Clínica Universal

**Versión:** v1.81.0
**Última actualización:** 2026-02-11

---

## 🎯 Visión General

El módulo de Trazabilidad Clínica Universal proporciona un sistema centralizado para registrar automáticamente TODAS las atenciones médicas realizadas a un asegurado, independientemente del módulo desde el cual se realice.

---

## 🔄 Flujos Principales

### Flujo 1: Atención desde MisPacientes

```
Médico marca paciente como "Atendido"
       ↓
GestionPacienteServiceImpl.actualizarCondicion()
       ↓
Marca condición = "Atendido" en dim_solicitud_bolsa
       ↓
Llamada a TrazabilidadClinicaService.registrarDesdeMisPacientes()
       ↓
INSERT en atencion_clinica con:
  - DNI del asegurado
  - Origen: "MIS_PACIENTES"
  - Referencia ID: idSolicitud
  - Datos clínicos (diagnóstico, observaciones)
  - Timestamp: ahora (Perú UTC-5)
       ↓
Médico ve confirmación en logs [v1.81.0]
```

### Flujo 2: Evaluación ECG desde TeleECG IPRESS

```
Cardiólogo evalúa ECG en IPRESS Workspace
       ↓
GestionPacienteServiceImpl.actualizarCondicion() con "Atendido"
       ↓
Llamada a TrazabilidadClinicaService.registrarDesdeTeleECG()
       ↓
Busca ECGs ENVIADA para el DNI del paciente
       ↓
Para cada ECG:
  1. Actualiza estado: ENVIADA → ATENDIDA
  2. Registra fecha_evaluacion = ahora
  3. INSERT en atencion_clinica con:
     - Origen: "TELEECG_IPRESS"
     - Diagnóstico: descripcionEvaluacion del ECG
     - Observaciones: construidas de hallazgos + plan
       ↓
IPRESS Workspace muestra estado = "Atendida" (verde)
```

### Flujo 3: Atención desde GestionAsegurado (futuro)

```
Coordinador asigna médico a paciente
       ↓
AtenderPacienteService.atenderPaciente()
       ↓
Marca solicitud como "Atendido"
       ↓
Llamada a TrazabilidadClinicaService.registrarDesdeMisPacientes()
       ↓
INSERT en atencion_clinica
       ↓
Historial se actualiza automáticamente
```

---

## 🏛️ Arquitectura en Capas

```
┌─────────────────────────────────────┐
│      CAPA PRESENTACIÓN (Controllers) │
│   - GestionPacienteController       │
│   - MedicoController                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      CAPA DE SERVICIOS (Services)   │
│   - GestionPacienteServiceImpl ──┐   │
│   - AtenderPacienteService ─────┼─┐ │
│   - [...]                       │ │ │
│                                 │ │ │
│   ↓ Inyección de Dependencias ←─┘ │ │
│                                   │ │
│   TrazabilidadClinicaService ←────┘ │
│     └─ Servicio Centralizado      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     CAPA DE REPOSITORIOS (Data)     │
│   - AtencionClinicaRepository       │
│   - SolicitudBolsaRepository        │
│   - TeleECGImagenRepository         │
│   - AseguradoRepository             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     CAPA DE BASE DE DATOS           │
│   - atencion_clinica (nueva entrada)│
│   - dim_solicitud_bolsa             │
│   - tele_ecg_imagenes               │
│   - asegurados                      │
└─────────────────────────────────────┘
```

---

## 🔌 Puntos de Integración

### Integración 1: GestionPacienteServiceImpl

**Archivo:** `backend/src/main/java/com/styp/cenate/service/gestionpaciente/GestionPacienteServiceImpl.java`

**Método de integración:** `actualizarCondicion(Long id, String condicion, String observaciones)`

**Punto de inyección:**
```java
@RequiredArgsConstructor
public class GestionPacienteServiceImpl implements IGestionPacienteService {

    private final TrazabilidadClinicaService trazabilidadClinicaService;  // ✅ v1.81.0

    // ...
}
```

**Trigger:**
```java
if ("Atendido".equalsIgnoreCase(condicion)) {
    Long idMedicoActual = obtenerIdMedicoActual();

    // 1. Registrar atención desde MisPacientes
    trazabilidadClinicaService.registrarDesdeMisPacientes(
        id,
        observacionesLimpias,
        idMedicoActual
    );

    // 2. Sincronizar TeleECG
    if (pacienteDni != null) {
        trazabilidadClinicaService.registrarDesdeTeleECG(
            pacienteDni,
            idMedicoActual
        );
    }
}
```

### Integración 2: AtenderPacienteService

**Archivo:** `backend/src/main/java/com/styp/cenate/service/gestionpaciente/AtenderPacienteService.java`

**Método de integración:** `atenderPaciente(Long idSolicitudBolsa, String especialidad, AtenderPacienteRequest request)`

**Trigger:**
```java
// Después de marcar solicitud como "Atendido"
trazabilidadClinicaService.registrarDesdeMisPacientes(
    idSolicitudBolsa,
    null,  // No hay observaciones en request
    idMedicoActual
);
```

---

## 📊 Modelo de Datos

### Tabla Principal: atencion_clinica

```sql
CREATE TABLE atencion_clinica (
    id_atencion BIGINT PRIMARY KEY AUTO_INCREMENT,

    -- Identificación del asegurado
    pk_asegurado VARCHAR(50) NOT NULL,
    FOREIGN KEY (pk_asegurado) REFERENCES asegurados(pk_asegurado),

    -- Datos de atención
    fecha_atencion TIMESTAMP WITH TIME ZONE NOT NULL,
    id_ipress BIGINT NOT NULL,
    id_especialidad BIGINT,
    id_servicio BIGINT,

    -- Datos clínicos
    motivo_consulta TEXT,
    antecedentes TEXT,
    diagnostico TEXT,
    cie10_codigo VARCHAR(20),
    tratamiento TEXT,
    observaciones_generales TEXT,

    -- Signos vitales
    presion_arterial VARCHAR(20),
    temperatura NUMERIC(4,1),
    peso_kg NUMERIC(5,2),
    saturacion_o2 INTEGER,
    frecuencia_cardiaca INTEGER,

    -- Auditoría
    id_personal_creador BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Índices para búsquedas
    INDEX idx_atencion_asegurado (pk_asegurado),
    INDEX idx_atencion_fecha (fecha_atencion),
    INDEX idx_atencion_ipress (id_ipress)
);
```

---

## 🔄 Transacciones y Concurrencia

### Propagación de Transacciones

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public AtencionClinica registrarAtencionEnHistorial(RegistroAtencionDTO request) {
    // Nueva transacción independiente
}
```

**¿Por qué REQUIRES_NEW?**

1. ✅ No afecta rollback de transacción principal
2. ✅ Si falla, no pierde cambios en dim_solicitud_bolsa
3. ✅ Garantiza persistencia de historial
4. ✅ Manejo gracioso de excepciones

### Diagrama de Transacciones

```
┌─ TX Principal: GestionPacienteServiceImpl.actualizarCondicion()
│  ├─ UPDATE dim_solicitud_bolsa SET condicion = 'Atendido'  ✅
│  ├─ COMMIT
│  │
│  └─ TX Independiente: TrazabilidadClinicaService (REQUIRES_NEW)
│     ├─ INSERT INTO atencion_clinica
│     ├─ COMMIT (éxito)
│     └─ Si falla: ROLLBACK (no afecta TX principal)
│
└─ Respuesta al usuario: Éxito (datos guardados en bolsa)
```

---

## 🔍 Normalización DNI

### Problema
ECGs pueden venir con DNI con ceros iniciales: `"09950203"`
Búsquedas a veces usan DNI normalizado: `"9950203"`

### Solución
```java
// En TrazabilidadClinicaService.registrarDesdeTeleECG()
String dniNormalizado = dniPaciente.replaceAll("^0+(?!$)", "");

// Buscar con DNI original
List<TeleECGImagen> ecgs = teleECGImagenRepository
    .findByNumDocPacienteOrderByFechaEnvioDesc(dniPaciente);

// Si no encuentra, buscar con DNI normalizado
if (ecgs.isEmpty() && !dniPaciente.equals(dniNormalizado)) {
    ecgs = teleECGImagenRepository
        .findByNumDocPacienteOrderByFechaEnvioDesc(dniNormalizado);
}
```

---

## 📝 Logging y Auditoría

### Formato de Logs

Todos los logs del módulo incluyen `[v1.81.0]` para identificación:

```
📋 [v1.81.0] Registrando atención en historial - DNI: 09950203, Origen: MIS_PACIENTES
✅ [v1.81.0] Atención registrada en historial - ID: 123, Asegurado: ASE-001, Origen: MIS_PACIENTES
🔍 [v1.81.0] Registrando atención desde MisPacientes - Solicitud: 43484
🔄 [v1.81.0] Reintentando con DNI normalizado: 9950203
✅ [v1.81.0] ECG 16 actualizado: ENVIADA → ATENDIDA
```

### Niveles de Log

```java
log.info()     // Eventos importantes (registro exitoso, sincronización)
log.debug()    // Detalles técnicos (búsquedas, conversiones)
log.warn()     // Situaciones inusuales (ECGs no encontrados, usuario no identificado)
log.error()    // Errores que requieren atención (excepciones no esperadas)
```

---

## 🔐 Validaciones

### Validaciones Realizadas

1. **DNI del Asegurado**
   - Validar que existe en tabla `asegurados`
   - Si no existe: throw RuntimeException

2. **ID Médico**
   - Obtenido del contexto de seguridad
   - Puede ser null (manejo gracioso)

3. **IPRESS**
   - Obtenido de solicitud o ECG
   - Puede ser null (marca como sin IPRESS origen)

4. **Timestamps**
   - Zona horaria Perú (UTC-5) automáticamente convertida
   - Fallback a OffsetDateTime.now() si no viene

---

## 📈 Escalabilidad

### Preparado para

✅ **Múltiples módulos** - Fácil agregar nuevos orígenes
✅ **Alta concurrencia** - Transacciones independientes
✅ **Grandes volúmenes** - Índices en tablas críticas
✅ **Microservicios** - Patrón de servicio desacoplado

### Limitaciones Conocidas

- Búsqueda ECG es O(n) sin índice en num_doc_paciente (mitigar con índice)
- Normalización DNI manual (considerar campo denormalizado)
- No hay paginación en registrarDesdeTeleECG (máximo ~50 ECGs por paciente típicamente)

---

## 🚀 Roadmap de Mejoras

### v1.82.0
- [ ] Integración Gestión de Citas
- [ ] Event-driven con mensaje de atención registrada
- [ ] Cache de búsquedas de asegurados

### v1.83.0
- [ ] Soporte para múltiples diagnósticos CIE-10
- [ ] Attachment de documentos clínicos
- [ ] Workflow de aprobación de atenciones

### v2.0.0
- [ ] Event Sourcing para auditoría completa
- [ ] CQRS para reportes de alto volumen
- [ ] Replicación a data warehouse para analytics
- [ ] Soporte para HL7 FHIR

---

## 📚 Referencias

- Tabla `atencion_clinica`: [`spec/database/`](../../../database/)
- Modelo de datos completo: [`02_modelo_datos.md`](02_modelo_datos.md)
- DTOs: [`api/02_dtos.md`](../api/02_dtos.md)
- Implementación: [`implementacion/01_guia_implementacion.md`](../implementacion/01_guia_implementacion.md)
