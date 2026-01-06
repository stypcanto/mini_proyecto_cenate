package com.styp.cenate.api.admin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.MedicamentoResponse;
import com.styp.cenate.service.medicamento.MedicamentoService;

import java.util.List;

/**
 * 💊 Controlador REST para gestionar Medicamentos (Petitorio Nacional).
 * Implementa CRUD completo con búsqueda avanzada y paginación.
 */
@RestController
@RequestMapping("/api/admin/medicamentos")
@Slf4j
public class GestionMedicamentosController {

    private final MedicamentoService service;

    public GestionMedicamentosController(MedicamentoService service) {
        this.service = service;
        System.out.println(
                ">>>>>>>>>>>>>>>>>>>>>>>>>>>> GESTION MEDICAMENTOS CONTROLLER LOADED (FULL DEPS) <<<<<<<<<<<<<<<<<<<<<<<<<<<<");
        log.info(
                ">>>>>>>>>>>>>>>>>>>>>>>>>>>> GESTION MEDICAMENTOS CONTROLLER LOADED (FULL DEPS) <<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    }

    /**
     * 📋 Obtener todos los medicamentos (sin paginación)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Object> listar(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction,
            @RequestParam(required = false) String codMedicamento,
            @RequestParam(required = false) String descMedicamento) {

        log.info("💊 Medicamentos GET - page:{}, size:{}, sortBy:{}, direction:{}, cod:{}, desc:{}",
                page, size, sortBy, direction, codMedicamento, descMedicamento);

        // Si hay parámetros de paginación, usar búsqueda paginada
        if (page != null || codMedicamento != null || descMedicamento != null) {
            int pageNum = page != null ? page : 0;
            int pageSize = size != null ? size : 30;
            String sort = sortBy != null && !sortBy.isEmpty() ? sortBy : "idMedicamento";
            String dir = direction != null && !direction.isEmpty() ? direction : "asc";

            log.info("📄 Búsqueda paginada activada");
            Page<MedicamentoResponse> resultado = service.buscar(pageNum, pageSize, sort, dir, codMedicamento, descMedicamento);
            return ResponseEntity.ok(resultado);
        }

        // Sin parámetros, retornar todos
        log.info("📋 Listando todos los medicamentos");
        List<MedicamentoResponse> lista = service.listar();
        log.info("📋 Controller encontró {} registros", lista.size());
        return ResponseEntity.ok(lista);
    }

    /**
     * 🔍 Obtener un medicamento por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<MedicamentoResponse> obtenerPorId(@PathVariable Long id) {
        log.info("🔍 Obteniendo medicamento ID: {}", id);
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    /**
     * ➕ Crear un nuevo medicamento
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<MedicamentoResponse> crear(@RequestBody MedicamentoResponse request) {
        log.info("➕ Creando medicamento: {}", request.getCodMedicamento());
        return ResponseEntity.ok(service.crear(request));
    }

    /**
     * ✏️ Actualizar un medicamento
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<MedicamentoResponse> actualizar(@PathVariable Long id,
            @RequestBody MedicamentoResponse request) {
        log.info("✏️ Actualizando medicamento ID: {}", id);
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    /**
     * 🗑️ Eliminar un medicamento
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("🗑️ Eliminando medicamento ID: {}", id);
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
