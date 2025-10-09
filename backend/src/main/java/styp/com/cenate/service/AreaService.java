package styp.com.cenate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.AreaResponse;
import styp.com.cenate.model.Area;
import styp.com.cenate.repository.AreaRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AreaService {
    
    private final AreaRepository areaRepository;
    
    @Transactional(readOnly = true)
    public List<AreaResponse> getAllAreas() {
        log.info("Obteniendo todas las áreas");
        return areaRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public AreaResponse getAreaById(Long id) {
        log.info("Obteniendo área con ID: {}", id);
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Área no encontrada"));
        return convertToResponse(area);
    }
    
    @Transactional
    public AreaResponse createArea(String desc, String stat) {
        log.info("Creando nueva área: {}", desc);
        Area area = new Area();
        area.setDescArea(desc);
        area.setStatArea(stat);
        Area saved = areaRepository.save(area);
        return convertToResponse(saved);
    }
    
    @Transactional
    public AreaResponse updateArea(Long id, String desc, String stat) {
        log.info("Actualizando área con ID: {}", id);
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Área no encontrada"));
        area.setDescArea(desc);
        area.setStatArea(stat);
        Area updated = areaRepository.save(area);
        return convertToResponse(updated);
    }
    
    @Transactional
    public void deleteArea(Long id) {
        log.info("Eliminando área con ID: {}", id);
        areaRepository.deleteById(id);
    }
    
    private AreaResponse convertToResponse(Area area) {
        AreaResponse response = new AreaResponse();
        response.setIdArea(area.getIdArea());
        response.setDescArea(area.getDescArea());
        response.setStatArea(area.getStatArea());
        response.setCreateAt(area.getCreateAt());
        response.setUpdateAt(area.getUpdateAt());
        return response;
    }
}
