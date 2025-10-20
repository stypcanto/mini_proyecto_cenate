package com.styp.cenate.service.usuario.impl;

import com.styp.cenate.dto.ProfesionResponse;
import com.styp.cenate.model.Profesion;
import com.styp.cenate.repository.ProfesionRepository;
import com.styp.cenate.service.usuario.ProfesionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
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
