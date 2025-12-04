package com.styp.cenate.service.area.impl;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.AreaResponse;
import com.styp.cenate.model.Area;
import com.styp.cenate.repository.AreaRepository;
import com.styp.cenate.service.area.AreaService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 🏢 Implementación del servicio de gestión de áreas internas.
 * Mapea la entidad Area a su correspondiente DTO (AreaResponse).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Data
public class AreaServiceImpl implements AreaService {

    private final AreaRepository areaRepository;

    // ============================================================
    // 🔹 CONSULTAR TODAS
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<AreaResponse> getAllAreas() {
        log.info("📋 Obteniendo todas las áreas...");
        return areaRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 CONSULTAR ACTIVAS
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<AreaResponse> getAreasActivas() {
        log.info("📋 Obteniendo áreas activas...");
        return areaRepository.findByStatAreaOrderByDescAreaAsc("A").stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 CONSULTAR POR ID
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public AreaResponse getAreaById(Long id) {
        log.info("🔍 Obteniendo área con ID: {}", id);
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Área no encontrada con ID: " + id));
        return convertToResponse(area);
    }

    // ============================================================
    // 🔹 CREAR
    // ============================================================
    @Override
    @Transactional
    public AreaResponse createArea(String desc, String stat) {
        log.info("🧩 Creando nueva área: {}", desc);

        Area area = new Area();
        area.setDescArea(desc != null ? desc.trim().toUpperCase() : null);
        area.setStatArea(convertEstado(stat));

        Area saved = areaRepository.save(area);
        log.info("✅ Área creada con ID: {}", saved.getIdArea());
        return convertToResponse(saved);
    }

    // ============================================================
    // 🔹 ACTUALIZAR
    // ============================================================
    @Override
    @Transactional
    public AreaResponse updateArea(Long id, String desc, String stat) {
        log.info("✏️ Actualizando área con ID: {}", id);

        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Área no encontrada con ID: " + id));

        area.setDescArea(desc != null ? desc.trim().toUpperCase() : area.getDescArea());
        area.setStatArea(stat != null ? convertEstado(stat) : area.getStatArea());

        Area updated = areaRepository.save(area);
        log.info("🔄 Área actualizada: {}", updated.getDescArea());
        return convertToResponse(updated);
    }

    // ============================================================
    // 🔹 ELIMINAR
    // ============================================================
    @Override
    @Transactional
    public void deleteArea(Long id) {
        log.warn("🗑️ Eliminando área con ID: {}", id);
        if (!areaRepository.existsById(id)) {
            throw new IllegalArgumentException("Área no encontrada con ID: " + id);
        }
        areaRepository.deleteById(id);
        log.info("✅ Área eliminada correctamente (ID: {})", id);
    }

    // ============================================================
    // 🔹 CONVERSIÓN A DTO
    // ============================================================
    private AreaResponse convertToResponse(Area area) {
        return AreaResponse.builder()
                .idArea(area.getIdArea())
                .descArea(area.getDescArea())
                .statArea(area.getStatArea())
                .createdAt(area.getCreatedAt())
                .updatedAt(area.getUpdatedAt())
                .build();
    }

    // ============================================================
    // 🔹 CONVERSIÓN DE ESTADO (1/0 o A/I)
    // ============================================================
    private String convertEstado(String stat) {
        if (stat == null) return "A";
        String s = stat.trim().toUpperCase();
        // Si viene "1" lo convierte a "A", si viene "0" lo convierte a "I"
        if ("1".equals(s) || "A".equals(s) || "ACTIVO".equals(s)) return "A";
        if ("0".equals(s) || "I".equals(s) || "INACTIVO".equals(s)) return "I";
        return "A"; // Por defecto activo
    }
}
