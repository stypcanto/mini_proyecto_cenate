package com.styp.cenate.service.atenciones_clinicas;

import com.styp.cenate.dto.DetalleMedicoDTO;
import java.util.List;

/**
 * Servicio para obtener detalles de médicos asociados a un servicio (especialidad)
 */
public interface DetalleMedicoService {

    /**
     * Obtiene todos los médicos asociados a un servicio específico (especialidad)
     * 
     * @param idServicio ID del servicio (especialidad)
     * @return Lista de DTOs con información de los médicos
     */
    List<DetalleMedicoDTO> obtenerMedicosPorServicio(Long idServicio);

    /**
     * Obtiene información detallada de un médico específico
     * 
     * @param idPers ID del personal médico
     * @return DTO con información del médico
     */
    DetalleMedicoDTO obtenerDetalleMedico(Long idPers);
}
