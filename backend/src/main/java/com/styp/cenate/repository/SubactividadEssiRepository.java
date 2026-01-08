package com.styp.cenate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.styp.cenate.model.SubactividadEssi;

public interface SubactividadEssiRepository extends JpaRepository<SubactividadEssi, Long> {
	
    List<SubactividadEssi> findByEstadoAndEsCenate(String estado, boolean esCenate);

	

}
