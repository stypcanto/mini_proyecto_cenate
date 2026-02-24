package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.MotivoInterconsultaDTO;
import com.styp.cenate.model.bolsas.DimMotivoInterconsulta;
import com.styp.cenate.repository.bolsas.DimMotivoInterconsultaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementación CRUD de Motivos de Interconsulta (Admin)
 * @version v1.0.0 - 2026-02-23
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MotivoInterconsultaAdminServiceImpl implements MotivoInterconsultaAdminService {

    private final DimMotivoInterconsultaRepository repository;

    @Override
    public List<MotivoInterconsultaDTO> obtenerTodos() {
        return repository.findByActivoTrueOrderByOrdenAsc()
                .stream().map(this::mapToDTO).toList();
    }

    @Override
    public MotivoInterconsultaDTO obtenerPorId(Long id) {
        return mapToDTO(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id)));
    }

    @Override
    public Page<MotivoInterconsultaDTO> buscar(String busqueda, String estado, Pageable pageable) {
        return repository.buscar(busqueda, estado, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional
    public MotivoInterconsultaDTO crear(MotivoRequest request) {
        if (repository.findByCodigo(request.codigo()).isPresent()) {
            throw new RuntimeException("Ya existe un motivo con el código: " + request.codigo());
        }
        DimMotivoInterconsulta motivo = DimMotivoInterconsulta.builder()
                .codigo(request.codigo())
                .descripcion(request.descripcion())
                .orden(request.orden() != null ? request.orden() : 0)
                .activo(true)
                .build();
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public MotivoInterconsultaDTO actualizar(Long id, MotivoRequest request) {
        DimMotivoInterconsulta motivo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setCodigo(request.codigo());
        motivo.setDescripcion(request.descripcion());
        if (request.orden() != null) motivo.setOrden(request.orden());
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public MotivoInterconsultaDTO cambiarEstado(Long id, Boolean nuevoEstado) {
        DimMotivoInterconsulta motivo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setActivo(nuevoEstado);
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        DimMotivoInterconsulta motivo = repository.findById(id)
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

    private MotivoInterconsultaDTO mapToDTO(DimMotivoInterconsulta m) {
        return MotivoInterconsultaDTO.builder()
                .id(m.getId())
                .codigo(m.getCodigo())
                .descripcion(m.getDescripcion())
                .activo(m.getActivo())
                .orden(m.getOrden())
                .fechaCreacion(m.getFechaCreacion())
                .build();
    }
}
