package com.styp.cenate.service.bolsas;

import com.styp.cenate.constants.EstadosCitaConstants;
import com.styp.cenate.exception.SincronizacionException;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.model.chatbot.SolicitudCita;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.service.auditlog.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Implementación del servicio de sincronización de estados entre solicitud_cita y dim_solicitud_bolsa
 *
 * v1.43.0 - Sincronización automática cuando médico marca ATENDIDO
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class SincronizacionBolsaServiceImpl implements SincronizacionBolsaService {

    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditLogService auditLogService;

    @Override
    public boolean sincronizarEstadoAtendido(SolicitudCita solicitudCita) {
        String dni = solicitudCita.getDocPaciente();
        log.info("🔄 [SINCRONIZACIÓN] Iniciando sincronización para DNI: {}", dni);

        try {
            // 1. Buscar en dim_solicitud_bolsa por DNI (puede haber múltiples registros)
            List<SolicitudBolsa> solicitudesEnBolsa =
                solicitudBolsaRepository.findByPacienteDniAndActivoTrue(dni);

            if (solicitudesEnBolsa.isEmpty()) {
                log.warn("⚠️  [SINCRONIZACIÓN] Paciente DNI {} no encontrado en dim_solicitud_bolsa",
                    dni);

                // Auditar: paciente no encontrado (advertencia, no error)
                auditLogService.registrarEvento(
                    obtenerUsuarioActual().map(u -> u.getNameUser()).orElse("SISTEMA"),
                    "SINCRONIZAR_ESTADO_ATENDIDO",
                    "SINCRONIZACION_BOLSA",
                    "Paciente DNI " + dni + " no encontrado en dim_solicitud_bolsa",
                    "ADVERTENCIA",
                    "COMPLETADO"
                );

                return false;
            }

            // 2. Actualizar TODOS los registros activos del paciente
            int actualizados = 0;
            for (SolicitudBolsa solicitudBolsa : solicitudesEnBolsa) {

                // Validar: solo actualizar si NO está ya ATENDIDO
                if (EstadosCitaConstants.BOLSA_ATENDIDO_IPRESS.equals(
                    solicitudBolsa.getEstadoGestionCitasId())) {
                    log.info("ℹ️  [SINCRONIZACIÓN] Solicitud {} ya está en estado ATENDIDO, saltando",
                        solicitudBolsa.getIdSolicitud());
                    continue;
                }

                // Actualizar estado
                solicitudBolsa.setEstadoGestionCitasId(EstadosCitaConstants.BOLSA_ATENDIDO_IPRESS);

                // Guardar fecha y hora de atención
                solicitudBolsa.setFechaAtencion(solicitudCita.getFechaCita());
                solicitudBolsa.setHoraAtencion(solicitudCita.getHoraCita());

                // Guardar médico que atendió
                if (solicitudCita.getPersonal() != null) {
                    solicitudBolsa.setIdPersonal(solicitudCita.getPersonal().getIdPers());
                }

                // Auditoría: registrar quién y cuándo cambió el estado
                solicitudBolsa.setFechaCambioEstado(OffsetDateTime.now());

                // Obtener usuario del contexto de seguridad
                obtenerUsuarioActual().ifPresent(usuario ->
                    solicitudBolsa.setUsuarioCambioEstadoId(usuario.getIdUser())
                );

                // Guardar en BD
                solicitudBolsaRepository.save(solicitudBolsa);
                actualizados++;

                log.info("✅ [SINCRONIZACIÓN] Solicitud {} actualizada a ATENDIDO_IPRESS (Médico: {}, DNI: {})",
                    solicitudBolsa.getIdSolicitud(),
                    solicitudCita.getPersonal() != null ?
                        solicitudCita.getPersonal().getIdPers() : "N/A",
                    dni);

                // Auditar: sincronización exitosa
                auditLogService.registrarEvento(
                    obtenerUsuarioActual().map(u -> u.getNameUser()).orElse("SISTEMA"),
                    "SINCRONIZAR_ESTADO_ATENDIDO",
                    "SINCRONIZACION_BOLSA",
                    String.format(
                        "Sincronización exitosa: solicitud_cita %d → dim_solicitud_bolsa %d (DNI: %s, Médico: %d)",
                        solicitudCita.getIdSolicitud(),
                        solicitudBolsa.getIdSolicitud(),
                        dni,
                        solicitudCita.getPersonal() != null ?
                            solicitudCita.getPersonal().getIdPers() : null
                    ),
                    "INFO",
                    "COMPLETADO"
                );
            }

            log.info("🎉 [SINCRONIZACIÓN] Completada exitosamente. Registros actualizados: {}",
                actualizados);

            // Auditar: sincronización completada
            if (actualizados > 0) {
                auditLogService.registrarEvento(
                    obtenerUsuarioActual().map(u -> u.getNameUser()).orElse("SISTEMA"),
                    "SINCRONIZAR_ESTADO_ATENDIDO",
                    "SINCRONIZACION_BOLSA",
                    "Sincronización completada: " + actualizados + " registros actualizados para DNI " + dni,
                    "INFO",
                    "COMPLETADO"
                );
            }

            return true;

        } catch (SincronizacionException e) {
            // Excepciones esperadas de sincronización (ej: paciente no existe)
            log.warn(
                "⚠️  [SINCRONIZACIÓN] Sincronización fallida (esperado) para DNI {}: {}",
                dni, e.getMessage());

            auditLogService.registrarEvento(
                obtenerUsuarioActual().map(u -> u.getNameUser()).orElse("SISTEMA"),
                "SINCRONIZAR_ESTADO_ATENDIDO",
                "SINCRONIZACION_BOLSA",
                "Sincronización fallida: " + e.getMessage() + " (DNI: " + dni + ")",
                "ADVERTENCIA",
                "ERROR"
            );

            throw e;

        } catch (Exception e) {
            // Errores inesperados (BD caída, constraint violations, etc.)
            log.error(
                "❌ CRITICAL [SINCRONIZACIÓN] Error inesperado al sincronizar DNI {}: {}",
                dni, e.getMessage(), e);

            auditLogService.registrarEvento(
                obtenerUsuarioActual().map(u -> u.getNameUser()).orElse("SISTEMA"),
                "SINCRONIZAR_ESTADO_ATENDIDO",
                "SINCRONIZACION_BOLSA",
                "ERROR CRÍTICO: " + e.getClass().getSimpleName() + " - " + e.getMessage() + " (DNI: " + dni + ")",
                "ERROR",
                "ERROR"
            );

            // Re-lanzar como SincronizacionException para que el caller lo maneje
            throw new SincronizacionException(
                "Error crítico al sincronizar estado ATENDIDO: " + e.getMessage(), e
            );
        }
    }

    /**
     * Obtiene el usuario actualmente autenticado desde el contexto de seguridad
     */
    private Optional<com.styp.cenate.model.Usuario> obtenerUsuarioActual() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                String username = auth.getName();
                return usuarioRepository.findByNameUser(username);
            }
        } catch (Exception e) {
            log.warn("⚠️  Error obteniendo usuario del contexto de seguridad: {}", e.getMessage());
        }
        return Optional.empty();
    }
}
