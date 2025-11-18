package com.styp.cenate.service.tipoproced.impl;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.TipoProcedimiento;
import com.styp.cenate.repository.TipoProcedimientoRepository;
import com.styp.cenate.service.tipoproced.TipoProcedimientoService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
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
