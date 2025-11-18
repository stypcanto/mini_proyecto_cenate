package com.styp.cenate.service.personal;

import java.util.List;

import com.styp.cenate.dto.DimOrigenPersonalDTO;


public interface DimOrigenPersonalService {

	 List<DimOrigenPersonalDTO> listarTodos();

	    List<DimOrigenPersonalDTO> listarActivos();

	    DimOrigenPersonalDTO buscarPorId(Long idOrigen);

	    DimOrigenPersonalDTO crear(DimOrigenPersonalDTO dto);

	    DimOrigenPersonalDTO actualizar(Long idOrigen, DimOrigenPersonalDTO dto);

	    void eliminar(Long idOrigen);

}
