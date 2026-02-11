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
        System.out.println("🔍 [obtenerTodosMedicos] Iniciando búsqueda de TODOS los médicos para TeleECG");
        log.info("🔍 Buscando TODOS los médicos disponibles (sin restricción de servicio) - TeleECG");

        try {
            // Obtener todos los médicos activos disponibles
            // Para TeleECG, retornar todos los médicos sin restricción de servicio
            List<PersonalCnt> medicos = personalCntRepository.findAll();

            System.out.println("📊 [obtenerTodosMedicos] Total de médicos en BD: " + medicos.size());
            log.info("📊 Total de médicos en BD: {}", medicos.size());

            if (medicos.isEmpty()) {
                System.out.println("⚠️ [obtenerTodosMedicos] No se encontraron médicos");
                log.warn("⚠️ No se encontraron médicos en la BD");
                return new java.util.ArrayList<>();
            }

            // Filtrar por estado activo y convertir a DTOs
            List<DetalleMedicoDTO> medicosActivos = medicos.stream()
                    .filter(p -> p.getStatPers() != null && p.getStatPers().equals("A"))
                    .map(this::convertirADTO)
                    .collect(Collectors.toList());

            System.out.println("✅ [obtenerTodosMedicos] Se encontraron " + medicosActivos.size() + " médicos ACTIVOS");
            log.info("✅ Se encontraron {} médicos ACTIVOS disponibles para TeleECG", medicosActivos.size());

            return medicosActivos;

        } catch (Exception e) {
            System.out.println("❌ [obtenerTodosMedicos] Error: " + e.getMessage());
            e.printStackTrace();
            log.error("❌ Error al obtener todos los médicos para TeleECG: {}", e.getMessage(), e);
            // Retornar lista vacía en lugar de lanzar excepción
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
