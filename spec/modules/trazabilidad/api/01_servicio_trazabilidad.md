# API del Servicio TrazabilidadClinicaService

**Versión:** v1.81.0
**Última actualización:** 2026-02-11

---

## 📦 Ubicación

```
backend/src/main/java/com/styp/cenate/service/trazabilidad/TrazabilidadClinicaService.java
```

---

## 🎯 Descripción General

`TrazabilidadClinicaService` es el servicio centralizado que gestiona el registro de TODAS las atenciones médicas en la tabla `atencion_clinica`. Proporciona métodos especializados para diferentes orígenes de atención (MisPacientes, TeleECG, etc.).

---

## 🔧 Métodos Públicos

### 1. registrarAtencionEnHistorial()

**Firma:**
```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public AtencionClinica registrarAtencionEnHistorial(RegistroAtencionDTO request)
```

**Descripción:**
Método principal que registra una atención en el historial centralizado.

**Parámetros:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-----------|-------------|
| request | RegistroAtencionDTO | Sí | DTO con todos los datos de la atención |

**Retorna:**
- `AtencionClinica` - Entidad guardada en BD
- `null` - Si hay error (sin propagar excepción)

**Excepciones:**
- RuntimeException si asegurado no existe
- No propaga excepciones (log y retorna null)

**Ejemplo:**
```java
RegistroAtencionDTO registro = RegistroAtencionDTO.builder()
    .dniAsegurado("09950203")
    .origenModulo("MIS_PACIENTES")
    .idReferenciaOrigen(43484L)
    .fechaAtencion(OffsetDateTime.now())
    .idIpress(1L)
    .idEspecialidad(5L)
    .idMedico(390L)
    .motivoConsulta("Teleconsulta - Cardiolología")
    .diagnostico("Hipertensión controlada")
    .observacionesGenerales("Paciente responde bien al tratamiento")
    .build();

AtencionClinica atencion = trazabilidadService.registrarAtencionEnHistorial(registro);
// Log: ✅ [v1.81.0] Atención registrada en historial - ID: 12345
```

**Logs generados:**
```
📋 [v1.81.0] Registrando atención en historial - DNI: 09950203, Origen: MIS_PACIENTES
✅ [v1.81.0] Atención registrada en historial - ID: 12345, Asegurado: ASE-001
```

---

### 2. registrarDesdeMisPacientes()

**Firma:**
```java
public void registrarDesdeMisPacientes(Long idSolicitud, String observaciones, Long idMedico)
```

**Descripción:**
Registra una atención originada desde el módulo MisPacientes. Extrae datos de `SolicitudBolsa` y registra en `atencion_clinica`.

**Parámetros:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-----------|-------------|
| idSolicitud | Long | Sí | ID de SolicitudBolsa |
| observaciones | String | No | Observaciones médicas adicionales |
| idMedico | Long | Sí | ID del médico (PersonalCnt.idPers) |

**Retorna:**
- void (no retorna nada)

**Excepciones:**
- No propaga excepciones (logging y manejo gracioso)

**Ejemplo:**
```java
// En GestionPacienteServiceImpl.actualizarCondicion()
trazabilidadService.registrarDesdeMisPacientes(
    idSolicitud,        // 43484
    observacionesMedicas,  // "Paciente estable, continuar medicación"
    idMedicoActual      // 390
);
```

**Logs generados:**
```
🔍 [v1.81.0] Registrando atención desde MisPacientes - Solicitud: 43484
✅ [v1.81.0] Atención registrada en historial - ID: 12345, Asegurado: ASE-001, Origen: MIS_PACIENTES
```

**Datos extraídos de SolicitudBolsa:**
```java
- dniAsegurado = solicitud.getPacienteDni()
- idIpress = solicitud.getIdIpress()
- motivoConsulta = "Atención programada desde Mis Pacientes - " + solicitud.getTipoCita()
- diagnostico = solicitud.getCondicionMedica()
- observacionesGenerales = observaciones ?: solicitud.getObservacionesMedicas()
- origenModulo = "MIS_PACIENTES"
- idReferenciaOrigen = idSolicitud
```

---

### 3. registrarDesdeTeleECG()

**Firma:**
```java
public void registrarDesdeTeleECG(String dniPaciente, Long idMedico)
```

**Descripción:**
Registra una atención originada desde TeleECG IPRESS. Busca ECGs pendientes, los marca como ATENDIDA, y registra en `atencion_clinica`.

**Parámetros:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-----------|-------------|
| dniPaciente | String | Sí | DNI del paciente (puede tener ceros iniciales) |
| idMedico | Long | Sí | ID del médico/cardiólogo evaluador |

**Retorna:**
- void (no retorna nada)

**Excepciones:**
- No propaga excepciones (logging de advertencia)

**Ejemplo:**
```java
// En GestionPacienteServiceImpl.actualizarCondicion()
trazabilidadService.registrarDesdeTeleECG(
    pacienteDni,    // "09950203" o "9950203"
    idMedicoActual  // 390
);
```

**Logs generados:**
```
🔍 [v1.81.0] Registrando y sincronizando TeleECG - DNI: 09950203
📋 [v1.81.0] DNI original: 09950203, normalizado: 9950203
📊 [v1.81.0] Encontrados 2 ECGs para DNI 09950203/9950203
✅ [v1.81.0] ECG 16 actualizado: ENVIADA → ATENDIDA
✅ [v1.81.0] Atención registrada en historial - ID: 12346, Asegurado: ASE-001, Origen: TELEECG_IPRESS
📊 [v1.81.0] Total ECGs actualizados y registrados: 1/2
```

**Funcionamiento Detallado:**

1. **Normalización DNI**
   ```java
   String dniNormalizado = dniPaciente.replaceAll("^0+(?!$)", "");
   ```

2. **Búsqueda de ECGs**
   ```java
   List<TeleECGImagen> ecgs = teleECGImagenRepository
       .findByNumDocPacienteOrderByFechaEnvioDesc(dniPaciente);
   ```

3. **Para cada ECG en estado ENVIADA**
   ```java
   if ("ENVIADA".equalsIgnoreCase(ecg.getEstado())) {
       // 1. Actualizar estado
       ecg.setEstado("ATENDIDA");
       ecg.setFechaEvaluacion(LocalDateTime.now());
       teleECGImagenRepository.save(ecg);

       // 2. Registrar en historial
       registrarAtencionEnHistorial(RegistroAtencionDTO.builder()
           .dniAsegurado(ecg.getNumDocPaciente())
           .origenModulo("TELEECG_IPRESS")
           .idReferenciaOrigen(ecg.getIdImagen())
           .fechaAtencion(OffsetDateTime.now())
           .idIpress(ecg.getIpressOrigen().getIdIpress())
           .idMedico(idMedico)
           .motivoConsulta("Evaluación de electrocardiograma")
           .diagnostico(ecg.getDescripcionEvaluacion())
           .tratamiento(ecg.getNotaClinicaPlanSeguimiento())
           .observacionesGenerales(construirObservacionesECG(ecg))
           .build()
       );
   }
   ```

**Datos extraídos de TeleECGImagen:**
```java
- dniAsegurado = ecg.getNumDocPaciente()
- idIpress = ecg.getIpressOrigen().getIdIpress()
- motivoConsulta = "Evaluación de electrocardiograma"
- diagnostico = ecg.getDescripcionEvaluacion()
- tratamiento = ecg.getNotaClinicaPlanSeguimiento()
- observacionesGenerales = "ID Imagen: 16, Evaluación: ANORMAL, Hallazgos: {...}"
- origenModulo = "TELEECG_IPRESS"
- idReferenciaOrigen = ecg.getIdImagen()
```

---

## 🔧 Métodos Privados (Helpers)

### construirObservacionesConOrigen()

```java
private String construirObservacionesConOrigen(RegistroAtencionDTO request)
```

Construye el campo `observaciones_generales` incluyendo el origen del registro.

**Output:**
```
Origen: MIS_PACIENTES
ID Referencia: 43484

Observaciones originales del médico...
```

---

### construirObservacionesECG()

```java
private String construirObservacionesECG(TeleECGImagen ecg)
```

Construye observaciones consolidadas desde datos del ECG.

**Output:**
```
Evaluación ECG
ID Imagen: 16
Evaluación: ANORMAL
Hallazgos: {"ritmo": true, "frecuencia": true}
Observaciones: Taquicardia sinusal, cambios isquémicos
```

---

### determinarTipoAtencion()

```java
private Long determinarTipoAtencion(String origenModulo)
```

Mapea el módulo de origen a `id_tipo_atencion` en la BD.

| Origen | ID Tipo | Descripción |
|--------|---------|-------------|
| MIS_PACIENTES | 1 | Teleconsulta |
| TELEECG_IPRESS | 2 | Teleasistencia (Lectura ECG) |
| GESTION_CITAS | 1 | Teleconsulta |
| Otros | null | No determinado |

---

### mapearSignosVitales()

```java
private void mapearSignosVitales(AtencionClinica atencion, SignosVitalesDTO signos)
```

Mapea datos de signos vitales desde DTO a entidad JPA.

**Campos mapeados:**
- presionArterial
- temperatura
- pesoKg
- frecuenciaCardiaca
- saturacionO2

---

## 📊 Inyección de Dependencias

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class TrazabilidadClinicaService {

    private final AtencionClinicaRepository atencionClinicaRepository;
    private final AseguradoRepository aseguradoRepository;
    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final TeleECGImagenRepository teleECGImagenRepository;
}
```

---

## 🔄 Transacciones

Todos los métodos públicos ejecutan en transacción independiente:

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
```

**Implicaciones:**
- Nueva transacción para cada llamada
- No afecta rollback de transacción padre
- Si falla: ROLLBACK local, TX padre continúa
- Idempotencia: Si falla la mitad, estado parcial (ver mitigación)

---

## ⚠️ Consideraciones Especiales

### 1. ID Médico Nulo
Si no se puede obtener el ID del médico actual:
- Se pasa null a `registrarAtencionEnHistorial()`
- Campo `id_personal_creador` en BD es nullable
- Log de advertencia: `⚠️ [v1.81.0] No se pudo obtener ID del médico`

### 2. ECGs No Encontrados
Si se llama `registrarDesdeTeleECG()` pero no hay ECGs:
- Log de advertencia: `⚠️ [v1.81.0] No se encontraron ECGs para sincronizar`
- No hay INSERT en `atencion_clinica`
- Ejecución continúa sin error

### 3. Asegurado No Existe
Si el DNI no existe en tabla `asegurados`:
- Log de error: `❌ [v1.81.0] Error registrando atención en historial para DNI: XXX`
- No hay INSERT (RuntimeException capturada)
- Retorna null

### 4. Normalización DNI
```java
// "09950203" → "9950203"
// "00123456" → "123456"
// "123456" → "123456" (sin cambios)
```

---

## 🧪 Ejemplos de Uso Completo

### Caso 1: Registrar desde MisPacientes

```java
// En GestionPacienteServiceImpl
if ("Atendido".equalsIgnoreCase(condicion)) {
    Long idMedicoActual = obtenerIdMedicoActual();  // 390

    trazabilidadClinicaService.registrarDesdeMisPacientes(
        id,                          // 43484
        "Paciente estable",         // observaciones
        idMedicoActual              // 390
    );
}
```

**Resultado esperado:**
- INSERT en atencion_clinica
- Logs con [v1.81.0]
- created_at = ahora (Perú UTC-5)

---

### Caso 2: Sincronizar desde TeleECG

```java
// En GestionPacienteServiceImpl después de caso 1
String pacienteDni = existing.getPacienteDni();  // "09950203"
if (pacienteDni != null) {
    trazabilidadClinicaService.registrarDesdeTeleECG(
        pacienteDni,    // "09950203"
        idMedicoActual  // 390
    );
}
```

**Resultado esperado:**
- UPDATE tele_ecg_imagenes SET estado='ATENDIDA' WHERE estado='ENVIADA'
- INSERT en atencion_clinica para cada ECG actualizado
- Logs detallados de sincronización

---

## 📚 Referencias

- DTOs: [`02_dtos.md`](02_dtos.md)
- Tabla: `spec/database/atencion_clinica.md`
- Integración: [`../implementacion/02_integracion_mispacientes.md`](../implementacion/02_integracion_mispacientes.md)
- Ejemplos: [`../ejemplos/01_registro_mispacientes.md`](../ejemplos/01_registro_mispacientes.md)
