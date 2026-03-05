package com.styp.cenate.service.gestionpaciente;

import com.styp.cenate.dto.AtenderPacienteRequest;
import com.styp.cenate.model.AtencionClinica;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.repository.AtencionClinicaRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.repository.DimServicioEssiRepository;
import com.styp.cenate.service.trazabilidad.TrazabilidadClinicaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

/**
 * ✅ v1.47.0: Servicio para registrar atención médica completa
 * - Crear bolsas de Recita
 * - Crear bolsas de Interconsulta
 * - Guardar enfermedades crónicas
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AtenderPacienteService {

    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final AseguradoRepository aseguradoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntityManager entityManager;
    private final DimServicioEssiRepository servicioEssiRepository;
    private final TrazabilidadClinicaService trazabilidadClinicaService;  // ✅ v1.81.0
    private final AtencionClinicaRepository atencionClinicaRepository;    // ✅ v1.76.0
    private final IpressRepository ipressRepository;                       // ✅ v1.103.7: FK lookup

    @Transactional
    public List<String> atenderPaciente(Long idSolicitudBolsa, String especialidadActual, AtenderPacienteRequest request) {
        log.info("🏥 [v1.103.6] Registrando atención - Solicitud: {}, especialidadActual='{}' (length={})", 
                idSolicitudBolsa, especialidadActual, especialidadActual != null ? especialidadActual.length() : 0);
        List<String> interconsultasOmitidas = new java.util.ArrayList<>();

        try {
            // 1. Obtener solicitud original
            SolicitudBolsa solicitudOriginal = solicitudBolsaRepository.findById(idSolicitudBolsa)
                    .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

            String pkAsegurado = solicitudOriginal.getPacienteDni();
            // ✅ Fix: asegurado es opcional — pacientes cargados sin registro en tabla asegurados
            // no deben bloquear el registro de atención (recita/interconsulta siguen funcionando)
            // ✅ v1.103.10: Fallback con cero a la izquierda (ej: 5273317 → 05273317)
            Optional<Asegurado> aseguradoOpt = aseguradoRepository.findByDocPaciente(pkAsegurado);
            if (aseguradoOpt.isEmpty()) {
                try {
                    String dniPadded = String.format("%08d", Long.parseLong(pkAsegurado.trim()));
                    if (!dniPadded.equals(pkAsegurado)) {
                        log.info("🔍 [v1.103.10] Reintentando con DNI paddeado: {} → {}", pkAsegurado, dniPadded);
                        aseguradoOpt = aseguradoRepository.findByDocPaciente(dniPadded);
                    }
                } catch (NumberFormatException ignored) {}
            }
            // Si aún no existe, crear el asegurado automáticamente con datos de dim_solicitud_bolsa
            Asegurado asegurado = aseguradoOpt.orElseGet(() -> crearAseguradoDesdeSolicitud(solicitudOriginal));

            // ✅ v1.47.0: IMPORTANTE - Marcar la solicitud original como "Atendido"
            log.info("✅ Marcando solicitud original {} como Atendido", idSolicitudBolsa);
            solicitudOriginal.setCondicionMedica("Atendido");

            // Registrar fecha de atención médica en zona horaria de Perú (UTC-5)
            ZonedDateTime zonedDateTime = Instant.now().atZone(ZoneId.of("America/Lima"));
            OffsetDateTime fechaAtencionMedica = zonedDateTime.toOffsetDateTime();
            solicitudOriginal.setFechaAtencionMedica(fechaAtencionMedica);
            log.info("✅ fechaAtencionMedica registrada: {}", fechaAtencionMedica);

            // ✅ v1.47.2: Guardar enfermedades crónicas PRIMERO
            if (asegurado != null && request.getEsCronico() != null && request.getEsCronico() && request.getEnfermedades() != null && !request.getEnfermedades().isEmpty()) {
                String[] enfermedadesArray = request.getEnfermedades().toArray(new String[0]);
                log.info("🏥 Guardando enfermedades: {}", String.join(", ", enfermedadesArray));
                asegurado.setEnfermedadCronica(enfermedadesArray);
                log.info("🔄 Array establecido en entidad: {}", asegurado.getEnfermedadCronica() != null ? String.join(", ", asegurado.getEnfermedadCronica()) : "null");
                Asegurado saved = aseguradoRepository.save(asegurado);
                log.info("✅ Asegurado guardado. Valor retornado: {}", saved.getEnfermedadCronica() != null ? String.join(", ", saved.getEnfermedadCronica()) : "null");
                entityManager.flush();
                log.info("✅ Flush ejecutado - cambios persistidos en BD");
            }

            // ✅ v1.47.2: Actualizar solicitud original
            // ✅ v1.84.7: También cambiar estado para excluir de búsqueda de RECITA existente
            solicitudOriginal.setCondicionMedica("Atendido");
            solicitudOriginal.setEstado("ATENDIDO"); // ✅ v1.84.7: Cambiar estado ANTES de buscar RECITAs
            solicitudOriginal.setPacienteId(null); // ✅ fix FK: limpiar ID numérico inválido antes de guardar
            guardarSolicitudConTransaccion(solicitudOriginal);
            log.info("✅ Solicitud original marcada como Atendido (condicionMedica + estado)");

            // ✅ v1.76.0: Guardar Ficha de Enfermería en atencion_clinica si hay datos
            // ✅ v6.0.0: Capturar id_atencion para vincularlo a RECITA/INTERCONSULTA (FK directa)
            Long idAtencionClinica = guardarFichaEnfermeria(request, solicitudOriginal, fechaAtencionMedica, asegurado);

            // ✅ v1.81.0: Registrar atención en historial centralizado
            try {
                Long idMedicoActual = obtenerIdMedicoActual();
                trazabilidadClinicaService.registrarDesdeMisPacientes(
                    idSolicitudBolsa,
                    null,  // No hay observaciones en AtenderPacienteRequest
                    idMedicoActual
                );
                log.info("✅ [v1.81.0] Atención registrada en historial centralizado");
            } catch (Exception e) {
                log.warn("⚠️ [v1.81.0] Error registrando en historial: {}", e.getMessage());
            }

            // ✅ v1.82.8: pk_asegurado real para recita/interconsulta (evita NULL, UUID y DNIs cortos)
            String pkAseguradoFinal = asegurado != null ? asegurado.getPkAsegurado() : pkAsegurado;

            // 3. Crear o actualizar bolsa Recita si aplica
            // ✅ v1.84.4: Buscar recita existente por paciente + ESPECIALIDAD (de solicitud) + ESTADO PENDIENTE
            // Si hay RECITA PENDIENTE → actualizar fecha. Si no → crear nueva.
            // ✅ v1.84.6: Logging diagnóstico para problema de RECITA no creada
            log.info("═══════════════════════════════════════════════════════════════");
            log.info("🔍 [RECITA v1.84.6] DIAGNÓSTICO - ANTES DE EVALUAR tieneRecita");
            log.info("   → request.getTieneRecita() = {}", request.getTieneRecita());
            log.info("   → asegurado = {} (null? {})", asegurado, asegurado == null);
            log.info("   → pkAseguradoFinal = '{}'", pkAseguradoFinal);
            log.info("   → idAtencionClinica = {}", idAtencionClinica);
            log.info("   → solicitudOriginal.getIdSolicitud() = {}", solicitudOriginal.getIdSolicitud());
            log.info("   → solicitudOriginal.getEspecialidad() = '{}'", solicitudOriginal.getEspecialidad());
            log.info("═══════════════════════════════════════════════════════════════");
            
            if (request.getTieneRecita() != null && request.getTieneRecita()) {
                // ✅ v1.84.4: Usar especialidad DE LA SOLICITUD ORIGINAL (no del parámetro)
                String especialidadParaBusqueda = solicitudOriginal.getEspecialidad() != null 
                        ? solicitudOriginal.getEspecialidad().trim().toUpperCase() : "";
                String dniNormalizado = solicitudOriginal.getPacienteDni() != null 
                        ? solicitudOriginal.getPacienteDni().trim() : "";
                
                log.info("═══════════════════════════════════════════════════════════════");
                log.info("🔍 [RECITA v1.84.5] INICIO BÚSQUEDA DE RECITA EXISTENTE");
                log.info("═══════════════════════════════════════════════════════════════");
                log.info("🔍 Parámetro 1 - DNI normalizado: '{}'", dniNormalizado);
                log.info("🔍 Parámetro 2 - Especialidad normalizada: '{}'", especialidadParaBusqueda);
                log.info("🔍 [DEBUG] solicitudOriginal.getEspecialidad() raw = '{}'", solicitudOriginal.getEspecialidad());
                log.info("🔍 [DEBUG] especialidadActual (param del controller) = '{}'", especialidadActual);
                log.info("🔍 Query SQL equivalente:");
                log.info("   SELECT * FROM dim_solicitud_bolsa");
                log.info("   WHERE TRIM(paciente_dni) = TRIM('{}')".replace("{}", dniNormalizado));
                log.info("     AND UPPER(TRIM(especialidad)) = UPPER(TRIM('{}'))".replace("{}", especialidadParaBusqueda));
                log.info("     AND UPPER(TRIM(estado)) = 'PENDIENTE'");
                log.info("     AND UPPER(TRIM(tipo_cita)) = 'RECITA'");
                log.info("   ORDER BY fecha_asignacion DESC LIMIT 1");
                
                var recitaExistente = solicitudBolsaRepository
                        .findRecitaPendientePorEspecialidad(dniNormalizado, especialidadParaBusqueda);
                
                // ✅ v1.84.7: Excluir la solicitud original de los resultados (por si el flush no se propagó)
                if (recitaExistente.isPresent() && recitaExistente.get().getIdSolicitud().equals(solicitudOriginal.getIdSolicitud())) {
                    log.warn("⚠️ [RECITA v1.84.7] La query retornó la misma solicitud original (id={}), descartando...", solicitudOriginal.getIdSolicitud());
                    recitaExistente = java.util.Optional.empty();
                }
                
                log.info("═══════════════════════════════════════════════════════════════");
                log.info("🔍 [RECITA v1.84.5] RESULTADO: encontrada = {}", recitaExistente.isPresent());
                if (recitaExistente.isPresent()) {
                    SolicitudBolsa r = recitaExistente.get();
                    log.info("   → id_solicitud: {}", r.getIdSolicitud());
                    log.info("   → paciente_dni: '{}'", r.getPacienteDni());
                    log.info("   → especialidad: '{}'", r.getEspecialidad());
                    log.info("   → estado: '{}'", r.getEstado());
                    log.info("   → tipo_cita: '{}'", r.getTipoCita());
                }
                log.info("═══════════════════════════════════════════════════════════════");
                
                if (recitaExistente.isPresent()) {
                    SolicitudBolsa recita = recitaExistente.get();
                    log.info("✅ [RECITA v1.84.5] ACTUALIZANDO recita existente id={}", recita.getIdSolicitud());
                    ZonedDateTime nuevaFecha = Instant.now().atZone(ZoneId.of("America/Lima"))
                            .plusDays(request.getRecitaDias() != null ? request.getRecitaDias() : 7);
                    recita.setFechaPreferidaNoAtendida(nuevaFecha.toLocalDate());
                    if (idAtencionClinica != null) recita.setIdAtencionClinica(idAtencionClinica);
                    recita.setPacienteId(pkAseguradoFinal); // ✅ v1.82.8: pk_asegurado correcto
                    solicitudBolsaRepository.saveAndFlush(recita);
                    log.info("✅ [RECITA v1.84.4] Bolsa RECITA ACTUALIZADA (id={}) — nueva fecha: {}", recita.getIdSolicitud(), nuevaFecha.toLocalDate());
                } else {
                    log.info("⚠️ [RECITA v1.84.4] NO encontrada recita PENDIENTE, creando nueva...");
                    crearBolsaRecitaConTransaccion(solicitudOriginal, especialidadParaBusqueda, request.getRecitaDias(), idAtencionClinica, pkAseguradoFinal);
                    log.info("✅ [RECITA v1.84.4] Nueva bolsa RECITA creada");
                }
            } else {
                // ✅ v1.84.6: Logging cuando NO se solicita RECITA
                log.info("ℹ️ [RECITA v1.84.6] NO se solicitó RECITA (tieneRecita={}) - omitiendo creación", request.getTieneRecita());
            }

            // 4. Crear bolsa Interconsulta por cada especialidad (múltiples — v1.75.0)
            // ✅ v1.84.0: Usar interconsultaItems (con idMotivo) si está presente; fallback a string
            if (request.getTieneInterconsulta() != null && request.getTieneInterconsulta()) {

                if (request.getInterconsultaItems() != null && !request.getInterconsultaItems().isEmpty()) {
                    // ✅ v1.84.0: Ruta estructurada — cada item trae especialidad + idMotivo
                    for (AtenderPacienteRequest.InterconsultaItemDTO item : request.getInterconsultaItems()) {
                        String especialidadTrimmed = item.getEspecialidad() != null ? item.getEspecialidad().trim() : "";
                        if (especialidadTrimmed.isEmpty()) continue;

                        if (existeInterconsultaParaPaciente(solicitudOriginal.getPacienteDni(), especialidadTrimmed)) {
                            log.warn("⚠️ [v1.84.0] Interconsulta de '{}' ya existe para el paciente: {}",
                                    especialidadTrimmed, solicitudOriginal.getPacienteDni());
                            interconsultasOmitidas.add(especialidadTrimmed);
                        } else {
                            crearBolsaInterconsultaConTransaccion(solicitudOriginal, especialidadTrimmed,
                                    idAtencionClinica, pkAseguradoFinal, item.getIdMotivo());
                            log.info("✅ [v1.84.0] INTERCONSULTA creada — especialidad: '{}', idMotivo: {}",
                                    especialidadTrimmed, item.getIdMotivo());
                        }
                    }
                } else if (request.getInterconsultaEspecialidad() != null
                        && !request.getInterconsultaEspecialidad().isBlank()) {
                    // Fallback legacy: solo string, sin idMotivo
                    String[] especialidades = request.getInterconsultaEspecialidad().split(",");
                    for (String esp : especialidades) {
                        String especialidadTrimmed = esp.trim();
                        if (especialidadTrimmed.isEmpty()) continue;

                        if (existeInterconsultaParaPaciente(solicitudOriginal.getPacienteDni(), especialidadTrimmed)) {
                            log.warn("⚠️ [v1.75.0] Interconsulta de '{}' ya existe para el paciente: {}",
                                    especialidadTrimmed, solicitudOriginal.getPacienteDni());
                            interconsultasOmitidas.add(especialidadTrimmed);
                        } else {
                            crearBolsaInterconsultaConTransaccion(solicitudOriginal, especialidadTrimmed,
                                    idAtencionClinica, pkAseguradoFinal, null);
                            log.info("✅ [v1.75.0] Nueva bolsa INTERCONSULTA creada para especialidad: '{}'", especialidadTrimmed);
                        }
                    }
                }
            }

            log.info("✅ [v1.103.6] Atención registrada completamente - Enfermedades crónicas guardadas en tabla asegurados");
            return interconsultasOmitidas;
        } catch (Exception e) {
            log.error("❌ [v1.103.6] Error crítico registrando atención: {}", e.getMessage(), e);
            throw new RuntimeException("Error al registrar atención: " + e.getMessage(), e);
        }
    }

    // ✅ v1.84.6: Removido @Transactional innecesario (métodos privados no son interceptados por Spring AOP)
    private void guardarSolicitudConTransaccion(SolicitudBolsa solicitud) {
        solicitudBolsaRepository.saveAndFlush(solicitud); // ✅ v1.84.6: flush inmediato
    }

    // ✅ v1.84.6: Removido @Transactional innecesario
    private void crearBolsaRecitaConTransaccion(SolicitudBolsa solicitudOriginal, String especialidad, Integer dias, Long idAtencionClinica, String pkAsegurado) {
        crearBolsaRecita(solicitudOriginal, especialidad, dias, idAtencionClinica, pkAsegurado);
    }

    // ✅ v1.84.6: Removido @Transactional innecesario
    private void crearBolsaInterconsultaConTransaccion(SolicitudBolsa solicitudOriginal, String especialidad, Long idAtencionClinica, String pkAsegurado, Long idMotivoInterconsulta) {
        crearBolsaInterconsulta(solicitudOriginal, especialidad, idAtencionClinica, pkAsegurado, idMotivoInterconsulta);
    }

    /**
     * ✅ v1.47.1: Verificar si ya existe una Recita para el paciente
     */
    private boolean existeRecitaParaPaciente(String pacienteDni) {
        List<SolicitudBolsa> recitas = solicitudBolsaRepository.findAll().stream()
                .filter(s -> s.getPacienteDni().equals(pacienteDni)
                        && s.getTipoCita() != null && s.getTipoCita().equals("RECITA")
                        && s.getActivo() != null && s.getActivo())
                .toList();
        return !recitas.isEmpty();
    }

    /**
     * ✅ v1.47.1: Verificar si ya existe una Interconsulta para el paciente en esa especialidad
     */
    private boolean existeInterconsultaParaPaciente(String pacienteDni, String especialidad) {
        List<SolicitudBolsa> interconsultas = solicitudBolsaRepository.findAll().stream()
                .filter(s -> s.getPacienteDni().equals(pacienteDni)
                        && s.getTipoCita() != null && s.getTipoCita().equals("INTERCONSULTA")
                        && s.getEspecialidad() != null && s.getEspecialidad().equals(especialidad)
                        && s.getActivo() != null && s.getActivo())
                .toList();
        return !interconsultas.isEmpty();
    }


    public void crearBolsaRecita(SolicitudBolsa solicitudOriginal, String especialidad, Integer dias, Long idAtencionClinica, String pkAsegurado) {
        log.info("📋 [v1.47.2] Creando bolsa RECITA para días: {}", dias);

        // ✅ v1.47.2: Recita usa especialidad del médico (solicitud original), NO la de Interconsulta
        ZonedDateTime zonedDateTime = Instant.now().atZone(ZoneId.of("America/Lima"));
        ZonedDateTime fechaPreferida = zonedDateTime.plusDays(dias != null ? dias : 7);

        // ✅ v1.47.3: Buscar idServicio por especialidad para permitir asignación de médico
        Long idServicioRecita = null;
        try {
            String especialidadTrimmed = solicitudOriginal.getEspecialidad() != null ?
                    solicitudOriginal.getEspecialidad().trim() : "";
            log.info("🔍 RECITA: Buscando idServicio para especialidad: '{}'", especialidadTrimmed);

            var servicioOpt = servicioEssiRepository.findFirstByDescServicioIgnoreCaseAndEstado(
                    especialidadTrimmed, "A");
            if (servicioOpt.isPresent()) {
                idServicioRecita = servicioOpt.get().getIdServicio();
                log.info("✅ RECITA: idServicio encontrado para especialidad '{}': {}",
                        especialidadTrimmed, idServicioRecita);
            } else {
                log.warn("⚠️ RECITA: No se encontró idServicio para especialidad '{}'. Buscando todos los servicios...",
                        especialidadTrimmed);
            }
        } catch (Exception e) {
            log.error("❌ RECITA: Error buscando idServicio para especialidad: {}",
                    solicitudOriginal.getEspecialidad(), e);
        }

        SolicitudBolsa bolsaRecita = SolicitudBolsa.builder()
                .numeroSolicitud(generarNumeroSolicitud("REC"))
                .pacienteDni(solicitudOriginal.getPacienteDni())
                .pacienteNombre(solicitudOriginal.getPacienteNombre())
                .pacienteId(pkAsegurado) // ✅ v1.82.8: pk_asegurado real desde tabla asegurados
                .pacienteSexo(solicitudOriginal.getPacienteSexo())
                .pacienteTelefono(solicitudOriginal.getPacienteTelefono())
                .codigoIpressAdscripcion(solicitudOriginal.getCodigoIpressAdscripcion())
                .idIpress(solicitudOriginal.getIdIpress())                 // ✅ v1.84.0: FK IPRESS adscripción del padre
                .idIpressAtencion(solicitudOriginal.getIdIpressAtencion()) // ✅ v1.84.0: FK IPRESS atención del padre
                .tipoCita("RECITA")
                .especialidad(solicitudOriginal.getEspecialidad())
                .estado("PENDIENTE")
                .estadoGestionCitasId(11L) // PENDIENTE_CITA = Paciente nuevo que ingresó a la bolsa
                .idBolsa(15L) // ✅ v1.103.10: BOLSA_RECITAS (id_bolsa=15)
                .idServicio(idServicioRecita) // ✅ v1.47.3 Asignar idServicio para permitir selector de médicos
                // ✅ v1.103.9: Sin gestora — va a bolsas/solicitudes para ser asignada, NO a citas-agendadas
                .fechaAsignacion(OffsetDateTime.now())
                .fechaPreferidaNoAtendida(fechaPreferida.toLocalDate()) // ✅ Fecha preferida calculada (hoy + días)
                .idsolicitudgeneracion(solicitudOriginal.getIdSolicitud()) // ✅ FK trazabilidad
                .idSolicitudPadre(solicitudOriginal.getIdSolicitud())      // ✅ v1.84.0: FK solicitud padre (consistente con INTERCONSULTA)
                // id_personal = NULL: el coordinador asignará al profesional desde /bolsas/solicitudespendientes
                // La trazabilidad del creador se obtiene via id_atencion_clinica.id_personal_creador
                .idAtencionClinica(idAtencionClinica) // ✅ v6.0.0: FK directa → atencion_clinica
                .activo(true)
                .build();

        try {
            solicitudBolsaRepository.saveAndFlush(bolsaRecita); // ✅ v1.84.1: flush inmediato para evitar race conditions
            log.info("✅ Bolsa RECITA creada: {} - Fecha preferida: {} - idServicio: {} - idSolicitudPadre: {}",
                    bolsaRecita.getIdSolicitud(), fechaPreferida, idServicioRecita, solicitudOriginal.getIdSolicitud());
        } catch (Exception e) {
            log.error("❌ [v1.103.5] Error CRÍTICO creando bolsa Recita: {}", e.getMessage(), e);
            throw new RuntimeException("Error creando bolsa de Recita: " + e.getMessage(), e);
        }
    }

    public void crearBolsaInterconsulta(SolicitudBolsa solicitudOriginal, String especialidad, Long idAtencionClinica, String pkAsegurado, Long idMotivoInterconsulta) {
        log.info("📋 [v1.84.0] Creando bolsa INTERCONSULTA — especialidad: {}, idMotivo: {}", especialidad, idMotivoInterconsulta);

        // ✅ v1.75.0: usa BOLSA_GENERADA_X_PROFESIONAL (11) — igual que RECITA
        // El UNIQUE constraint antiguo fue resuelto (1 fila por especialidad), ya no se necesita BOLSA_GESTORA (10)
        ZonedDateTime zonedDateTime = Instant.now().atZone(ZoneId.of("America/Lima"));
        ZonedDateTime fechaPreferidaInterconsulta = zonedDateTime.plusDays(30); // 30 días por defecto para interconsultas

        // ✅ v1.47.3: Buscar idServicio por especialidad para permitir asignación de médico
        Long idServicioInterconsulta = null;
        try {
            String especialidadTrimmed = especialidad != null ? especialidad.trim() : "";
            log.info("🔍 INTERCONSULTA: Buscando idServicio para especialidad: '{}'", especialidadTrimmed);

            var servicioOpt = servicioEssiRepository.findFirstByDescServicioIgnoreCaseAndEstado(
                    especialidadTrimmed, "A");
            if (servicioOpt.isPresent()) {
                idServicioInterconsulta = servicioOpt.get().getIdServicio();
                log.info("✅ INTERCONSULTA: idServicio encontrado para especialidad '{}': {}",
                        especialidadTrimmed, idServicioInterconsulta);
            } else {
                log.warn("⚠️ INTERCONSULTA: No se encontró idServicio para especialidad '{}'. Buscando todos los servicios...",
                        especialidadTrimmed);
            }
        } catch (Exception e) {
            log.error("❌ INTERCONSULTA: Error buscando idServicio para especialidad: {}", especialidad, e);
        }

        SolicitudBolsa bolsaInterconsulta = SolicitudBolsa.builder()
                .numeroSolicitud(generarNumeroSolicitud("INT"))
                .pacienteDni(solicitudOriginal.getPacienteDni())
                .pacienteNombre(solicitudOriginal.getPacienteNombre())
                .pacienteId(pkAsegurado) // ✅ v1.82.8: pk_asegurado real desde tabla asegurados
                .pacienteSexo(solicitudOriginal.getPacienteSexo())
                .pacienteTelefono(solicitudOriginal.getPacienteTelefono())
                .codigoIpressAdscripcion(solicitudOriginal.getCodigoIpressAdscripcion())
                .idIpress(solicitudOriginal.getIdIpress())                 // ✅ v1.84.0: FK IPRESS adscripción del padre
                .idIpressAtencion(solicitudOriginal.getIdIpressAtencion()) // ✅ v1.84.0: FK IPRESS atención del padre
                .tipoCita("INTERCONSULTA")
                .especialidad(especialidad)
                .estado("PENDIENTE")
                .estadoGestionCitasId(11L) // PENDIENTE_CITA = Paciente nuevo que ingresó a la bolsa
                .idBolsa(16L) // ✅ v1.103.10: BOLSA_INTERCONSULTAS (id_bolsa=16)
                .idServicio(idServicioInterconsulta) // ✅ v1.47.3 Asignar idServicio para permitir selector de médicos
                // ✅ v1.103.9: Sin gestora — va a bolsas/solicitudes para ser asignada, NO a citas-agendadas
                .fechaAsignacion(OffsetDateTime.now())
                .fechaPreferidaNoAtendida(fechaPreferidaInterconsulta.toLocalDate()) // ✅ Fecha preferida (hoy + 30 días)
                .idsolicitudgeneracion(solicitudOriginal.getIdSolicitud()) // ✅ FK trazabilidad
                .idSolicitudPadre(solicitudOriginal.getIdSolicitud())      // ✅ v1.84.0: FK solicitud padre
                .idMotivoInterconsulta(idMotivoInterconsulta)              // ✅ v1.84.0: FK motivo interconsulta
                // id_personal = NULL: el coordinador asignará al profesional desde /bolsas/solicitudespendientes
                // La trazabilidad del creador se obtiene via id_atencion_clinica.id_personal_creador
                .idAtencionClinica(idAtencionClinica) // ✅ v6.0.0: FK directa → atencion_clinica
                .activo(true)
                .build();

        try {
            solicitudBolsaRepository.save(bolsaInterconsulta);
            log.info("✅ Bolsa INTERCONSULTA creada: {} para especialidad: {} - idServicio: {} - idMotivo: {} - idSolicitudPadre: {}",
                    bolsaInterconsulta.getIdSolicitud(), especialidad, idServicioInterconsulta,
                    idMotivoInterconsulta, solicitudOriginal.getIdSolicitud());
        } catch (Exception e) {
            log.error("❌ [v1.103.5] Error CRÍTICO creando bolsa Interconsulta: {}", e.getMessage(), e);
            throw new RuntimeException("Error creando bolsa de Interconsulta: " + e.getMessage(), e);
        }
    }

    /**
     * ✅ v1.76.0 / v1.103.7 / v6.0.0: Guarda los datos de la Ficha de Enfermería en atencion_clinica.
     * Solo persiste si al menos un campo de la ficha tiene valor.
     * v1.103.7: Corregido FK violations (pk_asegurado UUID, id_ipress lookup, id_personal_creador guard)
     * v6.0.0:   Retorna el id_atencion generado para vincularlo a RECITA/INTERCONSULTA (FK directa).
     *           Retorna null si no hay datos de enfermería o si ocurre un error.
     */
    private Long guardarFichaEnfermeria(AtenderPacienteRequest request,
                                        SolicitudBolsa solicitud,
                                        OffsetDateTime fechaAtencion,
                                        Asegurado asegurado) {
        boolean tieneDatosEnfermeria =
                request.getControlEnfermeria() != null ||
                request.getImcValor() != null ||
                request.getPesoKg() != null ||
                request.getTallaMt() != null ||
                request.getAdherencia() != null ||
                request.getNivelRiesgo() != null ||
                request.getControlado() != null ||
                request.getObservaciones() != null ||
                request.getPresionArterial() != null ||
                request.getGlucosa() != null;


        if (asegurado == null || !tieneDatosEnfermeria) {
            log.debug("ℹ️ [v1.76.0] Sin datos de Ficha Enfermería o asegurado null — omitiendo guardado");
            return null;
        }

        // ✅ v1.103.7: Obtener id_personal_creador — FK obligatorio
        Long idPersonal = obtenerIdMedicoActual();
        if (idPersonal == null) {
            log.warn("⚠️ [v1.103.7] No se puede guardar Ficha Enfermería: idPersonalCreador es null (médico sin PersonalCnt)");
            return null;
        }

        // ✅ v1.103.7: Resolver id_ipress — FK obligatorio
        // Prioridad: solicitud.idIpress → lookup por casAdscripcion del asegurado
        Long idIpress = solicitud.getIdIpress();
        if (idIpress == null && asegurado.getCasAdscripcion() != null) {
            idIpress = ipressRepository.findByCodIpress(asegurado.getCasAdscripcion())
                    .map(Ipress::getIdIpress)
                    .orElse(null);
        }
        if (idIpress == null) {
            log.warn("⚠️ [v1.103.7] No se puede guardar Ficha Enfermería: id_ipress no encontrado para DNI: {}", solicitud.getPacienteDni());
            return null;
        }

        // ✅ v1.103.7: Usar pk_asegurado UUID (FK a asegurados.pk_asegurado), NO el DNI
        AtencionClinica ficha = null;
        try {
            // Convertir talla de metros → centímetros
            BigDecimal tallaCm = null;
            if (request.getTallaMt() != null) {
                try {
                    BigDecimal tallaMetros = new BigDecimal(request.getTallaMt());
                    tallaCm = tallaMetros.multiply(BigDecimal.valueOf(100));
                } catch (NumberFormatException ignored) {}
            }

            BigDecimal pesoKg = null;
            if (request.getPesoKg() != null) {
                try { pesoKg = new BigDecimal(request.getPesoKg()); } catch (NumberFormatException ignored) {}
            }

            BigDecimal imcValor = null;
            if (request.getImcValor() != null) {
                try { imcValor = new BigDecimal(request.getImcValor()); } catch (NumberFormatException ignored) {}
            }

            BigDecimal glucosaValor = null;
            if (request.getGlucosa() != null) {
                try { glucosaValor = new BigDecimal(request.getGlucosa()); } catch (NumberFormatException ignored) {}
            }

            // ✅ Buscar ficha existente para actualizar en lugar de duplicar
            var fichaExistente = atencionClinicaRepository
                    .findFirstByPkAseguradoAndIdTipoAtencionOrderByCreatedAtDesc(
                            asegurado.getPkAsegurado(), 5L);

            if (fichaExistente.isPresent()) {
                ficha = fichaExistente.get();
                ficha.setFechaAtencion(fechaAtencion);
                ficha.setPresionArterial(request.getPresionArterial());
                ficha.setPesoKg(pesoKg);
                ficha.setTallaCm(tallaCm);
                ficha.setImc(imcValor);
                ficha.setGlucosa(glucosaValor);
                ficha.setObservacionesGenerales(request.getObservaciones());
                ficha.setControlEnfermeria(request.getControlEnfermeria());
                ficha.setAdherenciaMorisky(request.getAdherencia());
                ficha.setNivelRiesgo(request.getNivelRiesgo());
                ficha.setControlado(request.getControlado());
                ficha.setIdPersonalModificador(idPersonal);
                AtencionClinica actualizada = atencionClinicaRepository.save(ficha);
                log.info("✅ Ficha de Enfermería ACTUALIZADA — id_atencion: {}", actualizada.getIdAtencion());
                return actualizada.getIdAtencion();
            }

            ficha = AtencionClinica.builder()
                    .pkAsegurado(asegurado.getPkAsegurado())
                    .fechaAtencion(fechaAtencion)
                    .idIpress(idIpress)
                    .idServicio(solicitud.getIdServicio())
                    .idTipoAtencion(5L)  // 5 = ENFERMERÍA
                    .pesoKg(pesoKg)
                    .tallaCm(tallaCm)
                    .imc(imcValor)
                    .presionArterial(request.getPresionArterial())
                    .glucosa(glucosaValor)
                    .observacionesGenerales(request.getObservaciones())
                    .controlEnfermeria(request.getControlEnfermeria())
                    .adherenciaMorisky(request.getAdherencia())
                    .nivelRiesgo(request.getNivelRiesgo())
                    .controlado(request.getControlado())
                    .idPersonalCreador(idPersonal)
                    .tieneOrdenInterconsulta(false)
                    .requiereTelemonitoreo(false)
                    .build();

            AtencionClinica guardada = atencionClinicaRepository.save(ficha);
            log.info("✅ [v6.0.0] Ficha de Enfermería CREADA — id_atencion: {} / DNI: {}",
                    guardada.getIdAtencion(), solicitud.getPacienteDni());
            return guardada.getIdAtencion();
        } catch (Exception e) {
            // ✅ v1.103.7: Limpiar entidad de la sesión Hibernate para evitar "null identifier" en flush posterior
            if (ficha != null) {
                try { entityManager.detach(ficha); } catch (Exception ignored) {}
            }
            log.warn("⚠️ [v1.103.7] Error guardando Ficha Enfermería (no bloquea la atención): {}", e.getMessage());
            return null;
        }
    }

    private String generarNumeroSolicitud(String prefijo) {
        return prefijo + "-" + System.currentTimeMillis();
    }

    /**
     * Crea un registro en la tabla asegurados a partir de los datos de dim_solicitud_bolsa.
     * Se invoca automáticamente cuando el paciente no existe en asegurados.
     * Campos mapeados: DNI → pk_asegurado + doc_paciente, nombre, sexo, teléfono, cas_adscripcion.
     * ✅ v1.84.6: Usando saveAndFlush para persistencia inmediata
     */
    private Asegurado crearAseguradoDesdeSolicitud(SolicitudBolsa solicitud) {
        String dni = solicitud.getPacienteDni();
        log.info("🆕 Creando asegurado automáticamente para DNI: {}", dni);
        try {
            Asegurado nuevo = new Asegurado();
            nuevo.setPkAsegurado(dni);
            nuevo.setDocPaciente(dni);
            nuevo.setPaciente(solicitud.getPacienteNombre());
            nuevo.setSexo(solicitud.getPacienteSexo());
            nuevo.setTelCelular(solicitud.getPacienteTelefono());
            nuevo.setCasAdscripcion(solicitud.getCodigoAdscripcion());
            nuevo.setVigencia(true);
            Asegurado guardado = aseguradoRepository.saveAndFlush(nuevo); // ✅ v1.84.6: flush inmediato
            log.info("✅ Asegurado creado: DNI={}, nombre={}", dni, nuevo.getPaciente());
            return guardado;
        } catch (Exception e) {
            log.warn("⚠️ No se pudo crear asegurado para DNI {}: {}", dni, e.getMessage());
            return null;
        }
    }

    // =====================================================================
    // ✅ v1.81.0: HELPER PARA OBTENER ID DEL MÉDICO ACTUAL
    // =====================================================================

    /**
     * ✅ v1.89.7: Obtiene el ID del médico (PersonalCnt) actualmente autenticado
     * ✅ Ahora implementa búsqueda proper del usuario como en GestionPacienteServiceImpl
     *
     * @return ID del médico, null si no se encuentra
     */
    private Long obtenerIdMedicoActual() {
        try {
            // Obtener el usuario autenticado desde SecurityContext
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            log.warn("🔍 [v1.89.7] Username del SecurityContext: {}", username);

            if (username == null) {
                log.warn("⚠️ [v1.89.7] No se pudo obtener el usuario autenticado");
                return null;
            }

            // Buscar el usuario con todos los detalles incluyendo PersonalCnt
            Usuario usuario = usuarioRepository.findByNameUserWithFullDetails(username)
                    .orElse(null);

            log.warn("🔍 [v1.89.7] Usuario encontrado en BD: {}", usuario != null);

            if (usuario == null) {
                log.warn("⚠️ [v1.89.7] Usuario '{}' NO EXISTE en base de datos", username);
                return null;
            }

            log.warn("✅ [v1.89.7] Usuario encontrado: id={}, nameUser={}", usuario.getIdUser(), usuario.getNameUser());

            PersonalCnt personalCnt = usuario.getPersonalCnt();
            log.warn("🔍 [v1.89.7] PersonalCnt: {} (null? {})", personalCnt, personalCnt == null);

            if (personalCnt != null && personalCnt.getIdPers() != null) {
                Long idPers = personalCnt.getIdPers();
                log.warn("✅ [v1.89.7] OBTENIDO idPersonalCreador: {} para usuario: {}", idPers, username);
                return idPers;
            }

            log.warn("❌ [v1.89.7] Usuario '{}' NO TIENE PersonalCnt o idPers es null", username);
            if (usuario.getPersonalExterno() != null) {
                log.warn("⚠️ [v1.89.7] Usuario {} tiene PersonalExterno en lugar de PersonalCnt", username);
            }
            return null;
        } catch (Exception e) {
            log.error("❌ [v1.89.7] Exception en obtenerIdMedicoActual: {}", e.getMessage(), e);
            return null;
        }
    }
}
