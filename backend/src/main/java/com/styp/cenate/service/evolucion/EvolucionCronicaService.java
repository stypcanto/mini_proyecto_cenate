package com.styp.cenate.service.evolucion;

import com.styp.cenate.dto.EvolucionCronicaDTO;
import com.styp.cenate.model.AtencionClinica;
import com.styp.cenate.repository.AtencionClinicaRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para calcular evolución de pacientes crónicos CENACRON
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EvolucionCronicaService {

    private final AtencionClinicaRepository atencionRepository;
    private final AseguradoRepository aseguradoRepository;
    private final PersonalCntRepository personalRepository;

    /**
     * Obtener evolución de paciente crónico CENACRON
     * Solo aplica para pacientes con HTA o DM
     */
    public EvolucionCronicaDTO obtenerEvolucion(String pkAsegurado, Integer meses) {
        log.info("📊 Calculando evolución crónica para paciente: {} ({} meses)", pkAsegurado, meses);

        if (meses == null || meses <= 0) {
            meses = 6; // Por defecto 6 meses
        }

        // Obtener atenciones del período
        OffsetDateTime fechaInicio = OffsetDateTime.now().minusMonths(meses);
        List<AtencionClinica> atenciones = atencionRepository.findByPkAseguradoOrderByFechaAtencionDesc(pkAsegurado)
                .stream()
                .filter(a -> a.getFechaAtencion().isAfter(fechaInicio))
                .collect(Collectors.toList());

        if (atenciones.isEmpty()) {
            log.warn("⚠️ No hay atenciones en los últimos {} meses para el paciente {}", meses, pkAsegurado);
            return construirEvolucionVacia(pkAsegurado);
        }

        // Construir DTO
        return EvolucionCronicaDTO.builder()
                .pkAsegurado(pkAsegurado)
                .nombrePaciente(obtenerNombrePaciente(pkAsegurado))
                .totalAtenciones(atenciones.size())
                .diasDesdeUltimaAtencion(calcularDiasDesdeUltimaAtencion(atenciones))
                .seriePresionArterial(construirSeriePA(atenciones))
                .seriePesoIMC(construirSeriePesoIMC(atenciones))
                .metricas(calcularMetricas(atenciones))
                .alertas(generarAlertas(atenciones))
                .atenciones(construirResumenAtenciones(atenciones))
                .estadoGeneral(determinarEstadoGeneral(atenciones))
                .build();
    }

    /**
     * Verificar si el paciente es elegible para dashboard crónico
     */
    public boolean esElegibleParaDashboard(String pkAsegurado) {
        List<AtencionClinica> atenciones = atencionRepository.findByPkAseguradoOrderByFechaAtencionDesc(pkAsegurado);

        if (atenciones.isEmpty()) {
            return false;
        }

        // Verificar si tiene atenciones de estrategia CENACRON
        boolean tieneCENACRON = atenciones.stream()
                .anyMatch(a -> a.getIdEstrategia() != null && a.getIdEstrategia() == 2L); // ID 2 = CENACRON

        // Verificar si tiene diagnóstico de HTA o DM (CIE-10)
        boolean tieneHTAoDM = atenciones.stream()
                .anyMatch(a -> {
                    String cie10 = a.getCie10Codigo();
                    if (cie10 == null)
                        return false;
                    // HTA: I10-I15, DM: E10-E14
                    return (cie10.startsWith("I1") && cie10.compareTo("I10") >= 0 && cie10.compareTo("I15") <= 0) ||
                            (cie10.startsWith("E1") && cie10.compareTo("E10") >= 0 && cie10.compareTo("E14") <= 0);
                });

        boolean elegible = tieneCENACRON && tieneHTAoDM;
        log.info("Paciente {} elegible para dashboard: {} (CENACRON: {}, HTA/DM: {})",
                pkAsegurado, elegible, tieneCENACRON, tieneHTAoDM);

        return elegible;
    }

    // =====================================================================
    // MÉTODOS PRIVADOS DE CONSTRUCCIÓN
    // =====================================================================

    private List<EvolucionCronicaDTO.PuntoPresionArterial> construirSeriePA(List<AtencionClinica> atenciones) {
        return atenciones.stream()
                .filter(a -> a.getPresionArterial() != null)
                .map(a -> {
                    String[] pa = a.getPresionArterial().split("/");
                    if (pa.length != 2)
                        return null;

                    try {
                        Integer sistolica = Integer.parseInt(pa[0].trim());
                        Integer diastolica = Integer.parseInt(pa[1].trim());
                        boolean enObjetivo = sistolica < 130 && diastolica < 80;
                        String clasificacion = clasificarPA(sistolica, diastolica);

                        return EvolucionCronicaDTO.PuntoPresionArterial.builder()
                                .fecha(a.getFechaAtencion())
                                .sistolica(sistolica)
                                .diastolica(diastolica)
                                .enObjetivo(enObjetivo)
                                .clasificacion(clasificacion)
                                .build();
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(p -> p != null)
                .collect(Collectors.toList());
    }

    private List<EvolucionCronicaDTO.PuntoPesoIMC> construirSeriePesoIMC(List<AtencionClinica> atenciones) {
        List<EvolucionCronicaDTO.PuntoPesoIMC> serie = new ArrayList<>();
        Double pesoAnterior = null;

        for (AtencionClinica a : atenciones) {
            if (a.getPesoKg() != null && a.getImc() != null) {
                boolean pesoEstable = true;
                if (pesoAnterior != null) {
                    pesoEstable = Math.abs(a.getPesoKg().doubleValue() - pesoAnterior) < 2.0;
                }

                serie.add(EvolucionCronicaDTO.PuntoPesoIMC.builder()
                        .fecha(a.getFechaAtencion())
                        .peso(a.getPesoKg().doubleValue())
                        .imc(a.getImc().doubleValue())
                        .pesoEstable(pesoEstable)
                        .clasificacionIMC(clasificarIMC(a.getImc().doubleValue()))
                        .build());

                pesoAnterior = a.getPesoKg().doubleValue();
            }
        }

        return serie;
    }

    private EvolucionCronicaDTO.MetricasControl calcularMetricas(List<AtencionClinica> atenciones) {
        // Calcular % PA en objetivo
        long totalConPA = atenciones.stream()
                .filter(a -> a.getPresionArterial() != null)
                .count();

        long paEnObjetivo = atenciones.stream()
                .filter(a -> a.getPresionArterial() != null)
                .filter(a -> {
                    try {
                        String[] pa = a.getPresionArterial().split("/");
                        int sistolica = Integer.parseInt(pa[0].trim());
                        int diastolica = Integer.parseInt(pa[1].trim());
                        return sistolica < 130 && diastolica < 80;
                    } catch (Exception e) {
                        return false;
                    }
                })
                .count();

        Double porcentajePA = totalConPA > 0 ? (paEnObjetivo * 100.0 / totalConPA) : 0.0;

        // Calcular % peso estable (simplificado - siempre 70% por ahora)
        Double porcentajePesoEstable = 70.0;

        // Obtener valores actuales (última atención)
        AtencionClinica ultima = atenciones.get(0);

        return EvolucionCronicaDTO.MetricasControl.builder()
                .porcentajePAEnObjetivo(porcentajePA)
                .porcentajePesoEstable(porcentajePesoEstable)
                .porcentajeAdherencia(78.0) // TODO: Obtener de tabla adherencia
                .porcentajeAsistencia(85.0) // TODO: Calcular real
                .presionActual(ultima.getPresionArterial())
                .pesoActual(ultima.getPesoKg() != null ? ultima.getPesoKg().doubleValue() : null)
                .imcActual(ultima.getImc() != null ? ultima.getImc().doubleValue() : null)
                .build();
    }

    private List<EvolucionCronicaDTO.AlertaRiesgo> generarAlertas(List<AtencionClinica> atenciones) {
        List<EvolucionCronicaDTO.AlertaRiesgo> alertas = new ArrayList<>();

        // Verificar PA descontrolada en últimas 3 atenciones
        if (atenciones.size() >= 3) {
            long ultimasTresDescontroladas = atenciones.stream()
                    .limit(3)
                    .filter(a -> a.getPresionArterial() != null)
                    .filter(a -> {
                        try {
                            String[] pa = a.getPresionArterial().split("/");
                            int sistolica = Integer.parseInt(pa[0].trim());
                            int diastolica = Integer.parseInt(pa[1].trim());
                            return sistolica >= 140 || diastolica >= 90;
                        } catch (Exception e) {
                            return false;
                        }
                    })
                    .count();

            if (ultimasTresDescontroladas >= 2) {
                alertas.add(EvolucionCronicaDTO.AlertaRiesgo.builder()
                        .nivel("ALTA")
                        .tipo("PA_DESCONTROLADA")
                        .mensaje("Presión arterial no controlada en las últimas 3 atenciones")
                        .icono("🔴")
                        .build());
            }
        }

        // Verificar IMC en aumento
        if (atenciones.size() >= 2) {
            AtencionClinica reciente = atenciones.get(0);
            AtencionClinica anterior = atenciones.get(1);
            
            if (reciente.getImc() != null && anterior.getImc() != null) {
                double diferencia = reciente.getImc().doubleValue() - anterior.getImc().doubleValue();
                if (diferencia > 2.0) {
                    alertas.add(EvolucionCronicaDTO.AlertaRiesgo.builder()
                            .nivel("MEDIA")
                            .tipo("IMC_AUMENTANDO")
                            .mensaje(String.format("IMC aumentó %.1f puntos desde última atención", diferencia))
                            .icono("🟡")
                            .build());
                }
            }
        }

        // Si no hay alertas, agregar una positiva
        if (alertas.isEmpty()) {
            alertas.add(EvolucionCronicaDTO.AlertaRiesgo.builder()
                    .nivel("BAJA")
                    .tipo("CONTROL_ADECUADO")
                    .mensaje("Parámetros controlados adecuadamente")
                    .icono("🟢")
                    .build());
        }

        return alertas;
    }

    private List<EvolucionCronicaDTO.AtencionResumen> construirResumenAtenciones(List<AtencionClinica> atenciones) {
        return atenciones.stream()
                .map(a -> {
                    boolean paEnObjetivo = false;
                    if (a.getPresionArterial() != null) {
                        try {
                            String[] pa = a.getPresionArterial().split("/");
                            int sistolica = Integer.parseInt(pa[0].trim());
                            int diastolica = Integer.parseInt(pa[1].trim());
                            paEnObjetivo = sistolica < 130 && diastolica < 80;
                        } catch (Exception e) {
                            // Ignorar
                        }
                    }

                    String estadoControl = paEnObjetivo ? "BUENO" : "REGULAR";

                    return EvolucionCronicaDTO.AtencionResumen.builder()
                            .idAtencion(a.getIdAtencion())
                            .fecha(a.getFechaAtencion())
                            .presionArterial(a.getPresionArterial())
                            .peso(a.getPesoKg() != null ? a.getPesoKg().doubleValue() : null)
                            .imc(a.getImc() != null ? a.getImc().doubleValue() : null)
                            .paEnObjetivo(paEnObjetivo)
                            .profesional(obtenerNombreProfesional(a.getIdPersonalCreador()))
                            .estadoControl(estadoControl)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private String determinarEstadoGeneral(List<AtencionClinica> atenciones) {
        // Simplificado: basado en última PA
        AtencionClinica ultima = atenciones.get(0);
        if (ultima.getPresionArterial() == null) {
            return "SIN_DATOS";
        }

        try {
            String[] pa = ultima.getPresionArterial().split("/");
            int sistolica = Integer.parseInt(pa[0].trim());
            int diastolica = Integer.parseInt(pa[1].trim());

            if (sistolica < 130 && diastolica < 80) {
                return "CONTROL_OPTIMO";
            } else if (sistolica < 140 || diastolica < 90) {
                return "CONTROL_REGULAR";
            } else {
                return "DESCONTROL";
            }
        } catch (Exception e) {
            return "SIN_DATOS";
        }
    }

    // =====================================================================
    // MÉTODOS AUXILIARES
    // =====================================================================

    private String clasificarPA(Integer sistolica, Integer diastolica) {
        if (sistolica >= 180 || diastolica >= 120)
            return "CRISIS";
        if (sistolica >= 140 || diastolica >= 90)
            return "HTA_GRADO_2";
        if (sistolica >= 130 || diastolica >= 80)
            return "HTA_GRADO_1";
        if (sistolica >= 120)
            return "ELEVADO";
        return "NORMAL";
    }

    private String clasificarIMC(Double imc) {
        if (imc < 18.5)
            return "BAJO_PESO";
        if (imc < 25.0)
            return "NORMAL";
        if (imc < 30.0)
            return "SOBREPESO";
        if (imc < 35.0)
            return "OBESIDAD_I";
        if (imc < 40.0)
            return "OBESIDAD_II";
        return "OBESIDAD_III";
    }

    private Integer calcularDiasDesdeUltimaAtencion(List<AtencionClinica> atenciones) {
        if (atenciones.isEmpty())
            return null;
        OffsetDateTime ultimaFecha = atenciones.get(0).getFechaAtencion();
        return (int) Duration.between(ultimaFecha, OffsetDateTime.now()).toDays();
    }

    private String obtenerNombrePaciente(String pkAsegurado) {
        return aseguradoRepository.findById(pkAsegurado)
                .map(a -> a.getPaciente())
                .orElse("Paciente Desconocido");
    }

    private String obtenerNombreProfesional(Long idPersonal) {
        if (idPersonal == null)
            return null;
        return personalRepository.findById(idPersonal)
                .map(p -> p.getNomPers() + " " + p.getApePaterPers())
                .orElse(null);
    }

    private EvolucionCronicaDTO construirEvolucionVacia(String pkAsegurado) {
        return EvolucionCronicaDTO.builder()
                .pkAsegurado(pkAsegurado)
                .nombrePaciente(obtenerNombrePaciente(pkAsegurado))
                .estadoGeneral("SIN_DATOS")
                .totalAtenciones(0)
                .seriePresionArterial(new ArrayList<>())
                .seriePesoIMC(new ArrayList<>())
                .alertas(List.of(
                        EvolucionCronicaDTO.AlertaRiesgo.builder()
                                .nivel("BAJA")
                                .tipo("SIN_DATOS")
                                .mensaje("No hay atenciones registradas en el período seleccionado")
                                .icono("ℹ️")
                                .build()))
                .atenciones(new ArrayList<>())
                .build();
    }
}
