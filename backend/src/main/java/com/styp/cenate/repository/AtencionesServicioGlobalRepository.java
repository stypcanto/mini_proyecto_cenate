package com.styp.cenate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.styp.cenate.dto.AtencionesServicioGlobalDTO;
import com.styp.cenate.model.AtencionesServicioGlobal;

public interface AtencionesServicioGlobalRepository extends JpaRepository<AtencionesServicioGlobal, String>{
	
	 // por documento
    List<AtencionesServicioGlobal> findByDocPaciente(String docPaciente);
    
    // por documento + codigo de servicio 
    List<AtencionesServicioGlobal> findByDocPacienteAndCodServicio(String docPaciente, String codServicio);

    // por documento + servicio (exacto)
    List<AtencionesServicioGlobal> findByDocPacienteAndServicio(String docPaciente, String servicio);

    // por documento + servicio LIKE (opcional)
    List<AtencionesServicioGlobal> findByDocPacienteAndServicioContainingIgnoreCase(String docPaciente, String servicio);
	
    long countByDocPaciente(String documento);
	

}
