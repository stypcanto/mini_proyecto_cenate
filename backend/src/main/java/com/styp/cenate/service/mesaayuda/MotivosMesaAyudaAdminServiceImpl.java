package com.styp.cenate.service.mesaayuda;

import com.styp.cenate.dto.mesaayuda.MotivoMesaAyudaAdminDTO;
import com.styp.cenate.model.mesaayuda.DimMotivosMesaAyuda;
import com.styp.cenate.repository.mesaayuda.MotivoMesaAyudaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MotivosMesaAyudaAdminServiceImpl implements MotivosMesaAyudaAdminService {

    private final MotivoMesaAyudaRepository motivoRepository;

    @Override
    public List<MotivoMesaAyudaAdminDTO> obtenerTodos() {
        return motivoRepository.findByActivoTrueOrderByOrdenAsc()
                .stream().map(this::mapToDTO).toList();
    }

    @Override
    public MotivoMesaAyudaAdminDTO obtenerPorId(Long id) {
        DimMotivosMesaAyuda motivo = motivoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        return mapToDTO(motivo);
    }

    @Override
    public Page<MotivoMesaAyudaAdminDTO> buscar(String busqueda, String estado, Pageable pageable) {
        return motivoRepository.buscar(busqueda, estado, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional
    public MotivoMesaAyudaAdminDTO crear(MotivoMesaAyudaRequest request) {
        if (motivoRepository.findByCodigo(request.codigo()).isPresent()) {
            throw new RuntimeException("Ya existe un motivo con el código: " + request.codigo());
        }
        DimMotivosMesaAyuda motivo = DimMotivosMesaAyuda.builder()
                .codigo(request.codigo())
                .descripcion(request.descripcion())
                .orden(request.orden() != null ? request.orden() : 0)
                .prioridad(request.prioridad() != null ? request.prioridad() : "MEDIA")
                .activo(true)
                .build();
        DimMotivosMesaAyuda guardado = motivoRepository.save(motivo);
        return mapToDTO(guardado);
    }

    @Override
    @Transactional
    public MotivoMesaAyudaAdminDTO actualizar(Long id, MotivoMesaAyudaRequest request) {
        DimMotivosMesaAyuda motivo = motivoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setCodigo(request.codigo());
        motivo.setDescripcion(request.descripcion());
        if (request.orden() != null) {
            motivo.setOrden(request.orden());
        }
        if (request.prioridad() != null) {
            motivo.setPrioridad(request.prioridad());
        }
        DimMotivosMesaAyuda actualizado = motivoRepository.save(motivo);
        return mapToDTO(actualizado);
    }

    @Override
    @Transactional
    public MotivoMesaAyudaAdminDTO cambiarEstado(Long id, Boolean nuevoEstado) {
        DimMotivosMesaAyuda motivo = motivoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setActivo(nuevoEstado);
        DimMotivosMesaAyuda actualizado = motivoRepository.save(motivo);
        return mapToDTO(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        DimMotivosMesaAyuda motivo = motivoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado con ID: " + id));
        motivo.setActivo(false);
        motivoRepository.save(motivo);
    }

    @Override
    public EstadisticasMotivosDTO obtenerEstadisticas() {
        Long total = motivoRepository.count();
        Long activos = motivoRepository.countByActivoTrue();
        Long inactivos = motivoRepository.countByActivoFalse();
        return new EstadisticasMotivosDTO(total, activos, inactivos);
    }

    private MotivoMesaAyudaAdminDTO mapToDTO(DimMotivosMesaAyuda motivo) {
        return MotivoMesaAyudaAdminDTO.builder()
                .id(motivo.getId())
                .codigo(motivo.getCodigo())
                .descripcion(motivo.getDescripcion())
                .activo(motivo.getActivo())
                .orden(motivo.getOrden())
                .prioridad(motivo.getPrioridad())
                .fechaCreacion(motivo.getFechaCreacion())
                .build();
    }
}
