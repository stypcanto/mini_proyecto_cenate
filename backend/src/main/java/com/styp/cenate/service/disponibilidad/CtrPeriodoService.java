package com.styp.cenate.service.disponibilidad;

import com.styp.cenate.dto.disponibilidad.CtrPeriodoRequest;
import com.styp.cenate.dto.disponibilidad.CtrPeriodoResponse;

import java.util.List;

/**
 * Servicio para gestión de periodos de control por área.
 * Tabla: ctr_periodo
 * 
 * NOTA: Al crear un periodo, el servicio obtiene automáticamente el id_area
 * desde dim_personal_cnt usando el id_usuario autenticado.
 */
public interface CtrPeriodoService {

    /**
     * Lista todos los periodos.
     */
    List<CtrPeriodoResponse> listarTodos();

    /**
     * Lista periodos abiertos (ABIERTO o REABIERTO).
     */
    List<CtrPeriodoResponse> listarAbiertos();

    /**
     * Lista periodos vigentes (abiertos y dentro del rango de fechas).
     */
    List<CtrPeriodoResponse> listarVigentes();

    /**
     * Lista periodos por área específica.
     */
    List<CtrPeriodoResponse> listarPorArea(Long idArea);

    /**
     * Lista periodos por área y estado.
     */
    List<CtrPeriodoResponse> listarPorAreaYEstado(Long idArea, String estado);

    /**
     * Lista años disponibles.
     */
    List<Integer> listarAnios();

    /**
     * Lista años por área.
     */
    List<Integer> listarAniosPorArea(Long idArea);

    /**
     * Obtiene un periodo por su clave compuesta.
     */
    CtrPeriodoResponse obtenerPorId(String periodo, Long idArea);

    /**
     * Crea un nuevo periodo.
     */
    CtrPeriodoResponse crear(CtrPeriodoRequest request, Long coordinadorId);

    /**
     * Actualiza un periodo existente.
     */
    CtrPeriodoResponse actualizar(String periodo, Long idArea, CtrPeriodoRequest request, Long usuarioId);

    /**
     * Cambia el estado de un periodo.
     */
    CtrPeriodoResponse cambiarEstado(String periodo, Long idArea, String nuevoEstado, Long usuarioId);

    /**
     * Elimina un periodo.
     */
    void eliminar(String periodo, Long idArea);
}
