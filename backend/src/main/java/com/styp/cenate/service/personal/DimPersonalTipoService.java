package com.styp.cenate.service.personal;

import java.util.List;
import com.styp.cenate.dto.DimPersonalTipoDTO;

public interface DimPersonalTipoService {

    List<DimPersonalTipoDTO> listarTodos();

    List<DimPersonalTipoDTO> listarPorPersonal(Long idPers);

    List<DimPersonalTipoDTO> listarPorTipo(Long idTipoPers);

    DimPersonalTipoDTO crear(DimPersonalTipoDTO dto);

    void eliminar(Long idPers, Long idTipoPers);
}
