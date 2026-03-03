package com.styp.cenate.service.cenacron;

import com.styp.cenate.dto.cenacron.MotivoBajaCenacronDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Servicio CRUD de Motivos de Baja CENACRON (Admin)
 * @version v1.83.0 - 2026-03-02
 */
public interface MotivosBajaCenacronAdminService {

    List<MotivoBajaCenacronDTO> obtenerTodos();
    MotivoBajaCenacronDTO       obtenerPorId(Long id);
    Page<MotivoBajaCenacronDTO> buscar(String busqueda, String estado, Pageable pageable);
    MotivoBajaCenacronDTO       crear(MotivoRequest request);
    MotivoBajaCenacronDTO       actualizar(Long id, MotivoRequest request);
    MotivoBajaCenacronDTO       cambiarEstado(Long id, Boolean nuevoEstado);
    void                        eliminar(Long id);
    EstadisticasDTO             obtenerEstadisticas();

    record MotivoRequest(String codigo, String descripcion, Integer orden) {}
    record EstadisticasDTO(Long totalMotivos, Long motivosActivos, Long motivosInactivos) {}
}
