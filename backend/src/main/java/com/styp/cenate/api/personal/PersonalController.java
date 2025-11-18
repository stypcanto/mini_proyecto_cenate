package com.styp.cenate.api.personal;

import com.styp.cenate.dto.PersonalRequest;
import com.styp.cenate.dto.PersonalResponse;
import com.styp.cenate.model.view.PersonalTotalView;
import com.styp.cenate.service.personal.PersonalCntService;
import com.styp.cenate.service.personal.PersonalExternoService;
import com.styp.cenate.service.view.PersonalTotalService;
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
 * ============================================================
 * 👨‍⚕️ CONTROLADOR UNIFICADO DE PERSONAL
 * ============================================================
 * Gestiona tanto personal CNT como personal externo
 * ============================================================
 */
@RestController
@RequestMapping("/api/personal")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.239:5173"
})
public class PersonalController {

    private final PersonalCntService personalCntService;
    private final PersonalExternoService personalExternoService;
    private final PersonalTotalService personalTotalService;

    // ============================================================
    // 📋 LISTAR TODO EL PERSONAL (CNT + EXTERNO)
    // ============================================================
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<PersonalTotalView>> getAllPersonal() {
        log.info("📋 Consultando todo el personal (CNT + Externo)");
        return ResponseEntity.ok(personalTotalService.listarTodo());
    }

    // ============================================================
    // 🟢 CREAR PERSONAL (DETECTA AUTOMÁTICAMENTE CNT O EXTERNO)
    // ============================================================
    @PostMapping("/crear")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> crearPersonal(@RequestBody Map<String, Object> request) {
        try {
            log.info("🟢 Creando nuevo personal: {}", request);
            
            // Determinar si es CNT o Externo por el campo tipoPersonal
            String tipoPersonal = (String) request.get("tipoPersonal");
            
            if ("CENATE".equalsIgnoreCase(tipoPersonal) || "CNT".equalsIgnoreCase(tipoPersonal)) {
                // Es personal CNT
                PersonalRequest cntRequest = buildPersonalRequest(request, "CENATE");
                PersonalResponse response = personalCntService.createPersonalCnt(cntRequest);
                
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("message", "Personal CENATE creado exitosamente");
                result.put("tipo", "CNT");
                result.put("data", response);
                
                return ResponseEntity.status(HttpStatus.CREATED).body(result);
            } else {
                // Es personal externo
                PersonalRequest externoRequest = buildPersonalRequest(request, "EXTERNO");
                PersonalResponse response = personalExternoService.createPersonalExterno(externoRequest);
                
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("message", "Personal externo creado exitosamente");
                result.put("tipo", "EXTERNO");
                result.put("data", response);
                
                return ResponseEntity.status(HttpStatus.CREATED).body(result);
            }
        } catch (Exception e) {
            log.error("❌ Error al crear personal: {}", e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error al crear personal: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ============================================================
    // 📋 LISTAR SOLO PERSONAL CNT
    // ============================================================
    @GetMapping("/cnt")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<PersonalResponse>> getAllPersonalCnt() {
        log.info("📋 Consultando personal CNT");
        return ResponseEntity.ok(personalCntService.getAllPersonalCnt());
    }

    // ============================================================
    // 📋 LISTAR SOLO PERSONAL EXTERNO
    // ============================================================
    @GetMapping("/externo")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<PersonalResponse>> getAllPersonalExterno() {
        log.info("📋 Consultando personal externo");
        return ResponseEntity.ok(personalExternoService.getAllPersonalExterno());
    }

    // ============================================================
    // 🔍 BUSCAR PERSONAL POR NÚMERO DE DOCUMENTO
    // ============================================================
    @GetMapping("/buscar/{numeroDocumento}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> buscarPorDocumento(@PathVariable String numeroDocumento) {
        log.info("🔍 Buscando personal por documento: {}", numeroDocumento);
        
        // Buscar en ambas tablas
        List<PersonalTotalView> results = personalTotalService.listarTodo()
                .stream()
                .filter(p -> numeroDocumento.equals(p.getNumeroDocumento()))
                .toList();
        
        if (results.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("found", false);
            result.put("message", "Personal no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("found", true);
        result.put("data", results.get(0));
        return ResponseEntity.ok(result);
    }

    // ============================================================
    // 🛠️ MÉTODOS AUXILIARES PARA CONSTRUIR REQUESTS
    // ============================================================
    
    private PersonalRequest buildPersonalRequest(Map<String, Object> request, String tipoPersonal) {
        PersonalRequest personalRequest = PersonalRequest.builder()
                .tipoPersonal(tipoPersonal)
                .idTipoDocumento(getLongValue(request, "idTipDoc"))
                .numeroDocumento((String) request.get("numeroDocumento"))
                .nombres((String) request.get("nombres"))
                .apellidoPaterno((String) request.getOrDefault("apPaterno", ""))
                .apellidoMaterno((String) request.getOrDefault("apMaterno", ""))
                .genero((String) request.get("genero"))
                .fechaNacimiento(parseDate((String) request.get("fechaNacimiento")))
                .emailPersonal((String) request.get("correoPersonal"))
                .emailCorporativo((String) request.getOrDefault("correoInstitucional", ""))
                .telefono((String) request.get("telefonoMovil"))
                .direccion((String) request.getOrDefault("direccion", ""))
                .idRegimenLaboral(getLongValue(request, "idRegimenLaboral"))
                .estado("A")
                .build();
        
        // Solo para personal externo
        if ("EXTERNO".equalsIgnoreCase(tipoPersonal)) {
            personalRequest.setIdIpress(getLongValue(request, "idIpress"));
        }
        
        return personalRequest;
    }
    
    private java.time.LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            return java.time.LocalDate.parse(dateStr);
        } catch (Exception e) {
            return null;
        }
    }

    private Long getLongValue(Map<String, Object> request, String key) {
        Object value = request.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.parseLong(value.toString());
    }
}
