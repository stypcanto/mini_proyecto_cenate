package com.styp.cenate.service.disponibilidad;

import com.styp.cenate.dto.disponibilidad.PeriodoMedicoDisponibilidadRequest;
import com.styp.cenate.dto.disponibilidad.PeriodoMedicoDisponibilidadResponse;
import com.styp.cenate.exception.BusinessException;
import com.styp.cenate.mapper.disponibilidad.PeriodoMedicoDisponibilidadMapper;
import com.styp.cenate.model.PeriodoMedicoDisponibilidad;
import com.styp.cenate.repository.disponibilidad.PeriodoMedicoDisponibilidadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para gestionar periodos globales
 * de disponibilidad médica.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PeriodoMedicoDisponibilidadServiceImpl implements PeriodoMedicoDisponibilidadService {

    private static final List<String> ESTADOS_VALIDOS =
            List.of("BORRADOR", "ACTIVO", "CERRADO", "ANULADO");

    private final PeriodoMedicoDisponibilidadRepository repository;

    @Override
    public List<PeriodoMedicoDisponibilidadResponse> listarTodos() {
        log.info("Listando todos los periodos médicos de disponibilidad");
        return repository.findAllByOrderByFechaInicioDesc()
                .stream()
                .map(PeriodoMedicoDisponibilidadMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PeriodoMedicoDisponibilidadResponse> listarActivos() {
        log.info("Listando periodos médicos de disponibilidad ACTIVO");
        return repository.findByEstadoOrderByFechaInicioDesc("ACTIVO")
                .stream()
                .map(PeriodoMedicoDisponibilidadMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PeriodoMedicoDisponibilidadResponse> listarVigentes() {
        log.info("Listando periodos médicos de disponibilidad vigentes");
        return repository.findVigentes()
                .stream()
                .map(PeriodoMedicoDisponibilidadMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PeriodoMedicoDisponibilidadResponse obtenerPorId(Long id) {
        log.info("Obteniendo periodo médico de disponibilidad con ID: {}", id);
        PeriodoMedicoDisponibilidad entity = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Periodo médico de disponibilidad no encontrado con ID: " + id));
        return PeriodoMedicoDisponibilidadMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public PeriodoMedicoDisponibilidadResponse crear(PeriodoMedicoDisponibilidadRequest request, String createdBy) {
        log.info("Creando nuevo periodo médico de disponibilidad: {}-{}", request.getAnio(), request.getPeriodo());

        validarFechas(request);
        validarAnio(request.getAnio());

        if (repository.existsByAnioAndPeriodo(request.getAnio(), request.getPeriodo())) {
            throw new BusinessException("Ya existe un periodo médico para el año "
                    + request.getAnio() + " y periodo " + request.getPeriodo());
        }

        PeriodoMedicoDisponibilidad entity = PeriodoMedicoDisponibilidadMapper.toEntity(request, createdBy);
        entity = repository.save(entity);

        log.info("Periodo médico de disponibilidad creado con ID: {}", entity.getIdPeriodoRegDisp());
        return PeriodoMedicoDisponibilidadMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public PeriodoMedicoDisponibilidadResponse actualizar(
            Long id,
            PeriodoMedicoDisponibilidadRequest request,
            String updatedBy
    ) {
        log.info("Actualizando periodo médico de disponibilidad con ID: {}", id);

        validarFechas(request);
        validarAnio(request.getAnio());

        PeriodoMedicoDisponibilidad entity = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Periodo médico de disponibilidad no encontrado con ID: " + id));

        // Permitir actualizar solo si está en BORRADOR o ACTIVO
        if (!entity.isBorrador() && !entity.isActivo()) {
            throw new BusinessException("Solo se pueden actualizar periodos en estado BORRADOR o ACTIVO");
        }

        // Validar duplicados para otro registro
        if (!entity.getAnio().equals(request.getAnio())
                || !entity.getPeriodo().equals(request.getPeriodo())) {
            if (repository.existsByAnioAndPeriodo(request.getAnio(), request.getPeriodo())) {
                throw new BusinessException("Ya existe un periodo médico para el año "
                        + request.getAnio() + " y periodo " + request.getPeriodo());
            }
        }

        PeriodoMedicoDisponibilidadMapper.updateEntity(entity, request, updatedBy);
        entity = repository.save(entity);

        log.info("Periodo médico de disponibilidad actualizado correctamente");
        return PeriodoMedicoDisponibilidadMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public PeriodoMedicoDisponibilidadResponse cambiarEstado(Long id, String nuevoEstado, String updatedBy) {
        log.info("Cambiando estado del periodo médico de disponibilidad {} a {}", id, nuevoEstado);

        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            throw new BusinessException("El nuevo estado es obligatorio");
        }

        String estadoNorm = nuevoEstado.trim().toUpperCase(Locale.ROOT);
        if (!ESTADOS_VALIDOS.contains(estadoNorm)) {
            throw new BusinessException("Estado inválido. Valores permitidos: " + ESTADOS_VALIDOS);
        }

        PeriodoMedicoDisponibilidad entity = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Periodo médico de disponibilidad no encontrado con ID: " + id));

        String estadoAnterior = entity.getEstado();
        entity.setEstado(estadoNorm);
        entity.setUpdatedBy(updatedBy);

        entity = repository.save(entity);

        log.info("Estado cambiado de {} a {} para el periodo ID {}", estadoAnterior, estadoNorm, id);
        return PeriodoMedicoDisponibilidadMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        log.info("Eliminando periodo médico de disponibilidad con ID: {}", id);

        PeriodoMedicoDisponibilidad entity = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Periodo médico de disponibilidad no encontrado con ID: " + id));

        if (!entity.isBorrador()) {
            throw new BusinessException("Solo se pueden eliminar periodos en estado BORRADOR");
        }

        repository.delete(entity);
        log.info("Periodo médico de disponibilidad eliminado correctamente");
    }

    @Override
    public List<Integer> listarAnios() {
        log.info("Listando años disponibles de periodos médicos de disponibilidad");
        return repository.listarAniosDisponibles();
    }

    // ==========================================================
    // Métodos privados de validación
    // ==========================================================

    private void validarFechas(PeriodoMedicoDisponibilidadRequest request) {
        if (request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new BusinessException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }
    }

    private void validarAnio(Integer anio) {
        if (anio == null || anio < 2020 || anio > 2100) {
            throw new BusinessException("El año debe estar entre 2020 y 2100");
        }
    }
}

