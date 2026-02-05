package com.styp.cenate.service.bolsas;

import com.styp.cenate.exception.SincronizacionException;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.model.chatbot.SolicitudCita;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
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

    private static final Long ESTADO_ATENDIDO_IPRESS_ID = 2L;

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
                return false;
            }

            // 2. Actualizar TODOS los registros activos del paciente
            int actualizados = 0;
            for (SolicitudBolsa solicitudBolsa : solicitudesEnBolsa) {

                // Validar: solo actualizar si NO está ya ATENDIDO
                if (ESTADO_ATENDIDO_IPRESS_ID.equals(
                    solicitudBolsa.getEstadoGestionCitasId())) {
                    log.info("ℹ️  [SINCRONIZACIÓN] Solicitud {} ya está en estado ATENDIDO, saltando",
                        solicitudBolsa.getIdSolicitud());
                    continue;
                }

                // Actualizar estado
                solicitudBolsa.setEstadoGestionCitasId(ESTADO_ATENDIDO_IPRESS_ID);

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
            }

            log.info("🎉 [SINCRONIZACIÓN] Completada exitosamente. Registros actualizados: {}",
                actualizados);
            return true;

        } catch (Exception e) {
            log.error(
                "❌ [SINCRONIZACIÓN] Error al sincronizar estado ATENDIDO para DNI {}: {}",
                dni, e.getMessage(), e);

            throw new SincronizacionException(
                "Error al sincronizar estado ATENDIDO: " + e.getMessage(), e
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
