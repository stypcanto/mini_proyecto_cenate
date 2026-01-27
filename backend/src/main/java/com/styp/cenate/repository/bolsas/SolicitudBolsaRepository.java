package com.styp.cenate.repository.bolsas;

import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
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
     * Obtiene todas las solicitudes activas ordenadas por fecha más reciente
     */
    List<SolicitudBolsa> findByActivoTrueOrderByFechaSolicitudDesc();

    /**
     * Obtiene solicitudes con descripción de bolsa via JOIN
     * Consulta SQL nativa para traer solicitudes enriquecidas con el tipo de bolsa
     */
    @Query(value = """
        SELECT sb.id_solicitud, sb.numero_solicitud, sb.paciente_id, sb.paciente_nombre,
               sb.paciente_dni, sb.especialidad, sb.fecha_preferida_no_atendida,
               sb.tipo_documento, sb.fecha_nacimiento, sb.paciente_sexo,
               sb.paciente_telefono, sb.paciente_email,
               sb.codigo_ipress, sb.tipo_cita,
               sb.id_bolsa, tb.desc_tipo_bolsa,
               sb.id_servicio, sb.codigo_adscripcion, sb.id_ipress,
               sb.estado, sb.fecha_solicitud, sb.fecha_actualizacion,
               sb.estado_gestion_citas_id, sb.activo,
               di.desc_ipress, dr.desc_red
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
        LEFT JOIN dim_ipress di ON sb.codigo_ipress = di.cod_ipress
        LEFT JOIN dim_red dr ON di.id_red = dr.id_red
        WHERE sb.activo = true
        ORDER BY sb.fecha_solicitud DESC
        """, nativeQuery = true)
    List<Object[]> findAllWithBolsaDescription();

    /**
     * Busca solicitud por DNI del paciente (activas)
     */
    List<SolicitudBolsa> findByPacienteDniAndActivoTrue(String pacienteDni);

}
