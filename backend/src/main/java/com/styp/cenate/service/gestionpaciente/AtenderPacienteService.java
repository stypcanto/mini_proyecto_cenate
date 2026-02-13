package com.styp.cenate.service.gestionpaciente;

import com.styp.cenate.dto.AtenderPacienteRequest;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.AseguradoRepository;
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
import java.time.OffsetDateTime;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

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

    @Transactional
    public void atenderPaciente(Long idSolicitudBolsa, String especialidadActual, AtenderPacienteRequest request) {
        log.info("🏥 [v1.47.0] Registrando atención - Solicitud: {}", idSolicitudBolsa);

        try {
            // 1. Obtener solicitud original
            SolicitudBolsa solicitudOriginal = solicitudBolsaRepository.findById(idSolicitudBolsa)
                    .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

            String pkAsegurado = solicitudOriginal.getPacienteDni();
            Asegurado asegurado = aseguradoRepository.findByDocPaciente(solicitudOriginal.getPacienteDni())
                    .orElseThrow(() -> new RuntimeException("Asegurado no encontrado"));

            // ✅ Actualizar solicitud y enfermedades (inner try - continúa si falla)
            try {
                // Marcar la solicitud original como "Atendido"
                log.info("✅ Marcando solicitud original {} como Atendido", idSolicitudBolsa);
                solicitudOriginal.setCondicionMedica("Atendido");

                // Registrar fecha de atención en zona horaria de Perú (UTC-5)
                ZonedDateTime zonedDateTime = Instant.now().atZone(ZoneId.of("America/Lima"));
                LocalDate fechaAtencionLocal = zonedDateTime.toLocalDate();
                solicitudOriginal.setFechaAtencion(fechaAtencionLocal);
                log.info("✅ Fecha de atención registrada: {}", fechaAtencionLocal);

                // Guardar enfermedades crónicas
                if (request.getEsCronico() != null && request.getEsCronico() && request.getEnfermedades() != null && !request.getEnfermedades().isEmpty()) {
                    String[] enfermedadesArray = request.getEnfermedades().toArray(new String[0]);
                    log.info("🏥 Guardando enfermedades: {}", String.join(", ", enfermedadesArray));
                    asegurado.setEnfermedadCronica(enfermedadesArray);
                    Asegurado saved = aseguradoRepository.save(asegurado);
                    entityManager.flush();
                    log.info("✅ Enfermedades crónicas persistidas en BD");
                }

                // Guardar solicitud original
                solicitudBolsaRepository.save(solicitudOriginal);
                log.info("✅ Solicitud original marcada como Atendido");
            } catch (Exception e) {
                log.warn("⚠️ Error actualizando solicitud/asegurado (continuando): {}", e.getMessage());
            }

            // ✅ v1.81.0: Registrar atención en historial centralizado
            try {
                Long idMedicoActual = obtenerIdMedicoActual();
                trazabilidadClinicaService.registrarDesdeMisPacientes(
                    idSolicitudBolsa,
                    null,
                    idMedicoActual
                );
                log.info("✅ Atención registrada en historial centralizado");
            } catch (Exception e) {
                log.warn("⚠️ Error registrando en historial: {}", e.getMessage());
            }

            // 3. Crear bolsa Recita si aplica
            if (request.getTieneRecita() != null && request.getTieneRecita()) {
                if (existeRecitaParaPaciente(pkAsegurado)) {
                    log.warn("⚠️ Recita ya existe para el paciente: {}", pkAsegurado);
                } else {
                    crearBolsaRecita(solicitudOriginal, especialidadActual, request.getRecitaDias());
                    log.info("✅ Nueva bolsa RECITA creada - visible solo para gestora de citas");
                }
            }

            // 4. Crear bolsa Interconsulta si aplica
            if (request.getTieneInterconsulta() != null && request.getTieneInterconsulta()) {
                if (existeInterconsultaParaPaciente(pkAsegurado, request.getInterconsultaEspecialidad())) {
                    log.warn("⚠️ Interconsulta de {} ya existe para el paciente: {}",
                            request.getInterconsultaEspecialidad(), pkAsegurado);
                } else {
                    crearBolsaInterconsulta(solicitudOriginal, request.getInterconsultaEspecialidad());
                    log.info("✅ Nueva bolsa INTERCONSULTA creada - visible solo para gestora de citas");
                }
            }

            log.info("✅ Atención registrada completamente");
        } catch (Exception e) {
            log.error("❌ Error crítico registrando atención: {}", e.getMessage(), e);
        }
    }

    /**
     * Verificar si ya existe una Recita activa para el paciente
     */
    private boolean existeRecitaParaPaciente(String pacienteDni) {
        return solicitudBolsaRepository.existsByPacienteDniAndTipoCitaAndActivoTrue(pacienteDni, "RECITA");
    }

    /**
     * Verificar si ya existe una Interconsulta activa para el paciente en esa especialidad
     */
    private boolean existeInterconsultaParaPaciente(String pacienteDni, String especialidad) {
        return solicitudBolsaRepository.existsByPacienteDniAndTipoCitaAndEspecialidadAndActivoTrue(
                pacienteDni, "INTERCONSULTA", especialidad);
    }


    public void crearBolsaRecita(SolicitudBolsa solicitudOriginal, String especialidad, Integer dias) {
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
                .pacienteId(solicitudOriginal.getPacienteId())
                .pacienteSexo(solicitudOriginal.getPacienteSexo())
                .pacienteTelefono(solicitudOriginal.getPacienteTelefono())
                .codigoIpressAdscripcion(solicitudOriginal.getCodigoIpressAdscripcion())
                .tipoCita("RECITA")
                .especialidad(solicitudOriginal.getEspecialidad())
                .estado("PENDIENTE")
                .estadoGestionCitasId(1L) // PENDIENTE CITAR
                .idBolsa(10L) // ✅ v1.103.3: BOLSA_GESTORA para evitar violación de UNIQUE constraint
                .idServicio(idServicioRecita) // ✅ v1.47.3 Asignar idServicio para permitir selector de médicos
                .responsableGestoraId(solicitudOriginal.getResponsableGestoraId()) // ✅ Asignar gestora responsable
                .fechaAsignacion(OffsetDateTime.now())
                .fechaPreferidaNoAtendida(fechaPreferida.toLocalDate()) // ✅ Fecha preferida calculada (hoy + días)
                .activo(true)
                .build();

        try {
            solicitudBolsaRepository.save(bolsaRecita);
        } catch (Exception e) {
            log.warn("⚠️ [v1.103.3] Error creando bolsa Recita (posible duplicado): {}", e.getMessage());
            // No relanzar la excepción - permitir que continúe el flujo
        }
        log.info("✅ Bolsa RECITA creada: {} - Fecha preferida: {} - idServicio: {}",
                bolsaRecita.getIdSolicitud(), fechaPreferida, idServicioRecita);
    }

    public void crearBolsaInterconsulta(SolicitudBolsa solicitudOriginal, String especialidad) {
        log.info("📋 [v1.47.1] Creando bolsa INTERCONSULTA para especialidad: {}", especialidad);

        // ✅ v1.47.1: Usar BOLSA_GESTORA (10) en lugar de BOLSA_GENERADA_X_PROFESIONAL (11)
        // para permitir múltiples interconsultas de diferentes especialidades sin violar UNIQUE constraint
        ZonedDateTime zonedDateTime = Instant.now().atZone(ZoneId.of("America/Lima"));

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
                .pacienteId(solicitudOriginal.getPacienteId())
                .pacienteSexo(solicitudOriginal.getPacienteSexo())
                .pacienteTelefono(solicitudOriginal.getPacienteTelefono())
                .codigoIpressAdscripcion(solicitudOriginal.getCodigoIpressAdscripcion())
                .tipoCita("INTERCONSULTA")
                .especialidad(especialidad)
                .estado("PENDIENTE")
                .estadoGestionCitasId(1L) // PENDIENTE CITAR
                .idBolsa(10L) // ✅ v1.103.3: BOLSA_GESTORA para evitar violación de UNIQUE constraint
                .idServicio(idServicioInterconsulta) // ✅ v1.47.3 Asignar idServicio para permitir selector de médicos
                .responsableGestoraId(solicitudOriginal.getResponsableGestoraId()) // ✅ Asignar gestora responsable
                .fechaAsignacion(OffsetDateTime.now())
                .activo(true)
                .build();

        try {
            solicitudBolsaRepository.save(bolsaInterconsulta);
        } catch (Exception e) {
            log.warn("⚠️ [v1.103.3] Error creando bolsa Interconsulta (posible duplicado): {}", e.getMessage());
            // No relanzar la excepción - permitir que continúe el flujo
        }
        log.info("✅ Bolsa INTERCONSULTA creada: {} para especialidad: {} - idServicio: {}",
                bolsaInterconsulta.getIdSolicitud(), especialidad, idServicioInterconsulta);
    }

    private String generarNumeroSolicitud(String prefijo) {
        return prefijo + "-" + System.currentTimeMillis();
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
            log.debug("🔍 Username del SecurityContext: {}", username);

            if (username == null) {
                log.warn("⚠️ No se pudo obtener el usuario autenticado");
                return null;
            }

            // Buscar el usuario con todos los detalles incluyendo PersonalCnt
            Usuario usuario = usuarioRepository.findByNameUserWithFullDetails(username)
                    .orElse(null);

            if (usuario == null) {
                log.warn("⚠️ Usuario '{}' NO EXISTE en base de datos", username);
                return null;
            }

            log.debug("✅ Usuario encontrado: id={}, nameUser={}", usuario.getIdUser(), usuario.getNameUser());

            PersonalCnt personalCnt = usuario.getPersonalCnt();
            if (personalCnt != null && personalCnt.getIdPers() != null) {
                return personalCnt.getIdPers();
            }

            log.warn("⚠️ Usuario '{}' no tiene PersonalCnt asociado", username);
            return null;
        } catch (Exception e) {
            log.error("❌ [v1.89.7] Exception en obtenerIdMedicoActual: {}", e.getMessage(), e);
            return null;
        }
    }
}
