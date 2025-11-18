package com.styp.cenate.service.proced.impl;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.Procedimiento;
import com.styp.cenate.repository.ProcedimientoRepository;
import com.styp.cenate.service.proced.ProcedimientoService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
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
