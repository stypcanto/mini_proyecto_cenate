package com.styp.cenate.service.estados_gestion_citas.impl;

import com.styp.cenate.dto.EstadoGestionCitaResponse;
import com.styp.cenate.model.EstadoGestionCita;
import com.styp.cenate.repository.EstadoGestionCitaRepository;
import com.styp.cenate.service.estados_gestion_citas.EstadoGestionCitaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 📋 Servicio de Estados de Gestión de Citas - Implementación
 * v1.33.0 - Lógica CRUD para gestión de estados de citas
 *
 * Operaciones:
 * - Crear, leer, actualizar, eliminar (CRUD)
 * - Búsqueda con filtros y paginación
 * - Validación de duplicados
 * - Cambio de estado (activo/inactivo)
 * - Estadísticas
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class EstadoGestionCitaServiceImpl implements EstadoGestionCitaService {

    private final EstadoGestionCitaRepository estadoRepository;

    /**
     * Obtiene todos los estados activos sin paginación
     */
    @Override
    public List<EstadoGestionCitaResponse> obtenerTodosEstadosActivos() {
        log.info("📋 Obteniendo todos los estados de gestión de citas activos");
        return estadoRepository.findByStatEstadoCitaOrderByDescEstadoCitaAsc("A")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Obtiene un estado por su identificador
     */
    @Override
    public EstadoGestionCitaResponse obtenerEstadoPorId(Long idEstadoCita) {
        log.info("🔍 Obteniendo estado de cita ID: {}", idEstadoCita);
        EstadoGestionCita estado = estadoRepository.findById(idEstadoCita)
                .orElseThrow(() -> new RuntimeException("Estado de cita no encontrado con ID: " + idEstadoCita));
        return mapToResponse(estado);
    }

    /**
     * Obtiene un estado por su código
     */
    @Override
    public EstadoGestionCitaResponse obtenerEstadoPorCodigo(String codigo) {
        log.info("🔍 Obteniendo estado de cita: {}", codigo);
        EstadoGestionCita estado = estadoRepository.findByCodEstadoCita(codigo)
                .orElseThrow(() -> new RuntimeException("Estado de cita no encontrado: " + codigo));
        return mapToResponse(estado);
    }

    /**
     * Búsqueda paginada con filtros
     */
    @Override
    public Page<EstadoGestionCitaResponse> buscarEstados(String busqueda, String estado, Pageable pageable) {
        log.info("🔎 Buscando estados de citas: busqueda={}, estado={}", busqueda, estado);
        return estadoRepository.buscarEstadosGestionCitas(busqueda, estado, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Crea un nuevo estado
     */
    @Override
    @Transactional
    public EstadoGestionCitaResponse crearEstado(EstadoGestionCitaRequest request) {
        log.info("✏️ Creando nuevo estado de cita: {}", request.codEstadoCita());

        // Validación: verificar si ya existe
        if (estadoRepository.findByCodEstadoCitaIgnoreCase(request.codEstadoCita()).isPresent()) {
            log.warn("❌ Ya existe un estado de cita con el código: {}", request.codEstadoCita());
            throw new RuntimeException("Ya existe un estado de cita con el código: " + request.codEstadoCita());
        }

        // Construir entidad
        EstadoGestionCita estado = EstadoGestionCita.builder()
                .codEstadoCita(request.codEstadoCita())
                .descEstadoCita(request.descEstadoCita())
                .statEstadoCita("A")
                .build();

        // Guardar
        EstadoGestionCita estadoGuardado = estadoRepository.save(estado);
        log.info("✅ Estado de cita creado con ID: {}", estadoGuardado.getIdEstadoCita());

        return mapToResponse(estadoGuardado);
    }

    /**
     * Actualiza un estado existente
     */
    @Override
    @Transactional
    public EstadoGestionCitaResponse actualizarEstado(Long idEstadoCita, EstadoGestionCitaRequest request) {
        log.info("✏️ Actualizando estado de cita ID: {}", idEstadoCita);

        EstadoGestionCita estado = estadoRepository.findById(idEstadoCita)
                .orElseThrow(() -> new RuntimeException("Estado de cita no encontrado con ID: " + idEstadoCita));

        // Actualizar campos
        estado.setDescEstadoCita(request.descEstadoCita());

        // Guardar
        EstadoGestionCita estadoActualizado = estadoRepository.save(estado);
        log.info("✅ Estado de cita ID {} actualizado", idEstadoCita);

        return mapToResponse(estadoActualizado);
    }

    /**
     * Cambia el estado (A ↔ I) de un registro
     */
    @Override
    @Transactional
    public EstadoGestionCitaResponse cambiarEstado(Long idEstadoCita, String nuevoEstado) {
        log.info("🔄 Cambiando estado de cita ID: {} a {}", idEstadoCita, nuevoEstado);

        EstadoGestionCita estado = estadoRepository.findById(idEstadoCita)
                .orElseThrow(() -> new RuntimeException("Estado de cita no encontrado con ID: " + idEstadoCita));

        // Validar que sea un estado válido
        if (!nuevoEstado.matches("A|I")) {
            log.warn("❌ Estado inválido: {}", nuevoEstado);
            throw new RuntimeException("Estado inválido: " + nuevoEstado);
        }

        // Cambiar estado
        estado.setStatEstadoCita(nuevoEstado);

        // Guardar
        EstadoGestionCita estadoActualizado = estadoRepository.save(estado);
        log.info("✅ Estado de cita ID {} cambiado a {}", idEstadoCita, nuevoEstado);

        return mapToResponse(estadoActualizado);
    }

    /**
     * Elimina (inactiva) un estado
     */
    @Override
    @Transactional
    public void eliminarEstado(Long idEstadoCita) {
        log.warn("🗑️ Eliminando estado de cita ID: {}", idEstadoCita);

        EstadoGestionCita estado = estadoRepository.findById(idEstadoCita)
                .orElseThrow(() -> new RuntimeException("Estado de cita no encontrado con ID: " + idEstadoCita));

        // Eliminación lógica: cambiar a inactivo
        estado.setStatEstadoCita("I");
        estadoRepository.save(estado);
        log.info("✅ Estado de cita ID {} inactivado", idEstadoCita);
    }

    /**
     * Obtiene estadísticas del módulo
     */
    @Override
    public EstadisticasEstadosDTO obtenerEstadisticas() {
        log.info("📊 Calculando estadísticas de estados de citas");

        Long totalEstados = estadoRepository.count();
        Long estadosActivos = estadoRepository.countByStatEstadoCita("A");
        Long estadosInactivos = estadoRepository.countByStatEstadoCita("I");

        log.info("📊 Estadísticas: Total={}, Activos={}, Inactivos={}", totalEstados, estadosActivos, estadosInactivos);

        return new EstadisticasEstadosDTO(totalEstados, estadosActivos, estadosInactivos);
    }

    /**
     * Mapea entidad EstadoGestionCita a DTO Response
     *
     * @param estado entidad de BD
     * @return DTO para API
     */
    private EstadoGestionCitaResponse mapToResponse(EstadoGestionCita estado) {
        return EstadoGestionCitaResponse.builder()
                .idEstadoCita(estado.getIdEstadoCita())
                .codEstadoCita(estado.getCodEstadoCita())
                .descEstadoCita(estado.getDescEstadoCita())
                .statEstadoCita(estado.getStatEstadoCita())
                .createdAt(estado.getCreatedAt())
                .updatedAt(estado.getUpdatedAt())
                .build();
    }
}
