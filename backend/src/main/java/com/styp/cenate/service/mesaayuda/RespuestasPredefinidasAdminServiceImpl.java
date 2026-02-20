package com.styp.cenate.service.mesaayuda;

import com.styp.cenate.dto.mesaayuda.RespuestaPredefinidaAdminDTO;
import com.styp.cenate.model.mesaayuda.DimRespuestasPredefinidas;
import com.styp.cenate.repository.mesaayuda.RespuestaPredefinidaRepository;
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
public class RespuestasPredefinidasAdminServiceImpl implements RespuestasPredefinidasAdminService {

    private final RespuestaPredefinidaRepository respuestaRepository;

    @Override
    public List<RespuestaPredefinidaAdminDTO> obtenerTodos() {
        return respuestaRepository.findByActivoTrueOrderByOrdenAsc()
                .stream().map(this::mapToDTO).toList();
    }

    @Override
    public RespuestaPredefinidaAdminDTO obtenerPorId(Long id) {
        DimRespuestasPredefinidas respuesta = respuestaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Respuesta no encontrada con ID: " + id));
        return mapToDTO(respuesta);
    }

    @Override
    public Page<RespuestaPredefinidaAdminDTO> buscar(String busqueda, String estado, Pageable pageable) {
        return respuestaRepository.buscar(busqueda, estado, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional
    public RespuestaPredefinidaAdminDTO crear(RespuestaPredefinidaRequest request) {
        if (respuestaRepository.findByCodigo(request.codigo()).isPresent()) {
            throw new RuntimeException("Ya existe una respuesta con el código: " + request.codigo());
        }
        DimRespuestasPredefinidas respuesta = DimRespuestasPredefinidas.builder()
                .codigo(request.codigo())
                .descripcion(request.descripcion())
                .esOtros(request.esOtros() != null ? request.esOtros() : false)
                .orden(request.orden() != null ? request.orden() : 0)
                .activo(true)
                .build();
        DimRespuestasPredefinidas guardado = respuestaRepository.save(respuesta);
        return mapToDTO(guardado);
    }

    @Override
    @Transactional
    public RespuestaPredefinidaAdminDTO actualizar(Long id, RespuestaPredefinidaRequest request) {
        DimRespuestasPredefinidas respuesta = respuestaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Respuesta no encontrada con ID: " + id));
        respuesta.setCodigo(request.codigo());
        respuesta.setDescripcion(request.descripcion());
        if (request.esOtros() != null) {
            respuesta.setEsOtros(request.esOtros());
        }
        if (request.orden() != null) {
            respuesta.setOrden(request.orden());
        }
        DimRespuestasPredefinidas actualizado = respuestaRepository.save(respuesta);
        return mapToDTO(actualizado);
    }

    @Override
    @Transactional
    public RespuestaPredefinidaAdminDTO cambiarEstado(Long id, Boolean nuevoEstado) {
        DimRespuestasPredefinidas respuesta = respuestaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Respuesta no encontrada con ID: " + id));
        respuesta.setActivo(nuevoEstado);
        DimRespuestasPredefinidas actualizado = respuestaRepository.save(respuesta);
        return mapToDTO(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        DimRespuestasPredefinidas respuesta = respuestaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Respuesta no encontrada con ID: " + id));
        respuesta.setActivo(false);
        respuestaRepository.save(respuesta);
    }

    @Override
    public EstadisticasRespuestasDTO obtenerEstadisticas() {
        Long total = respuestaRepository.count();
        Long activas = respuestaRepository.countByActivoTrue();
        Long inactivas = respuestaRepository.countByActivoFalse();
        return new EstadisticasRespuestasDTO(total, activas, inactivas);
    }

    private RespuestaPredefinidaAdminDTO mapToDTO(DimRespuestasPredefinidas respuesta) {
        return RespuestaPredefinidaAdminDTO.builder()
                .id(respuesta.getId())
                .codigo(respuesta.getCodigo())
                .descripcion(respuesta.getDescripcion())
                .esOtros(respuesta.getEsOtros())
                .activo(respuesta.getActivo())
                .orden(respuesta.getOrden())
                .fechaCreacion(respuesta.getFechaCreacion())
                .build();
    }
}
