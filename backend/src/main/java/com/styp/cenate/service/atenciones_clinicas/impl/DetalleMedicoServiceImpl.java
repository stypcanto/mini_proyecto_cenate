package com.styp.cenate.service.atenciones_clinicas.impl;

import com.styp.cenate.dto.DetalleMedicoDTO;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.service.atenciones_clinicas.DetalleMedicoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
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
                    .sorted(this::compararPorApellidosYNombres)
                    .map(this::convertirADTO)
                    .collect(Collectors.toList());
            
        } catch (Exception e) {
            log.error("❌ Error al buscar médicos para el servicio ID: {}", idServicio, e);
            throw new RuntimeException("Error al obtener médicos para el servicio: " + e.getMessage(), e);
        }
    }

    @Override
    public List<DetalleMedicoDTO> obtenerTodosMedicos() {
        log.info("🔍 Buscando médicos ASISTENCIALES activos disponibles para TeleECG");

        try {
            // Obtener solo los médicos con Tipo de Profesional = ASISTENCIAL
            List<PersonalCnt> medicos = personalCntRepository.findAsistencialesActivos();

            log.info("📊 Se encontraron {} médicos ASISTENCIALES ACTIVOS en BD", medicos.size());

            if (medicos.isEmpty()) {
                log.warn("⚠️ No se encontraron médicos ASISTENCIALES activos en la BD");
                return new java.util.ArrayList<>();
            }

            // Convertir a DTOs
            List<DetalleMedicoDTO> medicosActivos = medicos.stream()
                    .map(this::convertirADTO)
                    .collect(Collectors.toList());

            log.info("✅ Se retornarán {} médicos ASISTENCIALES para TeleECG", medicosActivos.size());

            return medicosActivos;

        } catch (Exception e) {
            log.error("❌ Error al obtener médicos ASISTENCIALES para TeleECG: {}", e.getMessage(), e);
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
        log.debug("🔍 Convertiendo PersonalCnt ID: {} - Nombre: {}", personal.getIdPers(), personal.getNombreCompleto());

        // Obtener especialidad con prioridad: servicioEssi > perPers > descArea > SIN ESPECIALIDAD
        String especialidadFinal;
        if (personal.getServicioEssi() != null && personal.getServicioEssi().getDescServicio() != null) {
            String desc = personal.getServicioEssi().getDescServicio().trim();
            // ✅ Validar que no sea numérico (datos incorrectos en BD)
            if (!desc.matches("^[0-9]+$") && !desc.isEmpty()) {
                especialidadFinal = desc;
                log.debug("✅ Especialidad desde servicioEssi: {}", especialidadFinal);
            } else {
                // Fallback si descServicio es numérico o vacío
                log.debug("⚠️ servicioEssi.descServicio es numérico/vacío: '{}' - usando fallback", desc);
                if (personal.getPerPers() != null && !personal.getPerPers().isBlank()) {
                    especialidadFinal = personal.getPerPers();
                    log.debug("✅ Especialidad desde perPers (fallback): {}", especialidadFinal);
                } else if (personal.getArea() != null && personal.getArea().getDescArea() != null) {
                    especialidadFinal = personal.getArea().getDescArea();
                    log.debug("✅ Especialidad desde descArea (fallback): {}", especialidadFinal);
                } else {
                    especialidadFinal = "SIN ESPECIALIDAD";
                    log.debug("⚠️ No se encontró especialidad válida para: {}", personal.getNombreCompleto());
                }
            }
        } else if (personal.getPerPers() != null && !personal.getPerPers().isBlank()) {
            especialidadFinal = personal.getPerPers();
            log.debug("✅ Especialidad desde perPers: {}", especialidadFinal);
        } else if (personal.getArea() != null && personal.getArea().getDescArea() != null) {
            especialidadFinal = personal.getArea().getDescArea();
            log.debug("✅ Especialidad desde descArea: {}", especialidadFinal);
        } else {
            especialidadFinal = "SIN ESPECIALIDAD";
            log.debug("⚠️ No se encontró especialidad para: {}", personal.getNombreCompleto());
        }

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

                // ✅ Especialidad (con prioridad: servicioEssi > perPers > descArea > SIN ESPECIALIDAD)
                .especialidad(especialidadFinal)

                .build();
    }

            private int compararPorApellidosYNombres(PersonalCnt a, PersonalCnt b) {
            int cmpPaterno = normalizarParaOrden(a.getApePaterPers())
                .compareTo(normalizarParaOrden(b.getApePaterPers()));
            if (cmpPaterno != 0) return cmpPaterno;

            int cmpMaterno = normalizarParaOrden(a.getApeMaterPers())
                .compareTo(normalizarParaOrden(b.getApeMaterPers()));
            if (cmpMaterno != 0) return cmpMaterno;

            int cmpNombres = normalizarParaOrden(a.getNomPers())
                .compareTo(normalizarParaOrden(b.getNomPers()));
            if (cmpNombres != 0) return cmpNombres;

            return normalizarParaOrden(a.getNombreCompleto())
                .compareTo(normalizarParaOrden(b.getNombreCompleto()));
            }

            private String normalizarParaOrden(String texto) {
            if (texto == null || texto.isBlank()) return "";
            String sinAcentos = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
            return sinAcentos.trim().toUpperCase();
            }
}
