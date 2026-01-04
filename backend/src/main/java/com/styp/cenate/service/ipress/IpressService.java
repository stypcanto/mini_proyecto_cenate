package com.styp.cenate.service.ipress;

import com.styp.cenate.dto.IpressRequest;
import com.styp.cenate.dto.IpressResponse;
import java.util.List;

/**
 * Servicio para gestionar las IPRESS (Instituciones Prestadoras de Servicios de Salud)
 */
public interface IpressService {

    // ===========================
    // CONSULTAS (READ)
    // ===========================
    List<IpressResponse> getAllIpress();

    List<IpressResponse> getIpressActivas();

    IpressResponse getIpressById(Long id);

    List<IpressResponse> searchIpress(String searchTerm);

    List<IpressResponse> getIpressActivasPorRed(Long idRed);

    // ===========================
    // CREAR (CREATE)
    // ===========================
    /**
     * Crea una nueva IPRESS
     * @param request datos de la IPRESS a crear
     * @return IPRESS creada
     */
    IpressResponse createIpress(IpressRequest request);

    // ===========================
    // ACTUALIZAR (UPDATE)
    // ===========================
    /**
     * Actualiza una IPRESS existente
     * @param id ID de la IPRESS a actualizar
     * @param request datos actualizados
     * @return IPRESS actualizada
     */
    IpressResponse updateIpress(Long id, IpressRequest request);

    // ===========================
    // ELIMINAR (DELETE)
    // ===========================
    /**
     * Elimina una IPRESS (solo SUPERADMIN)
     * @param id ID de la IPRESS a eliminar
     */
    void deleteIpress(Long id);
}