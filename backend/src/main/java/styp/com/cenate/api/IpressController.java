package styp.com.cenate.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.IpressResponse;
import styp.com.cenate.service.IpressService;

import java.util.List;

/**
 * Controlador REST para gestión de IPRESS (Instituciones Prestadoras de Servicios de Salud)
 * 
 * Base URL: /api/ipress
 */
@RestController
@RequestMapping("/api/ipress")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://10.0.89.13:3000", "http://10.0.89.13:5173"})
public class IpressController {
    
    private final IpressService ipressService;
    
    /**
     * Obtener todas las IPRESS
     * 
     * GET /api/ipress
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<IpressResponse>> getAllIpress() {
        log.info("Consultando todas las IPRESS");
        List<IpressResponse> ipress = ipressService.getAllIpress();
        return ResponseEntity.ok(ipress);
    }
    
    /**
     * Obtener IPRESS activas
     * 
     * GET /api/ipress/activas
     */
    @GetMapping("/activas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<IpressResponse>> getIpressActivas() {
        log.info("Consultando IPRESS activas");
        List<IpressResponse> ipress = ipressService.getIpressActivas();
        return ResponseEntity.ok(ipress);
    }
    
    /**
     * Obtener IPRESS por ID
     * 
     * GET /api/ipress/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<IpressResponse> getIpressById(@PathVariable Long id) {
        log.info("Consultando IPRESS por ID: {}", id);
        IpressResponse ipress = ipressService.getIpressById(id);
        return ResponseEntity.ok(ipress);
    }
    
    /**
     * Buscar IPRESS por nombre
     * 
     * GET /api/ipress/buscar?q={termino}
     */
    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<IpressResponse>> searchIpress(@RequestParam String q) {
        log.info("Buscando IPRESS con término: {}", q);
        List<IpressResponse> ipress = ipressService.searchIpress(q);
        return ResponseEntity.ok(ipress);
    }
}
