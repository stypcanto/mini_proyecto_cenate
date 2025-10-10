package styp.com.cenate.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.PersonalExternoRequest;
import styp.com.cenate.dto.PersonalExternoResponse;
import styp.com.cenate.service.PersonalExternoService;

import java.util.List;

@RestController
@RequestMapping("/api/personal-externo")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://10.0.89.13:3000", "http://10.0.89.13:5173"})
public class PersonalExternoController {
    
    private final PersonalExternoService personalExternoService;
    
    /**
     * Obtener todo el personal externo
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<PersonalExternoResponse>> getAllPersonalExterno() {
        log.info("Consultando todo el personal externo");
        List<PersonalExternoResponse> personal = personalExternoService.getAllPersonalExterno();
        return ResponseEntity.ok(personal);
    }
    
    /**
     * Obtener personal externo por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<PersonalExternoResponse> getPersonalExternoById(@PathVariable Long id) {
        log.info("Consultando personal externo por ID: {}", id);
        PersonalExternoResponse personal = personalExternoService.getPersonalExternoById(id);
        return ResponseEntity.ok(personal);
    }
    
    /**
     * Crear nuevo personal externo
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<PersonalExternoResponse> createPersonalExterno(@Valid @RequestBody PersonalExternoRequest request) {
        log.info("Creando nuevo personal externo");
        PersonalExternoResponse personal = personalExternoService.createPersonalExterno(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(personal);
    }
    
    /**
     * Actualizar personal externo
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<PersonalExternoResponse> updatePersonalExterno(
            @PathVariable Long id,
            @Valid @RequestBody PersonalExternoRequest request) {
        log.info("Actualizando personal externo con ID: {}", id);
        PersonalExternoResponse personal = personalExternoService.updatePersonalExterno(id, request);
        return ResponseEntity.ok(personal);
    }
    
    /**
     * Eliminar personal externo
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Void> deletePersonalExterno(@PathVariable Long id) {
        log.info("Eliminando personal externo con ID: {}", id);
        personalExternoService.deletePersonalExterno(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Buscar personal externo
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<PersonalExternoResponse>> searchPersonalExterno(@RequestParam String query) {
        log.info("Buscando personal externo: {}", query);
        List<PersonalExternoResponse> personal = personalExternoService.searchPersonalExterno(query);
        return ResponseEntity.ok(personal);
    }
}
