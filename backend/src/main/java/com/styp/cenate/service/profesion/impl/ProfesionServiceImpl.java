package com.styp.cenate.service.profesion.impl;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import com.styp.cenate.dto.ProfesionResponse;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.Profesion;
import com.styp.cenate.repository.ProfesionRepository;
import com.styp.cenate.service.profesion.ProfesionService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
public class ProfesionServiceImpl implements ProfesionService {

    private final ProfesionRepository profesionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProfesionResponse> obtenerTodas() {
        return profesionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfesionResponse> obtenerActivas() {
        return profesionRepository.findByStatProf("A")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProfesionResponse crear(Profesion profesion) {
        // validación de duplicado
        profesionRepository.findAll().stream()
                .filter(p -> p.getDescProf().equalsIgnoreCase(profesion.getDescProf()))
                .findFirst()
                .ifPresent(p -> {
                    throw new DataIntegrityViolationException("La profesión ya existe: " + profesion.getDescProf());
                });

        Profesion guardada = profesionRepository.save(profesion);
        return toResponse(guardada);
    }

    @Override
    @Transactional
    public ProfesionResponse actualizar(Long id, Profesion profesion) {
        Profesion existente = profesionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profesión no encontrada con id: " + id));

        existente.setDescProf(profesion.getDescProf());
        existente.setStatProf(profesion.getStatProf());
        Profesion actualizada = profesionRepository.save(existente);

        return toResponse(actualizada);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!profesionRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe la profesión con id: " + id);
        }
        profesionRepository.deleteById(id);
    }

    // Mapper
    private ProfesionResponse toResponse(Profesion p) {
        return ProfesionResponse.builder()
                .idProf(p.getIdProf())
                .descProf(p.getDescProf())
                .statProf(p.getStatProf())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
