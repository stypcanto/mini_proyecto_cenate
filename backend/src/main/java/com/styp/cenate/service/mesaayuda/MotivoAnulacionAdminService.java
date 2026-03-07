package com.styp.cenate.service.mesaayuda;

import com.styp.cenate.dto.mesaayuda.MotivoAnulacionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Servicio CRUD de Motivos de Anulación de Citas (Admin)
 * @version v1.85.27 - 2026-03-06
 */
public interface MotivoAnulacionAdminService {

    List<MotivoAnulacionDTO> obtenerActivos();
    MotivoAnulacionDTO       obtenerPorId(Long id);
    Page<MotivoAnulacionDTO> buscar(String busqueda, String estado, Pageable pageable);
    MotivoAnulacionDTO       crear(MotivoRequest request);
    MotivoAnulacionDTO       actualizar(Long id, MotivoRequest request);
    MotivoAnulacionDTO       cambiarEstado(Long id, Boolean nuevoEstado);
    void                     eliminar(Long id);
    EstadisticasDTO          obtenerEstadisticas();

    record MotivoRequest(String codigo, String descripcion, Integer orden) {}
    record EstadisticasDTO(Long totalMotivos, Long motivosActivos, Long motivosInactivos) {}
}
