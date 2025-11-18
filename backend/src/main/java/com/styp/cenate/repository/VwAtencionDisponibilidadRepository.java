package com.styp.cenate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.styp.cenate.model.VWDisponibilidadAtenciones;

public interface VwAtencionDisponibilidadRepository
        extends JpaRepository<VWDisponibilidadAtenciones, String> {

    // Filtra por servicio 
    List<VWDisponibilidadAtenciones> findByServicio(String servicio);

    // mayúsculas/minúsculas
    List<VWDisponibilidadAtenciones> findByServicioIgnoreCase(String servicio);

    // Búsqueda like
    List<VWDisponibilidadAtenciones> findByServicioContainingIgnoreCase(String servicio);
    

    List<VWDisponibilidadAtenciones> findByIdServicio(Long idServicio);

    List<VWDisponibilidadAtenciones> findByServicioContainingIgnoreCaseAndNumDocPers(
        String servicio,
        String numDocPers
    );
    
    List<VWDisponibilidadAtenciones> findByIdServicioAndNumDocPers(
    		Long idServicio,
            String numDocPers
        );
    
    
    
    
}
