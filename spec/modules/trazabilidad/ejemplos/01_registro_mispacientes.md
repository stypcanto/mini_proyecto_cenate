# Ejemplo: Registrar Atención desde MisPacientes

**Versión:** v1.81.0
**Última actualización:** 2026-02-11

---

## 🎯 Escenario

Un médico cardiólogo marca un paciente como "Atendido" en el módulo MisPacientes. El sistema automáticamente registra esta atención en el historial centralizado.

---

## 📋 Datos del Paciente

| Campo | Valor |
|-------|-------|
| DNI | 09950203 |
| Nombre | VERASTEGUI JORGE VICTOR |
| Edad | 65 años |
| Sexo | Masculino |
| IPRESS | HOSPITAL NACIONAL GUILLERMO ALMENARA (ID: 6) |
| Especialidad | Cardiología |

---

## 📋 Datos del Médico

| Campo | Valor |
|-------|-------|
| DNI | 42906777 |
| Nombre | Dr. Carlos Alberto Rivas López |
| Especialidad | Cardiología |
| ID Personal (PersonalCnt) | 390 |
| Usuario | carito |

---

## 🔄 Flujo Paso a Paso

### Paso 1: Médico Inicia Sesión

```
URL: http://localhost:3000/roles/medico/pacientes
Usuario: carito
Contraseña: Carito123
```

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Ve lista de sus pacientes asignados
- ✅ Paciente VERASTEGUI JORGE VICTOR visible

---

### Paso 2: Médico Busca y Selecciona Paciente

```
1. Click en tabla de pacientes
2. Buscar DNI: 09950203
3. Select paciente VERASTEGUI JORGE VICTOR
```

**Resultado esperado:**
- ✅ Paciente seleccionado (fila resaltada)
- ✅ Datos visibles: DNI, nombre, edad, condición actual

---

### Paso 3: Médico Marca como "Atendido"

```
1. Click en botón estetoscopio (icono de atención)
2. Modal se abre con opciones
3. Select condición: "Atendido"
4. Ingresar observaciones (opcional):
   "Paciente presentó palpitaciones leves.
    Evaluación ECG normal.
    Presión arterial controlada (130/85).
    Continuar medicación actual.
    Cita de seguimiento en 1 mes."
5. Click botón "Guardar"
```

---

## 🔐 Procesamiento Interno

### Fase 1: GestionPacienteServiceImpl.actualizarCondicion()

**Código que se ejecuta:**
```java
@Override
@Transactional
public GestionPacienteDTO actualizarCondicion(Long id, String condicion, String observaciones) {
    log.info("🔄 [v1.81.0] Actualizando condición - ID: {}, Condición: {}", id, condicion);

    // Buscar solicitud
    SolicitudBolsa existing = solicitudBolsaRepository.findById(id).orElseThrow();

    // Actualizar condición
    existing.setCondicionMedica(condicion);
    existing.setObservacionesMedicas(observaciones);
    existing.setFechaAtencionMedica(OffsetDateTime.now());  // Perú UTC-5

    SolicitudBolsa updated = solicitudBolsaRepository.save(existing);
    log.info("✅ Condición actualizada en tabla dim_solicitud_bolsa: {}", id);

    // ✅ v1.81.0: Registrar atención en historial centralizado
    if ("Atendido".equalsIgnoreCase(condicion)) {
        try {
            Long idMedicoActual = obtenerIdMedicoActual();  // 390

            // 1. Registrar atención desde MisPacientes
            trazabilidadClinicaService.registrarDesdeMisPacientes(
                id,                    // 43484
                observaciones,         // "Paciente presentó palpitaciones..."
                idMedicoActual         // 390
            );

            // 2. Sincronizar y registrar ECG si existe
            String pacienteDni = existing.getPacienteDni();
            if (pacienteDni != null && !pacienteDni.isEmpty()) {
                trazabilidadClinicaService.registrarDesdeTeleECG(pacienteDni, idMedicoActual);
            }

            log.info("✅ [v1.81.0] Atención registrada en historial centralizado");
        } catch (Exception e) {
            log.warn("⚠️ [v1.81.0] Error en trazabilidad: {}", e.getMessage());
        }
    }

    return bolsaToGestionDTO(updated);
}
```

### Fase 2: TrazabilidadClinicaService.registrarDesdeMisPacientes()

**Código que se ejecuta:**
```java
public void registrarDesdeMisPacientes(Long idSolicitud, String observaciones, Long idMedico) {
    log.info("🔍 [v1.81.0] Registrando atención desde MisPacientes - Solicitud: {}", idSolicitud);

    try {
        // 1. Obtener solicitud
        SolicitudBolsa solicitud = solicitudBolsaRepository.findById(idSolicitud).orElseThrow();

        // 2. Construir DTO
        RegistroAtencionDTO registro = RegistroAtencionDTO.builder()
                .dniAsegurado("09950203")
                .origenModulo("MIS_PACIENTES")
                .idReferenciaOrigen(43484L)
                .fechaAtencion(OffsetDateTime.now())  // 2026-02-11 16:45:30-05:00
                .idIpress(6L)
                .idMedico(390L)
                .motivoConsulta("Atención programada desde Mis Pacientes - MODULO_107")
                .diagnostico("Atendido")
                .observacionesGenerales("Paciente presentó palpitaciones leves...")
                .build();

        // 3. Registrar en historial
        registrarAtencionEnHistorial(registro);
    } catch (Exception e) {
        log.error("❌ [v1.81.0] Error registrando desde MisPacientes", e);
    }
}
```

### Fase 3: TrazabilidadClinicaService.registrarAtencionEnHistorial()

**Código que se ejecuta:**
```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public AtencionClinica registrarAtencionEnHistorial(RegistroAtencionDTO request) {
    log.info("📋 [v1.81.0] Registrando atención en historial - DNI: {}, Origen: {}",
             "09950203", "MIS_PACIENTES");

    try {
        // 1. Obtener asegurado
        Asegurado asegurado = aseguradoRepository.findByDocPaciente("09950203")
                .orElseThrow();  // ASE-001

        // 2. Construir entidad
        AtencionClinica atencion = AtencionClinica.builder()
                .pkAsegurado("ASE-001")
                .fechaAtencion(OffsetDateTime.now())  // 2026-02-11 16:45:30-05:00
                .idIpress(6L)
                .idPersonalCreador(390L)
                .motivoConsulta("Atención programada desde Mis Pacientes - MODULO_107")
                .diagnostico("Atendido")
                .observacionesGenerales(
                    "Origen: MIS_PACIENTES\n" +
                    "ID Referencia: 43484\n\n" +
                    "Paciente presentó palpitaciones leves..."
                )
                .idTipoAtencion(1L)  // Teleconsulta
                .build();

        // 3. Guardar en BD
        AtencionClinica saved = atencionClinicaRepository.save(atencion);
        // INSERT INTO atencion_clinica VALUES (NULL, 'ASE-001', NOW(), 6, NULL, NULL, ...)
        // id_atencion = 12345 (auto-generado)

        log.info("✅ [v1.81.0] Atención registrada en historial - ID: {}, Asegurado: {}, Origen: {}",
                 12345, "ASE-001", "MIS_PACIENTES");

        return saved;
    } catch (Exception e) {
        log.error("❌ [v1.81.0] Error registrando atención en historial para DNI: {}",
                  "09950203", e);
        return null;
    }
}
```

### Fase 4: TrazabilidadClinicaService.registrarDesdeTeleECG()

**Código que se ejecuta:**
```java
public void registrarDesdeTeleECG(String dniPaciente, Long idMedico) {
    log.info("🔍 [v1.81.0] Registrando y sincronizando TeleECG - DNI: {}", "09950203");

    try {
        // 1. Normalizar DNI
        String dniNormalizado = "09950203".replaceAll("^0+(?!$)", "");  // "9950203"
        log.debug("📋 [v1.81.0] DNI original: {}, normalizado: {}", "09950203", "9950203");

        // 2. Buscar ECGs
        List<TeleECGImagen> ecgs = teleECGImagenRepository
                .findByNumDocPacienteOrderByFechaEnvioDesc("09950203");
        // Resultado: 2 ECGs encontrados (IDs: 16, 15)

        log.info("📊 [v1.81.0] Encontrados {} ECGs para DNI {}/{}",
                 2, "09950203", "9950203");

        // 3. Procesar ECGs
        int actualizados = 0;
        for (TeleECGImagen ecg : ecgs) {  // ecg.id_imagen = 16
            if ("ENVIADA".equalsIgnoreCase(ecg.getEstado())) {
                // 3a. Actualizar estado
                ecg.setEstado("ATENDIDA");
                ecg.setFechaEvaluacion(LocalDateTime.now());  // 2026-02-11 16:45:30
                teleECGImagenRepository.save(ecg);
                // UPDATE tele_ecg_imagenes SET estado='ATENDIDA', fecha_evaluacion=NOW()
                // WHERE id_imagen = 16
                actualizados++;

                log.info("✅ [v1.81.0] ECG {} actualizado: ENVIADA → ATENDIDA", 16);

                // 3b. Registrar en historial
                RegistroAtencionDTO registro = RegistroAtencionDTO.builder()
                        .dniAsegurado("09950203")
                        .origenModulo("TELEECG_IPRESS")
                        .idReferenciaOrigen(16L)
                        .fechaAtencion(OffsetDateTime.now())
                        .idIpress(6L)
                        .idMedico(390L)
                        .motivoConsulta("Evaluación de electrocardiograma")
                        .diagnostico("ANORMAL - Arritmia cardíaca")
                        .tratamiento(ecg.getNotaClinicaPlanSeguimiento())
                        .observacionesGenerales(
                            "Evaluación ECG\n" +
                            "ID Imagen: 16\n" +
                            "Evaluación: ANORMAL\n" +
                            "Hallazgos: Ritmo irregular, taquicardia\n" +
                            "Plan: Derivación a cardiólogo..."
                        )
                        .build();

                registrarAtencionEnHistorial(registro);
                // INSERT INTO atencion_clinica VALUES (NULL, 'ASE-001', NOW(), 6, ...)
                // id_atencion = 12346
            }
        }

        log.info("📊 [v1.81.0] Total ECGs actualizados y registrados: {}/{}", 1, 2);
    } catch (Exception e) {
        log.error("❌ [v1.81.0] Error en sincronización TeleECG", e);
    }
}
```

---

## 📊 Cambios en Base de Datos

### Actualización en dim_solicitud_bolsa

```sql
-- ANTES
SELECT id_solicitud, paciente_dni, condicion_medica, observaciones_medicas,
       fecha_atencion_medica
FROM dim_solicitud_bolsa
WHERE id_solicitud = 43484;

-- Resultado:
-- 43484 | 09950203 | Pendiente | NULL | NULL

-- DESPUÉS (UPDATE realizado)
-- 43484 | 09950203 | Atendido | "Paciente presentó palpitaciones..." | 2026-02-11 16:45:30-05:00
```

### Nuevo Registro en atencion_clinica

```sql
-- DESPUÉS (INSERT realizado)
INSERT INTO atencion_clinica (
    pk_asegurado, fecha_atencion, id_ipress, id_especialidad, id_servicio,
    motivo_consulta, diagnostico, observaciones_generales, id_personal_creador,
    id_tipo_atencion, created_at
) VALUES (
    'ASE-001',
    '2026-02-11 16:45:30-05:00',
    6,
    NULL,
    NULL,
    'Atención programada desde Mis Pacientes - MODULO_107',
    'Atendido',
    'Origen: MIS_PACIENTES\nID Referencia: 43484\n\nPaciente presentó palpitaciones...',
    390,
    1,
    NOW()
);

-- id_atencion = 12345 (auto-generado)
```

### Actualización en tele_ecg_imagenes

```sql
-- ANTES
SELECT id_imagen, num_doc_paciente, estado, evaluacion, fecha_evaluacion
FROM tele_ecg_imagenes
WHERE num_doc_paciente = '09950203'
ORDER BY fecha_envio DESC;

-- Resultado (2 registros):
-- 16 | 09950203 | ENVIADA | ANORMAL | NULL
-- 15 | 09950203 | ATENDIDA | NORMAL | 2026-02-10 14:30:00

-- DESPUÉS (UPDATE realizado)
-- 16 | 09950203 | ATENDIDA | ANORMAL | 2026-02-11 16:45:30
-- 15 | 09950203 | ATENDIDA | NORMAL | 2026-02-10 14:30:00
```

### Nuevo Registro en atencion_clinica (ECG)

```sql
-- DESPUÉS (INSERT adicional por ECG)
INSERT INTO atencion_clinica (
    pk_asegurado, fecha_atencion, id_ipress, diagnostico,
    motivoConsulta, observaciones_generales, id_personal_creador,
    id_tipo_atencion, created_at
) VALUES (
    'ASE-001',
    '2026-02-11 16:45:30-05:00',
    6,
    'ANORMAL - Arritmia cardíaca',
    'Evaluación de electrocardiograma',
    'Evaluación ECG\nID Imagen: 16\nHallazgos: Ritmo irregular...',
    390,
    2,
    NOW()
);

-- id_atencion = 12346 (auto-generado)
```

---

## 📝 Logs Esperados

En `application.log` se verán los siguientes logs:

```
2026-02-11 16:45:30 INFO  [GestionPacienteServiceImpl] 🔄 [v1.81.0] Actualizando condición - ID: 43484, Condición: Atendido
2026-02-11 16:45:30 INFO  [GestionPacienteServiceImpl] ✅ Condición actualizada en tabla dim_solicitud_bolsa: 43484
2026-02-11 16:45:30 INFO  [TrazabilidadClinicaService] 🔍 [v1.81.0] Registrando atención desde MisPacientes - Solicitud: 43484
2026-02-11 16:45:30 INFO  [TrazabilidadClinicaService] 📋 [v1.81.0] Registrando atención en historial - DNI: 09950203, Origen: MIS_PACIENTES
2026-02-11 16:45:30 INFO  [TrazabilidadClinicaService] ✅ [v1.81.0] Atención registrada en historial - ID: 12345, Asegurado: ASE-001, Origen: MIS_PACIENTES
2026-02-11 16:45:30 INFO  [TrazabilidadClinicaService] 🔍 [v1.81.0] Registrando y sincronizando TeleECG - DNI: 09950203
2026-02-11 16:45:30 DEBUG [TrazabilidadClinicaService] 📋 [v1.81.0] DNI original: 09950203, normalizado: 9950203
2026-02-11 16:45:30 INFO  [TrazabilidadClinicaService] 📊 [v1.81.0] Encontrados 2 ECGs para DNI 09950203/9950203
2026-02-11 16:45:30 INFO  [TrazabilidadClinicaService] ✅ [v1.81.0] ECG 16 actualizado: ENVIADA → ATENDIDA
2026-02-11 16:45:31 INFO  [TrazabilidadClinicaService] 📋 [v1.81.0] Registrando atención en historial - DNI: 09950203, Origen: TELEECG_IPRESS
2026-02-11 16:45:31 INFO  [TrazabilidadClinicaService] ✅ [v1.81.0] Atención registrada en historial - ID: 12346, Asegurado: ASE-001, Origen: TELEECG_IPRESS
2026-02-11 16:45:31 INFO  [TrazabilidadClinicaService] 📊 [v1.81.0] Total ECGs actualizados y registrados: 1/2
2026-02-11 16:45:31 INFO  [GestionPacienteServiceImpl] ✅ [v1.81.0] Atención registrada en historial centralizado
```

---

## ✅ Verificación de Éxito

### 1. Frontend: Modal de Confirmación

```
✅ Atención registrada exitosamente
El paciente VERASTEGUI JORGE VICTOR ha sido marcado como "Atendido"
```

### 2. Backend: Logs con [v1.81.0]

Ver logs mostrados arriba (todos presentes = éxito)

### 3. Base de Datos: Queries de Verificación

Ver documento: [`03_queries_bd.md`](03_queries_bd.md)

---

## 🚨 Posibles Errores y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| ❌ "Asegurado no encontrado" | DNI no existe en tabla `asegurados` | Cargar datos de asegurado primero |
| ⚠️ "No se encontraron ECGs" | No hay ECGs con estado ENVIADA | Normal si no hay ECG pendiente |
| ❌ Timeout en UPDATE | Índices no optimizados | Crear índice en `num_doc_paciente` |
| ⚠️ Observaciones truncadas | Campo muy largo | Máximo 2000 caracteres en `observaciones_generales` |

---

## 📚 Referencias

- API: [`../api/01_servicio_trazabilidad.md`](../api/01_servicio_trazabilidad.md)
- Queries de verificación: [`03_queries_bd.md`](03_queries_bd.md)
- Implementación: [`../implementacion/02_integracion_mispacientes.md`](../implementacion/02_integracion_mispacientes.md)
