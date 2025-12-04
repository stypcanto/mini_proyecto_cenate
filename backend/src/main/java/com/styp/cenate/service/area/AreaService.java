package com.styp.cenate.service.area;

import com.styp.cenate.dto.AreaResponse;
import java.util.List;

/**
 * 🧩 Interfaz de servicio para la gestión de áreas internas del sistema CENATE.
 */
public interface AreaService {

    List<AreaResponse> getAllAreas();

    List<AreaResponse> getAreasActivas();

    AreaResponse getAreaById(Long id);

    AreaResponse createArea(String desc, String stat);

    AreaResponse updateArea(Long id, String desc, String stat);

    void deleteArea(Long id);
}
