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
import java.util.List;

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

        // 1. Obtener solicitud original
        SolicitudBolsa solicitudOriginal = solicitudBolsaRepository.findById(idSolicitudBolsa)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        String pkAsegurado = solicitudOriginal.getPacienteDni();
        Asegurado asegurado = aseguradoRepository.findByDocPaciente(solicitudOriginal.getPacienteDni())
                .orElseThrow(() -> new RuntimeException("Asegurado no encontrado"));

        // ✅ v1.47.0: IMPORTANTE - Marcar la solicitud original como "Atendido"
        // Esto asegura que aparezca como "Atendido" en Mis Pacientes del médico
        log.info("✅ Marcando solicitud original {} como Atendido", idSolicitudBolsa);
        solicitudOriginal.setCondicionMedica("Atendido");

        // Registrar fecha de atención en zona horaria de Perú (UTC-5)
        ZonedDateTime zonedDateTime = Instant.now().atZone(ZoneId.of("America/Lima"));
        LocalDate fechaAtencionLocal = zonedDateTime.toLocalDate();
        solicitudOriginal.setFechaAtencion(fechaAtencionLocal);
        log.info("✅ Fecha de atención registrada: {}", fechaAtencionLocal);

        // ✅ v1.47.2: Guardar enfermedades crónicas PRIMERO
        if (request.getEsCronico() != null && request.getEsCronico() && request.getEnfermedades() != null && !request.getEnfermedades().isEmpty()) {
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
        solicitudOriginal.setCondicionMedica("Atendido");
        solicitudBolsaRepository.save(solicitudOriginal);
        log.info("✅ Solicitud original marcada como Atendido");

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

        // 3. Crear bolsa Recita si aplica
        // ✅ v1.47.0: La Recita es una NUEVA SOLICITUD de seguimiento para la gestora
        // NO es información que deba aparecer en "Mis Pacientes" del médico
        // ✅ v1.47.1: Verificar que la Recita no exista ya
        if (request.getTieneRecita() != null && request.getTieneRecita()) {
            if (existeRecitaParaPaciente(pkAsegurado)) {
                log.warn("⚠️ [v1.47.1] Recita ya existe para el paciente: {}", pkAsegurado);
                throw new RuntimeException("La Recita ya ha sido registrada para este paciente");
            }
            crearBolsaRecita(solicitudOriginal, especialidadActual, request.getRecitaDias());
            log.info("✅ Nueva bolsa RECITA creada - visible solo para gestora de citas");
        }

        // 4. Crear bolsa Interconsulta si aplica
        // ✅ v1.47.1: Verificar que la Interconsulta no exista ya para esta especialidad
        if (request.getTieneInterconsulta() != null && request.getTieneInterconsulta()) {
            if (existeInterconsultaParaPaciente(pkAsegurado, request.getInterconsultaEspecialidad())) {
                log.warn("⚠️ [v1.47.1] Interconsulta de {} ya existe para el paciente: {}",
                        request.getInterconsultaEspecialidad(), pkAsegurado);
                throw new RuntimeException("La Interconsulta de " + request.getInterconsultaEspecialidad() +
                        " ya ha sido registrada para este paciente");
            }
            crearBolsaInterconsulta(solicitudOriginal, request.getInterconsultaEspecialidad());
            log.info("✅ Nueva bolsa INTERCONSULTA creada - visible solo para gestora de citas");
        }

        log.info("✅ [v1.47.2] Atención registrada completamente - Enfermedades crónicas guardadas en tabla asegurados");
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
