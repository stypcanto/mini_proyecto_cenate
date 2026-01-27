package com.styp.cenate.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import com.styp.cenate.model.DimServicioEssi;

public interface DimServicioEssiRepository extends JpaRepository<DimServicioEssi, Long> {

	// Consulta por estado (ej. 'A' = activo, 'I' = inactivo)
	List<DimServicioEssi> findByEstado(String estado);

	// Consulta por indicador de CENATE (true o false)
	List<DimServicioEssi> findByEsCenate(Boolean esCenate);

	// Consulta por indicador de CENATE (true o false)
	List<DimServicioEssi> findByEstadoAndEsCenate(String estado, Boolean esCenate);
	
	List<DimServicioEssi> findByEstadoAndEsCenateAndEsAperturaNuevos(String estado, Boolean esCenate, Boolean esAperturaNuevos);
	
	Optional<DimServicioEssi> findByCodServicio(String codigoServicio);
	
	
	List<DimServicioEssi> findByEstadoAndEsCenateAndEsRequerimientoIpress(String estado, Boolean esCenate, Boolean esServicioIpress, Sort sort);
	
	
	
}
