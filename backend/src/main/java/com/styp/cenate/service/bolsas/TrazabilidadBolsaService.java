package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.TrazabilidadBolsaResponseDTO;
import com.styp.cenate.dto.bolsas.TrazabilidadBolsaResponseDTO.EventoTrazabilidadDTO;
import com.styp.cenate.model.PacienteEstrategia;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.PacienteEstrategiaRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * v1.75.0: Servicio que construye el timeline de trazabilidad
 * del ciclo de vida de una solicitud de bolsa.
 *
 * Eventos que reconstruye:
 *  - INGRESO        → fechaSolicitud
 *  - ASIGNACION     → idPersonal asignado
 *  - CITA_AGENDADA  → fechaAtencion + horaAtencion
 *  - CAMBIO_ESTADO  → fechaCambioEstado + descripcionEstado
 *  - ATENCION       → fechaAtencionMedica
 *  - ANULACION      → motivoAnulacion + estadoGestionCitas
 *  - RECITA         → solicitudes derivadas (idsolicitudgeneracion)
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TrazabilidadBolsaService {

    private final SolicitudBolsaRepository    solicitudRepo;
    private final PersonalCntRepository       personalRepo;
    private final PacienteEstrategiaRepository pacienteEstrategiaRepo;

    @Transactional(readOnly = true)
    public TrazabilidadBolsaResponseDTO obtenerTrazabilidad(Long idSolicitud) {
        log.info("📋 [v1.75.0] Trazabilidad solicitada para idSolicitud={}", idSolicitud);

        SolicitudBolsa s = solicitudRepo.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + idSolicitud));

        List<EventoTrazabilidadDTO> eventos = new ArrayList<>();

        // ── 1. INGRESO A BOLSA ─────────────────────────────────────────────
        if (s.getFechaSolicitud() != null) {
            eventos.add(EventoTrazabilidadDTO.builder()
                    .tipo("INGRESO")
                    .fecha(s.getFechaSolicitud())
                    .descripcion("Paciente ingresó a bolsa")
                    .detalle(s.getEspecialidad() != null ? "Especialidad: " + s.getEspecialidad() : null)
                    .color("blue")
                    .build());
        }

        // ── 2. ASIGNACIÓN DE MÉDICO ────────────────────────────────────────
        if (s.getIdPersonal() != null) {
            String nombreMedico = resolverNombreMedico(s.getIdPersonal());
            eventos.add(EventoTrazabilidadDTO.builder()
                    .tipo("ASIGNACION_MEDICO")
                    .fecha(s.getFechaActualizacion())
                    .descripcion("Profesional de salud asignado a la solicitud")
                    .medico(nombreMedico)
                    .color("purple")
                    .build());
        }

        // ── 3. CITA AGENDADA ───────────────────────────────────────────────
        if (s.getFechaAtencion() != null) {
            String detalleCita = "Fecha: " + s.getFechaAtencion();
            if (s.getHoraAtencion() != null) {
                detalleCita += " · Hora: " + s.getHoraAtencion();
            }
            eventos.add(EventoTrazabilidadDTO.builder()
                    .tipo("CITA_AGENDADA")
                    .fecha(s.getFechaCambioEstado() != null ? s.getFechaCambioEstado() : s.getFechaActualizacion())
                    .descripcion("Cita agendada")
                    .medico(s.getIdPersonal() != null ? resolverNombreMedico(s.getIdPersonal()) : null)
                    .detalle(detalleCita)
                    .color("green")
                    .build());
        }

        // ── 4. ATENCIÓN MÉDICA REALIZADA ───────────────────────────────────
        if (s.getFechaAtencionMedica() != null) {
            eventos.add(EventoTrazabilidadDTO.builder()
                    .tipo("ATENCION")
                    .fecha(s.getFechaAtencionMedica())
                    .descripcion("Paciente atendido")
                    .medico(s.getIdPersonal() != null ? resolverNombreMedico(s.getIdPersonal()) : null)
                    .color("green")
                    .build());
        }

        // ── 5. CAMBIO DE ESTADO (gestor) ───────────────────────────────────
        if (s.getFechaCambioEstado() != null && s.getEstadoGestionCitas() != null) {
            String descEstado = s.getEstadoGestionCitas().getDescripcionEstado();
            String colorEstado = resolverColorEstado(s.getEstadoGestionCitas().getCodigoEstado());
            String gestoraStr = s.getGestora() != null ? s.getGestora().getUsername() : null;

            eventos.add(EventoTrazabilidadDTO.builder()
                    .tipo("CAMBIO_ESTADO")
                    .fecha(s.getFechaCambioEstado())
                    .descripcion("Estado actualizado: " + descEstado)
                    .medico(gestoraStr)
                    .estado(descEstado)
                    .color(colorEstado)
                    .build());
        }

        // ── 6. ANULACIÓN ───────────────────────────────────────────────────
        if (s.getMotivoAnulacion() != null && !s.getMotivoAnulacion().isBlank()) {
            eventos.add(EventoTrazabilidadDTO.builder()
                    .tipo("ANULACION")
                    .fecha(s.getFechaCambioEstado() != null ? s.getFechaCambioEstado() : s.getFechaActualizacion())
                    .descripcion("Cita anulada")
                    .detalle("Motivo: " + s.getMotivoAnulacion())
                    .color("red")
                    .build());
        }

        // ── 7. RECITAS / INTERCONSULTAS DERIVADAS ─────────────────────────
        List<SolicitudBolsa> derivadas = solicitudRepo
                .findByIdsolicitudgeneracionOrderByFechaSolicitudAsc(idSolicitud);

        for (SolicitudBolsa d : derivadas) {
            String tipoDerivada = d.getTipoCita() != null ? d.getTipoCita() : "Derivada";
            String detalle = d.getEspecialidad() != null ? "Especialidad: " + d.getEspecialidad() : null;
            eventos.add(EventoTrazabilidadDTO.builder()
                    .tipo("RECITA")
                    .fecha(d.getFechaSolicitud())
                    .descripcion(tipoDerivada + " generada (Sol. #" + d.getNumeroSolicitud() + ")")
                    .detalle(detalle)
                    .color("orange")
                    .build());
        }

        // ── 8. EVENTOS CENACRON (inscripción y baja del programa) ─────────
        // Busca por pk_asegurado = DNI del paciente en la solicitud de bolsa
        if (s.getPacienteDni() != null && !s.getPacienteDni().isBlank()) {
            try {
                List<PacienteEstrategia> cenacronEvts = pacienteEstrategiaRepo
                        .findHistorialPorPkAseguradoYSigla(s.getPacienteDni(), "CENACRON");

                for (PacienteEstrategia pe : cenacronEvts) {
                    // 8a. Ingreso al programa CENACRON
                    if (pe.getFechaAsignacion() != null) {
                        String responsableIngreso = pe.getUsuarioAsigno() != null
                                ? pe.getUsuarioAsigno().getNombreCompleto()
                                : null;
                        eventos.add(EventoTrazabilidadDTO.builder()
                                .tipo("CENACRON_INGRESO")
                                .fecha(pe.getFechaAsignacion().atOffset(java.time.ZoneOffset.of("-05:00")))
                                .descripcion("Inscripción al programa CENACRON")
                                .medico(responsableIngreso)
                                .estado("ACTIVO")
                                .color("purple")
                                .build());
                    }

                    // 8b. Baja del programa CENACRON (si ya no está activo)
                    if (!"ACTIVO".equals(pe.getEstado()) && pe.getFechaDesvinculacion() != null) {
                        String responsableBaja = pe.getUsuarioDesvinculo() != null
                                ? pe.getUsuarioDesvinculo().getNombreCompleto()
                                : null;
                        String tipoBajaDesc = "INACTIVO".equals(pe.getEstado())
                                ? "Baja total del programa"
                                : "Completó especialidad";
                        String detalleMotivo = pe.getObservacionDesvinculacion() != null
                                && !pe.getObservacionDesvinculacion().isBlank()
                                ? "Motivo: " + pe.getObservacionDesvinculacion()
                                : tipoBajaDesc;

                        eventos.add(EventoTrazabilidadDTO.builder()
                                .tipo("CENACRON_BAJA")
                                .fecha(pe.getFechaDesvinculacion().atOffset(java.time.ZoneOffset.of("-05:00")))
                                .descripcion("Salida del programa CENACRON")
                                .medico(responsableBaja)
                                .estado(pe.getEstado())
                                .detalle(detalleMotivo)
                                .color("orange")
                                .build());
                    }
                }
            } catch (Exception ex) {
                log.warn("⚠️ No se pudieron cargar eventos CENACRON para solicitud {}: {}", idSolicitud, ex.getMessage());
            }
        }

        // ── Ordenar por fecha ascendente ───────────────────────────────────
        eventos.sort(Comparator.comparing(
                EventoTrazabilidadDTO::getFecha,
                Comparator.nullsLast(Comparator.naturalOrder())
        ));

        String estadoActual = s.getEstadoGestionCitas() != null
                ? s.getEstadoGestionCitas().getDescripcionEstado()
                : s.getEstado();

        log.info("✅ [v1.75.0] Timeline generado con {} eventos para idSolicitud={}", eventos.size(), idSolicitud);

        return TrazabilidadBolsaResponseDTO.builder()
                .idSolicitud(s.getIdSolicitud())
                .numeroSolicitud(s.getNumeroSolicitud())
                .pacienteDni(s.getPacienteDni())
                .pacienteNombre(s.getPacienteNombre())
                .estadoActual(s.getEstado())
                .descripcionEstadoActual(estadoActual)
                .timeline(eventos)
                .build();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private String resolverNombreMedico(Long idPersonal) {
        try {
            return personalRepo.findById(idPersonal)
                    .map(PersonalCnt::getNombreCompleto)
                    .orElse("Personal #" + idPersonal);
        } catch (Exception e) {
            return "Personal #" + idPersonal;
        }
    }

    private String resolverColorEstado(String codigo) {
        if (codigo == null) return "gray";
        return switch (codigo.toUpperCase()) {
            case "CITADO"            -> "green";
            case "ATENDIDO_IPRESS"   -> "green";
            case "PENDIENTE_CITA"    -> "blue";
            case "NO_CONTESTA",
                 "APAGADO",
                 "TEL_SIN_SERVICIO",
                 "NUM_NO_EXISTE"     -> "orange";
            case "NO_DESEA",
                 "HC_BLOQUEADA",
                 "SIN_VIGENCIA",
                 "REPROG_FALLIDA"   -> "red";
            default                  -> "gray";
        };
    }
}
