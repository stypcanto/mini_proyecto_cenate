package com.styp.cenate.service.personal;

import java.util.List;
import com.styp.cenate.dto.DimServicioEssiDTO;

public interface DimServicioEssiService {

	List<DimServicioEssiDTO> listarTodo();
	List<DimServicioEssiDTO> listarPorEstado(String estado);
    List<DimServicioEssiDTO> listarPorCenate(Boolean esCenate);
    List<DimServicioEssiDTO> listarActivosCenate();
    List<DimServicioEssiDTO> findByEstadoAndEsCenateAndEsAperturaNuevos();
    
    
    // Buscar el idServicio a partir del codServicio
    DimServicioEssiDTO findByCodServicio(String codigoServicio);
    List<DimServicioEssiDTO> listarTodos();
    List<DimServicioEssiDTO> listarActivos();
    DimServicioEssiDTO buscarPorId(Long id);
    DimServicioEssiDTO crear(DimServicioEssiDTO dto);
    DimServicioEssiDTO actualizar(Long id, DimServicioEssiDTO dto);
    void eliminar(Long id);
    
    
    
	

}
