package com.styp.cenate.repository.disponibilidad;

import com.styp.cenate.model.SolicitudDisponibilidadMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de SolicitudDisponibilidadMedico
 */
@Repository
public interface SolicitudDisponibilidadRepository extends JpaRepository<SolicitudDisponibilidadMedico, Long> {

    /**
     * Obtiene todas las solicitudes de un médico ordenadas por fecha de creación
     */
    @Query("SELECT s FROM SolicitudDisponibilidadMedico s WHERE s.personal.idPers = :idPersonal ORDER BY s.createdAt DESC")
    List<SolicitudDisponibilidadMedico> findByPersonal_IdPersOrderByCreatedAtDesc(@Param("idPersonal") Long idPersonal);

    /**
     * Obtiene todas las solicitudes de un período
     */
    @Query("SELECT s FROM SolicitudDisponibilidadMedico s WHERE s.periodo.idPeriodoRegDisp = :idPeriodo ORDER BY s.personal.idPers, s.createdAt DESC")
    List<SolicitudDisponibilidadMedico> findByPeriodo_IdPeriodoOrderByCreatedAtDesc(@Param("idPeriodo") Long idPeriodo);

    /**
     * Obtiene una solicitud por ID
     */
    Optional<SolicitudDisponibilidadMedico> findById(Long idSolicitud);

    /**
     * Obtiene las solicitudes de un médico en un período
     */
    @Query("SELECT s FROM SolicitudDisponibilidadMedico s WHERE s.personal.idPers = :idPersonal AND s.periodo.idPeriodoRegDisp = :idPeriodo")
    List<SolicitudDisponibilidadMedico> findByPersonal_IdPersAndPeriodo_IdPeriodo(
            @Param("idPersonal") Long idPersonal,
            @Param("idPeriodo") Long idPeriodo);

    /**
     * Obtiene la solicitud de un médico en un período con estado específico
     */
    @Query("SELECT s FROM SolicitudDisponibilidadMedico s WHERE s.personal.idPers = :idPersonal AND s.periodo.idPeriodoRegDisp = :idPeriodo AND s.estado = :estado")
    Optional<SolicitudDisponibilidadMedico> findByPersonal_IdPersAndPeriodo_IdPeriodoAndEstado(
            @Param("idPersonal") Long idPersonal,
            @Param("idPeriodo") Long idPeriodo,
            @Param("estado") String estado);

    /**
     * Obtiene solicitudes por estado
     */
    @Query("SELECT s FROM SolicitudDisponibilidadMedico s WHERE s.estado = :estado ORDER BY s.createdAt DESC")
    List<SolicitudDisponibilidadMedico> findByEstadoOrderByCreatedAtDesc(@Param("estado") String estado);

    /**
     * Obtiene solicitudes de un médico por estado
     */
    @Query("SELECT s FROM SolicitudDisponibilidadMedico s WHERE s.personal.idPers = :idPersonal AND s.estado = :estado ORDER BY s.createdAt DESC")
    List<SolicitudDisponibilidadMedico> findByPersonal_IdPersAndEstadoOrderByCreatedAtDesc(
            @Param("idPersonal") Long idPersonal,
            @Param("estado") String estado);

    /**
     * Cuenta solicitudes activas de un médico
     */
    @Query("SELECT COUNT(s) FROM SolicitudDisponibilidadMedico s WHERE s.personal.idPers = :idPersonal AND s.estado IN ('BORRADOR', 'ENVIADO')")
    Long countActivasByPersonal_IdPers(@Param("idPersonal") Long idPersonal);
}
