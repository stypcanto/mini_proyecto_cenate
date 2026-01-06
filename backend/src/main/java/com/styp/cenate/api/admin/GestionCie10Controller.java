package com.styp.cenate.api.admin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.Cie10Response;
import com.styp.cenate.service.cie10.Cie10Service;

import java.util.List;

/**
 * Controlador REST para gestionar CIE10.
 * Replaces Cie10AdminController. Uses Service returning DTOs.
 */
@RestController
@RequestMapping("/api/admin/cie10")
@Slf4j
public class GestionCie10Controller {

    private final Cie10Service service;

    public GestionCie10Controller(Cie10Service service) {
        this.service = service;
        System.out.println(
                ">>>>>>>>>>>>>>>>>>>>>>>>>>>> GESTION CIE10 CONTROLLER LOADED (FULL DEPS) <<<<<<<<<<<<<<<<<<<<<<<<<<<<");
        log.info(
                ">>>>>>>>>>>>>>>>>>>>>>>>>>>> GESTION CIE10 CONTROLLER LOADED (FULL DEPS) <<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> listar(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false, defaultValue = "idCie10") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String direction,
            @RequestParam(required = false) String codigo,
            @RequestParam(required = false) String descripcion) {
        
        log.info("📋 Parámetros recibidos - page: {}, size: {}, sortBy: {}, direction: {}, codigo: '{}', descripcion: '{}'", 
            page, size, sortBy, direction, codigo, descripcion);
        
        // Si no se especifican page y size, retornar lista completa (compatibilidad hacia atrás)
        if (page == null || size == null) {
            log.info("📋 Listando todos los CIE10 (sin paginación)");
            List<Cie10Response> lista = service.listar();
            log.info("📋 Controller encontró {} registros", lista.size());
            return ResponseEntity.ok(lista);
        }
        
        // Validar parámetros
        if (page < 0) {
            page = 0;
        }
        if (size <= 0) {
            size = 30; // Valor por defecto
        }
        if (size > 100) {
            size = 100; // Límite máximo
        }
        
        try {
            Page<Cie10Response> pagina;
            
            // Si hay filtros de búsqueda, usar método de búsqueda
            if ((codigo != null && !codigo.trim().isEmpty()) || 
                (descripcion != null && !descripcion.trim().isEmpty())) {
                log.info("🔍 Buscando CIE10 con filtros - Código: '{}', Descripción: '{}'", codigo, descripcion);
                pagina = service.buscar(page, size, sortBy, direction, codigo, descripcion);
            } else {
                // Sin filtros, listar todos paginados
                log.info("📋 Listando CIE10 paginados - Página: {}, Tamaño: {}", page, size);
                pagina = service.listarPaginado(page, size, sortBy, direction);
            }
            
            log.info("📋 Controller retornando página {} de {} con {} elementos de {} total", 
                page, pagina.getTotalPages(), pagina.getNumberOfElements(), pagina.getTotalElements());
            
            // El objeto Page de Spring se serializa automáticamente con la estructura correcta
            // Contiene: content, totalElements, totalPages, size, number, numberOfElements, first, last, empty
            return ResponseEntity.ok(pagina);
        } catch (Exception e) {
            log.error("❌ Error al obtener CIE10 paginados", e);
            // Retornar página vacía en caso de error
            Page<Cie10Response> emptyPage = Page.empty();
            return ResponseEntity.ok(emptyPage);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Cie10Response> obtenerPorId(@PathVariable Long id) {
        log.info("🔍 Obteniendo CIE10 ID: {}", id);
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Cie10Response> crear(@RequestBody Cie10Response request) {
        log.info("➕ Creando CIE10: {}", request.getCodigo());
        return ResponseEntity.ok(service.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Cie10Response> actualizar(@PathVariable Long id,
            @RequestBody Cie10Response request) {
        log.info("✏️ Actualizando CIE10 ID: {}", id);
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("🗑️ Eliminando CIE10 ID: {}", id);
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
