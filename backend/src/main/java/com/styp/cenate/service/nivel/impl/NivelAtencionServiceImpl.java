package com.styp.cenate.service.nivel.impl;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.NivelAtencion;
import com.styp.cenate.repository.NivelAtencionRepository;
import com.styp.cenate.service.nivel.NivelAtencionService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
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
