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
    public void atenderPaciente(Long idSolicitudBolsa, String especialidadActual, AtenderPacienteRequest request) {
        log.info("🏥 [v1.103.6] Registrando atención - Solicitud: {}", idSolicitudBolsa);

        try {
            // 1. Obtener solicitud original
            SolicitudBolsa solicitudOriginal = solicitudBolsaRepository.findById(idSolicitudBolsa)
                    .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

            String pkAsegurado = solicitudOriginal.getPacienteDni();
            Asegurado asegurado = aseguradoRepository.findByDocPaciente(solicitudOriginal.getPacienteDni())
                    .orElseThrow(() -> new RuntimeException("Asegurado no encontrado con DNI: " + pkAsegurado));

            // ✅ v1.47.0: IMPORTANTE - Marcar la solicitud original como "Atendido"
            log.info("✅ Marcando solicitud original {} como Atendido", idSolicitudBolsa);
            solicitudOriginal.setCondicionMedica("Atendido");

            // Registrar fecha de atención médica en zona horaria de Perú (UTC-5)
            ZonedDateTime zonedDateTime = Instant.now().atZone(ZoneId.of("America/Lima"));
            OffsetDateTime fechaAtencionMedica = zonedDateTime.toOffsetDateTime();
            solicitudOriginal.setFechaAtencionMedica(fechaAtencionMedica);
            log.info("✅ fechaAtencionMedica registrada: {}", fechaAtencionMedica);

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
            guardarSolicitudConTransaccion(solicitudOriginal);
            log.info("✅ Solicitud original marcada como Atendido");

            // ✅ v1.76.0: Guardar Ficha de Enfermería en atencion_clinica si hay datos
            guardarFichaEnfermeria(request, solicitudOriginal, fechaAtencionMedica, asegurado);

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

            String pkAseguradoFinal = pkAsegurado;
            // 3. Crear bolsa Recita si aplica
            if (request.getTieneRecita() != null && request.getTieneRecita()) {
                if (existeRecitaParaPaciente(pkAseguradoFinal)) {
                    log.warn("⚠️ [v1.47.1] Recita ya existe para el paciente: {}", pkAseguradoFinal);
                } else {
                    crearBolsaRecitaConTransaccion(solicitudOriginal, especialidadActual, request.getRecitaDias());
                    log.info("✅ Nueva bolsa RECITA creada - visible solo para gestora de citas");
                }
            }

            // 4. Crear bolsa Interconsulta por cada especialidad (múltiples — v1.75.0)
            if (request.getTieneInterconsulta() != null && request.getTieneInterconsulta()
                    && request.getInterconsultaEspecialidad() != null
                    && !request.getInterconsultaEspecialidad().isBlank()) {

                String[] especialidades = request.getInterconsultaEspecialidad().split(",");
                for (String esp : especialidades) {
                    String especialidadTrimmed = esp.trim();
                    if (especialidadTrimmed.isEmpty()) continue;

                    if (existeInterconsultaParaPaciente(pkAseguradoFinal, especialidadTrimmed)) {
                        log.warn("⚠️ [v1.75.0] Interconsulta de '{}' ya existe para el paciente: {}",
                                especialidadTrimmed, pkAseguradoFinal);
                    } else {
                        crearBolsaInterconsultaConTransaccion(solicitudOriginal, especialidadTrimmed);
                        log.info("✅ [v1.75.0] Nueva bolsa INTERCONSULTA creada para especialidad: '{}'", especialidadTrimmed);
                    }
                }
            }

            log.info("✅ [v1.103.6] Atención registrada completamente - Enfermedades crónicas guardadas en tabla asegurados");
        } catch (Exception e) {
            log.error("❌ [v1.103.6] Error crítico registrando atención: {}", e.getMessage(), e);
            throw new RuntimeException("Error al registrar atención: " + e.getMessage(), e);
        }
    }

    @Transactional
    private void guardarSolicitudConTransaccion(SolicitudBolsa solicitud) {
        solicitudBolsaRepository.save(solicitud);
    }

    @Transactional
    private void crearBolsaRecitaConTransaccion(SolicitudBolsa solicitudOriginal, String especialidad, Integer dias) {
        crearBolsaRecita(solicitudOriginal, especialidad, dias);
    }

    @Transactional
    private void crearBolsaInterconsultaConTransaccion(SolicitudBolsa solicitudOriginal, String especialidad) {
        crearBolsaInterconsulta(solicitudOriginal, especialidad);
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
                .idBolsa(11L) // ✅ v1.103.8: BOLSA_GENERADA_X_PROFESIONAL (id_bolsa=10 conflicta con solicitud original)
                .idServicio(idServicioRecita) // ✅ v1.47.3 Asignar idServicio para permitir selector de médicos
                // ✅ v1.103.9: Sin gestora — va a bolsas/solicitudes para ser asignada, NO a citas-agendadas
                .fechaAsignacion(OffsetDateTime.now())
                .fechaPreferidaNoAtendida(fechaPreferida.toLocalDate()) // ✅ Fecha preferida calculada (hoy + días)
                .idsolicitudgeneracion(solicitudOriginal.getIdSolicitud()) // ✅ FK trazabilidad
                .activo(true)
                .build();

        try {
            solicitudBolsaRepository.save(bolsaRecita);
            log.info("✅ Bolsa RECITA creada: {} - Fecha preferida: {} - idServicio: {}",
                    bolsaRecita.getIdSolicitud(), fechaPreferida, idServicioRecita);
        } catch (Exception e) {
            log.error("❌ [v1.103.5] Error CRÍTICO creando bolsa Recita: {}", e.getMessage(), e);
            throw new RuntimeException("Error creando bolsa de Recita: " + e.getMessage(), e);
        }
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
                .idBolsa(11L) // ✅ v1.75.0: BOLSA_GENERADA_X_PROFESIONAL (correcto para interconsulta)
                              // Antes era 10 (BOLSA_GESTORA) por UNIQUE constraint, resuelto con 1 fila por especialidad
                .idServicio(idServicioInterconsulta) // ✅ v1.47.3 Asignar idServicio para permitir selector de médicos
                // ✅ v1.103.9: Sin gestora — va a bolsas/solicitudes para ser asignada, NO a citas-agendadas
                .fechaAsignacion(OffsetDateTime.now())
                .idsolicitudgeneracion(solicitudOriginal.getIdSolicitud()) // ✅ FK trazabilidad
                .activo(true)
                .build();

        try {
            solicitudBolsaRepository.save(bolsaInterconsulta);
            log.info("✅ Bolsa INTERCONSULTA creada: {} para especialidad: {} - idServicio: {}",
                    bolsaInterconsulta.getIdSolicitud(), especialidad, idServicioInterconsulta);
        } catch (Exception e) {
            log.error("❌ [v1.103.5] Error CRÍTICO creando bolsa Interconsulta: {}", e.getMessage(), e);
            throw new RuntimeException("Error creando bolsa de Interconsulta: " + e.getMessage(), e);
        }
    }

    /**
     * ✅ v1.76.0 / v1.103.7: Guarda los datos de la Ficha de Enfermería en atencion_clinica.
     * Solo persiste si al menos un campo de la ficha tiene valor.
     * v1.103.7: Corregido FK violations (pk_asegurado UUID, id_ipress lookup, id_personal_creador guard)
     */
    private void guardarFichaEnfermeria(AtenderPacienteRequest request,
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

        if (!tieneDatosEnfermeria) {
            log.debug("ℹ️ [v1.76.0] Sin datos de Ficha Enfermería — omitiendo guardado");
            return;
        }

        // ✅ v1.103.7: Obtener id_personal_creador — FK obligatorio
        Long idPersonal = obtenerIdMedicoActual();
        if (idPersonal == null) {
            log.warn("⚠️ [v1.103.7] No se puede guardar Ficha Enfermería: idPersonalCreador es null (médico sin PersonalCnt)");
            return;
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
            return;
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

            ficha = AtencionClinica.builder()
                    .pkAsegurado(asegurado.getPkAsegurado())  // ✅ UUID, no DNI
                    .fechaAtencion(fechaAtencion)
                    .idIpress(idIpress)                        // ✅ FK válido
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
                    .idPersonalCreador(idPersonal)             // ✅ FK válido, garantizado no-null
                    .tieneOrdenInterconsulta(false)
                    .requiereTelemonitoreo(false)
                    .build();

            atencionClinicaRepository.save(ficha);
            log.info("✅ [v1.103.7] Ficha de Enfermería guardada para DNI: {} / UUID: {}",
                    solicitud.getPacienteDni(), asegurado.getPkAsegurado());
        } catch (Exception e) {
            // ✅ v1.103.7: Limpiar entidad de la sesión Hibernate para evitar "null identifier" en flush posterior
            if (ficha != null) {
                try { entityManager.detach(ficha); } catch (Exception ignored) {}
            }
            log.warn("⚠️ [v1.103.7] Error guardando Ficha Enfermería (no bloquea la atención): {}", e.getMessage());
        }
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
