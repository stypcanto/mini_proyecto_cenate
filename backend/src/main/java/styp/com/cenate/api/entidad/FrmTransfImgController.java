package styp.com.cenate.api.entidad;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.FrmTransfImgRequest;
import styp.com.cenate.dto.FrmTransfImgResponse;
import styp.com.cenate.service.frmtransfimg.FrmTransfImgService;

import java.util.List;

/**
 * Controlador REST para gestionar formularios de transferencia de imágenes diagnósticas.
 * Permite listar, crear, actualizar y eliminar registros de la tabla frm_transf_img.
 */
@RestController
@RequestMapping("/api/frm-transf-img")
@RequiredArgsConstructor
public class FrmTransfImgController {

    private final FrmTransfImgService service;

    /**
     * 🔹 Listar todos los formularios de transferencia.
     */
    @GetMapping
    public ResponseEntity<List<FrmTransfImgResponse>> listar() {
        List<FrmTransfImgResponse> lista = service.listar();
        return ResponseEntity.ok(lista);
    }

    /**
     * 🔹 Obtener un formulario específico por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FrmTransfImgResponse> obtenerPorId(@PathVariable Long id) {
        FrmTransfImgResponse response = service.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 🔹 Crear un nuevo formulario de transferencia de imagen.
     */
    @PostMapping
    public ResponseEntity<FrmTransfImgResponse> crear(@RequestBody FrmTransfImgRequest request) {
        FrmTransfImgResponse creado = service.crear(request);
        return ResponseEntity.ok(creado);
    }

    /**
     * 🔹 Actualizar un formulario existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<FrmTransfImgResponse> actualizar(@PathVariable Long id, @RequestBody FrmTransfImgRequest request) {
        FrmTransfImgResponse actualizado = service.actualizar(id, request);
        return ResponseEntity.ok(actualizado);
    }

    /**
     * 🔹 Eliminar un formulario de transferencia por su ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}