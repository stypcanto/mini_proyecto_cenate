package com.styp.cenate.repository.bolsas;

import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
     * Obtiene todas las solicitudes ENRIQUECIDAS con datos de tablas de referencia
     * Incluye JOINs a: dim_tipos_bolsas, dim_servicio_essi, dim_ipress, dim_red, dim_estados_gestion_citas
     *
     * v2.1.0 - Recupera denormalizaciones via JOINs en lugar de almacenarlas en BD
     */
    @Query("""
        SELECT new com.styp.cenate.dto.bolsas.SolicitudBolsaDTO(
            sb.idSolicitud,
            sb.numeroSolicitud,
            sb.pacienteId,
            sb.pacienteNombre,
            sb.pacienteDni,
            sb.especialidad,
            sb.fechaPreferidaNoAtendida,
            sb.tipoDocumento,
            sb.fechaNacimiento,
            sb.pacienteSexo,
            sb.pacienteTelefono,
            sb.pacienteEmail,
            sb.pacienteEdad,
            sb.codigoIpressAdscripcion,
            sb.tipoCita,
            sb.idTipoBolsa,
            dtb.codTipoBolsa,
            dtb.descTipoBolsa,
            sb.idServicio,
            dse.codServicio,
            dse.descServicio,
            sb.codigoAdscripcion,
            sb.idIpress,
            di.codIpress,
            di.descIpress,
            di.descIpress,
            dr.descripcion,
            dr.codigo,
            sb.estado,
            sb.fechaSolicitud,
            sb.fechaActualizacion,
            sb.estadoGestionCitasId,
            egc.codEstadoCita,
            egc.descEstadoCita,
            sb.activo
        )
        FROM SolicitudBolsa sb
        LEFT JOIN TipoBolsa dtb ON sb.idTipoBolsa = dtb.idTipoBolsa
        LEFT JOIN DimServicioEssi dse ON sb.idServicio = dse.idServicio
        LEFT JOIN Ipress di ON sb.idIpress = di.idIpress
        LEFT JOIN Red dr ON di.red.id = dr.id
        LEFT JOIN EstadoGestionCita egc ON sb.estadoGestionCitasId = egc.idEstadoCita
        WHERE sb.activo = true
        ORDER BY sb.fechaSolicitud DESC
    """)
    List<SolicitudBolsaDTO> obtenerSolicitudesEnriquecidas();
}
