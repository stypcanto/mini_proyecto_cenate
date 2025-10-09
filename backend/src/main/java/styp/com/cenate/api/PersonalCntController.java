package styp.com.cenate.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.PersonalCntRequest;
import styp.com.cenate.dto.PersonalCntResponse;
import styp.com.cenate.service.PersonalCntService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/personal")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost"})
public class PersonalCntController {
    
    private final PersonalCntService personalCntService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<PersonalCntResponse>> getAllPersonal() {
        log.info("Consultando todo el personal");
        List<PersonalCntResponse> personal = personalCntService.getAllPersonal();
        return ResponseEntity.ok(personal);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<PersonalCntResponse> getPersonalById(@PathVariable Long id) {
        log.info("Consultando personal por ID: {}", id);
        PersonalCntResponse personal = personalCntService.getPersonalById(id);
        return ResponseEntity.ok(personal);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<PersonalCntResponse> createPersonal(@RequestBody PersonalCntRequest request) {
        log.info("Creando nuevo personal");
        PersonalCntResponse personal = personalCntService.createPersonal(request);
        return ResponseEntity.ok(personal);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<PersonalCntResponse> updatePersonal(
            @PathVariable Long id, 
            @RequestBody PersonalCntRequest request) {
        log.info("Actualizando personal con ID: {}", id);
        PersonalCntResponse personal = personalCntService.updatePersonal(id, request);
        return ResponseEntity.ok(personal);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> deletePersonal(@PathVariable Long id) {
        log.info("Eliminando personal con ID: {}", id);
        personalCntService.deletePersonal(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Personal eliminado exitosamente");
        return ResponseEntity.ok(response);
    }
}
