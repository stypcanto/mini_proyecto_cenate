package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.MotivoInterconsultaDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Servicio CRUD de Motivos de Interconsulta (Admin)
 * @version v1.0.0 - 2026-02-23
 */
public interface MotivoInterconsultaAdminService {

    List<MotivoInterconsultaDTO> obtenerTodos();
    MotivoInterconsultaDTO obtenerPorId(Long id);
    Page<MotivoInterconsultaDTO> buscar(String busqueda, String estado, Pageable pageable);
    MotivoInterconsultaDTO crear(MotivoRequest request);
    MotivoInterconsultaDTO actualizar(Long id, MotivoRequest request);
    MotivoInterconsultaDTO cambiarEstado(Long id, Boolean nuevoEstado);
    void eliminar(Long id);
    EstadisticasDTO obtenerEstadisticas();

    record MotivoRequest(String codigo, String descripcion, Integer orden) {}

    record EstadisticasDTO(Long totalMotivos, Long motivosActivos, Long motivosInactivos) {}
}
