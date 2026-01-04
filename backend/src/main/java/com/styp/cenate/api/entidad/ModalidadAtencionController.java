package com.styp.cenate.api.entidad;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.styp.cenate.model.ModalidadAtencion;
import com.styp.cenate.repository.ModalidadAtencionRepository;

import java.util.List;

/**
 * 🌐 Controlador REST para consultar Modalidades de Atención
 * (TELECONSULTA, TELECONSULTORIO, AMBOS, NO SE BRINDA SERVICIO)
 *
 * Base URL: /api/modalidades-atencion
 */
@RestController
@RequestMapping("/api/modalidades-atencion")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.239:5173"
})
public class ModalidadAtencionController {

    private final ModalidadAtencionRepository modalidadAtencionRepository;

    /**
     * GET /api/modalidades-atencion/activas
     * Obtiene todas las modalidades de atención activas
     * Endpoint público para ser usado en dropdowns
     */
    @GetMapping("/activas")
    public ResponseEntity<List<ModalidadAtencion>> getModalidadesActivas() {
        log.info("📋 Consultando modalidades de atención activas");
        List<ModalidadAtencion> modalidades = modalidadAtencionRepository.findByStatModAten("A");
        return ResponseEntity.ok(modalidades);
    }

    /**
     * GET /api/modalidades-atencion
     * Obtiene todas las modalidades de atención
     */
    @GetMapping
    public ResponseEntity<List<ModalidadAtencion>> getAllModalidades() {
        log.info("📋 Consultando todas las modalidades de atención");
        List<ModalidadAtencion> modalidades = modalidadAtencionRepository.findAll();
        return ResponseEntity.ok(modalidades);
    }
}
