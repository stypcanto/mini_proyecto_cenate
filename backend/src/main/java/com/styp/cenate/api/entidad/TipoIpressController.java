package com.styp.cenate.api.entidad;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.model.TipoIpress;
import com.styp.cenate.service.tipoipress.TipoIpressService;

import java.util.List;

@RestController
@RequestMapping("/api/tipo-ipress")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.239:5173"
})
@Data
public class TipoIpressController {

    private final TipoIpressService tipoIpressService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<TipoIpress>> listar() {
        log.info("📋 Consultando todos los tipos de IPRESS");
        return ResponseEntity.ok(tipoIpressService.listar());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<TipoIpress> obtenerPorId(@PathVariable Long id) {
        log.info("🔍 Consultando tipo IPRESS con ID: {}", id);
        return ResponseEntity.ok(tipoIpressService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<TipoIpress> crear(@RequestBody TipoIpress tipoIpress) {
        log.info("🧩 Creando nuevo tipo IPRESS: {}", tipoIpress.getDescripcion());
        return ResponseEntity.ok(tipoIpressService.crear(tipoIpress));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<TipoIpress> actualizar(@PathVariable Long id, @RequestBody TipoIpress tipoIpress) {
        log.info("✏️ Actualizando tipo IPRESS con ID: {}", id);
        return ResponseEntity.ok(tipoIpressService.actualizar(id, tipoIpress));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.warn("🗑️ Eliminando tipo IPRESS con ID: {}", id);
        tipoIpressService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
