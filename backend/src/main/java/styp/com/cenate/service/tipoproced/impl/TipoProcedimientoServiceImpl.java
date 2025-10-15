package styp.com.cenate.service.tipoproced.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import styp.com.cenate.exception.ResourceNotFoundException;
import styp.com.cenate.model.TipoProcedimiento;
import styp.com.cenate.repository.TipoProcedimientoRepository;
import styp.com.cenate.service.tipoproced.TipoProcedimientoService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TipoProcedimientoServiceImpl implements TipoProcedimientoService {

    private final TipoProcedimientoRepository repository;

    @Override
    public List<TipoProcedimiento> listar() {
        return repository.findAll();
    }

    @Override
    public TipoProcedimiento obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de Procedimiento no encontrado con ID: " + id));
    }

    @Override
    public TipoProcedimiento crear(TipoProcedimiento tipoProcedimiento) {
        return repository.save(tipoProcedimiento);
    }

    @Override
    public TipoProcedimiento actualizar(Long id, TipoProcedimiento tipoProcedimiento) {
        TipoProcedimiento existente = obtenerPorId(id);
        existente.setDescripcion(tipoProcedimiento.getDescripcion());
        existente.setEstado(tipoProcedimiento.getEstado());
        return repository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}