package com.styp.cenate.service.cenacron;

import com.styp.cenate.dto.cenacron.MotivoBajaCenacronDTO;
import com.styp.cenate.model.cenacron.DimMotivosBajaCenacron;
import com.styp.cenate.repository.cenacron.MotivosBajaCenacronRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementación CRUD de Motivos de Baja CENACRON (Admin)
 * @version v1.83.0 - 2026-03-02
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MotivosBajaCenacronAdminServiceImpl implements MotivosBajaCenacronAdminService {

    private final MotivosBajaCenacronRepository repository;

    @Override
    public List<MotivoBajaCenacronDTO> obtenerTodos() {
        return repository.findByActivoTrueOrderByOrdenAsc()
                .stream().map(this::mapToDTO).toList();
    }

    @Override
    public MotivoBajaCenacronDTO obtenerPorId(Long id) {
        return mapToDTO(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id)));
    }

    @Override
    public Page<MotivoBajaCenacronDTO> buscar(String busqueda, String estado, Pageable pageable) {
        return repository.buscar(busqueda, estado, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional
    public MotivoBajaCenacronDTO crear(MotivoRequest request) {
        if (repository.findByCodigo(request.codigo()).isPresent()) {
            throw new RuntimeException("Ya existe un motivo con el código: " + request.codigo());
        }
        DimMotivosBajaCenacron motivo = DimMotivosBajaCenacron.builder()
                .codigo(request.codigo())
                .descripcion(request.descripcion())
                .orden(request.orden() != null ? request.orden() : 0)
                .activo(true)
                .build();
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public MotivoBajaCenacronDTO actualizar(Long id, MotivoRequest request) {
        DimMotivosBajaCenacron motivo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setCodigo(request.codigo());
        motivo.setDescripcion(request.descripcion());
        if (request.orden() != null) motivo.setOrden(request.orden());
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public MotivoBajaCenacronDTO cambiarEstado(Long id, Boolean nuevoEstado) {
        DimMotivosBajaCenacron motivo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setActivo(nuevoEstado);
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        DimMotivosBajaCenacron motivo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setActivo(false);
        repository.save(motivo);
    }

    @Override
    public EstadisticasDTO obtenerEstadisticas() {
        return new EstadisticasDTO(
                repository.count(),
                repository.countByActivoTrue(),
                repository.countByActivoFalse()
        );
    }

    private MotivoBajaCenacronDTO mapToDTO(DimMotivosBajaCenacron m) {
        return MotivoBajaCenacronDTO.builder()
                .id(m.getId())
                .codigo(m.getCodigo())
                .descripcion(m.getDescripcion())
                .activo(m.getActivo())
                .orden(m.getOrden())
                .fechaCreacion(m.getFechaCreacion())
                .build();
    }
}
