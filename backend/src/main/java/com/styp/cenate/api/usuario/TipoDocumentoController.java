package com.styp.cenate.api;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.TipoDocumentoResponse;
import com.styp.cenate.service.TipoDocumentoService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 📑 Controlador REST para la gestión de Tipos de Documento.
 * Permite listar, crear, actualizar y eliminar registros.
 */
@RestController
@RequestMapping("/api/tipos-documento")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://10.0.89.13:5173",
                "http://10.0.89.239"
        },
        allowCredentials = "true"
)
@Data
public class TipoDocumentoController {

    private final TipoDocumentoService tipoDocumentoService;

    // ==========================================================
    // 📋 LISTAR TODOS LOS TIPOS DE DOCUMENTO
    // ==========================================================
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<TipoDocumentoResponse>> getAllTiposDocumento() {
        log.info("🟢 Consultando todos los tipos de documento...");
        List<TipoDocumentoResponse> tipos = tipoDocumentoService.getAllTiposDocumento();
        return ResponseEntity.ok(tipos);
    }

    // ==========================================================
    // 📄 OBTENER POR ID
    // ==========================================================
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<TipoDocumentoResponse> getTipoDocumentoById(@PathVariable Long id) {
        log.info("📄 Consultando tipo de documento por ID: {}", id);
        TipoDocumentoResponse tipo = tipoDocumentoService.getTipoDocumentoById(id);
        return ResponseEntity.ok(tipo);
    }

    // ==========================================================
    // 🟢 LISTAR SOLO ACTIVOS
    // ==========================================================
    @GetMapping("/activos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINACION')")
    public ResponseEntity<List<TipoDocumentoResponse>> getTiposDocumentoActivos() {
        log.info("📋 Consultando tipos de documento activos...");
        return ResponseEntity.ok(tipoDocumentoService.getTiposDocumentoActivos());
    }

    // ==========================================================
    // ✳️ CREAR NUEVO TIPO
    // ==========================================================
    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<TipoDocumentoResponse> createTipoDocumento(@RequestBody Map<String, String> request) {
        log.info("🟢 Creando nuevo tipo de documento: {}", request);
        TipoDocumentoResponse tipo = tipoDocumentoService.createTipoDocumento(
                request.get("descTipDoc"),
                request.getOrDefault("statTipDoc", "A")
        );
        return ResponseEntity.ok(tipo);
    }

    // ==========================================================
    // 📝 ACTUALIZAR EXISTENTE
    // ==========================================================
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<TipoDocumentoResponse> updateTipoDocumento(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        log.info("✏️ Actualizando tipo de documento con ID: {}", id);
        TipoDocumentoResponse tipo = tipoDocumentoService.updateTipoDocumento(
                id,
                request.get("descTipDoc"),
                request.get("statTipDoc")
        );
        return ResponseEntity.ok(tipo);
    }

    // ==========================================================
    // ❌ ELIMINAR
    // ==========================================================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, String>> deleteTipoDocumento(@PathVariable Long id) {
        log.warn("🗑️ Eliminando tipo de documento con ID: {}", id);
        tipoDocumentoService.deleteTipoDocumento(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "✅ Tipo de documento eliminado exitosamente");
        return ResponseEntity.ok(response);
    }
}
