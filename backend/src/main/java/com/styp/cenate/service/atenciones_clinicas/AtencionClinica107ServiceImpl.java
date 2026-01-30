package com.styp.cenate.service.atenciones_clinicas;

import com.styp.cenate.dto.AtencionClinica107DTO;
import com.styp.cenate.dto.AtencionClinica107FiltroDTO;
import com.styp.cenate.dto.EstadisticasAtencion107DTO;
import com.styp.cenate.model.AtencionClinica107;
import com.styp.cenate.repository.AtencionClinica107Repository;
import com.styp.cenate.service.specification.AtencionClinica107Specification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    /**
     * Listar atenciones con filtros complejos
     * Soporta los 9 filtros del módulo 107
     */
    @Override
    public Page<AtencionClinica107DTO> listarConFiltros(AtencionClinica107FiltroDTO filtro) {
        log.info("🔍 [MODULO 107] Listando atenciones clínicas con filtros");
        log.debug("Filtros recibidos: estadoGestionCitasId={}, estado={}, tipoDoc={}, documento={}, idIpress={}, derivacion={}, especialidad={}, tipoCita={}, search={}",
            filtro.getEstadoGestionCitasId(), filtro.getEstado(), filtro.getTipoDocumento(), filtro.getPacienteDni(), 
            filtro.getIdIpress(), filtro.getDerivacionInterna(), filtro.getEspecialidad(),
            filtro.getTipoCita(), filtro.getSearchTerm());
        
        // 🐛 DEBUG: Log específico para el filtro de estado
        if (filtro.getEstado() != null && !filtro.getEstado().isEmpty()) {
            log.info("🔍 [DEBUG] Filtro de estado aplicado: '{}'", filtro.getEstado());
        }

        // Parámetros de paginación (mover aquí para usarlo en el bloque de prueba)
        int page = filtro.getPageNumber() != null ? filtro.getPageNumber() : 0;
        int size = filtro.getPageSize() != null ? filtro.getPageSize() : 25;
        Pageable pageable = PageRequest.of(page, size);

        try {
            // 🐛 PRUEBA TEMPORAL: Si solo se está filtrando por estado, usar método directo
            if (filtro.getEstado() != null && !filtro.getEstado().isEmpty() && 
                !filtro.getEstado().equals("todos") &&
                (filtro.getTipoDocumento() == null || filtro.getTipoDocumento().equals("todos")) &&
                (filtro.getPacienteDni() == null || filtro.getPacienteDni().isEmpty()) &&
                (filtro.getSearchTerm() == null || filtro.getSearchTerm().isEmpty())) {
                
                log.info("🧪 [PRUEBA] Usando método directo para filtro de estado");
                Page<AtencionClinica107> resultado = repository.findByEstado(filtro.getEstado(), pageable);
                return resultado.map(this::toDTO);
            }

            // Si no es solo filtro de estado, usar especificaciones
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

            // Construir especificación con todos los filtros
            var spec = AtencionClinica107Specification.conFiltros(
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
                filtro.getSearchTerm()
            );

            // 🐛 DEBUG: Log para verificar la especificación
            log.info("🔍 [DEBUG] Especificación construida, ejecutando query...");

            // Ejecutar query
            long inicio = System.currentTimeMillis();
            Page<AtencionClinica107> resultado = repository.findAll(spec, pageable);
            long tiempo = System.currentTimeMillis() - inicio;

            log.info("✅ [MODULO 107] Se encontraron {} atenciones en {} ms", 
                resultado.getTotalElements(), tiempo);

            // Convertir a DTO
            return resultado.map(this::toDTO);

        } catch (IllegalArgumentException e) {
            log.error("❌ [MODULO 107] Error en formato de fechas: {}", e.getMessage());
            throw new RuntimeException("Formato de fecha inválido. Use YYYY-MM-DD: " + e.getMessage());
        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al listar atenciones: {}", e.getMessage(), e);
            throw new RuntimeException("Error al filtrar atenciones clínicas: " + e.getMessage());
        }
    }

    /**
     * Obtener estadísticas globales de atenciones
     */
    @Override
    public EstadisticasAtencion107DTO obtenerEstadisticas() {
        log.info("📊 [MODULO 107] Obteniendo estadísticas de atenciones");

        try {
            long inicio = System.currentTimeMillis();

            Long total = repository.contarTotal();

            long tiempo = System.currentTimeMillis() - inicio;

            EstadisticasAtencion107DTO stats = EstadisticasAtencion107DTO.builder()
                .total(total != null ? total : 0L)
                .pendientes(0L)  // Placeholder - depende del estado específico en BD
                .atendidos(0L)   // Placeholder - depende del estado específico en BD
                .build();

            log.info("✅ [MODULO 107] Estadísticas: Total={} ({}ms)", 
                total, tiempo);

            return stats;

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener estadísticas: {}", e.getMessage(), e);
            throw new RuntimeException("Error al obtener estadísticas: " + e.getMessage());
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
            .ipressNombre(atencion.getIpressNombre())
            .derivacionInterna(atencion.getDerivacionInterna())
//            .especialidad(atencion.getEspecialidad())
//            .tipoCita(atencion.getTipoCita())
//            .idServicio(atencion.getIdServicio())
            .estadoGestionCitasId(atencion.getEstadoGestionCitasId())
            .estado(atencion.getEstado())
            .estadoCodigo(atencion.getEstadoCodigo())
            .estadoDescripcion(atencion.getEstadoDescripcion())
            .fechaSolicitud(atencion.getFechaSolicitud())
            .fechaActualizacion(atencion.getFechaActualizacion())
            .responsableGestoraId(atencion.getResponsableGestoraId())
            .responsableNombre(atencion.getResponsableNombre())
            .fechaAsignacion(atencion.getFechaAsignacion())
            .build();
    }
}
