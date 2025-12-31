package com.styp.cenate.repository.form107;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.form107.Bolsa107Error;

@Repository
public interface Bolsa107ErrorRepository extends JpaRepository<Bolsa107Error, Long> {

	@Query(value = """
		SELECT
			id_error,
			id_carga,
			id_raw,
			registro,
			codigo_error,
			detalle_error,
			columnas_error,
			raw_json::text as raw_json,
			created_at
		FROM public.bolsa_107_error
		WHERE id_carga = :idCarga
		ORDER BY id_error
		""", nativeQuery = true)
	List<Map<String, Object>> findAllByIdCarga(@Param("idCarga") Long idCarga);

	// Método para obtener entidades completas por idCarga
	List<Bolsa107Error> findByIdCarga(Long idCarga);
}