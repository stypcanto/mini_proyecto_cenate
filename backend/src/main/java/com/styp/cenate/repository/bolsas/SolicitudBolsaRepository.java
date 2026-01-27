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
    boolean existsByIdTipoBolsaAndPacienteId(
        Long idTipoBolsa,
        Long pacienteId
    );

    /**
     * Busca solicitudes por bolsa (activas)
     */
    List<SolicitudBolsa> findByIdTipoBolsaAndActivoTrue(Long idTipoBolsa);

    /**
     * Busca solicitudes por estado de cita (activas)
     */
    List<SolicitudBolsa> findByEstadoGestionCitasIdAndActivoTrue(Long estadoId);

    /**
     * Obtiene todas las solicitudes activas ordenadas por fecha más reciente
     */
    List<SolicitudBolsa> findByActivoTrueOrderByFechaSolicitudDesc();

    /**
     * Busca solicitud por DNI del paciente (activas)
     */
    List<SolicitudBolsa> findByPacienteDniAndActivoTrue(String pacienteDni);

    /**
     * Obtiene todas las solicitudes ENRIQUECIDAS con datos de tablas de referencia via SQL nativo
     * Incluye JOINs a: dim_tipos_bolsas, dim_servicio_essi, dim_ipress, dim_red, dim_estados_gestion_citas
     *
     * v2.1.0 - Recupera denormalizaciones via JOINs en lugar de almacenarlas en BD
     */
    @Query(value = """
        SELECT
            sb.id_solicitud,
            sb.numero_solicitud,
            sb.paciente_id,
            sb.paciente_nombre,
            sb.paciente_dni,
            sb.especialidad,
            sb.fecha_preferida_no_atendida,
            sb.tipo_documento,
            sb.fecha_nacimiento,
            sb.paciente_sexo,
            sb.paciente_telefono,
            sb.paciente_email,
            sb.paciente_edad,
            sb.codigo_ipress,
            sb.tipo_cita,
            sb.id_tipo_bolsa,
            COALESCE(dtb.cod_tipo_bolsa, '') as cod_tipo_bolsa,
            COALESCE(dtb.desc_tipo_bolsa, '') as desc_tipo_bolsa,
            sb.id_servicio,
            COALESCE(dse.cod_servicio, '') as cod_servicio,
            COALESCE(dse.desc_servicio, '') as desc_servicio,
            sb.codigo_adscripcion,
            sb.id_ipress,
            COALESCE(di.cod_ipress, '') as cod_ipress,
            COALESCE(di.desc_ipress, '') as desc_ipress,
            COALESCE(di.desc_ipress, '') as nombre_ipress,
            COALESCE(dr.desc_red, '') as red_asistencial,
            COALESCE(dr.cod_red, '') as cod_red,
            sb.estado,
            sb.fecha_solicitud,
            sb.fecha_actualizacion,
            sb.estado_gestion_citas_id,
            COALESCE(egc.cod_estado_cita, '') as cod_estado_cita,
            COALESCE(egc.desc_estado_cita, '') as desc_estado_cita,
            sb.activo
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_tipos_bolsas dtb ON sb.id_tipo_bolsa = dtb.id_tipo_bolsa
        LEFT JOIN dim_servicio_essi dse ON sb.id_servicio = dse.id_servicio
        LEFT JOIN dim_ipress di ON sb.id_ipress = di.id_ipress
        LEFT JOIN dim_red dr ON di.id_red = dr.id_red
        LEFT JOIN dim_estados_gestion_citas egc ON sb.estado_gestion_citas_id = egc.id_estado_cita
        WHERE sb.activo = true
        ORDER BY sb.fecha_solicitud DESC
    """, nativeQuery = true)
    List<SolicitudBolsaDTO> obtenerSolicitudesEnriquecidas();
}
