package styp.com.cenate.service.proced.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import styp.com.cenate.exception.ResourceNotFoundException;
import styp.com.cenate.model.Procedimiento;
import styp.com.cenate.repository.ProcedimientoRepository;
import styp.com.cenate.service.proced.ProcedimientoService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcedimientoServiceImpl implements ProcedimientoService {

    private final ProcedimientoRepository repository;

    @Override
    public List<Procedimiento> listar() {
        return repository.findAll();
    }

    @Override
    public Procedimiento obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedimiento no encontrado con ID: " + id));
    }

    @Override
    public Procedimiento crear(Procedimiento procedimiento) {
        return repository.save(procedimiento);
    }

    @Override
    public Procedimiento actualizar(Long id, Procedimiento procedimiento) {
        Procedimiento existente = obtenerPorId(id);
        existente.setCodigo(procedimiento.getCodigo());
        existente.setDescripcion(procedimiento.getDescripcion());
        existente.setEstado(procedimiento.getEstado());
        return repository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}