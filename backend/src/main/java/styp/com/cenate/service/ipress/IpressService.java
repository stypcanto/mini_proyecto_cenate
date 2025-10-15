package styp.com.cenate.service.ipress;

import styp.com.cenate.dto.IpressResponse;
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