package com.styp.cenate.api.area;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.PersonalRequest;
import com.styp.cenate.dto.PersonalResponse;
import com.styp.cenate.service.personal.PersonalExternoService;

import java.util.List;

/**
 * 🎯 Controlador REST para la gestión del Personal Externo
 * Permite CRUD completo y búsquedas avanzadas.
 */
@RestController
@RequestMapping("/api/personal-externo")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.239:5173"
})
public class PersonalExternoController {

    private final PersonalExternoService personalExternoService;

    // ============================================================
    // 🔹 CONSULTAS
    // ============================================================

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<List<PersonalResponse>> getAllPersonalExterno() {
        log.info("📋 Obteniendo todo el personal externo");
        List<PersonalResponse> personal = personalExternoService.getAllPersonalExterno();
        return ResponseEntity.ok(personal);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<PersonalResponse> getPersonalExternoById(@PathVariable Long id) {
        log.info("🔍 Obteniendo personal externo con ID: {}", id);
        PersonalResponse personal = personalExternoService.getPersonalExternoById(id);
        return ResponseEntity.ok(personal);
    }

    // ============================================================
    // 🔹 CREACIÓN
    // ============================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<?> createPersonalExterno(@Valid @RequestBody PersonalRequest request) {
        log.info("🆕 Creando nuevo personal externo: {} {}", request.getNombres(), request.getApellidoPaterno());

        // Aseguramos que siempre sea tipo EXTERNO
        request.setTipoPersonal("EXTERNO");

        // Validación básica
        if (request.getIdIpress() == null) {
            log.warn("⚠️ No se proporcionó el ID de IPRESS");
            return ResponseEntity.badRequest().body("El ID de IPRESS es obligatorio.");
        }

        PersonalResponse personal = personalExternoService.createPersonalExterno(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(personal);
    }

    // ============================================================
    // 🔹 ACTUALIZACIÓN
    // ============================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<PersonalResponse> updatePersonalExterno(
            @PathVariable Long id,
            @Valid @RequestBody PersonalRequest request) {
        log.info("✏️ Actualizando personal externo con ID: {}", id);

        request.setTipoPersonal("EXTERNO"); // aseguramos consistencia

        PersonalResponse personal = personalExternoService.updatePersonalExterno(id, request);
        return ResponseEntity.ok(personal);
    }

    // ============================================================
    // 🔹 ELIMINACIÓN
    // ============================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<Void> deletePersonalExterno(@PathVariable Long id) {
        log.warn("🗑️ Eliminando personal externo con ID: {}", id);
        personalExternoService.deletePersonalExterno(id);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // 🔹 BÚSQUEDAS
    // ============================================================

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<?> searchPersonalExterno(@RequestParam("query") String query) {
        if (query == null || query.trim().isEmpty()) {
            log.warn("⚠️ El término de búsqueda está vacío");
            return ResponseEntity.badRequest().body("El término de búsqueda no puede estar vacío.");
        }

        log.info("🔎 Buscando personal externo con término: '{}'", query);
        List<PersonalResponse> personal = personalExternoService.searchPersonalExterno(query);
        return ResponseEntity.ok(personal);
    }

    @GetMapping("/ipress/{idIpress}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<List<PersonalResponse>> getPersonalExternoByIpress(@PathVariable Long idIpress) {
        log.info("🏥 Obteniendo personal externo por IPRESS ID: {}", idIpress);
        List<PersonalResponse> personal = personalExternoService.getPersonalExternoByIpress(idIpress);
        return ResponseEntity.ok(personal);
    }

    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<PersonalResponse> getPersonalExternoByUsuario(@PathVariable Long idUsuario) {
        log.info("👤 Obteniendo personal externo por usuario ID: {}", idUsuario);
        PersonalResponse personal = personalExternoService.getPersonalExternoByUsuario(idUsuario);
        return ResponseEntity.ok(personal);
    }
}