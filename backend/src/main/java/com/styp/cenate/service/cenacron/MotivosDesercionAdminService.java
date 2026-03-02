package com.styp.cenate.service.cenacron;

import com.styp.cenate.dto.cenacron.MotivoDesercionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Servicio CRUD de Motivos de Deserción (Admin)
 * @version v1.84.0 - 2026-03-02
 */
public interface MotivosDesercionAdminService {

    List<MotivoDesercionDTO>  obtenerActivos();
    MotivoDesercionDTO        obtenerPorId(Long id);
    Page<MotivoDesercionDTO>  buscar(String busqueda, String estado, Pageable pageable);
    MotivoDesercionDTO        crear(MotivoRequest request);
    MotivoDesercionDTO        actualizar(Long id, MotivoRequest request);
    MotivoDesercionDTO        cambiarEstado(Long id, Boolean nuevoEstado);
    void                      eliminar(Long id);
    EstadisticasDTO           obtenerEstadisticas();

    record MotivoRequest(String codigo, String descripcion, String categoria, Integer orden) {}
    record EstadisticasDTO(Long totalMotivos, Long motivosActivos, Long motivosInactivos) {}
}
