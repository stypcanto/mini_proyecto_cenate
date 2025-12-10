package com.styp.cenate.service.red.impl;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.Red;
import com.styp.cenate.repository.RedRepository;
import com.styp.cenate.service.red.RedService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
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
        existente.setMacroregion(red.getMacroregion());
        return repository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
