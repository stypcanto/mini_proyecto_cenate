package com.styp.cenate.api.admin;

import com.styp.cenate.dto.EstadoGestionCitaResponse;
import com.styp.cenate.service.estados_gestion_citas.EstadoGestionCitaService;
import com.styp.cenate.service.estados_gestion_citas.EstadoGestionCitaService.EstadoGestionCitaRequest;
import com.styp.cenate.service.estados_gestion_citas.EstadoGestionCitaService.EstadisticasEstadosDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 📋 Controller REST para Gestión de Estados de Citas
 * v1.33.0 - API REST para CRUD de estados de citas
 *
 * Endpoints:
 * - GET    /api/admin/estados-gestion-citas/todos          → Listar todos activos
 * - GET    /api/admin/estados-gestion-citas/{id}           → Obtener por ID
 * - GET    /api/admin/estados-gestion-citas/buscar         → Buscar con filtros
 * - GET    /api/admin/estados-gestion-citas/estadisticas   → Estadísticas
 * - POST   /api/admin/estados-gestion-citas                → Crear nuevo
 * - PUT    /api/admin/estados-gestion-citas/{id}           → Actualizar
 * - PATCH  /api/admin/estados-gestion-citas/{id}/estado    → Cambiar estado
 * - DELETE /api/admin/estados-gestion-citas/{id}           → Eliminar
 */
@RestController
@RequestMapping("/api/admin/estados-gestion-citas")
@RequiredArgsConstructor
@Slf4j
public class GestionEstadosGestionCitasController {

    private final EstadoGestionCitaService estadoService;

    /**
     * GET /api/admin/estados-gestion-citas/todos
     *
     * Obtiene todos los estados activos sin paginación
     * Útil para llenar selects/dropdowns en frontend
     *
     * @return Lista de todos los estados activos
     */
    @GetMapping("/todos")
    public ResponseEntity<List<EstadoGestionCitaResponse>> obtenerTodosEstados() {
        log.info("📋 GET /api/admin/estados-gestion-citas/todos");
        return ResponseEntity.ok(estadoService.obtenerTodosEstadosActivos());
    }

    /**
     * GET /api/admin/estados-gestion-citas/buscar
     *
     * Búsqueda paginada de estados con filtros
     * Búsqueda en: código y descripción
     *
     * @param busqueda término de búsqueda (opcional)
     * @param estado filtro por estado 'A' o 'I' (opcional)
     * @param pageable paginación (page, size, sort)
     * @return Página de resultados
     */
    @GetMapping("/buscar")
    public ResponseEntity<Page<EstadoGestionCitaResponse>> buscarEstados(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String estado,
            Pageable pageable) {
        log.info("🔎 GET /api/admin/estados-gestion-citas/buscar - busqueda={}, estado={}", busqueda, estado);
        return ResponseEntity.ok(estadoService.buscarEstados(busqueda, estado, pageable));
    }

    /**
     * GET /api/admin/estados-gestion-citas/estadisticas
     *
     * Obtiene estadísticas del módulo
     *
     * @return Estadísticas (total, activos, inactivos)
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasEstadosDTO> obtenerEstadisticas() {
        log.info("📊 GET /api/admin/estados-gestion-citas/estadisticas");
        return ResponseEntity.ok(estadoService.obtenerEstadisticas());
    }

    /**
     * GET /api/admin/estados-gestion-citas/{id}
     *
     * Obtiene un estado específico por ID
     *
     * @param id ID del estado
     * @return Estado encontrado o 404
     */
    @GetMapping("/{id}")
    public ResponseEntity<EstadoGestionCitaResponse> obtenerEstadoPorId(@PathVariable Long id) {
        log.info("🔍 GET /api/admin/estados-gestion-citas/{}", id);
        return ResponseEntity.ok(estadoService.obtenerEstadoPorId(id));
    }

    /**
     * POST /api/admin/estados-gestion-citas
     *
     * Crea un nuevo estado de cita
     *
     * Request body:
     * {
     *   "codEstadoCita": "NUEVO_ESTADO",
     *   "descEstadoCita": "Descripción del nuevo estado"
     * }
     *
     * @param request datos del nuevo estado
     * @return Estado creado con HTTP 200
     */
    @PostMapping
    public ResponseEntity<EstadoGestionCitaResponse> crearEstado(@RequestBody EstadoGestionCitaRequest request) {
        log.info("✏️ POST /api/admin/estados-gestion-citas - codigo={}", request.codEstadoCita());
        return ResponseEntity.ok(estadoService.crearEstado(request));
    }

    /**
     * PUT /api/admin/estados-gestion-citas/{id}
     *
     * Actualiza un estado existente
     * Solo actualiza la descripción (el código no se puede cambiar)
     *
     * Request body:
     * {
     *   "codEstadoCita": "ESTADO_ACTUALIZADO",
     *   "descEstadoCita": "Nueva descripción"
     * }
     *
     * @param id ID del estado a actualizar
     * @param request nuevos datos
     * @return Estado actualizado
     */
    @PutMapping("/{id}")
    public ResponseEntity<EstadoGestionCitaResponse> actualizarEstado(
            @PathVariable Long id,
            @RequestBody EstadoGestionCitaRequest request) {
        log.info("✏️ PUT /api/admin/estados-gestion-citas/{} - codigo={}", id, request.codEstadoCita());
        return ResponseEntity.ok(estadoService.actualizarEstado(id, request));
    }

    /**
     * PATCH /api/admin/estados-gestion-citas/{id}/estado
     *
     * Cambia el estado de actividad del registro
     * Valores válidos: 'A' (activo) o 'I' (inactivo)
     *
     * Query params:
     * ?nuevoEstado=A  → Activar
     * ?nuevoEstado=I  → Inactivar
     *
     * @param id ID del estado
     * @param nuevoEstado 'A' o 'I'
     * @return Estado actualizado
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<EstadoGestionCitaResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String nuevoEstado) {
        log.info("🔄 PATCH /api/admin/estados-gestion-citas/{}/estado - nuevoEstado={}", id, nuevoEstado);
        return ResponseEntity.ok(estadoService.cambiarEstado(id, nuevoEstado));
    }

    /**
     * DELETE /api/admin/estados-gestion-citas/{id}
     *
     * Elimina (inactiva) un estado de cita
     * Implementa eliminación lógica (no elimina de BD, solo marca como inactivo)
     *
     * @param id ID del estado a eliminar
     * @return HTTP 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEstado(@PathVariable Long id) {
        log.info("🗑️ DELETE /api/admin/estados-gestion-citas/{}", id);
        estadoService.eliminarEstado(id);
        return ResponseEntity.noContent().build();
    }
}
