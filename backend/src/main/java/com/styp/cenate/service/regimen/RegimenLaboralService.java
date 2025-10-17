package com.styp.cenate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.RegimenLaboralResponse;
import com.styp.cenate.model.RegimenLaboral;
import com.styp.cenate.repository.RegimenLaboralRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegimenLaboralService {
    
    private final RegimenLaboralRepository regimenLaboralRepository;
    
    @Transactional(readOnly = true)
    public List<RegimenLaboralResponse> getAllRegimenes() {
        log.info("Obteniendo todos los regímenes laborales");
        return regimenLaboralRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public RegimenLaboralResponse getRegimenById(Long id) {
        log.info("Obteniendo régimen laboral con ID: {}", id);
        RegimenLaboral regimen = regimenLaboralRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Régimen laboral no encontrado"));
        return convertToResponse(regimen);
    }
    
    @Transactional
    public RegimenLaboralResponse createRegimen(String desc, String stat) {
        log.info("Creando nuevo régimen laboral: {}", desc);
        RegimenLaboral regimen = new RegimenLaboral();
        regimen.setDescRegLab(desc);
        regimen.setStatRegLab(stat);
        RegimenLaboral saved = regimenLaboralRepository.save(regimen);
        return convertToResponse(saved);
    }
    
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
    
    @Transactional
    public void deleteRegimen(Long id) {
        log.info("Eliminando régimen laboral con ID: {}", id);
        regimenLaboralRepository.deleteById(id);
    }
    
    private RegimenLaboralResponse convertToResponse(RegimenLaboral regimen) {
        RegimenLaboralResponse response = new RegimenLaboralResponse();
        response.setIdRegLab(regimen.getIdRegLab());
        response.setDescRegLab(regimen.getDescRegLab());
        response.setStatRegLab(regimen.getStatRegLab());
        response.setCreateAt(regimen.getCreateAt());
        response.setUpdateAt(regimen.getUpdateAt());
        return response;
    }
}
