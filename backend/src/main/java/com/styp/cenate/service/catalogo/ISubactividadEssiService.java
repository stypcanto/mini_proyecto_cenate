package com.styp.cenate.service.catalogo;

import java.util.List;

import com.styp.cenate.dto.catalogo.SubactividadEssiResponseDTO;

public interface ISubactividadEssiService {
	SubactividadEssiResponseDTO obtenerPorId(Long idSubactividad);
    boolean existePorId(Long idSubactividad);
    List<SubactividadEssiResponseDTO> listar();
    void eliminarLogico(Long idSubactividad);
}
