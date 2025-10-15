package styp.com.cenate.api.entidad;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.AreaHospitalariaResponse;
import styp.com.cenate.model.AreaHospitalaria;
import styp.com.cenate.service.area.AreaHospitalariaService;

import java.util.List;

@RestController
@RequestMapping("/api/areas-hospitalarias")
@RequiredArgsConstructor
public class AreaHospitalariaController {

    private final AreaHospitalariaService service;
    private final ModelMapper mapper;

    @GetMapping
    public ResponseEntity<List<AreaHospitalariaResponse>> listar() {
        List<AreaHospitalariaResponse> list = service.listar().stream()
                .map(a -> mapper.map(a, AreaHospitalariaResponse.class))
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AreaHospitalariaResponse> obtenerPorId(@PathVariable Long id) {
        AreaHospitalaria a = service.obtenerPorId(id);
        return ResponseEntity.ok(mapper.map(a, AreaHospitalariaResponse.class));
    }

    @PostMapping
    public ResponseEntity<AreaHospitalariaResponse> crear(@RequestBody AreaHospitalariaResponse request) {
        AreaHospitalaria nuevo = service.crear(mapper.map(request, AreaHospitalaria.class));
        return ResponseEntity.ok(mapper.map(nuevo, AreaHospitalariaResponse.class));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AreaHospitalariaResponse> actualizar(@PathVariable Long id, @RequestBody AreaHospitalariaResponse request) {
        AreaHospitalaria actualizado = service.actualizar(id, mapper.map(request, AreaHospitalaria.class));
        return ResponseEntity.ok(mapper.map(actualizado, AreaHospitalariaResponse.class));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}