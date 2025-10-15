package styp.com.cenate.service.area.imp;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import styp.com.cenate.exception.ResourceNotFoundException;
import styp.com.cenate.model.AreaHospitalaria;
import styp.com.cenate.repository.AreaHospitalariaRepository;
import styp.com.cenate.service.area.AreaHospitalariaService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AreaHospitalariaServiceImpl implements AreaHospitalariaService {

    private final AreaHospitalariaRepository repository;

    @Override
    public List<AreaHospitalaria> listar() {
        return repository.findAll();
    }

    @Override
    public AreaHospitalaria obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Área hospitalaria no encontrada con ID: " + id));
    }

    @Override
    public AreaHospitalaria crear(AreaHospitalaria area) {
        return repository.save(area);
    }

    @Override
    public AreaHospitalaria actualizar(Long id, AreaHospitalaria area) {
        AreaHospitalaria existente = obtenerPorId(id);
        existente.setCodigo(area.getCodigo());
        existente.setDescripcion(area.getDescripcion());
        existente.setAbreviatura(area.getAbreviatura());
        existente.setEstado(area.getEstado());
        return repository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}