package styp.com.cenate.service.nivel.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import styp.com.cenate.exception.ResourceNotFoundException;
import styp.com.cenate.model.NivelAtencion;
import styp.com.cenate.repository.NivelAtencionRepository;
import styp.com.cenate.service.nivel.NivelAtencionService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NivelAtencionServiceImpl implements NivelAtencionService {

    private final NivelAtencionRepository repository;

    @Override
    public List<NivelAtencion> listar() {
        return repository.findAll();
    }

    @Override
    public NivelAtencion obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nivel de Atención no encontrado con ID: " + id));
    }

    @Override
    public NivelAtencion crear(NivelAtencion nivel) {
        return repository.save(nivel);
    }

    @Override
    public NivelAtencion actualizar(Long id, NivelAtencion nivel) {
        NivelAtencion existente = obtenerPorId(id);
        existente.setDescripcion(nivel.getDescripcion());
        existente.setEstado(nivel.getEstado());
        return repository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}