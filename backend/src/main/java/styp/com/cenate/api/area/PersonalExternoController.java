package styp.com.cenate.api.area;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.PersonalRequest;
import styp.com.cenate.dto.PersonalResponse;
import styp.com.cenate.service.personal.PersonalExternoService;

import java.util.List;

/**
 * Controlador REST para gestión de Personal Externo
 */
@RestController
@RequestMapping("/api/personal-externo")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PersonalExternoController {

    private final PersonalExternoService personalExternoService;

    /**
     * Obtiene todo el personal externo
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<List<PersonalResponse>> getAllPersonalExterno() {
        log.info("Obteniendo todo el personal externo");
        List<PersonalResponse> personal = personalExternoService.getAllPersonalExterno();
        return ResponseEntity.ok(personal);
    }

    /**
     * Obtiene personal externo por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<PersonalResponse> getPersonalExternoById(@PathVariable Long id) {
        log.info("Obteniendo personal externo con ID: {}", id);
        PersonalResponse personal = personalExternoService.getPersonalExternoById(id);
        return ResponseEntity.ok(personal);
    }

    /**
     * Crea un nuevo personal externo
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<PersonalResponse> createPersonalExterno(@Valid @RequestBody PersonalRequest request) {
        log.info("Creando nuevo personal externo: {} {}", request.getNombres(), request.getApellidoPaterno());

        // Asegurarse de que el tipo sea EXTERNO
        request.setTipoPersonal("EXTERNO");

        // Validación básica: IPRESS obligatoria
        if (request.getIdIpress() == null) {
            return ResponseEntity.badRequest().body(null);
        }

        PersonalResponse personal = personalExternoService.createPersonalExterno(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(personal);
    }

    /**
     * Actualiza un personal externo existente
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<PersonalResponse> updatePersonalExterno(
            @PathVariable Long id,
            @Valid @RequestBody PersonalRequest request) {
        log.info("Actualizando personal externo con ID: {}", id);

        // Asegurarse de que el tipo sea EXTERNO
        request.setTipoPersonal("EXTERNO");

        PersonalResponse personal = personalExternoService.updatePersonalExterno(id, request);
        return ResponseEntity.ok(personal);
    }

    /**
     * Elimina un personal externo
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<Void> deletePersonalExterno(@PathVariable Long id) {
        log.info("Eliminando personal externo con ID: {}", id);
        personalExternoService.deletePersonalExterno(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Busca personal externo por término de búsqueda
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<List<PersonalResponse>> searchPersonalExterno(@RequestParam("searchTerm") String searchTerm) {
        log.info("Buscando personal externo con término: {}", searchTerm);
        List<PersonalResponse> personal = personalExternoService.searchPersonalExterno(searchTerm);
        return ResponseEntity.ok(personal);
    }

    /**
     * Obtiene personal externo por IPRESS
     */
    @GetMapping("/ipress/{idIpress}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<List<PersonalResponse>> getPersonalExternoByIpress(@PathVariable Long idIpress) {
        log.info("Obteniendo personal externo por IPRESS ID: {}", idIpress);
        List<PersonalResponse> personal = personalExternoService.getPersonalExternoByIpress(idIpress);
        return ResponseEntity.ok(personal);
    }

    /**
     * Obtiene personal externo por usuario
     */
    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'INSTITUCION_EX')")
    public ResponseEntity<PersonalResponse> getPersonalExternoByUsuario(@PathVariable Long idUsuario) {
        log.info("Obteniendo personal externo por usuario ID: {}", idUsuario);
        PersonalResponse personal = personalExternoService.getPersonalExternoByUsuario(idUsuario);
        return ResponseEntity.ok(personal);
    }
}
