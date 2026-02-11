package com.styp.cenate.service.atenciones_clinicas.impl;

import com.styp.cenate.dto.DetalleMedicoDTO;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.service.atenciones_clinicas.DetalleMedicoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para obtener detalles de médicos por servicio
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class DetalleMedicoServiceImpl implements DetalleMedicoService {

    private final PersonalCntRepository personalCntRepository;

    @Override
    public List<DetalleMedicoDTO> obtenerMedicosPorServicio(Long idServicio) {
        log.info("🔍 Buscando médicos para el servicio ID: {}", idServicio);
        
        try {
            // Buscar todos los médicos asociados al servicio
            List<PersonalCnt> medicos = personalCntRepository.findByServicioEssi_IdServicio(idServicio);
            
            log.info("✅ Se encontraron {} médicos para el servicio ID: {}", medicos.size(), idServicio);
            
            // Convertir a DTOs
            return medicos.stream()
                    .map(this::convertirADTO)
                    .collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("❌ Error al buscar médicos para el servicio ID: {}", idServicio, e);
            throw new RuntimeException("Error al obtener médicos para el servicio: " + e.getMessage(), e);
        }
    }

    @Override
    public List<DetalleMedicoDTO> obtenerTodosMedicos() {
        log.info("🔍 Buscando TODOS los médicos activos disponibles para TeleECG");

        try {
            // Obtener todos los médicos activos usando el método específico del repositorio
            List<PersonalCnt> medicos = personalCntRepository.findByStatPers("A");

            log.info("📊 Se encontraron {} médicos ACTIVOS en BD", medicos.size());

            if (medicos.isEmpty()) {
                log.warn("⚠️ No se encontraron médicos activos en la BD");
                return new java.util.ArrayList<>();
            }

            // Convertir a DTOs
            List<DetalleMedicoDTO> medicosActivos = medicos.stream()
                    .map(this::convertirADTO)
                    .collect(Collectors.toList());

            log.info("✅ Se retornarán {} médicos ACTIVOS para TeleECG", medicosActivos.size());

            return medicosActivos;

        } catch (Exception e) {
            log.error("❌ Error al obtener todos los médicos para TeleECG: {}", e.getMessage(), e);
            return new java.util.ArrayList<>();
        }
    }

    @Override
    public DetalleMedicoDTO obtenerDetalleMedico(Long idPers) {
        log.info("🔍 Buscando detalles del médico ID: {}", idPers);

        try {
            Optional<PersonalCnt> personalOpt = personalCntRepository.findById(idPers);

            if (personalOpt.isEmpty()) {
                log.warn("⚠️ No se encontró el médico con ID: {}", idPers);
                return null;
            }

            DetalleMedicoDTO dto = convertirADTO(personalOpt.get());
            log.info("✅ Detalles del médico obtenidos: {}", idPers);
            return dto;

        } catch (Exception e) {
            log.error("❌ Error al obtener detalles del médico ID: {}", idPers, e);
            throw new RuntimeException("Error al obtener detalles del médico: " + e.getMessage(), e);
        }
    }

    /**
     * Convierte una entidad PersonalCnt a DetalleMedicoDTO
     */
    private DetalleMedicoDTO convertirADTO(PersonalCnt personal) {
        return DetalleMedicoDTO.builder()
                // Datos del personal médico
                .idPers(personal.getIdPers())
                .nombre(personal.getNombreCompleto())
                .numDocPers(personal.getNumDocPers())
                .emailPers(personal.getEmailPers())
                .emailCorpPers(personal.getEmailCorpPers())
                .movilPers(personal.getMovilPers())
                .genPers(personal.getGenPers())
                
                // Datos del área
                .idArea(personal.getArea() != null ? personal.getArea().getIdArea() : null)
                .descArea(personal.getArea() != null ? personal.getArea().getDescArea() : null)
                
                // Datos del régimen laboral
                .idRegimenLaboral(personal.getRegimenLaboral() != null ? personal.getRegimenLaboral().getIdRegLab() : null)
                .descRegimenLaboral(personal.getRegimenLaboral() != null ? personal.getRegimenLaboral().getDescRegLab() : null)
                
                // Estado del personal
                .statPers(personal.getStatPers())
                
                // Datos profesionales
                .colegPers(personal.getColegPers())
                .perPers(personal.getPerPers())
                
                .build();
    }
}
