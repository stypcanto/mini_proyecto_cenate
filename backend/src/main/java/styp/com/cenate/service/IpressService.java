package styp.com.cenate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.dto.IpressResponse;
import styp.com.cenate.model.Ipress;
import styp.com.cenate.repository.IpressRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar las IPRESS (Instituciones Prestadoras de Servicios de Salud)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IpressService {
    
    private final IpressRepository ipressRepository;
    
    /**
     * Obtener todas las IPRESS
     */
    @Transactional(readOnly = true)
    public List<IpressResponse> getAllIpress() {
        log.info("Obteniendo todas las IPRESS");
        return ipressRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener IPRESS activas
     */
    @Transactional(readOnly = true)
    public List<IpressResponse> getIpressActivas() {
        log.info("Obteniendo IPRESS activas");
        return ipressRepository.findByStatIpress("A").stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener IPRESS por ID
     */
    @Transactional(readOnly = true)
    public IpressResponse getIpressById(Long id) {
        log.info("Obteniendo IPRESS con ID: {}", id);
        Ipress ipress = ipressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("IPRESS no encontrada"));
        return convertToResponse(ipress);
    }
    
    /**
     * Buscar IPRESS por nombre
     */
    @Transactional(readOnly = true)
    public List<IpressResponse> searchIpress(String searchTerm) {
        log.info("Buscando IPRESS con término: {}", searchTerm);
        return ipressRepository.findByDescIpressContainingIgnoreCase(searchTerm).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    private IpressResponse convertToResponse(Ipress ipress) {
        return IpressResponse.builder()
                .idIpress(ipress.getIdIpress())
                .codIpress(ipress.getCodIpress())
                .descIpress(ipress.getDescIpress())
                .idRed(ipress.getIdRed())
                .idNivAten(ipress.getIdNivAten())
                .idModAten(ipress.getIdModAten())
                .direcIpress(ipress.getDirecIpress())
                .idTipIpress(ipress.getIdTipIpress())
                .idDist(ipress.getIdDist())
                .latIpress(ipress.getLatIpress())
                .longIpress(ipress.getLongIpress())
                .gmapsUrlIpress(ipress.getGmapsUrlIpress())
                .statIpress(ipress.getStatIpress())
                .createAt(ipress.getCreateAt())
                .updateAt(ipress.getUpdateAt())
                .build();
    }
}
