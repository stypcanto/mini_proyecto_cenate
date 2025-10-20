package com.styp.cenate.service.regimen;

import com.styp.cenate.dto.RegimenLaboralResponse;
import java.util.List;

public interface RegimenLaboralService {

    List<RegimenLaboralResponse> getAllRegimenes();

    RegimenLaboralResponse getRegimenById(Long id);

    RegimenLaboralResponse createRegimen(String desc, String stat);

    RegimenLaboralResponse updateRegimen(Long id, String desc, String stat);

    void deleteRegimen(Long id);
}
