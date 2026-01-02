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
			i.cod_ipress,
			i.desc_ipress
		FROM bolsa_107_item bi
		LEFT JOIN asegurados a ON bi.numero_documento = a.doc_paciente
		LEFT JOIN dim_ipress i ON a.cas_adscripcion = i.cod_ipress
		ORDER BY bi.id_item DESC
		""", nativeQuery = true)
	List<Map<String, Object>> findAllWithIpress();
}