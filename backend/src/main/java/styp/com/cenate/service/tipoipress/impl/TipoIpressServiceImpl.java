package styp.com.cenate.service.tipoipress.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import styp.com.cenate.exception.ResourceNotFoundException;
import styp.com.cenate.model.TipoIpress;
import styp.com.cenate.repository.TipoIpressRepository;
import styp.com.cenate.service.tipoipress.TipoIpressService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TipoIpressServiceImpl implements TipoIpressService {

    private final TipoIpressRepository repository;

    @Override
    public List<TipoIpress> listar() {
        return repository.findAll();
    }

    @Override
    public TipoIpress obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de IPRESS no encontrado con ID: " + id));
    }

    @Override
    public TipoIpress crear(TipoIpress tipoIpress) {
        return repository.save(tipoIpress);
    }

    @Override
    public TipoIpress actualizar(Long id, TipoIpress tipoIpress) {
        TipoIpress existente = obtenerPorId(id);
        existente.setDescripcion(tipoIpress.getDescripcion());
        existente.setEstado(tipoIpress.getEstado());
        return repository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}