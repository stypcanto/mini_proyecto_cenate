package com.styp.cenate.service.cenacron;

import com.styp.cenate.dto.cenacron.MotivoDesercionDTO;
import com.styp.cenate.model.cenacron.DimMotivosDesercion;
import com.styp.cenate.repository.cenacron.MotivosDesercionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementación CRUD de Motivos de Deserción (Admin)
 * @version v1.84.0 - 2026-03-02
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MotivosDesercionAdminServiceImpl implements MotivosDesercionAdminService {

    private final MotivosDesercionRepository repository;

    @Override
    public List<MotivoDesercionDTO> obtenerActivos() {
        return repository.findByActivoTrueOrderByOrdenAsc()
                .stream().map(this::mapToDTO).toList();
    }

    @Override
    public MotivoDesercionDTO obtenerPorId(Long id) {
        return mapToDTO(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id)));
    }

    @Override
    public Page<MotivoDesercionDTO> buscar(String busqueda, String estado, Pageable pageable) {
        return repository.buscar(busqueda, estado, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional
    public MotivoDesercionDTO crear(MotivoRequest request) {
        if (repository.findByCodigo(request.codigo()).isPresent()) {
            throw new RuntimeException("Ya existe un motivo con el código: " + request.codigo());
        }
        DimMotivosDesercion motivo = DimMotivosDesercion.builder()
                .codigo(request.codigo())
                .descripcion(request.descripcion())
                .categoria(request.categoria() != null ? request.categoria() : "Otro")
                .orden(request.orden() != null ? request.orden() : 0)
                .activo(true)
                .build();
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public MotivoDesercionDTO actualizar(Long id, MotivoRequest request) {
        DimMotivosDesercion motivo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setCodigo(request.codigo());
        motivo.setDescripcion(request.descripcion());
        if (request.categoria() != null) motivo.setCategoria(request.categoria());
        if (request.orden() != null)     motivo.setOrden(request.orden());
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public MotivoDesercionDTO cambiarEstado(Long id, Boolean nuevoEstado) {
        DimMotivosDesercion motivo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setActivo(nuevoEstado);
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        DimMotivosDesercion motivo = repository.findById(id)
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

    private MotivoDesercionDTO mapToDTO(DimMotivosDesercion m) {
        return MotivoDesercionDTO.builder()
                .id(m.getId())
                .codigo(m.getCodigo())
                .descripcion(m.getDescripcion())
                .categoria(m.getCategoria())
                .activo(m.getActivo())
                .orden(m.getOrden())
                .fechaCreacion(m.getFechaCreacion())
                .build();
    }
}
