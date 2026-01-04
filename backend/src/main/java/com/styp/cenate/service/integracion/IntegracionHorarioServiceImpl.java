package com.styp.cenate.service.integracion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.styp.cenate.dto.ComparativoDisponibilidadHorarioDTO;
import com.styp.cenate.dto.ResumenDisponibilidadPeriodoDTO;
import com.styp.cenate.dto.SincronizacionResultadoDTO;
import com.styp.cenate.exception.BusinessException;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 🔄 Implementación del servicio de integración disponibilidad → horario.
 *
 * RESPONSABILIDADES CRÍTICAS:
 * 1. Mapear turnos de disponibilidad a códigos de horario según régimen
 * 2. Crear/actualizar registros en ctr_horario y ctr_horario_det
 * 3. Manejar transacciones atómicas (todo o nada)
 * 4. Registrar auditoría completa de sincronizaciones
 * 5. Validar estados y reglas de negocio
 *
 * MAPEO DE TURNOS POR RÉGIMEN:
 * - 728/CAS:
 *   - M (Mañana) → 158 (4h)
 *   - T (Tarde) → 131 (4h)
 *   - MT (Completo) → 200A (8h)
 * - LOCADOR:
 *   - M (Mañana) → 158 (6h)
 *   - T (Tarde) → 131 (6h)
 *   - MT (Completo) → 200A (12h)
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IntegracionHorarioServiceImpl implements IIntegracionHorarioService {

    // ==========================================================
    // 📦 Repositorios y Dependencias
    // ==========================================================

    private final DisponibilidadMedicaRepository disponibilidadRepository;
    private final CtrHorarioRepository ctrHorarioRepository;
    private final CtrHorarioDetRepository ctrHorarioDetRepository;
    private final DimHorarioRepository dimHorarioRepository;
    private final DimTipoTurnoRepository dimTipoTurnoRepository;
    private final AreaRepository areaRepository;
    private final SincronizacionHorarioLogRepository sincronizacionLogRepository;
    private final EntityManager entityManager;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==========================================================
    // 🎯 MÉTODO CRÍTICO: Sincronización Principal
    // ==========================================================

    @Override
    @Transactional
    public SincronizacionResultadoDTO sincronizarDisponibilidadAHorario(Long idDisponibilidad, Long idArea) {
        log.info("🔄 Iniciando sincronización - Disponibilidad #{} → Área #{}", idDisponibilidad, idArea);

        try {
            // ========== PASO 1: Validar disponibilidad ==========
            DisponibilidadMedica disponibilidad = validarDisponibilidad(idDisponibilidad);

            // ========== PASO 2: Validar área ==========
            Area area = validarArea(idArea);

            // ========== PASO 3: Buscar/crear horario ==========
            CtrHorario horario = buscarOCrearHorario(disponibilidad, area);
            String tipoOperacion = horario.getIdCtrHorario() == null ? "CREACION" : "ACTUALIZACION";

            // ========== PASO 4: Obtener tipo turno CHATBOT ==========
            DimTipoTurno tipoTurnoChatbot = obtenerTipoTurnoChatbot();

            // ========== PASO 5: Limpiar detalles anteriores si es actualización ==========
            if ("ACTUALIZACION".equals(tipoOperacion)) {
                int cantidadAnterior = horario.getDetalles().size();
                log.info("🔄 Modo ACTUALIZACION detectado - Horario #{} tiene {} detalles anteriores",
                    horario.getIdCtrHorario(), cantidadAnterior);

                // SOLUCIÓN: Eliminar manualmente cada detalle para evitar problemas de sincronización
                List<CtrHorarioDet> detallesAEliminar = new ArrayList<>(horario.getDetalles());
                for (CtrHorarioDet detalle : detallesAEliminar) {
                    ctrHorarioDetRepository.delete(detalle);
                }
                log.info("🗑️ Eliminados {} detalles uno por uno", detallesAEliminar.size());

                // Limpiar colección en memoria
                horario.getDetalles().clear();

                // Flush para aplicar deletes antes de los inserts
                entityManager.flush();
                log.debug("💾 Flush aplicado - Cambios persistidos en BD");

                log.info("✅ Limpieza completada - Listo para insertar nuevos detalles");
            }

            // ========== PASO 6: Mapear y crear detalles ==========
            ResultadoMapeo resultado = mapearYCrearDetalles(
                disponibilidad,
                horario,
                tipoTurnoChatbot
            );

            // ========== PASO 7: Recalcular totales y guardar ==========
            horario.recalcularTotales();
            horario = ctrHorarioRepository.save(horario);

            // ========== PASO 8: Actualizar disponibilidad ==========
            disponibilidad.setEstado("SINCRONIZADO");
            disponibilidad.setIdCtrHorarioGenerado(horario.getIdCtrHorario());
            disponibilidadRepository.save(disponibilidad);

            // ========== Registrar log de sincronización ==========
            SincronizacionHorarioLog log = registrarLog(
                disponibilidad,
                horario,
                tipoOperacion,
                "EXITOSO",
                resultado,
                null
            );

            // ========== Construir respuesta ==========
            return construirResultadoExitoso(
                disponibilidad,
                horario,
                tipoOperacion,
                resultado,
                log.getIdSincronizacion()
            );

        } catch (BusinessException | ResourceNotFoundException e) {
            log.error("❌ Error de negocio en sincronización: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ Error inesperado en sincronización", e);
            throw new BusinessException("Error al sincronizar disponibilidad: " + e.getMessage());
        }
    }

    // ==========================================================
    // 🛠️ Métodos auxiliares de sincronización
    // ==========================================================

    /**
     * PASO 1: Valida que la disponibilidad puede sincronizarse
     */
    private DisponibilidadMedica validarDisponibilidad(Long idDisponibilidad) {
        DisponibilidadMedica disp = disponibilidadRepository.findById(idDisponibilidad)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Disponibilidad no encontrada: " + idDisponibilidad
            ));

        if (!"REVISADO".equals(disp.getEstado())) {
            throw new BusinessException(
                "Solo disponibilidades en estado REVISADO pueden sincronizarse. Estado actual: " + disp.getEstado()
            );
        }

        if (disp.getDetalles() == null || disp.getDetalles().isEmpty()) {
            throw new BusinessException("La disponibilidad no tiene detalles para sincronizar");
        }

        return disp;
    }

    /**
     * PASO 2: Valida que el área existe y está activa
     */
    private Area validarArea(Long idArea) {
        Area area = areaRepository.findById(idArea)
            .orElseThrow(() -> new ResourceNotFoundException("Área no encontrada: " + idArea));

        if (!area.isActiva()) {
            throw new BusinessException("El área está inactiva: " + area.getDescArea());
        }

        return area;
    }

    /**
     * PASO 3: Busca horario existente o crea uno nuevo
     */
    private CtrHorario buscarOCrearHorario(DisponibilidadMedica disponibilidad, Area area) {
        Optional<CtrHorario> horarioExistente = ctrHorarioRepository.findByPeriodoAndPersonalAndArea(
            disponibilidad.getPeriodo(),
            disponibilidad.getPersonal().getIdPers(),
            area.getIdArea()
        );

        if (horarioExistente.isPresent()) {
            log.info("✅ Horario existente encontrado: #{}", horarioExistente.get().getIdCtrHorario());
            return horarioExistente.get();
        }

        // Crear nuevo horario
        CtrHorario nuevoHorario = CtrHorario.builder()
            .periodo(disponibilidad.getPeriodo())
            .personal(disponibilidad.getPersonal())
            .area(area)
            .regimenLaboral(disponibilidad.getPersonal().getRegimenLaboral())
            .servicio(disponibilidad.getServicio())
            .observaciones("Generado desde disponibilidad #" + disponibilidad.getIdDisponibilidad())
            .detalles(new ArrayList<>())
            .build();

        log.info("🆕 Creando nuevo horario para periodo {} - Personal #{} - Área #{}",
            disponibilidad.getPeriodo(),
            disponibilidad.getPersonal().getIdPers(),
            area.getIdArea()
        );

        return nuevoHorario;
    }

    /**
     * PASO 4: Obtiene tipo de turno TRN_CHATBOT
     */
    private DimTipoTurno obtenerTipoTurnoChatbot() {
        return dimTipoTurnoRepository.findByCodTipTurno("TRN_CHATBOT")
            .orElseThrow(() -> new BusinessException(
                "Tipo de turno TRN_CHATBOT no encontrado. Debe existir en dim_tipo_turno"
            ));
    }

    /**
     * PASO 6: Mapea detalles de disponibilidad a detalles de horario
     */
    private ResultadoMapeo mapearYCrearDetalles(
        DisponibilidadMedica disponibilidad,
        CtrHorario horario,
        DimTipoTurno tipoTurnoChatbot
    ) {
        int detallesProcesados = 0;
        int detallesCreados = 0;
        int detallesConError = 0;
        List<String> errores = new ArrayList<>();

        for (DetalleDisponibilidad detalle : disponibilidad.getDetalles()) {
            detallesProcesados++;

            try {
                // Mapear turno según régimen laboral
                String codHorario = mapearTurnoACodigo(detalle.getTurno());
                RegimenLaboral regimen = disponibilidad.getPersonal().getRegimenLaboral();

                // Buscar horario en dim_horario
                Optional<DimHorario> dimHorarioOpt = dimHorarioRepository.findByCodHorarioAndRegimenLaboral(
                    codHorario,
                    regimen
                );

                if (dimHorarioOpt.isEmpty()) {
                    String error = String.format(
                        "Horario no encontrado: código=%s, régimen=%s (día %s)",
                        codHorario,
                        regimen.getDescRegLab(),
                        detalle.getFecha()
                    );
                    errores.add(error);
                    detallesConError++;
                    log.warn("⚠️ {}", error);
                    continue;
                }

                // Crear detalle de horario
                CtrHorarioDet horarioDet = CtrHorarioDet.builder()
                    .horario(horario)
                    .fechaDia(detalle.getFecha())
                    .horarioDia(dimHorarioOpt.get())
                    .tipoTurno(tipoTurnoChatbot)
                    .notaDia(detalle.getObservacionAjuste())
                    .build();

                horario.addDetalle(horarioDet);
                detallesCreados++;

                log.debug("✅ Detalle creado: {} → {} ({}h)",
                    detalle.getFecha(),
                    codHorario,
                    dimHorarioOpt.get().getHoras()
                );

            } catch (Exception e) {
                String error = String.format(
                    "Error procesando día %s: %s",
                    detalle.getFecha(),
                    e.getMessage()
                );
                errores.add(error);
                detallesConError++;
                log.error("❌ {}", error, e);
            }
        }

        return new ResultadoMapeo(
            detallesProcesados,
            detallesCreados,
            detallesConError,
            errores
        );
    }

    /**
     * CRÍTICO: Mapea tipo de turno (M/T/MT) a código de horario (158/131/200A)
     */
    private String mapearTurnoACodigo(String turno) {
        return switch (turno) {
            case "M" -> "158";   // Mañana
            case "T" -> "131";   // Tarde
            case "MT" -> "200A"; // Completo
            default -> throw new BusinessException("Tipo de turno inválido: " + turno);
        };
    }

    /**
     * Registra log de sincronización
     */
    private SincronizacionHorarioLog registrarLog(
        DisponibilidadMedica disponibilidad,
        CtrHorario horario,
        String tipoOperacion,
        String resultado,
        ResultadoMapeo resultadoMapeo,
        String erroresAdicionales
    ) {
        Map<String, Object> detalles = new HashMap<>();
        detalles.put("personal", disponibilidad.getPersonal().getNombreCompleto());
        detalles.put("periodo", disponibilidad.getPeriodo());
        detalles.put("area", horario.getArea().getDescArea());
        detalles.put("detalles_procesados", resultadoMapeo.detallesProcesados);
        detalles.put("detalles_creados", resultadoMapeo.detallesCreados);
        detalles.put("detalles_con_error", resultadoMapeo.detallesConError);
        detalles.put("horas_sincronizadas", horario.getHorasTotales());

        String detallesJson;
        try {
            detallesJson = objectMapper.writeValueAsString(detalles);
        } catch (Exception e) {
            detallesJson = detalles.toString();
        }

        String erroresFinales = erroresAdicionales != null
            ? erroresAdicionales
            : String.join("\n", resultadoMapeo.errores);

        SincronizacionHorarioLog log = SincronizacionHorarioLog.builder()
            .disponibilidad(disponibilidad)
            .ctrHorario(horario)
            .tipoOperacion(tipoOperacion)
            .resultado(resultado)
            .detallesOperacion(detallesJson)
            .usuarioSincronizacion("SISTEMA") // TODO: Obtener usuario actual
            .fechaSincronizacion(OffsetDateTime.now())
            .errores(erroresFinales.isEmpty() ? null : erroresFinales)
            .build();

        return sincronizacionLogRepository.save(log);
    }

    /**
     * Construye DTO de resultado exitoso
     */
    private SincronizacionResultadoDTO construirResultadoExitoso(
        DisponibilidadMedica disponibilidad,
        CtrHorario horario,
        String tipoOperacion,
        ResultadoMapeo resultado,
        Long idLog
    ) {
        String mensaje = String.format(
            "%s exitosa: %d/%d detalles sincronizados (%s horas)",
            tipoOperacion,
            resultado.detallesCreados,
            resultado.detallesProcesados,
            horario.getHorasTotales()
        );

        if (resultado.detallesConError > 0) {
            mensaje += String.format(" - %d errores encontrados", resultado.detallesConError);
        }

        return SincronizacionResultadoDTO.builder()
            .idDisponibilidad(disponibilidad.getIdDisponibilidad())
            .idHorario(horario.getIdCtrHorario())
            .tipoOperacion(tipoOperacion)
            .resultado(resultado.detallesConError == 0 ? "EXITOSO" : "PARCIAL")
            .periodo(horario.getPeriodo())
            .nombrePersonal(disponibilidad.getPersonal().getNombreCompleto())
            .nombreArea(horario.getArea().getDescArea())
            .detallesProcesados(resultado.detallesProcesados)
            .detallesCreados(resultado.detallesCreados)
            .detallesConError(resultado.detallesConError)
            .horasSincronizadas(horario.getHorasTotales())
            .mensaje(mensaje)
            .errores(resultado.errores.isEmpty() ? null : String.join("\n", resultado.errores))
            .idSincronizacionLog(idLog)
            .build();
    }

    // ==========================================================
    // 📊 Otros métodos de la interfaz
    // ==========================================================

    @Override
    @Transactional(readOnly = true)
    public ComparativoDisponibilidadHorarioDTO obtenerComparativo(Long idDisponibilidad, Long idArea) {
        // TODO: Implementar comparativo
        throw new UnsupportedOperationException("Método obtenerComparativo() pendiente de implementación");
    }

    @Override
    @Transactional(readOnly = true)
    public List<SincronizacionHorarioLog> obtenerHistorialSincronizacion(Long idDisponibilidad) {
        DisponibilidadMedica disponibilidad = disponibilidadRepository.findById(idDisponibilidad)
            .orElseThrow(() -> new ResourceNotFoundException("Disponibilidad no encontrada: " + idDisponibilidad));

        return sincronizacionLogRepository.findByDisponibilidadOrderByFechaSincronizacionDesc(disponibilidad);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean puedeRealizarSincronizacion(Long idDisponibilidad) {
        try {
            validarDisponibilidad(idDisponibilidad);
            return true;
        } catch (Exception e) {
            log.warn("⚠️ Disponibilidad #{} no puede sincronizarse: {}", idDisponibilidad, e.getMessage());
            return false;
        }
    }

    @Override
    @Transactional
    public SincronizacionResultadoDTO resincronizarDisponibilidad(Long idDisponibilidad, Long idArea) {
        log.info("🔄 Resincronización solicitada para disponibilidad #{}", idDisponibilidad);

        // Forzar eliminación del estado SINCRONIZADO
        DisponibilidadMedica disponibilidad = disponibilidadRepository.findById(idDisponibilidad)
            .orElseThrow(() -> new ResourceNotFoundException("Disponibilidad no encontrada: " + idDisponibilidad));

        disponibilidad.setEstado("REVISADO");
        disponibilidadRepository.save(disponibilidad);

        // Ejecutar sincronización normal
        return sincronizarDisponibilidadAHorario(idDisponibilidad, idArea);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumenDisponibilidadPeriodoDTO> obtenerComparativosPorPeriodo(String periodo) {
        log.info("📊 Obteniendo comparativos del periodo: {}", periodo);

        // Buscar todas las disponibilidades del periodo
        List<DisponibilidadMedica> disponibilidades = disponibilidadRepository.findByPeriodo(periodo);

        log.info("📋 Encontradas {} disponibilidades para el periodo {}", disponibilidades.size(), periodo);

        // Generar comparativo para cada disponibilidad
        return disponibilidades.stream()
            .map(this::generarComparativoBasico)
            .collect(Collectors.toList());
    }

    /**
     * Genera un comparativo básico para una disponibilidad.
     * Usado por obtenerComparativosPorPeriodo().
     */
    private ResumenDisponibilidadPeriodoDTO generarComparativoBasico(DisponibilidadMedica disponibilidad) {
        ResumenDisponibilidadPeriodoDTO dto = new ResumenDisponibilidadPeriodoDTO();

        // Datos básicos
        dto.setIdDisponibilidad(disponibilidad.getIdDisponibilidad());
        dto.setNombreMedico(disponibilidad.getPersonal().getNombreCompleto());
        dto.setEspecialidad(disponibilidad.getServicio() != null
            ? disponibilidad.getServicio().getDescServicio()
            : "No especificado");
        dto.setCmpMedico(disponibilidad.getPersonal().getColegPers());

        // Horas declaradas
        dto.setHorasDeclaradas(disponibilidad.getTotalHoras() != null
            ? disponibilidad.getTotalHoras().doubleValue()
            : 0.0);

        // Horas chatbot y slots (solo si está sincronizado)
        dto.setEstadoSincronizacion(disponibilidad.getEstado());

        if ("SINCRONIZADO".equals(disponibilidad.getEstado()) && disponibilidad.getIdCtrHorarioGenerado() != null) {
            // Buscar horario sincronizado
            ctrHorarioRepository.findById(disponibilidad.getIdCtrHorarioGenerado())
                .ifPresent(horario -> {
                    // Calcular horas del chatbot (suma de horas de todos los detalles)
                    double horasChatbot = horario.getDetalles().stream()
                        .mapToDouble(det -> det.getHorarioDia() != null && det.getHorarioDia().getHoras() != null
                            ? det.getHorarioDia().getHoras().doubleValue()
                            : 0.0)
                        .sum();

                    dto.setHorasChatbot(horasChatbot);
                    dto.setSlotsGenerados(horario.getDetalles().size());

                    // Detectar inconsistencias
                    double diferencia = Math.abs(dto.getHorasDeclaradas() - horasChatbot);
                    dto.setTieneInconsistencia(diferencia > 1.0); // Tolerancia de 1 hora

                    // Información del área sincronizada
                    dto.setIdArea(horario.getArea() != null ? horario.getArea().getIdArea() : null);
                    dto.setNombreArea(horario.getArea() != null ? horario.getArea().getDescArea() : null);
                });
        } else {
            dto.setHorasChatbot(0.0);
            dto.setSlotsGenerados(0);
            dto.setTieneInconsistencia(false);
            dto.setIdArea(null);
            dto.setNombreArea(null);
        }

        return dto;
    }

    // ==========================================================
    // 📦 Clases auxiliares
    // ==========================================================

    /**
     * Resultado del mapeo de detalles
     */
    private record ResultadoMapeo(
        int detallesProcesados,
        int detallesCreados,
        int detallesConError,
        List<String> errores
    ) {}
}
