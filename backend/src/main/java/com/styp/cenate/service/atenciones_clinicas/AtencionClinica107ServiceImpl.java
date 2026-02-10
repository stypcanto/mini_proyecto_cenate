package com.styp.cenate.service.atenciones_clinicas;

import com.styp.cenate.dto.AtencionClinica107DTO;
import com.styp.cenate.dto.AtencionClinica107FiltroDTO;
import com.styp.cenate.dto.EstadisticasAtencion107DTO;
import com.styp.cenate.dto.EstadisticasCondicionMedica107DTO;
import com.styp.cenate.model.AtencionClinica107;
import com.styp.cenate.model.EstadoGestionCita;
import com.styp.cenate.repository.AtencionClinica107Repository;
import com.styp.cenate.repository.EstadoGestionCitaRepository;
import com.styp.cenate.service.specification.AtencionClinica107Specification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 💼 AtencionClinica107ServiceImpl
 * Propósito: Implementación del servicio de atenciones clínicas del Módulo 107
 * Módulo: 107
 * Funcionalidades:
 *   - Filtrado avanzado con 9 criterios
 *   - Paginación inteligente
 *   - Estadísticas en tiempo real
 *   - Manejo de excepciones
 *   - Logging detallado
 * 
 * ⚠️ NOTA: red y macrorregion NO se filtran en BD (dinámico)
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AtencionClinica107ServiceImpl implements AtencionClinica107Service {

    private final AtencionClinica107Repository repository;
    private final EstadoGestionCitaRepository estadoGestionCitaRepository;

    /**
     * Listar atenciones con filtros complejos
     * Soporta los 9 filtros del módulo 107
     */
    @Override
    public Page<AtencionClinica107DTO> listarConFiltros(AtencionClinica107FiltroDTO filtro) {
        log.info("🔍 [MODULO 107] Listando atenciones clínicas con filtros");
        log.info("📌 [MODULO 107] Filtro de Bolsa: idBolsa={}", filtro.getIdBolsa());
        log.debug("Filtros recibidos: estadoGestionCitasId={}, estado={}, tipoDoc={}, documento={}, idIpress={}, derivacion={}, especialidad={}, tipoCita={}, search={}",
            filtro.getEstadoGestionCitasId(), filtro.getEstado(), filtro.getTipoDocumento(), filtro.getPacienteDni(), 
            filtro.getIdIpress(), filtro.getDerivacionInterna(), filtro.getEspecialidad(),
            filtro.getTipoCita(), filtro.getSearchTerm());

        // Parámetros de paginación con ordenamiento ascendente por fecha de solicitud
        int page = filtro.getPageNumber() != null ? filtro.getPageNumber() : 0;
        int size = filtro.getPageSize() != null ? filtro.getPageSize() : 25;
        
        // Establecer ordenamiento ascendente por fecha de solicitud
        Sort sort = Sort.by(Sort.Direction.ASC, "fechaSolicitud");
        Pageable pageable = PageRequest.of(page, size, sort);

        try {
            // Parsear fechas si existen
            LocalDateTime fechaInicio = null;
            LocalDateTime fechaFin = null;
            if (filtro.getFechaDesde() != null) {
                fechaInicio = filtro.getFechaDesde().atStartOfDay();
            }
            if (filtro.getFechaHasta() != null) {
                fechaFin = filtro.getFechaHasta().atTime(23, 59, 59);
            }

            log.debug("Paginación: página={}, tamaño={}", page, size);

            // Construir especificación con todos los filtros (incluyendo idBolsa)
            var spec = AtencionClinica107Specification.conFiltros(
                filtro.getIdBolsa(),
                filtro.getEstadoGestionCitasId(),
                filtro.getEstado(),
                filtro.getTipoDocumento(),
                filtro.getPacienteDni(),
                fechaInicio,
                fechaFin,
                filtro.getIdIpress(),
                filtro.getDerivacionInterna(),
                filtro.getEspecialidad(),
                filtro.getTipoCita(),
                filtro.getSearchTerm(),
                filtro.getCondicionMedica()
            );

            // Ejecutar query
            long inicio = System.currentTimeMillis();
            Page<AtencionClinica107> resultado = repository.findAll(spec, pageable);
            long tiempo = System.currentTimeMillis() - inicio;

            log.info("✅ [MODULO 107] Se encontraron {} atenciones en {} ms", 
                resultado.getTotalElements(), tiempo);

            // Convertir a DTO - inicializar relación antes de convertir
            return resultado.map(atencion -> {
                // Inicializar la relación si es necesario
                if (atencion.getEstadoGestionCitasId() != null && atencion.getEstadoGestionCita() == null) {
                    // La relación no se cargó, hacemos una query adicional
                    log.debug("Inicializando estadoGestionCita para solicitud {}", atencion.getIdSolicitud());
                }
                return toDTO(atencion);
            });

        } catch (IllegalArgumentException e) {
            log.error("❌ [MODULO 107] Error en formato de fechas: {}", e.getMessage());
            throw new RuntimeException("Formato de fecha inválido. Use YYYY-MM-DD: " + e.getMessage());
        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al listar atenciones: {}", e.getMessage(), e);
            throw new RuntimeException("Error al filtrar atenciones clínicas: " + e.getMessage());
        }
    }

    /**
     * Obtener estadísticas globales de atenciones por estado
     * Estados principales (estado_gestion_citas_id):
     *   - 1: CITADO (Para atender)
     *   - 2: ATENDIDO_IPRESS (Completados)
     *   - 11: PENDIENTE_CITA (Nuevos en bolsa)
     *   - Otros: Total - (CITADO + ATENDIDO + PENDIENTE)
     */
    @Override
    public EstadisticasAtencion107DTO obtenerEstadisticas() {
        log.info("📊 [MODULO 107] Obteniendo estadísticas de atenciones (Bolsa = 1)");

        try {
            long inicio = System.currentTimeMillis();

            // Contar estados principales por estado_gestion_citas_id
            Long total = repository.contarTotal();
            Long citado = repository.contarPorEstado(1L);          // CITADO
            Long atendidoIpress = repository.contarPorEstado(2L);  // ATENDIDO_IPRESS
            Long pendienteCita = repository.contarPorEstado(11L);  // PENDIENTE_CITA
            
            // Otros = Total - (CITADO + ATENDIDO + PENDIENTE)
            Long otros = total != null ? total : 0L;
            otros -= (citado != null ? citado : 0L);
            otros -= (atendidoIpress != null ? atendidoIpress : 0L);
            otros -= (pendienteCita != null ? pendienteCita : 0L);

            long tiempo = System.currentTimeMillis() - inicio;

            EstadisticasAtencion107DTO stats = EstadisticasAtencion107DTO.builder()
                .total(total != null ? total : 0L)
                .citado(citado != null ? citado : 0L)
                .atendidoIpress(atendidoIpress != null ? atendidoIpress : 0L)
                .pendienteCita(pendienteCita != null ? pendienteCita : 0L)
                .otros(otros >= 0 ? otros : 0L)
                .build();

            log.info("✅ [MODULO 107] Estadísticas (Bolsa=1): Total={}, Citado={}, Atendido={}, Pendiente={}, Otros={} ({}ms)",
                total, citado, atendidoIpress, pendienteCita, otros, tiempo);

            return stats;

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener estadísticas: {}", e.getMessage(), e);
            throw new RuntimeException("Error al obtener estadísticas: " + e.getMessage());
        }
    }

    /**
     * 🆕 Obtener estadísticas basadas en condición médica
     * Estados de condición médica:
     *   - Pendiente: condicion_medica = 'Pendiente' O NULL
     *   - Atendido: condicion_medica = 'Atendido'
     *   - Deserción: condicion_medica = 'Deserción'
     */
    @Override
    public EstadisticasCondicionMedica107DTO obtenerEstadisticasCondicionMedica() {
        log.info("📊 [MODULO 107] Obteniendo estadísticas por condición médica (Bolsa = 1)");

        try {
            long inicio = System.currentTimeMillis();

            // Contar por condición médica
            Long total = repository.contarTotal();
            Long pendiente = repository.contarPendientes();   // Incluye NULL
            Long atendido = repository.contarAtendidos();
            Long desercion = repository.contarDeserciones();

            long tiempo = System.currentTimeMillis() - inicio;

            EstadisticasCondicionMedica107DTO stats = EstadisticasCondicionMedica107DTO.builder()
                .total(total != null ? total : 0L)
                .pendiente(pendiente != null ? pendiente : 0L)
                .atendido(atendido != null ? atendido : 0L)
                .desercion(desercion != null ? desercion : 0L)
                .build();

            log.info("✅ [MODULO 107] Estadísticas Condición Médica: Total={}, Pendiente={}, Atendido={}, Deserción={} ({}ms)",
                total, pendiente, atendido, desercion, tiempo);

            return stats;

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener estadísticas por condición médica: {}", e.getMessage(), e);
            throw new RuntimeException("Error al obtener estadísticas por condición médica: " + e.getMessage());
        }
    }

    /**
     * Obtener detalle completo de una atención
     */
    @Override
    public AtencionClinica107DTO obtenerDetalle(Long idSolicitud) {
        log.info("🔎 [MODULO 107] Obteniendo detalle de atención: {}", idSolicitud);

        try {
            AtencionClinica107 atencion = repository.findById(idSolicitud)
                .orElseThrow(() -> {
                    log.warn("⚠️ [MODULO 107] Atención no encontrada: {}", idSolicitud);
                    return new RuntimeException("Atención no encontrada: " + idSolicitud);
                });

            log.info("✅ [MODULO 107] Detalle obtenido para solicitud: {}", idSolicitud);

            return toDTO(atencion);

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener detalle: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Convertir AtencionClinica107 a AtencionClinica107DTO
     */
    private AtencionClinica107DTO toDTO(AtencionClinica107 atencion) {
        // Obtener descripción del estado
        String estadoDescripcion = null;
        
        // Intentar obtener desde la relación cargada
        if (atencion.getEstadoGestionCita() != null) {
            estadoDescripcion = atencion.getEstadoGestionCita().getDescEstadoCita();
        } 
        // Si no está cargada, consultar el repositorio
        else if (atencion.getEstadoGestionCitasId() != null) {
            EstadoGestionCita estado = estadoGestionCitaRepository.findById(atencion.getEstadoGestionCitasId()).orElse(null);
            if (estado != null) {
                estadoDescripcion = estado.getDescEstadoCita();
            }
        }
        
        // Obtener nombre/descripción de la IPRESS
        String ipressNombre = null;
        if (atencion.getIpress() != null) {
            ipressNombre = atencion.getIpress().getDescIpress();
        }

        return AtencionClinica107DTO.builder()
            .idSolicitud(atencion.getIdSolicitud())
            .numeroSolicitud(atencion.getNumeroSolicitud())
            .idBolsa(atencion.getIdBolsa())
            .activo(atencion.getActivo())
            .pacienteId(atencion.getPacienteId())
            .pacienteNombre(atencion.getPacienteNombre())
            .pacienteDni(atencion.getPacienteDni())
            .tipoDocumento(atencion.getTipoDocumento())
            .pacienteSexo(atencion.getPacienteSexo())
            .fechaNacimiento(atencion.getFechaNacimiento())
            .pacienteEdad(atencion.getPacienteEdad())
            .pacienteTelefono(atencion.getPacienteTelefono())
            .pacienteEmail(atencion.getPacienteEmail())
            .pacienteTelefonoAlterno(atencion.getPacienteTelefonoAlterno())
            .codigoAdscripcion(atencion.getCodigoAdscripcion())
            .idIpress(atencion.getIdIpress())
            .codigoIpress(atencion.getCodigoIpress())
            .ipressNombre(ipressNombre) // 🆕 Nombre de la IPRESS
            .derivacionInterna(atencion.getDerivacionInterna())
            .especialidad(atencion.getEspecialidad())
            .tipoCita(atencion.getTipoCita())
            .idServicio(atencion.getIdServicio())
            .estadoGestionCitasId(atencion.getEstadoGestionCitasId())
            .estado(atencion.getEstado())
            .estadoDescripcion(estadoDescripcion)
            .fechaSolicitud(atencion.getFechaSolicitud())
            .fechaActualizacion(atencion.getFechaActualizacion())
            .responsableGestoraId(atencion.getResponsableGestoraId())
            .fechaAsignacion(atencion.getFechaAsignacion())
            .fechaAtencion(atencion.getFechaAtencion()) // 🆕 Fecha de atención programada
            .horaAtencion(atencion.getHoraAtencion()) // 🆕 Hora de atención programada
            .idPersonal(atencion.getIdPersonal()) // 🆕 ID del personal que atiende
            .tiempoInicioSintomas(atencion.getTiempoInicioSintomas()) // 🆕 Tiempo inicio síntomas
            .consentimientoInformado(atencion.getConsentimientoInformado()) // 🆕 Consentimiento informado
            .condicionMedica(atencion.getCondicionMedica() != null && !atencion.getCondicionMedica().trim().isEmpty() 
                ? atencion.getCondicionMedica() : "Pendiente") // 🆕 Condición médica con NULL como Pendiente
            .build();
    }
}
