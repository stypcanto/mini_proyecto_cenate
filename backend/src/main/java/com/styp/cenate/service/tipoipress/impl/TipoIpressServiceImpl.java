package com.styp.cenate.service.tipoipress.impl;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.TipoIpress;
import com.styp.cenate.repository.TipoIpressRepository;
import com.styp.cenate.service.tipoipress.TipoIpressService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
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
