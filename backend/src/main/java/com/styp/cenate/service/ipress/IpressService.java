package com.styp.cenate.service.ipress;

import com.styp.cenate.dto.IpressResponse;
import java.util.List;

/**
 * Servicio para gestionar las IPRESS (Instituciones Prestadoras de Servicios de Salud)
 */
public interface IpressService {

    List<IpressResponse> getAllIpress();

    List<IpressResponse> getIpressActivas();

    IpressResponse getIpressById(Long id);

    List<IpressResponse> searchIpress(String searchTerm);
}