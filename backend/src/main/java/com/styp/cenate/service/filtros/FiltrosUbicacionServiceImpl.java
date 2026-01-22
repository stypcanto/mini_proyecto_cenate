package com.styp.cenate.service.filtros;

import java.util.List;
import org.springframework.stereotype.Service;
import com.styp.cenate.dto.filtros.IpressOptionDTO;
import com.styp.cenate.dto.filtros.MacroregionOptionDTO;
import com.styp.cenate.dto.filtros.RedOptionDTO;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.MacroregionRepository;
import com.styp.cenate.repository.RedRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FiltrosUbicacionServiceImpl implements FiltrosUbicacionService {

    private final MacroregionRepository macroRepo;
    private final RedRepository redRepo;
    private final IpressRepository ipressRepo;

    @Override
    public List<MacroregionOptionDTO> listarMacroregiones() {
        return macroRepo.listarOpciones();
    }

    @Override
    public List<RedOptionDTO> listarRedesPorMacro(Long macroId) {
        if (macroId == null) return List.of();
        return redRepo.listarPorMacro(macroId);
    }

    @Override
    public List<IpressOptionDTO> listarIpressPorRed(Long redId) {
        if (redId == null) return List.of();
        return ipressRepo.listarPorRed(redId);
    }
}
