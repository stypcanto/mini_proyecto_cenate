package com.styp.cenate.service.catalogo;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.catalogo.ActividadEssiResponseDTO;
import com.styp.cenate.mapper.catalogo.ActividadEssiMapper;
import com.styp.cenate.repository.ActividadEssiRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActividadEssiServiceImpl implements IActividadEssiService {

    private final ActividadEssiRepository actividadRepo;

    @Override
    @Transactional(readOnly = true)
    public List<ActividadEssiResponseDTO> listarActivasCenate() {

        return ActividadEssiMapper.toDtoList(
            actividadRepo.findByEstadoAndEsCenate("A", true)
        );
    }
}
