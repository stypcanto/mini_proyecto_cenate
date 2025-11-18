package com.styp.cenate.service.chatbot.disponibilidad;

import java.util.List;
import com.styp.cenate.dto.AtencionDisponibilidadDTO;

public interface IVwAtencionDisponibilidadService {

	
	  // Filtra por servicio 
    List<AtencionDisponibilidadDTO> listarPorServicio(String servicio);

    // Filtra por servicio (insensible a mayúsculas/minúsculas)
    List<AtencionDisponibilidadDTO> listarPorServicioIgnoreCase(String servicio);

    // Filtra por servicio (LIKE, insensible a mayúsculas/minúsculas)
    List<AtencionDisponibilidadDTO> listarPorServicioLike(String servicio);

    // Filtra por id del servicio exacto
    List<AtencionDisponibilidadDTO> listarPorIdServicio(Long idServicio);

    // Filtra por servicio (LIKE) y número de documento del profesional exacto
    List<AtencionDisponibilidadDTO> listarPorServicioYNumDocPers(String servicio, String numDocPers);
    
    List<AtencionDisponibilidadDTO> findByIdServicioAndNumDocPers(
    		Long idServicio,
            String numDocPers
        );
    
}
