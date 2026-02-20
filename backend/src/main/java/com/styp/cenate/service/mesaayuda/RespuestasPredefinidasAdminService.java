package com.styp.cenate.service.mesaayuda;

import com.styp.cenate.dto.mesaayuda.RespuestaPredefinidaAdminDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Servicio de Respuestas Predefinidas Mesa de Ayuda - Interfaz Admin
 * v1.65.10 - Contrato de servicios CRUD
 */
public interface RespuestasPredefinidasAdminService {

    List<RespuestaPredefinidaAdminDTO> obtenerTodos();
    RespuestaPredefinidaAdminDTO obtenerPorId(Long id);
    Page<RespuestaPredefinidaAdminDTO> buscar(String busqueda, String estado, Pageable pageable);
    RespuestaPredefinidaAdminDTO crear(RespuestaPredefinidaRequest request);
    RespuestaPredefinidaAdminDTO actualizar(Long id, RespuestaPredefinidaRequest request);
    RespuestaPredefinidaAdminDTO cambiarEstado(Long id, Boolean nuevoEstado);
    void eliminar(Long id);
    EstadisticasRespuestasDTO obtenerEstadisticas();

    record RespuestaPredefinidaRequest(
        String codigo,
        String descripcion,
        Boolean esOtros,
        Integer orden
    ) {}

    record EstadisticasRespuestasDTO(
        Long totalRespuestas,
        Long respuestasActivas,
        Long respuestasInactivas
    ) {}
}
