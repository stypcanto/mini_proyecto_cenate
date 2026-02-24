package com.styp.cenate.api.disponibilidad;

import com.styp.cenate.dto.disponibilidad.CtrPeriodoRequest;
import com.styp.cenate.dto.disponibilidad.CtrPeriodoResponse;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.service.disponibilidad.CtrPeriodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de periodos de control por área.
 * Tabla: ctr_periodo
 *
 * Base URL: /api/ctr-periodos
 */
@RestController
@RequestMapping("/api/ctr-periodos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.241:5173",
        "http://10.0.89.239:5173"
})
public class CtrPeriodoController {

    private final CtrPeriodoService service;
    private final UsuarioRepository usuarioRepository;

    // ============================================================
    // Listar periodos
    // ============================================================

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<List<CtrPeriodoResponse>> listarTodos() {
        log.info("Listando todos los periodos de control");
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/abiertos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<List<CtrPeriodoResponse>> listarAbiertos() {
        log.info("Listando periodos de control abiertos");
        return ResponseEntity.ok(service.listarAbiertos());
    }

    @GetMapping("/vigentes")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<List<CtrPeriodoResponse>> listarVigentes() {
        log.info("Listando periodos de control vigentes");
        return ResponseEntity.ok(service.listarVigentes());
    }

    @GetMapping("/anios")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<List<Integer>> listarAnios() {
        log.info("Listando años disponibles");
        return ResponseEntity.ok(service.listarAnios());
    }

    @GetMapping("/area/{idArea}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<List<CtrPeriodoResponse>> listarPorArea(@PathVariable("idArea") Long idArea) {
        log.info("Listando periodos para área: {}", idArea);
        return ResponseEntity.ok(service.listarPorArea(idArea));
    }

    @GetMapping("/area/{idArea}/estado/{estado}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<List<CtrPeriodoResponse>> listarPorAreaYEstado(
            @PathVariable("idArea") Long idArea,
            @PathVariable("estado") String estado) {
        log.info("Listando periodos para área: {} con estado: {}", idArea, estado);
        return ResponseEntity.ok(service.listarPorAreaYEstado(idArea, estado));
    }

    @GetMapping("/area/{idArea}/anios")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<List<Integer>> listarAniosPorArea(@PathVariable("idArea") Long idArea) {
        log.info("Listando años para área: {}", idArea);
        return ResponseEntity.ok(service.listarAniosPorArea(idArea));
    }

    // ============================================================
    // Obtener / CRUD básico
    // ============================================================

    @GetMapping("/{periodo}/area/{idArea}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<CtrPeriodoResponse> obtenerPorId(
            @PathVariable("periodo") String periodo,
            @PathVariable("idArea") Long idArea) {
        log.info("Obteniendo periodo: {} para área: {}", periodo, idArea);
        return ResponseEntity.ok(service.obtenerPorId(periodo, idArea));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<CtrPeriodoResponse> crear(
            @Valid @RequestBody CtrPeriodoRequest request,
    		@AuthenticationPrincipal UserDetails userDetails) {
        Long coordinadorId = obtenerIdUsuario(userDetails);
        
        // idArea se obtiene automáticamente desde dim_personal_cnt en el service
        log.info("Creando periodo: {} por usuario ID: {} (área se obtiene de dim_personal_cnt)", 
                request.getPeriodo(), coordinadorId);
        
        CtrPeriodoResponse response = service.crear(request, coordinadorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{periodo}/area/{idArea}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<CtrPeriodoResponse> actualizar(
            @PathVariable("periodo") String periodo,
            @PathVariable("idArea") Long idArea,
            @Valid @RequestBody CtrPeriodoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = obtenerIdUsuario(userDetails);
        log.info("Actualizando periodo: {} área: {} por usuario ID: {}", periodo, idArea, usuarioId);
        
        return ResponseEntity.ok(service.actualizar(periodo, idArea, request, usuarioId));
    }

    @PutMapping("/{periodo}/area/{idArea}/estado")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<CtrPeriodoResponse> cambiarEstado(
            @PathVariable("periodo") String periodo,
            @PathVariable("idArea") Long idArea,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        String nuevoEstado = body.get("estado");
        Long usuarioId = obtenerIdUsuario(userDetails);
        log.info("Cambiando estado del periodo: {} área: {} a {} por usuario ID: {}", 
                periodo, idArea, nuevoEstado, usuarioId);
        
        return ResponseEntity.ok(service.cambiarEstado(periodo, idArea, nuevoEstado, usuarioId));
    }

    @DeleteMapping("/{periodo}/area/{idArea}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'COORD. TELE URGENCIAS Y TRIAJE', 'COORD. TELE APOYO AL DIAGNOSTICO', 'COORD. ESPECIALIDADES')")
    public ResponseEntity<Void> eliminar(
            @PathVariable("periodo") String periodo,
            @PathVariable("idArea") Long idArea) {
        log.info("Eliminando periodo: {} área: {}", periodo, idArea);
        service.eliminar(periodo, idArea);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // Métodos auxiliares
    // ============================================================

    /**
     * Obtiene el ID del usuario autenticado.
     */
    private Long obtenerIdUsuario(UserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }
        return usuarioRepository.findByNameUser(userDetails.getUsername())
                .map(Usuario::getIdUser)
                .orElse(null);
    }
}
