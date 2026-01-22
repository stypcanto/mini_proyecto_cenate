package com.styp.cenate.service.filtros;

import com.styp.cenate.dto.filtros.IpressOptionDTO;
import com.styp.cenate.dto.filtros.MacroregionOptionDTO;
import com.styp.cenate.dto.filtros.RedOptionDTO;

import java.util.List;

public interface FiltrosUbicacionService {
    List<MacroregionOptionDTO> listarMacroregiones();
    List<RedOptionDTO> listarRedesPorMacro(Long macroId);
    List<IpressOptionDTO> listarIpressPorRed(Long redId);
}
