package com.styp.cenate.service.ipress;

import com.styp.cenate.dto.IpressRequest;
import com.styp.cenate.dto.IpressResponse;
import com.styp.cenate.dto.ActualizarModalidadIpressRequest;
import com.styp.cenate.dto.ModuloDisponibleDTO;
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

    /**
     * Actualiza la modalidad de atención de la IPRESS del usuario logueado (Personal Externo)
     * @param request datos de modalidad a actualizar
     * @return IPRESS actualizada
     */
    IpressResponse actualizarModalidadPorUsuarioActual(ActualizarModalidadIpressRequest request);

    /**
     * Obtiene la IPRESS asignada al usuario logueado (Personal Externo)
     * @return IPRESS del usuario logueado
     */
    IpressResponse obtenerIpressPorUsuarioActual();

    /**
     * Obtiene los módulos disponibles (habilitados) para la IPRESS del usuario logueado
     * @return Lista de módulos disponibles con información de navegación
     */
    List<ModuloDisponibleDTO> obtenerModulosDisponibles();

    /**
     * Obtiene los módulos disponibles para una IPRESS específica
     * @param idIpress ID de la IPRESS
     * @return Lista de módulos disponibles
     */
    List<ModuloDisponibleDTO> obtenerModulosDisponiblesPorIpress(Long idIpress);

    // ===========================
    // ELIMINAR (DELETE)
    // ===========================
    /**
     * Elimina una IPRESS (solo SUPERADMIN)
     * @param id ID de la IPRESS a eliminar
     */
    void deleteIpress(Long id);
}