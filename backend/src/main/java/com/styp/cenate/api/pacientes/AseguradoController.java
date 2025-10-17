package com.styp.cenate.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.repository.AseguradoRepository;

@RestController
@RequestMapping("/api/asegurados")
@CrossOrigin(origins = "*")
public class AseguradoController {

    private final AseguradoRepository aseguradoRepository;

    @Autowired
    public AseguradoController(AseguradoRepository aseguradoRepository) {
        this.aseguradoRepository = aseguradoRepository;
    }

    /**
     * Listar asegurados con paginación.
     * Ejemplo: GET /api/asegurados?page=0&size=10
     */
    @GetMapping
    public Page<Asegurado> getAsegurados(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size) {
        return aseguradoRepository.findAll(PageRequest.of(page, size));
    }

    /**
     * Buscar asegurado por ID (pkAsegurado).
     * Ejemplo: GET /api/asegurados/id/12345
     */
    @GetMapping("/id/{pkAsegurado}")
    public ResponseEntity<Asegurado> getById(@PathVariable String pkAsegurado) {
        return aseguradoRepository.findById(pkAsegurado)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Buscar asegurado por documento.
     * Ejemplo: GET /api/asegurados/doc/25424748
     */
    @GetMapping("/doc/{docPaciente}")
    public ResponseEntity<Asegurado> getByDocPaciente(@PathVariable String docPaciente) {
        return aseguradoRepository.findByDocPaciente(docPaciente)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
