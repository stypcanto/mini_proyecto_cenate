package com.styp.cenate.service.estrategia;

import com.styp.cenate.dto.EstrategiaInstitucionalDTO;
import com.styp.cenate.exception.DuplicateResourceException;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.EstrategiaInstitucional;
import com.styp.cenate.repository.EstrategiaInstitucionalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para gestionar Estrategias Institucionales
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EstrategiaInstitucionalServiceImpl implements IEstrategiaInstitucionalService {

    private final EstrategiaInstitucionalRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<EstrategiaInstitucionalDTO> obtenerTodas() {
        log.info("📋 Obteniendo todas las estrategias institucionales");
        return repository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstrategiaInstitucionalDTO> obtenerActivas() {
        log.info("📋 Obteniendo estrategias institucionales activas");
        return repository.findAllActivas().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EstrategiaInstitucionalDTO obtenerPorId(Long id) {
        log.info("🔍 Buscando estrategia institucional con ID: {}", id);
        EstrategiaInstitucional estrategia = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Estrategia institucional no encontrada con ID: " + id));
        return convertirADTO(estrategia);
    }

    @Override
    public EstrategiaInstitucionalDTO crear(EstrategiaInstitucionalDTO dto) {
        log.info("➕ Creando nueva estrategia institucional: {}", dto.getDescEstrategia());

        // Validar que no exista código duplicado
        if (repository.existsByCodEstrategia(dto.getCodEstrategia())) {
            throw new DuplicateResourceException(
                    "Ya existe una estrategia con el código: " + dto.getCodEstrategia());
        }

        // Validar que no exista sigla duplicada
        if (repository.existsBySigla(dto.getSigla())) {
            throw new DuplicateResourceException(
                    "Ya existe una estrategia con la sigla: " + dto.getSigla());
        }

        EstrategiaInstitucional estrategia = EstrategiaInstitucional.builder()
                .codEstrategia(dto.getCodEstrategia().trim().toUpperCase())
                .descEstrategia(dto.getDescEstrategia().trim())
                .sigla(dto.getSigla().trim().toUpperCase())
                .estado(dto.getEstado() != null ? dto.getEstado() : "A")
                .build();

        EstrategiaInstitucional saved = repository.save(estrategia);
        log.info("✅ Estrategia institucional creada con ID: {}", saved.getIdEstrategia());

        return convertirADTO(saved);
    }

    @Override
    public EstrategiaInstitucionalDTO actualizar(Long id, EstrategiaInstitucionalDTO dto) {
        log.info("✏️ Actualizando estrategia institucional con ID: {}", id);

        EstrategiaInstitucional estrategia = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Estrategia institucional no encontrada con ID: " + id));

        // Validar que no exista otro registro con el mismo código
        if (repository.existsByCodEstrategiaAndIdNot(dto.getCodEstrategia(), id)) {
            throw new DuplicateResourceException(
                    "Ya existe otra estrategia con el código: " + dto.getCodEstrategia());
        }

        // Validar que no exista otro registro con la misma sigla
        if (repository.existsBySiglaAndIdNot(dto.getSigla(), id)) {
            throw new DuplicateResourceException(
                    "Ya existe otra estrategia con la sigla: " + dto.getSigla());
        }

        estrategia.setCodEstrategia(dto.getCodEstrategia().trim().toUpperCase());
        estrategia.setDescEstrategia(dto.getDescEstrategia().trim());
        estrategia.setSigla(dto.getSigla().trim().toUpperCase());
        estrategia.setEstado(dto.getEstado());

        EstrategiaInstitucional updated = repository.save(estrategia);
        log.info("✅ Estrategia institucional actualizada: {}", id);

        return convertirADTO(updated);
    }

    @Override
    public void eliminar(Long id) {
        log.info("🗑️ Eliminando estrategia institucional con ID: {}", id);

        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Estrategia institucional no encontrada con ID: " + id);
        }

        repository.deleteById(id);
        log.info("✅ Estrategia institucional eliminada: {}", id);
    }

    @Override
    public EstrategiaInstitucionalDTO activar(Long id) {
        log.info("✔️ Activando estrategia institucional con ID: {}", id);

        EstrategiaInstitucional estrategia = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Estrategia institucional no encontrada con ID: " + id));

        estrategia.activar();
        EstrategiaInstitucional updated = repository.save(estrategia);

        log.info("✅ Estrategia institucional activada: {}", id);
        return convertirADTO(updated);
    }

    @Override
    public EstrategiaInstitucionalDTO inactivar(Long id) {
        log.info("❌ Inactivando estrategia institucional con ID: {}", id);

        EstrategiaInstitucional estrategia = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Estrategia institucional no encontrada con ID: " + id));

        estrategia.inactivar();
        EstrategiaInstitucional updated = repository.save(estrategia);

        log.info("✅ Estrategia institucional inactivada: {}", id);
        return convertirADTO(updated);
    }

    /**
     * Convierte una entidad a DTO
     *
     * @param estrategia Entidad a convertir
     * @return DTO con los datos de la entidad
     */
    private EstrategiaInstitucionalDTO convertirADTO(EstrategiaInstitucional estrategia) {
        return EstrategiaInstitucionalDTO.builder()
                .idEstrategia(estrategia.getIdEstrategia())
                .codEstrategia(estrategia.getCodEstrategia())
                .descEstrategia(estrategia.getDescEstrategia())
                .sigla(estrategia.getSigla())
                .estado(estrategia.getEstado())
                .createdAt(estrategia.getCreatedAt())
                .updatedAt(estrategia.getUpdatedAt())
                .activa(estrategia.isActiva())
                .build();
    }
}
