package com.styp.cenate.repository.form107;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.form107.Bolsa107Item;

@Repository
public interface Bolsa107ItemRepository extends JpaRepository<Bolsa107Item, Long> {

	@Query(value = """
			SELECT
				id_item,
				id_carga,
				fecha_reporte,
				registro,
				tipo_documento,
				numero_documento,
				paciente,
				sexo,
				fecha_nacimiento,
				telefono,
				opcion_ingreso,
				motivo_llamada,
				afiliacion,
				derivacion_interna,
				id_servicio_essi,
				cod_servicio_essi,
				departamento,
				provincia,
				distrito,
				observacion_origen,
				id_estado,
				rol_asignado,
				usuario_asignado,
				observacion_gestion,
				created_at,
				updated_at
			FROM public.bolsa_107_item
			WHERE id_carga = :idCarga
			ORDER BY id_item
			""", nativeQuery = true)
	List<Map<String, Object>> findAllByIdCarga(@Param("idCarga") Long idCarga);

	// Método para obtener entidades completas por idCarga
	List<Bolsa107Item> findByIdCarga(Long idCarga);

	/**
	 * Obtener todos los pacientes de Bolsa 107 con información de IPRESS
	 * Hace JOIN con asegurados y dim_ipress para obtener la IPRESS del paciente
	 */
	@Query(value = """
			SELECT
				bi.id_item,
				bi.registro,
				bi.numero_documento,
				bi.paciente,
				bi.sexo,
				bi.telefono,
				bi.fecha_nacimiento,
				bi.departamento,
				bi.provincia,
				bi.distrito,
				bi.afiliacion,
				bi.derivacion_interna,
				bi.motivo_llamada,
				bi.id_carga,
				bi.created_at,
				bi.tipo_apoyo,
				bi.fecha_programacion,
				bi.turno,
				bi.profesional,
				bi.dni_profesional,
				bi.especialidad,
				i.cod_ipress,
				i.desc_ipress,
			          bi.id_gestor_asignado,
			          COALESCE(p.nom_pers || ' ' || p.ape_pater_pers, u.name_user) as nombre_gestor
			FROM bolsa_107_item bi
			LEFT JOIN asegurados a ON bi.numero_documento = a.doc_paciente
			LEFT JOIN dim_ipress i ON a.cas_adscripcion = i.cod_ipress
			      LEFT JOIN dim_usuarios u ON bi.id_gestor_asignado = u.id_user
			      LEFT JOIN dim_personal_cnt p ON u.id_user = p.id_usuario
			ORDER BY bi.id_item DESC
			""", nativeQuery = true)
	List<Map<String, Object>> findAllWithIpress();

	/**
	 * Obtener profesionales de salud activos del área asistencial con sus especialidades médicas
	 */
	@Query(value = """
			SELECT DISTINCT
				p.id_pers,
				p.num_doc_pers,
				p.nom_pers || ' ' || p.ape_pater_pers || ' ' || p.ape_mater_pers as nombre_completo,
				COALESCE(s.desc_servicio, prof.desc_prof, a.desc_area) as desc_area,
				p.id_area
			FROM dim_personal_cnt p
			LEFT JOIN dim_area a ON p.id_area = a.id_area
			LEFT JOIN dim_personal_prof pp ON p.id_pers = pp.id_pers AND pp.stat_pers_prof = 'A'
			LEFT JOIN dim_profesiones prof ON pp.id_prof = prof.id_prof
			LEFT JOIN dim_servicio_essi s ON pp.id_servicio = s.id_servicio
			WHERE p.stat_pers = 'A'
			AND p.id_area IN (1, 2, 3, 6, 7, 13)
			ORDER BY nombre_completo
			""", nativeQuery = true)
	List<Map<String, Object>> findProfesionalesSaludActivos();
}