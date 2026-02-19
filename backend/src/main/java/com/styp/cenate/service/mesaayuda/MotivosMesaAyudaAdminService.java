package com.styp.cenate.service.mesaayuda;

import com.styp.cenate.dto.mesaayuda.MotivoMesaAyudaAdminDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Servicio de Motivos Mesa de Ayuda - Interfaz Admin
 * v1.65.0 - Contrato de servicios CRUD
 */
public interface MotivosMesaAyudaAdminService {

    List<MotivoMesaAyudaAdminDTO> obtenerTodos();
    MotivoMesaAyudaAdminDTO obtenerPorId(Long id);
    Page<MotivoMesaAyudaAdminDTO> buscar(String busqueda, String estado, Pageable pageable);
    MotivoMesaAyudaAdminDTO crear(MotivoMesaAyudaRequest request);
    MotivoMesaAyudaAdminDTO actualizar(Long id, MotivoMesaAyudaRequest request);
    MotivoMesaAyudaAdminDTO cambiarEstado(Long id, Boolean nuevoEstado);
    void eliminar(Long id);
    EstadisticasMotivosDTO obtenerEstadisticas();

    record MotivoMesaAyudaRequest(
        String codigo,
        String descripcion,
        Integer orden
    ) {}

    record EstadisticasMotivosDTO(
        Long totalMotivos,
        Long motivosActivos,
        Long motivosInactivos
    ) {}
}
