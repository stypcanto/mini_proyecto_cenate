package com.styp.cenate.api.mbac;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.mbac.ModuloSistemaResponse;
import com.styp.cenate.dto.mbac.PaginaModuloResponse;
import com.styp.cenate.service.mbac.ModuloSistemaService;

import java.util.List;

/**
 * Controlador para la gestión de módulos y páginas del sistema MBAC (Modular-Based Access Control).
 * Permite listar módulos, sus páginas activas y buscar páginas por ruta.
 *
 * @author CENATE Development Team
 * @version 1.3
 */
@Slf4j
@RestController
@RequestMapping("/api/mbac/modulos")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.239:5173"
})
public class ModuloSistemaController {

    private final ModuloSistemaService moduloService;

    // 🔹 DTO simple para respuestas de error
    record ErrorResponse(String message) {}

    // =========================================================================================
    // 🔸 1. Listar todos los módulos activos con sus páginas y permisos
    // =========================================================================================
    @GetMapping
    public ResponseEntity<?> listarModulos() {
        try {
            log.info("📦 Listando todos los módulos MBAC...");
            
            List<ModuloSistemaResponse> modulos = moduloService.obtenerTodosLosModulos();
            
            if (modulos.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .body(new ErrorResponse("No hay módulos registrados."));
            }
            
            return ResponseEntity.ok(modulos);
            
        } catch (Exception e) {
            log.error("❌ Error al listar módulos MBAC: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error interno al listar los módulos."));
        }
    }

    // =========================================================================================
    // 🔸 2. Listar páginas activas por ID de módulo con sus permisos
    // =========================================================================================
    @GetMapping("/{id}/paginas")
    public ResponseEntity<?> listarPaginasPorModulo(@PathVariable Integer id) {
        try {
            log.info("📄 Listando páginas activas del módulo ID {}", id);
            
            List<PaginaModuloResponse> paginas = moduloService.obtenerPaginasPorModulo(id);
            
            if (paginas.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("No se encontraron páginas activas para este módulo."));
            }
            
            return ResponseEntity.ok(paginas);
            
        } catch (Exception e) {
            log.error("❌ Error al listar páginas del módulo {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error interno al listar las páginas del módulo."));
        }
    }

    // =========================================================================================
    // 🔸 3. Buscar página por ruta (ej: /roles/admin/personal)
    // =========================================================================================
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarPaginaPorRuta(@RequestParam String ruta) {
        try {
            log.info("🔍 Buscando página por ruta: {}", ruta);
            
            return moduloService.buscarPaginaPorRuta(ruta)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ErrorResponse("No se encontró una página con la ruta especificada.")));
                            
        } catch (Exception e) {
            log.error("❌ Error al buscar página por ruta {}: {}", ruta, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Ha ocurrido un error interno al buscar la página por ruta."));
        }
    }
}
