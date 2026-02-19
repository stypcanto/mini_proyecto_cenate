package com.styp.cenate.service.disponibilidad;

import com.styp.cenate.dto.disponibilidad.CtrPeriodoRequest;
import com.styp.cenate.dto.disponibilidad.CtrPeriodoResponse;
import com.styp.cenate.exception.BusinessException;
import com.styp.cenate.mapper.disponibilidad.CtrPeriodoMapper;
import com.styp.cenate.model.Area;
import com.styp.cenate.model.CtrPeriodo;
import com.styp.cenate.model.CtrPeriodoId;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.disponibilidad.CtrPeriodoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para gestión de periodos de control por área.
 * Tabla: ctr_periodo
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CtrPeriodoServiceImpl implements CtrPeriodoService {

    private static final List<String> ESTADOS_VALIDOS =
            List.of("ABIERTO", "EN_VALIDACION", "CERRADO", "REABIERTO");

    private final CtrPeriodoRepository repository;
    private final PersonalCntRepository personalCntRepository;

    /**
     * Obtiene los datos del personal del usuario autenticado desde dim_personal_cnt.
     * Método interno usado para obtener id_area al crear periodos.
     */
    private PersonalCnt obtenerPersonalDelUsuario(Long idUsuario) {
        log.info("Obteniendo datos de personal para usuario ID: {}", idUsuario);
        
        return personalCntRepository.findByUsuario_IdUser(idUsuario)
                .orElseThrow(() -> new BusinessException(
                        "No se encontró registro en dim_personal_cnt para el usuario ID: " + idUsuario));
    }

    @Override
    public List<CtrPeriodoResponse> listarTodos() {
        log.info("Listando todos los periodos de control");
        return repository.findAllWithRelations()
                .stream()
                .map(CtrPeriodoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CtrPeriodoResponse> listarAbiertos() {
        log.info("Listando periodos de control abiertos");
        return repository.findAbiertos()
                .stream()
                .map(CtrPeriodoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CtrPeriodoResponse> listarVigentes() {
        log.info("Listando periodos de control vigentes");
        return repository.findVigentes()
                .stream()
                .map(CtrPeriodoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CtrPeriodoResponse> listarPorArea(Long idArea) {
        log.info("Listando periodos de control para área: {}", idArea);
        return repository.findByAreaOrderByPeriodoDesc(idArea)
                .stream()
                .map(CtrPeriodoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CtrPeriodoResponse> listarPorAreaYEstado(Long idArea, String estado) {
        log.info("Listando periodos de control para área: {} y estado: {}", idArea, estado);
        return repository.findByAreaAndEstado(idArea, estado)
                .stream()
                .map(CtrPeriodoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Integer> listarAnios() {
        log.info("Listando años disponibles de periodos");
        return repository.listarAniosDisponibles();
    }

    @Override
    public List<Integer> listarAniosPorArea(Long idArea) {
        log.info("Listando años para área: {}", idArea);
        return repository.listarAniosPorArea(idArea);
    }

    @Override
    public CtrPeriodoResponse obtenerPorId(String periodo, Long idArea) {
        log.info("Obteniendo periodo: {} para área: {}", periodo, idArea);
        CtrPeriodoId id = new CtrPeriodoId(periodo, idArea);
        CtrPeriodo entity = repository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        String.format("Periodo %s no encontrado para área %d", periodo, idArea)));
        return CtrPeriodoMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public CtrPeriodoResponse crear(CtrPeriodoRequest request, Long coordinadorId) {
        log.info("Creando nuevo periodo: {} con usuario autenticado ID: {}", request.getPeriodo(), coordinadorId);

        // Obtener id_area desde dim_personal_cnt usando el id_usuario autenticado
        PersonalCnt personal = obtenerPersonalDelUsuario(coordinadorId);

        Long idAreaDelPersonal = personal.getArea() != null ? personal.getArea().getIdArea() : null;
        if (idAreaDelPersonal == null) {
            throw new BusinessException("El usuario autenticado no tiene un área asignada en dim_personal_cnt");
        }

        log.info("Usuario ID: {} tiene área ID: {} (desde dim_personal_cnt)", coordinadorId, idAreaDelPersonal);

        validarFechas(request);

        if (repository.existsByPeriodoAndArea(request.getPeriodo(), idAreaDelPersonal)) {
            throw new BusinessException(String.format(
                    "Ya existe un periodo %s para el área %d", request.getPeriodo(), idAreaDelPersonal));
        }

        Area area = personal.getArea(); // Ya tenemos el área desde el personal

        // Crear entity directamente con el idArea obtenido del personal
        CtrPeriodo entity = CtrPeriodoMapper.toEntity(request, area, idAreaDelPersonal, coordinadorId);
        entity = repository.save(entity);

        log.info("Periodo creado: {} para área: {} por usuario ID: {}", 
                entity.getPeriodo(), entity.getIdArea(), coordinadorId);
        return CtrPeriodoMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public CtrPeriodoResponse actualizar(String periodo, Long idArea, CtrPeriodoRequest request, Long usuarioId) {
        log.info("Actualizando periodo: {} para área: {}", periodo, idArea);

        validarFechas(request);

        CtrPeriodoId id = new CtrPeriodoId(periodo, idArea);
        CtrPeriodo entity = repository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        String.format("Periodo %s no encontrado para área %d", periodo, idArea)));

        // Solo se puede actualizar si está abierto
        if (!entity.isAbierto()) {
            throw new BusinessException("Solo se pueden actualizar periodos en estado ABIERTO o REABIERTO");
        }

        CtrPeriodoMapper.updateEntity(entity, request, usuarioId);
        entity = repository.save(entity);

        log.info("Periodo actualizado correctamente");
        return CtrPeriodoMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public CtrPeriodoResponse cambiarEstado(String periodo, Long idArea, String nuevoEstado, Long usuarioId) {
        log.info("Cambiando estado del periodo {} área {} a {}", periodo, idArea, nuevoEstado);

        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            throw new BusinessException("El nuevo estado es obligatorio");
        }

        String estadoNorm = nuevoEstado.trim().toUpperCase(Locale.ROOT);
        if (!ESTADOS_VALIDOS.contains(estadoNorm)) {
            throw new BusinessException("Estado inválido. Valores permitidos: " + ESTADOS_VALIDOS);
        }

        CtrPeriodoId id = new CtrPeriodoId(periodo, idArea);
        CtrPeriodo entity = repository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        String.format("Periodo %s no encontrado para área %d", periodo, idArea)));

        String estadoAnterior = entity.getEstado();
        entity.setEstado(estadoNorm);
        entity.setIdUsuarioUltimaAccion(usuarioId);

        // Actualizar fechas según el estado
        if ("CERRADO".equals(estadoNorm) && entity.getFechaCierre() == null) {
            entity.setFechaCierre(OffsetDateTime.now());
        } else if ("ABIERTO".equals(estadoNorm) || "REABIERTO".equals(estadoNorm)) {
            if (entity.getFechaApertura() == null) {
                entity.setFechaApertura(OffsetDateTime.now());
            }
        }

        entity = repository.save(entity);

        log.info("Estado cambiado de {} a {} para periodo {} área {}", estadoAnterior, estadoNorm, periodo, idArea);
        return CtrPeriodoMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public void eliminar(String periodo, Long idArea) {
        log.info("Eliminando periodo: {} para área: {}", periodo, idArea);

        CtrPeriodoId id = new CtrPeriodoId(periodo, idArea);
        CtrPeriodo entity = repository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        String.format("Periodo %s no encontrado para área %d", periodo, idArea)));

        // Solo se puede eliminar si está abierto o en borrador
        if (!entity.isAbierto()) {
            throw new BusinessException("Solo se pueden eliminar periodos en estado ABIERTO o REABIERTO");
        }

        repository.delete(entity);
        log.info("Periodo eliminado correctamente");
    }

    /**
     * Valida que las fechas del request sean correctas.
     */
    private void validarFechas(CtrPeriodoRequest request) {
        if (request.getFechaInicio() == null || request.getFechaFin() == null) {
            throw new BusinessException("Las fechas de inicio y fin son obligatorias");
        }

        if (request.getFechaInicio().isAfter(request.getFechaFin())) {
            throw new BusinessException("La fecha de inicio debe ser anterior o igual a la fecha de fin");
        }
    }
}
