package com.styp.cenate.service.firmadigital.impl;

import com.styp.cenate.dto.ActualizarEntregaTokenRequest;
import com.styp.cenate.dto.FirmaDigitalRequest;
import com.styp.cenate.dto.FirmaDigitalResponse;
import com.styp.cenate.model.FirmaDigitalPersonal;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.repository.FirmaDigitalPersonalRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.service.firmadigital.FirmaDigitalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 🔧 Implementación del servicio de firma digital de personal.
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-30
 */
@Slf4j
@Service("personalFirmaDigitalService")
@RequiredArgsConstructor
public class PersonalFirmaDigitalServiceImpl implements FirmaDigitalService {

    private final FirmaDigitalPersonalRepository firmaRepository;
    private final PersonalCntRepository personalRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public FirmaDigitalResponse guardarFirmaDigital(FirmaDigitalRequest request) {
        log.info("💾 Guardando firma digital para personal ID: {}", request.getIdPersonal());

        // Validar request
        if (!request.esValido()) {
            String errorMsg = request.obtenerMensajeError();
            log.error("❌ Request inválido: {}", errorMsg);
            auditar("CREATE_FIRMA_DIGITAL", "Error validación: " + errorMsg, "ERROR", "FAILURE");
            throw new IllegalArgumentException(errorMsg);
        }

        // Verificar que el personal exista
        PersonalCnt personal = personalRepository.findById(request.getIdPersonal())
            .orElseThrow(() -> {
                log.error("❌ Personal no encontrado: {}", request.getIdPersonal());
                return new RuntimeException("Personal no encontrado con ID: " + request.getIdPersonal());
            });

        // UPSERT: Buscar si ya existe firma digital para este personal
        FirmaDigitalPersonal firma = firmaRepository.findByPersonal_IdPers(request.getIdPersonal())
            .orElse(null);

        boolean esNuevo = (firma == null);

        if (esNuevo) {
            // Crear nuevo registro
            firma = FirmaDigitalPersonal.builder()
                .personal(personal)
                .statFirma("A")
                .build();
            log.info("📝 Creando nueva firma digital");
        } else {
            log.info("🔄 Actualizando firma digital existente ID: {}", firma.getIdFirmaPersonal());
        }

        // Mapear datos del request a la entidad
        mapRequestToEntity(request, firma);

        // Guardar
        FirmaDigitalPersonal firmaSaved = firmaRepository.save(firma);
        log.info("✅ Firma digital guardada exitosamente ID: {}", firmaSaved.getIdFirmaPersonal());

        // Auditar
        String accion = esNuevo ? "CREATE_FIRMA_DIGITAL" : "UPDATE_FIRMA_DIGITAL";
        String detalle = String.format("Firma digital de %s - Token: %s",
            personal.getNombreCompleto(),
            firma.tieneTokenEntregado() ? "Entregado" : "No entregado (" + firma.getMotivoSinToken() + ")");
        auditar(accion, detalle, "INFO", "SUCCESS");

        return mapToResponse(firmaSaved);
    }

    @Override
    @Transactional(readOnly = true)
    public FirmaDigitalResponse obtenerPorIdPersonal(Long idPersonal) {
        log.info("🔍 Buscando firma digital para personal ID: {}", idPersonal);

        return firmaRepository.findByPersonal_IdPers(idPersonal)
            .map(this::mapToResponse)
            .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public FirmaDigitalResponse obtenerPorId(Long id) {
        log.info("🔍 Buscando firma digital ID: {}", id);

        FirmaDigitalPersonal firma = firmaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Firma digital no encontrada con ID: " + id));

        return mapToResponse(firma);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FirmaDigitalResponse> listarActivas() {
        log.info("📋 Listando todo el personal asistencial de CENATE con estado de firma digital");

        // ✅ Query optimizada: filtra en BD + LEFT JOIN FETCH servicioEssi en una sola query
        List<PersonalCnt> personalCENATE = personalRepository.findAllCENATEPersonalWithServicio();

        log.info("📊 Personal CENATE encontrado: {} registros", personalCENATE.size());

        // Para cada personal, buscar su firma digital (si existe) y mapear a response
        return personalCENATE.stream()
            .map(personal -> {
                // Buscar firma digital del personal (puede no existir)
                FirmaDigitalPersonal firma = firmaRepository.findByPersonal_IdPers(personal.getIdPers())
                    .orElse(null);

                // Si tiene firma digital, mapear normalmente
                if (firma != null) {
                    return mapToResponse(firma);
                }

                // Si NO tiene firma digital, crear DTO solo con datos básicos del personal
                return mapPersonalSinFirma(personal);
            })
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FirmaDigitalResponse> listarCertificadosProximosVencer() {
        return listarCertificadosProximosVencer(30); // Default: 30 días
    }

    @Override
    @Transactional(readOnly = true)
    public List<FirmaDigitalResponse> listarCertificadosProximosVencer(int dias) {
        log.info("⚠️ Buscando certificados que vencen en {} días", dias);

        LocalDate hoy = LocalDate.now();
        LocalDate fechaLimite = hoy.plusDays(dias);

        return firmaRepository.findCertificadosProximosVencer(hoy, fechaLimite).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FirmaDigitalResponse> listarCertificadosVencidos() {
        log.info("❌ Buscando certificados vencidos");

        LocalDate hoy = LocalDate.now();

        return firmaRepository.findCertificadosVencidos(hoy).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FirmaDigitalResponse> listarEntregasPendientes() {
        log.info("📋 Listando entregas pendientes");

        return firmaRepository.findEntregasPendientes().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FirmaDigitalResponse actualizarEntregaToken(ActualizarEntregaTokenRequest request) {
        log.info("🔄 Actualizando entrega de token - Firma ID: {}", request.getIdFirmaPersonal());

        // Validar request
        request.normalizarDatos();
        if (!request.esValido()) {
            String errorMsg = request.obtenerMensajeError();
            log.error("❌ Request inválido: {}", errorMsg);
            auditar("UPDATE_ENTREGA_TOKEN", "Error validación: " + errorMsg, "ERROR", "FAILURE");
            throw new IllegalArgumentException(errorMsg);
        }

        // Buscar firma digital
        FirmaDigitalPersonal firma = firmaRepository.findById(request.getIdFirmaPersonal())
            .orElseThrow(() -> {
                log.error("❌ Firma digital no encontrada: {}", request.getIdFirmaPersonal());
                return new RuntimeException("Firma digital no encontrada con ID: " + request.getIdFirmaPersonal());
            });

        // Validar que esté en estado PENDIENTE
        if (!"PENDIENTE".equalsIgnoreCase(firma.getMotivoSinToken())) {
            String errorMsg = "Solo se puede actualizar firma digital con estado PENDIENTE. Estado actual: " +
                              (firma.getMotivoSinToken() != null ? firma.getMotivoSinToken() : "N/A");
            log.error("❌ {}", errorMsg);
            auditar("UPDATE_ENTREGA_TOKEN", errorMsg, "WARNING", "FAILURE");
            throw new IllegalStateException(errorMsg);
        }

        // Validar que esté activo
        if (!"A".equalsIgnoreCase(firma.getStatFirma())) {
            String errorMsg = "No se puede actualizar firma digital inactiva";
            log.error("❌ {}", errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        // Actualizar campos: cambiar de PENDIENTE a entregado
        firma.setEntregoToken(true);
        firma.setNumeroSerieToken(request.getNumeroSerieToken());
        firma.setFechaEntregaToken(request.getFechaEntregaToken());
        firma.setFechaInicioCertificado(request.getFechaInicioCertificado());
        firma.setFechaVencimientoCertificado(request.getFechaVencimientoCertificado());
        firma.setMotivoSinToken(null); // Limpiar motivo PENDIENTE

        // Actualizar observaciones si vienen en el request
        if (request.getObservaciones() != null && !request.getObservaciones().isBlank()) {
            firma.setObservaciones(request.getObservaciones());
        }

        // Guardar
        FirmaDigitalPersonal firmaSaved = firmaRepository.save(firma);
        log.info("✅ Entrega de token actualizada exitosamente - Serie: {}", request.getNumeroSerieToken());

        // Auditar
        String detalle = String.format("Token entregado para %s - Serie: %s - Vence: %s",
            firma.getPersonal().getNombreCompleto(),
            request.getNumeroSerieToken(),
            request.getFechaVencimientoCertificado());
        auditar("UPDATE_ENTREGA_TOKEN", detalle, "INFO", "SUCCESS");

        return mapToResponse(firmaSaved);
    }

    @Override
    @Transactional
    public void eliminarFirmaDigital(Long id) {
        log.info("🗑️ Eliminando firma digital ID: {}", id);

        FirmaDigitalPersonal firma = firmaRepository.findById(id)
            .orElseThrow(() -> {
                log.error("❌ Firma digital no encontrada: {}", id);
                return new RuntimeException("Firma digital no encontrada con ID: " + id);
            });

        // Soft delete: marcar como inactivo
        firma.setStatFirma("I");
        firmaRepository.save(firma);

        log.info("✅ Firma digital eliminada (soft delete)");

        // Auditar
        String detalle = String.format("Firma digital de %s eliminada",
            firma.getPersonal().getNombreCompleto());
        auditar("DELETE_FIRMA_DIGITAL", detalle, "WARNING", "SUCCESS");
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existeFirmaDigital(Long idPersonal) {
        return firmaRepository.existsByPersonal_IdPers(idPersonal);
    }

    @Override
    @Transactional
    public int importarPersonalCENATE() {
        log.info("📥 Iniciando importación de personal CENATE (CAS y 728)...");

        // Obtener todo el personal de CENATE con régimen CAS o 728 que esté activo
        List<PersonalCnt> personalCENATE = personalRepository.findAll().stream()
            .filter(p -> {
                // Filtrar solo personal activo
                if (!"A".equals(p.getStatPers())) {
                    return false;
                }

                // Filtrar solo personal de CENATE (IPRESS id = 2)
                if (p.getIpress() == null || p.getIpress().getIdIpress() != 2) {
                    return false;
                }

                // Filtrar solo régimen CAS o 728
                if (p.getRegimenLaboral() == null) {
                    return false;
                }
                String regimen = p.getRegimenLaboral().getDescRegLab().toUpperCase();
                return regimen.contains("CAS") || regimen.contains("728");
            })
            .collect(Collectors.toList());

        log.info("📊 Personal encontrado: {} registros", personalCENATE.size());

        int registrosCreados = 0;

        for (PersonalCnt personal : personalCENATE) {
            // Verificar si ya existe firma digital para este personal
            if (firmaRepository.existsByPersonal_IdPers(personal.getIdPers())) {
                log.debug("⏭️ Personal {} ya tiene firma digital registrada", personal.getNombreCompleto());
                continue;
            }

            // Crear nuevo registro con estado PENDIENTE
            FirmaDigitalPersonal firma = FirmaDigitalPersonal.builder()
                .personal(personal)
                .entregoToken(false)
                .motivoSinToken("PENDIENTE")
                .statFirma("A")
                .build();

            firmaRepository.save(firma);
            registrosCreados++;

            log.debug("✅ Creado registro PENDIENTE para: {}", personal.getNombreCompleto());
        }

        log.info("✅ Importación completada: {} registros creados", registrosCreados);

        // Auditar
        String detalle = String.format("Importación automática de personal CENATE: %d registros creados", registrosCreados);
        auditar("IMPORT_PERSONAL_CENATE", detalle, "INFO", "SUCCESS");

        return registrosCreados;
    }

    // ==========================================================
    // 🔄 Métodos de mapeo
    // ==========================================================

    /**
     * Mapea DTO request a entidad (para create/update)
     */
    private void mapRequestToEntity(FirmaDigitalRequest request, FirmaDigitalPersonal firma) {
        firma.setEntregoToken(request.getEntregoToken() != null ? request.getEntregoToken() : false);
        firma.setNumeroSerieToken(request.getNumeroSerieToken());
        firma.setFechaEntregaToken(request.getFechaEntregaToken());
        firma.setFechaInicioCertificado(request.getFechaInicioCertificado());
        firma.setFechaVencimientoCertificado(request.getFechaVencimientoCertificado());
        firma.setMotivoSinToken(request.getMotivoSinToken());
        firma.setObservaciones(request.getObservaciones());
    }

    /**
     * Mapea entidad a DTO response (para API responses)
     */
    private FirmaDigitalResponse mapToResponse(FirmaDigitalPersonal firma) {
        PersonalCnt personal = firma.getPersonal();

        // Calcular información adicional
        String estadoCertificado = firma.obtenerEstadoCertificado();
        Long diasRestantes = firma.diasRestantesVencimiento();
        boolean venceProximamente = firma.venceProximamente(30);

        // Obtener profesión (primera profesión activa)
        String profesion = null;
        if (personal.getProfesiones() != null && !personal.getProfesiones().isEmpty()) {
            profesion = personal.getProfesiones().stream()
                .filter(pp -> pp.isActivo() && pp.getProfesion() != null)
                .map(pp -> pp.getProfesion().getDescProf())
                .findFirst()
                .orElse(null);
        }

        // Obtener especialidad desde servicio ESSI
        String especialidad = null;
        if (personal.getServicioEssi() != null) {
            especialidad = personal.getServicioEssi().getDescServicio();
        }

        // Obtener IPRESS si existe
        Long idIpress = null;
        String nombreIpress = null;
        if (personal.getIpress() != null) {
            idIpress = personal.getIpress().getIdIpress();
            nombreIpress = personal.getIpress().getDescIpress();
        }

        return FirmaDigitalResponse.builder()
            .idFirmaPersonal(firma.getIdFirmaPersonal())
            .idPersonal(personal.getIdPers())
            .nombreCompleto(personal.getNombreCompleto())
            .dni(personal.getNumDocPers())
            .idRegimenLaboral(personal.getRegimenLaboral() != null ?
                             personal.getRegimenLaboral().getIdRegLab() : null)
            .regimenLaboral(personal.getRegimenLaboral() != null ?
                           personal.getRegimenLaboral().getDescRegLab() : null)
            .profesion(profesion)
            .especialidad(especialidad)
            .idIpress(idIpress)
            .nombreIpress(nombreIpress)
            .entregoToken(firma.getEntregoToken())
            .numeroSerieToken(firma.getNumeroSerieToken())
            .fechaEntregaToken(firma.getFechaEntregaToken())
            .fechaInicioCertificado(firma.getFechaInicioCertificado())
            .fechaVencimientoCertificado(firma.getFechaVencimientoCertificado())
            .motivoSinToken(firma.getMotivoSinToken())
            .descripcionMotivo(firma.obtenerDescripcionMotivo())
            .observaciones(firma.getObservaciones())
            .estadoCertificado(estadoCertificado)
            .diasRestantesVencimiento(diasRestantes)
            .venceProximamente(venceProximamente)
            .activo(firma.isActivo())
            .esPendiente(firma.esPendienteEntrega())
            .statFirma(firma.getStatFirma())
            .createdAt(firma.getCreatedAt())
            .updatedAt(firma.getUpdatedAt())
            .build();
    }

    /**
     * Mapea personal SIN firma digital a DTO response (solo datos básicos)
     */
    private FirmaDigitalResponse mapPersonalSinFirma(PersonalCnt personal) {
        // Obtener profesión (primera profesión activa)
        String profesion = null;
        if (personal.getProfesiones() != null && !personal.getProfesiones().isEmpty()) {
            profesion = personal.getProfesiones().stream()
                .filter(pp -> pp.isActivo() && pp.getProfesion() != null)
                .map(pp -> pp.getProfesion().getDescProf())
                .findFirst()
                .orElse(null);
        }

        // Obtener especialidad desde servicio ESSI (relación ya inicializada por Hibernate.initialize())
        String especialidad = (personal.getServicioEssi() != null) ?
            personal.getServicioEssi().getDescServicio() : null;

        // Obtener IPRESS si existe
        Long idIpress = null;
        String nombreIpress = null;
        if (personal.getIpress() != null) {
            idIpress = personal.getIpress().getIdIpress();
            nombreIpress = personal.getIpress().getDescIpress();
        }

        return FirmaDigitalResponse.builder()
            .idFirmaPersonal(null) // No tiene firma registrada
            .idPersonal(personal.getIdPers())
            .nombreCompleto(personal.getNombreCompleto())
            .dni(personal.getNumDocPers())
            .idRegimenLaboral(personal.getRegimenLaboral() != null ?
                             personal.getRegimenLaboral().getIdRegLab() : null)
            .regimenLaboral(personal.getRegimenLaboral() != null ?
                           personal.getRegimenLaboral().getDescRegLab() : null)
            .profesion(profesion)
            .especialidad(especialidad)
            .idIpress(idIpress)
            .nombreIpress(nombreIpress)
            .entregoToken(false) // Por defecto no ha entregado
            .numeroSerieToken(null)
            .fechaEntregaToken(null)
            .fechaInicioCertificado(null)
            .fechaVencimientoCertificado(null)
            .motivoSinToken("SIN_REGISTRO") // Marca que no tiene registro
            .descripcionMotivo("Sin registro de firma digital")
            .observaciones(null)
            .estadoCertificado("SIN_CERTIFICADO")
            .diasRestantesVencimiento(null)
            .venceProximamente(false)
            .activo(true) // El personal está activo
            .esPendiente(false)
            .statFirma(null) // No tiene firma digital
            .createdAt(null)
            .updatedAt(null)
            .build();
    }

    // ==========================================================
    // 📝 Auditoría
    // ==========================================================

    /**
     * Registra evento en auditoría
     */
    private void auditar(String action, String detalle, String nivel, String estado) {
        try {
            String usuario = SecurityContextHolder.getContext().getAuthentication().getName();
            auditLogService.registrarEvento(usuario, action, "FIRMA_DIGITAL", detalle, nivel, estado);
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar auditoría: {}", e.getMessage());
        }
    }
}
