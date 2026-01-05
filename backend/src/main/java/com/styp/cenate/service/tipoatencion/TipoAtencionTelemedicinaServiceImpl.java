package com.styp.cenate.service.tipoatencion;

import com.styp.cenate.dto.TipoAtencionTelemedicinaDTO;
import com.styp.cenate.exception.DuplicateResourceException;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.TipoAtencionTelemedicina;
import com.styp.cenate.repository.TipoAtencionTelemedicinaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para gestionar Tipos de Atención en Telemedicina
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TipoAtencionTelemedicinaServiceImpl implements ITipoAtencionTelemedicinaService {

    private final TipoAtencionTelemedicinaRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<TipoAtencionTelemedicinaDTO> obtenerTodos() {
        log.info("📋 Obteniendo todos los tipos de atención en telemedicina");
        return repository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TipoAtencionTelemedicinaDTO> obtenerActivos() {
        log.info("📋 Obteniendo tipos de atención activos");
        return repository.findAllActivos().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TipoAtencionTelemedicinaDTO> obtenerActivosConProfesional() {
        log.info("📋 Obteniendo tipos de atención activos que requieren profesional");
        return repository.findAllActivosConProfesional().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TipoAtencionTelemedicinaDTO obtenerPorId(Long id) {
        log.info("🔍 Buscando tipo de atención con ID: {}", id);
        TipoAtencionTelemedicina tipoAtencion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tipo de atención no encontrado con ID: " + id));
        return convertirADTO(tipoAtencion);
    }

    @Override
    public TipoAtencionTelemedicinaDTO crear(TipoAtencionTelemedicinaDTO dto) {
        log.info("➕ Creando nuevo tipo de atención: {}", dto.getDescTipoAtencion());

        // Validar que no exista código duplicado
        if (repository.existsByCodTipoAtencion(dto.getCodTipoAtencion())) {
            throw new DuplicateResourceException(
                    "Ya existe un tipo de atención con el código: " + dto.getCodTipoAtencion());
        }

        TipoAtencionTelemedicina tipoAtencion = TipoAtencionTelemedicina.builder()
                .codTipoAtencion(dto.getCodTipoAtencion().trim().toUpperCase())
                .descTipoAtencion(dto.getDescTipoAtencion().trim())
                .sigla(dto.getSigla().trim().toUpperCase())
                .requiereProfesional(dto.getRequiereProfesional() != null ? dto.getRequiereProfesional() : true)
                .estado(dto.getEstado() != null ? dto.getEstado() : "A")
                .build();

        TipoAtencionTelemedicina saved = repository.save(tipoAtencion);
        log.info("✅ Tipo de atención creado con ID: {}", saved.getIdTipoAtencion());

        return convertirADTO(saved);
    }

    @Override
    public TipoAtencionTelemedicinaDTO actualizar(Long id, TipoAtencionTelemedicinaDTO dto) {
        log.info("✏️ Actualizando tipo de atención con ID: {}", id);

        TipoAtencionTelemedicina tipoAtencion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tipo de atención no encontrado con ID: " + id));

        // Validar que no exista otro registro con el mismo código
        if (repository.existsByCodTipoAtencionAndIdNot(dto.getCodTipoAtencion(), id)) {
            throw new DuplicateResourceException(
                    "Ya existe otro tipo de atención con el código: " + dto.getCodTipoAtencion());
        }

        tipoAtencion.setCodTipoAtencion(dto.getCodTipoAtencion().trim().toUpperCase());
        tipoAtencion.setDescTipoAtencion(dto.getDescTipoAtencion().trim());
        tipoAtencion.setSigla(dto.getSigla().trim().toUpperCase());
        tipoAtencion.setRequiereProfesional(dto.getRequiereProfesional());
        tipoAtencion.setEstado(dto.getEstado());

        TipoAtencionTelemedicina updated = repository.save(tipoAtencion);
        log.info("✅ Tipo de atención actualizado: {}", id);

        return convertirADTO(updated);
    }

    @Override
    public void eliminar(Long id) {
        log.info("🗑️ Eliminando tipo de atención con ID: {}", id);

        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Tipo de atención no encontrado con ID: " + id);
        }

        repository.deleteById(id);
        log.info("✅ Tipo de atención eliminado: {}", id);
    }

    @Override
    public TipoAtencionTelemedicinaDTO activar(Long id) {
        log.info("✔️ Activando tipo de atención con ID: {}", id);

        TipoAtencionTelemedicina tipoAtencion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tipo de atención no encontrado con ID: " + id));

        tipoAtencion.activar();
        TipoAtencionTelemedicina updated = repository.save(tipoAtencion);

        log.info("✅ Tipo de atención activado: {}", id);
        return convertirADTO(updated);
    }

    @Override
    public TipoAtencionTelemedicinaDTO inactivar(Long id) {
        log.info("❌ Inactivando tipo de atención con ID: {}", id);

        TipoAtencionTelemedicina tipoAtencion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tipo de atención no encontrado con ID: " + id));

        tipoAtencion.inactivar();
        TipoAtencionTelemedicina updated = repository.save(tipoAtencion);

        log.info("✅ Tipo de atención inactivado: {}", id);
        return convertirADTO(updated);
    }

    /**
     * Convierte una entidad a DTO
     *
     * @param tipoAtencion Entidad a convertir
     * @return DTO con los datos de la entidad
     */
    private TipoAtencionTelemedicinaDTO convertirADTO(TipoAtencionTelemedicina tipoAtencion) {
        return TipoAtencionTelemedicinaDTO.builder()
                .idTipoAtencion(tipoAtencion.getIdTipoAtencion())
                .codTipoAtencion(tipoAtencion.getCodTipoAtencion())
                .descTipoAtencion(tipoAtencion.getDescTipoAtencion())
                .sigla(tipoAtencion.getSigla())
                .requiereProfesional(tipoAtencion.getRequiereProfesional())
                .estado(tipoAtencion.getEstado())
                .createdAt(tipoAtencion.getCreatedAt())
                .updatedAt(tipoAtencion.getUpdatedAt())
                .activo(tipoAtencion.isActivo())
                .build();
    }
}
