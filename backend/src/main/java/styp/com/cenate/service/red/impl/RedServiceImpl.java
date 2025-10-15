package styp.com.cenate.service.red.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import styp.com.cenate.exception.ResourceNotFoundException;
import styp.com.cenate.model.Red;
import styp.com.cenate.repository.RedRepository;
import styp.com.cenate.service.red.RedService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RedServiceImpl implements RedService {

    private final RedRepository repository;

    @Override
    public List<Red> listar() {
        return repository.findAll();
    }

    @Override
    public Red obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Red no encontrada con ID: " + id));
    }

    @Override
    public Red crear(Red red) {
        return repository.save(red);
    }

    @Override
    public Red actualizar(Long id, Red red) {
        Red existente = obtenerPorId(id);
        existente.setCodigo(red.getCodigo());
        existente.setDescripcion(red.getDescripcion());
        existente.setIdMacro(red.getIdMacro());
        return repository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}