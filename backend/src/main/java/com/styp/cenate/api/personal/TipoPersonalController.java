package com.styp.cenate.api.personal;

import com.styp.cenate.dto.DimTipoPersonalDTO;
import com.styp.cenate.service.personal.DimTipoPersonalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 🏷️ Controlador REST para gestionar Tipos de Personal
 * Endpoints específicos para CRUD de dim_tipo_personal
 */
@RestController
@RequestMapping("/api/tipos-personal")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Tipos de Personal", description = "API para gestionar tipos de personal")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.239:5173"
})
public class TipoPersonalController {

    private final DimTipoPersonalService tipoPersonalService;

    /**
     * Obtiene todos los tipos de personal
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    @Operation(summary = "Obtener todos los tipos de personal", description = "Retorna una lista de todos los tipos de personal")
    public ResponseEntity<Map<String, Object>> findAll() {
        try {
            log.info("📋 Obteniendo todos los tipos de personal");
            List<DimTipoPersonalDTO> tipos = tipoPersonalService.listarTodos();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tipos);
            response.put("total", tipos.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al obtener tipos de personal: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error al obtener tipos de personal"));
        }
    }

    /**
     * Obtiene todos los tipos de personal activos
     */
    @GetMapping("/activos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    @Operation(summary = "Obtener tipos de personal activos", description = "Retorna una lista de tipos de personal activos")
    public ResponseEntity<Map<String, Object>> findAllActivos() {
        try {
            log.info("📋 Obteniendo tipos de personal activos");
            List<DimTipoPersonalDTO> tipos = tipoPersonalService.listarActivos();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tipos);
            response.put("total", tipos.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al obtener tipos activos: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error al obtener tipos activos"));
        }
    }

    /**
     * Obtiene un tipo de personal por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    @Operation(summary = "Obtener tipo de personal por ID", description = "Retorna un tipo de personal específico por su ID")
    public ResponseEntity<Map<String, Object>> findById(
            @Parameter(description = "ID del tipo de personal") @PathVariable Long id) {
        try {
            log.info("🔍 Buscando tipo de personal con ID: {}", id);
            DimTipoPersonalDTO tipo = tipoPersonalService.buscarPorId(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", tipo);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Tipo de personal no encontrado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al obtener tipo de personal: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error al obtener tipo de personal"));
        }
    }

    /**
     * Crea un nuevo tipo de personal
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    @Operation(summary = "Crear tipo de personal", description = "Crea un nuevo tipo de personal")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody DimTipoPersonalDTO request) {
        try {
            log.info("✅ Creando nuevo tipo: {}", request.getDescTipPers());
            DimTipoPersonalDTO tipo = tipoPersonalService.crear(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tipo de personal creado exitosamente");
            response.put("data", tipo);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Error al crear tipo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al crear tipo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error al crear tipo de personal"));
        }
    }

    /**
     * Actualiza un tipo de personal existente
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    @Operation(summary = "Actualizar tipo de personal", description = "Actualiza un tipo de personal existente")
    public ResponseEntity<Map<String, Object>> update(
            @Parameter(description = "ID del tipo de personal") @PathVariable Long id,
            @Valid @RequestBody DimTipoPersonalDTO request) {
        try {
            log.info("🔄 Actualizando tipo con ID: {}", id);
            DimTipoPersonalDTO tipo = tipoPersonalService.actualizar(id, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tipo de personal actualizado exitosamente");
            response.put("data", tipo);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al actualizar tipo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al actualizar tipo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error al actualizar tipo de personal"));
        }
    }

    /**
     * Elimina un tipo de personal
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN')")
    @Operation(summary = "Eliminar tipo de personal", description = "Elimina un tipo de personal")
    public ResponseEntity<Map<String, Object>> delete(
            @Parameter(description = "ID del tipo de personal") @PathVariable Long id) {
        try {
            log.info("🗑️ Eliminando tipo con ID: {}", id);
            tipoPersonalService.eliminar(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tipo de personal eliminado exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al eliminar tipo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al eliminar tipo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error al eliminar tipo de personal"));
        }
    }
}
