package styp.com.cenate.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.TipoDocumentoResponse;
import styp.com.cenate.service.TipoDocumentoService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tipos-documento")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost"})
public class TipoDocumentoController {
    
    private final TipoDocumentoService tipoDocumentoService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<TipoDocumentoResponse>> getAllTiposDocumento() {
        log.info("Consultando todos los tipos de documento");
        List<TipoDocumentoResponse> tipos = tipoDocumentoService.getAllTiposDocumento();
        return ResponseEntity.ok(tipos);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<TipoDocumentoResponse> getTipoDocumentoById(@PathVariable Long id) {
        log.info("Consultando tipo de documento por ID: {}", id);
        TipoDocumentoResponse tipo = tipoDocumentoService.getTipoDocumentoById(id);
        return ResponseEntity.ok(tipo);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<TipoDocumentoResponse> createTipoDocumento(@RequestBody Map<String, String> request) {
        log.info("Creando nuevo tipo de documento");
        TipoDocumentoResponse tipo = tipoDocumentoService.createTipoDocumento(
            request.get("descTipDoc"),
            request.getOrDefault("statTipDoc", "A")
        );
        return ResponseEntity.ok(tipo);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<TipoDocumentoResponse> updateTipoDocumento(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request) {
        log.info("Actualizando tipo de documento con ID: {}", id);
        TipoDocumentoResponse tipo = tipoDocumentoService.updateTipoDocumento(
            id,
            request.get("descTipDoc"),
            request.get("statTipDoc")
        );
        return ResponseEntity.ok(tipo);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> deleteTipoDocumento(@PathVariable Long id) {
        log.info("Eliminando tipo de documento con ID: {}", id);
        tipoDocumentoService.deleteTipoDocumento(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Tipo de documento eliminado exitosamente");
        return ResponseEntity.ok(response);
    }
}
