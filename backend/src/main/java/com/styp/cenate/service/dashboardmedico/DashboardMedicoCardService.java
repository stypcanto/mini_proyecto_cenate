// ============================================================================
// 🧩 DashboardMedicoCardService.java – Implementación de Servicio (CMS Dashboard Médico – CENATE 2025)
// ----------------------------------------------------------------------------
// Implementación del servicio para la gestión de cards del Dashboard Médico.
// ============================================================================

package com.styp.cenate.service.dashboardmedico;

import com.styp.cenate.dto.DashboardMedicoCardRequest;
import com.styp.cenate.dto.DashboardMedicoCardResponse;
import com.styp.cenate.model.DashboardMedicoCard;
import com.styp.cenate.repository.DashboardMedicoCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardMedicoCardService implements IDashboardMedicoCardService {

    private final DashboardMedicoCardRepository repository;

    // ============================================================
    // 🔹 OBTENER TODAS LAS CARDS
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<DashboardMedicoCardResponse> findAll() {
        log.info("📋 Obteniendo todas las cards del Dashboard Médico...");
        return repository.findAllByOrderByOrdenAsc().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 OBTENER SOLO CARDS ACTIVAS
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<DashboardMedicoCardResponse> findAllActivas() {
        log.info("📋 Obteniendo cards activas del Dashboard Médico...");
        return repository.findByActivoTrueOrderByOrdenAsc().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 OBTENER POR ID
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public DashboardMedicoCardResponse findById(Integer id) {
        log.info("🔍 Obteniendo card con ID: {}", id);
        DashboardMedicoCard card = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Card no encontrada con ID: " + id));
        return convertToResponse(card);
    }

    // ============================================================
    // 🔹 CREAR NUEVA CARD
    // ============================================================
    @Override
    @Transactional
    public DashboardMedicoCardResponse create(DashboardMedicoCardRequest request) {
        log.info("🧩 Creando nueva card: {}", request.getTitulo());

        DashboardMedicoCard card = DashboardMedicoCard.builder()
                .titulo(request.getTitulo() != null ? request.getTitulo().trim() : null)
                .descripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null)
                .link(request.getLink() != null ? request.getLink().trim() : null)
                .icono(request.getIcono() != null ? request.getIcono().trim() : null)
                .color(request.getColor() != null ? request.getColor().trim() : "#0A5BA9")
                .orden(request.getOrden() != null ? request.getOrden() : 0)
                .activo(request.getActivo() != null ? request.getActivo() : true)
                .targetBlank(request.getTargetBlank() != null ? request.getTargetBlank() : true) // Siempre true por defecto
                .build();

        DashboardMedicoCard saved = repository.save(card);
        log.info("✅ Card creada con ID: {}", saved.getId());
        return convertToResponse(saved);
    }

    // ============================================================
    // 🔹 ACTUALIZAR CARD
    // ============================================================
    @Override
    @Transactional
    public DashboardMedicoCardResponse update(Integer id, DashboardMedicoCardRequest request) {
        log.info("✏️ Actualizando card con ID: {}", id);

        DashboardMedicoCard card = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Card no encontrada con ID: " + id));

        if (request.getTitulo() != null) card.setTitulo(request.getTitulo().trim());
        if (request.getDescripcion() != null) card.setDescripcion(request.getDescripcion().trim());
        if (request.getLink() != null) card.setLink(request.getLink().trim());
        if (request.getIcono() != null) card.setIcono(request.getIcono().trim());
        if (request.getColor() != null) card.setColor(request.getColor().trim());
        if (request.getOrden() != null) card.setOrden(request.getOrden());
        if (request.getActivo() != null) card.setActivo(request.getActivo());
        if (request.getTargetBlank() != null) card.setTargetBlank(request.getTargetBlank());

        DashboardMedicoCard updated = repository.save(card);
        log.info("🔄 Card actualizada: {}", updated.getTitulo());
        return convertToResponse(updated);
    }

    // ============================================================
    // 🔹 ELIMINAR CARD
    // ============================================================
    @Override
    @Transactional
    public void delete(Integer id) {
        log.warn("🗑️ Eliminando card con ID: {}", id);
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Card no encontrada con ID: " + id);
        }
        repository.deleteById(id);
        log.info("✅ Card eliminada correctamente (ID: {})", id);
    }

    // ============================================================
    // 🔹 ACTUALIZAR ORDEN
    // ============================================================
    @Override
    @Transactional
    public void updateOrden(List<Integer> ids) {
        log.info("🔄 Actualizando orden de cards...");
        for (int i = 0; i < ids.size(); i++) {
            final int orden = i + 1;
            Integer id = ids.get(i);
            repository.findById(id).ifPresent(card -> {
                card.setOrden(orden);
                repository.save(card);
            });
        }
        log.info("✅ Orden actualizado para {} cards", ids.size());
    }

    // ============================================================
    // 🔹 ACTIVAR/DESACTIVAR CARD
    // ============================================================
    @Override
    @Transactional
    public DashboardMedicoCardResponse toggleActivo(Integer id) {
        log.info("🔄 Cambiando estado activo de card con ID: {}", id);
        DashboardMedicoCard card = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Card no encontrada con ID: " + id));
        card.setActivo(!card.getActivo());
        DashboardMedicoCard updated = repository.save(card);
        log.info("✅ Card {} (ID: {})", updated.getActivo() ? "activada" : "desactivada", id);
        return convertToResponse(updated);
    }

    // ============================================================
    // 🔹 CONVERSIÓN A DTO
    // ============================================================
    private DashboardMedicoCardResponse convertToResponse(DashboardMedicoCard card) {
        return DashboardMedicoCardResponse.builder()
                .id(card.getId())
                .titulo(card.getTitulo())
                .descripcion(card.getDescripcion())
                .link(card.getLink())
                .icono(card.getIcono())
                .color(card.getColor())
                .orden(card.getOrden())
                .activo(card.getActivo())
                .targetBlank(card.getTargetBlank())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .build();
    }
}

