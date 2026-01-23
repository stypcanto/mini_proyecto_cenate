package com.styp.cenate.repository.bolsas;

import com.styp.cenate.model.bolsas.SolicitudBolsa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para acceso a datos de solicitudes de bolsa
 * Proporciona métodos CRUD + consultas personalizadas
 * 
 * @version v1.6.0
 * @since 2026-01-23
 */
@Repository
public interface SolicitudBolsaRepository extends JpaRepository<SolicitudBolsa, Long> {

    /**
     * Busca una solicitud por su número único
     */
    Optional<SolicitudBolsa> findByNumeroSolicitud(String numeroSolicitud);

    /**
     * Verifica si ya existe una solicitud duplicada
     * por la combinación única: bolsa + paciente
     */
    boolean existsByIdBolsaAndPacienteId(
        Long idBolsa,
        Long pacienteId
    );

    /**
     * Busca solicitudes por bolsa (activas)
     */
    List<SolicitudBolsa> findByIdBolsaAndActivoTrue(Long idBolsa);

    /**
     * Busca solicitudes por estado de cita (activas)
     */
    List<SolicitudBolsa> findByEstadoGestionCitasIdAndActivoTrue(Long estadoId);

    /**
     * Busca solicitudes asignadas a una gestora específica (activas)
     */
    List<SolicitudBolsa> findByResponsableGestoraIdAndActivoTrue(Long gestoraId);

    /**
     * Obtiene todas las solicitudes activas ordenadas por fecha más reciente
     */
    List<SolicitudBolsa> findByActivoTrueOrderByFechaSolicitudDesc();

    /**
     * Busca solicitud por DNI del paciente (activas)
     */
    List<SolicitudBolsa> findByPacienteDniAndActivoTrue(String pacienteDni);

    /**
     * Busca solicitudes por solicitante (activas)
     */
    List<SolicitudBolsa> findBySolicitanteIdAndActivoTrue(Long solicitanteId);
}
