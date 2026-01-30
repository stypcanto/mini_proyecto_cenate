package com.styp.cenate.service.form107;

import com.styp.cenate.dto.form107.Modulo107PacienteDTO;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 📋 Modulo107ServiceImpl - Implementación de la lógica de negocio
 *
 * Encargado de:
 * - Coordinar acceso a repositorio
 * - Aplicar reglas de negocio
 * - Registrar logging de operaciones críticas
 * - Calcular métricas y estadísticas
 * - Transformar entidades a DTOs
 *
 * @since v3.0.0 (2026-01-29)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class Modulo107ServiceImpl implements Modulo107Service {

    private final SolicitudBolsaRepository solicitudBolsaRepository;

    @Override
    public Page<Modulo107PacienteDTO> listarPacientes(Pageable pageable) {
        log.info("📋 [Modulo107Service] Listando pacientes - page={}, size={}",
                 pageable.getPageNumber(), pageable.getPageSize());

        try {
            Page<SolicitudBolsa> pacientes = solicitudBolsaRepository.findAllModulo107Casos(pageable);

            log.info("✅ Se recuperaron {} pacientes (página {}/{})",
                     pacientes.getNumberOfElements(),
                     pacientes.getNumber(),
                     pacientes.getTotalPages());

            // Transformar entidades a DTOs
            return pacientes.map(Modulo107PacienteDTO::fromEntity);

        } catch (Exception e) {
            log.error("❌ Error al listar pacientes del Módulo 107", e);
            throw new RuntimeException("Error al obtener lista de pacientes: " + e.getMessage(), e);
        }
    }

    @Override
    public Page<Modulo107PacienteDTO> buscarPacientes(
            String dni,
            String nombre,
            String codigoIpress,
            Long estadoId,
            OffsetDateTime fechaDesde,
            OffsetDateTime fechaHasta,
            Pageable pageable) {

        log.info("🔍 [Modulo107Service] Buscando pacientes - dni={}, nombre={}, ipress={}, estado={}",
                 dni, nombre, codigoIpress, estadoId);

        try {
            // Registrar búsqueda crítica en auditoría
            if (dni != null && !dni.isEmpty()) {
                registrarAuditoriaBusqueda("DNI", dni);
            }
            if (nombre != null && !nombre.isEmpty()) {
                registrarAuditoriaBusqueda("NOMBRE", nombre);
            }

            // Ejecutar búsqueda
            Page<SolicitudBolsa> resultados = solicitudBolsaRepository.buscarModulo107Casos(
                    dni, nombre, codigoIpress, estadoId, fechaDesde, fechaHasta, pageable
            );

            log.info("✅ Búsqueda completada: {} resultados encontrados",
                     resultados.getTotalElements());

            // Transformar entidades a DTOs
            return resultados.map(Modulo107PacienteDTO::fromEntity);

        } catch (Exception e) {
            log.error("❌ Error al buscar pacientes del Módulo 107", e);
            throw new RuntimeException("Error en la búsqueda: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> obtenerEstadisticas() {
        log.info("📊 [Modulo107Service] Obteniendo estadísticas del Módulo 107");

        try {
            Map<String, Object> estadisticas = new HashMap<>();

            // 1. KPIs Generales
            Map<String, Object> kpis = solicitudBolsaRepository.kpisModulo107();
            estadisticas.put("kpis", kpis);
            log.debug("✅ KPIs obtenidos: {}", kpis);

            // 2. Estadísticas por Estado
            List<Map<String, Object>> porEstado = solicitudBolsaRepository.estadisticasModulo107PorEstado();
            estadisticas.put("distribucion_estado", porEstado);
            log.debug("✅ Distribución por estado: {} estados encontrados", porEstado.size());

            // 3. Estadísticas por Especialidad
            List<Map<String, Object>> porEspecialidad = solicitudBolsaRepository.estadisticasModulo107PorEspecialidad();
            estadisticas.put("distribucion_especialidad", porEspecialidad);
            log.debug("✅ Distribución por especialidad: {} especialidades encontradas", porEspecialidad.size());

            // 4. Top 10 IPRESS
            List<Map<String, Object>> porIpress = solicitudBolsaRepository.estadisticasModulo107PorIpress();
            estadisticas.put("top_10_ipress", porIpress);
            log.debug("✅ Top 10 IPRESS: {} IPRESS encontradas", porIpress.size());

            // 5. Evolución Temporal (últimos 30 días)
            List<Map<String, Object>> evolucion = solicitudBolsaRepository.evolucionTemporalModulo107();
            estadisticas.put("evolucion_temporal", evolucion);
            log.debug("✅ Evolución temporal: {} días de datos", evolucion.size());

            log.info("✅ Estadísticas obtenidas exitosamente");
            return estadisticas;

        } catch (Exception e) {
            log.error("❌ Error al calcular estadísticas del Módulo 107", e);
            throw new RuntimeException("Error al calcular estadísticas: " + e.getMessage(), e);
        }
    }

    /**
     * Registrar en auditoría una búsqueda crítica
     *
     * NOTA: La auditoría completa se implementará en v3.1 usando AOP
     * Por ahora solo registramos en logs
     */
    private void registrarAuditoriaBusqueda(String tipoBusqueda, String valor) {
        try {
            String usuario = obtenerUsernameActual();
            log.info("🔍 [AUDITORIA] Búsqueda crítica - Usuario: {}, Tipo: {}, Valor: {}",
                     usuario, tipoBusqueda, valor);
        } catch (Exception e) {
            log.warn("⚠️ No se pudo registrar auditoría de búsqueda", e);
        }
    }

    /**
     * Obtener username del usuario actual desde el contexto de seguridad
     */
    private String obtenerUsernameActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            Object principal = auth.getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.User) {
                return ((org.springframework.security.core.userdetails.User) principal).getUsername();
            }
            return auth.getName();
        }
        return "ANONIMO";
    }
}
