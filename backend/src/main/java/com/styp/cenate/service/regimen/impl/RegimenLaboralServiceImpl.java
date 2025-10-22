package com.styp.cenate.service.regimen.impl;
import lombok.extern.slf4j.Slf4j;

import com.styp.cenate.dto.RegimenLaboralResponse;
import com.styp.cenate.model.RegimenLaboral;
import com.styp.cenate.repository.RegimenLaboralRepository;
import com.styp.cenate.service.regimen.RegimenLaboralService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegimenLaboralServiceImpl implements RegimenLaboralService {

    private final RegimenLaboralRepository regimenLaboralRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RegimenLaboralResponse> getAllRegimenes() {
        log.info("Obteniendo todos los regímenes laborales");
        return regimenLaboralRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RegimenLaboralResponse getRegimenById(Long id) {
        log.info("Obteniendo régimen laboral con ID: {}", id);
        RegimenLaboral regimen = regimenLaboralRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Régimen laboral no encontrado"));
        return convertToResponse(regimen);
    }

    @Override
    @Transactional
    public RegimenLaboralResponse createRegimen(String desc, String stat) {
        log.info("Creando nuevo régimen laboral: {}", desc);
        RegimenLaboral regimen = new RegimenLaboral();
        regimen.setDescRegLab(desc);
        regimen.setStatRegLab(stat);
        RegimenLaboral saved = regimenLaboralRepository.save(regimen);
        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public RegimenLaboralResponse updateRegimen(Long id, String desc, String stat) {
        log.info("Actualizando régimen laboral con ID: {}", id);
        RegimenLaboral regimen = regimenLaboralRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Régimen laboral no encontrado"));
        regimen.setDescRegLab(desc);
        regimen.setStatRegLab(stat);
        RegimenLaboral updated = regimenLaboralRepository.save(regimen);
        return convertToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteRegimen(Long id) {
        log.info("Eliminando régimen laboral con ID: {}", id);
        regimenLaboralRepository.deleteById(id);
    }

    // ============================================================
    // 🔄 Conversión de entidad a DTO
    // ============================================================
    private RegimenLaboralResponse convertToResponse(RegimenLaboral regimen) {
        return RegimenLaboralResponse.builder()
                .idRegLab(regimen.getIdRegLab())
                .descRegLab(regimen.getDescRegLab())
                .statRegLab(regimen.getStatRegLab())
                .createAt(regimen.getCreateAt())
                .updateAt(regimen.getUpdateAt())
                .build();
    }
}
