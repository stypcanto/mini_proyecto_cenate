package com.styp.cenate.service.mesaayuda;

import com.styp.cenate.dto.mesaayuda.MotivoAnulacionDTO;
import com.styp.cenate.model.mesaayuda.DimMotivoAnulacion;
import com.styp.cenate.repository.mesaayuda.MotivoAnulacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementación CRUD de Motivos de Anulación de Citas (Admin)
 * @version v1.85.27 - 2026-03-06
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MotivoAnulacionAdminServiceImpl implements MotivoAnulacionAdminService {

    private final MotivoAnulacionRepository repository;

    @Override
    public List<MotivoAnulacionDTO> obtenerActivos() {
        return repository.findByActivoTrueOrderByOrdenAsc()
                .stream().map(this::mapToDTO).toList();
    }

    @Override
    public MotivoAnulacionDTO obtenerPorId(Long id) {
        return mapToDTO(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id)));
    }

    @Override
    public Page<MotivoAnulacionDTO> buscar(String busqueda, String estado, Pageable pageable) {
        return repository.buscar(busqueda, estado, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional
    public MotivoAnulacionDTO crear(MotivoRequest request) {
        if (repository.findByCodigo(request.codigo()).isPresent()) {
            throw new RuntimeException("Ya existe un motivo con el código: " + request.codigo());
        }
        DimMotivoAnulacion motivo = DimMotivoAnulacion.builder()
                .codigo(request.codigo())
                .descripcion(request.descripcion())
                .orden(request.orden() != null ? request.orden() : 0)
                .activo(true)
                .build();
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public MotivoAnulacionDTO actualizar(Long id, MotivoRequest request) {
        DimMotivoAnulacion motivo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setCodigo(request.codigo());
        motivo.setDescripcion(request.descripcion());
        if (request.orden() != null) motivo.setOrden(request.orden());
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public MotivoAnulacionDTO cambiarEstado(Long id, Boolean nuevoEstado) {
        DimMotivoAnulacion motivo = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setActivo(nuevoEstado);
        return mapToDTO(repository.save(motivo));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        DimMotivoAnulacion motivo = repository.findById(id)
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

    private MotivoAnulacionDTO mapToDTO(DimMotivoAnulacion m) {
        return MotivoAnulacionDTO.builder()
                .id(m.getId())
                .codigo(m.getCodigo())
                .descripcion(m.getDescripcion())
                .activo(m.getActivo())
                .orden(m.getOrden())
                .fechaCreacion(m.getFechaCreacion())
                .build();
    }
}
