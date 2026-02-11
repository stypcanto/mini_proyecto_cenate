package com.styp.cenate.service.trazabilidad;

import com.styp.cenate.dto.trazabilidad.RegistroAtencionDTO;
import com.styp.cenate.dto.trazabilidad.SignosVitalesDTO;
import com.styp.cenate.model.AtencionClinica;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.TeleECGImagen;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.AtencionClinicaRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.TeleECGImagenRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * ✅ v1.81.0: Servicio Centralizado de Trazabilidad Clínica Universal
 *
 * Responsabilidades:
 * - Registro automático de TODAS las atenciones médicas en atencion_clinica
 * - Sincronización bidireccional MisPacientes ↔ IPRESS Workspace ↔ Gestión Citas
 * - Historial completo del asegurado accesible desde cualquier módulo
 * - Trazabilidad total sin importar especialidad ni momento de atención
 *
 * Características:
 * - Transacción independiente (REQUIRES_NEW) para no afectar transacción principal
 * - Logging detallado para diagnóstico
 * - Normalización DNI automática
 * - Sincronización estado ECG: ENVIADA → ATENDIDA
 * - Validaciones y manejo de excepciones
 *
 * @author Claude Code
 * @version 1.81.0
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TrazabilidadClinicaService {

    private final AtencionClinicaRepository atencionClinicaRepository;
    private final AseguradoRepository aseguradoRepository;
    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final TeleECGImagenRepository teleECGImagenRepository;

    // =====================================================================
    // MÉTODO PRINCIPAL: REGISTRAR ATENCIÓN EN HISTORIAL
    // =====================================================================

    /**
     * ✅ v1.81.0: Registra atención médica en historial centralizado
     * Este método DEBE ser llamado por TODOS los módulos que registren atenciones
     *
     * @param request DTO con datos de atención a registrar
     * @return AtencionClinica registrada, null si hay error
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AtencionClinica registrarAtencionEnHistorial(RegistroAtencionDTO request) {
        log.info("📋 [v1.81.0] Registrando atención en historial - DNI: {}, Origen: {}",
                 request.getDniAsegurado(), request.getOrigenModulo());

        try {
            // 1. Obtener asegurado por DNI
            Asegurado asegurado = aseguradoRepository.findByDocPaciente(request.getDniAsegurado())
                    .orElseThrow(() -> new RuntimeException("Asegurado no encontrado: " + request.getDniAsegurado()));

            // 2. Construir registro de atención
            AtencionClinica atencion = AtencionClinica.builder()
                    .pkAsegurado(asegurado.getPkAsegurado())
                    .fechaAtencion(request.getFechaAtencion() != null ? request.getFechaAtencion() : OffsetDateTime.now())
                    .idIpress(request.getIdIpress())
                    .idEspecialidad(request.getIdEspecialidad())
                    .idServicio(request.getIdServicio())
                    .idPersonalCreador(request.getIdMedico())
                    .motivoConsulta(request.getMotivoConsulta())
                    .diagnostico(request.getDiagnostico())
                    .tratamiento(request.getTratamiento())
                    .observacionesGenerales(construirObservacionesConOrigen(request))
                    .cie10Codigo(request.getCie10Codigo())
                    .idTipoAtencion(determinarTipoAtencion(request.getOrigenModulo()))
                    .idEstrategia(request.getIdEstrategia())
                    .build();

            // 3. Agregar signos vitales si vienen
            if (request.getSignosVitales() != null) {
                mapearSignosVitales(atencion, request.getSignosVitales());
            }

            // 4. Guardar en historial
            AtencionClinica saved = atencionClinicaRepository.save(atencion);

            log.info("✅ [v1.81.0] Atención registrada en historial - ID: {}, Asegurado: {}, Origen: {}",
                     saved.getIdAtencion(), asegurado.getPkAsegurado(), request.getOrigenModulo());

            return saved;
        } catch (Exception e) {
            log.error("❌ [v1.81.0] Error registrando atención en historial para DNI: {}",
                      request.getDniAsegurado(), e);
            // No propagar excepción para evitar rollback de la transacción principal
            return null;
        }
    }

    // =====================================================================
    // MÉTODO ESPECIALIZADO: REGISTRAR DESDE MIS PACIENTES
    // =====================================================================

    /**
     * ✅ v1.81.0: Registra atención desde Mis Pacientes
     *
     * @param idSolicitud ID de solicitud en dim_solicitud_bolsa
     * @param observaciones Observaciones adicionales
     * @param idMedico ID del médico que atiende
     */
    public void registrarDesdeMisPacientes(Long idSolicitud, String observaciones, Long idMedico) {
        log.info("🔍 [v1.81.0] Registrando atención desde MisPacientes - Solicitud: {}", idSolicitud);

        try {
            SolicitudBolsa solicitud = solicitudBolsaRepository.findById(idSolicitud)
                    .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + idSolicitud));

            RegistroAtencionDTO registro = RegistroAtencionDTO.builder()
                    .dniAsegurado(solicitud.getPacienteDni())
                    .origenModulo("MIS_PACIENTES")
                    .idReferenciaOrigen(idSolicitud)
                    .fechaAtencion(OffsetDateTime.now())
                    .idIpress(solicitud.getIdIpress())
                    .idMedico(idMedico)
                    .motivoConsulta("Atención programada desde Mis Pacientes - " + solicitud.getTipoBolsa())
                    .diagnostico(solicitud.getCondicionMedica())
                    .observacionesGenerales(observaciones != null ? observaciones : solicitud.getObservacionesMedicas())
                    .build();

            registrarAtencionEnHistorial(registro);
        } catch (Exception e) {
            log.error("❌ [v1.81.0] Error registrando desde MisPacientes", e);
        }
    }

    // =====================================================================
    // MÉTODO ESPECIALIZADO: REGISTRAR Y SINCRONIZAR DESDE TELEECG
    // =====================================================================

    /**
     * ✅ v1.81.0: Registra atención desde TeleECG
     * ADEMÁS sincroniza estado a ATENDIDA en tele_ecg_imagenes
     *
     * @param dniPaciente DNI del paciente (puede tener ceros iniciales)
     * @param idMedico ID del cardiólogo que evalúa
     */
    public void registrarDesdeTeleECG(String dniPaciente, Long idMedico) {
        log.info("🔍 [v1.81.0] Registrando y sincronizando TeleECG - DNI: {}", dniPaciente);

        try {
            // 1. Normalizar DNI (remover ceros iniciales)
            String dniNormalizado = dniPaciente.replaceAll("^0+(?!$)", "");
            log.debug("📋 [v1.81.0] DNI original: {}, normalizado: {}", dniPaciente, dniNormalizado);

            // 2. Buscar ECGs del paciente (con/sin ceros iniciales)
            List<TeleECGImagen> ecgs = teleECGImagenRepository
                    .findByNumDocPacienteOrderByFechaEnvioDesc(dniPaciente);

            if (ecgs.isEmpty() && !dniPaciente.equals(dniNormalizado)) {
                log.debug("🔄 [v1.81.0] Reintentando con DNI normalizado: {}", dniNormalizado);
                ecgs = teleECGImagenRepository
                        .findByNumDocPacienteOrderByFechaEnvioDesc(dniNormalizado);
            }

            log.info("📊 [v1.81.0] Encontrados {} ECGs para DNI {}/{}",
                     ecgs.size(), dniPaciente, dniNormalizado);

            if (ecgs.isEmpty()) {
                log.warn("⚠️ [v1.81.0] No se encontraron ECGs para sincronizar - DNI: {}", dniPaciente);
                return;
            }

            int actualizados = 0;
            for (TeleECGImagen ecg : ecgs) {
                if ("ENVIADA".equalsIgnoreCase(ecg.getEstado())) {
                    // 3. Actualizar estado a ATENDIDA
                    ecg.setEstado("ATENDIDA");
                    ecg.setIdUsuarioEvaluador(idMedico);
                    ecg.setFechaEvaluacion(OffsetDateTime.now());
                    teleECGImagenRepository.save(ecg);
                    actualizados++;

                    log.info("✅ [v1.81.0] ECG {} actualizado: ENVIADA → ATENDIDA", ecg.getIdImagen());

                    // 4. Registrar en historial centralizado
                    RegistroAtencionDTO registro = RegistroAtencionDTO.builder()
                            .dniAsegurado(ecg.getNumDocPaciente())
                            .origenModulo("TELEECG_IPRESS")
                            .idReferenciaOrigen(ecg.getIdImagen())
                            .fechaAtencion(OffsetDateTime.now())
                            .idIpress(ecg.getIpressOrigen() != null ? ecg.getIpressOrigen().getIdIpress() : null)
                            .idMedico(idMedico)
                            .motivoConsulta("Evaluación de electrocardiograma")
                            .diagnostico(ecg.getDescripcionEvaluacion())
                            .tratamiento(ecg.getNotaClinicaPlan())
                            .observacionesGenerales(construirObservacionesECG(ecg))
                            .build();

                    registrarAtencionEnHistorial(registro);
                }
            }

            log.info("📊 [v1.81.0] Total ECGs actualizados y registrados: {}/{}", actualizados, ecgs.size());

        } catch (Exception e) {
            log.error("❌ [v1.81.0] Error en sincronización TeleECG", e);
        }
    }

    // =====================================================================
    // MÉTODOS HELPER PRIVADOS
    // =====================================================================

    /**
     * Construye observaciones incluyendo origen del registro
     */
    private String construirObservacionesConOrigen(RegistroAtencionDTO request) {
        StringBuilder obs = new StringBuilder();
        obs.append("Origen: ").append(request.getOrigenModulo()).append("\n");
        if (request.getIdReferenciaOrigen() != null) {
            obs.append("ID Referencia: ").append(request.getIdReferenciaOrigen()).append("\n");
        }
        if (request.getObservacionesGenerales() != null) {
            obs.append("\n").append(request.getObservacionesGenerales());
        }
        return obs.toString();
    }

    /**
     * Construye observaciones desde datos ECG
     */
    private String construirObservacionesECG(TeleECGImagen ecg) {
        StringBuilder obs = new StringBuilder();
        obs.append("Evaluación ECG\n");
        obs.append("ID Imagen: ").append(ecg.getIdImagen()).append("\n");
        obs.append("Evaluación: ").append(ecg.getEvaluacion()).append("\n");
        if (ecg.getNotaClinicaHallazgos() != null) {
            obs.append("Hallazgos: ").append(ecg.getNotaClinicaHallazgos()).append("\n");
        }
        if (ecg.getNotaClinicaObservaciones() != null) {
            obs.append("Observaciones: ").append(ecg.getNotaClinicaObservaciones()).append("\n");
        }
        return obs.toString();
    }

    /**
     * Determina tipo de atención basado en módulo de origen
     */
    private Long determinarTipoAtencion(String origenModulo) {
        return switch (origenModulo) {
            case "MIS_PACIENTES" -> 1L; // Teleconsulta
            case "TELEECG_IPRESS" -> 2L; // Teleasistencia (lectura ECG)
            case "GESTION_CITAS" -> 1L; // Teleconsulta
            default -> null;
        };
    }

    /**
     * Mapea signos vitales del DTO a la entidad
     */
    private void mapearSignosVitales(AtencionClinica atencion, SignosVitalesDTO signos) {
        if (signos == null) {
            return;
        }

        if (signos.getPresionArterial() != null) {
            atencion.setPresionArterial(signos.getPresionArterial());
        }

        if (signos.getTemperatura() != null) {
            atencion.setTemperatura(signos.getTemperatura());
        }

        if (signos.getPesoKg() != null) {
            atencion.setPesoKg(signos.getPesoKg());
        }

        if (signos.getFrecuenciaCardiaca() != null) {
            atencion.setFrecuenciaCardiaca(signos.getFrecuenciaCardiaca().longValue());
        }

        if (signos.getSaturacionO2() != null) {
            atencion.setSaturacionO2(signos.getSaturacionO2().longValue());
        }
    }
}
