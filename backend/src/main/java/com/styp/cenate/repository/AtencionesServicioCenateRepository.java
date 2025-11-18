package com.styp.cenate.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.styp.cenate.model.AtencionesServicioCenate;

public interface AtencionesServicioCenateRepository 
	extends JpaRepository<AtencionesServicioCenate, String>
{

	
	List<AtencionesServicioCenate> findByDocPaciente(String documento);
	
	List<AtencionesServicioCenate> findByDocPacienteAndServicio(String documento, String servicio);
	
	long countByDocPaciente(String documento);
	
	boolean existsByDocPaciente(String docPaciente);
	
	
}
